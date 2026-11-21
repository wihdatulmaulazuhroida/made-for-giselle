import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { FloatingHearts, FloatingStars } from './FloatingObjects';

/* ------------------------------------------------------------------ */
/*  Galaxy particle spiral                                             */
/* ------------------------------------------------------------------ */

const GalaxyParticles = React.memo(function GalaxyParticles({ count = 800 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const arms = 3;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 6 + 0.5;
      const arm = (i % arms) * ((2 * Math.PI) / arms);
      const angle = arm + radius * 0.6;
      const scatter = (Math.random() - 0.5) * 0.8;

      pos[i3] = Math.cos(angle) * radius + scatter;
      pos[i3 + 1] = (Math.random() - 0.5) * 0.4;
      pos[i3 + 2] = Math.sin(angle) * radius + scatter;

      // Pastel color palette — pink / amber / lavender
      const t = Math.random();
      if (t < 0.33) {
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.6 + Math.random() * 0.3;
        colors[i3 + 2] = 0.7 + Math.random() * 0.3;
      } else if (t < 0.66) {
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i3 + 2] = 0.4 + Math.random() * 0.2;
      } else {
        colors[i3] = 0.7 + Math.random() * 0.2;
        colors[i3 + 1] = 0.6 + Math.random() * 0.2;
        colors[i3 + 2] = 1.0;
      }
    }

    return { positions: pos, colors };
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref} position={[0, 2, -8]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions.positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={positions.colors}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  );
});

/* ------------------------------------------------------------------ */
/*  Cute sitting character                                             */
/* ------------------------------------------------------------------ */

const SittingCharacter = React.memo(function SittingCharacter() {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    // Gentle breathing motion
    ref.current.position.y = -1.4 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
  });

  return (
    <Float speed={0.4} rotationIntensity={0.05} floatIntensity={0.1}>
      <group ref={ref} position={[0, -1.4, 0]}>
        {/* Platform */}
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[1.2, 0.12, 0.8]} />
          <meshStandardMaterial color="#c4b5fd" emissive="#8b5cf6" emissiveIntensity={0.2} />
        </mesh>

        {/* Body */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.35, 0.4, 0.3]} />
          <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.15} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color="#fecdd3" emissive="#fda4af" emissiveIntensity={0.2} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.07, 0.34, 0.18]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
        <mesh position={[0.07, 0.34, 0.18]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>

        {/* Blush cheeks */}
        <mesh position={[-0.12, 0.3, 0.17]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#fda4af" emissive="#fb7185" emissiveIntensity={0.3} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.12, 0.3, 0.17]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#fda4af" emissive="#fb7185" emissiveIntensity={0.3} transparent opacity={0.6} />
        </mesh>

        {/* Legs (dangling off platform) */}
        <mesh position={[-0.1, -0.35, 0.1]}>
          <boxGeometry args={[0.12, 0.2, 0.12]} />
          <meshStandardMaterial color="#7c3aed" emissive="#6d28d9" emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0.1, -0.35, 0.1]}>
          <boxGeometry args={[0.12, 0.2, 0.12]} />
          <meshStandardMaterial color="#7c3aed" emissive="#6d28d9" emissiveIntensity={0.1} />
        </mesh>
      </group>
    </Float>
  );
});

/* ------------------------------------------------------------------ */
/*  Inner scene                                                        */
/* ------------------------------------------------------------------ */

function SecretSceneInner() {
  return (
    <>
      {/* Warm, soft lighting */}
      <ambientLight intensity={0.25} color="#fff5e6" />
      <pointLight position={[3, 3, 2]} intensity={0.9} color="#fbbf24" />
      <pointLight position={[-3, 2, -1]} intensity={0.7} color="#f9a8d4" />
      <pointLight position={[0, -2, 3]} intensity={0.4} color="#c084fc" />

      {/* Dense star background */}
      <Stars radius={100} depth={80} count={3000} factor={4} saturation={0.3} fade speed={0.3} />

      {/* Galaxy spiral */}
      <GalaxyParticles count={800} />

      {/* Character on platform */}
      <SittingCharacter />

      {/* A few floating hearts & stars for warmth */}
      <FloatingHearts count={3} spread={5} />
      <FloatingStars count={4} spread={6} />

      {/* Slow auto-rotating camera */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.15}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 3.5}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported Canvas wrapper                                            */
/* ------------------------------------------------------------------ */

export default function SecretScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4], fov: 45 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#0a0515']} />
      <fog attach="fog" args={['#0a0515', 8, 25]} />
      <SecretSceneInner />
    </Canvas>
  );
}
