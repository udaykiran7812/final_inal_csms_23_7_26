import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export const LoginBackground3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const path = svgPathRef.current;
    if (!container || !path) return;

    /* THREE SCENE SETUP */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );

    // Responsive camera Z distance based on screen width
    const updateCameraZ = () => {
      if (window.innerWidth < 640) {
        camera.position.z = 750;
      } else if (window.innerWidth < 1024) {
        camera.position.z = 600;
      } else {
        camera.position.z = 500;
      }
    };
    updateCameraZ();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    container.appendChild(renderer.domElement);

    /* PARTICLES & GSAP ANIMATION */
    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
    });

    const length = path.getTotalLength();
    const vertices: THREE.Vector3[] = [];

    // Step length for sampling points along the SVG path
    const step = length > 2000 ? 0.25 : 0.15;

    for (let i = 0; i < length; i += step) {
      const point = path.getPointAtLength(i);
      const vector = new THREE.Vector3(point.x, -point.y, 0);
      vector.x += (Math.random() - 0.5) * 30;
      vector.y += (Math.random() - 0.5) * 30;
      vector.z += (Math.random() - 0.5) * 70;
      vertices.push(vector);

      tl.from(
        vector,
        {
          x: 600 / 2,
          y: -552 / 2,
          z: 0,
          ease: 'power2.inOut',
          duration: Math.random() * 3 + 2,
        },
        i * 0.002
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const material = new THREE.PointsMaterial({
      color: 0xee5282,
      blending: THREE.AdditiveBlending,
      size: 3,
      transparent: true,
      opacity: 0.9,
    });

    const particles = new THREE.Points(geometry, material);
    particles.position.x -= 600 / 2;
    particles.position.y += 552 / 2;
    scene.add(particles);

    // Subtle ambient rotation tween
    const rotationTween = gsap.fromTo(
      scene.rotation,
      { y: -0.25 },
      {
        y: 0.25,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        duration: 3.5,
      }
    );

    /* MOUSE PARALLAX INTERACTION */
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', handleMouseMove);

    /* RENDER LOOP */
    let animationFrameId: number;
    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      // Smooth mouse follow
      scene.rotation.x += (mouseY - scene.rotation.x) * 0.05;
      geometry.setFromPoints(vertices);
      renderer.render(scene, camera);
    };
    render();

    /* RESIZE LISTENER */
    const handleResize = () => {
      updateCameraZ();
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    /* CLEANUP */
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      tl.kill();
      rotationTween.kill();
      geometry.dispose();
      material.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Hidden SVG Path used for particle calculation */}
      <svg className="hidden absolute" viewBox="0 0 600 552" style={{ display: 'none' }}>
        <path
          ref={svgPathRef}
          d="M300,107.77C284.68,55.67,239.76,0,162.31,0,64.83,0,0,82.08,0,171.71c0,.48,0,.95,0,1.43-.52,19.5,0,217.94,299.87,379.69v0l0,0,.05,0,0,0,0,0v0C600,391.08,600.48,192.64,600,173.14c0-.48,0-.95,0-1.43C600,82.08,535.17,0,437.69,0,360.24,0,315.32,55.67,300,107.77"
        />
      </svg>

      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
};

export default LoginBackground3D;
