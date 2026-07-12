// =============================================================================
// src/pages/auth/ForgotPasswordPage.jsx
// =============================================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as THREE from "three";
import { forgotPassword } from "../../services/authService.js";
import ParticleBackground from "../../components/three/ParticleBackground.jsx";

// =============================================================================
// ParticleBackground
// =============================================================================
// function ParticleBackground() {
//   const mountRef = useRef(null);

//   useEffect(() => {
//     const mount  = mountRef.current;
//     const width  = mount.clientWidth;
//     const height = mount.clientHeight;

//     const scene    = new THREE.Scene();
//     const camera   = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//     renderer.setSize(width, height);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.setClearColor(0x000000, 0);
//     mount.appendChild(renderer.domElement);
//     camera.position.z = 80;

//     const COUNT      = 100;
//     const positions  = new Float32Array(COUNT * 3);
//     const velocities = [];
//     for (let i = 0; i < COUNT; i++) {
//       positions[i*3]   = (Math.random() - 0.5) * 200;
//       positions[i*3+1] = (Math.random() - 0.5) * 200;
//       positions[i*3+2] = (Math.random() - 0.5) * 200;
//       velocities.push(new THREE.Vector3(
//         (Math.random() - 0.5) * 0.06,
//         (Math.random() - 0.5) * 0.06,
//         (Math.random() - 0.5) * 0.06
//       ));
//     }

//     const pGeo = new THREE.BufferGeometry();
//     pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
//     scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
//       color: 0xe8c44a, size: 0.8, transparent: true, opacity: 0.6, sizeAttenuation: true,
//     })));

//     const lGeo = new THREE.BufferGeometry();
//     const lPos  = new Float32Array(COUNT * COUNT * 6);
//     lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
//     scene.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({
//       color: 0xe8c44a, transparent: true, opacity: 0.06,
//     })));

//     const ring = new THREE.Mesh(
//       new THREE.TorusGeometry(24, 0.3, 8, 80),
//       new THREE.MeshBasicMaterial({ color: 0xe8c44a, transparent: true, opacity: 0.08, wireframe: true })
//     );
//     scene.add(ring);

//     const mouse = { x: 0, y: 0 };
//     const onMouse = (e) => {
//       mouse.x = (e.clientX / window.innerWidth  - 0.5) * 0.2;
//       mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.2;
//     };
//     window.addEventListener("mousemove", onMouse);

//     let id;
//     const pos = pGeo.attributes.position.array;
//     const animate = () => {
//       id = requestAnimationFrame(animate);
//       for (let i = 0; i < COUNT; i++) {
//         pos[i*3]   += velocities[i].x;
//         pos[i*3+1] += velocities[i].y;
//         pos[i*3+2] += velocities[i].z;
//         if (Math.abs(pos[i*3])   > 100) velocities[i].x *= -1;
//         if (Math.abs(pos[i*3+1]) > 100) velocities[i].y *= -1;
//         if (Math.abs(pos[i*3+2]) > 100) velocities[i].z *= -1;
//       }
//       pGeo.attributes.position.needsUpdate = true;

//       let li = 0;
//       for (let i = 0; i < COUNT; i++) {
//         for (let j = i + 1; j < COUNT; j++) {
//           const dx = pos[i*3]-pos[j*3], dy = pos[i*3+1]-pos[j*3+1], dz = pos[i*3+2]-pos[j*3+2];
//           if (Math.sqrt(dx*dx+dy*dy+dz*dz) < 30) {
//             lPos[li++]=pos[i*3]; lPos[li++]=pos[i*3+1]; lPos[li++]=pos[i*3+2];
//             lPos[li++]=pos[j*3]; lPos[li++]=pos[j*3+1]; lPos[li++]=pos[j*3+2];
//           }
//         }
//       }
//       lGeo.attributes.position.needsUpdate = true;
//       lGeo.setDrawRange(0, li / 3);

//       ring.rotation.x += 0.002;
//       ring.rotation.y += 0.003;
//       camera.position.x += (mouse.x * 15 - camera.position.x) * 0.02;
//       camera.position.y += (-mouse.y * 15 - camera.position.y) * 0.02;
//       camera.lookAt(scene.position);
//       renderer.render(scene, camera);
//     };
//     animate();

//     const onResize = () => {
//       const w = mount.clientWidth, h = mount.clientHeight;
//       camera.aspect = w / h;
//       camera.updateProjectionMatrix();
//       renderer.setSize(w, h);
//     };
//     window.addEventListener("resize", onResize);

//     return () => {
//       cancelAnimationFrame(id);
//       window.removeEventListener("mousemove", onMouse);
//       window.removeEventListener("resize", onResize);
//       if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
//       renderer.dispose();
//     };
//   }, []);

//   return <div ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
// }

// =============================================================================
// ForgotPasswordPage
// =============================================================================
export default function ForgotPasswordPage() {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgotPassword({ email: data.email });

      // Store email for the OTP page
      sessionStorage.setItem("pendingEmail", data.email);
      sessionStorage.setItem("otpPurpose", "forgotPassword");

      setSent(true);
      toast.success("If this email is registered, an OTP has been sent.");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(msg);
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

        {/* Icon */}
        <div style={{
          width: "64px", height: "64px", borderRadius: "16px",
          background: "rgba(232,196,74,0.1)", border: "1px solid rgba(232,196,74,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px", margin: "0 auto 24px",
        }}>
          🔐
        </div>

        {!sent ? (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", letterSpacing: "-0.5px" }}>
              Forgot password?
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "32px", lineHeight: "1.6" }}>
              No worries. Enter your registered email and we'll send you a verification code.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
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

              <button type="submit" className="btn-gold" disabled={loading}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                {loading ? (<><span className="spinner" />Sending OTP...</>) : "Send OTP →"}
              </button>
            </form>
          </>
        ) : (
          /* Success state — shown after OTP is sent */
          <>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", margin: "0 auto 24px",
            }}>
              ✅
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "10px" }}>
              OTP Sent!
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>
              We sent a verification code to
            </p>
            <p style={{ fontSize: "14px", color: "#e8c44a", fontWeight: "600", marginBottom: "32px" }}>
              {getValues("email")}
            </p>
            <button onClick={() => navigate("/forgot-otp")} className="btn-gold"
              style={{ marginBottom: "16px" }}>
              Enter OTP →
            </button>
            <button
              onClick={() => { setSent(false); setLoading(false); }}
              style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "underline" }}>
              Use a different email
            </button>
          </>
        )}

        {/* Back to login */}
        <p style={{ marginTop: "28px" }}>
          <Link to="/login"
            style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}
            onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}>
            ← Back to login
          </Link>
        </p>

      </div>
    </div>
  );
}
