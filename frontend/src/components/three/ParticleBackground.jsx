// =============================================================================
// src/components/three/ParticleBackground.jsx
// =============================================================================
// Single source of truth for the 3D particle animation used across all pages.
// Accepts optional props to customize appearance per page if needed.
// =============================================================================

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ParticleBackground({
  particleCount = 100, // number of floating particles
  particleSize = 0.8, // size of each particle dot
  particleOpacity = 0.6, // how bright the particles are
  lineOpacity = 0.06, // how visible the connecting lines are
  connectionDistance = 30, // how close particles must be to connect
  speed = 0.06, // how fast particles move
  mouseInfluence = 15, // how much camera follows the mouse
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // ── Scene Setup ──────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    camera.position.z = 80;

    // ── Particles ─────────────────────────────────────────────────────────────
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed,
        ),
      );
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xe8c44a,
      size: particleSize,
      transparent: true,
      opacity: particleOpacity,
      sizeAttenuation: true,
    });
    scene.add(new THREE.Points(pGeo, pMat));

    // ── Connection Lines ───────────────────────────────────────────────────────
    const lGeo = new THREE.BufferGeometry();
    const lPos = new Float32Array(particleCount * particleCount * 6);
    lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
    const lineSegments = new THREE.LineSegments(
      lGeo,
      new THREE.LineBasicMaterial({
        color: 0xe8c44a,
        transparent: true,
        opacity: lineOpacity,
      }),
    );
    scene.add(lineSegments);

    // ── Decorative Ring ────────────────────────────────────────────────────────
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(24, 0.3, 8, 80),
      new THREE.MeshBasicMaterial({
        color: 0xe8c44a,
        transparent: true,
        opacity: 0.08,
        wireframe: true,
      }),
    );
    scene.add(ring);

    // ── Mouse Tracking ─────────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 0.2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.2;
    };
    window.addEventListener("mousemove", onMouse);

    // ── Animation Loop ─────────────────────────────────────────────────────────
    let animationId;
    const pos = pGeo.attributes.position.array;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Move particles and bounce off walls
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += velocities[i].x;
        pos[i * 3 + 1] += velocities[i].y;
        pos[i * 3 + 2] += velocities[i].z;
        if (Math.abs(pos[i * 3]) > 100) velocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 100) velocities[i].y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 100) velocities[i].z *= -1;
      }
      pGeo.attributes.position.needsUpdate = true;

      // Draw lines between nearby particles
      let li = 0;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = pos[i * 3] - pos[j * 3];
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          if (Math.sqrt(dx * dx + dy * dy + dz * dz) < connectionDistance) {
            lPos[li++] = pos[i * 3];
            lPos[li++] = pos[i * 3 + 1];
            lPos[li++] = pos[i * 3 + 2];
            lPos[li++] = pos[j * 3];
            lPos[li++] = pos[j * 3 + 1];
            lPos[li++] = pos[j * 3 + 2];
          }
        }
      }
      lGeo.attributes.position.needsUpdate = true;
      lGeo.setDrawRange(0, li / 3);

      // Rotate ring
      ring.rotation.x += 0.002;
      ring.rotation.y += 0.003;

      // Smooth camera follow mouse
      camera.position.x +=
        (mouse.x * mouseInfluence - camera.position.x) * 0.02;
      camera.position.y +=
        (-mouse.y * mouseInfluence - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize Handler ─────────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ────────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      pGeo.dispose();
      lGeo.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
