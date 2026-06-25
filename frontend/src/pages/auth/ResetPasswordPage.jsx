// =============================================================================
// src/pages/auth/ResetPasswordPage.jsx
// =============================================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as THREE from "three";
import { resetPassword } from "../../services/authService.js";

// =============================================================================
// ParticleBackground
// =============================================================================
function ParticleBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount  = mountRef.current;
    const width  = mount.clientWidth;
    const height = mount.clientHeight;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    camera.position.z = 80;

    const COUNT      = 100;
    const positions  = new Float32Array(COUNT * 3);
    const velocities = [];
    for (let i = 0; i < COUNT; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 200;
      positions[i*3+1] = (Math.random() - 0.5) * 200;
      positions[i*3+2] = (Math.random() - 0.5) * 200;
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.06,
        (Math.random() - 0.5) * 0.06,
        (Math.random() - 0.5) * 0.06
      ));
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xe8c44a, size: 0.8, transparent: true, opacity: 0.6, sizeAttenuation: true,
    })));

    const lGeo = new THREE.BufferGeometry();
    const lPos  = new Float32Array(COUNT * COUNT * 6);
    lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
    scene.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({
      color: 0xe8c44a, transparent: true, opacity: 0.06,
    })));

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(24, 0.3, 8, 80),
      new THREE.MeshBasicMaterial({
        color: 0xe8c44a, transparent: true, opacity: 0.08, wireframe: true,
      })
    );
    scene.add(ring);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 0.2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.2;
    };
    window.addEventListener("mousemove", onMouse);

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
          if (Math.sqrt(dx*dx+dy*dy+dz*dz) < 30) {
            lPos[li++]=pos[i*3]; lPos[li++]=pos[i*3+1]; lPos[li++]=pos[i*3+2];
            lPos[li++]=pos[j*3]; lPos[li++]=pos[j*3+1]; lPos[li++]=pos[j*3+2];
          }
        }
      }
      lGeo.attributes.position.needsUpdate = true;
      lGeo.setDrawRange(0, li / 3);

      ring.rotation.x += 0.002;
      ring.rotation.y += 0.003;
      camera.position.x += (mouse.x * 15 - camera.position.x) * 0.02;
      camera.position.y += (-mouse.y * 15 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// =============================================================================
// PasswordStrength indicator
// =============================================================================
function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters",    pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number",           pass: /\d/.test(password) },
    { label: "Special character",pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];
  const score  = checks.filter((c) => c.pass).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  if (!password) return null;

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "2px",
            background: i < score ? colors[score - 1] : "rgba(255,255,255,0.08)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {checks.map((c) => (
          <span key={c.label} style={{
            fontSize: "11px", padding: "2px 8px", borderRadius: "100px",
            background: c.pass ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
            color: c.pass ? "#22c55e" : "rgba(255,255,255,0.3)",
            border: `1px solid ${c.pass ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)"}`,
            transition: "all 0.3s",
          }}>
            {c.pass ? "✓" : "·"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// ResetPasswordPage
// =============================================================================
export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const email       = sessionStorage.getItem("pendingEmail")  || "";
  const otpVerified = sessionStorage.getItem("otpVerified")   === "true";

  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [watchedPassword, setWatchedPassword] = useState("");

  // Guard — redirect if user didn't go through OTP verification
  useEffect(() => {
    if (!email || !otpVerified) {
      toast.error("Session expired. Please start the password reset process again.");
      navigate("/forgot-password");
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch("newPassword", "");
  useEffect(() => { setWatchedPassword(passwordValue); }, [passwordValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await resetPassword({
        email,
        newPassword       : data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });

      // Clean up all session storage
      sessionStorage.removeItem("pendingEmail");
      sessionStorage.removeItem("otpPurpose");
      sessionStorage.removeItem("otpVerified");

      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs && errs.length > 0) {
        errs.forEach((e) => toast.error(e, { duration: 4000 }));
      } else {
        toast.error(err.response?.data?.message || "Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative",
    }}>
      <ParticleBackground />

      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse at center, rgba(232,196,74,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "420px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "24px",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        padding: "40px 36px",
        textAlign: "center",
      }} className="page-enter">

        {!success ? (
          <>
            {/* Icon */}
            <div style={{
              width: "64px", height: "64px", borderRadius: "16px",
              background: "rgba(232,196,74,0.1)", border: "1px solid rgba(232,196,74,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", margin: "0 auto 24px",
            }}>🔒</div>

            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", letterSpacing: "-0.5px" }}>
              Set new password
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "32px", lineHeight: "1.6" }}>
              Create a strong password for{" "}
              <span style={{ color: "#e8c44a" }}>{email}</span>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>

              {/* New Password */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "8px" }}>
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="input-dark"
                    style={{ paddingRight: "44px", ...(errors.newPassword ? { borderColor: "rgba(239,68,68,0.6)" } : {}) }}
                    {...register("newPassword", {
                      required  : "New password is required",
                      minLength : { value: 8, message: "Minimum 8 characters" },
                    })}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: "14px", padding: "4px", transition: "color 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#e8c44a"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
                    {showNew ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.newPassword && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>{errors.newPassword.message}</p>}
                <PasswordStrength password={watchedPassword} />
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "8px" }}>
                  Confirm New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your new password"
                    className="input-dark"
                    style={{ paddingRight: "44px", ...(errors.confirmNewPassword ? { borderColor: "rgba(239,68,68,0.6)" } : {}) }}
                    {...register("confirmNewPassword", {
                      required: "Please confirm your new password",
                      validate: (val) => val === watch("newPassword") || "Passwords do not match",
                    })}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: "14px", padding: "4px", transition: "color 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#e8c44a"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.confirmNewPassword && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>{errors.confirmNewPassword.message}</p>}
              </div>

              {/* Submit */}
              <button type="submit" className="btn-gold" disabled={loading}
                style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                {loading ? (<><span className="spinner" />Resetting password...</>) : "Reset Password →"}
              </button>
            </form>

            <p style={{ marginTop: "24px" }}>
              <Link to="/forgot-password"
                style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}
                onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}>
                ← Start over
              </Link>
            </p>
          </>
        ) : (
          /* ── Success State ── */
          <div className="page-enter">
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "32px", margin: "0 auto 28px",
            }}>✅</div>

            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", letterSpacing: "-0.5px" }}>
              Password reset!
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", marginBottom: "32px", lineHeight: "1.7" }}>
              Your password has been updated successfully.
              You can now sign in with your new password.
            </p>

            {/* Decorative divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: "20px" }}>💪</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            </div>

            <button onClick={() => navigate("/login")} className="btn-gold">
              Sign In Now →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
