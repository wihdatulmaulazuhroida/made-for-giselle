import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomPosition(spread = 8) {
  return [
    randomInRange(-spread, spread),
    randomInRange(-spread / 2, spread / 2),
    randomInRange(-spread, spread),
  ];
}

/* ------------------------------------------------------------------ */
/*  Single floating item wrappers                                      */
/* ------------------------------------------------------------------ */

/** A single pixel-heart made of tiny boxes arranged in a heart bitmap */
const Heart = React.memo(function Heart({ position, scale = 1, speed = 1 }) {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  // 5×5 heart bitmap (1 = filled)
  const bitmap = useMemo(
    () => [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
    [],
  );

  const color = useMemo(
    () => ['#ff6b9d', '#ff8fab', '#ff4081', '#e91e63'][Math.floor(Math.random() * 4)],
    [],
  );

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.y = position[1] + Math.sin(t) * 0.3;
    ref.current.rotation.y += 0.005;
  });

  return (
    <group ref={ref} position={position} scale={scale * 0.06}>
      {bitmap.flatMap((row, ry) =>
        row.map((cell, cx) =>
          cell ? (
            <mesh key={`${ry}-${cx}`} position={[cx - 2, -(ry - 2), 0]}>
              <boxGeometry args={[0.9, 0.9, 0.9]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
          ) : null,
        ),
      )}
    </group>
  );
});

/** A single star (OctahedronGeometry) */
const Star = React.memo(function Star({ position, scale = 1, speed = 1 }) {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const color = useMemo(
    () => ['#ffd700', '#ffea00', '#ffc107', '#ffab00'][Math.floor(Math.random() * 4)],
    [],
  );

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.y = position[1] + Math.sin(t) * 0.25;
    ref.current.rotation.x += 0.008;
    ref.current.rotation.z += 0.006;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <octahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  );
});

/** A single spinning coin (CylinderGeometry) */
const Coin = React.memo(function Coin({ position, scale = 1, speed = 1 }) {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.y = position[1] + Math.sin(t) * 0.2;
    ref.current.rotation.y += 0.03;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
      <meshStandardMaterial color="#ffd700" emissive="#ff9800" emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
    </mesh>
  );
});

/** A single cloud (grouped spheres) */
const Cloud = React.memo(function Cloud({ position, scale = 1 }) {
  const color = useMemo(
    () => ['#e8e0f0', '#f0e6ff', '#ffffff'][Math.floor(Math.random() * 3)],
    [],
  );

  return (
    <Float speed={0.6} rotationIntensity={0.1} floatIntensity={0.4}>
      <group position={position} scale={scale}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0.3, 0.05, 0]}>
          <sphereGeometry args={[0.28, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} transparent opacity={0.8} />
        </mesh>
        <mesh position={[-0.3, 0.05, 0]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.15, 0.2, 0]}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} transparent opacity={0.75} />
        </mesh>
      </group>
    </Float>
  );
});

/** A single planet with a ring */
const Planet = React.memo(function Planet({ position, scale = 1, speed = 1 }) {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const bodyColor = useMemo(
    () => ['#a78bfa', '#67e8f9', '#f9a8d4', '#86efac', '#fca5a5'][Math.floor(Math.random() * 5)],
    [],
  );
  const ringColor = useMemo(
    () => ['#c4b5fd', '#99f6e4', '#fbcfe8', '#bbf7d0'][Math.floor(Math.random() * 4)],
    [],
  );
  const tilt = useMemo(() => randomInRange(0.3, 0.8), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed * 0.5 + offset;
    ref.current.position.y = position[1] + Math.sin(t) * 0.15;
    ref.current.rotation.y += 0.004;
  });

  return (
    <group ref={ref} position={position} scale={scale} rotation={[tilt, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.03, 8, 32]} />
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={0.2} transparent opacity={0.7} />
      </mesh>
    </group>
  );
});

/* ------------------------------------------------------------------ */
/*  Public collection components                                       */
/* ------------------------------------------------------------------ */

export function FloatingHearts({ count = 6, spread = 8 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: randomPosition(spread),
        scale: randomInRange(0.6, 1.2),
        speed: randomInRange(0.5, 1.5),
      })),
    [count, spread],
  );

  return (
    <group>
      {items.map((item, i) => (
        <Heart key={i} position={item.pos} scale={item.scale} speed={item.speed} />
      ))}
    </group>
  );
}

export function FloatingStars({ count = 8, spread = 8 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: randomPosition(spread),
        scale: randomInRange(0.5, 1.4),
        speed: randomInRange(0.4, 1.3),
      })),
    [count, spread],
  );

  return (
    <group>
      {items.map((item, i) => (
        <Star key={i} position={item.pos} scale={item.scale} speed={item.speed} />
      ))}
    </group>
  );
}

export function FloatingCoins({ count = 5, spread = 7 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: randomPosition(spread),
        scale: randomInRange(0.7, 1.3),
        speed: randomInRange(0.6, 1.4),
      })),
    [count, spread],
  );

  return (
    <group>
      {items.map((item, i) => (
        <Coin key={i} position={item.pos} scale={item.scale} speed={item.speed} />
      ))}
    </group>
  );
}

export function FloatingClouds({ count = 4, spread = 10 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: [randomInRange(-spread, spread), randomInRange(2, 5), randomInRange(-spread, -2)],
        scale: randomInRange(0.8, 1.6),
      })),
    [count, spread],
  );

  return (
    <group>
      {items.map((item, i) => (
        <Cloud key={i} position={item.pos} scale={item.scale} />
      ))}
    </group>
  );
}

export function FloatingPlanets({ count = 3, spread = 12 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: [randomInRange(-spread, spread), randomInRange(-3, 3), randomInRange(-spread, -4)],
        scale: randomInRange(0.8, 1.5),
        speed: randomInRange(0.3, 0.8),
      })),
    [count, spread],
  );

  return (
    <group>
      {items.map((item, i) => (
        <Planet key={i} position={item.pos} scale={item.scale} speed={item.speed} />
      ))}
    </group>
  );
}
