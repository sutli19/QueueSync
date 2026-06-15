const express = require("express");
const bcrypt = require("bcryptjs");
const Receptionist = require("../models/Receptionist");
const User = require("../models/User");
const router = express.Router();

/* ================= CREATE RECEPTIONIST ================= */
router.post("/create", async (req, res) => {
  try {
    const { doctorId, name, username, password } = req.body;
    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found ❌" });

    const receptionistCount = await Receptionist.countDocuments({ clinic: doctorId });
    if (receptionistCount >= doctor.receptionistLimit) {
      return res.status(403).json({ message: "Receptionist limit reached. Please upgrade your plan 🚀" });
    }

    const existingUsername = await Receptionist.findOne({ clinic: doctorId, username });
    if (existingUsername) return res.status(400).json({ message: "Username already exists in this clinic ❌" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newReceptionist = new Receptionist({
      clinic: doctorId, name, username, password: hashedPassword,
    });
    await newReceptionist.save();

    res.status(201).json({
      message: "Receptionist created successfully ✅",
      receptionist: { id: newReceptionist._id, name: newReceptionist.name, username: newReceptionist.username },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ================= EDIT RECEPTIONIST ================= */
router.patch("/edit/:id", async (req, res) => {
  try {
    const { name, mobile, permissions } = req.body;
    const update = {};
    if (name)        update.name        = name;
    if (mobile)      update.mobile      = mobile;
    if (permissions) update.permissions = permissions;

    const updated = await Receptionist.findByIdAndUpdate(
      req.params.id, { $set: update }, { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Receptionist not found" });
    res.json({ message: "Updated successfully ✅", receptionist: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ================= DELETE RECEPTIONIST ================= */
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await Receptionist.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Receptionist not found" });
    res.json({ message: "Receptionist deleted successfully ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;