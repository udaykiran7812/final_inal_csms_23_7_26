import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// 1. Pristine, Sharp 3D Metallic Helvetica/Inter Bold "S" Typography
const CenterSilverS: React.FC = () => {
  const sGeometry = useMemo(() => {
    const shape = new THREE.Shape();

    // Exact vector mathematical contour of Helvetica/Inter Bold 'S'
    shape.moveTo(0.68, 0.72);
    shape.lineTo(0.22, 0.72);
    shape.bezierCurveTo(-0.25, 0.72, -0.45, 0.58, -0.45, 0.36);
    shape.bezierCurveTo(-0.45, 0.15, -0.22, 0.05, 0.18, -0.06);
    shape.bezierCurveTo(0.62, -0.17, 0.85, -0.38, 0.85, -0.75);
    shape.bezierCurveTo(0.85, -1.22, 0.45, -1.45, -0.22, -1.45);
    shape.bezierCurveTo(-0.58, -1.45, -0.82, -1.35, -0.98, -1.22);
    shape.lineTo(-0.82, -0.78);
    shape.bezierCurveTo(-0.66, -0.92, -0.45, -1.02, -0.2, -1.02);
    shape.bezierCurveTo(0.22, -1.02, 0.42, -0.88, 0.42, -0.68);
    shape.bezierCurveTo(0.42, -0.48, 0.22, -0.38, -0.18, -0.27);
    shape.bezierCurveTo(-0.62, -0.16, -0.85, 0.08, -0.85, 0.42);
    shape.bezierCurveTo(-0.85, 0.88, -0.48, 1.15, 0.2, 1.15);
    shape.bezierCurveTo(0.52, 1.15, 0.76, 1.05, 0.92, 0.92);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.05,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
  }, []);

  return (
    <group scale={1.25}>
      {/* Pristine 3D Silver S Typography */}
      <mesh geometry={sGeometry}>
        <meshPhysicalMaterial
          color="#ffffff"
          emissive="#f1f5f9"
          emissiveIntensity={0.35}
          metalness={0.95}
          roughness={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
        />
      </mesh>
    </group>
  );
};

// 2. Hexagonal Circuit Frame & Orbiting Tracks (Matching Reference Image)
const HexagonalCircuitSystem: React.FC = () => {
  const middleHexRef = useRef<THREE.Group>(null!);
  const outerHexRef = useRef<THREE.Group>(null!);

  // Vertices of a regular hexagon at radius R
  const getHexVertices = (radius: number): [number, number, number][] => {
    const vertices: [number, number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      vertices.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
    }
    return vertices;
  };

  const innerHexVertices = useMemo(() => getHexVertices(1.55), []);
  const middleHexVertices = useMemo(() => getHexVertices(2.15), []);
  const outerHexVertices = useMemo(() => getHexVertices(2.75), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (middleHexRef.current) {
      middleHexRef.current.rotation.z = t * 0.12;
    }
    if (outerHexRef.current) {
      outerHexRef.current.rotation.z = -t * 0.16;
    }
  });

  return (
    <group>
      {/* Static Inner Hexagon Frame */}
      <mesh scale={1.55}>
        <torusGeometry args={[1, 0.035, 16, 6]} />
        <meshPhysicalMaterial
          color="#ffffff"
          emissive="#cbd5e1"
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.15}
          clearcoat={1}
        />
      </mesh>

      {/* Inner Hexagon Corner Nodes */}
      {innerHexVertices.map((pos, idx) => (
        <mesh key={`inner-node-${idx}`} position={pos}>
          <sphereGeometry args={[0.065, 24, 24]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#e2e8f0"
            emissiveIntensity={0.8}
            metalness={0.9}
          />
        </mesh>
      ))}

      {/* Middle Rotating Hexagonal Circuit Track */}
      <group ref={middleHexRef}>
        <mesh scale={2.15} rotation={[0, 0, 0]}>
          <torusGeometry args={[1, 0.03, 16, 6, Math.PI * 1.35]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            emissive="#cbd5e1"
            emissiveIntensity={0.5}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
        <mesh scale={2.15} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[1, 0.03, 16, 6, Math.PI * 1.35]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            emissive="#cbd5e1"
            emissiveIntensity={0.5}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>

        {/* Middle Hexagon Circuit Nodes */}
        {middleHexVertices.slice(0, 4).map((pos, idx) => (
          <mesh key={`mid-node-${idx}`} position={pos}>
            <sphereGeometry args={[0.075, 24, 24]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#f8fafc"
              emissiveIntensity={1.2}
              metalness={0.95}
            />
          </mesh>
        ))}
      </group>

      {/* Outer Counter-Rotating Hexagonal Circuit Track */}
      <group ref={outerHexRef}>
        <mesh scale={2.75} rotation={[0, 0, Math.PI / 6]}>
          <torusGeometry args={[1, 0.028, 16, 6, Math.PI * 1.5]} />
          <meshPhysicalMaterial
            color="#cbd5e1"
            emissive="#94a3b8"
            emissiveIntensity={0.4}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
        <mesh scale={2.75} rotation={[0, 0, (7 * Math.PI) / 6]}>
          <torusGeometry args={[1, 0.028, 16, 6, Math.PI * 1.2]} />
          <meshPhysicalMaterial
            color="#cbd5e1"
            emissive="#94a3b8"
            emissiveIntensity={0.4}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>

        {/* Outer Hexagon Circuit Terminal Nodes */}
        {outerHexVertices.map((pos, idx) => (
          <mesh key={`outer-node-${idx}`} position={pos}>
            <sphereGeometry args={[0.08, 24, 24]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={1.5}
              metalness={0.95}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// 3. Interactive 3D Scene Rig (Right Side Position & Mouse Parallax)
const InteractiveSceneRig: React.FC = () => {
  const sceneGroupRef = useRef<THREE.Group>(null!);
  const { viewport } = useThree();

  // Position 3D Hexagonal Emblem on the right side on desktop, centered on mobile
  const isMobile = viewport.width < 7.5;
  const targetX = isMobile ? 0 : Math.min(viewport.width * 0.24, 2.5);
  const targetScale = isMobile ? 0.85 : 1.05;

  useFrame((state) => {
    if (!sceneGroupRef.current) return;
    const { x, y } = state.pointer;
    const t = state.clock.getElapsedTime();

    // Gentle 3D floating rotation & interactive mouse tilt
    const targetRotY = Math.sin(t * 0.25) * 0.12 + x * 0.4;
    const targetRotX = Math.cos(t * 0.2) * 0.1 - y * 0.4;

    sceneGroupRef.current.rotation.y = THREE.MathUtils.lerp(sceneGroupRef.current.rotation.y, targetRotY, 0.05);
    sceneGroupRef.current.rotation.x = THREE.MathUtils.lerp(sceneGroupRef.current.rotation.x, targetRotX, 0.05);
  });

  return (
    <group ref={sceneGroupRef} position={[targetX, 0, 0]} scale={targetScale}>
      <Float speed={2.0} rotationIntensity={0.15} floatIntensity={0.35}>
        <CenterSilverS />
        <HexagonalCircuitSystem />
      </Float>
    </group>
  );
};

// 4. Main Exported 3D Canvas Background Component
export const LoginBackground3D: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#030305] pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
        {/* Ambient & Metallic Directional Lights */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 10]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#94a3b8" />
        
        {/* Subtle Platinum/Silver Point Lights */}
        <pointLight position={[5, 5, 5]} color="#ffffff" intensity={3} distance={15} />
        <pointLight position={[-5, -5, 5]} color="#e2e8f0" intensity={2} distance={15} />

        {/* Ambient Floating Silver Sparkles */}
        <Sparkles count={50} scale={10} size={2.0} speed={0.3} opacity={0.5} color="#ffffff" />
        <Sparkles count={40} scale={10} size={1.8} speed={0.3} opacity={0.4} color="#cbd5e1" />

        {/* Interactive 3D Model */}
        <InteractiveSceneRig />
      </Canvas>

      {/* Radial Gradient Vignette Overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#030305]/50 to-[#030305] pointer-events-none" />
    </div>
  );
};

export default LoginBackground3D;
