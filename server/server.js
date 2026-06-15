const express       = require("express");
const cors          = require("cors");
const mongoose      = require("mongoose");
require("dotenv").config();

const authRoutes        = require("./routes/authRoutes");
const queueRoutes       = require("./routes/queueRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const clinicRoutes      = require("./routes/clinicRoutes");
const paymentRoutes     = require("./routes/paymentRoutes");
const receptionistRoutes = require("./routes/receptionistRoutes");
const reviewRoutes       = require("./routes/reviewRoutes");
const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* ================= DATABASE ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* ================= HEALTH ================= */
app.get("/", (req, res) => res.send("QueueSync backend running 🚀"));

/* ================= ROUTES ================= */
app.use("/api/auth",         authRoutes);
app.use("/api/queue",        queueRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/clinic",       clinicRoutes);
app.use("/api/payment",      paymentRoutes);
app.use("/api/receptionists", receptionistRoutes);
app.use("/api/reviews",       reviewRoutes);
/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

/* ================= START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));