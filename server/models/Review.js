const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: { type: String, default: "Anonymous" },
    rating:      { type: Number, required: true, min: 1, max: 5 },
    text:        { type: String, default: "" },
    mobile:      { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);