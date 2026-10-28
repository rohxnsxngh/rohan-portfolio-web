---
title: "The Forge: ThreeJS Sandbox"
date: "2022-12"
status: "completed"
image: "/images/project/HansAubsHome.png"
description: "A first-person three.js world I built as my first personal site, with a scrolling 3D audio spectrogram driven by the Web Audio API, reflective water, metaballs and a portal into a second factory scene."
tags: ["three.js", "WebGL", "GLSL", "Web Audio", "procedural generation"]
github: "https://github.com/rohxnsxngh/hans-aubs"
---

The Forge was my first real three.js project and my first personal website. Instead of a page you scroll, it drops you into a dark world you walk around in first person, with the sections of the site (home, about, experience, labs) floating as 3D text. I built it in Vue 3 and three.js (r146) over November and December 2022, mostly to teach myself how a WebGL scene actually works: geometry buffers, custom shaders, audio, and cleaning up after yourself.

![Home environment](@images/project/HansAubsHome.png)

## The Audio Spectrogram

The centerpiece is a scrolling 3D spectrogram that surrounds the world on four sides.

- **Geometry.** I build a grid mesh by hand in a `BufferGeometry`: 256 frequency bins by 400 time samples, about 100,000 vertices. The frequency axis is log-spaced, so the low end, where most of the music's energy is, gets more of the mesh.
- **Audio.** When you press start, the track plays through an `AnalyserNode` with an FFT size of 1024 and a smoothing constant of 0.5. Every frame I read the 256 byte-valued frequency bins.
- **Scrolling.** The mesh carries a per-vertex `displacement` attribute. Each frame I shift the whole history back by one row with `copyWithin` and write the newest spectrum into the front row, so time flows across the surface without rebuilding any geometry.
- **Shading.** A small custom `ShaderMaterial` does the rest. The vertex shader pushes each vertex out along its normal by its displacement and uses the same value to index a 256-entry color lookup table (the "electric" colormap) passed in as a uniform array. The fragment shader just writes that color.

The result is a wall of sound you can walk along, where the shape and the color both come straight from the FFT.

## The World Around It

- **Water and sky.** three's `Water` object gives a reflective, animated ocean with scrolling normal maps, mirrored by a second dark water plane overhead, under a `Sky` shader set to a dim sun. Distance fog hides the edges.
- **Metaballs.** A `MarchingCubes` field of 50 animated blobs bobs above the water.
- **Objects and particles.** Rotating torus rings form a boundary, a torus knot and cube float in the middle, and a particle field drifts overhead.
- **Positional audio.** The track also plays as a three.js `PositionalAudio` source attached to a sphere at the origin, so it gets louder as you walk toward the center.
- **Navigation.** `FirstPersonControls` with clamped look angles and height, plus a soft boundary that teleports you back to the start if you wander off the map.

![Laboratory environment](@images/project/HansAubsLab.png)

## The Portal and the Factory

Walking into the glowing portal stops the audio, disposes every geometry, material and texture in the scene, checks through `renderer.info` that nothing is left on the GPU, and only then switches to a second scene. Getting that teardown right was the most useful thing I learned on the project: three.js does not free GPU memory for you.

The second scene, the Factory, is bright where the first is dark. A camera follows a path past a conveyor belt and an animated robot arm loaded from GLTF, with purple sparks and six panels of 3D text that tell my background at the time, from mechanical engineering to my software internship at Tesla.

![The Forge environment](@images/project/HansAubsForge.png)

## Looking Back

The Forge is rough in places. It renders on a fixed timer instead of the display refresh, and walking around in first person is a lot to ask of someone who just wants to read a resume. But it taught me the parts of graphics programming I still use: building geometry directly in buffers, moving data to the GPU through attributes and uniforms instead of rebuilding meshes, and owning resource cleanup. The code is on **[GitHub](https://github.com/rohxnsxngh/hans-aubs)**. The old demo deployment is no longer live.
