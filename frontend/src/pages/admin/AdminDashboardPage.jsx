// =============================================================================
// src/pages/admin/AdminDashboardPage.jsx
// =============================================================================

import AdminLayout from "../../components/layout/AdminLayout.jsx";

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>Dashboard</h1>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
        Revenue analytics coming soon.
      </p>
    </AdminLayout>
  );
}