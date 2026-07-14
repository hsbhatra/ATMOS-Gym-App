// =============================================================================
// src/pages/NotFoundPage.jsx
// =============================================================================

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ParticleBackground from "../components/three/ParticleBackground.jsx";
import { heroContainer, heroItem } from "../utils/animations.js";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight      : "100vh",
      background     : "#0a0a0a",
      display        : "flex",
      alignItems     : "center",
      justifyContent : "center",
      position       : "relative",
      padding        : "24px",
    }}>
      <ParticleBackground particleCount={60} />

      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse at center, rgba(232,196,74,0.04) 0%, transparent 65%)", pointerEvents: "none" }} />

      <motion.div
        variants={heroContainer}
        initial="initial"
        animate="animate"
        style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "480px" }}>

        <motion.div variants={heroItem}>
          <p style={{ fontSize: "120px", lineHeight: 1, marginBottom: "16px", filter: "grayscale(0.3)" }}>
            💪
          </p>
        </motion.div>

        <motion.div variants={heroItem}>
          <h1 style={{
            fontSize     : "clamp(56px, 10vw, 96px)",
            fontWeight   : "900",
            letterSpacing: "-3px",
            lineHeight   : 1,
            marginBottom : "16px",
          }}>
            4<span style={{ color: "#e8c44a" }}>0</span>4
          </h1>
        </motion.div>

        <motion.div variants={heroItem}>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
            Page not found
          </p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: "1.7", marginBottom: "36px" }}>
            Looks like this page skipped leg day and doesn't exist.
            Let's get you back on track.
          </p>
        </motion.div>

        <motion.div variants={heroItem} style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/")} className="btn-gold"
            style={{ width: "auto", padding: "13px 28px", fontSize: "14px" }}>
            Back to Home
          </button>
          <button onClick={() => navigate(-1)} className="btn-ghost"
            style={{ padding: "13px 28px", fontSize: "14px" }}>
            Go Back
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
