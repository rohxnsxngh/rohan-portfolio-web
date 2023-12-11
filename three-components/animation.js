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
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, 6);
  }

  return animationInProgress;
};

function pageToPageAnimation(timeline, camera, zPosition) {
  timeline
    .to(camera.position, {
      y: -3,
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      overwrite: "none",
      duration: 0.5,
      onStart: () => {
        setAnimationInProgress(true);
      },
      onComplete: () => {
        setAnimationInProgress(false);
      },
    })
    .to(camera.position, {
      z: zPosition,
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
    })
    .to(camera.position, {
      y: -3.5,
      onUpdate: () => camera.updateProjectionMatrix(),
      ease: "power1.out",
      overwrite: "none",
      duration: 0.5,
      onStart: () => {
        setAnimationInProgress(true);
      },
      onComplete: () => {
        setAnimationInProgress(false);
      },
    });
}

export const forgeAnimation = (camera) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, 10);
  }

  return animationInProgress;
};

export const experienceAnimation = (camera) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, 14);
  }

  return animationInProgress;
};

export const aboutAnimation = (camera) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, 18);
  }

  return animationInProgress;
};

export const writingAnimation = (camera) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, 22);
  }

  return animationInProgress;
};

export const contactAnimation = (camera) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, 26);
  }

  return animationInProgress;
};
