---
title: "3D Platform for Scaffolding"
date: "2024-04"
status: "completed"
image: "/images/project/Scaffolding5.jpg"
description: "A browser-based scaffolding planner built with three.js, Vue and openbim-components: draw a building footprint, extrude it, add a roof, auto-generate scaffolding around it and request a rental quote."
tags: ["three.js", "BIM", "IFC", "Vue", "construction technology"]
github: "https://github.com/rohxnsxngh/scaffold-bim"
demo: "https://0477ecc2-5847-48e4-bdb9-32403bc35367.vercel.app/model"
---

## Scaffolding a Building in the Browser

Renting scaffolding usually starts with someone measuring a building, sketching it, and working out by hand how many bays, staircases and covers the job needs. I built this tool for a construction technology client (name withheld) to move that step into the browser: a customer draws their building, the app wraps it in scaffolding, and the result turns into a rental quote request.

I wrote it in TypeScript with **Vue 3**, **Pinia** for state, **three.js** (r152) for the scene and **openbim-components** for the BIM toolbar and IFC loading. Most of the work happened in April and May 2024, with a final public demo build in December 2024. It is about 8,800 lines across the scene utilities and Vue pages.

![Sheeted scaffolding around an extruded building](@images/project/Scaffolding5.jpg)

## The Workflow

The interface is a step-by-step flow across the top of the screen: general site settings, floor plan and building, roof, scaffolding, extras, and the price request. Each step changes what the 3D scene lets you do.

### 1. Site and Terrain
The first step sets the ground the scaffolding will stand on. You pick a terrain block type (asphalt, sand, fine sand, clay, grass or mixed), which is the kind of detail a rental company needs to plan base plates and anchoring.

### 2. Drawing the Blueprint
In a top-down view you draw the footprint with a rectangle or polygon tool, or type the length and width directly. Every edge gets a live measurement label in meters. Under the hood each footprint is stored as a `THREE.Shape`, so it can be moved, edited and redrawn without losing its outline (`createBlueprintFromShapeOutline`, `editBlueprint`, `moveBlueprint`).

![Drawing a building footprint with live edge measurements](@images/project/Scaffolding1.jpg)

![A second footprint drawn next to the first](@images/project/Scaffolding2.jpg)

### 3. Extrusion and Roofs
Setting a height extrudes the footprint into a building with `ExtrudeGeometry` (`createExtrusionFromBlueprint`). Each building can then take a **flat**, **gable** or **shed** roof, each generated from the footprint and wall height, with duplicate roofs cleaned up when the blueprint changes.

### 4. Generating the Scaffolding
This is the core of the tool. `generateScaffoldOutline` offsets the building outline outward and builds a set of lines around it. `placeScaffoldModelsAlongLine` then walks each line and places a scaffold bay every **1.57 m**, interpolating the position along the edge and rotating each bay to face along it. A position map with an epsilon check prevents two bays from landing in the same spot where edges meet.

The bays themselves are GLB models cloned with `SkeletonUtils`, so every bay is a real scaffold section rather than a placeholder box. You set the wall distance and the number of levels, and the app stacks bays upward.

![Choosing scaffold components next to an auto-generated scaffold](@images/project/Scaffolding3.jpg)

### 5. Editing
Automatic generation gets you most of the way, but real jobs need exceptions. You can delete a whole **row** (one level along an edge) or a whole **column** (one vertical stack), swap a bay for an **internal or external staircase**, place individual components by hand, and add **sheeting** over the faces of the scaffold.

![Scaffold with rows edited around a multi-wing building](@images/project/Scaffolding4.jpg)

### 6. Supply and Quote
The last step counts what is in the scene: scaffold bays, internal staircases and external staircases (`calculateTotalAmountScaffoldingInScene`), plus the covered area. Those counts fill an order summary inside a "Get an offer for rent" form, alongside contact details and a desired date. That summary is the hand-off to the rental company's sales process.

![Sheeting applied over the generated scaffold](@images/project/Scaffolding6.jpg)

## Loading Real Buildings with IFC

Drawing footprints works for simple jobs, but larger customers already have a BIM model. Through openbim-components I added an IFC loader (`FragmentIfcLoader`, which runs web-ifc in WebAssembly) and fragment manager, so an architect's IFC file can be dropped into the same scene the scaffolding lives in. I tested it with a set of sample IFC files in the repo.

## Stack

| Technology | What it does here |
|---|---|
| **three.js** | Scene, cameras, geometry, extrusion, GLB scaffold models |
| **openbim-components** | Toolbar UI and IFC loading through web-ifc |
| **Vue 3 + Pinia** | The step-by-step pages and shared scene state |
| **GSAP** | Camera and UI transitions |
| **Tailwind + daisyUI** | Side panels, modals and forms |

## What I Learned

The hard part was not rendering. It was keeping geometry consistent as the user edits: a footprint moved after scaffolding was placed has to invalidate the right roofs and bays, and corners where two edges meet have to agree on who owns the bay. Storing the source shape and line endpoints in each mesh's `userData`, and rebuilding from those instead of mutating meshes in place, is what made the editing tools manageable.

The code is on **[GitHub](https://github.com/rohxnsxngh/scaffold-bim)** and the **[live demo](https://0477ecc2-5847-48e4-bdb9-32403bc35367.vercel.app/model)** still runs.
