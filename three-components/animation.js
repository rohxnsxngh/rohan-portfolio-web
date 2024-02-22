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
  if (!animationInProgress) {
    tl.to(camera.position, {
      z: 1,
      y: 1,
      x: -2,
      onUpdate: () => camera.lookAt(1, 1, 0),
      ease: "power3.out",
      duration: 1.5,
      onStart: () => {
        setAnimationInProgress(true);
      },
    })
      .to(camera.position, {
        z: 6,
        y: -3.5,
        x: 1,
        onUpdate: () => camera.lookAt(1, 1, 0),
        ease: "power1.out",
        duration: 1.5,
      })
      .to(camera.rotation, {
        x: -Math.PI / 2,
        y: 0,
        z: 0,
        onUpdate: () => camera.updateProjectionMatrix(),
        ease: "power1.out",
        duration: 2,
      })
      .to(camera.rotation, {
        onUpdate: () => camera.lookAt(1, -6, 6),
        ease: "power1.out",
        duration: 0.025,
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

export const navigationAnimation = (camera, panel) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, panel.position.z);
  }

  return animationInProgress;
};

function pageToPageAnimation(timeline, camera, zPosition) {
  timeline
    .to(camera.rotation, {
      z: Math.PI / 6,
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
    .to(camera.rotation, {
      z: - Math.PI / 6,
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

export const forgeAnimation = (camera, panel) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, panel.position.z);
  }

  return animationInProgress;
};

export const experienceAnimation = (camera, panel) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, panel.position.z);
  }

  return animationInProgress;
};

export const aboutAnimation = (camera, panel) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, panel.position.z);
  }

  return animationInProgress;
};

export const writingAnimation = (camera, panel) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, panel.position.z);
  }

  return animationInProgress;
};

export const contactAnimation = (camera, panel) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, panel.position.z);
  }

  return animationInProgress;
};

export const creditsAnimation = (camera, panel) => {
  const tl = gsap.timeline({
    onComplete: () => {
      // Set animationProgress to false when the entire timeline completes
      setAnimationInProgress(false);
    },
  });

  if (!animationInProgress && camera) {
    pageToPageAnimation(tl, camera, panel.position.z);
  }

  return animationInProgress;
};
