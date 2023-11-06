import * as THREE from "three";
import { gsap } from "gsap";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { createHomeText } from "./src/components/three-components/homeText";

let textMeshAbout, textMeshHomeCaption; // Declare at top level
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const objectsDistance = 4;

// Material
const material = new THREE.MeshPhongMaterial({ color: 0xffffff });

// Meshes
const mesh1 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.25, 125, 15, 2, 7),
  material
);
const mesh2 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.4, 0.35, 100, 16),
  material
); //
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.2, 0.35, 100, 16),
  material
); //
const mesh4 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.6, 55, 8, 9, 3),
  material
); //home
const mesh5 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const mesh6 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.5, 0.25, 77, 8, 20, 1),
  material
); //spike ball
const mesh7 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.025, 70, 5, 17.5, 12),
  material
); // diamond
const mesh8 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.0001, 1, 194, 5, 2, 70),
  material
); // contact
const mesh9 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.2, 1, 80, 10, 50, 3),
  material
); // star contact
const mesh10 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(2, 0.05, 43, 14, 14, 14),
  material
); // star contact
const mesh11 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.2, 0.4, 120, 10, 10, 1),
  material
); // star contact

// general shape
const mesh12 = mesh5.clone();
const mesh13 = mesh3.clone();

const mesh14 = mesh5.clone();
const mesh15 = mesh3.clone();

const mesh16 = mesh5.clone();
const mesh17 = mesh3.clone();

const mesh18 = mesh5.clone();
const mesh19 = mesh3.clone();

mesh4.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2.2;
mesh5.position.y = -objectsDistance * 2.2;
mesh6.position.y = -objectsDistance * 2.5;
mesh7.position.y = -objectsDistance * 3.85;
mesh1.position.y = -objectsDistance * 5.5;
mesh8.position.y = -objectsDistance * 6.5;
mesh11.position.y = -objectsDistance * 8;
mesh9.position.y = -objectsDistance * 9.25;
mesh10.position.y = -objectsDistance * 11;
mesh12.position.y = -objectsDistance * 10;
mesh13.position.y = -objectsDistance * 10;
mesh14.position.y = -objectsDistance * 12;
mesh15.position.y = -objectsDistance * 12;
mesh16.position.y = -objectsDistance * 14;
mesh17.position.y = -objectsDistance * 14;
mesh18.position.y = -objectsDistance * 3;
mesh19.position.y = -objectsDistance * 3;

mesh1.position.x = 0;
mesh2.position.x = 1;
mesh3.position.x = 2;
mesh4.position.x = 0;
mesh5.position.x = 2;
mesh6.position.x = -2.75;
mesh7.position.x = 2;
mesh8.position.x = 0;
mesh9.position.x = 0;
mesh10.position.x = 0;
mesh11.position.x = 0;
mesh12.position.x = 0;
mesh13.position.x = 0;
mesh14.position.x = 0;
mesh15.position.x = 0;
mesh16.position.x = 0;
mesh17.position.x = 0;
mesh18.position.x = -1;
mesh19.position.x = -1;

const fontLoader = new FontLoader();

// Usage of the createHomeText function
createHomeText(scene, fontLoader)

const sectionMeshes = [
  mesh1,
  mesh2,
  mesh3,
  mesh4,
  mesh5,
  mesh6,
  mesh7,
  mesh8,
  mesh9,
  mesh10,
  mesh11,
  mesh12,
  mesh13,
  mesh14,
  mesh15,
  mesh16,
  mesh17,
  mesh18,
  mesh19,
];

scene.add(
  mesh1,
  mesh2,
  mesh3,
  // mesh4,
  mesh5,
  mesh6,
  mesh7,
  mesh8,
  mesh9,
  mesh10,
  mesh11,
  mesh12,
  mesh13,
  mesh14,
  mesh15,
  mesh16,
  mesh17,
  mesh18,
  mesh19
);

const particlesCount = 100;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectsDistance * 0.5 -
    Math.random() * objectsDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// Material
const particlesMaterial = new THREE.PointsMaterial({
  sizeAttenuation: true,
  size: 0.03,
  transparent: true,
  alphaTest: 0.5,
  // color: 0x73d7ff,
});

// Points

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
// scene.add(particles);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  //tone mapping
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.toneMappingWhitePoint = 1.0;
});

let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);

  if (newSection != currentSection) {
    currentSection = newSection;

    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
    });
  }

});

let scrollPos = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // If the user has scrolled down, move the camera to the right
  if (scrollY > scrollPos) {
    gsap.to(camera.position, {
      x: "+=10", // Move the camera 1 unit to the right
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      duration: 10,
    });
  }
  // If the user has scrolled up, move the camera to the left
  else if (scrollY < scrollPos) {
    gsap.to(camera.position, {
      x: "-=10", // Move the camera 1 unit to the left
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      duration: 10,
    });
  }

  // Update scrollPos
  scrollPos = scrollY;
});

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1,0,6); // Set position like this
// camera.lookAt(new THREE.Vector3(0,0,0));
cameraGroup.add(camera);

//Light
const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.8);
camera.add(pointLight);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: false,
});
renderer.setClearColor(0x000000, 0); // Set clear color to transparent
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate meshes
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.35;
    mesh.rotation.y += deltaTime * 0.352;
  }

  if (particles) {
    particles.position.y += Math.sin(deltaTime * 0.75) / 5;
  }

  // Animate camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = cursor.x * 1.5;
  const parallaxY = -cursor.y * 0.5;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
