import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import logo   from "../assets/logo.png";
import gpayQR from "../assets/gpay-qr.jpeg";

const PLAN_INFO = {
  single: {
    name:     "Single Doctor Plan",
    price:    "₹1",
    amount:   1,
    features: [
      "1 Doctor profile",
      "Up to 100 patients/day",
      "Digital token generation",
      "Live queue display",
    ],
    icon: "🏥",
  },
  polyclinic: {
    name:     "Polyclinic Plan",
    price:    "₹1",
    amount:   1,
    features: [
      "Multiple doctor profiles",
      "Independent queues per doctor",
      "Sub-doctor dashboards",
    ],
    icon: "🏨",
  },
};

export default function Payment() {
  const [searchParams]          = useSearchParams();
  const navigate                = useNavigate();
  const plan                    = searchParams.get("plan") || "single";
  const info                    = PLAN_INFO[plan] || PLAN_INFO.single;
  const [status, setStatus]     = useState({ msg: "", type: "" });
  const [loading, setLoading]   = useState(false);
  const [paid, setPaid]         = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    if (!token || role !== "doctor") navigate("/login");
  }, []);

  const handleSubmitUTR = async () => {
    setLoading(true);
    setStatus({ msg: "", type: "" });

    try {
      const token = localStorage.getItem("token");
      const res   = await fetch("http://localhost:5000/api/payment/submit-utr", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, utrNumber: "DEMO-PAYMENT" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ msg: data.message || "Activation failed. Try again.", type: "error" });
        setLoading(false);
        return;
      }

      setPaid(true);
      setStatus({ msg: "Plan activated! Redirecting to dashboard…", type: "success" });
      setTimeout(() => navigate("/dashboard"), 2000);

    } catch {
      setStatus({ msg: "Server not reachable. Try again.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <img src={logo} alt="QueueSync" style={styles.logo} />
          <span style={styles.brand}>QueueSync</span>
        </div>

        <h2 style={styles.title}>Activate Your Plan</h2>
        <p style={styles.sub}>This is a demo checkout. Pay ₹1 via UPI and confirm below to activate.</p>

        {/* Demo notice */}
        <div style={styles.demoNotice}>
          🧪 <strong>Demo Mode</strong> — Real payment integration coming soon. For now, scan the QR, pay ₹1, and click confirm to activate your plan.
        </div>

        {/* Plan Badge */}
        <div style={styles.planBadge}>
          <span style={styles.planIcon}>{info.icon}</span>
          <div>
            <div style={styles.planName}>{info.name}</div>
            <div style={styles.planPrice}>{info.price} <span style={styles.planPer}>/ month</span></div>
          </div>
        </div>

        {/* Steps */}
        <div style={styles.stepsRow}>
          {["Scan QR", "Pay ₹1", "Confirm", "Get Access"].map((s, i) => (
            <div key={i} style={styles.step}>
              <div style={styles.stepCircle}>{i + 1}</div>
              <div style={styles.stepLabel}>{s}</div>
            </div>
          ))}
        </div>

        {/* QR Image */}
        <div style={styles.qrWrap}>
          <img src={gpayQR} alt="GPay QR Code" style={styles.qrImg} />
          <div style={styles.upiId}>UPI ID: jsweety544@okicici</div>
          <div style={styles.scanNote}>Scan with GPay · PhonePe · Paytm · Any UPI app</div>
        </div>

        {/* Status */}
        {status.msg && (
          <div style={{
            ...styles.statusBox,
            background: status.type === "error" ? "#fef2f2" : "#f0fdf4",
            color:      status.type === "error" ? "#dc2626"  : "#16a34a",
            border:     `1px solid ${status.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          }}>
            {status.type === "error" ? "⚠️" : "✅"} {status.msg}
          </div>
        )}

        {/* Submit Button */}
        {!paid && (
          <button
            onClick={handleSubmitUTR}
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Activating…" : "I've Paid — Activate My Plan →"}
          </button>
        )}

        <p style={styles.secureNote}>
          🔒 Demo mode · Real payment integration coming soon
        </p>

        <p style={styles.secureNote}>
          🔒 Demo mode · Real payment integration coming soon
        </p>

        <button onClick={() => navigate("/pricing")} style={styles.backBtn}>
          ← Change Plan
        </button>

      </div>
    </div>
  );
}

const styles = {
  page:        { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f0fdfa,#e0f2fe)", padding: "24px" },
  card:        { background: "#fff", borderRadius: 20, padding: "36px 32px", maxWidth: 460, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.1)", textAlign: "center" },
  header:      { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 },
  logo:        { width: 34, height: 34, borderRadius: 8 },
  brand:       { fontSize: 20, fontWeight: 700, color: "#0f766e" },
  title:       { fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 6px" },
  sub:         { fontSize: 14, color: "#6b7280", marginBottom: 14 },
  demoNotice:  { background: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#854d0e", marginBottom: 18, lineHeight: 1.5, textAlign: "left" },
  planBadge:   { display: "flex", alignItems: "center", gap: 14, background: "#f0fdfa", border: "2px solid #99f6e4", borderRadius: 14, padding: "14px 18px", marginBottom: 20, textAlign: "left" },
  planIcon:    { fontSize: 32 },
  planName:    { fontSize: 14, fontWeight: 700, color: "#0f766e" },
  planPrice:   { fontSize: 24, fontWeight: 800, color: "#111827" },
  planPer:     { fontSize: 13, fontWeight: 400, color: "#6b7280" },
  stepsRow:    { display: "flex", justifyContent: "space-between", marginBottom: 20, gap: 4 },
  step:        { display: "flex", flexDirection: "column", alignItems: "center", flex: 1 },
  stepCircle:  { width: 28, height: 28, borderRadius: "50%", background: "#0d9488", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, marginBottom: 6 },
  stepLabel:   { fontSize: 11, color: "#6b7280", fontWeight: 600, textAlign: "center" },
  qrWrap:      { background: "#f8fafc", border: "2px dashed #cbd5e1", borderRadius: 16, padding: "20px 16px", marginBottom: 22 },
  qrImg:       { width: 200, height: 200, objectFit: "contain", borderRadius: 12, marginBottom: 10 },
  upiId:       { fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 },
  scanNote:    { fontSize: 12, color: "#9ca3af" },
  utrSection:  { marginBottom: 16, textAlign: "left" },
  utrLabel:    { fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 },
  utrHint:     { fontSize: 12, color: "#9ca3af", marginBottom: 8 },
  utrInput:    { width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 15, outline: "none", boxSizing: "border-box", letterSpacing: 1 },
  statusBox:   { borderRadius: 10, padding: "12px 16px", marginBottom: 14, fontSize: 14, textAlign: "left" },
  submitBtn:   { width: "100%", padding: "14px", background: "linear-gradient(135deg,#0d9488,#0891b2)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 },
  secureNote:  { fontSize: 12, color: "#9ca3af", marginBottom: 14 },
  backBtn:     { background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer", textDecoration: "underline" },
};