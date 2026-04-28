import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./state/AuthProvider.jsx";

import HomePage from "./pages/HomePage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { HowItWorksPage } from "./pages/HowItWorksPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { UploadAgreementPage } from "./pages/UploadAgreementPage.jsx";
import { LegalNoticePage } from "./pages/LegalNoticePage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { RentalDetailPage } from "./pages/RentalDetailPage.jsx";
import { RateUserPage } from "./pages/RateUserPage.jsx";
import { PublicProfilePage } from "./pages/PublicProfilePage.jsx";
import { FeaturesPage } from "./pages/FeaturesPage.jsx";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage.jsx";
import { TermsOfServicePage } from "./pages/TermsOfServicePage.jsx";
import { ContactPage } from "./pages/ContactPage.jsx";
import { AgreementPage } from "./pages/AgreementPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import IntentPage from "./pages/IntentPage.jsx";
import TenantDashboardPage from "./pages/TenantDashboardPage.jsx";
import LandlordDashboardPage from "./pages/LandlordDashboardPage.jsx";
import LegalHelpPage from "./pages/LegalHelpPage.jsx";
import FirestoreTest from "./pages/FirestoreTest.jsx";

// Error Boundary for catching rendering crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2 style={{ color: '#d32f2f', marginBottom: 20 }}>Something went wrong</h2>
          <details style={{ textAlign: 'left', marginTop: 20 }}>
            <summary style={{ cursor: 'pointer', marginBottom: 10 }}>Error Details</summary>
            <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto' }}>
              {this.state.error?.toString() || 'Unknown error occurred'}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: 20, padding: '10px 20px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}


function AppWithAuth() {
  const { loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // If user logged out and NOT on home or auth page
      if (location.pathname !== "/" && location.pathname !== "/auth") {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/auth"
            element={
              user ? <Navigate to="/" /> : <AuthPage />
            }
          />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/rental/:rentalId" element={<RentalDetailPage />} />
          <Route path="/rate/:rentalId" element={<RateUserPage />} />
          <Route path="/profile/:userId" element={<PublicProfilePage />} />
          <Route 
            path="/tenant-dashboard"
            element={
              <ProtectedRoute>
                <TenantDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/landlord-dashboard"
            element={
              <ProtectedRoute>
                <LandlordDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/legal-help"
            element={
              <ProtectedRoute>
                <LegalHelpPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadAgreementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/legal-notice"
            element={
              <ProtectedRoute>
                <LegalNoticePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route 
            path="/agreement/:rentalId" 
            element={<AgreementPage />} 
          />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return <AppWithAuth />;
}
