import { useNavigate } from "react-router-dom";
import "../styles/Legal.css";

const sections = [
  { icon: "🔍", title: "Information We Collect", content: "QueueSync collects only what's needed to operate the service. For clinics: name, contact details, and operational data like queue records and consultation times. For patients: no account required — we collect only anonymised queue interaction data such as token number and estimated wait time." },
  { icon: "⚙️", title: "How We Use Your Information", content: "Clinic data powers your dashboard — queue management, analytics, and operational insights. Patient data is used solely to estimate wait times and manage queue position. We do not sell, rent, or share your data with any third party under any circumstance." },
  { icon: "🔒", title: "Data Storage & Security", content: "All data lives on secure cloud infrastructure with TLS encryption in transit and AES-256 encryption at rest. Clinic passwords are hashed using bcrypt and never stored in plain text. Patient queue data is automatically purged at end of each clinic day unless retained for analytics with explicit clinic consent." },
  { icon: "🍪", title: "Cookies", content: "We use minimal cookies strictly for session management and authentication. No advertising cookies. No third-party trackers. You can disable cookies in your browser — though this may affect login functionality for clinic dashboards. Patient-facing queue pages work entirely without cookies." },
  { icon: "✅", title: "Your Rights", content: "You have the right to access, correct, export, or permanently delete your data at any time. Clinics can request a full data export or account deletion by emailing privacy@queuesync.in. We respond within 7 business days." },
  { icon: "📬", title: "Contact", content: "For any privacy-related queries, reach us at privacy@queuesync.in. We're committed to responding within 48 hours on business days." },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="lh-badge">Legal</div>
        <h1>Privacy Policy</h1>
        <p className="lh-date">Last updated: March 1, 2025</p>
        <div className="lh-pills">
          <span>🔒 Data never sold</span>
          <span>⚡ 48hr response</span>
          <span>🇮🇳 India-based storage</span>
        </div>
      </div>
      <div className="legal-content">
        <div className="legal-intro-card">
          <span className="lic-icon">🛡️</span>
          <div><h3>Our Commitment</h3><p>This policy explains exactly what we collect, why we collect it, and what we never do with it. No legal maze — just plain English.</p></div>
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