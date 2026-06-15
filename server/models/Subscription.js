const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
    },
    plan: {
      type:     String,
      enum:     ["single", "polyclinic"],
      required: true,
    },
    status: {
      type:    String,
      enum:    ["active", "expired", "pending"],
      default: "pending",
    },
    utrNumber:  { type: String },   // submitted by user as payment proof
    amountPaid: { type: Number },   // in rupees
    startDate:  { type: Date },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);