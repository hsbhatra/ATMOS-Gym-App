// =============================================================================
// src/components/layout/Footer.jsx
// =============================================================================

import { useNavigate } from "react-router-dom";
import Logo from "../ui/Logo.jsx";

export default function Footer() {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Company",
      links: ["About Us", "Careers", "Press", "Blog"],
    },
    {
      title: "Programs",
      links: ["Strength", "Cardio", "HIIT", "Yoga", "Boxing"],
    },
    {
      title: "Support",
      links: ["Contact", "FAQs", "Privacy Policy", "Terms"],
    },
  ];

  const socials = [
    { label: "💪 Instagram", href: "#" },
    { label: "🐦 Twitter",   href: "#" },
    { label: "📘 Facebook",  href: "#" },
    { label: "▶️ YouTube",   href: "#" },
  ];

  const linkStyle = {
    fontSize  : "13px",
    color     : "rgba(255,255,255,0.3)",
    cursor    : "pointer",
    transition: "color 0.2s",
    marginBottom: "10px",
    display   : "block",
  };

  return (
    <footer style={{
      borderTop : "1px solid rgba(255,255,255,0.05)",
      padding   : "48px 16px 32px",
      position  : "relative",
      zIndex    : 1,
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Top row */}
        <div style={{
          gap                : "32px",
          marginBottom       : "48px",
        }}
          className="footer-grid">

          {/* Brand column */}
          <div>
            <Logo size="sm" clickable={false} style={{ marginBottom: "16px" }} />
            <p style={{
              fontSize  : "13px",
              color     : "rgba(255,255,255,0.35)",
              lineHeight: "1.8",
              maxWidth  : "260px",
            }}>
              India's premier fitness destination.
              Forging legends since 2009.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 style={{
                fontSize     : "12px",
                fontWeight   : "700",
                letterSpacing: "2px",
                color        : "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                marginBottom : "16px",
              }}>
                {col.title}
              </h4>
              {col.links.map((l) => (
                <span key={l} style={linkStyle}
                  onMouseEnter={(e) => e.target.style.color = "#e8c44a"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}>
                  {l}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{
          borderTop     : "1px solid rgba(255,255,255,0.05)",
          paddingTop    : "24px",
          display       : "flex",
          justifyContent: "space-between",
          alignItems    : "center",
          flexWrap      : "wrap",
          gap           : "16px",
        }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} ATMOS Gym Pvt. Ltd. All rights reserved.
          </span>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {socials.map((s) => (
              <a key={s.label} href={s.href} style={{ ...linkStyle, marginBottom: 0 }}
                onMouseEnter={(e) => e.target.style.color = "#e8c44a"}
                onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}>
                {s.label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
