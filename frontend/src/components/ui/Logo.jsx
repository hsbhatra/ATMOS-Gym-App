// =============================================================================
// src/components/ui/Logo.jsx
// =============================================================================
// Single source of truth for the Hulk Gym logo.
// Change the name/colors here and it updates everywhere in the app.
// =============================================================================

import { useNavigate } from "react-router-dom";

export default function Logo({
  size      = "md",     // "sm" | "md" | "lg"
  clickable = true,     // clicking navigates to "/"
  style     = {},       // extra wrapper styles
}) {

  const navigate = useNavigate();

  // Size scale
  const scale = {
    sm: { box: 28, font: 14, text: 13, radius: 6,  gap: 8  },
    md: { box: 36, font: 18, text: 17, radius: 8,  gap: 10 },
    lg: { box: 48, font: 24, text: 22, radius: 10, gap: 12 },
  }[size] || scale?.md;

  return (
    <div
      onClick={clickable ? () => navigate("/") : undefined}
      style={{
        display    : "flex",
        alignItems : "center",
        gap        : `${scale.gap}px`,
        cursor     : clickable ? "pointer" : "default",
        userSelect : "none",
        ...style,
      }}
    >
      {/* Gold box with initial */}
      <div style={{
        width          : `${scale.box}px`,
        height         : `${scale.box}px`,
        borderRadius   : `${scale.radius}px`,
        background     : "#e8c44a",
        display        : "flex",
        alignItems     : "center",
        justifyContent : "center",
        fontWeight     : "900",
        color          : "#0a0a0a",
        fontSize       : `${scale.font}px`,
        flexShrink     : 0,
        lineHeight     : 1,
      }}>
        A
      </div>

      {/* Gym name */}
      <span style={{
        fontWeight   : "800",
        fontSize     : `${scale.text}px`,
        letterSpacing: "1.5px",
        lineHeight   : 1,
        whiteSpace   : "nowrap",
      }}>
        ATMOS{" "}
        <span style={{ color: "#e8c44a" }}>GYM</span>
      </span>
    </div>
  );
}
