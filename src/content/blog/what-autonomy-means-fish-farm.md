---
title: "What Autonomy Actually Means on a Fish Farm"
date: "2026-08"
author: "Rohan Singh"
image: "@images/experience/octapulse/4DABB450-8CE3-49C1-A66F-495E35A8C055_1_102_o.jpeg"
status: "Complete"
description: "Autonomy is a loop: measure, decide, act. Aquaculture is stuck on the first step, and the reason is the physical world, not the model."
tags: ["aquaculture", "computer vision", "OctaPulse", "autonomy", "robotics"]
---

Autonomy is not a model. It is a loop. Measure, decide, act, and then measure again to find out whether the acting did anything.

Almost everything written about autonomy is about the middle step. The decision. The policy, the planner, the model. That is the part that demos well and the part that shows up in papers.

On a fish farm the middle step is not the bottleneck. The first step is. The animals are underwater, they are moving, they look like each other, and outside a handful of pilot systems nobody has written down what any individual one of them looks like. You cannot decide about a population you cannot describe, and you cannot verify an action whose effect you cannot see.

That is the whole argument. The sequencing is not optional.

## Measurement Is Where Aquaculture Stalls

Here is the baseline, as we describe it ourselves: farmers "net dozens of fish, anesthetize them, and measure individually," at roughly five minutes per fish. Our own published figure for what replaces it is under 30 seconds per fish, and I will keep quoting that as our number rather than as an independent result, because that is what it is.

Speed is the headline. It is not the interesting part. At five minutes a fish you never measure a population; you measure a small sample, and then everyone argues about whether the sample was representative.

That argument has teeth. Scotland requires a minimum of 5 fish per pen for regulatory sea lice counts, and Mes and colleagues showed in *Aquaculture* in 2024 how little that buys: a reported average of 2.15 lice per fish carries an upper bound of 3.9, and a reported 1.875 an upper bound of 2.905, above enforcement thresholds. Moving to 15 fish per pen would roughly halve the margin of error, and the authors conclude that long-term accuracy requires automated counting.

Two things are worth saying plainly there. Those are statistical bounds, not likely values. And the regulator is not asleep: Norway already accepts an authorised camera and image-analysis alternative to the weekly manual lice count, so machine vision has already cleared a regulatory bar in this industry.

It cleared it for one parasite on one species. Biomass frames and graders measure size without hands, but almost everything else about the individual animal is still assessed by eye.

Cermaq's iFarm has taken individual-fish vision furthest: it recognises individual salmon by spot pattern in a sensor chamber, recording count, size, lice number and disease signs, and on 3 January 2025 the Norwegian Directorate of Fisheries confirmed it met all measurement criteria for its four development licences. One system, one species, pilot scale.

![Paul Grech and me in navy OctaPulse-branded tops with yellow event lanyards, arms around each other's shoulders, standing in front of plywood shelving under warm indoor light](@images/experience/octapulse/photo_51731.jpg)

## We Took the Fish Out of the Water

Our phenotyping capture does not happen underwater at all. The fish is photographed out of the water on a calibrated measurement mat with a 1-inch grid and an AprilTag scale reference, under a ring light on an overhead tripod, so every image carries its own scale rather than depending on how carefully the rig was rebuilt that morning.

This is a sidestep, not a solution. We did not beat turbidity, biofouling and attenuation. We arranged not to meet them.

The cost is real. It only works where the fish is already being handled (hatchery, broodstock, grading, the processing line), and handling is exactly what the rest of the industry is trying to remove. Choosing the stage where measurement is tractable was a product decision, not a research one.

## The Capture Gate Matters More Than the Model

Capture is not "run the detector and save the frame." It is a three-state machine (idle, settling, awaiting clear) that fires only once a trout has been held for a settle interval and the frame has been hand-free for a set number of consecutive detector frames, so a hand never occludes a measurement image.

The confidence floors are deliberately asymmetric: the threshold for detecting the fish is set well above the threshold for detecting a hand. A missed hand silently corrupts a measurement. A false hand costs a few frames of delay. Those errors are not worth the same, so they do not get the same threshold, and the gap between them came from looking at how the two classes actually score rather than from taste.

The dedup logic took longer to get right than the model did. A debounce counted in frames rather than in time quietly assumes a frame rate, and when the device runs faster than the assumption the window collapses to a fraction of what you intended and one fish gets captured over and over. The fix was to stop counting frames at all and key on track identity: capture each track exactly once, never expire it.

**Pick the error you can recover from.** A duplicate is a visible row you can filter. A miss is invisible and gone. That sentence has settled more design arguments for us than any accuracy number.

An accepted frame is then made durable before anything else happens: written to disk with a metadata sidecar and deleted only once S3 returns success. No image the gate accepts is ever held only in RAM.

None of that is machine learning. All of it decides whether the machine learning has anything to work with.

## Most of What Costs Us Data Is Physical

Most of the failures that have cost us real data were plumbing failures rather than the model being wrong. Not all. A threshold set above where real fish actually score is a model problem, and we have had that too. But the pattern is lopsided, and not the one I expected.

The worst of them are the quiet ones. A default value standing in for a missing device identifier will produce a fleet that all reports itself as the same unit: nothing errors, the dashboard looks populated, and the data is worthless. A crash on boot is a better bug than a fleet that unanimously agrees with itself, so anything identity-shaped should hard-fail at startup rather than fall back.

Model class order is the same category of hazard. Weights are regenerable; class order and provenance are the parts you actually need later, and they belong in version control beside the model rather than in someone's memory. Getting class order wrong is silent and expensive.

Version pins belong on that list too. A minor release of a model library can refactor a head, change a schema, and orphan your trained weights without raising a single error. It just returns nothing.

None of these announce themselves. They all produce output that looks like success.

## Labels Are the Part I Trust Least

A headline accuracy number is the easiest thing in machine learning to quote and the hardest to earn, and the gap usually hides in where the labels came from.

If a training set was auto-labelled by a segmentation model and approved in bulk, then every metric you report measures agreement with that auto-labeller rather than agreement with reality. The number can be high and honest and still not mean what a reader assumes it means. It only becomes an accuracy claim once a human-labelled holdout exists to check it against.

That distinction is worth being pedantic about, because a number nobody can reproduce is worse than no number at all. It is the same failure as an estimated weight in a breeding database: something that looks like a measurement and is not.

**Do not let one careful pipeline vouch for another.** Machine-assisted labelling is fine, and it is how anyone labels at volume now: an open-vocabulary detector proposes boxes, a segmentation model refines them to masks, and a vision-language model grades every instance so the human queue is ordered worst-first. What matters is that the model never auto-approves. Every label still passes through a person.

Care in one part of a pipeline does not transfer to another part just because they share a codebase.

## Measuring Every Animal Is the Half of Genetics Nobody Industrialised

The genomic selection literature is blunt about where the constraint sits. Phenotyping "is quickly emerging as the major operational bottleneck limiting the power and speed of commercial genomic selection programs," with phenomics platforms still lacking for disease resistance, stress tolerance and behaviour.

Genotyping a fish is a purchase order. Measuring it is still a person with a board and a ruler.

Our own scoring failures were more instructive than our successes, and both were failures of meaning rather than accuracy. The first vertebral deformity score measured deviation from a straight head-to-tail line, and it flagged healthy fish, because a spine curves naturally when a fish swims. Version 2 uses polynomial-fit residuals and local kink angles over five named spine keypoints. The first emaciation score ranked fish by raw body surface area percentile, conflating "small" with "emaciated"; version 2.1 uses a body condition factor and a head-to-body ratio.

A number can be perfectly reproducible and still be about the wrong thing. The rule underneath all of it is that a failed measurement is flagged, never estimated. The database gets no invented values.

The structural change was smaller and more boring than any model. Two photographs of the same fish used to be unrelated rows. We made the animal itself a record, so that what we measure, what the breeder reports, and what the genetics lab returns all attach to the same fish.

One row per fish. Without that join, nothing else compounds.

![Me in a grey knit beanie and blue sweatshirt, laughing with my chin on my hand at a crowded event table, a name badge on my chest and the room out of focus behind](@images/experience/octapulse/photo_50575.jpg)

## Measurement Is How You Build the Twin

The reason to care about the first step is what it accumulates into.

Every fish that passes the capture gate becomes a row: length, mass, proportions, fin placement, condition, a timestamp. Rows become a population. Populations tracked over time become a model of the facility: a digital twin, accurate enough to ask questions of instead of asking the water.

That is the real deliverable. Not a detector, and not, in the end, a robot. A farm whose state is legible enough that decisions about feed, grading, breeding and harvest stop being estimates.

And it matters because seafood supply now only grows if farming grows. Wild capture has been flat for decades while the population climbs. Feed is the largest cost and the largest waste on a farm, and it is currently dosed against a guess. Closing that loop against a measured population is not an efficiency nicety; it is how you get more protein out of water that is not getting any bigger.

Autonomy is what you earn once the twin is accurate enough to act on. The acting is the part that produces food. The measuring is the part that makes the acting safe.

## The Third Step Is Still Ahead of Us

I do not want to overstate where we are on "act."

The manipulation layer is a build in progress, and I would rather say that plainly than imply more.

In simulation the split is stark. A scripted pick that succeeds every time on a rigid proxy fails outright on a deformable one, where the jaws crumple the object and leave it on the table. That is the useful finding: the deformable problem, not the pipeline, is the hard one. The tooling is honest about its ceiling too, since a deformable solver runs at a small fraction of realtime on a laptop, which makes it an authoring and debugging environment rather than a data generator.

The evaluation contract is unforgiving in a way that has nothing to do with learning. Whatever cameras, resolution and frame rate a dataset was recorded with have to be reproduced at evaluation time or the policy silently degrades. Rename one camera key and an entire dataset and its checkpoint become permanently incompatible with the rig. One string.

The hardware boundary is just as blunt. The dev kit has no ingress rating and cannot be sprayed down, while a plant line needs IP69K and 316 stainless. So we develop the policy on cheap hardware and port the chassis, not the learning. The dev kit is a flight simulator, not an aircraft.

So the order stands. Measure first, because the loop cannot close anywhere else. Decide second, once the decision has something to condition on. Act third, and only where the acting can be checked.

Most of my week is not spent on models. It is spent on a capture gate, a version pin, a class order in a model card, a device identifier that should never have had a default. That is not a detour from the autonomy work.

That is the autonomy work.

---
