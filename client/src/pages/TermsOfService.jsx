import { useNavigate } from "react-router-dom";
import "../styles/Legal.css";

const sections = [
  { icon: "📋", title: "Acceptance of Terms", content: "By accessing or using QueueSync, you agree to be bound by these Terms of Service. These terms apply to all users including clinic administrators, staff, and patients accessing queue information. If you do not agree, please do not use the service." },
  { icon: "🏥", title: "Use of Service", content: "QueueSync is provided for lawful use by registered healthcare clinics and their patients. You agree not to submit false queue tokens, impersonate clinic staff, attempt to disrupt service availability, or use the platform for any purpose other than clinic queue management." },
  { icon: "🔑", title: "Clinic Accounts", content: "Clinic administrators are responsible for the security of their login credentials. You are liable for all activity under your account. QueueSync is not responsible for losses from unauthorised access due to failure to secure credentials. Notify us immediately at support@queuesync.in if you suspect a breach." },
  { icon: "💳", title: "Subscription & Payments", content: "Paid plans are billed monthly or annually as selected at signup. Subscriptions auto-renew unless cancelled before the renewal date. Refunds are at our discretion for unused periods. Patient-facing queue checking remains free at all times and is never subject to billing." },
  { icon: "🟢", title: "Service Availability", content: "We target 99.5% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance. QueueSync is not liable for business losses arising from temporary service unavailability." },
  { icon: "🚫", title: "Termination", content: "We reserve the right to suspend or terminate accounts that violate these terms without prior notice. Clinics may cancel their subscription at any time from their dashboard settings. Data export is available upon request for 30 days after termination." },
  { icon: "📬", title: "Contact", content: "For terms-related queries, contact us at legal@queuesync.in." },
];

export default function TermsOfService() {
  const navigate = useNavigate();
  return (
    <div className="legal-page">
      <div className="legal-hero lh-blue">
        <div className="lh-badge">Legal</div>
        <h1>Terms of Service</h1>
        <p className="lh-date">Last updated: March 1, 2025</p>
        <div className="lh-pills">
          <span>📋 Plain English</span>
          <span>🆓 Patients always free</span>
          <span>❌ Cancel anytime</span>
        </div>
      </div>
      <div className="legal-content">
        <div className="legal-intro-card">
          <span className="lic-icon">⚖️</span>
          <div><h3>Fair & Transparent</h3><p>These terms are written to be understood, not to confuse. We've kept them short and direct so you know exactly what you're agreeing to.</p></div>
        </div>
        <div className="legal-sections">
          {sections.map((s, i) => (
            <div key={i} className="legal-card">
              <div className="lc-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="lc-body">
                <h2><span className="lc-icon">{s.icon}</span>{s.title}</h2>
                <p>{s.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="legal-cta-row">
          <button className="legal-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <span className="legal-contact-note">Questions? <strong onClick={() => navigate("/contact")} style={{cursor:"pointer",color:"#0d9488"}}>Contact us →</strong></span>
        </div>
      </div>
    </div>
  );
}