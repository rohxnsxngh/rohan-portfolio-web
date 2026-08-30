<!--
UNPUBLISHED DRAFT.

Not in src/content/, so Astro never renders or ships it. The live post at
src/content/blog/deep-tech-fundraising.md is a "Coming Soon" stub.

To publish: replace the body of that file with everything below the
frontmatter here, and set status to "Complete".
-->

---
title: "Fundraising for Deep Tech and Hardware Startups"
date: "2026-08"
author: "Rohan Singh"
image: "@images/experience/octapulse/8A51040C-3D5A-498D-BB64-52F36205336F_1_105_c.jpeg"
status: "Complete"
description: "Why the milestones a hardware company can honestly show are shaped differently from software ones, what non-dilutive grants and accelerators actually buy, and what investors need to see when the product stands in a wet room."
tags: ["startup", "fundraising", "deep tech", "hardware", "venture capital"]
---

What is on the record for OctaPulse is a $70,000 grant from the Acme Smoked Fish Foundation, an Ocean Exchange award, VentureWell's Ocean Enterprise Accelerator, and Y Combinator. That is the named, non-priced backing, and I want to write around the shape of that list rather than around a round, because the shape is a more honest answer to how a physical company gets funded early than anything I could generalise.

Paul Grech and I co-founded OctaPulse in 2025 and went through Y Combinator's Winter 2026 batch as a team of two. What we build is cameras, enclosures, edge compute and eventually manipulators, standing in cold wet rooms on fish farms. Almost every piece of fundraising advice I read before we started assumed a product that ships over a wire.

The difference is not that hardware fundraising is harder. It is that the milestone you can honestly present has a different shape, and once you see that, most of the rest follows.

## The market is large and the funding is not

FAO's 2026 State of World Fisheries and Aquaculture puts aquaculture at 103 million tonnes and $371 billion in farm gate value for 2024.

Aquaculture technology drew $619 million of venture funding in 2024, down 28 percent from $854 million in 2023, according to Hatch Blue's annual deal analysis reported by The Fish Site. PitchBook has 2025 back near the earlier high at roughly $850 million, up about 35 percent year over year.

So an industry with $371 billion of farm gate value attracts well under a billion dollars of venture funding in a good year. For scale in the other direction, agtech overall raised roughly $7 billion in 2025, which is around eight times the aquaculture technology total for the same year. Over a slightly wider window, January 2025 to the first quarter of 2026, $393 million of agtech money went to 26 companies building labour replacement technology.

Hatch Blue's stated read, quoted in that same Fish Site piece, is the cleanest explanation I have found: "Infrastructure or capex-heavy investment does not traditionally fall within venture's appetite."

Nobody failed to notice that fish are still graded by hand. Noticing was never the expensive part. Underbuilt markets are usually priced for how long the loop takes, not for how small they are.

![Rohan Singh and co-founder Paul Grech standing in front of long parallel concrete raceways at a trout farm, with an arid basalt hillside behind them](@images/experience/octapulse/81297189-8C22-4939-AA1B-520078DC9FA3_1_105_c.jpeg)

## A software milestone is a curve and a hardware milestone is a claim

A software company can show a line. Signups, retention, revenue, whatever it is, the curve exists independently of any single conversation and it compounds while you sleep.

A cohort of trout grows on its own schedule. Access to a raceway is scheduled around the fish, the feed, the weather and the crew, and none of those things care about a fundraising calendar. There is no weekly compounding curve to point at, and manufacturing one is the fastest way to lose the room.

So the milestone is not a slope. It is a capability, stated precisely enough that somebody could falsify it. Ours is that hatchery stage phenotyping and deformity inspection runs in under 30 seconds from a single photograph at above 90 percent accuracy, with one image on a calibrated mat carrying a printed scale reference producing 20 or more objective traits for that animal. I have written separately about [why the loop around that number matters more than the number](/blog/what-autonomy-means-fish-farm).

The claim only travels honestly if the unfinished part travels with it. Weight estimation is the capability we will not yet call operational, because a single view gives you an area and volume has to be inferred from it, and an inference is not a measurement. Saying so is a policy rather than a pitch tactic. A claim list that never shrinks is a claim list nobody has audited.

## The number worth being asked about is the holdout

Our scale-referenced body-area fit, the allometric law `W = 0.106 * Area^1.47`, gives 2.8 percent error and an R squared of 0.96 against 136 weighed fish.

The holdout number matters more than the headline one. Under family-out cross-validation, where whole families are held out of training, the error holds at 2.82 percent. That is what tells you the model is reading morphology rather than memorising which families were in the training set.

The question worth being able to answer is what was held out. It is easy to answer well if you did the work and impossible to answer at all if you did not, which is most of why it is a good question.

Our own phenotyping model card carries the same discipline in its provenance section: unless a human-labelled holdout was used, the reported metrics measure agreement with the machine-generated labels the model was trained against rather than with ground truth. That caveat and what it costs us is a longer story in [the autonomy post](/blog/what-autonomy-means-fish-farm). The fundraising-relevant part is narrow. It is written down, it remains an open item on our board, and I would rather volunteer it than have it discovered.

## We wrote down which of our own claims is the softest

Somewhere in our content repository is a document that grades our own marketing. It labels a 50 percent cost reduction figure as positioning rather than a measured result. It notes that our headline accuracy figure and our accuracy at inspection speed describe two different things, and instructs anybody writing for us not to conflate them.

None of that was written for investors. It exists because two people writing about their own product will drift if nobody has decided in advance which claims are load bearing. It turns out to be a fundraising artefact anyway. In a category where almost every number is first party and unaudited, a document that ranks your own claims from measured to marketing is a stronger signal than any single metric inside it.

## Non-dilutive money buys the interval before the claim exists

The $70,000 came from the 2025 Seafood Industry Climate Award, announced in late January 2026. The Acme Smoked Fish Foundation, funded through Acme's 1% for the Planet commitment, distributed about $250,000 across six projects in North America and Chile in the programme's fourth year, with three North American recipients each receiving $70,000.

Two things about that award are worth more than the money.

The first is who evaluated it and against what. The review panel included representatives from Acme Smoked Fish, TD Bank, Whole Foods Market and Disney Parks & Resorts, and the published criteria were carbon emission reduction potential, implementation feasibility, and commitment to advancing equity. That is a room of people who buy and sell seafood, judging on operational outcomes rather than on technical novelty. A grant selected that way is a different signal from one selected by a technical panel, and it is worth knowing which kind you have won before you cite it.

The second is that it does not price the company. $70,000 is not a round. For a two person hardware company, non-dilutive capital of that size converts into runway measured in weeks, and in a business where the next milestone is gated by physical access to animals on somebody else's schedule, weeks are precisely the thing you cannot buy with cleverness.

That is what non-dilutive capital actually does for a deep tech company early on. It does not fund the vision. It funds the interval between now and the moment a claim exists that a priced round can be underwritten against.

![A large indoor test basin with yellow railings and a gantry crane above deep green water](@images/experience/octapulse/4DABB450-8CE3-49C1-A66F-495E35A8C055_1_102_o.jpeg)

## An accelerator is mostly a calendar

CB Insights described YC's Winter 2026 batch as its most deep tech and physical AI heavy cohort to date: 199 companies, roughly one in eight building physical products.

I think that ratio does more work than it looks like it does. My inference, not a measurement: when one company in eight is waiting on a part, the ratio changes what a blocker sounds like in the room.

The mechanism is not the check. It is that a batch imposes a fixed date by which a claim has to exist, on a company whose natural clock is set by lead times and growth cycles. It cannot compress either of those. It can make the gap between what you have built and what you have said out loud very small very fast. That was most of what the batch did to us, and I wrote up the rest of it in [the W26 post](/blog/running-octapulse-yc-w26).

## Lead times set the milestone calendar, not engineering

The US Department of Commerce surveyed semiconductor production equipment lead times in its December 2023 assessment of the microelectronics industrial base. The median lead time was at least a year for every category except assembly, manufacturing automation and test, which ran 26 to 32 weeks. Lithography averaged 74 weeks. For 300mm lithography, 95 weeks.

The same report asked buyers to name their primary concern for each equipment category. Purchase cost came first at 41 percent of identifications, followed by aging equipment, maintenance and throughput at roughly 15 percent each. Whether the equipment worked does not appear on that list.

Our version is much smaller and exactly the same shape. A sanitation crew in a food plant runs roughly 80 degree water at 80 to 100 bar with caustic and chlorine sanitizers daily, which is why plant hardware means IP67 and ideally IP69K ratings, 316 food-grade stainless, and smooth crevice-free sloped surfaces with no exposed fasteners for bacteria to sit in. The development platform we are learning on cannot be sprayed down at all.

What that turns into on a budget is a ladder with three rungs. Keep the arm out of the wet zone entirely and reach in from a dry or splash-protected position, which is the cheapest rung because it removes the requirement rather than meeting it. Put a food-grade washdown jacket over a standard cobot, which is the middle rung. Buy a native washdown stainless arm built for daily duty, which is the expensive one. Cost and lead time climb as you go up, and the useful property is that the trained policy transfers across the rungs with recalibration, because you are swapping the chassis and not the learning.

That ladder is the fundraising argument in miniature. Which rung we buy is a line in a budget with a delivery date attached, not an engineering result we can claim. So the learning problem and the deployment problem get funded on two separate clocks, and the raise has to cover the longest lead item plus the requalification after the first one arrives wrong. If your model does not have that second term in it, your model is a software model.

## What investors need to see when the product touches the world

Four things, roughly in this order.

A unit that has survived the room it will live in, not a demo on a bench. Our early prototypes worked in a lab and failed on a farm because the humidity, the lighting and the vibration were different. The interesting evidence is what came back after it was left somewhere hostile.

A number with its holdout attached. Any figure you cite in a physical domain is first party until proven otherwise, so the provenance travels with the number or the number is worth nothing.

The longest lead item, its cost, and who drives out when it fails on a Saturday. That question separates people who have shipped hardware from people who have shipped a prototype.

And a deployment that grew rather than one that started large. Our Riverence deployment began as a hundred fish pilot and is now roughly two orders of magnitude larger in fish imaged. A pilot that expanded is evidence, because somebody on the customer side chose to expand it. A pilot that arrived fully sized is a purchase order somebody signed once.

The funding gap in this sector is not a verdict on the market. It is a statement about loop length, and about how few investors are set up to underwrite an interval rather than a curve. Every piece of capital we have taken so far has in practice been a purchase of that interval. You are not selling growth yet. You are selling a well-specified reason to believe the next measurement will exist, and then you have to go and make it exist.
