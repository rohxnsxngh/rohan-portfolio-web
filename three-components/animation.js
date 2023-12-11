import { gsap } from "gsap";
import { animationInProgress, setAnimationInProgress } from "./animationState";

export const initialAnimation = (camera) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  // Animation for scrolling down
  if (!animationInProgress && camera.position.y === 0) {
    tl.to(camera.position, {
      z: 1,
      y: 1,
      x: -2,
      onUpdate: () => camera.lookAt(1, 1, 0),
      ease: "power1.out",
      duration: 2,
      onStart: () => {
        setAnimationInProgress(true);
      },
    })
      .to(camera.position, {
        z: 1,
        y: 1,
        x: 2,
        onUpdate: () => camera.lookAt(1, 1, 0),
        ease: "power1.out",
        duration: 2,
      })
      .to(camera.position, {
        z: 6,
        y: -3.5,
        x: 1,
        onUpdate: () => camera.lookAt(1, 1, 0),
        ease: "power1.out",
        duration: 2,
      })
      .to(camera.rotation, {
        x: -Math.PI / 2,
        onUpdate: () => camera.updateProjectionMatrix(),
        ease: "power1.out",
        duration: 4,
      });
  }

  return animationInProgress;
};

export const homeAnimation = (camera) => {
  if (!animationInProgress && camera) {
    gsap.to(camera.position, {
      z: 6,
      y: 0,
      x: 1,
      onUpdate: () => camera.lookAt(1, 0, 0),
      ease: "power1.out",
      overwrite: "none",
      duration: 2,
      onStart: () => {
        setAnimationInProgress(true);
      },
      onComplete: () => {
        setAnimationInProgress(false);
      },
      delay: 0.2,
    });
  }

  return animationInProgress;
};

export const navigationAnimation = (camera) => {
  if (!animationInProgress && camera) {
    gsap.to(camera.position, {
      z: 6,
      x: 1,
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      overwrite: "none",
      duration: 2,
      onStart: () => {
        setAnimationInProgress(true);
      },
      onComplete: () => {
        setAnimationInProgress(false);
      },
      delay: 0.2,
    });
  }

  return animationInProgress;
};

export const forgeAnimation = (camera) => {
  if (!animationInProgress && camera) {
    gsap.to(camera.position, {
      z: 10,
      x: 1,
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      overwrite: "none",
      duration: 2,
      onStart: () => {
        setAnimationInProgress(true);
      },
      onComplete: () => {
        setAnimationInProgress(false);
      },
      delay: 0.2,
    });
  }

  return animationInProgress;
};

export const experienceAnimation = (camera) => {
  if (!animationInProgress && camera) {
    gsap.to(camera.position, {
      z: 14,
      x: 1,
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      overwrite: "none",
      duration: 2,
      onStart: () => {
        setAnimationInProgress(true);
      },
      onComplete: () => {
        setAnimationInProgress(false);
      },
      delay: 0.2,
    });
  }

  return animationInProgress;
};

export const aboutAnimation = (camera) => {
  if (!animationInProgress && camera) {
    gsap.to(camera.position, {
      z: 18,
      x: 1,
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      overwrite: "none",
      duration: 2,
      onStart: () => {
        setAnimationInProgress(true);
      },
      onComplete: () => {
        setAnimationInProgress(false);
      },
      delay: 0.2,
    });
  }

  return animationInProgress;
};

export const writingAnimation = (camera) => {
  if (!animationInProgress && camera) {
    gsap.to(camera.position, {
      z: 22,
      x: 1,
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      overwrite: "none",
      duration: 2,
      onStart: () => {
        setAnimationInProgress(true);
      },
      onComplete: () => {
        setAnimationInProgress(false);
      },
      delay: 0.2,
    });
  }

  return animationInProgress;
};

export const contactAnimation = (camera) => {
  if (!animationInProgress && camera) {
    gsap.to(camera.position, {
      z: 26,
      x: 1,
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      overwrite: "none",
      duration: 2,
      onStart: () => {
        setAnimationInProgress(true);
      },
      onComplete: () => {
        setAnimationInProgress(false);
      },
      delay: 0.2,
    });
  }

  return animationInProgress;
};
