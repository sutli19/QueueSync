import "../styles/Pages.css";

const changelog = [
  {
    version: "v1.2.0",
    date: "February 2026",
    tag: "Latest",
    changes: [
      { type: "new",  text: "Demo dashboard preview section added to homepage" },
      { type: "new",  text: "Pricing page with Basic, Pro, and Polyclinic tiers" },
      { type: "new",  text: "Contact Us form with success state" },
      { type: "new",  text: "About page with mission and team section" },
      { type: "fix",  text: "Navbar smooth scroll now works for Features, How it Works, Contact Us" },
      { type: "fix",  text: "Queue update timer corrected to 1 minute (was 3 minutes)" },
      { type: "ui",   text: "Premium glassmorphism redesign across all sections" },
      { type: "ui",   text: "Animated stats counter band on scroll" },
      { type: "ui",   text: "Testimonials section with star ratings added" },
    ]
  },
  {
    version: "v1.1.0",
    date: "January 2026",
    tag: "Stable",
    changes: [
      { type: "new",  text: "Add Walk-In Patient feature from clinic dashboard" },
      { type: "new",  text: "Mark patient as Done from live queue" },
      { type: "new",  text: "Today's stats endpoint integrated (completed / waiting counts)" },
      { type: "fix",  text: "JWT token expiry handled gracefully on dashboard" },
      { type: "ui",   text: "Dashboard card layout improved" },
    ]
  },
  {
    version: "v1.0.0",
    date: "December 2025",
    tag: "Initial Release",
    changes: [
      { type: "new",  text: "Project setup with React + Vite frontend" },
      { type: "new",  text: "Node.js + Express backend with MongoDB" },
      { type: "new",  text: "Doctor and Receptionist role-based login" },
      { type: "new",  text: "Patient registration and token generation" },
      { type: "new",  text: "Live queue display with waiting count" },
      { type: "new",  text: "Basic estimated wait time calculation" },
      { type: "ui",   text: "Initial homepage with Hero, Features, How It Works sections" },
    ]
  },
];

const tagColor = { new: "cl-new", fix: "cl-fix", ui: "cl-ui" };
const tagLabel = { new: "New", fix: "Fix", ui: "UI" };

export default function Changelog() {
  return (
    <div className="page-wrapper">
      <div className="page-orb page-orb-tl" />

      <div className="page-hero">
        <div className="section-eyebrow">What's New</div>
        <h1 className="page-title">Changelog</h1>
        <p className="page-sub">Every improvement, fix, and new feature — documented clearly.</p>
      </div>

      <div className="changelog-list">
        {changelog.map((release, i) => (
          <div key={i} className="cl-release">
            <div className="cl-release-header">
              <div className="cl-version-wrap">
                <span className="cl-version">{release.version}</span>
                {release.tag === "Latest" && <span className="cl-latest-badge">Latest</span>}
              </div>
              <span className="cl-date">{release.date}</span>
            </div>
            <div className="cl-items">
              {release.changes.map((c, j) => (
                <div key={j} className="cl-item">
                  <span className={`cl-tag ${tagColor[c.type]}`}>{tagLabel[c.type]}</span>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}