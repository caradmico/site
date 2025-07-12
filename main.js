import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Solid black background

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.set(0, 0, 50); // Start positioned near Earth distance

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enablePan = true;

// Texture loader
const loader = new THREE.TextureLoader();

// Planets data with semi-major axes (distance in AU), visual radii (not to scale), textures, and initial angles from July 12, 2025 positions
const planetsData = [
  { name: 'mercury', distance: 0.387, radius: 0.5, texturePath: './textures/8k_mercury.jpg', initialAngle: Math.atan2(-0.39360647687959077, -0.15617905102240556) },
  { name: 'venus', distance: 0.723, radius: 1, texturePath: './textures/8k_venus_surface.jpg', initialAngle: Math.atan2(0.0038495805009816936, 0.7252778270399232) },
  { name: 'earth', distance: 1.0, radius: 1.2, texturePath: './textures/8k_earth_daymap.jpg', initialAngle: Math.atan2(-0.8787777356810902, 0.3404893717576449) },
  { name: 'mars', distance: 1.524, radius: 0.8, texturePath: './textures/8k_mars.jpg', initialAngle: Math.atan2(-0.3810775835484354, -1.5794890330124596) },
  { name: 'jupiter', distance: 5.203, radius: 3, texturePath: './textures/8k_jupiter.jpg', initialAngle: Math.atan2(4.714503915866097, -0.402812960921938) },
  { name: 'saturn', distance: 9.537, radius: 2.5, texturePath: './textures/8k_saturn.jpg', initialAngle: Math.atan2(-0.5010083118219353, 9.538669032672617) },
  { name: 'uranus', distance: 19.191, radius: 2, texturePath: './textures/2k_uranus.jpg', initialAngle: Math.atan2(15.145688517082386, 10.467032049592055) },
  { name: 'neptune', distance: 30.069, radius: 2, texturePath: './textures/2k_neptune.jpg', initialAngle: Math.atan2(0.24889225814952515, 29.881968387607646) }
];

const distanceScale = 50; // Units per AU to ensure planets are outside sun and visible
const sunRadius = 10; // 10x larger than original for visibility
const speedup = 100; // Approx factor to make change speed

// Create sun
const sunTexture = loader.load('./textures/8k_sun.jpg');
const sunGeometry = new THREE.SphereGeometry(sunRadius, 128, 128);
const sunMaterial = new THREE.MeshStandardMaterial({
  map: sunTexture,
  bumpMap: sunTexture,
  bumpScale: 0.5, // Scaled up for larger radius
  displacementMap: sunTexture,
  displacementScale: 0.2, // Scaled up
  emissiveMap: sunTexture,
  emissive: 0xffffff,
  emissiveIntensity: 1.2,
  roughness: 0.8,
  metalness: 0
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Glow effect for sun
const glowGeometry = new THREE.SphereGeometry(sunRadius * 1.5, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  transparent: true,
  opacity: 0.2,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide
});
const glow = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glow);

// Point light at sun to illuminate planets (with falloff for realism)
const sunLight = new THREE.PointLight(0xffffee, 10000, 0, 2); // High intensity, infinite distance, 1/r^2 decay
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Low ambient for space
scene.add(ambientLight);

// Create planets
const planets = [];
planetsData.forEach(data => {
  const texture = loader.load(data.texturePath);
  const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 1,
    metalness: 0
  });
  const planet = new THREE.Mesh(geometry, material);
  // Initial position (approximated to xy-plane circular orbit)
  const scaledDist = data.distance * distanceScale;
  planet.position.x = scaledDist * Math.cos(data.initialAngle);
  planet.position.z = scaledDist * Math.sin(data.initialAngle);
  scene.add(planet);
  planets.push({ mesh: planet, distance: scaledDist, initialAngle: data.initialAngle, tRealYears: Math.sqrt(Math.pow(data.distance, 3)), radius: data.radius });
});

// Simple random starfield backdrop
const starsCount = 10000;
const starsGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(starsCount * 3);
for (let i = 0; i < starsCount * 3; i += 3) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  const r = 10000; // Large radius
  posArray[i] = r * Math.sin(phi) * Math.cos(theta);
  posArray[i + 1] = r * Math.sin(phi) * Math.sin(theta);
  posArray[i + 2] = r * Math.cos(phi);
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Clock for delta time
const clock = new THREE.Clock();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta(); // Seconds since last frame

  // Rotate sun and glow slowly
  const sunRotationSpeed = 0.1; // rad/s for visibility
  sun.rotation.y += sunRotationSpeed * delta;
  glow.rotation.y += sunRotationSpeed * delta;

  // Orbit planets
  planets.forEach(planet => {
    const omega = (2 * Math.PI / planet.tRealYears) * speedup; // rad/s, with speedup
    planet.mesh.position.x = planet.distance * Math.cos(planet.initialAngle + omega * clock.getElapsedTime());
    planet.mesh.position.z = planet.distance * Math.sin(planet.initialAngle + omega * clock.getElapsedTime());
    // Optional: Slow self-rotation for planets
    planet.mesh.rotation.y += 0.05 * delta;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();