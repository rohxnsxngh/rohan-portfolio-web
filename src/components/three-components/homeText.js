import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

function createHomeText(scene, fontLoader, size = 0.45) {
  return new Promise((resolve, reject) => {
    fontLoader.load("/Fonts/Satoshi_Variable_Bold.json", (droidFont) => {
      const textGeometryAbout = new TextGeometry("Rohan Singh.", {
        height: 0.125,
        size: size,
        font: droidFont,
        curveSegments: 15,
        bevelEnabled: false,
        bevelThickness: 5,
      });

      const textGeometryHomeCaption = new TextGeometry(
        "software developer. mechanical engineer.",
        {
          height: 0.01,
          size: 0.15,
          font: droidFont,
        }
      );

      const textMaterialAbout = new THREE.MeshNormalMaterial();
      const textMeshAbout = new THREE.Mesh(textGeometryAbout, textMaterialAbout);
      textMeshAbout.position.set(0, 0, 0);
      scene.add(textMeshAbout);

      const textMaterialHomeCaption = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const textMeshHomeCaption = new THREE.Mesh(textGeometryHomeCaption, textMaterialHomeCaption);
      textMeshHomeCaption.position.set(0, -0.35, 0);
      scene.add(textMeshHomeCaption);

      resolve({ textMeshAbout, textMeshHomeCaption });
    });
  });
}

export { createHomeText };
