import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  Hash, 
  Home, 
  UserCircle, 
  Briefcase, 
  Scale,
  ArrowLeft 
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../state/AuthProvider.jsx';
import { getStateFromCity, topIndianCities, indianStates } from '../utils/cityStateMapping';

export default function EditProfilePage() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const cityInputRef = useRef(null);

  // DEBUG: Log component lifecycle
  useEffect(() => {
    console.log('[EditProfilePage] Component mounted');
    return () => {
      console.log('[EditProfilePage] Component unmounting');
    };
  }, []);

  if (authLoading) {
    console.log('[EditProfilePage] Auth loading, returning null');
    return null;
  }

  // Load existing profile data
  useEffect(() => {
    console.log('[EditProfilePage] Load profile effect triggered', { authLoading, user: user?.uid });
    if (authLoading) return;
    if (!user) {
      console.log('[EditProfilePage] No user, redirecting to /auth');
      navigate("/auth");
      return;
    }

    const loadProfile = async () => {
      try {
        console.log('[EditProfilePage] Loading profile for user:', user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('[EditProfilePage] Profile loaded:', data);
          setFullName(data.fullName || user.displayName || '');
          setPhoneNumber(data.phoneNumber ? data.phoneNumber.replace('+91', '') : '');
          setCity(data.city || '');
          setState(data.state || '');
          setPincode(data.pincode || '');
          setUserType(data.userType || '');
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // City suggestions
  useEffect(() => {
    console.log('[EditProfilePage] City input changed:', city);
    if (city.length > 0) {
      const filtered = topIndianCities.filter(c => 
        c.toLowerCase().includes(city.toLowerCase())
      ).slice(0, 5);
      setCitySuggestions(filtered);
      setShowCityDropdown(true);
    } else {
      setCitySuggestions([]);
      setShowCityDropdown(false);
    }
  }, [city]);

  // Auto-select state based on city
  useEffect(() => {
    console.log('[EditProfilePage] State auto-select effect, city:', city);
    if (city) {
      const detectedState = getStateFromCity(city);
      if (detectedState) {
        console.log('[EditProfilePage] Auto-detected state:', detectedState);
        setState(detectedState);
      }
    }
  }, [city]);

  const validateForm = () => {
    const newErrors = {};
    if (fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }
    // Handle +91 prefix in phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const normalized = cleanPhone.length === 12 && cleanPhone.startsWith('91')
      ? cleanPhone.slice(2)
      : cleanPhone;
    if (!/^[6-9]\d{9}$/.test(normalized)) {
      newErrors.phoneNumber = "Please enter a valid Indian phone number (10 digits, with or without +91)";
    }
    if (city.trim().length < 2) {
      newErrors.city = "City is required";
    }
    if (state.trim().length < 2) {
      newErrors.state = "State is required";
    }
    if (pincode && !/^\d{6}$/.test(pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    if (!['owner', 'tenant', 'agent', 'lawyer'].includes(userType)) {
      newErrors.userType = "Please select your role";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user) {
      setErrors({ submit: "Unable to save profile: user not authenticated." });
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const normalizedPhone = cleanPhone.length === 12 && cleanPhone.startsWith('91')
        ? cleanPhone.slice(2)
        : cleanPhone;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName.trim(),
        phoneNumber: `+91${normalizedPhone}`,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim() || null,
        userType,
        profileCompleted: true,
        lastUpdatedAt: serverTimestamp(),
        emailVerified: user.emailVerified,
        photoURL: user.photoURL || null,
      }, { merge: true });

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      console.error("Profile update error:", error);
      setErrors({ submit: "Failed to update profile. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: 'center',
            color: 'white',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <span style={{ fontSize: '32px' }}>✓</span>
          </div>
          <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>
            Profile Updated!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Redirecting to dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Blobs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }}
      />
      
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%)',
          bottom: '-100px',
          right: '-100px',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />

      {/* Main Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: '600px',
            width: '90vw',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            padding: { xs: '24px', md: '40px' },
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '32px',
              marginBottom: '8px',
              fontFamily: "'Syne', sans-serif"
            }}>
              Edit Your Profile
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '16px',
              fontFamily: "'DM Sans', sans-serif"
            }}>
              Update your personal information
            </p>
          </div>

          {/* Form Fields */}
          <div style={{ marginBottom: '32px' }}>
            {/* Full Name */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <User 
                size={20} 
                color="rgba(255,255,255,0.5)" 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '14px',
                  pointerEvents: 'none'
                }} 
              />
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors(prev => ({ ...prev, fullName: '' }));
                  }
                }}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${errors.fullName ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'}`,
                  padding: '14px 16px 14px 48px',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.fullName ? '#ef4444' : 'rgba(255, 255, 255, 0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.fullName && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.fullName}
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '14px 16px',
                  borderRadius: '12px 0 0 12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '16px',
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Phone size={20} />
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    // Handle +91 prefix: if 12 digits starting with 91, normalize to 10 digits
                    if (value.length === 12 && value.startsWith('91')) {
                      value = value.slice(2);
                    }
                    // Take only last 10 digits
                    value = value.slice(-10);
                    setPhoneNumber(value);
                    if (errors.phoneNumber) {
                      setErrors(prev => ({ ...prev, phoneNumber: '' }));
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: `1px solid ${errors.phoneNumber ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'}`,
                    padding: '14px 16px',
                    borderRadius: '0 12px 12px 0',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.phoneNumber ? '#ef4444' : 'rgba(255, 255, 255, 0.15)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {errors.phoneNumber && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.phoneNumber}
                </div>
              )}
            </div>

            {/* City */}
            <div style={{ position: 'relative', marginBottom: '16px' }} ref={cityInputRef}>
              <MapPin 
                size={20} 
                color="rgba(255,255,255,0.5)" 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '14px',
                  pointerEvents: 'none'
                }} 
              />
              <input
                type="text"
                placeholder="Type your city..."
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) {
                    setErrors(prev => ({ ...prev, city: '' }));
                  }
                }}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${errors.city ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'}`,
                  padding: '14px 16px 14px 48px',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.city ? '#ef4444' : 'rgba(255, 255, 255, 0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {showCityDropdown && citySuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  zIndex: 1000
                }}>
                  {citySuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      onClick={() => {
                        setCity(suggestion);
                        setShowCityDropdown(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        color: 'white',
                        cursor: 'pointer',
                        borderBottom: index < citySuggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '14px',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(16, 185, 129, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
              {errors.city && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.city}
                </div>
              )}
            </div>

            {/* State */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Building2 
                size={20} 
                color="rgba(255,255,255,0.5)" 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '14px',
                  pointerEvents: 'none'
                }} 
              />
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  if (errors.state) {
                    setErrors(prev => ({ ...prev, state: '' }));
                  }
                }}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${errors.state ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'}`,
                  padding: '14px 16px 14px 48px',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  appearance: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.state ? '#ef4444' : 'rgba(255, 255, 255, 0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Select State</option>
                {indianStates.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              {errors.state && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.state}
                </div>
              )}
            </div>

            {/* Pincode */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Hash 
                size={20} 
                color="rgba(255,255,255,0.5)" 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '14px',
                  pointerEvents: 'none'
                }} 
              />
              <input
                type="text"
                placeholder="6-digit pincode (optional)"
                value={pincode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setPincode(value);
                  if (errors.pincode) {
                    setErrors(prev => ({ ...prev, pincode: '' }));
                  }
                }}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${errors.pincode ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'}`,
                  padding: '14px 16px 14px 48px',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.pincode ? '#ef4444' : 'rgba(255, 255, 255, 0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.pincode && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.pincode}
                </div>
              )}
            </div>

            {/* User Type */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <h3 style={{
                color: 'white',
                fontSize: '16px',
                marginBottom: '12px',
                fontFamily: "'DM Sans', sans-serif"
              }}>
                What brings you to RentShield?
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: '12px'
              }}>
                {[
                  { icon: Home, title: 'Property Owner', description: 'I rent out properties', value: 'owner' },
                  { icon: UserCircle, title: 'Tenant', description: "I'm looking to rent", value: 'tenant' },
                  { icon: Briefcase, title: 'Real Estate Agent', description: 'Agent or broker', value: 'agent' },
                  { icon: Scale, title: 'Lawyer', description: 'Legal advisor', value: 'lawyer' }
                ].map((role) => {
                  const Icon = role.icon;
                  const isSelected = userType === role.value;
                  return (
                    <motion.div
                      key={role.value}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setUserType(role.value);
                        if (errors.userType) {
                          setErrors(prev => ({ ...prev, userType: '' }));
                        }
                      }}
                      style={{
                        padding: '20px 16px',
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                        background: isSelected ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Icon size={32} color={isSelected ? 'white' : 'rgba(255,255,255,0.6)'} />
                      <div style={{ marginTop: '8px' }}>
                        <div style={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          marginBottom: '2px',
                          fontFamily: "'DM Sans', sans-serif"
                        }}>
                          {role.title}
                        </div>
                        <div style={{
                          color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)',
                          fontSize: '12px',
                          fontFamily: "'DM Sans', sans-serif"
                        }}>
                          {role.description}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {errors.userType && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
                  {errors.userType}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px'
          }}>
            <button
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '14px 28px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: loading ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '14px 32px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(16,185,129,0.4)',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 30px rgba(16,185,129,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(16,185,129,0.4)';
                }
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '16px',
              color: '#ef4444',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif"
            }}>
              {errors.submit}
            </div>
          )}
        </motion.div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
