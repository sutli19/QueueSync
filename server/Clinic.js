const mongoose = require("mongoose");

const clinicSchema = new mongoose.Schema({
  clinicName: {
    type: String,
    required: true,
  },

  doctorName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: String,
  address: String,

  status: {
    type: String,
    enum: ["OPEN", "CLOSED"],
    default: "OPEN",
  },
}, { timestamps: true });

module.exports = mongoose.model("Clinic", clinicSchema);
