const mongoose = require("mongoose");

const subDoctorSchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      default: "sub_doctor",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

/* Unique username within same clinic */
subDoctorSchema.index({ clinic: 1, username: 1 }, { unique: true });

module.exports = mongoose.model("SubDoctor", subDoctorSchema);