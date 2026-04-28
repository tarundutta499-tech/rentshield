import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div style={styles.page}>

      {/* HERO WITH IMAGE */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>
            Rent Smarter. Live Safer.
          </h1>
          <p style={styles.heroSubtitle}>
            AI-powered rental verification, reputation & legal protection.
          </p>

          <div style={styles.heroButtons}>
            <Link to="/auth" style={styles.primaryBtn}>Get Started</Link>
            <Link to="/how-it-works" style={styles.secondaryBtn}>How it Works</Link>
          </div>
        </div>
      </section>

      {/* WHY RENTSHIELD */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.heading}>Why RentShield?</h2>

          <div style={styles.grid}>
            <FeatureCard
              icon="📄"
              title="Agreement Verification"
              desc="AI-powered analysis to detect hidden risks."
            />
            <FeatureCard
              icon="⭐"
              title="Rental Reputation"
              desc="Know who you're dealing with before you commit."
            />
            <FeatureCard
              icon="⚖️"
              title="Legal Support"
              desc="Instant help for disputes and legal notices."
            />
          </div>
        </div>
      </section>

      {/* IMAGE + TEXT */}
      <section style={styles.sectionLight}>
        <div style={styles.container}>
          <div style={styles.splitSection}>
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa"
              style={styles.image}
            />

            <div>
              <h2 style={styles.headingLeft}>Built for Modern Rentals</h2>
              <p style={styles.text}>
                Avoid fraud, build trust, and manage everything in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>
          Ready to Rent Smarter?
        </h2>

        <p style={styles.ctaSubtitle}>
          Join a smarter, safer rental ecosystem today.
        </p>

        <Link to="/auth" style={styles.primaryBtnWhite}>
          Get Started
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} RentShield
      </footer>

    </div>
  );
}

/* COMPONENTS */

const FeatureCard = ({ icon, title, desc }) => (
  <div
    style={styles.featureCard}
    onMouseEnter={(e)=> {
      e.currentTarget.style.transform="translateY(-10px)";
      e.currentTarget.style.boxShadow="0 25px 60px rgba(0,0,0,0.15)";
    }}
    onMouseLeave={(e)=> {
      e.currentTarget.style.transform="translateY(0)";
      e.currentTarget.style.boxShadow="0 15px 40px rgba(0,0,0,0.08)";
    }}
  >
    <div style={{ fontSize: "40px", marginBottom: "20px" }}>{icon}</div>

    <h3 style={{ fontSize: "22px", marginBottom: "10px" }}>
      {title}
    </h3>

    <p style={{ color: "#555", lineHeight: "1.6" }}>
      {desc}
    </p>
  </div>
);

/* STYLES */

const styles = {
  page: { fontFamily: "Arial, sans-serif", background: "#f9fafb" },

  hero: {
    height: "90vh",
    backgroundImage: "url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2)",
    backgroundSize: "cover",
    backgroundPosition: "center"
  },

  heroOverlay: {
    height: "100%",
    background: "rgba(0,0,0,0.65)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },

  heroTitle: { 
    fontSize: "52px", 
    fontWeight: "800", 
    marginBottom: "20px" 
  },

  heroSubtitle: { 
    fontSize: "18px", 
    maxWidth: "650px", 
    marginBottom: "30px" 
  },

  heroButtons: { display: "flex", gap: "15px" },

  container: { maxWidth: "1200px", margin: "auto" },

  section: { 
    padding: "100px 20px", 
    textAlign: "center",
    background: "#f9fafb"
  },

  sectionLight: { 
    padding: "100px 20px", 
    textAlign: "center",
    background: "#f3f4f6"
  },

  heading: { 
    fontSize: "40px", 
    fontWeight: "700", 
    marginBottom: "60px" 
  },

  headingLeft: { 
    fontSize: "40px", 
    fontWeight: "700", 
    marginBottom: "20px" 
  },

  grid: {
    display: "flex",
    gap: "30px",
    justifyContent: "center",
    flexWrap: "wrap"
  },

  featureCard: {
    background: "#fff",
    padding: "40px 25px",
    borderRadius: "18px",
    width: "300px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer"
  },

  splitSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    alignItems: "center"
  },

  image: { width: "100%", borderRadius: "12px" },

  text: { 
    color: "#555",
    lineHeight: "1.6"
  },

  cta: {
    margin: "60px 20px",
    padding: "100px 20px",
    textAlign: "center",
    background: "linear-gradient(to right, #4f46e5, #6366f1)",
    color: "white",
    borderRadius: "20px"
  },

  ctaTitle: {
    fontSize: "36px",
    marginBottom: "20px"
  },

  ctaSubtitle: {
    marginBottom: "30px",
    opacity: 0.9
  },

  footer: { textAlign: "center", padding: "20px", color: "#777" },

  primaryBtn: {
    padding: "12px 25px",
    background: "#4f46e5",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none"
  },

  secondaryBtn: {
    padding: "12px 25px",
    border: "1px solid white",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none"
  },

  primaryBtnWhite: {
    padding: "14px 35px",
    background: "white",
    color: "#4f46e5",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold"
  }
};
