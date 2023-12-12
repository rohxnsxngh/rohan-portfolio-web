import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

function createText(scene, fontLoader, size = 0.45) {
  return new Promise((resolve, reject) => {
    fontLoader.load("/Fonts/Satoshi_Variable_Bold.json", (droidFont) => {
      const textGeometryAbout = new TextGeometry("Rohan.", {
        height: 0.125,
        size: size,
        font: droidFont,
        curveSegments: 15,
        bevelEnabled: false,
        bevelThickness: 5,
      });

      const textGeometryHomeCaption = new TextGeometry(
        "software developer.\nmechanical engineer.",
        {
          height: 0.01,
          size: 0.15,
          font: droidFont,
        }
      );

      const textMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0x170033, //change color
        specular: 0xffffff, //0xEB00D5
        shininess: 5,
        // flatShading: true,
        // wireframe: true
      });
      textGeometryHomeCaption.computeBoundingBox();
      const center = textGeometryHomeCaption.boundingBox.getCenter(new THREE.Vector3());
      const textMeshHome = new THREE.Mesh(textGeometryAbout, textMaterial);
      // textMeshHome.updateMatrixWorld();
      // center.applyMatrix4(textMeshHome.matrixWorld);
      textMeshHome.position.set(-150, 175, 0);
      textMeshHome.scale.set(150, 150, 150);
      scene.add(textMeshHome);

      const textMaterialCaption = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const textMeshHomeCaption = new THREE.Mesh(
        textGeometryHomeCaption,
        textMaterialCaption
      );
      textMeshHomeCaption.position.set(-150, 135, 0);
      textMeshHomeCaption.scale.set(150, 150, 150);
      scene.add(textMeshHomeCaption);
      return textMeshHome, textMeshHomeCaption;
    });
  });
}

export { createText };
