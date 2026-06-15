const User        = require("../models/User");
const Receptionist= require("../models/Receptionist");
const SubDoctor   = require("../models/SubDoctor");
const bcrypt      = require("bcryptjs");
const jwt         = require("jsonwebtoken");

/* ─────────────────────────────────────────
   LOGIN
   doctor    → email + password
   receptionist → username + password
   sub_doctor   → username + password (same as receptionist but different model)
───────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    /* ── Doctor login ── */
    if (email) {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { userId: user._id, role: "doctor" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        role:       "doctor",
        name:       user.name || user.doctorName || "",
        doctorName: user.name || user.doctorName || "",
        clinicName: user.clinicName || "",
        clinicType: user.clinicType || "single",
        userId:     user._id,
      });
    }

    /* ── Username login — try sub_doctor first, then receptionist ── */
    if (username) {
      /* Check sub_doctor */
      const subDoc = await SubDoctor.findOne({ username, isActive: true });
      if (subDoc) {
        const isMatch = await bcrypt.compare(password, subDoc.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        /* Get clinicType from admin */
        const adminClinic = await User.findById(subDoc.clinic).lean();

        const token = jwt.sign(
          { subDoctorId: subDoc._id, role: "sub_doctor", clinicId: subDoc.clinic },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.json({
          token,
          role:       "sub_doctor",
          name:       subDoc.name || "",
          doctorName: subDoc.name || "",
          clinicName: adminClinic?.clinicName || "",
          clinicType: adminClinic?.clinicType || "polyclinic",
          subDoctorId: subDoc._id,
        });
      }

      /* Check receptionist */
      const recep = await Receptionist.findOne({ username });
      if (recep) {
        const isMatch = await bcrypt.compare(password, recep.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const adminClinic = await User.findById(recep.clinic).lean();

        const token = jwt.sign(
          { receptionistId: recep._id, role: "receptionist", clinicId: recep.clinic },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.json({
          token,
          role:        "receptionist",
          name:        recep.name || "",
          permissions: recep.permissions || {},
          clinicType:  adminClinic?.clinicType || "single",
        });
      }

      return res.status(400).json({ message: "User not found" });
    }

    return res.status(400).json({ message: "Email or username required" });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   SIGNUP  (admin doctor)
───────────────────────────────────────── */
exports.signup = async (req, res) => {
  try {
    const { email, password, name, doctorName, clinicName, phone, clinicType } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed  = await bcrypt.hash(password, 10);
    const docName = name || doctorName || "";

    const user = new User({
      email,
      password:   hashed,
      name:       docName,
      doctorName: docName,
      clinicName: clinicName || "",
      mobile:     phone || "",
      clinicType: clinicType || "single",
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      role:       "doctor",
      name:       docName,
      doctorName: docName,
      clinicName: user.clinicName,
      clinicType: user.clinicType,
      userId:     user._id,
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   CREATE RECEPTIONIST  (admin doctor only)
───────────────────────────────────────── */
exports.createReceptionist = async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Only admin doctors can create receptionists" });

    const { name, username, password, mobile, permissions } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ message: "Name, username and password required" });

    const existing = await Receptionist.findOne({ username, clinic: req.user.userId });
    if (existing) return res.status(409).json({ message: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);
    const recep  = new Receptionist({
      name, username,
      password:    hashed,
      mobile:      mobile || "",
      clinic:      req.user.userId,
      permissions: permissions || {},
    });
    await recep.save();

    res.status(201).json({
      message:      "Receptionist created ✅",
      receptionist: { _id: recep._id, name: recep.name, username: recep.username },
    });
  } catch (err) {
    console.error("CREATE RECEPTIONIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   GET RECEPTIONISTS  (admin doctor only)
───────────────────────────────────────── */
exports.getReceptionists = async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized" });

    const list = await Receptionist.find({ clinic: req.user.userId })
      .select("-password").sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   TOGGLE RECEPTIONIST ACTIVE  (admin only)
───────────────────────────────────────── */
exports.toggleReceptionist = async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized" });

    const recep = await Receptionist.findOne({ _id: req.params.id, clinic: req.user.userId });
    if (!recep) return res.status(404).json({ message: "Receptionist not found" });

    recep.isActive = !recep.isActive;
    await recep.save();
    res.json({ message: `Receptionist ${recep.isActive ? "activated" : "deactivated"} ✅`, isActive: recep.isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   UPDATE RECEPTIONIST PERMISSIONS (admin only)
───────────────────────────────────────── */
exports.updateReceptionistPerms = async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized" });

    const recep = await Receptionist.findOneAndUpdate(
      { _id: req.params.id, clinic: req.user.userId },
      { permissions: req.body.permissions },
      { new: true }
    ).select("-password");

    if (!recep) return res.status(404).json({ message: "Receptionist not found" });
    res.json({ message: "Permissions updated ✅", receptionist: recep });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   CREATE SUB-DOCTOR  (admin doctor only)
───────────────────────────────────────── */
exports.createSubDoctor = async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Only admin doctors can create sub-doctors" });

    const { name, username, password, mobile } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ message: "Name, username and password required" });

    const existing = await SubDoctor.findOne({ username, clinic: req.user.userId });
    if (existing) return res.status(409).json({ message: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);
    const subDoc = new SubDoctor({
      name, username,
      password:  hashed,
      mobile:    mobile || "",
      clinic:    req.user.userId,
      createdBy: req.user.userId,
    });
    await subDoc.save();

    res.status(201).json({
      message:   "Doctor account created ✅",
      subDoctor: { _id: subDoc._id, name: subDoc.name, username: subDoc.username },
    });
  } catch (err) {
    console.error("CREATE SUBDOCTOR ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   GET SUB-DOCTORS  (admin doctor only)
───────────────────────────────────────── */
exports.getSubDoctors = async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized" });

    const list = await SubDoctor.find({ clinic: req.user.userId })
      .select("-password").sort({ createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   TOGGLE SUB-DOCTOR ACTIVE  (admin only)
───────────────────────────────────────── */
exports.toggleSubDoctor = async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized" });

    const doc = await SubDoctor.findOne({ _id: req.params.id, clinic: req.user.userId });
    if (!doc) return res.status(404).json({ message: "Doctor not found" });

    doc.isActive = !doc.isActive;
    await doc.save();
    res.json({ message: `Doctor ${doc.isActive ? "activated" : "deactivated"} ✅`, isActive: doc.isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   RESET SUB-DOCTOR PASSWORD  (admin only)
───────────────────────────────────────── */
exports.resetSubDoctorPassword = async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Not authorized" });

    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: "New password required" });

    const hashed = await bcrypt.hash(newPassword, 10);
    const doc = await SubDoctor.findOneAndUpdate(
      { _id: req.params.id, clinic: req.user.userId },
      { password: hashed },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Password reset ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};