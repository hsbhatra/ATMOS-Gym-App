// =============================================================================
// src/pages/auth/ForgotOtpPage.jsx
// =============================================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import * as THREE from "three";
import { verifyForgotOtp, resendForgotOtp } from "../../services/authService.js";

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
      new THREE.MeshBasicMaterial({ color: 0xe8c44a, transparent: true, opacity: 0.08, wireframe: true })
    );
    scene.add(ring);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 0.2;
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
// ForgotOtpPage
// =============================================================================
export default function ForgotOtpPage() {
  const navigate = useNavigate();
  const email    = sessionStorage.getItem("pendingEmail") || "";

  const [digits, setDigits]     = useState(["", "", "", "", "", ""]);
  const inputRefs               = useRef([]);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please start again.");
      navigate("/forgot-password");
    }
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (digit && index === 5) {
      const otp = [...newDigits.slice(0, 5), digit].join("");
      if (otp.length === 6) submitOtp(otp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft"  && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted.length) return;
    const newDigits = ["", "", "", "", "", ""];
    pasted.split("").forEach((d, i) => { newDigits[i] = d; });
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) submitOtp(pasted);
  };

  const submitOtp = async (otp) => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await verifyForgotOtp({ email, otp });
      sessionStorage.setItem("otpVerified", "true");
      toast.success("OTP verified! Set your new password.");
      navigate("/reset-password");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(msg);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      await resendForgotOtp({ email });
      toast.success("New OTP sent to your email!");
      setCountdown(60);
      setCanResend(false);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const otp = digits.join("");

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative",
    }}>
      <ParticleBackground />

      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse at center, rgba(232,196,74,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

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

        <div style={{
          width: "64px", height: "64px", borderRadius: "16px",
          background: "rgba(232,196,74,0.1)", border: "1px solid rgba(232,196,74,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px", margin: "0 auto 24px",
        }}>🔑</div>

        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          Enter reset code
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "8px", lineHeight: "1.6" }}>
          We sent a password reset code to
        </p>
        <p style={{ fontSize: "14px", color: "#e8c44a", fontWeight: "600", marginBottom: "32px" }}>
          {email}
        </p>

        {/* 6-box OTP Input */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "28px" }}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              style={{
                width: "48px", height: "56px",
                textAlign: "center", fontSize: "22px", fontWeight: "700",
                background: digit ? "rgba(232,196,74,0.08)" : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${digit ? "rgba(232,196,74,0.5)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "12px", color: "#ffffff", outline: "none",
                transition: "all 0.2s", caretColor: "#e8c44a",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#e8c44a";
                e.target.style.background  = "rgba(232,196,74,0.06)";
                e.target.style.boxShadow   = "0 0 0 3px rgba(232,196,74,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = digit ? "rgba(232,196,74,0.5)" : "rgba(255,255,255,0.1)";
                e.target.style.background  = digit ? "rgba(232,196,74,0.08)" : "rgba(255,255,255,0.03)";
                e.target.style.boxShadow   = "none";
              }}
            />
          ))}
        </div>

        <button onClick={() => submitOtp(otp)} disabled={loading || otp.length < 6}
          className="btn-gold"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", opacity: otp.length < 6 ? 0.5 : 1 }}>
          {loading ? (<><span className="spinner" />Verifying...</>) : "Verify & Continue →"}
        </button>

        <div style={{ marginTop: "24px" }}>
          {canResend ? (
            <button onClick={handleResend} disabled={resending}
              style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", color: "#e8c44a", fontWeight: "600", textDecoration: "underline" }}>
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          ) : (
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              Resend code in{" "}
              <span style={{ color: "#e8c44a", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>
                {String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}
              </span>
            </p>
          )}
        </div>

        <div style={{ marginTop: "24px", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: "1.6" }}>
            Didn't receive the email? Check your spam folder.
            The code expires in <span style={{ color: "rgba(255,255,255,0.5)" }}>10 minutes</span>.
          </p>
        </div>

        <p style={{ marginTop: "24px" }}>
          <Link to="/forgot-password"
            style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}
            onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}>
            ← Back to forgot password
          </Link>
        </p>

      </div>
    </div>
  );
}
