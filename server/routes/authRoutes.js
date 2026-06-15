const express       = require("express");
const bcrypt        = require("bcryptjs");
const jwt           = require("jsonwebtoken");
const User          = require("../models/User");
const Receptionist  = require("../models/Receptionist");
const SubDoctor     = require("../models/SubDoctor");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

function isStrongPassword(pw) {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}

/* ═══════════════════════════════════════════
   POST /api/auth/signup  (admin doctor)
═══════════════════════════════════════════ */
router.post("/signup", async (req, res) => {
  try {
    const {
      email, password, clinicName, doctorName, name,
      mobile, address, securityQuestion, securityAnswer,
      clinicType,   // ← NEW
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required ❌" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8+ chars with uppercase, lowercase, number and special character ❌",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) return res.status(400).json({ message: "Email already registered ❌" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const hashedAnswer   = securityAnswer
      ? await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10)
      : "";

    const docName = name || doctorName || "";

    const newUser = new User({
      email:            email.toLowerCase().trim(),
      password:         hashedPassword,
      clinicName:       clinicName || "",
      doctorName:       docName,
      name:             docName,
      mobile:           mobile   || "",
      address:          address  || "",
      securityQuestion: securityQuestion || "",
      securityAnswer:   hashedAnswer,
      clinicType:       clinicType || "single",   // ← NEW
    });

    await newUser.save();
    res.status(201).json({ message: "Account created successfully ✅" });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   POST /api/auth/login
   Handles: doctor (email), sub_doctor (username), receptionist (username)
═══════════════════════════════════════════ */
router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    /* ── Doctor login ── */
    if (email) {
      const doctor = await User.findOne({ email: email.toLowerCase().trim() });
      if (!doctor) return res.status(400).json({ message: "No account found with this email ❌" });

      const isMatch = await bcrypt.compare(password, doctor.password);
      if (!isMatch) return res.status(400).json({ message: "Incorrect password ❌" });

      const token = jwt.sign(
        { userId: doctor._id, role: "doctor" },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "7d" }
      );

      return res.json({
        message:    "Login successful ✅",
        token,
        role:       "doctor",
        doctorName: doctor.doctorName || doctor.name || "",
        name:       doctor.doctorName || doctor.name || "",
        clinicName: doctor.clinicName || "",
        clinicType: doctor.clinicType || "single",
        userId:     doctor._id,
      });
    }

    /* ── Username login: try sub_doctor first, then receptionist ── */
    if (username) {
      /* Check sub_doctor */
      const subDoc = await SubDoctor.findOne({ username: username.trim() });
      if (subDoc) {
        if (!subDoc.isActive)
          return res.status(403).json({ message: "Account disabled ❌" });

        const isMatch = await bcrypt.compare(password, subDoc.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password ❌" });

        const adminClinic = await User.findById(subDoc.clinic).lean();

        const token = jwt.sign(
          { subDoctorId: subDoc._id, role: "sub_doctor", clinicId: subDoc.clinic },
          process.env.JWT_SECRET || "secretkey",
          { expiresIn: "7d" }
        );

        return res.json({
          message:     "Login successful ✅",
          token,
          role:        "sub_doctor",
          name:        subDoc.name || "",
          doctorName:  subDoc.name || "",
          clinicName:  adminClinic?.clinicName || "",
          clinicType:  adminClinic?.clinicType || "polyclinic",
          subDoctorId: subDoc._id,
        });
      }

      /* Check receptionist */
      const recep = await Receptionist.findOne({ username: username.trim() });
      if (recep) {
        if (!recep.isActive)
          return res.status(403).json({ message: "Account disabled ❌" });

        const isMatch = await bcrypt.compare(password, recep.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password ❌" });

        const adminClinic = await User.findById(recep.clinic).lean();

        const token = jwt.sign(
          { receptionistId: recep._id, role: "receptionist", clinicId: recep.clinic },
          process.env.JWT_SECRET || "secretkey",
          { expiresIn: "7d" }
        );

        return res.json({
          message:    "Login successful ✅",
          token,
          role:       "receptionist",
          name:       recep.name || "",
          permissions: recep.permissions || {},
          clinicName: adminClinic?.clinicName || "",
          clinicType: adminClinic?.clinicType || "single",
        });
      }

      return res.status(400).json({ message: "User ID not found ❌" });
    }

    return res.status(400).json({ message: "Provide email or username ❌" });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   FORGOT PASSWORD — Step 1 (get question)
═══════════════════════════════════════════ */
router.post("/forgot-password/question", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "No account found ❌" });
    res.json({ question: user.securityQuestion });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   FORGOT PASSWORD — Step 2 (verify answer)
═══════════════════════════════════════════ */
router.post("/forgot-password/verify", async (req, res) => {
  try {
    const { email, answer } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "Account not found ❌" });

    const isMatch = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswer);
    if (!isMatch) return res.status(400).json({ message: "Incorrect answer ❌" });
    res.json({ message: "Verified ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   FORGOT PASSWORD — Step 3 (reset)
═══════════════════════════════════════════ */
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: "Password doesn't meet requirements ❌" });
    }
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "Account not found ❌" });

    const isMatch = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswer);
    if (!isMatch) return res.status(400).json({ message: "Security answer failed ❌" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: "Password reset ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   POST /api/auth/create-receptionist  (admin only)
═══════════════════════════════════════════ */
router.post("/create-receptionist", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Only admin doctors can create receptionists ❌" });

    const { name, username, password, mobile, permissions } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ message: "Name, username and password required ❌" });

    const existing = await Receptionist.findOne({ username: username.trim(), clinic: req.user.userId });
    if (existing) return res.status(400).json({ message: "User ID already taken ❌" });

    const newRecep = new Receptionist({
      clinic:      req.user.userId,
      name:        name.trim(),
      username:    username.trim(),
      password:    await bcrypt.hash(password, 12),
      mobile:      mobile || "",
      permissions: permissions || {},
      createdBy:   req.user.userId,
    });
    await newRecep.save();

    res.status(201).json({
      message:      "Receptionist created ✅",
      receptionist: { _id: newRecep._id, name: newRecep.name, username: newRecep.username },
    });
  } catch (error) {
    console.error("CREATE RECEPTIONIST ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   GET /api/auth/receptionists  (admin only)
═══════════════════════════════════════════ */
router.get("/receptionists", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized ❌" });

    const list = await Receptionist.find({ clinic: req.user.userId })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   PATCH /api/auth/receptionist/:id/toggle  (admin only)

═══════════════════════════════════════════ */
router.patch("/receptionist/edit/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized ❌" });
    const { name, mobile, permissions } = req.body;
    const update = {};
    if (name !== undefined)        update.name        = name;
    if (mobile !== undefined)      update.mobile      = mobile;
    if (permissions !== undefined) update.permissions = permissions;
    const updated = await Receptionist.findOneAndUpdate(
      { _id: req.params.id, clinic: req.user.userId },
      { $set: update },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Receptionist not found ❌" });
    res.json({ message: "Updated successfully ✅", receptionist: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

router.delete("/receptionist/delete/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized ❌" });
    const deleted = await Receptionist.findOneAndDelete(
      { _id: req.params.id, clinic: req.user.userId }
    );
    if (!deleted) return res.status(404).json({ message: "Deleted successfully ✅" });
    res.json({ message: "Deleted successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});
router.patch("/receptionist/:id/toggle", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized ❌" });

    const recep = await Receptionist.findOne({ _id: req.params.id, clinic: req.user.userId });
    if (!recep) return res.status(404).json({ message: "Receptionist not found ❌" });

    recep.isActive = !recep.isActive;
    await recep.save();
    res.json({
      message:  `Receptionist ${recep.isActive ? "activated" : "deactivated"} ✅`,
      isActive: recep.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* Legacy disable route kept for compatibility */
router.patch("/receptionist/:id/disable", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized ❌" });
    const r = await Receptionist.findOneAndUpdate(
      { _id: req.params.id, clinic: req.user.userId },
      { isActive: false },
      { new: true }
    );
    if (!r) return res.status(404).json({ message: "Receptionist not found ❌" });
    res.json({ message: "Disabled ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   POST /api/auth/create-subdoctor  (admin only)
═══════════════════════════════════════════ */
router.post("/create-subdoctor", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Only admin doctors can create sub-doctors ❌" });

    const { name, username, password, mobile } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ message: "Name, username and password required ❌" });

    const existing = await SubDoctor.findOne({ username: username.trim(), clinic: req.user.userId });
    if (existing) return res.status(409).json({ message: "Username already taken ❌" });

    const subDoc = new SubDoctor({
      clinic:    req.user.userId,
      name:      name.trim(),
      username:  username.trim(),
      password:  await bcrypt.hash(password, 12),
      mobile:    mobile || "",
      createdBy: req.user.userId,
    });
    await subDoc.save();

    res.status(201).json({
      message:   "Doctor account created ✅",
      subDoctor: { _id: subDoc._id, name: subDoc.name, username: subDoc.username },
    });
  } catch (error) {
    console.error("CREATE SUBDOCTOR ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   GET /api/auth/subdoctors  (admin only)
═══════════════════════════════════════════ */
router.get("/subdoctors", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized ❌" });

    const list = await SubDoctor.find({ clinic: req.user.userId })
      .select("-password")
      .sort({ createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   PATCH /api/auth/subdoctor/:id/toggle  (admin only)
═══════════════════════════════════════════ */
router.patch("/subdoctor/:id/toggle", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized ❌" });

    const doc = await SubDoctor.findOne({ _id: req.params.id, clinic: req.user.userId });
    if (!doc) return res.status(404).json({ message: "Doctor not found ❌" });

    doc.isActive = !doc.isActive;
    await doc.save();
    res.json({
      message:  `Doctor ${doc.isActive ? "activated" : "deactivated"} ✅`,
      isActive: doc.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   PATCH /api/auth/subdoctor/:id/reset-password  (admin only)
═══════════════════════════════════════════ */
router.patch("/subdoctor/:id/reset-password", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized ❌" });

    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: "New password required ❌" });

    const doc = await SubDoctor.findOneAndUpdate(
      { _id: req.params.id, clinic: req.user.userId },
      { password: await bcrypt.hash(newPassword, 12) },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Doctor not found ❌" });
    res.json({ message: "Password reset ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});
/* ═══════════════════════════════════════════
   PATCH /api/auth/receptionist/edit/:id  (admin only)
═══════════════════════════════════════════ */
router.patch("/receptionist/edit/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized ❌" });

    const { name, mobile, permissions } = req.body;
    const update = {};
    if (name !== undefined)        update.name        = name;
    if (mobile !== undefined)      update.mobile      = mobile;
    if (permissions !== undefined) update.permissions = permissions;

    const updated = await Receptionist.findOneAndUpdate(
      { _id: req.params.id, clinic: req.user.userId },
      { $set: update },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Receptionist not found ❌" });
    res.json({ message: "Updated successfully ✅", receptionist: updated });
  } catch (err) {
    console.error("EDIT RECEPTIONIST ERROR:", err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   DELETE /api/auth/receptionist/delete/:id  (admin only)
═══════════════════════════════════════════ */
router.delete("/receptionist/delete/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized ❌" });

    const deleted = await Receptionist.findOneAndDelete(
      { _id: req.params.id, clinic: req.user.userId }
    );
    if (!deleted) return res.status(404).json({ message: "Receptionist not found ❌" });
    res.json({ message: "Deleted successfully ✅" });
  } catch (err) {
    console.error("DELETE RECEPTIONIST ERROR:", err);
    res.status(500).json({ message: "Server error ❌" });
  }
});
module.exports = router;