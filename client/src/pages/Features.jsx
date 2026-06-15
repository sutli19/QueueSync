import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Pages.css";

/* ─── Only real, verified implemented features ─── */
const allFeatures = [
  {
    emoji: "🎫",
    title: "Automated Token Generation",
    desc: "The system instantly generates a sequential digital token for every patient and assigns them to the correct doctor queue automatically. Token numbers reset daily.",
    category: "Queue",
  },
  {
    emoji: "⏱️",
    title: "Wait Time Prediction",
    desc: "Calculates estimated waiting time using queue length × average consultation duration. The average is derived from today's completed consultations, with a 10-minute fallback if no data exists yet.",
    category: "Queue",
  },
  {
    emoji: "📡",
    title: "Real-Time Queue Updates",
    desc: "Live queue position refreshes every 60 seconds on both the clinic dashboard and the patient portal — no manual refresh needed.",
    category: "Queue",
  },
  {
    emoji: "🔄",
    title: "Daily Queue Reset",
    desc: "Queue token numbers reset automatically at the start of each day. All previous data is preserved in Patient Records and remains accessible for history and analytics.",
    category: "Queue",
  },
  {
    emoji: "📊",
    title: "Analytics Dashboard",
    desc: "View patient volume by day, week, month, or year. Includes revenue breakdown by charge type, male/female/other demographics, returning vs new patients, and average consultation time — all from your clinic's own data.",
    category: "Clinic",
  },
  {
    emoji: "🏥",
    title: "Multi-Doctor Support",
    desc: "Each doctor gets their own independent queue. Receptionist can assign patients to specific doctors with one click. Sub-doctors have their own scoped dashboard and live queue.",
    category: "Clinic",
  },
  {
    emoji: "🔐",
    title: "Role-Based Access",
    desc: "Doctor, Sub-Doctor, and Receptionist roles with separate dashboards and configurable permissions. Admin controls what each receptionist can see and do — queue, appointments, records, reports.",
    category: "Clinic",
  },
  {
    emoji: "💰",
    title: "Billing & Revenue Tracking",
    desc: "Add visit, injection, and medicine charges per patient. Revenue is tracked per session, visible in the Analytics Dashboard with a full charge-type breakdown. Pending bills are flagged automatically.",
    category: "Clinic",
  },
  {
    emoji: "📅",
    title: "Appointment Booking",
    desc: "Book and manage patient appointments by date and time. Duplicate slot protection prevents double-booking. Appointments can be marked Arrived to automatically add the patient into the live queue.",
    category: "Clinic",
  },
  {
    emoji: "📋",
    title: "Patient Records",
    desc: "Day-wise history of all patients with token number, consultation duration, billing details, and status. Searchable by name or mobile number with date filtering.",
    category: "Clinic",
  },
  {
    emoji: "🔍",
    title: "Public Clinic & Queue Portal",
    desc: "Patients can search any registered clinic, view live waiting count, estimated wait time, doctor availability, service charges, and clinic info — with no login required.",
    category: "Patient",
  },
  {
    emoji: "⭐",
    title: "Patient Reviews",
    desc: "Patients can rate and review their clinic experience directly from the public portal. Reviews are shown on the clinic's public page to help other patients make informed decisions.",
    category: "Patient",
  },
];

/* ─── Future scope ─── */
const futureScope = [
  {
    emoji: "📱",
    title: "Online Patient Self-Registration",
    desc: "Patients will be able to add themselves to the queue from their own phone — no receptionist action needed.",
  },
  {
    emoji: "💬",
    title: "SMS Notifications",
    desc: "Automatic SMS alerts sent to patients when their turn is approaching — reducing walkouts and no-shows.",
  },
  {
    emoji: "📲",
    title: "Mobile App",
    desc: "Dedicated iOS and Android apps for clinic staff and patients once the platform is deployed.",
  },
  {
    emoji: "🤖",
    title: "AI Peak Hour Detection",
    desc: "Machine learning to automatically detect busy hours and give staff advance warnings to optimize doctor availability.",
  },
];

const categories = ["All", "Patient", "Queue", "Clinic"];

export default function Features() {
  const navigate = useNavigate();
  const [active, setActive] = useState("All");

  const filtered =
    active === "All"
      ? allFeatures
      : allFeatures.filter((f) => f.category === active);

  return (
    <div className="page-wrapper">
      <div className="page-orb page-orb-tl" />
      <div className="page-orb page-orb-br" />

      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="section-eyebrow">Full Feature Set</div>
        <h1 className="page-title">Everything QueueSync Offers</h1>
        <p className="page-sub">
          Built for clinics that want to run smarter — every feature designed
          around real healthcare workflows.
        </p>
      </div>

      {/* ── Filter Bar ── */}
      <div className="feat-filter-bar">
        {categories.map((c) => (
          <button
            key={c}
            className={`filter-btn ${active === c ? "filter-active" : ""}`}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Features Grid ── */}
      <div className="full-feat-grid">
        {filtered.map((f, i) => (
          <div key={i} className="full-feat-card">
            <div className="ffc-icon">{f.emoji}</div>
            <span className="ffc-cat">{f.category}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Future Scope ── */}
      <div className="future-scope-section">
        <div className="future-scope-header">
          <div className="section-eyebrow">Roadmap</div>
          <h2 className="future-scope-title">Future Scope</h2>
          <p className="future-scope-sub">
            Features planned for upcoming releases — not yet implemented in the
            current version.
          </p>
        </div>
        <div className="future-scope-grid">
          {futureScope.map((f, i) => (
            <div key={i} className="future-scope-card">
              <div className="fsc-icon">{f.emoji}</div>
              <div className="fsc-soon-badge">Planned</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="page-cta-strip">
        <h2>Ready to get started?</h2>
        <p>Set up your clinic in under 10 minutes.</p>
        <button className="cta-solid" onClick={() => navigate("/signup")}>
          Register Your Clinic →
        </button>
      </div>
    </div>
  );
}