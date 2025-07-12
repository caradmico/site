import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Solid black background

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Positioned to center the sphere clearly

const loader = new THREE.TextureLoader();
const texture = loader.load('./8k_sun.jpg'); // Local path to avoid CORS issues
// Attribution: Texture from https://www.solarsystemscope.com/textures/ under CC BY 4.0 license

// Light to enhance surface relief shading
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Sun sphere with surface relief using bump and displacement
const geometry = new THREE.SphereGeometry(1, 128, 128); // Higher segments for displacement detail
const sunMaterial = new THREE.MeshStandardMaterial({
  map: texture,
  bumpMap: texture,
  bumpScale: 0.05,
  displacementMap: texture,
  displacementScale: 0.02, // Small scale to avoid excessive distortion
  emissiveMap: texture,
  emissive: 0xffffff,
  emissiveIntensity: 1.2,
  roughness: 0.8,
  metalness: 0
});
const sun = new THREE.Mesh(geometry, sunMaterial);
scene.add(sun);

// Glow effect: Larger outer sphere
const glowGeometry = new THREE.SphereGeometry(1.5, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  transparent: true,
  opacity: 0.2,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide // Renders the inside for a halo effect
});
const glow = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glow);

// Handle window resize for full-screen responsiveness
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    // Animation: Slow rotation for realism
    sun.rotation.y += 0.001;
    glow.rotation.y += 0.001; // Sync glow rotation
    renderer.render(scene, camera);
}

animate();