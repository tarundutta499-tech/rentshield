import React, { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthProvider";
import { VisibilityOutlined, VisibilityOffOutlined, SecurityOutlined, VerifiedUserOutlined, GavelOutlined } from "@mui/icons-material";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      if (!user) return;

      try {
        console.log("Checking profile for user:", user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        console.log("User doc exists:", userDoc.exists());
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Profile completed:", userData.profileCompleted);
          console.log("User data:", userData);
          
          if (userData.profileCompleted) {
            console.log("Redirecting to dashboard");
            navigate("/dashboard");
          } else {
            console.log("Redirecting to complete-profile");
            navigate("/complete-profile");
          }
        } else {
          console.log("No user doc found, redirecting to complete-profile");
          navigate("/complete-profile");
        }
      } catch (error) {
        console.error("Profile check error:", error);
        navigate("/dashboard");
      }
    };

    checkProfileAndRedirect();
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      alert("Google login failed");
    }
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      alert("Email login failed");
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes floatY {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeSlideLeft {
            from { opacity: 0; transform: translateX(-40px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes rotateSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 20px rgba(0,212,184,0.3); }
            50% { box-shadow: 0 0 50px rgba(0,212,184,0.6); }
          }
        `}
      </style>
      
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        background: '#0A1628',
        overflow: 'hidden'
      }}>

        {/* LEFT PANEL - Branding (hidden on mobile) */}
        <div style={{
          display: { xs: 'none', md: 'flex' },
          width: '55%',
          background: 'linear-gradient(145deg, #0A1628 0%, #0F2040 50%, #0A1628 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>

          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,184,0.15) 0%, transparent 70%)',
            top: '-100px',
            left: '-100px',
            animation: 'floatY 8s ease-in-out infinite',
            pointerEvents: 'none'
          }} />

          <div style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,98,45,0.1) 0%, transparent 70%)',
            bottom: '-80px',
            right: '-80px',
            animation: 'floatY 11s ease-in-out infinite reverse',
            pointerEvents: 'none'
          }} />

          {/* Grid overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,212,184,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,184,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            pointerEvents: 'none'
          }} />

          {/* Rotating rings */}
          <div style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            border: '1px solid rgba(0,212,184,0.1)',
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'rotateSlow 20s linear infinite',
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              border: '1px dashed rgba(0,212,184,0.08)',
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'rotateSlow 15s linear infinite reverse',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Content */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '40px',
            textAlign: 'center'
          }}>

            {/* Logo area */}
            <div style={{ marginBottom: '24px' }}>
              <SecurityOutlined style={{ fontSize: '48px', color: '#00D4B8', marginBottom: '16px', display: 'block' }} />
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '30px',
                fontWeight: 800,
                color: '#FFFFFF',
                textShadow: '0 2px 10px rgba(0,0,0,0.35)',
                margin: '0 0 8px 0',
                letterSpacing: '0.5px'
              }}>
                Sign in to RentShield
              </h1>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '16px',
                color: '#8899AA',
                margin: 0
              }}>
                India's Trusted Rental Platform
              </p>
            </div>

            {/* Feature highlights */}
            <div style={{ marginTop: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
                animation: 'fadeSlideLeft 0.6s ease forwards',
                opacity: 0
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(0,212,184,0.1)',
                  border: '1px solid rgba(0,212,184,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <VerifiedUserOutlined style={{ fontSize: '20px', color: '#00D4B8' }} />
                </div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  color: 'white'
                }}>
                  Verify agreements instantly
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
                animation: 'fadeSlideLeft 0.6s ease 0.2s forwards',
                opacity: 0
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(0,212,184,0.1)',
                  border: '1px solid rgba(0,212,184,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <GavelOutlined style={{ fontSize: '20px', color: '#00D4B8' }} />
                </div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  color: 'white'
                }}>
                  Check rental reputation scores
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                animation: 'fadeSlideLeft 0.6s ease 0.4s forwards',
                opacity: 0
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(0,212,184,0.1)',
                  border: '1px solid rgba(0,212,184,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <SecurityOutlined style={{ fontSize: '20px', color: '#00D4B8' }} />
                </div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  color: 'white'
                }}>
                  Stay legally protected
                </span>
              </div>
            </div>

            {/* Stats strip */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px',
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              minWidth: '320px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#00D4B8',
                  lineHeight: 1
                }}>
                  2,400+
                </div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: '#8899AA',
                  marginTop: '4px'
                }}>
                  Agreements
                </div>
              </div>
              
              <div style={{
                width: '1px',
                height: '40px',
                background: 'rgba(255,255,255,0.08)'
              }} />
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: '22px',
                  fontWeight: 900,
                  color: 'white',
                  lineHeight: 1
                }}>
                  Delhi NCR
                </div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: '#8899AA',
                  marginTop: '4px'
                }}>
                  Currently Serving
                </div>
              </div>
              
              <div style={{
                width: '1px',
                height: '40px',
                background: 'rgba(255,255,255,0.08)'
              }} />
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#00D4B8',
                  lineHeight: 1
                }}>
                  Free
                </div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: '#8899AA',
                  marginTop: '4px'
                }}>
                  For Tenants
                </div>
              </div>
            </div>

            {/* Bottom trust badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '24px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)'
            }}>
              <span>🔒</span>
              <span>Secured by Firebase  ·  DPDP Act 2023 Compliant</span>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL - Form */}
        <div style={{
          width: { xs: '100%', md: '45%' },
          background: { xs: '#0A1628', md: '#F0F4F8' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: '20px', md: '0' },
          position: 'relative'
        }}>

          {/* Mobile background orbs */}
          <div style={{
            display: { xs: 'block', md: 'none' },
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,184,0.1) 0%, transparent 70%)',
            top: '-50px',
            right: '-50px',
            animation: 'floatY 8s ease-in-out infinite',
            pointerEvents: 'none'
          }} />

          <div style={{
            display: { xs: 'block', md: 'none' },
            position: 'absolute',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,98,45,0.08) 0%, transparent 70%)',
            bottom: '-50px',
            left: '-50px',
            animation: 'floatY 11s ease-in-out infinite reverse',
            pointerEvents: 'none'
          }} />

          {/* Form card */}
          <div style={{
            maxWidth: '420px',
            width: '100%',
            background: { xs: 'rgba(15,32,64,0.95)', md: 'white' },
            border: { xs: '1px solid rgba(0,212,184,0.2)', md: 'none' },
            borderRadius: '24px',
            padding: { xs: '24px', md: '40px' },
            boxShadow: { xs: '0 20px 40px rgba(0,0,0,0.3)', md: '0 24px 60px rgba(0,0,0,0.12)' },
            position: 'relative',
            zIndex: 1,
            animation: 'fadeSlideUp 0.5s ease forwards'
          }}>

            {/* Mobile logo */}
            <div style={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              justifyContent: 'center'
            }}>
              <SecurityOutlined style={{ fontSize: '32px', color: '#00D4B8' }} />
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '28px',
                fontWeight: 900,
                color: 'white',
                margin: 0
              }}>
                RentShield
              </h1>
            </div>

            {/* Header */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <span style={{
                display: 'inline-block',
                background: 'rgba(0,212,184,0.1)',
                color: '#00D4B8',
                border: '1px solid rgba(0,212,184,0.3)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '20px',
                padding: '4px 16px',
                marginBottom: '16px'
              }}>
                🏠 Welcome Back
              </span>
              
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: { xs: '26px', md: '36px' },
                fontWeight: 800,
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                margin: '0 0 8px 0',
                letterSpacing: '0.5px'
              }}>
                Sign in to <span style={{ color: '#10b981' }}>RentShield</span>
              </h1>
              
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0
              }}>
                Secure rental management for Delhi NCR
              </p>
            </div>

            {/* Google button */}
            <button
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                background: 'white',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '24px'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#00D4B8';
                e.target.style.boxShadow = '0 4px 16px rgba(0,212,184,0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '24px 0'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: '#9CA3AF',
                padding: '0 16px'
              }}>
                OR
              </span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            </div>

            {/* Email input */}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              style={{
                width: '100%',
                background: { xs: 'rgba(255,255,255,0.08)', md: '#F8FAFC' },
                border: '1.5px solid #E5E7EB',
                borderRadius: '12px',
                padding: '14px 16px',
                fontSize: '15px',
                fontFamily: "'DM Sans', sans-serif",
                color: { xs: 'white', md: '#0A1628' },
                outline: 'none',
                transition: 'border 0.2s',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00D4B8';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,212,184,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = 'none';
              }}
            />

            {/* Password input with toggle */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: { xs: 'rgba(255,255,255,0.08)', md: '#F8FAFC' },
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  fontSize: '15px',
                  fontFamily: "'DM Sans', sans-serif",
                  color: { xs: 'white', md: '#0A1628' },
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                  paddingRight: '44px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00D4B8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,212,184,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
              </button>
            </div>

            {/* Login button */}
            <button
              onClick={handleEmailLogin}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #00D4B8, #0099FF)',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                fontFamily: "'DM Sans', sans-serif",
                borderRadius: '12px',
                padding: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '16px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 30px rgba(0,212,184,0.4)';
                e.target.style.background = 'linear-gradient(135deg, #00bfa5, #0080ff)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'linear-gradient(135deg, #00D4B8, #0099FF)';
              }}
            >
              Sign In →
            </button>

            {/* Bottom privacy note */}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              color: '#9CA3AF',
              textAlign: 'center',
              margin: '12px 0 0 0'
            }}>
              🔒 Your data is protected under India's DPDP Act 2023
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
