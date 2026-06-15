const mongoose = require("mongoose");

const clinicSchema = new mongoose.Schema({
  adminDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  clinicName:    { type: String, default: "" },
  address:       { type: String, default: "" },
  contactNumber: { type: String, default: "" },
  foundedYear:   { type: Number, default: null },

  openTime:  { type: String, default: "09:00" },
  closeTime: { type: String, default: "18:00" },
  isOpen:    { type: Boolean, default: true },

  paymentMethods: [{ type: String }],
  facilities:     [{ type: String }],

  // Clinic-level fee structure: [{ name: "Consultation", amount: 200 }]
  feeStructure: [
    {
      name:   { type: String, default: "" },
      amount: { type: Number, default: 0 },
    },
  ],

  bannerPhoto: { type: String, default: "" },

  updatedAt: { type: Date, default: Date.now },
});

clinicSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Clinic", clinicSchema);