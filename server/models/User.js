const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  clinicName: {
    type: String,
    default: "",
  },

  /* Support both field names for compatibility */
  doctorName: {
    type: String,
    default: "",
  },

  name: {
    type: String,
    default: "",
  },

  mobile: {
    type: String,
    default: "",
  },

  address: {
    type: String,
    default: "",
  },

  securityQuestion: {
    type: String,
    default: "",
  },

  securityAnswer: {
    type: String,
    default: "",
  },

  /* ── NEW: clinic type selector ── */
  clinicType: {
    type: String,
    enum: ["single", "polyclinic"],
    default: "single",
  },

  role: {
    type: String,
    enum: ["admin_doctor"],
    default: "admin_doctor",
  },

  plan: {
    type: String,
    enum: ["free", "basic", "pro"],
    default: "free",
  },

  receptionistLimit: {
    type: Number,
    default: 1,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);