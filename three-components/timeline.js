import { gsap } from "gsap";

export const timeline = (animationProgress, scrollPos, camera) => {
  const tl = gsap.timeline();
  const newScrollPos = window.scrollY; // Get the current scroll position

  // Animation for scrolling down
  if (!animationProgress && newScrollPos > scrollPos && scrollPos === 0) {
    tl.to(camera.position, {
      z: 1,
      y: 0,
      x: -2,
      onUpdate: () => camera.lookAt(1, 0, 0),
      ease: "power1.out",
      overwrite: "none",
      duration: 2,
      onStart: () => {
        animationProgress = true;
      },
    })
      .to(camera.position, {
        z: 1,
        y: 0,
        x: 2,
        onUpdate: () => camera.lookAt(1, 0, 0),
        ease: "power1.out",
        overwrite: "none",
        duration: 2,
        onStart: () => {
          animationProgress = true;
        },
      })
      .to(camera.position, {
        z: 6,
        y: 5,
        x: 5,
        onUpdate: () => camera.lookAt(5, 5, 0),
        ease: "power1.out",
        duration: 2.5,
        onComplete: () => {
          animationProgress = true;
        },
      });
  }

  // Update scrollPos with the new scroll position
  scrollPos = newScrollPos;

  return animationProgress;
};
