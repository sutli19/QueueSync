import "../styles/Pages.css";

export default function ContactUs() {
  return (
    <div className="page-wrapper">
      <div className="page-orb page-orb-tl" />
      <div className="page-orb page-orb-br" />

      <div className="page-hero">
        <div className="section-eyebrow">Get In Touch</div>
        <h1 className="page-title">Contact Us</h1>
        <p className="page-sub">Have a question or want to get started? We'd love to hear from you.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <h2>Let's talk</h2>
          <p>Whether you're a clinic looking to onboard, a developer with a question, or just curious about QueueSync — reach out.</p>
          <div className="ci-items">
            <div className="ci-item"><span>📧</span><div><strong>Email</strong><span>hello@queuesync.in</span></div></div>
            <div className="ci-item"><span>📞</span><div><strong>Phone</strong><span>+91 98765 43210</span></div></div>
            <div className="ci-item"><span>📍</span><div><strong>Location</strong><span>Mumbai, Maharashtra, India</span></div></div>
            <div className="ci-item"><span>⏰</span><div><strong>Hours</strong><span>Mon–Sat, 9am–6pm IST</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}