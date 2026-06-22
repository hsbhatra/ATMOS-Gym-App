// =============================================================================
// src/pages/auth/LoginPage.jsx
// =============================================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as THREE from "three";
import { useAuthStore } from "../../store/authStore.js";
import { loginUser } from "../../services/authService.js";

// =============================================================================
// ParticleBackground — same 3D effect as Landing Page
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

    const COUNT     = 100;
    const positions = new Float32Array(COUNT * 3);
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
    const pMat = new THREE.PointsMaterial({ color: 0xe8c44a, size: 0.8, transparent: true, opacity: 0.6, sizeAttenuation: true });
    scene.add(new THREE.Points(pGeo, pMat));

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
// LoginPage
// =============================================================================
export default function LoginPage() {
  const navigate  = useNavigate();
  const setAuth   = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await loginUser(data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.firstName}! 💪`);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative" }}>
      <ParticleBackground />

      {/* Radial glow behind the card */}
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
      }} className="page-enter">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
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
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            Sign in to continue your journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

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
            {errors.email && (
              <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.6)" }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: "12px", color: "#e8c44a", textDecoration: "none", fontWeight: "500" }}
                onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.target.style.textDecoration = "none"}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="input-dark"
                style={{ paddingRight: "44px", ...(errors.password ? { borderColor: "rgba(239,68,68,0.6)" } : {}) }}
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.35)", fontSize: "14px", padding: "4px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#e8c44a"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-gold"
            disabled={loading}
            style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            {loading ? (
              <>
                <span className="spinner" />
                Signing in...
              </>
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>New to Hulk Gym?</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* Register Link */}
        <Link to="/register"
          style={{
            display: "block", textAlign: "center", padding: "13px",
            borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: "500",
            textDecoration: "none", transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e8c44a"; e.currentTarget.style.color = "#e8c44a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
          Create a free account
        </Link>

        {/* Back to home */}
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
