---
title: "Co-founder"
company: "OctaPulse"
description: "Computer vision and robotics to build a digital twin of a fish farm, so the world can grow more food from the same water. YC W26."
date: "2025-12"
endDate: ""
location: "Pittsburgh, PA"
tags: ["Computer Vision", "Machine Learning", "Aquaculture", "Robotics", "YC W26", "Digital Twin"]
---

## Co-founder at OctaPulse

Our one line is that we are building the robotics layer for the ocean and seafood. Paul Grech and I met at Carnegie Mellon, founded OctaPulse in 2025, and went through the Winter 2026 batch as a team of two, working out of Pittsburgh, three rivers and no coast.

I am still building it. This is the hardest thing I have ever done, and I would not trade it.

![Rohan Singh and co-founder Paul Grech standing in front of long parallel concrete raceways at a trout farm, arid basalt hillside behind them](@images/experience/octapulse/81297189-8C22-4939-AA1B-520078DC9FA3_1_105_c.jpeg)

### Why this is worth a decade

In 2022, aquaculture produced 94.4 million tonnes of aquatic animals, 51% of global aquatic animal production, surpassing capture fisheries for the first time in history. FAO puts aquaculture's first-sale value that year at USD 313 billion, and 89% of aquatic animal production goes directly to human food.

Wild capture has been flat for decades. Every additional kilogram of growth in seafood supply from here has to come from farming. The population keeps climbing, and the water does not.

And the industry runs nearly blind. It cannot reliably count, weigh, or evaluate its own animals. Most farms operate with less visibility into their stock than a 1990s retail store had into its inventory. Feed, the single largest cost line on a farm, gets spent on fish that will never reach harvest because nobody could tell which ones those were.

That is the gap we are closing. Not a feature, not a dashboard: the measurement layer the entire industry is missing.

### The theory: a farm you can query

What we are actually building is a digital twin of a fish farm.

A digital twin is a live model of a physical facility, accurate enough that you can ask it questions instead of asking the water. For a factory that is well-trodden ground: every machine reports its state, and the model tells you where the line will jam before it jams. For a fish farm almost none of it exists, because the assets are alive, underwater, and indistinguishable from one another.

The twin has to be built from the bottom up, and it starts with the individual animal. Every fish becomes a row: length, mass, body proportions, fin placement, condition, deformity, and a timestamp. Rows accumulate into a population. Populations accumulate into a history. Once a farm has that, three things become possible that are not possible today.

You can **close the loop on feed**. Feed is the largest cost and the largest waste, and today it is dosed against an estimate. Against a measured population it becomes a control problem rather than a guess.

You can **grade on evidence**. Filtering out the animals that will not thrive, before they consume months of feed, is the single highest-leverage decision on a farm, and it is currently made by eye, at speed, by a tired human.

You can **compound genetics**. Breeding is the one intervention whose gains never decay, and it is bounded entirely by how many animals you can characterise.

None of that requires the farm to be robotic. It requires the farm to be *legible*. Autonomy is what you build once the twin is accurate enough to act on, and acting on it is where the food output actually comes from: more protein per unit of feed, water, and time.

![Rohan and Paul beside a Y Combinator check-in screen showing 'OctaPulse (W26)'](@images/experience/octapulse/42DEAF7C-EA45-4DB2-AD07-AFBB0227D2AB.JPG)

### What we are building toward: autonomous, high-margin, bountiful

<video autoplay muted loop playsinline preload="none" poster="/videos/octapulse/raceway-imaging-station_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 16 / 9;"><source src="/videos/octapulse/raceway-imaging-station.mp4" type="video/mp4"></video>

*One of our imaging stations on the walkway of a trout farm, beside raceways full of fish.*

On our own site we put it plainly: we are building the data and robotics layer for seafood production. Phenotyping and breeding, camera-based digital twins, and robotic automation, from the hatchery to the processing line. When YC introduced us on launch day, they described it as building toward autonomous aquaculture from the hatchery to processing. That is the shape of the whole company.

**Autonomous** does not mean a farm with nobody on it. It means the cold, wet, repetitive work of counting, measuring, grading and moving fish is done by machines that see every animal, and the people who run the farm spend their time on the decisions only they can make. Plants already struggle to hire and keep people for that work, and it gets harder to fill every year.

**High margin** is what falls out of seeing everything. A fish farm loses money in small amounts, thousands of times a day: feed spent on fish that will never reach harvest, a fillet bruised by rushed handling, a line that slows down and nobody notices until the shift report. Every damaged fish is value lost before it reaches the box. A farm that measures every fish and every station can stop paying for those losses, which is how you cut cost and raise yield at the same time.

**Bountiful** is the reason to do any of it. The vision we wrote down for OctaPulse is a future of true abundance, where human prosperity and ocean health grow together. The ocean covers 70% of the Earth and produces only about 2% of our food, and fish convert feed to protein far more efficiently than cattle do. The room to grow is enormous. What has been missing is the tooling to farm it well.

#### The tools we are bringing

**Phenotyping.** Every fish photographed during normal handling is measured for shape, size and condition and linked to its family, so breeding teams can compare families side by side on the traits they select for. The next section is about how that works.

**Digital Twin.** We install cameras on processing lines and farm sites and place each one on the site's own floor plan. Every fillet is found and outlined as it passes, so counts, throughput and colour come from the product rather than a clipboard.

<video autoplay muted loop playsinline preload="none" poster="/videos/octapulse/line-cameras-live_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 16 / 9;"><source src="/videos/octapulse/line-cameras-live.mp4" type="video/mp4"></video>

*Eight cameras on one working processing line, every fillet picked out by live detection. People and gloves blurred.*

The dashboard puts the whole plant on one screen. Open any camera to see the line live, see throughput by station and shift, and see what the line produced next to what it cost to run and where value was lost. A built-in assistant answers questions about output, throughput and colour from the plant's own records, and when the records do not hold the answer, it says so instead of guessing. Farms and hatcheries are next for the same approach.

<video autoplay muted loop playsinline preload="none" poster="/videos/octapulse/digital-twin-floor-plan_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 16 / 9;"><source src="/videos/octapulse/digital-twin-floor-plan.mp4" type="video/mp4"></video>

*The OctaPulse dashboard on a real plant's floor plan, zooming into grading and packing as the camera markers come up.*

**Plant Robotics.** Robot cells that pick whole fish and fillets off the belt and place them in crates, one cell per station, all down the line. This one is in development: designed, simulated, and running as a prototype in a working plant, with pilots on partner lines next. More on that below.

All three share one workspace and the same per-fish measurements. That is the point. The measurement layer is what makes the robots worth trusting, and the robots are what turn a farm you can see into a farm that runs itself.

### We turned a five-minute manual job into a photograph

At the broodstock and hatchery stage, phenotyping and deformity inspection are still done by hand. Farmers net dozens of fish, anesthetize them, and measure individually: roughly five minutes per fish, on animals the process stresses.

We capture the same measurements from a single photograph in under 30 seconds. One row per fish, 20-plus objective traits from one image.

<video autoplay muted loop playsinline preload="none" poster="/videos/octapulse/phenotyping-measured-trout_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 16 / 9;"><source src="/videos/octapulse/phenotyping-measured-trout.mp4" type="video/mp4"></video>

*Real photos of trout: segmentation masks for body, fins, gill cover and eye resolve into an outline, a midline and a length, depth and weight readout.*

The measurement is a mat and a fiducial before it is a model. A fish goes on a calibrated measurement mat with a printed scale reference, so every image carries its own scale rather than inheriting one from how carefully somebody set up the rig that morning. Instance segmentation isolates the body and eight features (eye, operculum, and the caudal, dorsal, adipose, pectoral, pelvic and anal fins), and a geometry engine converts pixels to real-world inches.

We are deployed with Riverence, North America's largest trout producer, where the work grew out of an initial pilot into a running program. Body-part segmentation and keypoint pose both perform well on held-out validation, and we hold ourselves to the distinction between agreement with a label set and agreement with reality.

Weight is the capability we are closing right now. We estimate mass from a scale-referenced body area using an allometric fit, validated against fish we physically weighed and cross-validated by holding out entire families, which is what tells you the model is reading morphology rather than memorizing which family a fish came from. A single-view model still infers volume from a two-dimensional area, so depth sensing is the active work.

The company has been backed along the way by a $70,000 Seafood Industry Climate Award from the Acme Smoked Fish Foundation, an Ocean Exchange award, VentureWell's Ocean Enterprise Accelerator, and Y Combinator. During the batch we were named to two of The Silicon Valley Post's "Top Startups in YC W26" lists (Bio & Health, and Robotics & Drone), which is a strange and gratifying place for a fish company to land.

![Rohan and Paul on stage presenting to a seated audience, orange acoustic panels behind them and a partner slide on the screen](@images/experience/octapulse/photo_52203.jpg)

### A twin is only as good as the sensor that survives the room

The unglamorous truth about digital twins is that they are built out of hardware standing in a wet, cold, hostile room, and the model is worth nothing on the days that hardware is offline.

Our capture units are edge devices: they run the vision models on-device rather than shipping video to a server, because a plant's network is not something you want a measurement to depend on. They are passively cooled inside sealed enclosures with no moving parts, because a fan is an intake for water and a bearing that fails.

We read the real thermal limits off live devices rather than trusting a datasheet's ambient range, and we report the hottest zone on the board rather than a convenient one, because the obvious sensor barely warms and would have told us the camera was fine forever.

Everything is built to fail loudly. A watchdog checks every couple of minutes whether a unit is genuinely reachable on the private network (not merely whether its process is alive) and power-cycles it if it is still unreachable. Telemetry queues on the device and flushes in batches, each event carrying a unique sortable ID, so a replay after a crash deduplicates instead of double-counting. Our applications hard-fail at startup if their identity or endpoint is missing, because a crash on boot is a better bug than a fleet that silently reports itself as one device.

Almost none of this is hard because the models are hard. It is hard because a camera has to survive a washdown, a nameserver has to resolve, and a number has to arrive with its own scale attached.

![A large indoor test basin with yellow railings and a gantry crane above deep green water](@images/experience/octapulse/4DABB450-8CE3-49C1-A66F-495E35A8C055_1_102_o.jpeg)

### Implementing the robotics layer

Measurement is the beachhead. Manipulation is the build we are in now, and it is the step where the twin starts acting on the world instead of only describing it.

We are implementing imitation learning on a development arm platform. A fillet is deformable, slippery, shiny, wet, and never the same shape twice. There is no fixed pose to script, so you demonstrate the motion rather than program it, and the policy learns the distribution rather than a single trajectory.

The crux is the gripper, not the arm. Pinching damages product, which pushes the design toward compliant fingers, suction, or non-contact approaches, and that is the problem we are actively working.

<video autoplay muted loop playsinline preload="none" poster="/videos/octapulse/prototype-gripper-plant_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 16 / 9;"><source src="/videos/octapulse/prototype-gripper-plant.mp4" type="video/mp4"></video>

*Our prototype gripper picking a salmon fillet beside a stack of crates.*

Simulation carries the authoring load. We can parse an arm's kinematics in seconds and watch a soft-body fillet slump under gravity, but a deformable solver runs at a fraction of realtime, which makes simulation an excellent debugging and authoring environment and tells us exactly where real-world demonstrations have to carry the weight instead.

We are developing the policy on inexpensive hardware and porting the chassis, not the learning. A plant deployment needs high-pressure hot-water washdown ratings, food-grade stainless and crevice-free sloped surfaces, and the doctrine we wrote down for ourselves is that hygienic design beats waterproofing, because a sealed box that keeps water out also traps water in.

Where this goes is one cell per station, all down the line: cells beside the belt that pick whole fish as they pass and fill the crates below, with every layout simulated before it reaches a plant. The order is design and simulation, then pilots with partner plants on one handling task each, then production deployments on the lines that proved the task.

<video autoplay muted loop playsinline preload="none" poster="/videos/octapulse/robot-cells-line_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 16 / 9;"><source src="/videos/octapulse/robot-cells-line.mp4" type="video/mp4"></video>

*Simulation render of robot cells along a processing line, picking whole trout off the belt and placing them into crates.*

![Paul and Rohan in OctaPulse-branded navy quarter-zips with event lanyards, photographed indoors](@images/experience/octapulse/photo_51731.jpg)

### Measurement is what unlocks the genetics

Selective breeding in aquaculture returns an average genetic gain of 13.3% per generation (13.6% for Atlantic salmon, 13.5% for tilapia, 17.5% for channel catfish), which the Global Seafood Alliance notes is substantially higher than what livestock programmes achieve. The biology is more responsive than anything on land.

And the Global Seafood Alliance also judges it reasonable to assume that less than 10 percent of today's aquaculture production is based on genetically improved animals. FAO counts roughly 730 farmed species items, of which just 17 staples account for about 60% of production, an unusually small target list for an unusually large prize.

A 2022 review in *Aquaculture and Fisheries* names the constraint directly: phenotyping is "quickly emerging as the major operational bottleneck limiting the power and speed of commercial genomic selection programs."

Genotyping a fish is a purchase order. Measuring one is still a person with a board and a ruler. That asymmetry is the whole opportunity: the farms that can measure every animal in their population will compound genetic advantage for decades, and nobody can do that at scale yet.

One principle governs all of it. A failed measurement is flagged, never estimated. Nobody's breeding database gets an invented value from us; a digital twin that quietly guesses is worse than no twin at all.

![Rohan working at a makeshift apartment desk with a laptop and external monitor, Amazon boxes stacked on the floor and an apartment block visible through the window](@images/experience/octapulse/64E3A15F-B59A-4345-9173-FF3BECEA3153.JPG)

### The hardest thing I have ever done

Nothing prepared me for how much a company actually is.

On any given week I am writing vision models, specifying enclosures, debugging a camera that fell off a network in a plant I am not standing in, reading genetics literature, arguing about gripper compliance, talking to farmers who have run raceways longer than I have been alive, fundraising, hiring, and trying to be a good co-founder to Paul while both of us are doing this at the same intensity. Every one of those is a discipline someone spends a career on. You do not get to be excellent at all of them, and you have to do all of them anyway.

The technical problems are the easy part. The hard part is holding an entire system in your head (biology, hardware, software, genetics, operations, customers, capital) and being the person who decides what happens next when every one of those is telling you something different.

I set out to work on robots. Robots led me to the least-measured food system on the planet, and now we are building both: the measurement layer first, the manipulation layer now. The flagship deployment is rainbow trout in Idaho raceways running on spring water, a long way from any coast.

The transition from hunting to farming took thousands of years on land. In the ocean it is happening in a single generation. We are building the layer it runs on, because a farm you can measure is a farm you can improve, and the world is going to need every kilogram that improvement is worth.

---
