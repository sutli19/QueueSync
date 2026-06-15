import { useNavigate } from "react-router-dom";
import "../styles/Pages.css";

const POSTS = [
  {
    date: "Jan 15, 2025",
    tag: "Product",
    title: "Why Indian Clinics Still Run on Paper Tokens in 2025",
    desc: "We visited 40+ clinics across Mumbai to understand why digital queue systems haven't taken off — and what QueueSync does differently.",
    emoji: "📋",
    readTime: "5 min read",
  },
  {
    date: "Feb 2, 2025",
    tag: "Healthcare",
    title: "The Real Cost of Patient Wait Time",
    desc: "A patient who waits 45 minutes and leaves without being seen is a lost consultation, a frustrated person, and a missed revenue opportunity for the clinic.",
    emoji: "⏱️",
    readTime: "4 min read",
  },
  {
    date: "Feb 18, 2025",
    tag: "Tech",
    title: "How We Built Real-Time Queue Prediction with Simple Math",
    desc: "No fancy ML model required. Our wait time formula is transparent, accurate, and explainable — and that's exactly why clinics trust it.",
    emoji: "📊",
    readTime: "6 min read",
  },
  {
    date: "Mar 1, 2025",
    tag: "Product",
    title: "QueueSync v1.2 — Analytics Dashboard Now Live",
    desc: "Clinics can now view peak-hour reports, average consultation time trends, and daily patient throughput — all from one screen.",
    emoji: "🚀",
    readTime: "3 min read",
  },
];

export default function Blog() {
  const navigate = useNavigate();
  return (
    <div className="page-wrapper">
      <div className="page-orb page-orb-tl" />
      <div className="page-orb page-orb-br" />

      <div className="page-hero">
        <div className="section-eyebrow">Insights</div>
        <h1 className="page-title">QueueSync Blog</h1>
        <p className="page-sub">
          Thoughts on healthcare, technology, and building for India's clinics.
        </p>
      </div>

      <div className="blog-grid">
        {POSTS.map((post, i) => (
          <div key={i} className="blog-card">
            <div className="blog-card-icon">{post.emoji}</div>
            <div className="blog-card-body">
              <div className="blog-meta">
                <span className="blog-tag">{post.tag}</span>
                <span className="blog-date">{post.date}</span>
                <span className="blog-read">{post.readTime}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.desc}</p>
              <button className="blog-read-btn">Read Article →</button>
            </div>
          </div>
        ))}
      </div>

      <div className="page-cta-strip">
        <h2>Want to be part of the story?</h2>
        <p>Register your clinic and help us reshape healthcare in India.</p>
        <button className="cta-solid" onClick={() => navigate("/signup")}>Get Started →</button>
      </div>
    </div>
  );
}