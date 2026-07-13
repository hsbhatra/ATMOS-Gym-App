// =============================================================================
// src/components/ui/ConfirmDialog.jsx
// =============================================================================

export default function ConfirmDialog({
  message,
  confirmLabel = "Yes, proceed",
  cancelLabel  = "No, cancel",
  danger       = true,   // true → red confirm button, false → gold
  onConfirm,
  onCancel,
}) {
  return (
    <div style={{
      position      : "fixed",
      inset         : 0,
      zIndex        : 200,
      background    : "rgba(0,0,0,0.75)",
      backdropFilter: "blur(8px)",
      display       : "flex",
      alignItems    : "center",
      justifyContent: "center",
      padding       : "24px",
    }}>
      <div style={{
        background  : "#111111",
        border      : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding     : "36px",
        maxWidth    : "400px",
        width       : "100%",
        textAlign   : "center",
      }} className="page-enter">

        {/* Icon */}
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>

        {/* Title */}
        <h3 style={{
          fontSize    : "18px",
          fontWeight  : "700",
          marginBottom: "12px",
        }}>
          Are you sure?
        </h3>

        {/* Message */}
        <p style={{
          fontSize    : "14px",
          color       : "rgba(255,255,255,0.5)",
          marginBottom: "28px",
          lineHeight  : "1.6",
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            className="btn-ghost"
            style={{ flex: 1, padding: "12px" }}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex        : 1,
              padding     : "12px",
              borderRadius: "10px",
              border      : "none",
              background  : danger ? "#ef4444" : "#e8c44a",
              color       : danger ? "#ffffff" : "#0a0a0a",
              fontWeight  : "600",
              fontSize    : "14px",
              cursor      : "pointer",
              transition  : "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = danger ? "#dc2626" : "#f0d060";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = danger ? "#ef4444" : "#e8c44a";
            }}>
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
}
