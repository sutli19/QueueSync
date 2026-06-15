import { useNavigate } from "react-router-dom";
import "../styles/Pages.css";

const OPENINGS = [
  {
    title: "Frontend Developer (React)",
    type: "Internship · Remote",
    dept: "Engineering",
    desc: "Help build the next version of QueueSync's patient-facing interface. You'll work on real-time UI components, queue tracking views, and mobile responsiveness.",
    skills: ["React", "CSS", "REST APIs"],
  },
  {
    title: "Backend Developer (Node.js)",
    type: "Internship · Remote",
    dept: "Engineering",
    desc: "Work on the core queue engine, WebSocket integration, and MongoDB schemas. You'll directly impact how thousands of patients experience wait times.",
    skills: ["Node.js", "Express", "MongoDB", "WebSockets"],
  },
  {
    title: "Healthcare Partnerships Intern",
    type: "Internship · Mumbai",
    dept: "Growth",
    desc: "Connect with clinics across Mumbai to onboard them to QueueSync. Understand their pain points and help shape our product roadmap.",
    skills: ["Communication", "Healthcare Knowledge", "Excel"],
  },
];

export default function Careers() {
  const navigate = useNavigate();
  return (
    <div className="page-wrapper">
      <div className="page-orb page-orb-tl" />
      <div className="page-orb page-orb-br" />

      <div className="page-hero">
        <div className="section-eyebrow">Join Us</div>
        <h1 className="page-title">Careers at QueueSync</h1>
        <p className="page-sub">
          We're a small team building something meaningful for India's healthcare system. If that excites you, read on.
        </p>
      </div>

      <div className="careers-intro">
        <div className="ci-card">
          <span className="ci-icon">🎯</span>
          <h3>Mission-Driven Work</h3>
          <p>Every line of code you write directly reduces wait times for real patients in real clinics.</p>
        </div>
        <div className="ci-card">
          <span className="ci-icon">🚀</span>
          <h3>Early Stage</h3>
          <p>You won't be a cog in a machine. You'll own features, make decisions, and see your work go live fast.</p>
        </div>
        <div className="ci-card">
          <span className="ci-icon">💻</span>
          <h3>Modern Stack</h3>
          <p>React, Node.js, MongoDB, WebSockets. No legacy systems. No bureaucracy. Just build.</p>
        </div>
      </div>

      <div className="careers-openings">
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: "40px" }}>
          Open Positions
        </h2>
        {OPENINGS.map((job, i) => (
          <div key={i} className="job-card">
            <div className="job-left">
              <div className="job-dept">{job.dept}</div>
              <h3>{job.title}</h3>
              <p className="job-type">{job.type}</p>
              <p className="job-desc">{job.desc}</p>
              <div className="job-skills">
                {job.skills.map((s, j) => (
                  <span key={j} className="job-skill">{s}</span>
                ))}
              </div>
            </div>
            <button className="btn-solid-teal job-apply-btn">Apply Now →</button>
          </div>
        ))}
      </div>

      <div className="page-cta-strip">
        <h2>Don't see a fit? Write to us anyway.</h2>
        <p>We're always open to meeting motivated people who care about healthcare.</p>
        <button className="cta-solid" onClick={() => navigate("/contact")}>Contact Us →</button>
      </div>
    </div>
  );
}