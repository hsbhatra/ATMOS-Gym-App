// =============================================================================
// src/pages/auth/RegisterPage.jsx
// =============================================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as THREE from "three";
import { registerUser } from "../../services/authService.js";

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
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xe8c44a, size: 0.8, transparent: true, opacity: 0.6, sizeAttenuation: true })));

    const lGeo = new THREE.BufferGeometry();
    const lPos  = new Float32Array(COUNT * COUNT * 6);
    lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
    scene.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color: 0xe8c44a, transparent: true, opacity: 0.06 })));

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(24, 0.3, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0xe8c44a, transparent: true, opacity: 0.08, wireframe: true })
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
// Password Strength Indicator
// =============================================================================
function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters",        pass: password.length >= 8 },
    { label: "Uppercase letter",      pass: /[A-Z]/.test(password) },
    { label: "Number",                pass: /\d/.test(password) },
    { label: "Special character",     pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const score = checks.filter((c) => c.pass).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div style={{ marginTop: "10px" }}>
      {/* Strength bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "2px",
            background: i < score ? colors[score - 1] : "rgba(255,255,255,0.08)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      {/* Checks */}
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
// RegisterPage
// =============================================================================
export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading]                  = useState(false);
  const [watchedPassword, setWatchedPassword]  = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Watch password field for strength indicator
  const passwordValue = watch("password", "");
  useEffect(() => { setWatchedPassword(passwordValue); }, [passwordValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({
        firstName      : data.firstName,
        lastName       : data.lastName,
        email          : data.email,
        phoneNumber    : data.phoneNumber,
        password       : data.password,
        confirmPassword: data.confirmPassword,
      });

      // Store email temporarily so OTP page knows which email to verify
      sessionStorage.setItem("pendingEmail", data.email);
      sessionStorage.setItem("otpPurpose", "registration");

      toast.success("OTP sent to your email! Check your inbox.");
      navigate("/verify-otp");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      // Show validation errors if any
      const errs = err.response?.data?.errors;
      if (errs && errs.length > 0) {
        errs.forEach((e) => toast.error(e, { duration: 4000 }));
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px", position: "relative" }}>
      <ParticleBackground />

      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse at center, rgba(232,196,74,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "480px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "24px",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        padding: "40px 36px",
      }} className="page-enter">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "#e8c44a", display: "flex", alignItems: "center",
              justifyContent: "center", fontWeight: "900", color: "#0a0a0a", fontSize: "20px",
            }}>H</div>
            <span style={{ fontWeight: "800", fontSize: "18px", letterSpacing: "1.5px" }}>
              HULK <span style={{ color: "#e8c44a" }}>GYM</span>
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", letterSpacing: "-0.5px" }}>
            Create your account
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            Join thousands of members already training
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* First Name + Last Name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "8px" }}>
                First Name
              </label>
              <input
                placeholder="Hulk"
                className="input-dark"
                style={errors.firstName ? { borderColor: "rgba(239,68,68,0.6)" } : {}}
                {...register("firstName", {
                  required: "Required",
                  minLength: { value: 2, message: "Min 2 chars" },
                })}
              />
              {errors.firstName && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "5px" }}>{errors.firstName.message}</p>}
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "8px" }}>
                Last Name
              </label>
              <input
                placeholder="Gym"
                className="input-dark"
                style={errors.lastName ? { borderColor: "rgba(239,68,68,0.6)" } : {}}
                {...register("lastName", {
                  required: "Required",
                  minLength: { value: 2, message: "Min 2 chars" },
                })}
              />
              {errors.lastName && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "5px" }}>{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "8px" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="input-dark"
              style={errors.email ? { borderColor: "rgba(239,68,68,0.6)" } : {}}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
              })}
            />
            {errors.email && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "8px" }}>
              Phone Number
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                fontSize: "13px", color: "rgba(255,255,255,0.3)", fontWeight: "500",
              }}>+91</span>
              <input
                type="tel"
                placeholder="9876543210"
                className="input-dark"
                style={{ paddingLeft: "44px", ...(errors.phoneNumber ? { borderColor: "rgba(239,68,68,0.6)" } : {}) }}
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit Indian mobile number" },
                })}
              />
            </div>
            {errors.phoneNumber && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>{errors.phoneNumber.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                className="input-dark"
                style={{ paddingRight: "44px", ...(errors.password ? { borderColor: "rgba(239,68,68,0.6)" } : {}) }}
                {...register("password", { required: "Password is required", minLength: { value: 8, message: "Minimum 8 characters" } })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: "14px", padding: "4px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#e8c44a"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>{errors.password.message}</p>}
            <PasswordStrength password={watchedPassword} />
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "8px" }}>
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat your password"
                className="input-dark"
                style={{ paddingRight: "44px", ...(errors.confirmPassword ? { borderColor: "rgba(239,68,68,0.6)" } : {}) }}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) => val === watch("password") || "Passwords do not match",
                })}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: "14px", padding: "4px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#e8c44a"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit */}
          <button type="submit" className="btn-gold" disabled={loading}
            style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            {loading ? (<><span className="spinner" />Creating account...</>) : "Create Account →"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>Already a member?</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
        </div>

        <Link to="/login"
          style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: "500", textDecoration: "none", transition: "border-color 0.2s, color 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e8c44a"; e.currentTarget.style.color = "#e8c44a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
          Sign in instead
        </Link>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/" style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}
            onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}>
            ← Back to home
          </Link>
        </p>

      </div>
    </div>
  );
}
