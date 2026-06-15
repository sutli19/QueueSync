const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
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

    doctorType: {
      type: String,
      enum: ["admin", "sub_doctor", null],
      default: null,
    },

    patientName: { type: String, required: true, trim: true },
    mobile:      { type: String, default: "" },
    gender:      { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    age:         { type: Number, default: null },

    tokenNumber: { type: Number, required: true },

    status: {
      type: String,
      enum: ["waiting", "with_doctor", "done", "cancelled"],
      default: "waiting",
    },

    source:        { type: String, enum: ["walkin", "appointment"], default: "walkin" },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },

    isReturning: { type: Boolean, default: false },

    consultDuration: { type: Number, default: 0 },
    consultStart:    { type: Date, default: null },
    consultEnd:      { type: Date, default: null },

    billing: {
      visitCharge:     { type: Number, default: 0 },
      injectionCharge: { type: Number, default: 0 },
      medicineCharge:  { type: Number, default: 0 },
      notes:           { type: String, default: "" },
      isPaid:          { type: Boolean, default: false },

      /* ── NEW billing fields ── */
      billingPending:  { type: Boolean, default: false },
      savedAt:         { type: Date, default: null },
      lastEditedAt:    { type: Date, default: null },
      editHistory:     { type: Array,  default: [] },
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Queue", queueSchema);