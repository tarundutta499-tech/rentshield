import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../state/AuthProvider.jsx';

export default function ProfileGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // DEBUG: Log component lifecycle
  useEffect(() => {
    console.log('[ProfileGuard] Component mounted');
    return () => {
      console.log('[ProfileGuard] Component unmounting');
    };
  }, []);

  useEffect(() => {
    console.log('[ProfileGuard] Check profile effect triggered', { authLoading, user: user?.uid });
    if (authLoading) return;

    const checkProfile = async () => {
      if (!user) {
        console.log('[ProfileGuard] No user, redirecting to /auth');
        navigate("/auth");
        return;
      }

      try {
        console.log('[ProfileGuard] Checking profile completion for user:', user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const profileCompleted = userDoc.exists() && userDoc.data().profileCompleted;
        console.log('[ProfileGuard] Profile check result:', { exists: userDoc.exists(), profileCompleted });
        
        if (!userDoc.exists() || !userDoc.data().profileCompleted) {
          console.log('[ProfileGuard] Profile not complete, redirecting to /complete-profile');
          navigate("/complete-profile");
          return;
        }
        setProfileComplete(true);
      } catch (error) {
        console.error("Profile check error:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
        color: 'white',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(16, 185, 129, 0.3)',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  return profileComplete ? children : null;
}
