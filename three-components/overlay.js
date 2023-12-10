import * as THREE from "three";
import overlayVertexShader from "../src/shaders/overlay/vertex.glsl";
import overlayFragmentShader from "../src/shaders/overlay/fragment.glsl";

const vignetteColorValue = "#4f1f96";
const overlayColorValue = "#000000";

const geometry = new THREE.PlaneGeometry(2, 2);

const material = new THREE.ShaderMaterial({
  uniforms: {
    uVignetteColor: { value: new THREE.Color(vignetteColorValue) },
    uVignetteMultiplier: { value: 0.98 },
    uVignetteOffset: { value: -0.375 },
    uOverlayColor: { value: new THREE.Color(overlayColorValue) },
    uOverlayAlpha: { value: 0 },
  },
  vertexShader: overlayVertexShader,
  fragmentShader: overlayFragmentShader,
  transparent: true,
  depthTest: false,
});

const overlay = {
  vignetteColor: {
    value: vignetteColorValue,
    instance: new THREE.Color(vignetteColorValue),
  },
  overlayColor: {
    value: overlayColorValue,
    instance: new THREE.Color(overlayColorValue),
  },
  geometry: geometry,
  material: material,
  mesh: new THREE.Mesh(geometry, material),
};

export { overlay };
