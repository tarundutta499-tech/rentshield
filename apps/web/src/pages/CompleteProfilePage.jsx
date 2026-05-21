import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
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
  Check,
  ArrowLeft 
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { getStateFromCity, topIndianCities, indianStates } from '../utils/cityStateMapping';

export default function CompleteProfilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  const navigate = useNavigate();
  const cityInputRef = useRef(null);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem("rentshield_profile_progress");
    if (saved) {
      const data = JSON.parse(saved);
      setFullName(data.fullName || auth.currentUser?.displayName || "");
      setPhoneNumber(data.phoneNumber || "");
      setCity(data.city || "");
      setState(data.state || "");
      setPincode(data.pincode || "");
      setUserType(data.userType || "");
      setCurrentStep(data.currentStep || 1);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    const data = { fullName, phoneNumber, city, state, pincode, userType, currentStep };
    localStorage.setItem("rentshield_profile_progress", JSON.stringify(data));
  }, [fullName, phoneNumber, city, state, pincode, userType, currentStep]);

  // Auto-detect location
  useEffect(() => {
    if (currentStep === 2 && !autoDetected) {
      fetch("https://ipapi.co/json/")
        .then(r => r.json())
        .then(data => {
          if (data.city) {
            setCity(data.city);
            const detectedState = getStateFromCity(data.city);
            if (detectedState) {
              setState(detectedState);
            }
          }
          if (data.postal) {
            setPincode(data.postal);
          }
          setAutoDetected(true);
        })
        .catch(err => console.log("Location detection failed:", err));
    }
  }, [currentStep, autoDetected]);

  // City suggestions
  useEffect(() => {
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
    if (city) {
      const detectedState = getStateFromCity(city);
      if (detectedState) {
        setState(detectedState);
      }
    }
  }, [city]);

  const validateStep1 = () => {
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (city.trim().length < 2) {
      newErrors.city = "City is required";
    }
    if (state.trim().length < 2) {
      newErrors.state = "State is required";
    }
    if (pincode && !/^\d{6}$/.test(pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!['owner', 'tenant', 'agent', 'lawyer'].includes(userType)) {
      newErrors.userType = "Please select your role";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();

    if (isValid) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      // Clean phone number and ensure it's stored correctly
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
        profileCompleted: true,
        profileCompletedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        emailVerified: user.emailVerified,
        photoURL: user.photoURL || null,
      }, { merge: true });

      // Clear saved progress
      localStorage.removeItem("rentshield_profile_progress");

      // Show confetti
      setShowConfetti(true);

      // Show success overlay
      setTimeout(() => {
        setShowSuccess(true);
      }, 500);

      // Navigate to role selection
      setTimeout(() => {
        navigate("/select-role");
      }, 3500);

    } catch (error) {
      console.error("Profile creation error:", error);
      setErrors({ submit: "Failed to create profile. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/select-role");
  };

  const Step1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h2 style={{ color: 'white', marginBottom: '32px', fontSize: '24px' }}>
        Tell us about yourself
      </h2>

      <div style={{ marginBottom: '24px' }}>
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
      </div>
    </motion.div>
  );

  const Step2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h2 style={{ color: 'white', marginBottom: '32px', fontSize: '24px' }}>
        Where are you located?
      </h2>

      {autoDetected && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '24px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '13px',
          fontStyle: 'italic',
          display: 'inline-block'
        }}>
          📍 Auto-detected from your location
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
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
      </div>
    </motion.div>
  );

  const Step3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h2 style={{ color: 'white', marginBottom: '32px', fontSize: '24px' }}>
        What brings you to RentShield?
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { icon: Home, title: 'Property Owner', description: 'I rent out properties', value: 'owner' },
          { icon: UserCircle, title: 'Tenant', description: "I'm looking to rent", value: 'tenant' },
          { icon: Briefcase, title: 'Real Estate Agent', description: 'Agent or broker', value: 'agent' },
          { icon: Scale, title: 'Lawyer', description: 'Legal advisor', value: 'lawyer' }
        ].map((role, index) => {
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
                padding: '28px 20px',
                borderRadius: '16px',
                border: `2px solid ${isSelected ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                background: isSelected ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '24px',
                  height: '24px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={16} color="#10b981" />
                </div>
              )}
              <Icon size={40} color={isSelected ? 'white' : 'rgba(255,255,255,0.6)'} />
              <div style={{ marginTop: '12px' }}>
                <div style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  marginBottom: '4px',
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  {role.title}
                </div>
                <div style={{
                  color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)',
                  fontSize: '14px',
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
        <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>
          {errors.userType}
        </div>
      )}
    </motion.div>
  );

  const ProgressBar = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginBottom: '48px',
      gap: '8px'
    }}>
      {[1, 2, 3].map((step) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isUpcoming = step > currentStep;
        
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: `2px solid ${isCompleted ? '#10b981' : isUpcoming ? 'rgba(255,255,255,0.2)' : '#10b981'}`,
                background: isCompleted ? '#10b981' : isCurrent ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              {isCurrent && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              {isCompleted ? (
                <Check size={20} color="white" />
              ) : (
                <span style={{
                  color: isCurrent ? 'white' : 'rgba(255,255,255,0.6)',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  {step}
                </span>
              )}
            </div>
            {step < 3 && (
              <div
                style={{
                  width: '60px',
                  height: '2px',
                  background: isCompleted ? '#10b981' : 'rgba(255,255,255,0.2)',
                  marginLeft: '8px'
                }}
              />
            )}
          </div>
        );
      })}
      <div style={{ position: 'absolute', bottom: '-20px' }}>
        <span style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '12px',
          fontFamily: "'DM Sans', sans-serif",
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          {currentStep === 1 && 'Personal'}
          {currentStep === 2 && 'Location'}
          {currentStep === 3 && 'Role'}
        </span>
      </div>
    </div>
  );

  if (showSuccess) {
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
            <Check size={40} color="white" />
          </div>
          <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>
            ✅ Profile Created!
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>
            Welcome to RentShield 🎉
          </p>
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
      
      <motion.div
        animate={{
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(45px)',
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
              RentShield
            </h1>
            <h2 style={{
              color: 'white',
              fontSize: { xs: '22px', md: '28px' },
              fontWeight: 'bold',
              marginBottom: '8px',
              fontFamily: "'Syne', sans-serif"
            }}>
              Welcome to RentShield 👋
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '16px',
              fontFamily: "'DM Sans', sans-serif"
            }}>
              Let's set up your profile in 30 seconds
            </p>
          </div>

          {/* Progress Bar */}
          <ProgressBar />

          {/* Form Steps */}
          <div style={{ minHeight: '400px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {currentStep === 1 && <Step1 />}
                {currentStep === 2 && <Step2 />}
                {currentStep === 3 && <Step3 />}
              </motion.div>
            </AnimatePresence>
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
                display: currentStep === 1 ? 'none' : 'flex',
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
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              disabled={loading || (
                (currentStep === 1 && (!fullName || !phoneNumber)) ||
                (currentStep === 2 && (!city || !state)) ||
                (currentStep === 3 && !userType)
              )}
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
                opacity: loading || (
                  (currentStep === 1 && (!fullName || !phoneNumber)) ||
                  (currentStep === 2 && (!city || !state)) ||
                  (currentStep === 3 && !userType)
                ) ? 0.5 : 1
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
                  Processing...
                </div>
              ) : (
                <>
                  {currentStep === 3 ? 'Complete Profile ✨' : 'Next →'}
                </>
              )}
            </button>
          </div>

          {/* Skip Option */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={handleSkip}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                textDecoration: 'underline'
              }}
            >
              Skip for now →
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

      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
          colors={['#10b981', '#38bdf8', '#a78bfa', '#fbbf24', '#ffffff']}
        />
      )}

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
