// =============================================================================
// src/pages/profile/ProfilePage.jsx
// =============================================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as THREE from "three";
import { useAuthStore } from "../../store/authStore.js";
import {
  getProfile,
  updateProfile,
  updateProfilePicture,
  deleteProfilePicture,
} from "../../services/profileService.js";
import {
  getSessions,
  logoutUser,
  logoutAllDevices,
  changePassword,
} from "../../services/authService.js";

// =============================================================================
// ParticleBackground
// =============================================================================
function ParticleBackground() {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    camera.position.z = 80;

    const COUNT = 80;
    const positions = new Float32Array(COUNT * 3);
    const velocities = [];
    for (let i = 0; i < COUNT; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 200;
      positions[i*3+1] = (Math.random() - 0.5) * 200;
      positions[i*3+2] = (Math.random() - 0.5) * 200;
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05
      ));
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xe8c44a, size: 0.7, transparent: true, opacity: 0.5, sizeAttenuation: true })));

    const lGeo = new THREE.BufferGeometry();
    const lPos = new Float32Array(COUNT * COUNT * 6);
    lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
    scene.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color: 0xe8c44a, transparent: true, opacity: 0.04 })));

    let id;
    const pos = pGeo.attributes.position.array;
    const animate = () => {
      id = requestAnimationFrame(animate);
      for (let i = 0; i < COUNT; i++) {
        pos[i*3]   += velocities[i].x;
        pos[i*3+1] += velocities[i].y;
        pos[i*3+2] += velocities[i].z;
        if (Math.abs(pos[i*3])   > 100) velocities[i].x *= -1;
        if (Math.abs(pos[i*3+1]) > 100) velocities[i].y *= -1;
        if (Math.abs(pos[i*3+2]) > 100) velocities[i].z *= -1;
      }
      pGeo.attributes.position.needsUpdate = true;
      let li = 0;
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = pos[i*3]-pos[j*3], dy = pos[i*3+1]-pos[j*3+1], dz = pos[i*3+2]-pos[j*3+2];
          if (Math.sqrt(dx*dx+dy*dy+dz*dz) < 28) {
            lPos[li++]=pos[i*3]; lPos[li++]=pos[i*3+1]; lPos[li++]=pos[i*3+2];
            lPos[li++]=pos[j*3]; lPos[li++]=pos[j*3+1]; lPos[li++]=pos[j*3+2];
          }
        }
      }
      lGeo.attributes.position.needsUpdate = true;
      lGeo.setDrawRange(0, li / 3);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);
  return <div ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// =============================================================================
// Confirm Dialog
// =============================================================================
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{
        background: "#111", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px", padding: "36px", maxWidth: "400px", width: "100%",
        textAlign: "center",
      }} className="page-enter">
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "12px" }}>Are you sure?</h3>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "28px", lineHeight: "1.6" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onCancel} className="btn-ghost" style={{ flex: 1, padding: "12px" }}>
            No, cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "12px", borderRadius: "10px", border: "none",
            background: "#ef4444", color: "white", fontWeight: "600",
            fontSize: "14px", cursor: "pointer", transition: "background 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#dc2626"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#ef4444"}>
            Yes, proceed
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ProfileSection
// =============================================================================
function ProfileSection({ user, onUpdate }) {
  const [editing, setEditing]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [removing, setRemoving]     = useState(false);
  const fileInputRef                = useRef(null);
  const setStoreUser                = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({
    firstName  : user.firstName   || "",
    lastName   : user.lastName    || "",
    height     : user.height      || "",
    weight     : user.weight      || "",
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    gender     : user.gender      || "",
    bio        : user.bio         || "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.height)      delete payload.height;
      if (!payload.weight)      delete payload.weight;
      if (!payload.dateOfBirth) delete payload.dateOfBirth;
      if (!payload.gender)      delete payload.gender;
      if (!payload.bio)         delete payload.bio;

      const res = await updateProfile(payload);
      const updated = res.data.data.user;
      onUpdate(updated);
      setStoreUser(updated);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePicture", file);
    setUploading(true);
    try {
      const res = await updateProfilePicture(formData);
      const updated = res.data.data.user;
      onUpdate(updated);
      setStoreUser(updated);
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    setRemoving(true);
    try {
      const res = await deleteProfilePicture();
      const updated = res.data.data.user;
      onUpdate(updated);
      setStoreUser(updated);
      toast.success("Profile picture removed.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove picture.");
    } finally {
      setRemoving(false);
    }
  };

  const inputStyle = (disabled) => ({
    width: "100%", background: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${disabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "10px", padding: "11px 14px", color: disabled ? "rgba(255,255,255,0.35)" : "#fff",
    fontSize: "14px", outline: "none", cursor: disabled ? "not-allowed" : "text",
    transition: "border-color 0.2s, background 0.2s",
  });

  const labelStyle = { fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "8px" };

  return (
    <div>
      {/* Avatar row */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "36px", padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: "88px", height: "88px", borderRadius: "50%",
            border: "2px solid rgba(232,196,74,0.3)",
            overflow: "hidden", background: "#1a1a1a",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "32px", fontWeight: "800", color: "#e8c44a" }}>
                {user.firstName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          {/* Upload overlay */}
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            style={{
              position: "absolute", inset: 0, borderRadius: "50%", border: "none",
              background: "rgba(0,0,0,0)", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.5)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0)"}>
            <span style={{ fontSize: "18px", opacity: 0, transition: "opacity 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
              📷
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePictureUpload} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>
            {user.firstName} {user.lastName}
          </h2>
          <p style={{ fontSize: "13px", color: "#e8c44a", fontWeight: "600", marginBottom: "8px" }}>
            @{user.userId || "hulkgym_user"}
          </p>
          <span style={{
            fontSize: "11px", padding: "3px 10px", borderRadius: "100px",
            background: "rgba(232,196,74,0.1)", border: "1px solid rgba(232,196,74,0.2)",
            color: "#e8c44a", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px",
          }}>
            {user.role}
          </span>
        </div>

        {/* Picture actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(232,196,74,0.3)", background: "rgba(232,196,74,0.08)", color: "#e8c44a", fontSize: "12px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>
            {uploading ? "Uploading..." : "Change Photo"}
          </button>
          {user.profilePicture && (
            <button onClick={handleRemovePicture} disabled={removing}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#ef4444", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
              {removing ? "Removing..." : "Remove"}
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Section: Personal Info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase" }}>
              Personal Information
            </h3>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid rgba(232,196,74,0.3)", background: "rgba(232,196,74,0.08)", color: "#e8c44a", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                Edit Profile
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setEditing(false)}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: "12px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ padding: "7px 16px", borderRadius: "8px", border: "none", background: "#e8c44a", color: "#0a0a0a", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {/* First Name */}
            <div>
              <label style={labelStyle}>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} disabled={!editing}
                style={inputStyle(!editing)}
                onFocus={(e) => { if (editing) e.target.style.borderColor = "#e8c44a"; }}
                onBlur={(e) => { e.target.style.borderColor = editing ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"; }} />
            </div>
            {/* Last Name */}
            <div>
              <label style={labelStyle}>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} disabled={!editing}
                style={inputStyle(!editing)}
                onFocus={(e) => { if (editing) e.target.style.borderColor = "#e8c44a"; }}
                onBlur={(e) => { e.target.style.borderColor = editing ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"; }} />
            </div>
            {/* Email — read only */}
            <div>
              <label style={labelStyle}>Email Address <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: "400", textTransform: "none", letterSpacing: 0, fontSize: "11px" }}>(cannot be changed)</span></label>
              <input value={user.email} disabled style={{ ...inputStyle(true), cursor: "not-allowed" }} />
            </div>
            {/* Phone — read only */}
            <div>
              <label style={labelStyle}>Phone Number <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: "400", textTransform: "none", letterSpacing: 0, fontSize: "11px" }}>(cannot be changed)</span></label>
              <input value={`+91 ${user.phoneNumber}`} disabled style={{ ...inputStyle(true), cursor: "not-allowed" }} />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

        {/* Section: Body Information */}
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
            Body Information
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {/* Height */}
            <div>
              <label style={labelStyle}>Height (cm)</label>
              <input type="number" name="height" value={form.height} onChange={handleChange} disabled={!editing}
                placeholder="e.g. 175" style={inputStyle(!editing)}
                onFocus={(e) => { if (editing) e.target.style.borderColor = "#e8c44a"; }}
                onBlur={(e) => { e.target.style.borderColor = editing ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"; }} />
            </div>
            {/* Weight */}
            <div>
              <label style={labelStyle}>Weight (kg)</label>
              <input type="number" name="weight" value={form.weight} onChange={handleChange} disabled={!editing}
                placeholder="e.g. 70" style={inputStyle(!editing)}
                onFocus={(e) => { if (editing) e.target.style.borderColor = "#e8c44a"; }}
                onBlur={(e) => { e.target.style.borderColor = editing ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"; }} />
            </div>
            {/* Date of Birth */}
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} disabled={!editing}
                style={{ ...inputStyle(!editing), colorScheme: "dark" }}
                onFocus={(e) => { if (editing) e.target.style.borderColor = "#e8c44a"; }}
                onBlur={(e) => { e.target.style.borderColor = editing ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"; }} />
            </div>
            {/* Gender */}
            <div>
              <label style={labelStyle}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} disabled={!editing}
                style={{ ...inputStyle(!editing), appearance: "none" }}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="preferNotToSay">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div style={{ marginTop: "14px" }}>
            <label style={labelStyle}>Bio <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: "400", textTransform: "none", letterSpacing: 0, fontSize: "11px" }}>({200 - (form.bio?.length || 0)} chars remaining)</span></label>
            <textarea name="bio" value={form.bio} onChange={handleChange} disabled={!editing}
              placeholder="Tell us about yourself..."
              maxLength={200}
              rows={3}
              style={{ ...inputStyle(!editing), resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" }}
              onFocus={(e) => { if (editing) e.target.style.borderColor = "#e8c44a"; }}
              onBlur={(e) => { e.target.style.borderColor = editing ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"; }} />
          </div>
        </div>

        {/* Account info (read-only) */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
            Account Information
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Member ID</label>
              <input value={user.userId || "—"} disabled style={inputStyle(true)} />
            </div>
            <div>
              <label style={labelStyle}>Account Role</label>
              <input value={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} disabled style={inputStyle(true)} />
            </div>
            <div>
              <label style={labelStyle}>Member Since</label>
              <input value={new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} disabled style={inputStyle(true)} />
            </div>
            <div>
              <label style={labelStyle}>Email Verified</label>
              <input value={user.isEmailVerified ? "✓ Verified" : "✗ Not Verified"} disabled
                style={{ ...inputStyle(true), color: user.isEmailVerified ? "#22c55e" : "#ef4444" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SessionsSection
// =============================================================================
function SessionsSection({ onLogout }) {
  const [sessions, setSessions]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [confirm, setConfirm]       = useState(null); // { type: 'single'|'all', sessionId? }
  const [revoking, setRevoking]     = useState(null);
  const navigate                    = useNavigate();
  const storeLogout                 = useAuthStore((s) => s.logout);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await getSessions();
      setSessions(res.data.data.sessions);
    } catch {
      toast.error("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeOne = async (sessionId) => {
    setRevoking(sessionId);
    setConfirm(null);
    try {
      await logoutUser();
      storeLogout();
      toast.success("Session ended. Please log in again.");
      navigate("/login");
    } catch {
      toast.error("Failed to end session.");
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    setConfirm(null);
    try {
      await logoutAllDevices();
      storeLogout();
      toast.success("Logged out from all devices.");
      navigate("/login");
    } catch {
      toast.error("Failed to logout from all devices.");
    }
  };

  const deviceIcon = (deviceName = "") => {
    if (/iphone|ipad|ios/i.test(deviceName)) return "📱";
    if (/android/i.test(deviceName))          return "📱";
    if (/mac/i.test(deviceName))              return "💻";
    if (/windows/i.test(deviceName))          return "🖥️";
    return "🌐";
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return "Just now";
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div>
      {confirm && (
        <ConfirmDialog
          message={confirm.type === "all"
            ? "This will log you out from ALL devices immediately. You'll need to sign in again on each device."
            : "This will end the current session and log you out immediately."}
          onConfirm={() => confirm.type === "all" ? handleRevokeAll() : handleRevokeOne(confirm.sessionId)}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "4px" }}>Active Sessions</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            {sessions.length} device{sessions.length !== 1 ? "s" : ""} currently signed in
          </p>
        </div>
        <button
          onClick={() => setConfirm({ type: "all" })}
          style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>
          Logout All Devices
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "rgba(255,255,255,0.3)" }}>
          <div className="spinner" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "#e8c44a", margin: "0 auto 12px" }} />
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: "rgba(255,255,255,0.3)" }}>
          No active sessions found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sessions.map((s) => (
            <div key={s._id} style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "18px 20px", borderRadius: "14px",
              background: s.isCurrent ? "rgba(232,196,74,0.05)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${s.isCurrent ? "rgba(232,196,74,0.2)" : "rgba(255,255,255,0.05)"}`,
            }}>
              {/* Device Icon */}
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                background: s.isCurrent ? "rgba(232,196,74,0.1)" : "rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
              }}>
                {deviceIcon(s.deviceInfo?.deviceName)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.deviceInfo?.deviceName || "Unknown Device"}
                  </span>
                  {s.isCurrent && (
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "100px", background: "rgba(232,196,74,0.15)", color: "#e8c44a", fontWeight: "700", letterSpacing: "0.5px", flexShrink: 0 }}>
                      THIS DEVICE
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                    {s.deviceInfo?.platform || "Unknown"}
                  </span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                    {s.deviceInfo?.ipAddress || "—"}
                  </span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                    Last active {timeAgo(s.lastUsedAt)}
                  </span>
                </div>
              </div>

              {/* End Session */}
              <button
                onClick={() => setConfirm({ type: "single", sessionId: s._id })}
                disabled={revoking === s._id}
                style={{
                  padding: "7px 14px", borderRadius: "8px", flexShrink: 0,
                  border: "1px solid rgba(239,68,68,0.2)", background: "transparent",
                  color: "#ef4444", fontSize: "12px", fontWeight: "600", cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                {revoking === s._id ? "Ending..." : "End Session"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ChangePasswordSection
// =============================================================================
function ChangePasswordSection() {
  const navigate                      = useNavigate();
  const storeLogout                   = useAuthStore((s) => s.logout);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [confirm, setConfirm]         = useState(false);
  const [formData, setFormData]       = useState(null);

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.currentPassword)                            e.currentPassword    = "Current password is required";
    if (!form.newPassword)                                e.newPassword        = "New password is required";
    else if (form.newPassword.length < 8)                 e.newPassword        = "Minimum 8 characters";
    else if (!/[A-Z]/.test(form.newPassword))             e.newPassword        = "Must contain an uppercase letter";
    else if (!/\d/.test(form.newPassword))                e.newPassword        = "Must contain a number";
    else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.newPassword))
                                                          e.newPassword        = "Must contain a special character";
    if (!form.confirmNewPassword)                         e.confirmNewPassword = "Please confirm your new password";
    else if (form.newPassword !== form.confirmNewPassword) e.confirmNewPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setFormData(form);
    setConfirm(true);
  };

  const handleConfirmedChange = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      await changePassword({
        currentPassword   : formData.currentPassword,
        newPassword       : formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });
      toast.success("Password changed! Please log in again.");
      storeLogout();
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "11px 44px 11px 14px", color: "#fff", fontSize: "14px", outline: "none", transition: "border-color 0.2s" };
  const labelStyle = { fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "8px" };

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle}
      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: "14px", padding: "4px" }}
      onMouseEnter={(e) => e.currentTarget.style.color = "#e8c44a"}
      onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
      {show ? "🙈" : "👁️"}
    </button>
  );

  return (
    <div style={{ maxWidth: "480px" }}>
      {confirm && (
        <ConfirmDialog
          message="Are you sure you want to change your password? You will be logged out and need to sign in again with your new password."
          onConfirm={handleConfirmedChange}
          onCancel={() => setConfirm(false)}
        />
      )}

      <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>Change Password</h2>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "28px", lineHeight: "1.6" }}>
        After changing your password you will be logged out and need to sign in again.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Current Password */}
        <div>
          <label style={labelStyle}>Current Password</label>
          <div style={{ position: "relative" }}>
            <input type={showCurrent ? "text" : "password"} placeholder="Enter current password"
              style={{ ...inputStyle, ...(errors.currentPassword ? { borderColor: "rgba(239,68,68,0.5)" } : {}) }}
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              onFocus={(e) => e.target.style.borderColor = "#e8c44a"}
              onBlur={(e) => e.target.style.borderColor = errors.currentPassword ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"} />
            <EyeBtn show={showCurrent} toggle={() => setShowCurrent(!showCurrent)} />
          </div>
          {errors.currentPassword && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>{errors.currentPassword}</p>}
        </div>

        {/* New Password */}
        <div>
          <label style={labelStyle}>New Password</label>
          <div style={{ position: "relative" }}>
            <input type={showNew ? "text" : "password"} placeholder="Enter new password"
              style={{ ...inputStyle, ...(errors.newPassword ? { borderColor: "rgba(239,68,68,0.5)" } : {}) }}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              onFocus={(e) => e.target.style.borderColor = "#e8c44a"}
              onBlur={(e) => e.target.style.borderColor = errors.newPassword ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"} />
            <EyeBtn show={showNew} toggle={() => setShowNew(!showNew)} />
          </div>
          {errors.newPassword && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>{errors.newPassword}</p>}
        </div>

        {/* Confirm New Password */}
        <div>
          <label style={labelStyle}>Confirm New Password</label>
          <div style={{ position: "relative" }}>
            <input type={showConfirm ? "text" : "password"} placeholder="Repeat new password"
              style={{ ...inputStyle, ...(errors.confirmNewPassword ? { borderColor: "rgba(239,68,68,0.5)" } : {}) }}
              value={form.confirmNewPassword}
              onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })}
              onFocus={(e) => e.target.style.borderColor = "#e8c44a"}
              onBlur={(e) => e.target.style.borderColor = errors.confirmNewPassword ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"} />
            <EyeBtn show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
          </div>
          {errors.confirmNewPassword && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>{errors.confirmNewPassword}</p>}
        </div>

        <button type="submit" className="btn-gold" disabled={loading}
          style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          {loading ? (<><span className="spinner" />Changing password...</>) : "Change Password →"}
        </button>
      </form>
    </div>
  );
}

// =============================================================================
// ProfilePage — Main Component
// =============================================================================
export default function ProfilePage() {
  const navigate                = useNavigate();
  const storeLogout             = useAuthStore((s) => s.logout);
  const storeUser               = useAuthStore((s) => s.user);
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setUser(res.data.data.user);
    } catch {
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    storeLogout();
    toast.success("Logged out successfully.");
    navigate("/");
  };

  const navItems = [
    { id: "profile",  label: "Profile",         icon: "👤" },
    { id: "sessions", label: "Active Sessions",  icon: "🖥️" },
    { id: "password", label: "Change Password",  icon: "🔒" },
  ];

  const sidebarItemStyle = (isActive) => ({
    display: "flex", alignItems: "center", gap: "12px",
    padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
    background: isActive ? "rgba(232,196,74,0.1)" : "transparent",
    border: `1px solid ${isActive ? "rgba(232,196,74,0.2)" : "transparent"}`,
    color: isActive ? "#e8c44a" : "rgba(255,255,255,0.5)",
    fontSize: "14px", fontWeight: isActive ? "600" : "400",
    transition: "all 0.2s", userSelect: "none",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", position: "relative" }}>
      <ParticleBackground />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(232,196,74,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* ── Top Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: "60px", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#e8c44a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#0a0a0a", fontSize: "16px" }}>H</div>
          <span style={{ fontWeight: "800", fontSize: "16px", letterSpacing: "1.5px" }}>HULK <span style={{ color: "#e8c44a" }}>GYM</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user && (
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
              Hi, <span style={{ color: "#e8c44a", fontWeight: "600" }}>{user.firstName}</span>
            </span>
          )}
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: "7px 16px", fontSize: "13px" }}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── Main Layout ── */}
      <div style={{ paddingTop: "60px", minHeight: "100vh", display: "flex", position: "relative", zIndex: 1 }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: "240px", flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.05)",
          padding: "32px 16px",
          position: "sticky", top: "60px", height: "calc(100vh - 60px)",
          display: "flex", flexDirection: "column",
          background: "rgba(10,10,10,0.5)",
        }}>
          {/* User mini card */}
          {user && (
            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "24px", textAlign: "center" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "50%", margin: "0 auto 10px",
                background: "#1a1a1a", border: "2px solid rgba(232,196,74,0.3)",
                overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "20px", fontWeight: "800", color: "#e8c44a" }}>{user.firstName?.[0]}</span>
                )}
              </div>
              <p style={{ fontSize: "14px", fontWeight: "700", marginBottom: "2px" }}>{user.firstName} {user.lastName}</p>
              <p style={{ fontSize: "11px", color: "#e8c44a", fontWeight: "600" }}>@{user.userId}</p>
            </div>
          )}

          {/* Nav items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
            {navItems.map((item) => (
              <div key={item.id}
                style={sidebarItemStyle(activeTab === item.id)}
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={(e) => { if (activeTab !== item.id) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; } }}
                onMouseLeave={(e) => { if (activeTab !== item.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}>
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          {/* Back to home */}
          <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={sidebarItemStyle(false)} onClick={() => navigate("/")}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
              <span>🏠</span>
              <span>Back to Home</span>
            </div>
          </div>
        </aside>

        {/* ── Content Area ── */}
        <main style={{ flex: 1, padding: "40px 48px", maxWidth: "900px", overflowY: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "rgba(255,255,255,0.3)" }}>
              <div style={{ textAlign: "center" }}>
                <div className="spinner" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "#e8c44a", width: "32px", height: "32px", margin: "0 auto 16px" }} />
                Loading your profile...
              </div>
            </div>
          ) : (
            <div className="page-enter" key={activeTab}>
              {activeTab === "profile"  && <ProfileSection user={user} onUpdate={setUser} />}
              {activeTab === "sessions" && <SessionsSection onLogout={() => navigate("/")} />}
              {activeTab === "password" && <ChangePasswordSection />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
