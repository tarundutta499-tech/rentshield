import React, { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthProvider";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");   // ✅ redirect to homepage instead of dashboard
    }
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
    <div style={styles.page}>

      <div style={styles.card}>

        <h1 style={styles.title}>Welcome to RentShield</h1>
        <p style={styles.subtitle}>Secure rental management platform</p>

        {/* GOOGLE LOGIN */}
        <button onClick={handleGoogleLogin} style={styles.googleBtn}>
          Continue with Google
        </button>

        {/* DIVIDER */}
        <div style={styles.divider}>
          <span>OR</span>
        </div>

        {/* EMAIL LOGIN */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleEmailLogin} style={styles.loginBtn}>
          Login
        </button>

        <p style={styles.footerText}>
          By continuing, you agree to our Terms & Privacy Policy
        </p>

      </div>

    </div>
  );
}

/* STYLES */

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #4f46e5, #6366f1)"
  },

  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "16px",
    width: "350px",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
  },

  title: {
    fontSize: "28px",
    marginBottom: "5px"
  },

  subtitle: {
    color: "#666",
    marginBottom: "25px"
  },

  googleBtn: {
    width: "100%",
    padding: "12px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "20px"
  },

  divider: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0"
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd"
  },

  loginBtn: {
    width: "100%",
    padding: "12px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },

  footerText: {
    fontSize: "12px",
    marginTop: "20px",
    color: "#777"
  }
};
