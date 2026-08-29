---
title: "Co-founder"
company: "OctaPulse"
description: "Computer vision and robotics to automate quality inspection in fish farms, from hatchery to processing. YC W26."
date: "2025-12"
endDate: ""
location: "Pittsburgh, PA"
tags: ["Computer Vision", "Machine Learning", "Aquaculture", "Robotics", "YC W26", "IoT"]
images:
  - src: "/images/experience/octapulse/81297189-8C22-4939-AA1B-520078DC9FA3_1_105_c.jpeg"
    alt: "Rohan Singh and co-founder Paul Grech standing in front of long parallel concrete raceways at a trout farm, arid basalt hillside behind them"
  - src: "/images/experience/octapulse/42DEAF7C-EA45-4DB2-AD07-AFBB0227D2AB.JPG"
    alt: "Rohan and Paul beside a Y Combinator check-in screen showing 'OctaPulse (W26)'"
  - src: "/images/experience/octapulse/photo_52203.jpg"
    alt: "Rohan and Paul on stage presenting to a seated audience, orange acoustic panels behind them and a partner slide on the screen"
  - src: "/images/experience/octapulse/4DABB450-8CE3-49C1-A66F-495E35A8C055_1_102_o.jpeg"
    alt: "A large indoor test basin with yellow railings and a gantry crane rated for 1000 lbs above deep green water"
  - src: "/images/experience/octapulse/photo_51731.jpg"
    alt: "Paul and Rohan in OctaPulse-branded navy quarter-zips with event lanyards, photographed indoors"
  - src: "/images/experience/octapulse/64E3A15F-B59A-4345-9173-FF3BECEA3153.JPG"
    alt: "Rohan working at a makeshift apartment desk with a laptop and external monitor, Amazon boxes stacked on the floor and an apartment block visible through the window"
---

## Co-founder and CTO at OctaPulse

Y Combinator's one line for us is "CV and robotics to automate quality inspection in fish farms." Paul Grech and I met at Carnegie Mellon, founded OctaPulse in 2025, and went through the Winter 2026 batch as a team of two, working out of Pittsburgh — three rivers and no coast.

I am still building it. This is the hardest thing I have ever done, and I would not trade it.

### Why this is worth a decade

In 2022, aquaculture produced 94.4 million tonnes of aquatic animals — 51% of global aquatic animal production, surpassing capture fisheries for the first time in history. FAO puts aquaculture's first-sale value that year at USD 313 billion, and 89% of aquatic animal production goes directly to human food.

Wild capture has been flat for decades. Every additional kilogram of growth in seafood supply from here has to come from farming.

And the industry runs nearly blind. It cannot reliably count, weigh, or evaluate its own animals. Most farms operate with less visibility into their stock than a 1990s retail store had into its inventory — and feed, the single largest cost line on a farm, gets spent on fish that will never reach harvest because nobody could tell which ones those were.

That is the gap we are closing. Not a feature, not a dashboard — the measurement layer the entire industry is missing.

### We turned a five-minute manual job into a photograph

At the broodstock and hatchery stage, phenotyping and deformity inspection are still done by hand. Farmers net dozens of fish, anesthetize them, and measure individually — roughly five minutes per fish, on animals the process stresses.

We capture the same measurements from a single photograph in under 30 seconds. One row per fish, 20-plus objective traits from one image.

The measurement is a mat and a fiducial before it is a model. A fish goes on a calibrated measurement mat with a 1-inch grid and an AprilTag scale reference, so every image carries its own scale rather than inheriting one from how carefully somebody set up the rig that morning. Instance segmentation isolates the body and eight features — eye, operculum, and the caudal, dorsal, adipose, pectoral, pelvic and anal fins — and a geometry engine converts pixels to real-world inches.

We are deployed with Riverence, North America's largest trout producer. It started as a 100-fish pilot and we have now imaged roughly 11,000. On held-out validation splits, nine-class body-part segmentation reads 98.1% mAP and the 15-keypoint pose model 99.3% mAP50 — measured against SAM3-generated labels, with a human-labelled holdout still an open item on our board.

Weight is the capability we are closing right now. An AprilTag-scaled body-area fit — the allometric law `W = 0.106 * Area^1.47` — gives 2.8% error and R² 0.96 against 136 weighed fish, holding at 2.82% under family-out cross-validation, which tells us the model is reading morphology rather than memorizing families. A single-view model still infers volume from a two-dimensional area, so stereo depth is the active work.

The company has been backed along the way by a $70,000 Seafood Industry Climate Award from the Acme Smoked Fish Foundation, an Ocean Exchange award, VentureWell's Ocean Enterprise Accelerator, and Y Combinator. During the batch we were named to two of The Silicon Valley Post's "Top Startups in YC W26" lists — Bio & Health, and Robotics & Drone — which is a strange and gratifying place for a fish company to land.

### Hardware that survives a plant floor

The fleet is Luxonis OAK-4 cameras, OAK-4-S and OAK-4-D. The OAK-4-S runs a Qualcomm Dragonwing QCS8550, passively cooled inside an aluminum enclosure, drawing 10-15 watts with no fan.

We pulled its thermal trip points off a live device rather than a datasheet: DDR throttles first at 90°C, the NN accelerator and GPU at 95°C, the performance CPU cluster at 108°C, and the only hardware critical shutdown sits on the PMICs at 145°C. Reported camera temperature is deliberately the maximum across every live thermal zone, because the obvious zone barely warms and would have reported a cool camera forever.

Ops is split across two processes per camera. Telemetry lives in the app container; lifecycle commands live in a stdlib-only host agent on the Luxonis OS host, because the tool that starts and stops apps is a host binary that does not exist inside the container. A watchdog checks every two minutes whether the Tailscale backend is genuinely running and the node genuinely online — not merely whether the process is alive — and reboots the camera if it is still unreachable after fifteen minutes. Telemetry events queue on device, flush at 50 events or five seconds, and carry a 26-character ULID so a replay after a crash deduplicates instead of double-counting.

Almost none of this is hard because the models are hard. It is hard because a camera has to survive a washdown, a nameserver has to resolve, and a number has to arrive with its own scale attached.

### Implementing the robotics layer

Measurement is the beachhead. Manipulation is the build we are in now.

We are implementing imitation learning on a TRLC-DK1 development platform running HuggingFace LeRobot — Damiao motors on the 24V follower behind an inline E-stop, Dynamixel XL330 servos on the 5V leader. A fillet is deformable, slippery, shiny, wet, and never the same shape twice. There is no fixed pose to script, so you demonstrate the motion rather than program it.

The crux is the gripper, not the arm. Pinching damages product, which pushes the design toward compliant fingers, suction, or non-contact approaches — and that is the problem we are actively working.

Simulation carries the authoring load. Genesis parses the platform's URDF in 2.2 seconds into 9 links and 8 degrees of freedom on Apple Silicon, and a coupled fillet slumps 14.9 mm under gravity. Its deformable solver runs at 0.06 to 0.11 times realtime on an M4 Pro, which makes it an excellent debugging and authoring environment and tells us exactly where real-world demonstrations have to carry the weight instead.

We are developing the policy on cheap hardware and porting the chassis, not the learning. A plant deployment needs IP67 at minimum and ideally IP69K — roughly 80°C water at 80 to 100 bar — plus 316 stainless and crevice-free sloped surfaces, and the doctrine we wrote down for ourselves is that hygienic design beats waterproofing, because a sealed box that keeps water out also traps water in.

### Measurement is what unlocks the genetics

Selective breeding in aquaculture returns an average genetic gain of 13.3% per generation — 13.6% for Atlantic salmon, 13.5% for tilapia, 17.5% for channel catfish — which the Global Seafood Alliance notes is substantially higher than what livestock programmes achieve. The biology is more responsive than anything on land.

And the Global Seafood Alliance also judges it reasonable to assume that less than 10 percent of today's aquaculture production is based on genetically improved animals. FAO counts roughly 730 farmed species items, of which just 17 staples account for about 60% of production — an unusually small target list for an unusually large prize.

A 2022 review in *Aquaculture and Fisheries* names the constraint directly: phenotyping is "quickly emerging as the major operational bottleneck limiting the power and speed of commercial genomic selection programs."

Genotyping a fish is a purchase order. Measuring one is still a person with a board and a ruler. That asymmetry is the whole opportunity — the farms that can measure every animal in their population will compound genetic advantage for decades, and nobody can do that at scale yet.

One principle governs all of it. A failed measurement is flagged, never estimated. Nobody's breeding database gets an invented value from us — the entire value of this system is that the numbers are real.

### The hardest thing I have ever done

Nothing prepared me for how much a company actually is.

On any given week I am writing vision models, specifying enclosures, debugging a camera that fell off a network in a plant I am not standing in, reading genetics literature, arguing about gripper compliance, talking to farmers who have run raceways longer than I have been alive, fundraising, hiring, and trying to be a good co-founder to Paul while both of us are doing this at the same intensity. Every one of those is a discipline someone spends a career on. You do not get to be excellent at all of them, and you have to do all of them anyway.

The technical problems are the easy part. The hard part is holding an entire system in your head — biology, hardware, software, genetics, operations, customers, capital — and being the person who decides what happens next when every one of those is telling you something different.

I set out to work on robots. Robots led me to the least-measured food system on the planet, and now we are building both: the measurement layer first, the manipulation layer now. The flagship deployment is rainbow trout in Idaho raceways running on spring water, a long way from any coast.

The transition from hunting to farming took thousands of years on land. In the ocean it is happening in a single generation, and we intend to build the layer it runs on.

---
