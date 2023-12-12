import { AudioListener, Audio, AudioLoader } from "three";

export const sound = (camera) => {
  // create an AudioListener and add it to the camera
  const listener = new AudioListener();
  camera.add(listener);

  // create a global audio source
  const sound = new Audio(listener);

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new AudioLoader();
  audioLoader.load("./Sound/boxboys_disability.mp3",  (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    // sound.play();
  });
};
