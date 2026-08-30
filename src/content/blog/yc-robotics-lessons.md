---
title: "Lessons From Going Through YC as a Robotics Company"
date: "2026-09"
author: "Rohan Singh"
image: "@images/experience/octapulse/B8633296-F8D3-4DE3-B158-2C0BA63ADCA3_1_105_c.jpeg"
status: "Complete"
description: "The transferable half of going through Y Combinator with a hardware company: what a weekly cadence does to a business with lead times, how to pick a metric nobody can argue upward, and what the batch is genuinely good for when you cannot ship daily."
tags: ["Y Combinator", "robotics", "startup", "OctaPulse", "entrepreneurship"]
---

I already wrote the narrative version of our batch. This is the other half, the part I would actually hand to another hardware founder, because almost none of the advice that mattered to me was about fundraising or growth.

OctaPulse is two people. Paul Grech and I are building the robotics layer for seafood, and we went through Y Combinator in the Winter 2026 batch.

What follows is what a weekly cadence does to a company with lead times, how to pick a number nobody can argue upward, and what the batch is good for when you cannot ship daily.

![Two founders leaning together over a white Y Combinator sign with the orange Y logo, outside a low single-story building with a bare tree, parked cars and an orange traffic cone behind them, under a pale cloudy sky](@images/experience/octapulse/B8633296-F8D3-4DE3-B158-2C0BA63ADCA3_1_105_c.jpeg)

## We were not the only ones with a lead time problem

Roughly one in eight of the W26 companies were building something physical. I quoted the cohort numbers in the narrative post; what I want here is the consequence.

One in eight is not a majority, and the ambient advice in any batch is calibrated for the other seven. That is not a complaint. It means you run a translation step on every piece of guidance you receive, and the translation is almost always about time constants.

The software default is that iteration is close to free, so the correct move is usually to just try the thing. When a part takes weeks to arrive and a site visit costs a day of somebody else's working time, the advice quietly inverts without anyone telling you it has.

## A metric you cannot game has three properties

A weekly number is a lie detector, and it only works if you pick one you cannot argue with.

The test I ended up using has three parts. Somebody outside the company could count it and get the same answer. It goes flat immediately when you stop doing the physical thing, with no lag and no lead. And there is no definitional knob: you cannot move it by changing a denominator, a split, or a threshold.

Model accuracy fails all three. It is measured against a held-out set you assembled, scored against labels whose provenance you control, and you can raise it by a few points without touching the product. That makes it a research result rather than a weekly metric, and the two should never sit on a slide in the same role.

Uptime fails the third test whenever you get to define what counts as down. Parts ordered fails the first. Demos built fails everything.

A number that passes all three will be flat for reasons you do not control. I have made the flat-line argument elsewhere; what I did not have then was a test for which number to be flat on. **What I would do differently is attach a written cause to each flat week at the time.** A flat line with a recorded reason is data. A flat line you explain three weeks later is a story.

## The batch rewards the half of your stack that deploys itself

There is an asymmetry in most deployment setups that a weekly cadence quietly punishes. The frontend and the API redeploy automatically on a push. The GPU apps and the database migrations are manual, applied by hand.

A weekly cadence rewards the automatic half and penalizes the manual half. You drift toward whatever has the shortest path from decision to visible result, because that is what the week measures. Physical work has the longest deploy path there is.

The more uncomfortable version of that is testing. It is entirely possible to ship for months on throwaway verification scripts, run once against real data and then deleted, with no suite and no CI step behind them. Those scripts catch real bugs. None of it is repeatable by anyone else, and a weekly cadence never once asks you to make it so.

A batch produces exactly that shape of codebase, and I do not think that is avoidable in three months with two people. What is avoidable is not knowing it. Keep a written list of what you have not verified, and add to it in the same sitting you decide to skip the check.

## Write the scoring rubric before you have a result to score

The most useful document in our robotics repo is an evaluation protocol I wrote before we had anything worth calling a result. The tally table in it is still unfilled and the grid has never been run.

It fixes the rules in advance. Decide the exact trial list before you start, because deciding as you go is cherry picking. Define success crisply, so there is no "close enough" mid run. Hold lighting, fixture placement, camera mount and start pose constant, and change exactly one thing between versions. Record every trial including the ugly ones. Log the failure mode, not just pass or fail, because "missed far left" and "grasped then dropped" point at completely different fixes.

For the first pick and place task, success is the object lifted fully clear of the tray and released inside the bin footprint, in one attempt, without dropping on the way. The grid is three tray zones by three, crossed with three orientations. The full cross is 27 trials, too many for one sitting, so it runs 20 that cover every zone once and then lean on the corners. A third category sits between success and failure, for grasped but dropped early, placed outside the bin, or needing a visible re-grab, and it is tracked separately because partial outcomes are the richest signal you get.

**A weekly demo culture will happily accept "it worked" as a result.** "It worked" is not comparable to last week's "it worked". Writing the rubric first costs an afternoon and is the only reason I will be able to say anything about whether we are improving.

## Simulation is where a weekly cadence does the most damage

I have quoted our simulation numbers elsewhere. This is about why I do not fully trust the machine that produced them.

Fast tooling produces confident falsehoods, and a weekly cadence multiplies them.

Our arm's URDF loads into MuJoCo and succeeds while throwing most of the model away. It produces a passive ragdoll with zero actuators. All nine visual meshes vanish, because MuJoCo has no GLB decoder and the importer discards visual geometry by default, so the unsupported format never raises an error: the base link ends up as a 141 vertex collision hull where the visual mesh has around 36,000. Fusing static links deletes the tool and camera frames, which cost me a failed grasp, because I aimed inverse kinematics at a link origin roughly 9 cm behind the actual fingertips.

Worse, the stepper silently resets its state on divergence. Simulation time jumps back to zero and the rollout keeps running looking healthy, which handed me false stable verdicts across an entire sweep.

My favorite one: two neighboring link hulls overlap by about 1.6 mm at the first joint, in 100 percent of arm poses, and the solver did not auto-exclude the pair. The friction of that permanent contact pinned the joint. Commanded negative 0.5 radians, actual negative 0.008, actuator force saturated at negative 100 newton meters. The arm looked like it was tracking slowly. It was welded. Excluding that one contact pair took a scripted pick from 0 out of 10 to 10 out of 10.

There is also a speed trap. One deformable solver setting runs 30 times faster, and must not be used for a fillet, because drape sag under it is exactly 0.0 mm at every stiffness. It is fast because it cannot bend.

Our synthetic dataset is 50 episodes and 3,687 frames, generated in 40 seconds of wall clock time. Its own results log says outright that it says nothing about real world performance. **The cheapness is the hazard.** In a week where the physical work is blocked, simulation is the only thing that still moves, which is exactly when you are least equipped to notice it is lying.

## The long-lead track needs its own clock

Our development arm cannot be sprayed down. No IP rating, exposed motors, open electronics. A fish plant wants IP67 and ideally IP69K, roughly 80 degree water at 80 to 100 bar, plus 316 stainless, crevice free sloped surfaces, and compliance work that varies by zone.

That is a sourcing and budget problem with a long lead time, almost entirely independent of the learning work. The line I wrote in our own notes and still believe is that the dev kit is the flight simulator, not the aircraft.

Start that track in week one, and never let it be your weekly number. It will be flat for months and then step, and a weekly cadence has no way to represent that shape except as failure.

The same discipline applies to the task. We staged it deliberately: one object from a fixed tray in good lighting, then varied positions, then multiple objects, then a moving line. That ordering is written down with a warning not to start at the version that would be a doctoral thesis. In a batch the pressure runs the other way, toward demoing the last stage first.

## Nobody can see the days you spent on bring-up

Bringing up the arm took days that produced no external evidence of anything.

USB enumerating is not the same as motors being powered, because the board's USB chips are themselves USB powered, so a serial port appears even with the motor bus dead. You diagnose it by LED: no red is a power problem, still red is a data problem. The first launch of the tooling takes 20 to 60 seconds to import, and it is not frozen.

None of that goes on a slide, and I do not think it can be parallelized. Two people can split software cleanly. I do not think two people can split a bring-up: one pair of hands is on the hardware and the second person is watching.

Budget for those days explicitly, and say so before they happen. Announced in advance it is a plan. Explained afterward it is an excuse, and everyone can tell the difference.

## What the batch was genuinely good for

Three things, none of which was the number itself.

It forced artifacts to be written down while I still remembered why. The evaluation protocol, the lessons files, the deployment asymmetry, the list of things I have not verified: every one exists because the cadence made me finish a thought in the week I had it.

It front-loaded everything off the physical critical path, so that when a part or a site visit landed, nothing else was holding it up.

And it was an honest audit of which bottlenecks were actually mine. A weekly rhythm separates the constraints that are physics from the ones that were only my own sequencing.

Compressed: pick a number somebody outside the company could count, write your rubric before your robot, treat fast tooling as an unverified claim, and put your long-lead purchases on a clock that is not the weekly one.

The batch cannot compress a lead time. What it can do is make sure that when the part finally arrives, everything else is already waiting for it.
