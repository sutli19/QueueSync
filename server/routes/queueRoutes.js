const express       = require("express");
const router        = express.Router();
const mongoose      = require("mongoose");
const Queue         = require("../models/Queue");
const Receptionist  = require("../models/Receptionist");
const SubDoctor     = require("../models/SubDoctor");
const authMiddleware = require("../middleware/authMiddleware");

async function getClinicId(user) {
  try {
    if (user.role === "doctor") {
      const raw = user.userId || user.id || user._id;
      return raw && mongoose.Types.ObjectId.isValid(raw)
        ? new mongoose.Types.ObjectId(raw) : null;
    }
    if (user.role === "sub_doctor") {
      return user.clinicId && mongoose.Types.ObjectId.isValid(user.clinicId)
        ? new mongoose.Types.ObjectId(user.clinicId) : null;
    }
    if (user.role === "receptionist") {
      if (user.clinicId && mongoose.Types.ObjectId.isValid(user.clinicId))
        return new mongoose.Types.ObjectId(user.clinicId);
      const r = await Receptionist.findById(user.receptionistId).lean();
      return r?.clinic ? new mongoose.Types.ObjectId(r.clinic) : null;
    }
  } catch { return null; }
  return null;
}

function buildDoctorFilter(user, queryDoctorId) {
  if (user.role === "sub_doctor") {
    return { doctorId: new mongoose.Types.ObjectId(user.subDoctorId) };
  }
  if (user.role === "doctor" && queryDoctorId && mongoose.Types.ObjectId.isValid(queryDoctorId)) {
    const qId = new mongoose.Types.ObjectId(queryDoctorId);
    const clinicObjId = user.userId && mongoose.Types.ObjectId.isValid(user.userId)
      ? new mongoose.Types.ObjectId(user.userId) : null;
    const isAdminOwnFilter = clinicObjId && qId.equals(clinicObjId);
    if (isAdminOwnFilter) {
      return { $or: [{ doctorId: qId }, { doctorId: null }, { doctorId: { $exists: false } }] };
    }
    return { doctorId: qId };
  }
  return {};
}

function todayWindow() {
  const start = new Date(); start.setHours(0,0,0,0);
  const end   = new Date(start); end.setDate(end.getDate()+1);
  return { start, end };
}

/* POST /api/queue/add */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    if (!clinicId) return res.status(403).json({ message: "Not authorized ❌" });

    const { patientName, mobile, gender, age, source, appointmentId, assignedDoctorId, assignedDoctorType } = req.body;
    if (!patientName?.trim())
      return res.status(400).json({ message: "Patient name is required ❌" });

    let doctorId = null, doctorType = "admin";
    if (req.user.role === "sub_doctor") {
      doctorId = new mongoose.Types.ObjectId(req.user.subDoctorId);
      doctorType = "sub_doctor";
    } else if (req.user.role === "doctor") {
      if (assignedDoctorId && mongoose.Types.ObjectId.isValid(assignedDoctorId)) {
        doctorId = new mongoose.Types.ObjectId(assignedDoctorId);
        doctorType = assignedDoctorType || "admin";
      } else {
        doctorId = clinicId;
        doctorType = "admin";
      }
    } else if (req.user.role === "receptionist") {
      if (assignedDoctorId && mongoose.Types.ObjectId.isValid(assignedDoctorId)) {
        doctorId = new mongoose.Types.ObjectId(assignedDoctorId);
        doctorType = assignedDoctorType || "admin";
      }
    }

    let isReturning = false;
    if (mobile?.trim()) {
      const prev = await Queue.findOne({ clinic: clinicId, mobile: mobile.trim(), status: "done" });
      if (prev) isReturning = true;
    }

    const { start: todayStart } = todayWindow();
    const lastToday = await Queue.findOne({ clinic: clinicId, createdAt: { $gte: todayStart } }).sort({ tokenNumber: -1 });
    const nextToken = lastToday ? lastToday.tokenNumber + 1 : 1;

    const doctorFilter = doctorId ? { doctorId } : {};
    const activeNow = await Queue.countDocuments({
      clinic: clinicId, ...doctorFilter,
      createdAt: { $gte: todayStart },
      status: { $in: ["waiting", "with_doctor"] },
    });
    const consultStart = activeNow === 0 ? new Date() : null;

    const entry = new Queue({
      clinic: clinicId, doctorId, doctorType,
      patientName: patientName.trim(),
      mobile: mobile?.trim() || "",
      gender: gender || "Male",
      age: age ? Number(age) : null,
      tokenNumber: nextToken,
      source: source || "walkin",
      appointmentId: appointmentId || null,
      isReturning, consultStart,
      createdBy: req.user.receptionistId || null,
    });
    await entry.save();

    return res.status(201).json({ message: "Patient added to queue ✅", tokenNumber: nextToken, patient: entry });
  } catch (err) {
    console.error("ADD PATIENT ERROR:", err);
    return res.status(500).json({ message: "Server error ❌", detail: err.message });
  }
});

/* GET /api/queue/today */
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    if (!clinicId) return res.status(403).json({ message: "Not authorized ❌" });

    const { start } = todayWindow();
    const doctorFilter = buildDoctorFilter(req.user, req.query.doctorId);
    const list = await Queue.find({
      clinic: clinicId, ...doctorFilter,
      createdAt: { $gte: start },
      status: { $ne: "cancelled" },
    }).sort({ tokenNumber: 1 });

    return res.json(list);
  } catch (err) {
    console.error("TODAY QUEUE ERROR:", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* PATCH /api/queue/done/:id
   FIX: All fields wrapped in $set to avoid MongoDB mixed operator error */
router.patch("/done/:id", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    if (!clinicId) return res.status(403).json({ message: "Not authorized ❌" });

    const patient = await Queue.findOne({ _id: req.params.id, clinic: clinicId });
    if (!patient) return res.status(404).json({ message: "Patient not found ❌" });
    if (patient.status === "done") return res.status(400).json({ message: "Already marked done" });

    const consultEnd = new Date();
    let durationMins = 0;
    if (patient.consultStart) {
      durationMins = Math.max(1, Math.round((consultEnd - new Date(patient.consultStart)) / 60000));
    }

    const { visitCharge, injectionCharge, medicineCharge, notes, billingSkipped } = req.body || {};
    const hasBilling = !billingSkipped && (
      Number(visitCharge || 0) + Number(injectionCharge || 0) + Number(medicineCharge || 0) > 0
    );

    /* FIX: Use single $set to avoid MongoDB rejecting mixed operator/plain field update */
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status:          "done",
          consultEnd:      consultEnd,
          consultDuration: durationMins,
          "billing.visitCharge":     hasBilling ? Number(visitCharge || 0)     : 0,
          "billing.injectionCharge": hasBilling ? Number(injectionCharge || 0) : 0,
          "billing.medicineCharge":  hasBilling ? Number(medicineCharge || 0)  : 0,
          "billing.notes":           notes || "",
          "billing.isPaid":          hasBilling,
          "billing.billingPending":  !hasBilling,
          "billing.savedAt":         hasBilling ? new Date() : null,
        }
      },
      { new: true }
    );

    /* Start timer for next waiting patient (scoped to same doctor) */
    const { start: todayStart } = todayWindow();
    const doctorFilter = patient.doctorId ? { doctorId: patient.doctorId } : {};
    const nextWaiting = await Queue.findOne({
      clinic: clinicId, ...doctorFilter,
      createdAt: { $gte: todayStart },
      status: "waiting",
      consultStart: null,
    }).sort({ tokenNumber: 1 });

    if (nextWaiting) {
      await Queue.findByIdAndUpdate(nextWaiting._id, { $set: { consultStart: new Date() } });
    }

    return res.json({ message: "Patient marked DONE ✅", patient: updated });
  } catch (err) {
    console.error("DONE ERROR:", err);
    return res.status(500).json({ message: "Server error ❌", detail: err.message });
  }
});

/* PATCH /api/queue/status/:id */
router.patch("/status/:id", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    const { status } = req.body;
    const updated = await Queue.findOneAndUpdate(
      { _id: req.params.id, clinic: clinicId },
      { $set: { status, ...(status === "with_doctor" ? { consultStart: new Date() } : {}) } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Patient not found ❌" });
    return res.json({ message: "Status updated ✅", patient: updated });
  } catch (err) {
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* PATCH /api/queue/cancel/:id */
router.patch("/cancel/:id", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    const updated = await Queue.findOneAndUpdate(
      { _id: req.params.id, clinic: clinicId },
      { $set: { status: "cancelled" } }, { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Patient not found ❌" });
    return res.json({ message: "Patient cancelled ✅" });
  } catch (err) {
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* GET /api/queue/stats-today */
router.get("/stats-today", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    if (!clinicId) return res.status(403).json({ message: "Not authorized ❌" });

    const { start } = todayWindow();
    const doctorFilter = buildDoctorFilter(req.user, req.query.doctorId);
    const stats = await Queue.aggregate([
      { $match: { clinic: clinicId, ...doctorFilter, createdAt: { $gte: start } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* GET /api/queue/history */
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    if (!clinicId) return res.status(403).json({ message: "Not authorized ❌" });

    const target = req.query.date ? new Date(req.query.date) : new Date();
    target.setHours(0,0,0,0);
    const next = new Date(target); next.setDate(next.getDate()+1);

    const doctorFilter = buildDoctorFilter(req.user, req.query.doctorId);
    const records = await Queue.find({
      clinic: clinicId, ...doctorFilter,
      createdAt: { $gte: target, $lt: next },
    }).sort({ tokenNumber: 1 });

    return res.json(records);
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* GET /api/queue/weekly */
router.get("/weekly", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    if (!clinicId) return res.status(403).json({ message: "Not authorized ❌" });

    const LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const doctorFilter = buildDoctorFilter(req.user, req.query.doctorId);
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const start = new Date(); start.setDate(start.getDate()-i); start.setHours(0,0,0,0);
      const end = new Date(start); end.setDate(end.getDate()+1);
      const count = await Queue.countDocuments({
        clinic: clinicId, ...doctorFilter,
        createdAt: { $gte: start, $lt: end },
        status: { $ne: "cancelled" },
      });
      days.push({ label: LABELS[start.getDay()], date: start.toISOString().split("T")[0], count });
    }
    return res.json(days);
  } catch (err) {
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* GET /api/queue/monthly */
router.get("/monthly", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    if (!clinicId) return res.status(403).json({ message: "Not authorized ❌" });

    const [year, mon] = req.query.month
      ? req.query.month.split("-").map(Number)
      : [new Date().getFullYear(), new Date().getMonth()+1];

    const daysInMonth = new Date(year, mon, 0).getDate();
    const doctorFilter = buildDoctorFilter(req.user, req.query.doctorId);
    const result = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const start = new Date(year, mon-1, d, 0,0,0,0);
      const end   = new Date(year, mon-1, d, 23,59,59,999);
      const count = await Queue.countDocuments({
        clinic: clinicId, ...doctorFilter,
        createdAt: { $gte: start, $lte: end },
        status: { $ne: "cancelled" },
      });
      result.push({ label: `${d}`, date: start.toISOString().split("T")[0], count });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* PATCH /api/queue/billing/:id */
router.patch("/billing/:id", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    const { visitCharge, injectionCharge, medicineCharge, notes } = req.body;

    const existing = await Queue.findOne({ _id: req.params.id, clinic: clinicId });
    if (!existing) return res.status(404).json({ message: "Record not found ❌" });

    const isEdit = !!(existing.billing && existing.billing.isPaid);
    const now = new Date();
    const prevHistory = existing.billing?.editHistory || [];
    const auditEntry = isEdit ? {
      editedAt:      now,
      editedBy:      req.user.role === "doctor" ? "doctor" : (req.user.receptionistId || "receptionist"),
      previousVisit: Number(existing.billing.visitCharge    || 0),
      previousInj:   Number(existing.billing.injectionCharge || 0),
      previousMed:   Number(existing.billing.medicineCharge  || 0),
    } : null;

    const updated = await Queue.findOneAndUpdate(
      { _id: req.params.id, clinic: clinicId },
      {
        $set: {
          "billing.visitCharge":     Number(visitCharge)     || 0,
          "billing.injectionCharge": Number(injectionCharge) || 0,
          "billing.medicineCharge":  Number(medicineCharge)  || 0,
          "billing.notes":           notes || "",
          "billing.isPaid":          true,
          "billing.billingPending":  false,
          "billing.savedAt":         isEdit ? (existing.billing.savedAt || now) : now,
          "billing.lastEditedAt":    now,
          "billing.editHistory":     isEdit ? [...prevHistory, auditEntry] : [],
        }
      },
      { new: true }
    );

    return res.json({ message: isEdit ? "Bill updated ✅" : "Billing saved ✅", patient: updated, isEdit });
  } catch (err) {
    console.error("BILLING ERROR:", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* GET /api/queue/doctor-stats */
router.get("/doctor-stats", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Admin only" });
    const clinicId = await getClinicId(req.user);
    const { start, end } = req.query;
    const matchFilter = { clinic: clinicId, status: { $ne: "cancelled" } };
    if (start && end) matchFilter.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    const stats = await Queue.aggregate([
      { $match: matchFilter },
      { $group: {
        _id: "$doctorId",
        doctorType:     { $first: "$doctorType" },
        totalPatients:  { $sum: 1 },
        totalRevenue:   { $sum: { $add: [
          { $ifNull: ["$billing.visitCharge", 0] },
          { $ifNull: ["$billing.injectionCharge", 0] },
          { $ifNull: ["$billing.medicineCharge", 0] },
        ]}},
        avgConsultTime: { $avg: { $cond: [{ $gt: ["$consultDuration", 0] }, "$consultDuration", null] } },
      }}
    ]);
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ message: "Server error ❌" });
  }
});

router.get("/current", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    const doctorFilter = buildDoctorFilter(req.user, null);
    const current = await Queue.findOne({ clinic: clinicId, ...doctorFilter, status: "with_doctor" }).sort({ updatedAt: -1 });
    return res.json(current || null);
  } catch (err) { return res.status(500).json({ message: "Server error ❌" }); }
});

router.get("/next", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getClinicId(req.user);
    const doctorFilter = buildDoctorFilter(req.user, null);
    const next = await Queue.findOne({ clinic: clinicId, ...doctorFilter, status: "waiting" }).sort({ tokenNumber: 1 });
    return res.json(next || null);
  } catch (err) { return res.status(500).json({ message: "Server error ❌" }); }
});

/* ── NEW: GET /api/queue/public/:clinicId — NO AUTH REQUIRED — Public waiting count ── */
router.get("/public/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(clinicId))
      return res.status(400).json({ message: "Invalid clinic ID" });

    const clinicObjId = new mongoose.Types.ObjectId(clinicId);
    const start = new Date(); start.setHours(0, 0, 0, 0);

    const waitingCount = await Queue.countDocuments({
      clinic: clinicObjId,
      createdAt: { $gte: start },
      status: "waiting",
    });

    const withDoctorCount = await Queue.countDocuments({
      clinic: clinicObjId,
      createdAt: { $gte: start },
      status: "with_doctor",
    });

    // Estimate avg consult time from today's done patients
    const donePatientsToday = await Queue.find({
      clinic: clinicObjId,
      createdAt: { $gte: start },
      status: "done",
      consultDuration: { $gt: 0 },
    }).select("consultDuration").lean();

    let avgConsultMins = 10; // default fallback
    if (donePatientsToday.length > 0) {
      const total = donePatientsToday.reduce((sum, p) => sum + p.consultDuration, 0);
      const calculated = Math.round(total / donePatientsToday.length);
      avgConsultMins = Math.max(calculated, 10); // enforce 10-min minimum per patient
    }

    const estimatedWaitMins = waitingCount * avgConsultMins;

    return res.json({
      waiting: waitingCount,
      withDoctor: withDoctorCount,
      estimatedWaitMins,
      avgConsultMins,
    });
  } catch (err) {
    console.error("PUBLIC QUEUE COUNT ERROR:", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});
router.delete("/reset-today", authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await Queue.deleteMany({
      clinicId: req.user.clinicId,
      createdAt: { $gte: today },
      status: "waiting"
    });
    res.json({ message: "Queue reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;