const mongoose = require("mongoose");

const doctorProfileSchema = new mongoose.Schema({
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorRef: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  doctorType: {
    type: String,
    enum: ["admin", "sub_doctor"],
    default: "admin",
  },
  photo:           { type: String, default: "" },
  qualifications:  { type: String, default: "" },
  specializations: [{ type: String }],
  languages:       [{ type: String }],
  experience:      { type: Number, default: 0 },

  // ── Legacy fixed charges (kept for backward compat) ──
  consultationCharges: {
    visit:     { type: Number, default: 0 },
    injection: { type: Number, default: 0 },
    medicine:  { type: Number, default: 0 },
  },

  // ── NEW: flexible charges array ──
  // Each entry: { name: "ECG", amount: 300 }
  charges: [
    {
      name:   { type: String, default: "" },
      amount: { type: Number, default: 0 },
    },
  ],

  contactNumber: { type: String, default: "" },

  // ── Status & availability ──
  isActive:         { type: Boolean, default: true },
  availabilityNote: { type: String, default: "" }, // free-form textarea, e.g. "Mon–Fri 10am–2pm"

  // ── Vacation ──
  vacationFrom: { type: Date,   default: null },
  vacationTo:   { type: Date,   default: null },
  vacationNote: { type: String, default: "" },

  // ── Works elsewhere ──
  worksElsewhere: {
    place:    { type: String, default: "" },
    schedule: { type: String, default: "" },
  },

  updatedAt: { type: Date, default: Date.now },
});

doctorProfileSchema.index({ clinic: 1, doctorRef: 1 }, { unique: true });
doctorProfileSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema);