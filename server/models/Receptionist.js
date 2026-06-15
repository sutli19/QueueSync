const mongoose = require("mongoose");

const receptionistSchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // links to doctor clinic
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
    },

    role: {
      type: String,
      default: "receptionist",
    },

    /* 🔐 PERMISSIONS CONTROL */
    permissions: {
      canManageQueue: { type: Boolean, default: true },
      canBookAppointment: { type: Boolean, default: true },
      canEditPatients: { type: Boolean, default: true },
      canChangeStatus: { type: Boolean, default: false },
      canViewDashboard: { type: Boolean, default: false },
    },

    /* 📴 DISABLE WITHOUT DELETE */
    isActive: {
      type: Boolean,
      default: true,
    },

    /* 🧾 AUDIT TRAIL */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

/* ✅ UNIQUE USERNAME INSIDE SAME CLINIC */
receptionistSchema.index({ clinic: 1, username: 1 }, { unique: true });

module.exports = mongoose.model("Receptionist", receptionistSchema);
