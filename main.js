import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Solid black background

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Positioned to center the sphere clearly

const geometry = new THREE.SphereGeometry(1, 32, 32); // Sphere at origin (0, 0, 0)
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Vibrant yellow, evenly illuminated
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Handle window resize for full-screen responsiveness
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();