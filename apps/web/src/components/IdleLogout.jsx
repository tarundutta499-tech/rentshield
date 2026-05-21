import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase.js";
import { useAuth } from "../state/AuthProvider.jsx";

function IdleLogout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // For testing, use 10 seconds. Change to 7 * 60 * 1000 for production
    const IDLE_TIMEOUT = 7 * 60 * 1000; // 7 minutes

    const logoutUser = async () => {
      console.log("User logged out due to inactivity");
      await signOut(auth);
      navigate("/", { replace: true });
    };

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(logoutUser, IDLE_TIMEOUT);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, navigate]);

  return null;
}

export default IdleLogout;
