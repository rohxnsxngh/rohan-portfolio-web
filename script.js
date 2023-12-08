import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { createHomeText } from "./three-components/homeText";
import overlayVertexShader from "./src/shaders/overlay/vertex.glsl";
import overlayFragmentShader from "./src/shaders/overlay/fragment.glsl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const objectsDistance = 4;

const fontLoader = new FontLoader();

// Usage of the createHomeText function
createHomeText(scene, fontLoader);

const size = 10;
const divisions = 10;

const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const overlay = {};

overlay.vignetteColor = {};
overlay.vignetteColor.value = "#4f1f96";
overlay.vignetteColor.instance = new THREE.Color(overlay.vignetteColor.value);

overlay.overlayColor = {};
overlay.overlayColor.value = "#000000";
overlay.overlayColor.instance = new THREE.Color(overlay.overlayColor.value);

overlay.geometry = new THREE.PlaneGeometry(2, 2);

overlay.material = new THREE.ShaderMaterial({
  uniforms: {
    uVignetteColor: { value: overlay.vignetteColor.instance },
    uVignetteMultiplier: { value: 0.98 },
    uVignetteOffset: { value: -0.165 },
    uOverlayColor: { value: overlay.overlayColor.instance },
    uOverlayAlpha: { value: 0 },
  },
  vertexShader: overlayVertexShader,
  fragmentShader: overlayFragmentShader,
  transparent: true,
  depthTest: false,
});
overlay.mesh = new THREE.Mesh(overlay.geometry, overlay.material);
overlay.mesh.userData.noBokeh = true;
overlay.mesh.frustumCulled = false;
scene.add(overlay.mesh);

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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
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

// Initialize scrollPos with the initial scroll position
let scrollPos = window.scrollY;
let animationProgress = false;

function timeline() {
  const tl = gsap.timeline();
  const newScrollPos = window.scrollY; // Get the current scroll position

  // Animation for scrolling down
  if (newScrollPos > scrollPos && !animationProgress) {
    tl.to(camera.position, {
      z: 1,
      y: -5,
      x: 0,
      onUpdate: () => camera.lookAt(1, 0, 0),
      ease: "power1.out",
      overwrite: "none",
      duration: 3,
      onStart: () => {
        animationProgress = true;
      },
    }).to(camera.position, {
      z: 1,
      y: 5,
      x: 0,
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      duration: 3,
      onComplete: () => {
        animationProgress = false;
      },
    });
  } else if (newScrollPos < scrollPos && !animationProgress) {
    // Animation for scrolling up
    tl.to(camera.position, {
      z: 6,
      x: 1,
      y: 0,
      onUpdate: () => camera.lookAt(1, 0, 0),
      ease: "power1.out",
      duration: 1.5,
      onStart: () => {
        animationProgress = true;
      },
      onComplete: () => {
        animationProgress = false;
      },
    });
  }

  // Update scrollPos with the new scroll position
  scrollPos = newScrollPos;
}

// const controls = new OrbitControls( camera, renderer.domElement );
// controls.update()

// window.addEventListener("scroll", () => {
//   console.log("scrolled");
//   timeline();
// });

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

document.addEventListener("DOMContentLoaded", function () {

  const cssrenderer = new CSS3DRenderer();
  cssrenderer.setSize(window.innerWidth, window.innerHeight);
  cssrenderer.domElement.style.position = "absolute";
  cssrenderer.domElement.style.top = "0";
  document.body.appendChild(cssrenderer.domElement);

  const element = document.getElementById("vueapp");
  const cssObject = new CSS3DObject(element);
  cssObject.position.set(0, -2, -5);
  cssObject.scale.set(0.005, 0.005, 0.005);
  // cssObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  scene.add(cssObject);

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    controls.update();

    // const parallaxX = cursor.x * 1.5;
    // const parallaxY = -cursor.y * 0.5;

    // cameraGroup.position.x +=
    //   (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
    // cameraGroup.position.y +=
    //   (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

    // Render
    renderer.render(scene, camera);
    cssrenderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
});
