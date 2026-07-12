// =============================================================================
// src/pages/LandingPage.jsx
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { useAuthStore } from "../store/authStore.js";
import ParticleBackground from "../components/three/ParticleBackground.jsx";

// =============================================================================
// ParticleBackground — Three.js 3D animated background
// =============================================================================

// function ParticleBackground() {
//   const mountRef = useRef(null);

//   useEffect(() => {
//     const mount = mountRef.current;
//     const width = mount.clientWidth;
//     const height = mount.clientHeight;

//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

//     renderer.setSize(width, height);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.setClearColor(0x000000, 0);
//     mount.appendChild(renderer.domElement);
//     camera.position.z = 80;

//     // Particles
//     const COUNT = 140;
//     const positions = new Float32Array(COUNT * 3);
//     const velocities = [];

//     for (let i = 0; i < COUNT; i++) {
//       positions[i * 3] = (Math.random() - 0.5) * 200;
//       positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
//       positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
//       velocities.push(
//         new THREE.Vector3(
//           (Math.random() - 0.5) * 0.07,
//           (Math.random() - 0.5) * 0.07,
//           (Math.random() - 0.5) * 0.07,
//         ),
//       );
//     }

//     const pGeo = new THREE.BufferGeometry();
//     pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
//     const pMat = new THREE.PointsMaterial({
//       color: 0xe8c44a,
//       size: 0.9,
//       transparent: true,
//       opacity: 0.75,
//       sizeAttenuation: true,
//     });
//     const points = new THREE.Points(pGeo, pMat);
//     scene.add(points);

//     // Lines
//     const lGeo = new THREE.BufferGeometry();
//     const lPos = new Float32Array(COUNT * COUNT * 6);
//     lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
//     const lines = new THREE.LineSegments(
//       lGeo,
//       new THREE.LineBasicMaterial({
//         color: 0xe8c44a,
//         transparent: true,
//         opacity: 0.07,
//       }),
//     );
//     scene.add(lines);

//     // Rings
//     const ring1 = new THREE.Mesh(
//       new THREE.TorusGeometry(20, 0.35, 8, 80),
//       new THREE.MeshBasicMaterial({
//         color: 0xe8c44a,
//         transparent: true,
//         opacity: 0.1,
//         wireframe: true,
//       }),
//     );
//     scene.add(ring1);

//     const ring2 = new THREE.Mesh(
//       new THREE.TorusGeometry(32, 0.18, 6, 100),
//       new THREE.MeshBasicMaterial({
//         color: 0xe8c44a,
//         transparent: true,
//         opacity: 0.05,
//         wireframe: true,
//       }),
//     );
//     ring2.rotation.x = Math.PI / 2.5;
//     scene.add(ring2);

//     // Dumbbell-like shape (two spheres + cylinder)
//     const sphereMat = new THREE.MeshBasicMaterial({
//       color: 0xe8c44a,
//       transparent: true,
//       opacity: 0.08,
//       wireframe: true,
//     });
//     const s1 = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), sphereMat);
//     s1.position.set(-22, 8, -20);
//     scene.add(s1);
//     const s2 = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), sphereMat);
//     s2.position.set(22, -8, -20);
//     scene.add(s2);

//     const mouse = { x: 0, y: 0 };
//     const onMouse = (e) => {
//       mouse.x = (e.clientX / window.innerWidth - 0.5) * 0.25;
//       mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.25;
//     };
//     window.addEventListener("mousemove", onMouse);

//     let id;
//     const pos = pGeo.attributes.position.array;

//     const animate = () => {
//       id = requestAnimationFrame(animate);

//       for (let i = 0; i < COUNT; i++) {
//         pos[i * 3] += velocities[i].x;
//         pos[i * 3 + 1] += velocities[i].y;
//         pos[i * 3 + 2] += velocities[i].z;
//         if (Math.abs(pos[i * 3]) > 100) velocities[i].x *= -1;
//         if (Math.abs(pos[i * 3 + 1]) > 100) velocities[i].y *= -1;
//         if (Math.abs(pos[i * 3 + 2]) > 100) velocities[i].z *= -1;
//       }
//       pGeo.attributes.position.needsUpdate = true;

//       let li = 0;
//       for (let i = 0; i < COUNT; i++) {
//         for (let j = i + 1; j < COUNT; j++) {
//           const dx = pos[i * 3] - pos[j * 3],
//             dy = pos[i * 3 + 1] - pos[j * 3 + 1],
//             dz = pos[i * 3 + 2] - pos[j * 3 + 2];
//           if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 28) {
//             lPos[li++] = pos[i * 3];
//             lPos[li++] = pos[i * 3 + 1];
//             lPos[li++] = pos[i * 3 + 2];
//             lPos[li++] = pos[j * 3];
//             lPos[li++] = pos[j * 3 + 1];
//             lPos[li++] = pos[j * 3 + 2];
//           }
//         }
//       }
//       lGeo.attributes.position.needsUpdate = true;
//       lGeo.setDrawRange(0, li / 3);

//       ring1.rotation.x += 0.003;
//       ring1.rotation.y += 0.005;
//       ring2.rotation.z += 0.002;
//       s1.rotation.y += 0.008;
//       s2.rotation.x += 0.006;

//       camera.position.x += (mouse.x * 18 - camera.position.x) * 0.02;
//       camera.position.y += (-mouse.y * 18 - camera.position.y) * 0.02;
//       camera.lookAt(scene.position);
//       renderer.render(scene, camera);
//     };
//     animate();

//     const onResize = () => {
//       const w = mount.clientWidth,
//         h = mount.clientHeight;
//       camera.aspect = w / h;
//       camera.updateProjectionMatrix();
//       renderer.setSize(w, h);
//     };
//     window.addEventListener("resize", onResize);

//     return () => {
//       cancelAnimationFrame(id);
//       window.removeEventListener("mousemove", onMouse);
//       window.removeEventListener("resize", onResize);
//       if (mount.contains(renderer.domElement))
//         mount.removeChild(renderer.domElement);
//       renderer.dispose();
//     };
//   }, []);

//   return (
//     <div
//       ref={mountRef}
//       style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
//     />
//   );
// }

// =============================================================================
// Reusable Section Label
// =============================================================================
const SectionLabel = ({ text }) => (
  <p
    style={{
      fontSize: "11px",
      letterSpacing: "3px",
      color: "#e8c44a",
      marginBottom: "14px",
      fontWeight: "600",
      textTransform: "uppercase",
    }}
  >
    {text}
  </p>
);

// =============================================================================
// LandingPage
// =============================================================================
export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Data ────────────────────────────────────────────────────────────────────

  const programs = [
    {
      icon: "🏋️",
      title: "Strength & Power",
      desc: "Build raw strength with compound lifts, progressive overload, and structured periodization programs.",
      tag: "Popular",
    },
    {
      icon: "🏃",
      title: "Cardio & Endurance",
      desc: "Improve stamina and heart health with treadmills, bikes, rowing machines and guided cardio plans.",
      tag: "",
    },
    {
      icon: "🔥",
      title: "HIIT Training",
      desc: "Burn maximum calories in minimum time with high-intensity interval training sessions led by certified coaches.",
      tag: "Intense",
    },
    {
      icon: "🧘",
      title: "Yoga & Flexibility",
      desc: "Recover faster, move better, and reduce injury risk with dedicated yoga and mobility sessions.",
      tag: "",
    },
    {
      icon: "🥊",
      title: "Boxing & MMA",
      desc: "Learn real fighting techniques while getting an incredible full-body workout in our combat sports zone.",
      tag: "New",
    },
    {
      icon: "🚴",
      title: "Spin Classes",
      desc: "High-energy group cycling sessions with pumping music and motivating instructors. No experience needed.",
      tag: "",
    },
  ];

  const trainers = [
    {
      name: "Arjun Mehta",
      role: "Head Strength Coach",
      exp: "12 years",
      spec: ["Powerlifting", "Olympic Lifting", "Body Recomposition"],
      initial: "A",
    },
    {
      name: "Priya Sharma",
      role: "HIIT & Cardio Specialist",
      exp: "8 years",
      spec: ["HIIT", "Fat Loss", "Functional Fitness"],
      initial: "P",
    },
    {
      name: "Rohan Kapoor",
      role: "Combat Sports Coach",
      exp: "10 years",
      spec: ["Boxing", "MMA", "Self Defense"],
      initial: "R",
    },
  ];

  const transformations = [
    { stat: "94%", label: "Members hit their goals within 90 days" },
    { stat: "12kg", label: "Average fat loss in the first 3 months" },
    {
      stat: "2.4x",
      label: "Strength increase reported by members after 6 months",
    },
    {
      stat: "98%",
      label: "Member retention rate — people stay because it works",
    },
  ];

  const equipment = [
    {
      name: "Free Weights Zone",
      desc: "Dumbbells from 1kg to 100kg, barbells, EZ bars, and full rack stations.",
      icon: "🏋️",
    },
    {
      name: "Cardio Floor",
      desc: "50+ treadmills, bikes, ellipticals, stair climbers, and rowing machines.",
      icon: "🏃",
    },
    {
      name: "Cable & Machine Zone",
      desc: "Full range of cable machines, plate-loaded equipment, and isolation machines.",
      icon: "⚙️",
    },
    {
      name: "Functional Training",
      desc: "Battle ropes, kettlebells, sleds, pull-up rigs, and TRX suspension systems.",
      icon: "🔗",
    },
  ];

  const plans = [
    {
      name: "Basic",
      price: "₹1,499",
      period: "/month",
      features: [
        "Full gym access",
        "Locker room",
        "2 group classes/week",
        "Basic fitness assessment",
      ],
      highlight: false,
      tag: "",
    },
    {
      name: "Pro",
      price: "₹2,999",
      period: "/month",
      features: [
        "Everything in Basic",
        "Unlimited group classes",
        "1 PT session/month",
        "Diet consultation",
        "Progress tracking app",
      ],
      highlight: true,
      tag: "Most Popular",
    },
    {
      name: "Elite",
      price: "₹5,499",
      period: "/month",
      features: [
        "Everything in Pro",
        "4 PT sessions/month",
        "Custom meal plan",
        "Body composition analysis",
        "Priority booking",
        "Sauna access",
      ],
      highlight: false,
      tag: "",
    },
  ];

  const testimonials = [
    {
      name: "Vikram S.",
      result: "Lost 18kg in 4 months",
      text: "Hulk Gym completely changed my life. The trainers are incredibly knowledgeable and the community keeps you accountable. I've never felt stronger.",
      rating: 5,
    },
    {
      name: "Neha R.",
      result: "Gained 6kg muscle",
      text: "I was skeptical at first but the results speak for themselves. Coach Arjun built a program perfectly suited to my body and goals.",
      rating: 5,
    },
    {
      name: "Aditya K.",
      result: "Running 10km now",
      text: "Joined for weight loss but fell in love with fitness. The HIIT classes with Priya are absolutely brutal — in the best possible way.",
      rating: 5,
    },
  ];

  const navLinks = [
    { label: "Programs", href: "#programs" },
    { label: "Trainers", href: "#trainers" },
    { label: "Pricing", href: "#pricing" },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    // <div
    //   style={{ minHeight: "100vh", background: "#0a0a0a", overflowX: "hidden" }}
    // >
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Full page 3D background — sits behind everything */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <ParticleBackground />
      </div>
      {/* ══ NAVBAR ══════════════════════════════════════════════════════════════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: "64px",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "rgba(10,10,10,0.95)" : "rgba(10,10,10,0.6)",
          backdropFilter: "blur(24px)",
          borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.07)" : "transparent"}`,
          transition: "all 0.3s ease",
          paddingBottom: "12px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#e8c44a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              color: "#0a0a0a",
              fontSize: "18px",
            }}
          >
            H
          </div>
          <span
            style={{
              fontWeight: "800",
              fontSize: "17px",
              letterSpacing: "1.5px",
            }}
          >
            HULK <span style={{ color: "#e8c44a" }}>GYM</span>
          </span>
        </div>

        {/* Nav Links — desktop only */}
        <div
          style={{ display: "flex", gap: "32px" }}
          className="nav-links-desktop"
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "14px",
                fontWeight: "500",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#e8c44a")}
              onMouseLeave={(e) =>
                (e.target.style.color = "rgba(255,255,255,0.55)")
              }
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons — desktop only */}
        <div
          style={{ display: "flex", gap: "10px" }}
          className="nav-cta-desktop"
        >
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/profile")}
              className="btn-gold"
              style={{ width: "auto", padding: "9px 20px", fontSize: "13px" }}
            >
              My Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="btn-ghost"
                style={{ padding: "9px 20px", fontSize: "13px" }}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="btn-gold"
                style={{ width: "auto", padding: "9px 20px", fontSize: "13px" }}
              >
                Join Now
              </button>
            </>
          )}
        </div>

        {/* Hamburger Button — mobile only */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "8px 10px",
            cursor: "pointer",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <span
            style={{
              display: "block",
              width: "20px",
              height: "2px",
              background: menuOpen ? "#e8c44a" : "white",
              transition: "all 0.3s",
              transform: menuOpen
                ? "rotate(45deg) translate(5px, 5px)"
                : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: "20px",
              height: "2px",
              background: "#e8c44a",
              opacity: menuOpen ? 0 : 1,
              transition: "all 0.3s",
            }}
          />
          <span
            style={{
              display: "block",
              width: "20px",
              height: "2px",
              background: menuOpen ? "#e8c44a" : "white",
              transition: "all 0.3s",
              transform: menuOpen
                ? "rotate(-45deg) translate(5px, -5px)"
                : "none",
            }}
          />
        </button>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div
            style={{
              position: "fixed",
              top: "64px",
              left: 0,
              right: 0,
              background: "rgba(10,10,10,0.98)",
              backdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              padding: "20px 24px",
              zIndex: 99,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "16px",
                  fontWeight: "500",
                  textDecoration: "none",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#e8c44a")}
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255,255,255,0.7)")
                }
              >
                {l.label}
              </a>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="btn-gold"
                  style={{ width: "100%", padding: "12px", fontSize: "14px" }}
                >
                  My Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMenuOpen(false);
                    }}
                    className="btn-ghost"
                    style={{ flex: 1, padding: "12px", fontSize: "14px" }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate("/register");
                      setMenuOpen(false);
                    }}
                    className="btn-gold"
                    style={{ flex: 1, padding: "12px", fontSize: "14px" }}
                  >
                    Join Now
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "350px",
        }}
      >
        {/* <ParticleBackground /> */}

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(232,196,74,0.05) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "220px",
            zIndex: 1,
            background: "linear-gradient(to top, #0a0a0a, transparent)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "0 1.5rem",
            maxWidth: "860px",
          }}
          className="page-enter"
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(232,196,74,0.08)",
              border: "1px solid rgba(232,196,74,0.25)",
              borderRadius: "100px",
              padding: "7px 18px",
              marginBottom: "36px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#e8c44a",
                display: "inline-block",
                boxShadow: "0 0 8px #e8c44a",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "#e8c44a",
                letterSpacing: "2px",
                fontWeight: "600",
              }}
            >
              INDIA'S PREMIER FITNESS DESTINATION
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(52px, 9vw, 104px)",
              fontWeight: "900",
              lineHeight: "0.95",
              marginBottom: "28px",
              letterSpacing: "-3px",
            }}
          >
            WHERE
            <br />
            <span className="text-gold-gradient">LEGENDS</span>
            <br />
            ARE MADE
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2vw, 18px)",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "500px",
              margin: "0 auto 44px",
              lineHeight: "1.75",
            }}
          >
            State-of-the-art equipment. Elite coaching. A community obsessed
            with results. Your transformation starts the moment you walk through
            our doors.
          </p>

          <div
            style={{
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/register")}
              className="btn-gold"
              style={{
                width: "auto",
                padding: "15px 36px",
                fontSize: "15px",
                letterSpacing: "0.5px",
              }}
            >
              Start Free Today →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn-ghost"
              style={{ padding: "15px 36px", fontSize: "15px" }}
            >
              Member Login
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "0",
              justifyContent: "center",
              marginTop: "70px",
              flexWrap: "wrap",
            }}
          >
            {[
              ["10,000+", "Members Transformed"],
              ["48", "Expert Trainers"],
              ["6", "Gym Locations"],
              ["15+", "Years Strong"],
            ].map(([num, label], i, arr) => (
              <div
                key={label}
                style={{
                  textAlign: "center",
                  padding: "0 32px",
                  borderRight:
                    i < arr.length - 1
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "none",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(24px, 3vw, 32px)",
                    fontWeight: "800",
                    color: "#e8c44a",
                    letterSpacing: "-1px",
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "1px",
                    marginTop: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            animation: "fadeSlideUp 1s ease 1s both",
          }}
        >
          <div
            style={{
              width: "1px",
              height: "50px",
              background: "linear-gradient(to bottom, transparent, #e8c44a)",
              margin: "0 auto",
            }}
          />
        </div>
      </section>

      {/* ══ PROGRAMS ════════════════════════════════════════════════════════════ */}
      <section
        id="programs"
        style={{ padding: "120px 1.5rem", position: "relative" }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "600px",
            height: "400px",
            background:
              "radial-gradient(ellipse, rgba(232,196,74,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "64px",
              paddingTop: "250px",
            }}
          >
            <SectionLabel text="Training Programs" />
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: "800",
                letterSpacing: "-1.5px",
                marginBottom: "16px",
              }}
            >
              Train with <span className="text-gold-gradient">purpose</span>
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "15px",
                maxWidth: "480px",
                margin: "0 auto",
                lineHeight: "1.7",
              }}
            >
              Six specialized training programs designed for every fitness level
              — from complete beginners to seasoned athletes.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {programs.map((p) => (
              <div
                key={p.title}
                className="auth-card"
                style={{
                  padding: "28px",
                  position: "relative",
                  cursor: "pointer",
                  transition:
                    "transform 0.25s, border-color 0.25s, background 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.borderColor = "rgba(232,196,74,0.25)";
                  e.currentTarget.style.background = "rgba(232,196,74,0.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                }}
              >
                {p.tag && (
                  <span
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      fontSize: "10px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      color: "#0a0a0a",
                      background: "#e8c44a",
                      borderRadius: "6px",
                      padding: "3px 10px",
                    }}
                  >
                    {p.tag}
                  </span>
                )}
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>
                  {p.icon}
                </div>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    marginBottom: "10px",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.42)",
                    lineHeight: "1.75",
                  }}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRANSFORMATION STATS ════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "100px 1.5rem",
          background:
            "linear-gradient(135deg, rgba(232,196,74,0.05) 0%, rgba(232,196,74,0.02) 50%, transparent 100%)",
          borderTop: "1px solid rgba(232,196,74,0.08)",
          borderBottom: "1px solid rgba(232,196,74,0.08)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <SectionLabel text="Real Results" />
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: "800",
                letterSpacing: "-1.5px",
              }}
            >
              Numbers that <span className="text-gold-gradient">don't lie</span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "2px",
            }}
          >
            {transformations.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: "40px 32px",
                  textAlign: "center",
                  background:
                    i % 2 === 0
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(232,196,74,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(36px, 5vw, 52px)",
                    fontWeight: "900",
                    color: "#e8c44a",
                    letterSpacing: "-2px",
                    marginBottom: "12px",
                  }}
                >
                  {t.stat}
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: "1.6",
                  }}
                >
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRAINERS ════════════════════════════════════════════════════════════ */}
      <section id="trainers" style={{ padding: "120px 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <SectionLabel text="Meet the Team" />
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: "800",
                letterSpacing: "-1.5px",
                marginBottom: "16px",
              }}
            >
              Trained by the <span className="text-gold-gradient">best</span>
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "15px",
                maxWidth: "460px",
                margin: "0 auto",
              }}
            >
              Our coaches aren't just certified — they've lived the
              transformation themselves.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {trainers.map((t) => (
              <div
                key={t.name}
                className="auth-card"
                style={{
                  padding: "32px",
                  transition: "transform 0.25s, border-color 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.borderColor = "rgba(232,196,74,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #e8c44a, #c9a832)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "26px",
                      fontWeight: "800",
                      color: "#0a0a0a",
                      flexShrink: 0,
                    }}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontWeight: "700",
                        fontSize: "17px",
                        marginBottom: "4px",
                      }}
                    >
                      {t.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#e8c44a",
                        fontWeight: "500",
                      }}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "20px",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                  }}
                >
                  <span
                    style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}
                  >
                    Experience:
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#e8c44a",
                    }}
                  >
                    {t.exp}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {t.spec.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: "11px",
                        padding: "4px 12px",
                        borderRadius: "100px",
                        background: "rgba(232,196,74,0.08)",
                        border: "1px solid rgba(232,196,74,0.15)",
                        color: "rgba(255,255,255,0.6)",
                        fontWeight: "500",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EQUIPMENT ═══════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "100px 1.5rem",
          background: "rgba(10,10,10,0.6)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "80px",
              alignItems: "center",
            }}
          >
            {/* Left */}
            <div>
              <SectionLabel text="World Class Facility" />
              <h2
                style={{
                  fontSize: "clamp(26px, 3.5vw, 42px)",
                  fontWeight: "800",
                  letterSpacing: "-1.5px",
                  marginBottom: "20px",
                  lineHeight: "1.1",
                }}
              >
                Equipment that
                <br />
                <span className="text-gold-gradient">
                  matches your ambition
                </span>
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "15px",
                  lineHeight: "1.8",
                  marginBottom: "32px",
                }}
              >
                Over ₹5 crore invested in premium gym equipment across our
                facilities. Every machine, every weight, every station is
                maintained to perfection so your workout is never compromised.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="btn-gold"
                style={{
                  width: "auto",
                  padding: "13px 28px",
                  fontSize: "14px",
                }}
              >
                Book a Free Tour →
              </button>
            </div>

            {/* Right */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {equipment.map((e) => (
                <div
                  key={e.name}
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(el) =>
                    (el.currentTarget.style.borderColor =
                      "rgba(232,196,74,0.2)")
                  }
                  onMouseLeave={(el) =>
                    (el.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.06)")
                  }
                >
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                    {e.icon}
                  </div>
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      marginBottom: "6px",
                    }}
                  >
                    {e.name}
                  </h4>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.38)",
                      lineHeight: "1.6",
                    }}
                  >
                    {e.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ═════════════════════════════════════════════════════════════ */}
      <section id="pricing" style={{ padding: "120px 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <SectionLabel text="Membership Plans" />
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: "800",
                letterSpacing: "-1.5px",
                marginBottom: "16px",
              }}
            >
              Invest in your{" "}
              <span className="text-gold-gradient">best self</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px" }}>
              No hidden fees. Cancel anytime. First week is always free.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              alignItems: "start",
            }}
          >
            {plans.map((p) => (
              <div
                key={p.name}
                style={{
                  padding: "36px 28px",
                  borderRadius: "20px",
                  border: p.highlight
                    ? "1px solid rgba(232,196,74,0.4)"
                    : "1px solid rgba(255,255,255,0.06)",
                  background: p.highlight
                    ? "linear-gradient(145deg, rgba(232,196,74,0.08), rgba(232,196,74,0.02))"
                    : "rgba(255,255,255,0.02)",
                  position: "relative",
                  transform: p.highlight ? "scale(1.03)" : "scale(1)",
                  transition: "transform 0.25s",
                }}
                onMouseEnter={(e) => {
                  if (!p.highlight)
                    e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  if (!p.highlight)
                    e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {p.tag && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-14px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#e8c44a",
                      color: "#0a0a0a",
                      fontSize: "11px",
                      fontWeight: "800",
                      letterSpacing: "1px",
                      padding: "5px 18px",
                      borderRadius: "100px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.tag}
                  </div>
                )}
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: p.highlight ? "#e8c44a" : "rgba(255,255,255,0.6)",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}
                >
                  {p.name}
                </h3>
                <div style={{ marginBottom: "28px" }}>
                  <span
                    style={{
                      fontSize: "42px",
                      fontWeight: "900",
                      letterSpacing: "-2px",
                    }}
                  >
                    {p.price}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.35)",
                      marginLeft: "4px",
                    }}
                  >
                    {p.period}
                  </span>
                </div>
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: "24px",
                    marginBottom: "28px",
                  }}
                >
                  {p.features.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#e8c44a",
                          fontSize: "14px",
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate("/register")}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    border: "none",
                    background: p.highlight ? "#e8c44a" : "transparent",
                    color: p.highlight ? "#0a0a0a" : "rgba(255,255,255,0.6)",
                    border: p.highlight
                      ? "none"
                      : "1px solid rgba(255,255,255,0.12)",
                  }}
                  onMouseEnter={(e) => {
                    if (!p.highlight) {
                      e.currentTarget.style.borderColor = "#e8c44a";
                      e.currentTarget.style.color = "#e8c44a";
                    } else {
                      e.currentTarget.style.background = "#f0d060";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!p.highlight) {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.12)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                    } else {
                      e.currentTarget.style.background = "#e8c44a";
                    }
                  }}
                >
                  Get Started Free
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "100px 1.5rem",
          background: "rgba(10,10,10,0.6)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <SectionLabel text="Success Stories" />
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: "800",
                letterSpacing: "-1.5px",
              }}
            >
              Hear it from our{" "}
              <span className="text-gold-gradient">members</span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="auth-card"
                style={{ padding: "32px" }}
              >
                {/* Stars */}
                <div style={{ marginBottom: "20px" }}>
                  {"★"
                    .repeat(t.rating)
                    .split("")
                    .map((s, i) => (
                      <span
                        key={i}
                        style={{ color: "#e8c44a", fontSize: "16px" }}
                      >
                        {s}
                      </span>
                    ))}
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: "1.8",
                    marginBottom: "24px",
                    fontStyle: "italic",
                  }}
                >
                  "{t.text}"
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: "20px",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: "700", fontSize: "14px" }}>
                      {t.name}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.35)",
                        marginTop: "2px",
                      }}
                    >
                      Hulk Gym Member
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#e8c44a",
                      background: "rgba(232,196,74,0.1)",
                      border: "1px solid rgba(232,196,74,0.2)",
                      borderRadius: "100px",
                      padding: "4px 12px",
                    }}
                  >
                    {t.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 1.5rem 120px" }}>
        <div
          style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
        >
          <div
            style={{
              padding: "70px 48px",
              borderRadius: "28px",
              background:
                "linear-gradient(135deg, rgba(232,196,74,0.1), rgba(232,196,74,0.03))",
              border: "1px solid rgba(232,196,74,0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                top: "-60px",
                right: "-60px",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                border: "1px solid rgba(232,196,74,0.1)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-40px",
                left: "-40px",
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                border: "1px solid rgba(232,196,74,0.08)",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#e8c44a",
                  letterSpacing: "3px",
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                START TODAY — NO EXCUSES
              </p>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 44px)",
                  fontWeight: "900",
                  letterSpacing: "-1.5px",
                  marginBottom: "16px",
                  lineHeight: "1.1",
                }}
              >
                Your strongest self
                <br />
                <span className="text-gold-gradient">is waiting for you</span>
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "15px",
                  marginBottom: "36px",
                  lineHeight: "1.7",
                }}
              >
                Join 10,000+ members who chose to stop waiting and start
                transforming. First week is completely free — no credit card
                required.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => navigate("/register")}
                  className="btn-gold"
                  style={{
                    width: "auto",
                    padding: "15px 40px",
                    fontSize: "15px",
                  }}
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="btn-ghost"
                  style={{ padding: "15px 32px", fontSize: "15px" }}
                >
                  Already a member?
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "48px 1.5rem 32px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "48px",
              marginBottom: "48px",
            }}
          >
            {/* Brand */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "7px",
                    background: "#e8c44a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                    color: "#0a0a0a",
                    fontSize: "16px",
                  }}
                >
                  H
                </div>
                <span style={{ fontWeight: "800", letterSpacing: "1.5px" }}>
                  HULK <span style={{ color: "#e8c44a" }}>GYM</span>
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.35)",
                  lineHeight: "1.8",
                  maxWidth: "260px",
                }}
              >
                India's premier fitness destination. Forging legends since 2009.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: "Company",
                links: ["About Us", "Careers", "Press", "Blog"],
              },
              {
                title: "Programs",
                links: ["Strength", "Cardio", "HIIT", "Yoga", "Boxing"],
              },
              {
                title: "Support",
                links: ["Contact", "FAQs", "Privacy Policy", "Terms"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "2px",
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}
                >
                  {col.title}
                </h4>
                {col.links.map((l) => (
                  <p
                    key={l}
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.3)",
                      marginBottom: "10px",
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#e8c44a")}
                    onMouseLeave={(e) =>
                      (e.target.style.color = "rgba(255,255,255,0.3)")
                    }
                  >
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
              © {new Date().getFullYear()} Hulk Gym Pvt. Ltd. All rights
              reserved.
            </span>
            <div style={{ display: "flex", gap: "20px" }}>
              {["💪 Instagram", "🐦 Twitter", "📘 Facebook", "▶️ YouTube"].map(
                (s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.3)",
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#e8c44a")}
                    onMouseLeave={(e) =>
                      (e.target.style.color = "rgba(255,255,255,0.3)")
                    }
                  >
                    {s}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
