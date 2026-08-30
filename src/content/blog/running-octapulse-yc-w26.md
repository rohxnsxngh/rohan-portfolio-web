---
title: "Running a Fish Farming Company Through YC W26"
date: "2026-08"
author: "Rohan Singh"
image: "@images/experience/octapulse/42DEAF7C-EA45-4DB2-AD07-AFBB0227D2AB.JPG"
status: "Complete"
description: "What it actually felt like to run a hardware and computer vision company through the Y Combinator Winter 2026 batch, when your customers are fish farms and your timelines belong to biology"
tags: ["Y Combinator", "OctaPulse", "aquaculture", "hardware", "computer vision"]
---

Our one line is that we are building the robotics layer for the ocean and seafood. Every word of that is accurate. Everything interesting is missing from it.

OctaPulse is two people. Paul Grech and I founded the company in 2025, and we run it out of Pittsburgh, a city with no coastline. We went through Y Combinator in the Winter 2026 batch. Getting in is a separate story. This is the one about what happened afterward.

![Rohan and Paul standing beside a YC lobby check-in screen showing both of their headshots, each captioned "OctaPulse (W26)", with a counter at the top reading 75.4646995 days](@images/experience/octapulse/42DEAF7C-EA45-4DB2-AD07-AFBB0227D2AB.JPG)

That screen is the moment the batch stopped being an abstraction. Two headshots, "OctaPulse (W26)" under each one, and a counter at the top reading 75.4646995 days.

I never found out what it was counting down to. It read like the building explaining that whatever timeline we thought we were on, there was now a different one.

## The batch runs weekly and biology does not

The rhythm I lived was the week. Pick a number, commit to it, say it out loud, notice when the line is flat. For a company shipping software to consumers, that is close to a perfect instrument.

For us it was a good instrument pointed at a system that does not answer weekly.

A cohort of trout does not grow faster because we are in a batch. A farm crew does not find a spare Tuesday because our metric needs to move. Access to a raceway gets scheduled around the fish, the feed, the weather and the people, and none of those things know when office hours are.

**When your number is flat because of biology, you can report an honest flat line or you can quietly redefine the metric until it moves.** The second option feels like progress. It is not, and the difference becomes obvious to everyone within about two weeks.

## We picked the number that was hardest to game

The number we chose to report was how many individual fish we had photographed and turned into rows of data. It is countable, nobody can argue it upward, and it goes flat immediately if we are not physically getting to farms.

That weekly counter is a slice of a much longer program that started as a small pilot and grew from there. One photograph on a calibrated mat with a scale reference becomes twenty or more objective traits for that animal. One row per fish.

What I like less is what sits underneath it. When a training set has been auto-labelled and approved in bulk, the accuracy figures you can quote measure agreement with the auto-labeller rather than agreement with reality, and they only become accuracy claims once a human-labelled holdout exists to check them against.

That is a distinction worth holding yourself to even when nobody outside is asking. A batch is very good at making you ship. It does not make you honest about what your numbers mean.

A batch is very good at making you ship. It does not make you honest. You have to do that part yourself.

## Most of the batch happened at a desk in an apartment

![Rohan sitting in a black office chair beside a wood-top desk on a black metal frame, holding a laptop, an external monitor, a portable screen and headphones, with Amazon boxes on the floor and an apartment building through the windows](@images/experience/octapulse/64E3A15F-B59A-4345-9173-FF3BECEA3153.JPG)

This is the real workspace. A writing desk pushed against the windows, a laptop, a second monitor, a portable third screen, and Amazon boxes on the floor that had not been broken down because breaking down boxes was never the highest-value thing available.

Hardware companies in a batch look like this most of the time. The photogenic part is a robot in a plant. The actual part is waiting on a package, flashing a camera, and waiting on another package.

**The compensating advantage is that two people can now move absurdly fast on everything that is not physical.** All of our camera applications share one prebuilt base image, which cut per-app build time from about two and a half minutes to five or ten seconds. Multiplied across a batch, that is the difference between trying four things in a day and trying forty.

And one rule we wrote down after learning it the expensive way: never push to main while a pipeline job is running, because our API host redeploys on push and kills the worker thread mid-job.

## The farm is where the real bug reports live

The measurement problems came from standing next to water. The fleet problems came from the logs. It took me most of the batch to notice that those are two different categories with two different fixes.

Our portable capture rig is a tripod holding the camera at nadir over a ring light, and the part that matters most is the scale fiducial required in every frame. Every image carries its own scale, so a measurement never depends on how carefully somebody rebuilt the tripod that morning.

The capture gate is the same instinct. An image only fires once a trout has been held still for a settle interval and the frame has been hand-free for several consecutive detections, so an operator's hand never occludes a measurement.

Our confidence floors are deliberately asymmetric, 0.6 for a trout and 0.35 for a hand, because a missed hand silently corrupts a measurement while a false hand costs a few frames of delay.

**Pick the side of the error you can recover from.** That came out of rewriting our capture deduplication, and it generalizes further than I expected: a duplicate is a visible row you can filter, and a miss is invisible and gone.

You do not learn that in a group office hour.

## The failures were never the ones I planned for

Some of these happened inside the batch and some after it. The pattern does not change.

A perfectly healthy camera can drop off a private network and stay off, and diagnosing it means physically travelling to the plant. So a watchdog has to check whether the machine is genuinely reachable rather than whether its process is alive, and power-cycle it when it is not. Liveness and reachability are different questions and only one of them matters.

Anything identity-shaped hard-fails at startup now instead of falling back to a default. A silent default for a missing device identifier gives you a fleet that all reports itself as the same unit: nothing errors, the dashboard looks populated, and the data is worthless.

My favourite failure is the smallest one. Model class order is the part you actually need to reason about later, so it belongs in version control beside the model rather than baked into weights nobody can read. Getting it wrong is silent and expensive.

## Preparing for the stage is a compression exercise

![Rohan and Paul on stage in navy OctaPulse quarter-zips presenting to a seated audience, Paul on the microphone, orange acoustic paneling flanking the stage and a partner slide displayed behind them](@images/experience/octapulse/photo_52203.jpg)

Standing up in front of a room forces a specific kind of audit, because you have to decide which numbers you are willing to defend under questioning.

We caught our own copy being inconsistent about accuracy. One page said 95% or better. Another said above 90%. Both were ours. The defensible published version is over 90%, because nothing we have contradicts it, and I would rather say the smaller number and never walk it back.

The harder line to keep in was the incomplete one. Six of our seven core capabilities are operational and weight estimation is still in development, because the single-view model infers volume from a two-dimensional area, which is an assumption rather than a measurement. That sentence is on the slide.

**A failed measurement is flagged, never estimated.** That is the company rule, and it means your database gets no invented values. It is much easier to write than it is to keep on a stage.

## What the batch actually compressed was decision latency

![Rohan in a grey beanie and blue sweatshirt, laughing at a table with other founders at a YC event, a name badge on his chest](@images/experience/octapulse/photo_50575.jpg)

That is the honest answer, and the other founders were more useful than any framework.

The decision I can point to is whether to build our own labeling and training platform or keep renting a hosted one. We built it, and it is now the thing our whole labeling loop runs through. The analysis was not what settled that question. The tempo was.

It also compounded with things that were already in motion. We were named a 2025 Seafood Industry Climate Award recipient by the Acme Smoked Fish Foundation, announced in late January 2026, with a $70,000 grant, recognised for automated technology that identifies deformities and reduces waste in fin-fish aquaculture operations.

After it, in March 2026, The Silicon Valley Post named us to two of its "Top Startups in YC W26" lists: top bio and health, and top robotics and drone.

None of that is the same as a company that works. It is evidence that other people find the direction credible, which is worth something and is not worth everything.

## The batch could not compress a growth cycle

It could not get us washdown-rated hardware, which is a purchasing and design question rather than something tempo solves.

And it could not tell us how to grip a wet fillet. In simulation the split is stark: a scripted pick that succeeds every time on a rigid proxy fails outright on a deformable one. That is a demonstration rather than a real-arm result, but a clear one that the deformable problem, not the pipeline, is the hard part.

That is the part I want to be clear about. Extraordinary tempo does not change what a biological system is willing to do, or what a food plant is willing to have bolted above its line.

What the tempo did do was make our excuses expensive. When you have to say a number out loud every week, the gap between what you have built and what you have claimed gets very small very fast.

I grew up in Goa, with the ocean as ordinary background. I did not expect the work to look like this: resolver configs, watchdog timers, and the exact confidence floor below which a real trout stops existing.

But this is what caring about the ocean actually costs, and I would rather be doing this than talking about it.

---
