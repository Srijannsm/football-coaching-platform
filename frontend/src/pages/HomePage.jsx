import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function HomePage() {
  return (
    <div>
      <Navbar />

      <section style={styles.hero}>
        <div style={styles.overlay}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>Elite Football Coaching for Every Player</h1>
            <p style={styles.heroText}>
              Build technique, confidence, and match performance through professional academy training.
            </p>

            <div style={styles.heroButtons}>
              <Link to="/register" style={styles.primaryBtn}>
                Join Academy
              </Link>

              <Link to="/training-sessions" style={styles.secondaryBtn}>
                View Training Sessions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Programs</h2>

        <div style={styles.cards}>
          <div style={styles.card}>
            <h3>Group Training</h3>
            <p>Improve technical ability, fitness, and decision-making in structured group sessions.</p>
          </div>

          <div style={styles.card}>
            <h3>1-to-1 Coaching</h3>
            <p>Get focused individual coaching designed around your strengths and areas for improvement.</p>
          </div>

          <div style={styles.card}>
            <h3>Goalkeeper Training</h3>
            <p>Specialist sessions to develop handling, positioning, reactions, and confidence in goal.</p>
          </div>
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to improve your game?</h2>

        <Link to="/register" style={styles.primaryBtn}>
          Register Now
        </Link>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    minHeight: "85vh",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    width: "100%",
    minHeight: "85vh",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 20px",
  },
  heroContent: {
    textAlign: "center",
    color: "#fff",
    maxWidth: "800px",
  },
  heroTitle: {
    fontSize: "3rem",
    marginBottom: "16px",
    fontWeight: "700",
    lineHeight: "1.2",
  },
  heroText: {
    fontSize: "1.2rem",
    marginBottom: "28px",
    lineHeight: "1.6",
  },
  heroButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryBtn: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "#d4af37",
    color: "#111",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "600",
  },
  secondaryBtn: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#fff",
    textDecoration: "none",
    border: "2px solid #fff",
    borderRadius: "8px",
    fontWeight: "600",
  },
  section: {
    padding: "70px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "2rem",
    marginBottom: "40px",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  },
  cta: {
    backgroundColor: "#111",
    color: "#fff",
    textAlign: "center",
    padding: "70px 20px",
  },
  ctaTitle: {
    fontSize: "2rem",
    marginBottom: "24px",
  },
};

export default HomePage;