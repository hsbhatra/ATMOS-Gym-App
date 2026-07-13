// =============================================================================
// src/components/ui/AppLoader.jsx
// =============================================================================
// Shown while the app is silently restoring the user's session on startup.
// Without this, the app would briefly show the login page before restoring.
// =============================================================================

export default function AppLoader() {
  return (
    <div style={{
      minHeight    : "100vh",
      background   : "#0a0a0a",
      display      : "flex",
      alignItems   : "center",
      justifyContent: "center",
      flexDirection: "column",
      gap          : "20px",
    }}>
      <div style={{
        width       : "44px",
        height      : "44px",
        borderRadius: "10px",
        background  : "#e8c44a",
        display     : "flex",
        alignItems  : "center",
        justifyContent: "center",
        fontWeight  : "900",
        color       : "#0a0a0a",
        fontSize    : "22px",
        animation   : "pulse 1.5s ease-in-out infinite",
      }}>A</div>
      <div className="spinner" style={{
        borderColor   : "rgba(255,255,255,0.1)",
        borderTopColor: "#e8c44a",
        width         : "24px",
        height        : "24px",
      }} />
    </div>
  );
}