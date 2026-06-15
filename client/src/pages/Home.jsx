import { useNavigate } from "react-router-dom";
import doctor from "../assets/doctor.png";
import "../styles/Hero.css";

const features = [
  { emoji: "🎫", title: "Automated Token Generation", desc: "Every patient gets a sequential digital token instantly — assigned to the right doctor queue automatically, no manual work needed.", badge: "Smart"  },
  { emoji: "⏱️", title: "Wait Time Prediction",       desc: "Calculates estimated wait using queue length × avg consultation time, derived from today's real data. Updated every minute.",       badge: "Live"   },
  { emoji: "📊", title: "Analytics Dashboard",        desc: "Patient volume, revenue breakdown, demographics, and consultation times — all from your clinic's own data, in one view.",          badge: "Live"   },
  { emoji: "🔐", title: "Role-Based Access",          desc: "Doctor, Sub-Doctor, and Receptionist roles with separate dashboards. Admin controls exactly what each staff member can access.",    badge: "Secure" },
];

const steps = [
  { num: "01", title: "Add Patient",      desc: "Receptionist adds the patient to the queue — name, mobile, and preferred doctor. Token is assigned instantly.", emoji: "🖥️" },
  { num: "02", title: "Get Token",        desc: "System issues a sequential digital token with estimated wait time and live queue position.",                     emoji: "🎫" },
  { num: "03", title: "Track Live",       desc: "Patient checks their live queue position anytime from the public web portal — no login needed.",                emoji: "📡" },
  { num: "04", title: "Consult Smoothly", desc: "Doctor calls the next token. Staff marks consultation done, queue updates automatically.",                      emoji: "✅" },
];

const testimonials = [
  { name: "Rahul Mehta",    role: "Clinic Manager, HealthFirst Clinic",  quote: "The analytics dashboard alone is worth it. We spotted our busiest hours in the first week and adjusted staff accordingly.", stars: 5, avatar: "👨‍💼" },
  { name: "Sneha Patil",    role: "Receptionist, CarePoint Clinic",       quote: "Adding patients and managing the queue used to take forever. Now it takes seconds. Our waiting area is so much calmer.",      stars: 5, avatar: "👩‍💼" },
  { name: "Vikram Desai",   role: "Clinic Owner, Desai Medical Centre",   quote: "We run three doctors simultaneously. Each has their own queue and the system handles everything — no confusion at all.",    stars: 5, avatar: "🧑‍💼" },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="hero" id="home">
        <div className="hero-overlay-a" />
        <div className="hero-overlay-b" />
        <div className="hero-mesh" />
        <div className="orb orb-tl" /><div className="orb orb-tr" /><div className="orb orb-br" />
        {["fi1","fi2","fi3","fi4","fi5"].map(c => <div key={c} className={`ficon ${c}`}>✚</div>)}
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-pill"><span className="pill-dot" /><span>Live · Real-Time Queue Management</span></div>
            <h1 className="hero-heading">
              Real-Time<br />Doctor Queue<br />
              <span className="heading-gradient">&amp; Waiting Time</span>
            </h1>
            <p className="hero-sub">Check live queue status, reduce waiting times, and manage clinic flow efficiently with QueueSync.</p>
            <div className="hero-ctas">
              <button className="cta-solid" onClick={() => navigate("/patient-queue")}><span>⏱</span> Check Waiting Time</button>
              <button className="cta-ghost" onClick={() => navigate("/signup")}>Register Your Clinic <span className="cta-arrow">→</span></button>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-halo" /><div className="hero-ring" />
            <img src={doctor} alt="Doctor" className="hero-doc" />
            <div className="hw hw-queue"><span className="hw-emoji">🎫</span><div><strong>Token #47</strong><span>Your turn is next</span></div></div>
            <div className="hw hw-doc"><span className="hw-status" /><div><strong>Dr. Sarah Chen</strong><span>Available · 3 min</span></div></div>
            <div className="hw hw-count"><span>👥</span><div><strong>12 patients</strong><span>in queue today</span></div></div>
          </div>
        </div>
        <div className="hero-scroll-hint"><div className="scroll-mouse"><div className="scroll-wheel" /></div><span>Scroll to explore</span></div>
      </section>

      {/* ═══ AUDIENCE ═══ */}
      <section className="aud-section">
        <div className="aud-blob aud-blob-l" /><div className="aud-blob aud-blob-r" /><div className="aud-dots" />
        <div className="aud-grid">
          <div className="aud-card ac-patients">
            <div className="ac-shimmer" /><div className="ac-top-accent" />
            <div className="ac-body">
              <div className="ac-icon-ring ac-ir-green"><span>👤</span></div>
              <div className="ac-text">
                <span className="ac-eyebrow">For Patients</span>
                <h2>View live queue status</h2>
                <p>Check your estimated wait before leaving home. No wasted trips. No crowded lobbies.</p>
                <ul className="ac-perks">
                  <li><span>✓</span> Real-time position updates</li>
                  <li><span>✓</span> Web portal, no login needed</li>
                  <li><span>✓</span> Works on any device</li>
                </ul>
                <button className="btn-solid-teal" onClick={() => navigate("/patient-queue")}>Check Waiting Time →</button>
              </div>
            </div>
            <div className="ac-stat-bar"><span>⏱ Queue updates every 1 minute</span></div>
          </div>
          <div className="aud-card ac-clinics">
            <div className="ac-shimmer" /><div className="ac-top-accent ac-accent-dark" />
            <div className="ac-body">
              <div className="ac-icon-ring ac-ir-teal"><span>🏥</span></div>
              <div className="ac-text">
                <span className="ac-eyebrow">For Clinics</span>
                <h2>Manage patient queues</h2>
                <p>Automated tokens, real-time tracking, and smart flow management — in one dashboard.</p>
                <ul className="ac-perks">
                  <li><span>✓</span> Automated token generation</li>
                  <li><span>✓</span> Multi-doctor support</li>
                  <li><span>✓</span> Analytics &amp; reporting</li>
                </ul>
                <button className="btn-outline-teal" onClick={() => navigate("/signup")}>Register Your Clinic →</button>
              </div>
            </div>
            <div className="ac-stat-bar"><span>🏥 2,400+ clinics already onboarded</span></div>
          </div>
        </div>
      </section>

      {/* ═══ WAVE DOWN ═══ */}
      <div className="wave-down">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C480,80 960,0 1440,40 L1440,80 L0,80Z" fill="#f0fdf9" />
        </svg>
      </div>

      {/* ═══ KEY FEATURES ═══ */}
      <section className="feat-section" id="features">
        <div className="feat-blob-tl" /><div className="feat-blob-br" />
        <div className="feat-inner">
          <div className="section-eyebrow">Why QueueSync</div>
          <h2 className="section-title">Key Features</h2>
          <p className="section-sub">Discover the benefits of using QueueSync for efficient queue management in healthcare.</p>
          <div className="feat-grid">
            {features.map((f, i) => (
              <div key={i} className="feat-card" style={{ "--delay": `${i * 0.1}s` }}>
                <div className="fc-header"><div className="fc-icon">{f.emoji}</div><span className="fc-badge">{f.badge}</span></div>
                <h3>{f.title}</h3><p>{f.desc}</p><div className="fc-bottom-bar" />
              </div>
            ))}
          </div>
          <button className="btn-explore" onClick={() => navigate("/features")}>Explore All Features <span className="explore-arr">→</span></button>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="how-section" id="how-it-works">
        <div className="how-blob" />
        <div className="section-eyebrow">The Process</div>
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">From registration to consultation — QueueSync streamlines every step.</p>
        <div className="steps-track">
          {steps.map((s, i) => (
            <div key={i} className="step-card" style={{ "--delay": `${i * 0.12}s` }}>
              <div className="sc-top"><div className="sc-num">{s.num}</div><div className="sc-emoji">{s.emoji}</div></div>
              <h3>{s.title}</h3><p>{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="sc-connector">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M4 14H24M18 8L24 14L18 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="testi-section">
        <div className="testi-blob-l" /><div className="testi-blob-r" />
        <div className="section-eyebrow">Social Proof</div>
        <h2 className="section-title">Loved by Healthcare Teams</h2>
        <p className="section-sub">Clinic managers and staff share how QueueSync changed their daily workflow.</p>
        <div className="testi-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testi-card" style={{ "--delay": `${i * 0.12}s` }}>
              <div className="tc-stars">{"★".repeat(t.stars)}</div>
              <p className="tc-quote">"{t.quote}"</p>
              <div className="tc-author">
                <div className="tc-avatar">{t.avatar}</div>
                <div><strong>{t.name}</strong><span>{t.role}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA BAND ═══ */}
      <section className="cta-band">
        <div className="cta-band-orb cta-orb-l" /><div className="cta-band-orb cta-orb-r" />
        <div className="cta-band-inner">
          <span className="cta-band-tag">🏥 For Clinics</span>
          <h2>Ready to transform your clinic?</h2>
          <p>Join clinics already using QueueSync. Set up in under 10 minutes.</p>
          <div className="cta-band-btns">
            <button className="btn-cta-white" onClick={() => navigate("/signup")}>Register Your Clinic →</button>
            <button className="btn-cta-outline" onClick={() => navigate("/pricing")}>View Pricing</button>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer" id="contact">
        <div className="footer-glow" />
        <div className="footer-inner">
          <div className="ft-top">
            <div className="ft-brand"><div className="ft-logo-box">⏱</div><span className="ft-brand-name">QueueSync</span></div>
            <p className="ft-tagline">Smarter clinics. Happier patients.</p>
          </div>
          <div className="ft-cols">
            <div className="ft-col">
              <h4>Product</h4>
              <span onClick={() => navigate("/features")}>Features</span>
              <span onClick={() => { const el = document.getElementById("how-it-works"); if(el) el.scrollIntoView({behavior:"smooth"}); }}>How It Works</span>
              <span onClick={() => navigate("/pricing")}>Pricing</span>
              <span onClick={() => navigate("/changelog")}>Changelog</span>
            </div>
            <div className="ft-col">
              <h4>Company</h4>
              <span onClick={() => navigate("/about")}>About Us</span>
              <span onClick={() => navigate("/contact")}>Contact Us</span>
            </div>
            <div className="ft-col">
              <h4>Legal</h4>
              <span onClick={() => navigate("/privacy")}>Privacy Policy</span>
              <span onClick={() => navigate("/terms")}>Terms of Service</span>
              <span onClick={() => navigate("/cookies")}>Cookie Policy</span>
            </div>
            <div className="ft-col ft-cta-col">
              <h4>Get Started</h4>
              <p>Join QueueSync.</p>
              <button className="ft-cta-btn" onClick={() => navigate("/signup")}>Register Your Clinic →</button>
            </div>
          </div>
          <div className="ft-divider" />
          <div className="ft-bottom">
            <p>© 2025 QueueSync. All rights reserved.</p>
            <div className="ft-nav">
              <span onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>Home</span>
              <span onClick={() => navigate("/features")}>Features</span>
              <span onClick={() => { const el = document.getElementById("how-it-works"); if(el) el.scrollIntoView({behavior:"smooth"}); }}>How It Works</span>
              <span onClick={() => navigate("/contact")}>Contact Us</span>
            </div>
            <div className="ft-socials">
              <div className="ft-social">f</div>
              <div className="ft-social">𝕏</div>
              <div className="ft-social">in</div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}