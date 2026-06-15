const express        = require("express");
const router         = express.Router();
const mongoose       = require("mongoose");
const Appointment    = require("../models/Appointment");
const Queue          = require("../models/Queue");
const Receptionist   = require("../models/Receptionist");
const authMiddleware = require("../middleware/authMiddleware");

/* ─────────────────────────────────────────────────
   Helper: resolve clinicId as mongoose ObjectId
───────────────────────────────────────────────── */
async function getClinicId(user) {
  try {
    if (user.role === "doctor") {
      const raw = user.userId || user.id || user._id;
      if (!raw) return null;
      return mongoose.Types.ObjectId.isValid(raw)
        ? new mongoose.Types.ObjectId(raw)
        : null;
    }
    if (user.role === "sub_doctor") {
      return user.clinicId && mongoose.Types.ObjectId.isValid(user.clinicId)
        ? new mongoose.Types.ObjectId(user.clinicId) : null;
    }
    if (user.role === "receptionist") {
      if (user.clinicId && mongoose.Types.ObjectId.isValid(user.clinicId)) {
        return new mongoose.Types.ObjectId(user.clinicId);
      }
      const r = await Receptionist.findById(user.receptionistId).lean();
      return r?.clinic ? new mongoose.Types.ObjectId(r.clinic) : null;
    }
  } catch { return null; }
  return null;
}

function todayWindow() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

/* ═══════════════════════════════════════════
   POST /api/appointments/book
═══════════════════════════════════════════ */
router.post("/book", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    if (!clinicId)
      return res.status(403).json({ message: "Not authorized ❌" });

    const { name, mobile, gender, age, date, time, doctor, reason } = req.body;
    if (!name?.trim() || !date || !time)
      return res.status(400).json({ message: "Name, date and time are required ❌" });

    /* duplicate slot check */
    const conflict = await Appointment.findOne({
      clinic: clinicId, date, time,
      status: { $nin: ["cancelled"] },
    });
    if (conflict)
      return res.status(409).json({
        message: `Slot at ${time} is already booked ❌`,
        alreadyBooked: true,
      });

    const appt = new Appointment({
      clinic: clinicId,
      name:   name.trim(),
      mobile: mobile?.trim() || "",
      gender: gender || "Male",
      age:    age || null,
      date, time,
      doctor: doctor || "",
      reason: reason || "",
      createdBy: req.user.userId || req.user.receptionistId || null,
    });
    await appt.save();

    return res.status(201).json({ message: "Appointment booked ✅", appointment: appt });
  } catch (err) {
    console.error("BOOK APPOINTMENT ERROR:", err);
    return res.status(500).json({ message: "Server error ❌", detail: err.message });
  }
});

/* ═══════════════════════════════════════════
   GET /api/appointments/today
═══════════════════════════════════════════ */
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    if (!clinicId)
      return res.status(403).json({ message: "Not authorized ❌" });

    const today = new Date().toISOString().split("T")[0];
    const appts = await Appointment.find({ clinic: clinicId, date: today }).sort({ time: 1 });
    return res.json(appts);
  } catch (err) {
    console.error("TODAY APPTS ERROR:", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   GET /api/appointments/by-date?date=YYYY-MM-DD
═══════════════════════════════════════════ */
router.get("/by-date", authMiddleware, async (req, res) => {
  try {
    const clinicId  = await getClinicId(req.user);
    if (!clinicId)
      return res.status(403).json({ message: "Not authorized ❌" });

    const targetDate = req.query.date || new Date().toISOString().split("T")[0];
    const appts = await Appointment.find({ clinic: clinicId, date: targetDate }).sort({ time: 1 });
    return res.json(appts);
  } catch (err) {
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   PATCH /api/appointments/arrived/:id
   • Adds patient to live queue automatically
   • Prevents double-adding
   • Allows override (no strict time window — doctor's discretion)
═══════════════════════════════════════════ */
router.patch("/arrived/:id", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    if (!clinicId)
      return res.status(403).json({ message: "Not authorized ❌" });

    const appt = await Appointment.findOne({ _id: req.params.id, clinic: clinicId });
    if (!appt)
      return res.status(404).json({ message: "Appointment not found ❌" });

    /* must be today */
    const today = new Date().toISOString().split("T")[0];
    if (appt.date !== today)
      return res.status(400).json({ message: "This appointment is not for today ❌" });

    /* prevent double-add */
    if (appt.queueId) {
      const existing = await Queue.findById(appt.queueId);
      if (existing && existing.status !== "cancelled") {
        return res.status(409).json({ message: "Patient is already in the queue ❌" });
      }
    }

    /* token number (resets daily) */
    const { start: todayStart } = todayWindow();
    const lastToday = await Queue.findOne({
      clinic: clinicId, createdAt: { $gte: todayStart },
    }).sort({ tokenNumber: -1 });
    const nextToken = lastToday ? lastToday.tokenNumber + 1 : 1;

    /* returning patient? */
    let isReturning = false;
    if (appt.mobile?.trim()) {
      const prev = await Queue.findOne({ clinic: clinicId, mobile: appt.mobile.trim(), status: "done" });
      if (prev) isReturning = true;
    }

    /* first in queue → start timer now */
    const waitingNow = await Queue.countDocuments({
      clinic: clinicId, createdAt: { $gte: todayStart }, status: "waiting",
    });

    const qEntry = new Queue({
      clinic:        clinicId,
      patientName:   appt.name,
      mobile:        appt.mobile?.trim() || "",
      gender:        appt.gender || "Male",
      age:           appt.age   || null,
      tokenNumber:   nextToken,
      source:        "appointment",
      appointmentId: appt._id,
      isReturning,
      consultStart:  waitingNow === 0 ? new Date() : null,
      createdBy:     req.user.receptionistId || null,
    });
    await qEntry.save();

    appt.status  = "arrived";
    appt.queueId = qEntry._id;
    await appt.save();

    return res.json({
      message:     "Patient added to queue ✅",
      tokenNumber: nextToken,
      queueEntry:  qEntry,
    });
  } catch (err) {
    console.error("ARRIVED ERROR:", err);
    return res.status(500).json({ message: "Server error ❌", detail: err.message });
  }
});

/* ═══════════════════════════════════════════
   PATCH /api/appointments/status/:id
═══════════════════════════════════════════ */
router.patch("/status/:id", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    const { status } = req.body;

    const validStatuses = ["scheduled","arrived","completed","cancelled","delayed","no_show"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status ❌" });

    const appt = await Appointment.findOne({ _id: req.params.id, clinic: clinicId });
    if (!appt)
      return res.status(404).json({ message: "Appointment not found ❌" });

    appt.status = status;
    await appt.save();

    /* if completed → also mark linked queue entry done */
    if (status === "completed" && appt.queueId) {
      const qEntry = await Queue.findById(appt.queueId);
      if (qEntry && qEntry.status !== "done") {
        const consultEnd   = new Date();
        const consultStart = qEntry.consultStart || qEntry.createdAt;
        const duration     = Math.max(1, Math.round((consultEnd - consultStart) / 60000));

        await Queue.findByIdAndUpdate(appt.queueId, {
          status: "done", consultEnd, consultDuration: duration,
        });

        /* start next patient's timer */
        const { start: todayStart } = todayWindow();
        const nextWaiting = await Queue.findOne({
          clinic:       clinicId,
          createdAt:    { $gte: todayStart },
          status:       "waiting",
          consultStart: null,
        }).sort({ tokenNumber: 1 });
        if (nextWaiting) {
          await Queue.findByIdAndUpdate(nextWaiting._id, { consultStart: new Date() });
        }
      }
    }

    return res.json({ message: "Status updated ✅", appointment: appt });
  } catch (err) {
    console.error("UPDATE APPT STATUS ERROR:", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   PATCH /api/appointments/cancel/:id
═══════════════════════════════════════════ */
router.patch("/cancel/:id", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, clinic: clinicId },
      { status: "cancelled" },
      { new: true }
    );
    if (!appt)
      return res.status(404).json({ message: "Appointment not found ❌" });
    return res.json({ message: "Appointment cancelled ✅" });
  } catch (err) {
    return res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;