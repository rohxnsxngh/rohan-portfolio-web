import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { createHomeText } from "./three-components/homeText";
import {CSS2DRenderer, CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer.js";


// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const objectsDistance = 4;


const fontLoader = new FontLoader();

// Usage of the createHomeText function
createHomeText(scene, fontLoader);

const sectionMeshes = [

];


const size = 10;
const divisions = 10;

const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

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

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
// scene.add(particles);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};


// CSS2DRenderer
const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(sizes.width, size.height)
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
// labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement)

const p = document.createElement('p')
p.textContent = 'Hello'
const cPointLabel = new CSS2DObject(p)
scene.add(cPointLabel)

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

  // label css2d renderer
  labelRenderer.setSize(sizes.width, sizes.height)
});


let scrollY = window.scrollY;
let currentSection = 0;

// window.addEventListener("scroll", () => {
//   scrollY = window.scrollY;
//   const newSection = Math.round(scrollY / sizes.height);

//   if (newSection != currentSection) {
//     currentSection = newSection;

//     gsap.to(sectionMeshes[currentSection].rotation, {
//       duration: 1.5,
//       ease: "power2.inOut",
//       x: "+=6",
//       y: "+=3",
//     });
//   }
// });

let scrollPos = 0;

// window.addEventListener('scroll', () => {
//   const scrollY = window.scrollY;

//   // If the user has scrolled down, move the camera to the right
//   if (scrollY > scrollPos) {
//     gsap.to(camera.position, {
//       x: "+=10", // Move the camera 1 unit to the right
//       onUpdate: () => camera.updateProjectionMatrix(),
//       ease: "power0.out",
//       duration: 10,
//     });
//   }
//   // If the user has scrolled up, move the camera to the left
//   else if (scrollY < scrollPos) {
//     gsap.to(camera.position, {
//       x: "-=10", // Move the camera 1 unit to the left
//       onUpdate: () => camera.updateProjectionMatrix(),
//       ease: "power0.out",
//       duration: 10,
//     });
//   }

//   // Update scrollPos
//   scrollPos = scrollY;
// });

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
camera.position.set(1, 0, 6); // Set position like this
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

  labelRenderer.render(scene, camera)

  // Animate meshes
  // for (const mesh of sectionMeshes) {
  //   mesh.rotation.x += deltaTime * 0.35;
  //   mesh.rotation.y += deltaTime * 0.352;
  // }

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
