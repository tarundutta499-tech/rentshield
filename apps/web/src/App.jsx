import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./state/AuthProvider.jsx";
import IdleLogout from "./components/IdleLogout.jsx";
import { Box, Tooltip, Typography } from '@mui/material';
import { DescriptionOutlined } from '@mui/icons-material';

import HomePage from "./pages/HomePage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import AgreementGeneratorPage from "./pages/AgreementGeneratorPage.jsx";
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
import { RoleSelectionPage } from "./pages/RoleSelectionPage.jsx";
import FirestoreTest from "./pages/FirestoreTest.jsx";
import CompleteProfilePage from "./pages/CompleteProfilePage.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
import ProfileGuard from "./components/ProfileGuard.jsx";

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
  const { loading, user, profile, profileCompleted } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // If user logged out and NOT on public pages
      const publicPages = ["/", "/auth", "/about", "/how-it-works"];
      if (!publicPages.includes(location.pathname)) {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname]);

  useEffect(() => {
    if (!loading && user && !profileCompleted) {
      // If user is logged in but profile is not completed
      // Redirect to complete profile unless already there
      if (location.pathname !== "/complete-profile") {
        navigate("/complete-profile", { replace: true });
      }
    }
  }, [user, profileCompleted, loading, navigate, location.pathname]);

  useEffect(() => {
    if (!loading && user && profileCompleted && !profile?.role && !profile?.userType) {
      // If user is logged in and profile is completed but no role selected
      if (location.pathname !== "/select-role") {
        navigate("/select-role", { replace: true });
      }
    }
  }, [user, profile?.role, profile?.userType, profileCompleted, loading, navigate, location.pathname]);

  useEffect(() => {
    if (!loading && user && profileCompleted && (profile?.role || profile?.userType)) {
      // If user is logged in, profile is completed, and role exists
      // Redirect away from role selection page if they somehow land there
      if (location.pathname === "/select-role") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, profile?.role, profile?.userType, profileCompleted, loading, navigate, location.pathname]);

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
      <style>{`
        @keyframes floatFAB {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fabPulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes fabSlideIn {
          from { opacity: 0; transform: translateY(40px) scale(0.8); }
          to { opacity: 1; transform: translateY(0px) scale(1); }
        }
        @keyframes shimmerFAB {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
      <IdleLogout />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/auth"
            element={
              user ? <Navigate to="/dashboard" /> : <AuthPage />
            }
          />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
          <Route path="/edit-profile" element={
            <ProfileGuard>
              <EditProfilePage />
            </ProfileGuard>
          } />
          <Route path="/dashboard" element={
            <ProfileGuard>
              <DashboardPage />
            </ProfileGuard>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/agreement-generator" element={
            <ProfileGuard>
              <AgreementGeneratorPage />
            </ProfileGuard>
          } />
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
          <Route 
            path="/select-role"
            element={
              <ProtectedRoute>
                <RoleSelectionPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Floating Action Button */}
      {(() => {
        const hideOnRoutes = ['/auth', '/login', '/signup', '/agreement-generator', '/select-role'];
        const shouldShowFAB = user && !hideOnRoutes.includes(location.pathname);
        
        return shouldShowFAB && (
          <Box
            onClick={() => navigate('/agreement-generator')}
            sx={{
              position: 'fixed',
              bottom: { xs: 24, md: 32 },
              right: { xs: 20, md: 36 },
              zIndex: 9999,
              cursor: 'pointer',
              animation: 'fabSlideIn 0.5s ease forwards',
            }}
          >
            {/* Pulse ring behind button */}
            <Box sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50px',
              background: 'rgba(0,212,184,0.4)',
              animation: 'fabPulseRing 2s ease-out infinite',
              zIndex: 0
            }} />

            {/* Main floating button */}
            <Box sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              background: 'linear-gradient(135deg, #00D4B8 0%, #0099FF 100%)',
              backgroundSize: '200% auto',
              borderRadius: '50px',
              px: { xs: 2.5, md: 3 },
              py: { xs: 1.5, md: 1.8 },
              boxShadow: '0 8px 32px rgba(0,212,184,0.45)',
              animation: 'floatFAB 3s ease-in-out infinite, shimmerFAB 3s linear infinite',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.05)',
                boxShadow: '0 16px 48px rgba(0,212,184,0.6)',
                backgroundPosition: 'right center',
              },
              '&:active': {
                transform: 'scale(0.97)',
              }
            }}>

              {/* Icon container */}
              <Box sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <DescriptionOutlined sx={{ 
                  color: 'white', 
                  fontSize: 20 
                }} />
              </Box>

              {/* Text — hidden on very small screens */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'white',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap'
                }}>
                  Create Agreement
                </Typography>
                <Typography sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.2
                }}>
                  Free · 2 mins
                </Typography>
              </Box>

              {/* Arrow */}
              <Typography sx={{
                color: 'white',
                fontSize: '18px',
                fontWeight: 700,
                ml: 0.5,
                display: { xs: 'none', sm: 'block' }
              }}>
                →
              </Typography>

            </Box>

            {/* Tooltip for mobile (xs) where text is hidden */}
            {/* On mobile only icon shows, so add a small label below */}
            <Box sx={{
              display: { xs: 'flex', sm: 'none' },
              justifyContent: 'center',
              mt: 0.5
            }}>
              <Typography sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '9px',
                color: 'rgba(255,255,255,0.9)',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '4px',
                px: 1,
                py: 0.3,
                whiteSpace: 'nowrap'
              }}>
                Agreement
              </Typography>
            </Box>

          </Box>
        );
      })()}
      
    </ErrorBoundary>
  );
}

export default function App() {
  return <AppWithAuth />;
}
