import { useNavigate } from "react-router-dom";
import "../styles/Pages.css";

const plans = [
  {
    name: "Single Doctor",
    planKey: "single",
    price: "₹1",
    realPrice: "₹499",
    period: "/month",
    tag: "Perfect for solo doctors",
    color: "plan-basic",
    features: [
      "1 Doctor profile",
      "Digital token generation",
      "Live queue display",
      "Wait time estimation",
      "Appointment booking",
      "Analytics dashboard",
      "Patient records & billing",
      "Role-based access (receptionist)",
      "Web portal for patients",
    ],
    cta: "Get Started →",
    highlight: false,
  },
  {
    name: "Polyclinic",
    planKey: "polyclinic",
    price: "₹1",
    realPrice: "₹999",
    period: "/month",
    tag: "For multiple doctors",
    color: "plan-poly",
    features: [
      "Multiple doctor profiles",
      "Each doctor gets independent queue",
      "Receptionist assigns patients per doctor",
      "Sub-doctor scoped dashboards",
      "All Single Doctor features included",
      "Multi-doctor analytics",
    ],
    cta: "Get Started →",
    highlight: true,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  const handlePlanClick = (plan) => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");

    // Not logged in → sign up first
    if (!token) {
      navigate("/signup");
      return;
    }

    // Only doctors pay — others shouldn't be on this page
    if (role !== "doctor") {
      navigate("/dashboard");
      return;
    }

    navigate(`/payment?plan=${plan.planKey}`);
  };

  return (
    <div className="page-wrapper">
      <div className="page-orb page-orb-tl" />
      <div className="page-orb page-orb-br" />

      <div className="page-hero">
        <div className="section-eyebrow">Transparent Pricing</div>
        <h1 className="page-title">Choose Your Plan</h1>
        <p className="page-sub">
          Simple, honest pricing. Activate your clinic in under a minute.
        </p>

        {/* Dummy price notice */}
        <div style={{
          display:      "inline-block",
          marginTop:    12,
          padding:      "8px 18px",
          background:   "#fef9c3",
          border:       "1px solid #fde047",
          borderRadius: 20,
          fontSize:     13,
          color:        "#854d0e",
          fontWeight:   600,
        }}>
          🧪 Demo Mode — All plans ₹1 for testing
        </div>
      </div>

      <div className="pricing-grid" style={{ justifyContent: "center" }}>
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`pricing-card ${plan.highlight ? "pricing-highlight" : ""}`}
          >
            {plan.highlight && (
              <div className="pricing-popular-badge">⭐ Most Popular</div>
            )}

            <div className="pc-top">
              <span className="pc-name">{plan.name}</span>
              <span className="pc-tag">{plan.tag}</span>
            </div>

            <div className="pc-price">
              <strong>{plan.price}</strong>
              <span>{plan.period}</span>
            </div>

            {/* Real price note */}
            <div style={{
              fontSize:     12,
              color:        "#9ca3af",
              marginTop:    -10,
              marginBottom: 14,
              textDecoration: "line-through",
            }}>
              Actual price: {plan.realPrice}/month
            </div>

            <ul className="pc-features">
              {plan.features.map((f, j) => (
                <li key={j}>
                  <span className="pc-check">✓</span>{f}
                </li>
              ))}
            </ul>

            <button
              className={`pc-btn ${plan.highlight ? "pc-btn-primary" : "pc-btn-outline"}`}
              onClick={() => handlePlanClick(plan)}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}