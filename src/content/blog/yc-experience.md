---
title: "Getting Into Y Combinator: The OctaPulse Journey"
date: "2026-09"
author: "Rohan Singh"
image: "@images/experience/octapulse/B8633296-F8D3-4DE3-B158-2C0BA63ADCA3_1_105_c.jpeg"
status: "Complete"
description: "What the Y Combinator application and interview actually select for, written from the position of someone who was rejected once with a software company and accepted later with a fish company"
tags: ["Y Combinator", "startup", "entrepreneurship", "OctaPulse", "robotics"]
---

I have written about what it was like to run OctaPulse through the Winter 2026 batch. That piece deliberately skipped the beginning, because getting in is a different story with a different shape.

This is that story. It stops at the acceptance.

The useful thing about my version is that I have both outcomes. In 2024 I applied with two friends and a construction software company and we were rejected. Later I applied with Paul Grech and OctaPulse, the fish company we co-founded, and we were not. The interesting material is not in either application. It is in the difference between them.

![Two founders leaning together over a low white Y Combinator sign with the orange Y logo, a bare tree and parked cars behind them under an overcast sky](@images/experience/octapulse/B8633296-F8D3-4DE3-B158-2C0BA63ADCA3_1_105_c.jpeg)

## The first time, I got interviewed twice and still got a no

The S24 application was for an AI product aimed at the bidding and change request process in construction. I built it with two friends, Dominic and Prathik. Prathik got our first beta user by walking onto a live construction site and starting a conversation with a general contractor, which is still one of the better sales moves I have watched anyone make.

We got an interview. Then, two days later, we got a second one in the same batch, which I understand is not common. Then we got rejected.

My post-mortem at the time was that we failed to explain the problem and the value clearly, and that we were unprepared on pricing, customer acquisition and go to market. I still think that is right. What I did not understand then is that those are the same failure, not two failures.

## The rejection was a legibility problem

We had an interesting problem and something that worked. What we did not have was a sentence that survived being repeated by somebody who did not care about construction.

That is the actual test. Not whether a partner finds your idea interesting during the interview, but whether the partner can restate what you do, accurately, to a room of other partners, later, without you there. If your explanation requires your presence, it does not travel, and nothing that does not travel gets funded.

The one line I eventually landed on is the one that opens the W26 piece: we are building the robotics layer for the ocean and seafood. What matters is not the sentence. It is that the sentence is a handle rather than a description, small enough that a stranger can pick it up and carry it into a room I am not in.

![The OctaPulse mark: a circular logo with an orange sun setting into layered teal and dark blue waves](@images/experience/octapulse/8A51040C-3D5A-498D-BB64-52F36205336F_1_105_c.jpeg)

I did not have a handle in 2024. I had a description.

## A diagnostic worth running on your own answers

Here is a test I apply to my own writing about the company, and it costs nothing to run. Go through what you have written and mark every sentence that describes an intention rather than a thing that happened. Whatever is left is your actual company. The rest is a plan, and a plan is not evidence.

The reason it bites is that intentions are easy to write and impossible to check. A sentence that points at an event, a farm visited, a fish measured, a number recorded, can be checked by somebody else, and it drags the whole conversation toward the things you can defend.

## The industry argument is a measurement argument, not a robot argument

The thing that makes aquaculture worth a decade is not that it is under-roboticised. It is that it is under-measured.

Wild capture has been flat for decades, so every additional kilogram of seafood has to come from farming, and FAO put aquaculture's first sale value in 2022 at USD 313 billion, with farmed aquatic animals passing capture fisheries for the first time in history that year. It is a very large industry that mostly cannot count, weigh or evaluate its own animals. Most farms have less visibility into their stock than a 1990s retail store had into its inventory, and feed, the largest cost line on the farm, gets spent against an estimate.

The specific bottleneck we point at is phenotyping. A 2022 review in *Aquaculture and Fisheries* called it "the major operational bottleneck limiting the power and speed of commercial genomic selection programs." Genotyping a fish is a purchase order now. Measuring one is still a person with a board and a ruler, on a fish the process stresses.

We replace that with one photograph and a scale reference. The capture setup is described in the autonomy piece and the mechanics are not the point here. The point is that measurement stops being a sampling exercise, and a population you can only sample is a population nobody can actually manage.

That is the ordering I believe in. Robotics is what you build after the farm is legible, and legibility is the thing nobody has.

## The layer under the answer

Every founder prepares the first layer. What do you do, how big is the market, who is the customer. Those answers are cheap to rehearse, and rehearsing them is not the work.

The work is the second layer, which is what you have left when somebody takes a number you just said and asks how you know it.

The example I keep coming back to is weight. We estimate mass from a scale referenced body area using an allometric fit, W = 0.106 * Area^1.47, which gives 2.8% error and an R squared of 0.96 against 136 physically weighed fish. That is the first layer, and on its own it is a number anybody could have put on a slide.

The second layer is that the same fit holds at 2.82% under family-out cross validation, which is the part that tells you the model is reading morphology rather than memorising families. And the third layer is that I will still tell you weight is not a finished capability, because a single view model is inferring volume from a two dimensional area, and that is an assumption rather than a measurement.

Being able to walk down that stack in one breath is the whole preparation. It is not a communication skill. Either you ran the family-out split or you did not, and no amount of rehearsal will produce the number afterward.

## Saying the smaller number is a strategy, not modesty

The instinct under pressure is to round upward. I think that is the single most expensive habit a technical founder can carry into a room full of people who evaluate claims for a living.

Any company that has been running long enough accumulates two versions of its own numbers: the headline one that lives in marketing copy, and the smaller one you can defend when somebody asks for the validation split. When those two disagree, publish the smaller one. The upside of the bigger number is that a stranger is mildly more impressed for a few seconds. The downside is that you have handed them a thread to pull, and if it comes apart in the room, everything else you said becomes suspect at the same moment.

I would rather say the number nothing contradicts and never have to walk it back.

## The batch we joined was unusually physical

This is the piece of context I did not have while applying and only understood afterward. CB Insights described Winter 2026 as YC's most deep tech and physical AI heavy cohort to date: 199 companies, with roughly one in eight building a physical product.

I am not going to claim that is why we got in. Reasoning backward from your own acceptance to the criteria that produced it is the least reliable analysis available, and I have a sample size of two.

What I will say is that it changed what the batch was like once we were inside. Being a hardware company surrounded by other hardware companies means nobody needs the lead time problem explained to them. It also means the room is no longer impressed that you build physical things, which is healthy. You are back to being judged on whether the thing works.

## What I actually think the process selects for

Three things, in the order they mattered for us.

Whether you have made contact with the real thing. Not research, not interviews, not a landing page. Somebody stood next to the water and came back with a problem they did not have before.

Whether your explanation survives being repeated by a stranger. If the value only lands when you are the one saying it, you have a demo, not a company.

Whether you know which of your own numbers are soft. Every technical claim has a weak point, and the founders who can name theirs unprompted are trusted with the rest of what they say.

None of that is a trick for the application form. It is a description of a company that has been doing the work, and the form is mostly a device for detecting whether that is true.

The 2024 rejection is the part of this I would keep. It told me, accurately, that we could not explain the problem and the value to somebody who did not already care, and that we were unprepared on the parts of the business that were not the product. Both of those were fixable, and neither of them was fixable by writing a better application.

I have had the answer be no. It is survivable, and the second attempt is better because of it.
