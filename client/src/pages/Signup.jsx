import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";
import logo from "../assets/logo.png";

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your first school?",
  "What is your favourite childhood memory?",
  "What was your childhood nickname?",
  "What is the name of the street you grew up on?",
];

function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters",     ok: password.length >= 8 },
    { label: "Uppercase letter",  ok: /[A-Z]/.test(password) },
    { label: "Lowercase letter",  ok: /[a-z]/.test(password) },
    { label: "Number",            ok: /[0-9]/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return (
    <div className="pw-strength">
      <div className="pw-bar-wrap">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`pw-bar-seg ${
              i <= passed
                ? passed <= 2 ? "weak" : passed <= 3 ? "fair" : "strong"
                : ""
            }`}
          />
        ))}
      </div>
      <div className="pw-checks">
        {checks.map((c, i) => (
          <span key={i} className={`pw-check ${c.ok ? "ok" : ""}`}>
            {c.ok ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    doctorName: "",
    clinicName: "",
    mobile: "",
    address: "",
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: "",
    clinicType: "single",  // ← NEW
  });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status,  setStatus]  = useState({ msg: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validatePassword = (pw) =>
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw);

  const handleStep1 = () => {
    if (!form.email || !form.password || !form.confirmPassword) {
      setStatus({ msg: "Please fill in all fields.", type: "error" }); return;
    }
    if (!validatePassword(form.password)) {
      setStatus({ msg: "Password doesn't meet the requirements.", type: "error" }); return;
    }
    if (form.password !== form.confirmPassword) {
      setStatus({ msg: "Passwords do not match.", type: "error" }); return;
    }
    setStatus({ msg: "", type: "" });
    setStep(2);
  };

  const handleSignup = async () => {
    if (!form.doctorName || !form.clinicName || !form.mobile || !form.address) {
      setStatus({ msg: "Please fill in all clinic details.", type: "error" }); return;
    }
    if (!form.securityAnswer.trim()) {
      setStatus({ msg: "Please provide an answer to your security question.", type: "error" }); return;
    }
    setLoading(true);
    setStatus({ msg: "", type: "" });

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:            form.email,
          password:         form.password,
          doctorName:       form.doctorName,
          clinicName:       form.clinicName,
          mobile:           form.mobile,
          address:          form.address,
          securityQuestion: form.securityQuestion,
          securityAnswer:   form.securityAnswer.toLowerCase().trim(),
          clinicType:       form.clinicType,  // ← NEW
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ msg: data.message || "Signup failed.", type: "error" });
        setLoading(false);
        return;
      }

      setStatus({ msg: "Account created! Redirecting to login…", type: "success" });
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setStatus({ msg: "Server not reachable. Try again.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-signup">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <div className="auth-mesh" />

      <div className="auth-card auth-card-wide">
        <Link to="/" className="auth-brand">
          <img src={logo} alt="QueueSync" className="auth-logo-img" />
          <span>QueueSync</span>
        </Link>

        <h1 className="auth-title">Create Clinic Account</h1>
        <p className="auth-sub">Register as a doctor to start managing your queue</p>

        {/* Step indicator */}
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? "done" : ""}`}>
            <div className="as-circle">{step > 1 ? "✓" : "1"}</div>
            <span>Account</span>
          </div>
          <div className={`as-line ${step >= 2 ? "done" : ""}`} />
          <div className={`auth-step ${step >= 2 ? "done" : ""}`}>
            <div className="as-circle">2</div>
            <span>Clinic Info</span>
          </div>
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="auth-fields">
            <div className="auth-field-wrap">
              <label>Email Address</label>
              <div className="auth-input-box">
                <span className="auth-input-icon">✉️</span>
                <input
                  name="email" type="email"
                  placeholder="doctor@yourclinic.com"
                  value={form.email} onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-field-wrap">
              <label>Password</label>
              <div className="auth-input-box">
                <span className="auth-input-icon">🔒</span>
                <input
                  name="password" type={showPass ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password} onChange={handleChange}
                />
                <button className="auth-eye" type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {form.password && <PasswordStrength password={form.password} />}
            </div>

            <div className="auth-field-wrap">
              <label>Confirm Password</label>
              <div className="auth-input-box">
                <span className="auth-input-icon">🔒</span>
                <input
                  name="confirmPassword" type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword} onChange={handleChange}
                />
                <button className="auth-eye" type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
              {form.confirmPassword && (
                <span className={`pw-match ${form.password === form.confirmPassword ? "ok" : "no"}`}>
                  {form.password === form.confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                </span>
              )}
            </div>

            {status.msg && (
              <div className={`auth-status ${status.type}`}>
                {status.type === "error" ? "⚠️" : "✅"} {status.msg}
              </div>
            )}

            <button className="auth-btn" onClick={handleStep1}>
              Continue → Clinic Info
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="auth-fields">

            {/* ── Clinic Type Selector (NEW) ── */}
            <div className="auth-field-wrap" style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".4px", color: "#4b5563", marginBottom: 8, display: "block" }}>
                Clinic Type
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  {
                    value: "single",
                    icon: "🏥",
                    title: "Single Doctor",
                    desc: "Just you — simple queue management",
                  },
                  {
                    value: "polyclinic",
                    icon: "🏨",
                    title: "Polyclinic / Multi-Doctor",
                    desc: "Multiple doctors, shared queue",
                  },
                ].map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setForm({ ...form, clinicType: opt.value })}
                    style={{
                      border: `2px solid ${form.clinicType === opt.value ? "#0d9488" : "#e5e7eb"}`,
                      borderRadius: 12,
                      padding: "14px 16px",
                      cursor: "pointer",
                      background: form.clinicType === opt.value ? "rgba(13,148,136,.07)" : "rgba(249,250,251,.8)",
                      transition: "all .18s",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{opt.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: form.clinicType === opt.value ? "#0f766e" : "#374151" }}>
                      {opt.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                      {opt.desc}
                    </div>
                    {form.clinicType === opt.value && (
                      <div style={{ marginTop: 8, fontSize: 13, color: "#0d9488", fontWeight: 700 }}>✓ Selected</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="signup-two-col">
              <div className="auth-field-wrap">
                <label>Doctor Name</label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">👨‍⚕️</span>
                  <input name="doctorName" type="text" placeholder="Dr. Full Name" value={form.doctorName} onChange={handleChange} />
                </div>
              </div>
              <div className="auth-field-wrap">
                <label>Clinic Name</label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">🏥</span>
                  <input name="clinicName" type="text" placeholder="Your Clinic Name" value={form.clinicName} onChange={handleChange} />
                </div>
              </div>
              <div className="auth-field-wrap">
                <label>Mobile Number</label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">📱</span>
<input name="mobile" type="tel" placeholder="10-digit mobile" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value.replace(/\D/g,"").slice(0,10)})} inputMode="numeric" maxLength={10} />                </div>
              </div>
              <div className="auth-field-wrap">
                <label>Clinic Address</label>
                <div className="auth-input-box auth-textarea-box">
                  <span className="auth-input-icon" style={{ paddingTop: "12px" }}>📍</span>
                  <textarea name="address" placeholder="Full clinic address" value={form.address} onChange={handleChange} rows={3} />
                </div>
              </div>
            </div>

            {/* Security Question */}
            <div className="auth-security-block">
              <div className="asb-header">
                <span>🔐</span>
                <div>
                  <h4>Security Question</h4>
                  <p>Used to recover your account if you forget your password</p>
                </div>
              </div>
              <div className="auth-field-wrap">
                <label>Choose a question</label>
                <div className="auth-input-box auth-select-box">
                  <span className="auth-input-icon">❓</span>
                  <select name="securityQuestion" value={form.securityQuestion} onChange={handleChange}>
                    {SECURITY_QUESTIONS.map((q, i) => (
                      <option key={i} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="auth-field-wrap">
                <label>Your Answer</label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">✍️</span>
                  <input
                    name="securityAnswer" type="text"
                    placeholder="Answer (case-insensitive)"
                    value={form.securityAnswer} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {status.msg && (
              <div className={`auth-status ${status.type}`}>
                {status.type === "error" ? "⚠️" : "✅"} {status.msg}
              </div>
            )}

            <div className="auth-two-btns">
              <button className="auth-btn-ghost" onClick={() => { setStep(1); setStatus({ msg: "", type: "" }); }}>
                ← Back
              </button>
              <button
                className={`auth-btn ${loading ? "loading" : ""}`}
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? <span className="auth-spinner" /> : "Create Account →"}
              </button>
            </div>
          </div>
        )}

        <p className="auth-switch-text" style={{ marginTop: "20px" }}>
          Already have an account?{" "}
          <Link to="/login" className="auth-switch-link">Log in →</Link>
        </p>
      </div>
    </div>
  );
}