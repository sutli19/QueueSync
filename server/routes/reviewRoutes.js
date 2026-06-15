const express      = require("express");
const router       = express.Router();
const mongoose     = require("mongoose");
const Review       = require("../models/Review");
const SubDoctor    = require("../models/SubDoctor");
const authMiddleware = require("../middleware/authMiddleware");

/* ── PUBLIC: POST /api/reviews/submit — no auth, patient submits rating ── */
router.post("/submit", async (req, res) => {
  try {
    const { clinicId, patientName, rating, text, mobile } = req.body;

    if (!clinicId || !mongoose.Types.ObjectId.isValid(clinicId))
      return res.status(400).json({ message: "Invalid clinic ID ❌" });

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be 1–5 ❌" });

    const review = new Review({
      clinic:      new mongoose.Types.ObjectId(clinicId),
      patientName: (patientName || "Anonymous").trim().slice(0, 60),
      rating:      Number(rating),
      text:        (text || "").trim().slice(0, 400),
      mobile:      (mobile || "").trim().slice(0, 10),
    });

    await review.save();
    return res.status(201).json({ message: "Review submitted ✅", review });
  } catch (err) {
    console.error("REVIEW SUBMIT ERROR:", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* ── PUBLIC: GET /api/reviews/public/:clinicId — no auth, fetch reviews for patient page ── */
router.get("/public/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(clinicId))
      return res.status(400).json({ message: "Invalid clinic ID ❌" });

    const reviews = await Review.find({ clinic: new mongoose.Types.ObjectId(clinicId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const avg = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    return res.json({ reviews, avg, total: reviews.length });
  } catch (err) {
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* ── AUTH: GET /api/reviews/mine — doctor fetches their own clinic's reviews ── */
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    let clinicId;

    if (req.user.role === "doctor") {
      const raw = req.user.userId || req.user.id || req.user._id;
      if (!raw || !mongoose.Types.ObjectId.isValid(raw))
        return res.status(403).json({ message: "Not authorized ❌" });
      clinicId = new mongoose.Types.ObjectId(raw);
    } else if (req.user.role === "sub_doctor" || req.user.role === "receptionist") {
      if (!req.user.clinicId || !mongoose.Types.ObjectId.isValid(req.user.clinicId))
        return res.status(403).json({ message: "Not authorized ❌" });
      clinicId = new mongoose.Types.ObjectId(req.user.clinicId);
    } else {
      return res.status(403).json({ message: "Not authorized ❌" });
    }

    const reviews  = await Review.find({ clinic: clinicId })
      .sort({ createdAt: -1 })
      .lean();

    const avg = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    // Rating breakdown 1–5
    const breakdown = [1, 2, 3, 4, 5].map(n => ({
      stars: n,
      count: reviews.filter(r => r.rating === n).length,
    }));

    return res.json({ reviews, avg, total: reviews.length, breakdown });
  } catch (err) {
    console.error("REVIEWS MINE ERROR:", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;