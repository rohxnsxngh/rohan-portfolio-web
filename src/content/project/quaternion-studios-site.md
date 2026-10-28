---
title: "Quaternion Studios: An Explorable WebGL Studio Site"
date: "2026-09"
status: "completed"
image: "/images/project/quaternion-studios-site/hero.jpg"
description: "The website for my studio as something you explore rather than scroll: a tesseract under a true 4D rotation, a 48,000-blade instanced grass field with wind in the vertex shader, a 42,000-particle landing scene, and a pannable map of the studio's ideas."
tags: ["three.js", "WebGL", "GLSL", "Next.js", "creative technology"]
demo: "https://www.quaternionstudios.com"
---

## A Studio Site You Walk Through

[Quaternion Studios](/experience/quaternion-studios) is my design and engineering studio. Its website at [quaternionstudios.com](https://www.quaternionstudios.com) is the clearest example of the kind of work the studio does, so I built it as a real-time graphics project rather than a template. It is a Next.js app with every 3D scene written directly in three.js and GLSL. This page covers the graphics and interaction work.

![The homepage hero: a tesseract rotating through four dimensions](@images/project/quaternion-studios-site/hero.jpg)

## The Rotor

The homepage opens on a tesseract under a genuine 4D rotation, projected down to 3D and drawn as hairlines. Two rotation planes, (x, y) and (z, w), turn at the same rate, which is exactly what multiplying by a unit quaternion does: an isoclinic rotation. Edges brighten as they swing toward the viewer in w and fade into the fog as they swing away, so you are watching an object turn through a dimension you can't see. Below it, six nodes on a ring are the six places on the site's map, and clicking one flies you there.

Further down the page, an interactive canvas shows why the map is a hexagon. An n-cube viewed straight down its longest diagonal casts a regular 2n-gon: a cube casts a hexagon, a tesseract an octagon, a five-cube a decagon. Drag the slider and the projected axes ease into alignment while the readout measures the live convex hull of the projected corners, so the side spread reaching zero is computed, not drawn.

![Interactive proof that a cube's shadow is a regular hexagon](@images/project/quaternion-studios-site/shadow-gram.jpg)

## The Grass Field

The map at `/field` starts with you standing inside a field of monochrome ink grass. It is 48,000 instanced blades with eleven procedural, recursively branched trees standing among them, and all of the motion happens in the vertex shader. Wind is a shared 2D noise field sampled at each blade's world position, so neighbouring blades bend together instead of independently. Two gust layers scroll along the wind direction at different scales and speeds, giving swells that sweep across the field, and a slow envelope makes the whole field build into big gusts and ease off. A per-blade `sin(uTime * 2.3 + phase)` term keeps every blade moving a little on its own. Distance fog fades the field into a misty horizon.

![The grass field entry to the map](@images/project/quaternion-studios-site/field.jpg)

The field only runs on desktop with a fine pointer and motion allowed, with the device pixel ratio capped at 2. On phones and for reduced-motion users it renders nothing and the map shows normally.

## The Map

Scrolling lifts the camera out of the grass and cross-fades into a top-down map: one large GPU-transformed layer you drag to pan, with momentum, pinch to zoom out, and scroll to fly between stations. Distant stations show only as faint beacons and resolve into their full content as they near the centre of the view, so the page is something you uncover. A minimap, signposts at the screen edges and a discovery counter keep you oriented. Opening the Journal from the map uses a Next.js intercepting route, so it appears as a panel over the plane and you keep your place. Without JavaScript, or with reduced motion, the same stations render as a normal, readable document that search engines can crawl.

![The explorable map with its minimap and signposts](@images/project/quaternion-studios-site/map.jpg)

## The Particle Voyage

A separate landing experiment at `/voyage` is a morphing point cloud: 42,000 particles on desktop and 20,000 on phones that morph as you scroll from a tree to a sphere to a dispersed field. It runs through a post-processing chain of bloom, filmic grain, a vignette and ACES tone mapping. On phones the pixel ratio is capped at 1.5 and antialiasing is off, and a vertical drag drives the same progress that scrolling does on desktop.

![The particle voyage landing scene](@images/project/quaternion-studios-site/voyage.jpg)

## Performance Rules

Every scene follows the same rules. three.js only loads where it will actually run, pixel ratios are capped, the hero stops rendering once it scrolls out of view, and each effect has a static fallback that still reads as deliberate. The graphics are there to make the site memorable, never to make it slow or unusable.

---
