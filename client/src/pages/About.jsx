import { useNavigate } from "react-router-dom";
import "../styles/Pages.css";

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="page-wrapper">
      <div className="page-orb page-orb-tl" />
      <div className="page-orb page-orb-br" />

      <div className="page-hero">
        <div className="section-eyebrow">Our Story</div>
        <h1 className="page-title">About QueueSync</h1>
        <p className="page-sub">Built by a student who sat in a clinic waiting room for 2 hours not knowing when their turn would come.</p>
      </div>

      {/* Mission */}
      <div className="about-mission">
        <div className="am-text">
          <h2>The Problem We Solve</h2>
          <p>
            Walk into any small clinic in India — you'll find patients sitting with numbered paper tokens, no idea how many people are ahead, and no estimate of when they'll be seen. It's 2026 and clinics are still running on notepads.
          </p>
          <p>
            QueueSync was built to change this. We give clinics a digital queue system that takes 10 minutes to set up and costs less than a daily cup of chai to run.
          </p>
        </div>

      </div>

      {/* Values */}
      <div className="about-values">
        <h2 className="section-title" style={{textAlign:"center", marginBottom:"40px"}}>What We Stand For</h2>
        <div className="values-grid">
          {[
            { emoji: "🎯", title: "Simplicity First",   desc: "If a clinic receptionist can't use it in 5 minutes, we redesign it. Complexity is the enemy." },
            { emoji: "⚡", title: "Real-Time Always",   desc: "A queue system that updates every 5 minutes is not real-time. We refresh every 60 seconds." },
            { emoji: "💚", title: "Healthcare Focused", desc: "Every feature we build starts with one question: does this help patients or clinic staff?" },
            { emoji: "📈", title: "Data Driven",        desc: "Gut feeling isn't analytics. We give clinics real data to make smarter decisions every day." },
          ].map((v, i) => (
            <div key={i} className="value-card">
              <span>{v.emoji}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="about-team">
        <h2 className="section-title" style={{textAlign:"center", marginBottom:"12px"}}>The Builder</h2>
        <p className="section-sub" style={{textAlign:"center", marginBottom:"40px"}}>QueueSync is a final year B.Sc. Computer Science project from Mumbai.</p>
        <div className="team-card-solo">
          <div className="tc-avatar-large">👩‍💻</div>
          <div>
            <strong>Sweety Jaiswal</strong>
            <span>Developer & Designer · T.Y.B.Sc. Computer Science, Sem VI</span>
            <p>Built QueueSync to solve a real problem in Indian healthcare. Stack: React, Node.js, Express, MongoDB.</p>
          </div>
        </div>
      </div>

      <div className="page-cta-strip">
        <h2>Want to join the mission?</h2>
        <p>Register your clinic for free and be part of smarter healthcare.</p>
        <button className="cta-solid" onClick={() => navigate("/signup")}>Get Started →</button>
      </div>
    </div>
  );
}