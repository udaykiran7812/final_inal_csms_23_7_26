import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    const { x, y } = state.pointer;
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.25 + y * 0.3;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3 + x * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={2.2}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.45}
          speed={2.2}
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </mesh>
    </Float>
  );
};

const SecondaryRing: React.FC = () => {
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.15;
    ringRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
  });

  return (
    <mesh ref={ringRef} scale={3.4}>
      <torusGeometry args={[1, 0.02, 16, 100]} />
      <meshBasicMaterial color="#a5b4fc" wireframe opacity={0.35} transparent />
    </mesh>
  );
};

export const LoginBackground3D: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color="#4f46e5" intensity={2} />
        <AnimatedShape />
        <SecondaryRing />
      </Canvas>
    </div>
  );
};

export default LoginBackground3D;
