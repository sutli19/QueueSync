import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState("doctor");
  const [form, setForm]         = useState({ identifier: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus]     = useState({ msg: "", type: "" });
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    if (!form.identifier || !form.password) {
      setStatus({ msg: "Please fill in all fields.", type: "error" });
      return;
    }
    setLoading(true);
    setStatus({ msg: "", type: "" });

    try {
      const body =
        tab === "doctor"
          ? { email: form.identifier, password: form.password }
          : { username: form.identifier, password: form.password };

      const res  = await fetch("https://queuesync.onrender.com/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ msg: data.message || "Login failed.", type: "error" });
        setLoading(false);
        return;
      }

      /* ── Persist to localStorage ── */
      localStorage.setItem("token",      data.token);
      localStorage.setItem("role",       data.role);
      localStorage.setItem("doctorName", data.name || data.doctorName || "");
      localStorage.setItem("clinicName", data.clinicName || "");
      localStorage.setItem("clinicType", data.clinicType || "single");

      if (data.permissions) {
        localStorage.setItem("permissions", JSON.stringify(data.permissions));
      }
      if (data.subDoctorId) {
        localStorage.setItem("subDoctorId", data.subDoctorId);
      }
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
      }

      setStatus({ msg: "Login successful! Redirecting…", type: "success" });

      setTimeout(async () => {

        // Sub-doctor and receptionist skip payment check
        if (data.role === "sub_doctor") {
          navigate("/dashboard");
          return;
        }
        if (data.role === "receptionist") {
          navigate("/reception");
          return;
        }

        // Doctor — check subscription status
        if (data.role === "doctor") {
          try {
            const subRes = await fetch("https://queuesync.onrender.com/api/payment/status", {
              headers: { "Authorization": `Bearer ${data.token}` },
            });
            const subData = await subRes.json();

            if (subData.active) {
              navigate("/dashboard");
            } else {
              navigate("/pricing");
            }
          } catch {
            // If check fails don't block the doctor
            navigate("/dashboard");
          }
          return;
        }

        navigate("/");
      }, 700);

    } catch {
      setStatus({ msg: "Server not reachable. Is the backend running?", type: "error" });
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  const switchTab = (newTab) => {
    setTab(newTab);
    setForm({ identifier: "", password: "" });
    setStatus({ msg: "", type: "" });
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <div className="auth-mesh" />

      <div className="auth-card" onKeyDown={handleKeyDown}>
        <Link to="/" className="auth-brand">
          <img src={logo} alt="QueueSync" className="auth-logo-img" />
          <span>QueueSync</span>
        </Link>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to manage your clinic queue</p>

        {/* ── Tabs ── */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "doctor" ? "active" : ""}`}
            onClick={() => switchTab("doctor")}
          >
            <span className="tab-icon">👨‍⚕️</span> Doctor
          </button>
          <button
            className={`auth-tab ${tab === "sub_doctor" ? "active" : ""}`}
            onClick={() => switchTab("sub_doctor")}
          >
            <span className="tab-icon">🩺</span> Sub-Doctor
          </button>
          <button
            className={`auth-tab ${tab === "receptionist" ? "active" : ""}`}
            onClick={() => switchTab("receptionist")}
          >
            <span className="tab-icon">🖥️</span> Receptionist
          </button>
        </div>

        {/* ── Fields ── */}
        <div className="auth-fields">
          <div className="auth-field-wrap">
            <label>
              {tab === "doctor" ? "Email Address" : "User ID"}
            </label>
            <div className="auth-input-box">
              <span className="auth-input-icon">
                {tab === "doctor" ? "✉️" : "🪪"}
              </span>
              <input
                name="identifier"
                type={tab === "doctor" ? "email" : "text"}
                placeholder={
                  tab === "doctor"
                    ? "doctor@clinic.com"
                    : "Enter your User ID"
                }
                value={form.identifier}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="auth-field-wrap">
            <label>Password</label>
            <div className="auth-input-box">
              <span className="auth-input-icon">🔒</span>
              <input
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                className="auth-eye"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
                type="button"
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
        </div>

        {status.msg && (
          <div className={`auth-status ${status.type}`}>
            {status.type === "error" ? "⚠️" : "✅"} {status.msg}
          </div>
        )}

        <button
          className={`auth-btn ${loading ? "loading" : ""}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <span className="auth-spinner" /> : "Login →"}
        </button>

        <div className="auth-footer-links">
          {tab === "doctor" && (
            <Link to="/forgot-password" className="auth-forgot">
              Forgot password?
            </Link>
          )}
          <p className="auth-switch-text">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-switch-link">
              Register your clinic →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}