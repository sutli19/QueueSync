// =============================================================================
// React Router & Core Dependencies
// =============================================================================
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { Suspense, lazy, Component, useEffect, useState } from "react";

// =============================================================================
// Components
// =============================================================================
import Navbar from "./components/Navbar";

// =============================================================================
// Lazy-loaded Page Imports
// =============================================================================
const Login           = lazy(() => import("./pages/Login"));
const Signup          = lazy(() => import("./pages/Signup"));
const ForgotPassword  = lazy(() => import("./pages/Forgotpassword"));
const Payment         = lazy(() => import("./pages/Payment"));

const Dashboard             = lazy(() => import("./pages/Dashboard"));
const ReceptionistDashboard = lazy(() => import("./pages/ReceptionistDashboard"));
const Features              = lazy(() => import("./pages/Features"));
const Pricing               = lazy(() => import("./pages/Pricing"));
const ContactUs             = lazy(() => import("./pages/Contactus"));
const About                 = lazy(() => import("./pages/About"));
const Changelog             = lazy(() => import("./pages/Changelog"));
const PatientQueue          = lazy(() => import("./pages/Patientqueue"));
const PrivacyPolicy         = lazy(() => import("./pages/Privacypolicy"));
const TermsOfService        = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy          = lazy(() => import("./pages/Cookiepolicy"));

import Home from "./pages/Home";

// =============================================================================
// Route Configuration
// =============================================================================
const ROUTES = {
  HOME:           "/",
  LOGIN:          "/login",
  SIGNUP:         "/signup",
  FORGOT_PASSWORD:"/forgot-password",
  PAYMENT:        "/payment",
  DASHBOARD:      "/dashboard",
  RECEPTIONIST:   "/reception",
  FEATURES:       "/features",
  PRICING:        "/pricing",
  CONTACT:        "/contact",
  ABOUT:          "/about",
  CHANGELOG:      "/changelog",
  PATIENT_QUEUE:  "/patient-queue",
  PRIVACY:        "/privacy",
  TERMS:          "/terms",
  COOKIES:        "/cookies",
};

const HIDE_NAVBAR_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.PAYMENT,
  ROUTES.DASHBOARD,
  ROUTES.RECEPTIONIST,
  ROUTES.PATIENT_QUEUE,
];

// =============================================================================
// Loading & Error Fallbacks
// =============================================================================
function LoadingFallback() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
      <div>Loading...</div>
    </div>
  );
}

function RouteErrorFallback({ error }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Something went wrong loading this page</h2>
      <p style={{ color: "#666" }}>{error?.message || "Unknown error"}</p>
    </div>
  );
}

// =============================================================================
// Error Boundary
// =============================================================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Route loading error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <RouteErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// =============================================================================
// Subscription Guard — protects /dashboard for doctors only
// =============================================================================
function DoctorGuard({ children }) {
  const navigate          = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed,  setAllowed]  = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");

    // No token → go login
    if (!token) {
      navigate("/login");
      return;
    }

    // Sub-doctor and receptionist don't need subscription check
    if (role === "sub_doctor" || role === "receptionist") {
      setAllowed(true);
      setChecking(false);
      return;
    }

    // Doctor → verify subscription
    fetch("https://queuesync.onrender.com/api/payment/status", {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.active) {
          setAllowed(true);
        } else {
          navigate("/pricing");
        }
      })
      .catch(() => {
        // Network error — let them through to avoid blocking
        setAllowed(true);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <LoadingFallback />;
  if (!allowed) return null;
  return children;
}

// =============================================================================
// Payment Guard — only logged-in doctors can access /payment
// =============================================================================
function PaymentGuard({ children }) {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const role     = localStorage.getItem("role");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "doctor") {
      navigate("/dashboard");
    }
  }, []);

  if (!token || role !== "doctor") return null;
  return children;
}

// =============================================================================
// Layout Component
// =============================================================================
function Layout() {
  const location  = useLocation();
  const showNavbar = !HIDE_NAVBAR_ROUTES.includes(location.pathname);

  return (
    <ErrorBoundary fallback={<RouteErrorFallback error={new Error("Navigation error")} />}>
      <>
        {showNavbar && <Navbar />}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path={ROUTES.HOME}            element={<Home />} />

            {/* Auth Routes */}
            <Route path={ROUTES.LOGIN}           element={<Login />} />
            <Route path={ROUTES.SIGNUP}          element={<Signup />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

            {/* Payment Route — doctors only */}
            <Route
              path={ROUTES.PAYMENT}
              element={
                <PaymentGuard>
                  <Payment />
                </PaymentGuard>
              }
            />

            {/* Dashboard Routes — subscription guarded */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <DoctorGuard>
                  <Dashboard />
                </DoctorGuard>
              }
            />
            <Route
              path={ROUTES.RECEPTIONIST}
              element={
                <DoctorGuard>
                  <ReceptionistDashboard />
                </DoctorGuard>
              }
            />

            {/* Patient Queue */}
            <Route path={ROUTES.PATIENT_QUEUE}   element={<PatientQueue />} />

            {/* Public Routes */}
            <Route path={ROUTES.FEATURES}        element={<Features />} />
            <Route path={ROUTES.PRICING}         element={<Pricing />} />
            <Route path={ROUTES.CONTACT}         element={<ContactUs />} />
            <Route path={ROUTES.ABOUT}           element={<About />} />
            <Route path={ROUTES.CHANGELOG}       element={<Changelog />} />

            {/* Legal Routes */}
            <Route path={ROUTES.PRIVACY}         element={<PrivacyPolicy />} />
            <Route path={ROUTES.TERMS}           element={<TermsOfService />} />
            <Route path={ROUTES.COOKIES}         element={<CookiePolicy />} />

            {/* 404 */}
            <Route path="*"                      element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Suspense>
      </>
    </ErrorBoundary>
  );
}

// =============================================================================
// Main App Component
// =============================================================================
export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout />
      </ErrorBoundary>
    </BrowserRouter>
  );
}