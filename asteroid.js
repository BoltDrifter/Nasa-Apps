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

// Planet Data
const planets = [
  { name: 'Mercury', size: 0.5, orbitRadius: 8, orbitSpeed: 0.02, texture: 'textures/mercury.jpg' },
  { name: 'Venus', size: 0.9, orbitRadius: 11, orbitSpeed: 0.015, texture: 'textures/venus.jpg' },
  { name: 'Earth', size: 1, orbitRadius: 15, orbitSpeed: 0.01, texture: 'textures/earth.jpg' },
  { name: 'Mars', size: 0.8, orbitRadius: 19, orbitSpeed: 0.008, texture: 'textures/mars.jpg' },
  { name: 'Jupiter', size: 2, orbitRadius: 25, orbitSpeed: 0.005, texture: 'textures/jupiter.jpg' },
  { name: 'Saturn', size: 1.7, orbitRadius: 30, orbitSpeed: 0.003, texture: 'textures/saturn.jpg' },
  { name: 'Uranus', size: 1.5, orbitRadius: 35, orbitSpeed: 0.002, texture: 'textures/uranus.jpg' },
  { name: 'Neptune', size: 1.4, orbitRadius: 40, orbitSpeed: 0.0015, texture: 'textures/neptune.jpg' }
];

// Asteroid Data with Keplerian parameters
const asteroids = [
  { name: '99942 Apophis', size: 0.3, orbitRadius: 30, orbitSpeed: 0.004, texture: 'textures/asteroid.jpg' },
  { name: '4179 Toutatis', size: 0.5, orbitRadius: 40, orbitSpeed: 0.0035, texture: 'textures/asteroid.jpg' },
  { name: '433 Eros', size: 0.4, orbitRadius: 50, orbitSpeed: 0.003, texture: 'textures/asteroid.jpg' },
  { name: 'Bennu', size: 0.6, orbitRadius: 60, orbitSpeed: 0.0025, texture: 'textures/asteroid.jpg' },
  { name: 'Vanguard 1', size: 0.2, orbitRadius: 70, orbitSpeed: 0.002, texture: 'textures/asteroid.jpg' },
  { name: 'Envisat', size: 0.4, orbitRadius: 80, orbitSpeed: 0.0018, texture: 'textures/asteroid.jpg' },
  { name: 'Mini Moon 2024 PT5', size: 0.3, orbitRadius: 90, orbitSpeed: 0.0015, texture: 'textures/asteroid.jpg' }
];


// Function to create celestial bodies (planets and asteroids)
function createCelestialBodies(celestialBodies, isPlanet = true) {
  celestialBodies.forEach(body => {
    body.geometry = new THREE.SphereGeometry(body.size, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(
      body.texture,
      (texture) => {
        body.material = new THREE.MeshBasicMaterial({ map: texture });
        body.mesh = new THREE.Mesh(body.geometry, body.material);
        scene.add(body.mesh);
        console.log(`Loaded texture for ${body.name}`);
      },
      undefined,
      (err) => {
        console.error(`Error loading texture for ${body.name}:`, err);
      }
    );

    // Create orbit line
    const orbitPoints = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(angle) * body.orbitRadius, 0, Math.sin(angle) * body.orbitRadius));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineDashedMaterial({ color: isPlanet ? 0xffffff : 0xffa500, dashSize: 0.5, gapSize: 0.5 });
    body.orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    body.orbit.computeLineDistances();
    scene.add(body.orbit);
  });
}

// Create planets and asteroids
createCelestialBodies(planets, true);
createCelestialBodies(asteroids, false);

// Set camera position
camera.position.set(50, 50, 50);
camera.lookAt(scene.position);

// Orbit parameters
let angles = planets.map(() => 0).concat(asteroids.map(() => 0)); // Combine angles for planets and asteroids

// Animation control
let isPaused = false;

function animate() {
  if (!isPaused) {
    requestAnimationFrame(animate);

    // Update each celestial body's position
    [...planets, ...asteroids].forEach((body, i) => {
      angles[i] += body.orbitSpeed;
      if (body.mesh) {
        body.mesh.position.x = Math.cos(angles[i]) * body.orbitRadius;
        body.mesh.position.z = Math.sin(angles[i]) * body.orbitRadius;
      }
    });

    renderer.render(scene, camera);
  }
}

// Function to clear all orbit lines
function clearOrbitLines() {
  [...planets, ...asteroids].forEach(body => {
    if (body.orbit) {
      scene.remove(body.orbit);
    }
  });
}

// Responsive design
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Search functionality with zoom, enlarge, and pause
document.getElementById('search-button').addEventListener('click', () => {
  clearOrbitLines();
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  [...planets, ...asteroids].forEach(body => {
    if (body.name.toLowerCase().includes(searchTerm)) {
      body.mesh.visible = true;
      const zoomFactor = 2; // Adjust this factor to control the zoom level
      const targetPosition = {
        x: body.mesh.position.x,
        y: body.mesh.position.y,
        z: body.mesh.position.z + body.size * zoomFactor
      };
      new TWEEN.Tween(camera.position)
        .to(targetPosition, 2000) // 2 seconds for the zoom
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          camera.lookAt(body.mesh.position);
        })
        .onComplete(() => {
          // Hide the sun and the orbit line
          sun.visible = false;
          body.orbit.visible = false;
          // Enlarge the celestial body
          new TWEEN.Tween(body.mesh.scale)
            .to({ x: 1.5, y: 1.5, z: 1.5 }, 1000) // 1 second to enlarge
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(() => {
              // Pause the animation after enlarging
              isPaused = true;
            })
            .start();
        })
        .start();
    } else {
      body.mesh.visible = false;
    }
  });
});

// Pause button functionality
document.getElementById('pause-button').addEventListener('click', () => {
  isPaused = !isPaused;
  if (!isPaused) {
    animate();
  }
});

// Start the animation
animate();

// Update TWEEN animations
function update() {
  requestAnimationFrame(update);
  TWEEN.update();
}
update();
