import doctor from "../assets/doctor.png";
import hospitalBg from "../assets/hospital-bg.jpeg";
import "../styles/Hero.css";

export default function Hero() {
  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${hospitalBg})` }}
    >
      <div className="hero-overlay" />

      <div className="hero-content">
        {/* LEFT TEXT */}
        <div className="hero-left">
          <h1>
            Real-Time Doctor Queue <br />
            & Waiting Time
          </h1>

          <p>
            Check live queue status, reduce waiting time, and manage clinic
            flow efficiently with QueueSync.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary">Check Waiting Time</button>
            <button className="btn-outline">Register Your Clinic</button>
          </div>
        </div>

        {/* RIGHT DOCTOR */}
        <div className="hero-right">
          <img src={doctor} alt="Doctor" />
        </div>
      </div>
    </section>
  );
}
