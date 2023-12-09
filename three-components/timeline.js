import { gsap } from "gsap";

export const timeline = (animationProgress, scrollPos, camera) => {
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
      duration: 2.5,
      onStart: () => {
        animationProgress = true;
      },
    }).to(camera.position, {
      z: 1,
      y: 5,
      x: 0,
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      overwrite: "none",
      duration: 1.5,
      onComplete: () => {
        animationProgress = false;
      },
    });
  } 
//   else if (newScrollPos < scrollPos && !animationProgress) {
//     // Animation for scrolling up
//     tl.to(camera.position, {
//       z: 6,
//       x: 1,
//       y: 0,
//       onUpdate: () => camera.lookAt(1, 0, 0),
//       ease: "power1.out",
//     //   overwrite: "none",
//       duration: 1.5,
//       onStart: () => {
//         animationProgress = true;
//       },
//       onComplete: () => {
//         animationProgress = false;
//       },
//     });
//   }

  // Update scrollPos with the new scroll position
  scrollPos = newScrollPos;
};
