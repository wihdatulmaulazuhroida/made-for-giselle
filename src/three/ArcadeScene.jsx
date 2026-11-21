import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Float } from '@react-three/drei';
import {
  FloatingHearts,
  FloatingStars,
  FloatingCoins,
  FloatingClouds,
  FloatingPlanets,
} from './FloatingObjects';

/* ------------------------------------------------------------------ */
/*  Arcade Machine                                                     */
/* ------------------------------------------------------------------ */

const ArcadeMachine = React.memo(function ArcadeMachine() {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
  });

  return (
    <group ref={ref}>
      {/* Cabinet body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 2.2, 0.9]} />
        <meshStandardMaterial color="#1a1040" emissive="#3b0764" emissiveIntensity={0.3} />
      </mesh>

      {/* Screen bezel */}
      <mesh position={[0, 0.4, 0.46]}>
        <boxGeometry args={[0.9, 0.9, 0.05]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Screen (emissive glow) */}
      <mesh position={[0, 0.4, 0.49]}>
        <boxGeometry args={[0.75, 0.7, 0.02]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
      </mesh>

      {/* Screen scanline overlay — subtle */}
      <mesh position={[0, 0.4, 0.505]}>
        <boxGeometry args={[0.75, 0.7, 0.001]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.1} />
      </mesh>

      {/* Marquee / header */}
      <mesh position={[0, 1.25, 0.1]}>
        <boxGeometry args={[1.1, 0.3, 0.6]} />
        <meshStandardMaterial color="#7c3aed" emissive="#a855f7" emissiveIntensity={0.5} />
      </mesh>

      {/* Control panel */}
      <mesh position={[0, -0.4, 0.55]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[1.0, 0.4, 0.3]} />
        <meshStandardMaterial color="#1e1b4b" emissive="#4338ca" emissiveIntensity={0.2} />
      </mesh>

      {/* Joystick base */}
      <mesh position={[-0.2, -0.25, 0.7]}>
        <cylinderGeometry args={[0.06, 0.08, 0.04, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Joystick stick */}
      <mesh position={[-0.2, -0.12, 0.7]}>
        <cylinderGeometry args={[0.025, 0.025, 0.2, 8]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Joystick knob */}
      <mesh position={[-0.2, -0.01, 0.7]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.4} />
      </mesh>

      {/* Buttons */}
      {[0.1, 0.25, 0.4].map((x, i) => (
        <mesh key={i} position={[x, -0.26, 0.72]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
          <meshStandardMaterial
            color={['#ec4899', '#8b5cf6', '#06b6d4'][i]}
            emissive={['#ec4899', '#8b5cf6', '#06b6d4'][i]}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Coin slot */}
      <mesh position={[0, -0.85, 0.46]}>
        <boxGeometry args={[0.15, 0.04, 0.02]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Base / stand */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[1.3, 0.15, 1.0]} />
        <meshStandardMaterial color="#0f0a2a" />
      </mesh>
    </group>
  );
});

/* ------------------------------------------------------------------ */
/*  Inner scene (rendered inside Canvas)                               */
/* ------------------------------------------------------------------ */

function ArcadeSceneInner() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 4, 3]} intensity={1.2} color="#a78bfa" />
      <pointLight position={[-3, 2, -2]} intensity={0.8} color="#ec4899" />
      <pointLight position={[0, -1, 4]} intensity={0.6} color="#06b6d4" />

      {/* Background stars */}
      <Stars radius={80} depth={60} count={1500} factor={3} saturation={0.5} fade speed={0.8} />

      {/* Arcade machine */}
      <ArcadeMachine />

      {/* Floating objects */}
      <FloatingHearts count={5} spread={7} />
      <FloatingStars count={7} spread={8} />
      <FloatingCoins count={4} spread={6} />
      <FloatingClouds count={3} spread={9} />
      <FloatingPlanets count={3} spread={14} />

      {/* Camera controls */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported Canvas wrapper                                            */
/* ------------------------------------------------------------------ */

export default function ArcadeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 5], fov: 50 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#070b1a']} />
      <fog attach="fog" args={['#070b1a', 10, 30]} />
      <ArcadeSceneInner />
    </Canvas>
  );
}
