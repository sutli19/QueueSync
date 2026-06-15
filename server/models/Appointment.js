const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ── NEW: multi-doctor scoping ── */
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    name:   { type: String, required: true, trim: true },
    mobile: { type: String, default: "" },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    age:    { type: Number, default: null },

    date:   { type: String, required: true }, // "YYYY-MM-DD"
    time:   { type: String, required: true }, // "HH:MM"
    doctor: { type: String, default: "" },
    reason: { type: String, default: "" },

    status: {
      type: String,
      enum: ["scheduled", "arrived", "completed", "cancelled", "delayed", "no_show"],
      default: "scheduled",
    },

    queueId:   { type: mongoose.Schema.Types.ObjectId, ref: "Queue", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);