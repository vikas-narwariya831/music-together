import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BackgroundVisualizer({ isPlaying }) {
  const containerRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Cosmic Wave Particle Field
    const particleCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const originalY = new Float32Array(particleCount);

    const color1 = new THREE.Color('#06b6d4'); // Cyan
    const color2 = new THREE.Color('#8b5cf6'); // Purple
    const color3 = new THREE.Color('#10b981'); // Emerald

    let index = 0;
    for (let x = -30; x < 30; x++) {
      for (let z = -15; z < 15; z++) {
        if (index >= particleCount) break;

        positions[index * 3] = x * 12 + (Math.random() - 0.5) * 6;
        positions[index * 3 + 1] = (Math.sin(x * 0.2) + Math.cos(z * 0.2)) * 15;
        positions[index * 3 + 2] = z * 18 - 80;

        originalY[index] = positions[index * 3 + 1];

        // Gradient coloring
        const ratio = (x + 30) / 60;
        let c = color1.clone().lerp(color2, ratio);
        if (z > 0) c = c.lerp(color3, z / 15);

        colors[index * 3] = c.r;
        colors[index * 3 + 1] = c.g;
        colors[index * 3 + 2] = c.b;

        index++;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3. Ambient Pulsing Torus Rings in Center
    const ringGeo = new THREE.TorusGeometry(75, 1.8, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    // 4. Animation Loop
    let clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const speed = isPlayingRef.current ? 2.5 : 0.8;
      const amplitude = isPlayingRef.current ? 22 : 6;

      const pos = particles.geometry.attributes.position.array;

      for (let i = 0; i < particleCount; i++) {
        const x = pos[i * 3];
        const z = pos[i * 3 + 2];

        // Sine wave displacement
        pos[i * 3 + 1] = originalY[i] + Math.sin(elapsedTime * speed + x * 0.04 + z * 0.02) * amplitude;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Rotate field
      particles.rotation.y = elapsedTime * (isPlayingRef.current ? 0.08 : 0.02);
      ring.rotation.z = elapsedTime * (isPlayingRef.current ? 0.25 : 0.08);
      ring.rotation.y = elapsedTime * (isPlayingRef.current ? 0.15 : 0.05);

      ringMat.opacity = isPlayingRef.current 
        ? 0.35 + Math.sin(elapsedTime * 4) * 0.15 
        : 0.12;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="three-bg-visualizer"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    />
  );
}
