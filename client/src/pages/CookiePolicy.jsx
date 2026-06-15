import { useNavigate } from "react-router-dom";
import "../styles/Legal.css";

const cookies = [
  { name: "qs_session",   purpose: "Maintains clinic admin login session",         duration: "24 hours" },
  { name: "qs_clinic_id", purpose: "Remembers which clinic dashboard is active",   duration: "30 days"  },
  { name: "qs_theme",     purpose: "Stores your UI preference (light/dark)",        duration: "1 year"   },
];

const sections = [
  { icon: "🍪", title: "What Are Cookies?", content: "Cookies are small text files stored on your device when you visit a website. They help websites remember preferences and maintain session state across page loads. QueueSync uses cookies only where strictly necessary to provide core functionality." },
  { icon: "🚫", title: "Cookies We Never Use", content: "QueueSync does NOT use advertising cookies, cross-site tracking cookies, or third-party analytics tools like Google Analytics or Facebook Pixel. Your browsing behaviour within QueueSync is never shared with any external advertising platform." },
  { icon: "👤", title: "Patient-Facing Pages", content: "The patient queue checking interface requires no login and uses zero persistent cookies. Queue lookups are stateless and anonymous by design — patients can check their queue without any data being stored on their device." },
  { icon: "⚙️", title: "Managing Cookies", content: "You can control or delete cookies through your browser settings. Disabling cookies on clinic dashboard pages will prevent you from staying logged in. Patient-facing queue pages continue to function fully without any cookies enabled." },
  { icon: "📬", title: "Contact", content: "Questions about our cookie use? Email us at privacy@queuesync.in." },
];

export default function CookiePolicy() {
  const navigate = useNavigate();
  return (
    <div className="legal-page">
      <div className="legal-hero lh-warm">
        <div className="lh-badge">Legal</div>
        <h1>Cookie Policy</h1>
        <p className="lh-date">Last updated: March 1, 2025</p>
        <div className="lh-pills">
          <span>🍪 Only 3 cookies total</span>
          <span>🚫 No ad trackers</span>
          <span>👤 Patients cookie-free</span>
        </div>
      </div>
      <div className="legal-content">
        <div className="legal-intro-card">
          <span className="lic-icon">✋</span>
          <div><h3>We use the bare minimum</h3><p>Just 3 cookies — all functional, none tracking. Here's exactly what they are and why they exist.</p></div>
        </div>

        {/* Cookie Table */}
        <div className="cookie-table-wrap">
          <h3 className="ct-heading">Cookies We Set</h3>
          <div className="cookie-table">
            <div className="ct-row ct-header">
              <span>Cookie</span><span>Purpose</span><span>Duration</span>
            </div>
            {cookies.map((c, i) => (
              <div key={i} className="ct-row">
                <span><code>{c.name}</code></span>
                <span>{c.purpose}</span>
                <span className="ct-duration">{c.duration}</span>
              </div>
            ))}
          </div>
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