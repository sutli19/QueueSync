import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";
import logo from "../assets/logo.png";

function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Lowercase", ok: /[a-z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Special char", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return (
    <div className="pw-strength">
      <div className="pw-bar-wrap">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className={`pw-bar-seg ${i <= passed ? (passed <= 2 ? "weak" : passed <= 3 ? "fair" : "strong") : ""}`} />
        ))}
      </div>
      <div className="pw-checks">
        {checks.map((c, i) => (
          <span key={i} className={`pw-check ${c.ok ? "ok" : ""}`}>{c.ok ? "✓" : "○"} {c.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=security Q, 3=new password
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState({ msg: "", type: "" });
  const [loading, setLoading] = useState(false);

  const validatePassword = (pw) =>
    pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);

  /* Step 1 — fetch security question for email */
  const handleFetchQuestion = async () => {
    if (!email) { setStatus({ msg: "Please enter your email.", type: "error" }); return; }
    setLoading(true); setStatus({ msg: "", type: "" });
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus({ msg: data.message || "Email not found.", type: "error" }); setLoading(false); return; }
      setQuestion(data.question);
      setStep(2);
    } catch { setStatus({ msg: "Server not reachable.", type: "error" }); }
    setLoading(false);
  };

  /* Step 2 — verify answer */
  const handleVerifyAnswer = async () => {
    if (!answer.trim()) { setStatus({ msg: "Please enter your answer.", type: "error" }); return; }
    setLoading(true); setStatus({ msg: "", type: "" });
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answer: answer.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus({ msg: data.message || "Wrong answer.", type: "error" }); setLoading(false); return; }
      setStep(3);
    } catch { setStatus({ msg: "Server not reachable.", type: "error" }); }
    setLoading(false);
  };

  /* Step 3 — reset password */
  const handleReset = async () => {
    if (!validatePassword(newPassword)) { setStatus({ msg: "Password doesn't meet requirements.", type: "error" }); return; }
    if (newPassword !== confirmPassword) { setStatus({ msg: "Passwords don't match.", type: "error" }); return; }
    setLoading(true); setStatus({ msg: "", type: "" });
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answer: answer.toLowerCase().trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus({ msg: data.message || "Reset failed.", type: "error" }); setLoading(false); return; }
      setStatus({ msg: "Password reset! Redirecting to login…", type: "success" });
      setTimeout(() => navigate("/login"), 1500);
    } catch { setStatus({ msg: "Server not reachable.", type: "error" }); }
    setLoading(false);
  };

  const stepTitles = ["Find your account", "Verify your identity", "Set new password"];
  const stepSubs = ["Enter your registered email address", "Answer your security question", "Create a strong new password"];

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <div className="auth-mesh" />

      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <img src={logo} alt="QueueSync" className="auth-logo-img" />
          <span>QueueSync</span>
        </Link>

        <h1 className="auth-title">{stepTitles[step - 1]}</h1>
        <p className="auth-sub">{stepSubs[step - 1]}</p>

        {/* Step dots */}
        <div className="fp-steps">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`fp-dot ${step >= s ? "active" : ""} ${step > s ? "done" : ""}`}>
              {step > s ? "✓" : s}
            </div>
          ))}
        </div>

        <div className="auth-fields">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <div className="auth-field-wrap">
                <label>Registered Email</label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">✉️</span>
                  <input
                    type="email" placeholder="doctor@yourclinic.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetchQuestion()}
                  />
                </div>
              </div>
              {status.msg && <div className={`auth-status ${status.type}`}>{status.type === "error" ? "⚠️" : "✅"} {status.msg}</div>}
              <button className={`auth-btn ${loading ? "loading" : ""}`} onClick={handleFetchQuestion} disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Find My Account →"}
              </button>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <div className="fp-question-card">
                <span className="fpq-icon">🔐</span>
                <p className="fpq-label">Your security question:</p>
                <p className="fpq-text">{question}</p>
              </div>
              <div className="auth-field-wrap">
                <label>Your Answer</label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">✍️</span>
                  <input
                    type="text" placeholder="Enter your answer"
                    value={answer} onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyAnswer()}
                  />
                </div>
                <span className="auth-hint">Answers are case-insensitive</span>
              </div>
              {status.msg && <div className={`auth-status ${status.type}`}>{status.type === "error" ? "⚠️" : "✅"} {status.msg}</div>}
              <div className="auth-two-btns">
                <button className="auth-btn-ghost" onClick={() => { setStep(1); setStatus({ msg: "", type: "" }); }}>← Back</button>
                <button className={`auth-btn ${loading ? "loading" : ""}`} onClick={handleVerifyAnswer} disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : "Verify →"}
                </button>
              </div>
            </>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <>
              <div className="auth-field-wrap">
                <label>New Password</label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showPass ? "text" : "password"} placeholder="Create new password"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button className="auth-eye" type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {newPassword && <PasswordStrength password={newPassword} />}
              </div>
              <div className="auth-field-wrap">
                <label>Confirm New Password</label>
                <div className="auth-input-box">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type="password" placeholder="Re-enter new password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {confirmPassword && (
                  <span className={`pw-match ${newPassword === confirmPassword ? "ok" : "no"}`}>
                    {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                  </span>
                )}
              </div>
              {status.msg && <div className={`auth-status ${status.type}`}>{status.type === "error" ? "⚠️" : "✅"} {status.msg}</div>}
              <button className={`auth-btn ${loading ? "loading" : ""}`} onClick={handleReset} disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Reset Password →"}
              </button>
            </>
          )}
        </div>

        <p className="auth-switch-text" style={{ marginTop: "16px" }}>
          Remember your password?{" "}
          <Link to="/login" className="auth-switch-link">Log in →</Link>
        </p>
      </div>
    </div>
  );
}