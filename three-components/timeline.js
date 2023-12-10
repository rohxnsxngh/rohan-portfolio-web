import { gsap } from "gsap";
import { animationInProgress, setAnimationInProgress } from "./animationState";

export const timeline = (camera) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false)
    },
  });

  // Animation for scrolling down
  if (!animationInProgress && camera.position.y === 0) {
    tl.to(camera.position, {
      z: 1,
      y: 0,
      x: -2,
      onUpdate: () => camera.lookAt(1, 0, 0),
      ease: "power1.out",
      duration: 2.5,
      onStart: () => {
        setAnimationInProgress(true)
      },
    })
      .to(camera.position, {
        z: 1,
        y: 0,
        x: 2,
        onUpdate: () => camera.lookAt(1, 0, 0),
        ease: "power1.out",
        duration: 2.5,
        delay: 0.2,
      })
      .to(camera.position, {
        z: 6,
        y: 5,
        x: 5,
        onUpdate: () => camera.lookAt(5, 5, 0),
        ease: "power1.out",
        duration: 2.5,
        delay: 0.2,
      });
  }

  return animationInProgress;
};


// export const returnHome = (camera) => {
//   let animationProgress = false;

//   if (!animationProgress && camera) {
//     gsap.to(camera.position, {
//       z: 6,
//       y: 0,
//       x: 1,
//       onUpdate: () => camera.lookAt(1, 0, 0),
//       ease: "power1.out",
//       overwrite: "none",
//       duration: 2,
//       onStart: () => {
//         animationProgress = true;
//       },
//       onComplete: () => {
//         animationProgress = false;
//       },
//       delay: 0.2,
//     });
//   }
// };
