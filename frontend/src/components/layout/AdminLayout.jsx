// =============================================================================
// src/components/layout/AdminLayout.jsx
// =============================================================================
// Shared shell for all admin pages — sidebar + top bar + content area.
// =============================================================================

import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../ui/Logo.jsx";
import { useAuthStore } from "../../store/authStore.js";

export default function AdminLayout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = useAuthStore((s) => s.user);
  const logout    = useAuthStore((s) => s.logout);

  const navItems = [
    { path: "/admin",         label: "Dashboard", icon: "📊" },
    { path: "/admin/plans",   label: "Plans",     icon: "📦" },
    { path: "/admin/members", label: "Members",   icon: "👥" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const sidebarItemStyle = (isActive) => ({
    display       : "flex",
    alignItems    : "center",
    gap           : "12px",
    padding       : "12px 16px",
    borderRadius  : "10px",
    cursor        : "pointer",
    background    : isActive ? "rgba(232,196,74,0.1)" : "transparent",
    border        : `1px solid ${isActive ? "rgba(232,196,74,0.2)" : "transparent"}`,
    color         : isActive ? "#e8c44a" : "rgba(255,255,255,0.5)",
    fontSize      : "14px",
    fontWeight    : isActive ? "600" : "400",
    transition    : "all 0.2s",
    textDecoration: "none",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>

      {/* Top bar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: "60px", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Logo size="sm" />
          <span style={{
            fontSize: "11px", padding: "3px 10px", borderRadius: "100px",
            background: "rgba(232,196,74,0.1)", border: "1px solid rgba(232,196,74,0.2)",
            color: "#e8c44a", fontWeight: "700", letterSpacing: "1px",
          }}>
            ADMIN
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            {user?.firstName} {user?.lastName}
          </span>
          <button onClick={() => navigate("/")} className="btn-ghost" style={{ padding: "7px 16px", fontSize: "13px" }}>
            Exit Admin
          </button>
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: "7px 16px", fontSize: "13px" }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Layout */}
      <div style={{ paddingTop: "60px", display: "flex" }}>

        {/* Sidebar */}
        <aside style={{
          width: "220px", flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.05)",
          padding: "24px 16px",
          position: "sticky", top: "60px",
          height: "calc(100vh - 60px)",
        }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {navItems.map((item) => (
              <div
                key={item.path}
                style={sidebarItemStyle(location.pathname === item.path)}
                onClick={() => navigate(item.path)}>
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: "32px 40px", maxWidth: "1200px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}