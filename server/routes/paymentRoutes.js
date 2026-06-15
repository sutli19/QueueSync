const express        = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Subscription   = require("../models/Subscription");

const router = express.Router();

const PLANS = {
  single:     { amount: 1,  name: "Single Doctor Plan" },
  polyclinic: { amount: 1,  name: "Polyclinic Plan"    },
};

/* ═══════════════════════════════════════════
   POST /api/payment/submit-utr
   User submits UTR number after paying via GPay.
   Auto-approves instantly (demo mode).
═══════════════════════════════════════════ */
router.post("/submit-utr", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Only doctors can activate plans ❌" });

    const { plan, utrNumber } = req.body;

    if (!PLANS[plan])
      return res.status(400).json({ message: "Invalid plan ❌" });

    if (!utrNumber || utrNumber.trim().length < 6)
      return res.status(400).json({ message: "Please enter a valid UTR number ❌" });

    // Check if UTR already used by someone else
    const utrExists = await Subscription.findOne({ utrNumber: utrNumber.trim() });
    if (utrExists)
      return res.status(400).json({ message: "This UTR number has already been used ❌" });

    const now    = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 1); // 1 month validity

    await Subscription.findOneAndUpdate(
      { userId: req.user.userId },
      {
        userId:     req.user.userId,
        plan,
        status:     "active",
        utrNumber:  utrNumber.trim(),
        amountPaid: PLANS[plan].amount,
        startDate:  now,
        expiryDate: expiry,
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Payment verified ✅", plan });

  } catch (err) {
    console.error("SUBMIT UTR ERROR:", err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ═══════════════════════════════════════════
   GET /api/payment/status
   Check if logged-in doctor has active subscription
═══════════════════════════════════════════ */
router.get("/status", authMiddleware, async (req, res) => {
  try {
    // Sub-doctors and receptionists always pass
    if (req.user.role !== "doctor")
      return res.json({ active: true, plan: null });

    const sub = await Subscription.findOne({ userId: req.user.userId });

    if (!sub || sub.status !== "active")
      return res.json({ active: false, plan: null });

    // Check expiry
    if (new Date() > new Date(sub.expiryDate)) {
      sub.status = "expired";
      await sub.save();
      return res.json({ active: false, plan: sub.plan });
    }

    res.json({ active: true, plan: sub.plan, expiryDate: sub.expiryDate });

  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;