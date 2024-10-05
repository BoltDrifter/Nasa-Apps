// Scene setup

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet Data (name, size, orbit radius, and orbit speed)
const planets = [
  { name: 'Mercury', size: 0.5, orbitRadius: 8, orbitSpeed: 0.02,texture: 'Nasa-Apps/textures/mercury.jpg'},
  { name: 'Venus', size: 0.9, orbitRadius: 11, orbitSpeed: 0.015,texture: 'Nasa-Apps/textures/venus.jpg'},
  { name: 'Earth', size: 1, orbitRadius: 15, orbitSpeed: 0.01 ,texture: 'Nasa-Apps/textures/earth.jpg'},
  { name: 'Mars', size: 0.8, orbitRadius: 19, orbitSpeed: 0.008 ,texture: 'Nasa-Apps/textures/mars.jpg'},
  { name: 'Jupiter', size: 2, orbitRadius: 25, orbitSpeed: 0.005 ,texture: 'Nasa-Apps/textures/jupiter.jpg'},
  { name: 'Saturn', size: 1.7, orbitRadius: 30, orbitSpeed: 0.003 ,texture: 'Nasa-Apps/textures/saturn.jpg'},
  { name: 'Uranus', size: 1.5, orbitRadius: 35, orbitSpeed: 0.002 ,texture: 'Nasa-Apps/textures/Uranus.jpg'},
  { name: 'Neptune', size: 1.4, orbitRadius: 40, orbitSpeed: 0.0015,texture: 'Nasa-Apps/textures/neptune.jpg'}
];


// Create each planet as a mesh and add to the scene
planets.forEach(planet => {
  planet.geometry = new THREE.SphereGeometry(planet.size, 32, 32);
  planet.material = new THREE.MeshBasicMaterial({ texture: `./textures/${planet.name.toLowerCase()}$.jpg`});
  planet.mesh = new THREE.Mesh(planet.geometry, planet.material);
  scene.add(planet.mesh);

  // Create orbit line
  const orbitPoints = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    orbitPoints.push(new THREE.Vector3(Math.cos(angle) * planet.orbitRadius, 0, Math.sin(angle) * planet.orbitRadius));
  }

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.5, gapSize: 0.5 });
  const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
  orbit.computeLineDistances(); // Required for dashed lines
  scene.add(orbit);
});

// Set camera position and rotation for a 45-degree angle view
camera.position.set(50, 50, 50);
camera.lookAt(scene.position);

// Orbit parameters (start angles)
let angles = planets.map(() => 0);

// Animate the scene
function animate() {
  requestAnimationFrame(animate);

  // Update each planet's position
  planets.forEach((planet, i) => {
    angles[i] += planet.orbitSpeed;
    planet.mesh.position.x = Math.cos(angles[i]) * planet.orbitRadius;
    planet.mesh.position.z = Math.sin(angles[i]) * planet.orbitRadius;
  });

  renderer.render(scene, camera);
}

// Start the animation
animate();