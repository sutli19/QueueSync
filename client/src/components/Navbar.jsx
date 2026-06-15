import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  /* Smooth scroll on home page, navigate + scroll on other pages */
  const handleNavClick = (sectionId) => {
    if (location.pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleHome = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* LEFT */}
        <div className="nav-left" onClick={handleHome} style={{ cursor: "pointer" }}>
          <img src={logo} alt="QueueSync logo" className="nav-logo-img" />
          <span className="nav-logo-text">QueueSync</span>
        </div>

        {/* RIGHT MENU */}
        <nav className="nav-menu">
          <a onClick={handleHome}>Home</a>
          <a onClick={() => handleNavClick("features")}>Features</a>
          <a onClick={() => handleNavClick("how-it-works")}>How it Works</a>
          <a onClick={() => handleNavClick("contact")}>Contact Us</a>
          <a onClick={() => navigate("/login")} className="nav-btn-login">Login</a>
          <a onClick={() => navigate("/signup")} className="nav-btn-register">Register Your Clinic</a>
        </nav>
      </div>
    </header>
  );
}