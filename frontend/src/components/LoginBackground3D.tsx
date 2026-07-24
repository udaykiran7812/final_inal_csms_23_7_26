import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// 1. The Stylized 3D "S" Emblem (Ribbon/Tube Geometry)
const SLogoEmblem: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);

  // Main S-curve definition
  const { mainTubeGeo, innerTubeGeo } = useMemo(() => {
    // Upper loop to lower loop S curve in 3D
    const points = [
      new THREE.Vector3(0.9, 1.25, 0.15),
      new THREE.Vector3(0.35, 1.65, 0.25),
      new THREE.Vector3(-0.7, 1.45, 0.1),
      new THREE.Vector3(-1.15, 0.85, -0.1),
      new THREE.Vector3(-0.8, 0.25, -0.15),
      new THREE.Vector3(0.0, 0.0, 0.0),
      new THREE.Vector3(0.8, -0.25, 0.15),
      new THREE.Vector3(1.15, -0.85, 0.1),
      new THREE.Vector3(0.7, -1.45, -0.1),
      new THREE.Vector3(-0.35, -1.65, -0.25),
      new THREE.Vector3(-0.9, -1.25, -0.15),
    ];

    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    const mainGeo = new THREE.TubeGeometry(curve, 160, 0.16, 32, false);

    // Inner accent curve offset slightly inside
    const innerPoints = points.map((p) => p.clone().multiplyScalar(0.82));
    const innerCurve = new THREE.CatmullRomCurve3(innerPoints, false, 'centripetal');
    const innerGeo = new THREE.TubeGeometry(innerCurve, 160, 0.09, 24, false);

    return { mainTubeGeo: mainGeo, innerTubeGeo: innerGeo };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Gentle floating tilt & wave rotation
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
    groupRef.current.rotation.x = Math.cos(t * 0.25) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Outer Main Glow Tube - Vibrant Cyan to Green & Yellow finish */}
      <mesh geometry={mainTubeGeo}>
        <meshPhysicalMaterial
          color="#00f2fe"
          emissive="#00e5ff"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.85}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Inner Accent Glow Tube - Neon Pink / Magenta */}
      <mesh geometry={innerTubeGeo}>
        <meshPhysicalMaterial
          color="#ff007f"
          emissive="#ff00a0"
          emissiveIntensity={0.9}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
};

// 2. Orbiting Concentric Rings & Spheres (Matching Image Palette)
const OrbitingSystem: React.FC = () => {
  const outerRingRef = useRef<THREE.Mesh>(null!);
  const middleRingRef = useRef<THREE.Mesh>(null!);
  const innerRingRef = useRef<THREE.Mesh>(null!);

  const sphere1Ref = useRef<THREE.Mesh>(null!);
  const sphere2Ref = useRef<THREE.Mesh>(null!);
  const sphere3Ref = useRef<THREE.Mesh>(null!);
  const sphere4Ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Rotate the 3D Rings at distinct speeds and axes
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.2;
      outerRingRef.current.rotation.x = Math.sin(t * 0.1) * 0.2;
    }
    if (middleRingRef.current) {
      middleRingRef.current.rotation.z = -t * 0.28;
      middleRingRef.current.rotation.y = t * 0.15;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 0.35;
      innerRingRef.current.rotation.x = Math.cos(t * 0.15) * 0.25;
    }

    // Orbiting Spheres Along Ring Paths
    const r1 = 2.45;
    if (sphere1Ref.current) {
      // Neon Lime Sphere (Top-Right Orbit)
      const angle = t * 0.6;
      sphere1Ref.current.position.set(Math.cos(angle) * r1, Math.sin(angle) * r1, Math.sin(angle * 2) * 0.3);
    }

    const r2 = 2.85;
    if (sphere2Ref.current) {
      // Electric Cyan Sphere (Left Orbit)
      const angle = -t * 0.5 + 2.0;
      sphere2Ref.current.position.set(Math.cos(angle) * r2, Math.sin(angle) * r2 * 0.85, Math.cos(angle) * 0.5);
    }

    const r3 = 3.25;
    if (sphere3Ref.current) {
      // Hot Magenta Sphere (Bottom-Right Orbit)
      const angle = t * 0.45 + 4.2;
      sphere3Ref.current.position.set(Math.cos(angle) * r3 * 0.9, Math.sin(angle) * r3, Math.sin(angle) * 0.6);
    }

    if (sphere4Ref.current) {
      // Bright Yellow Sphere (Top-Left Orbit)
      const angle = -t * 0.55 + 1.1;
      sphere4Ref.current.position.set(Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, Math.cos(angle * 1.5) * 0.4);
    }
  });

  return (
    <group>
      {/* Outer Magenta Ring */}
      <mesh ref={outerRingRef} scale={3.35}>
        <torusGeometry args={[1, 0.018, 24, 120]} />
        <meshStandardMaterial
          color="#ff00b7"
          emissive="#ff007f"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Middle Cyan Ring */}
      <mesh ref={middleRingRef} scale={2.85} rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[1, 0.016, 24, 120]} />
        <meshStandardMaterial
          color="#00f2fe"
          emissive="#00c8ff"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Inner Lime/Yellow Ring */}
      <mesh ref={innerRingRef} scale={2.45} rotation={[-0.3, -0.4, 0]}>
        <torusGeometry args={[1, 0.015, 24, 120]} />
        <meshStandardMaterial
          color="#a8ff00"
          emissive="#76ff00"
          emissiveIntensity={0.7}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Orbiting Sphere 1 - Neon Lime Green */}
      <mesh ref={sphere1Ref}>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshStandardMaterial
          color="#76ff00"
          emissive="#a8ff00"
          emissiveIntensity={1.5}
          roughness={0.1}
        />
      </mesh>

      {/* Orbiting Sphere 2 - Electric Cyan */}
      <mesh ref={sphere2Ref}>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00f2fe"
          emissiveIntensity={1.5}
          roughness={0.1}
        />
      </mesh>

      {/* Orbiting Sphere 3 - Vivid Magenta */}
      <mesh ref={sphere3Ref}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ff00a0"
          emissive="#ff00d4"
          emissiveIntensity={1.5}
          roughness={0.1}
        />
      </mesh>

      {/* Orbiting Sphere 4 - Bright Yellow */}
      <mesh ref={sphere4Ref}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffea00"
          emissiveIntensity={1.5}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

// 3. Interactive Scene Rig with Mouse Parallax Rotation & Right-Side Positioning
const InteractiveSceneRig: React.FC = () => {
  const sceneGroupRef = useRef<THREE.Group>(null!);
  const { viewport } = useThree();

  // Position 3D emblem to the right side on desktop, centered on mobile screens
  const isMobile = viewport.width < 7.5;
  const targetX = isMobile ? 0 : Math.min(viewport.width * 0.24, 2.5);
  const targetScale = isMobile ? 0.85 : 1.0;

  useFrame((state) => {
    if (!sceneGroupRef.current) return;
    const { x, y } = state.pointer;
    const t = state.clock.getElapsedTime();

    // Continuous 3D rotation + smooth mouse pointer parallax tilt
    const targetRotY = t * 0.25 + x * 0.45;
    const targetRotX = Math.sin(t * 0.2) * 0.15 - y * 0.45;

    sceneGroupRef.current.rotation.y = THREE.MathUtils.lerp(sceneGroupRef.current.rotation.y, targetRotY, 0.05);
    sceneGroupRef.current.rotation.x = THREE.MathUtils.lerp(sceneGroupRef.current.rotation.x, targetRotX, 0.05);
  });

  return (
    <group ref={sceneGroupRef} position={[targetX, 0, 0]} scale={targetScale}>
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <SLogoEmblem />
        <OrbitingSystem />
      </Float>
    </group>
  );
};

// 4. Main Exported 3D Canvas Background Component
export const LoginBackground3D: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#090314] pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
        {/* Ambient & Multi-Color Point Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        
        {/* Neon Accent Lights matching Image Palette */}
        <pointLight position={[-6, 6, 4]} color="#ff00a0" intensity={4} distance={15} />
        <pointLight position={[6, -6, 4]} color="#00f2fe" intensity={4} distance={15} />
        <pointLight position={[0, 6, -4]} color="#a8ff00" intensity={3} distance={15} />
        <pointLight position={[0, -6, -4]} color="#ffea00" intensity={3} distance={15} />

        {/* Ambient 3D Glowing Dust Particles */}
        <Sparkles count={80} scale={10} size={2.5} speed={0.4} opacity={0.6} color="#00e5ff" />
        <Sparkles count={60} scale={10} size={2.5} speed={0.4} opacity={0.6} color="#ff00d4" />

        {/* Interactive 3D Model Positioned Right */}
        <InteractiveSceneRig />
      </Canvas>

      {/* Radial Gradient Glow Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#090314]/40 to-[#090314] pointer-events-none" />
    </div>
  );
};

export default LoginBackground3D;
