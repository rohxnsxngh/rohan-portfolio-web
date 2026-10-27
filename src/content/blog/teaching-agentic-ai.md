---
title: "Teaching Agentic AI to Working Engineers"
date: "2026-10"
author: "Rohan Singh"
image: "/videos/teaching/lab4_2-agent-harness_poster.jpg"
status: "Complete"
description: "What building and teaching the hands-on labs for Carnegie Mellon's Agentic AI Program taught me about agents, about explaining things, and about my own engineering at OctaPulse"
tags: ["teaching", "agentic AI", "CMU", "LLMs", "education", "OctaPulse"]
---

I teach the Guided Virtual Labs for the [Agentic AI Program](https://execonline.cs.cmu.edu/agentic-ai-program) at Carnegie Mellon's School of Computer Science Executive Education, delivered with Emeritus. It runs seven weeks, live and online. Each week has a faculty-led session and two hands-on labs, and the program ends with a capstone.

I built the live slide decks and the teaching guides for all 14 labs. One deck per lab, from about 19 slides up to 74 for the very first one.

The people in the room are not undergraduates. They are software engineers, ML engineers, platform people and data scientists who already know Python and have already used an LLM. That changes what a lab is for.

They do not need to be told agents are exciting. They need to see what one actually is.

## An agent is a loop, not a model

Each lab opens with a couple of minutes of big-picture framing in plain language. The one I keep coming back to is the simplest: an agent is just a loop around an LLM.

That sentence takes the mystery out of the word "agent" and replaces it with something an engineer can reason about. A model reads a transcript and writes text. Code around it decides whether that text is a tool call, runs the tool, appends the result and asks again.

So one of the first questions I put to the class has nothing to do with frameworks: what makes something an agent rather than a chatbot?

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab2_1-react-loop_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab2_1-react-loop.mp4" type="video/mp4">
</video>

*The ReAct cycle from Lab 2.1: Question, Thought, Action, Observation, then loop, with the parts the model writes separated from the parts our code writes.*

**Build it by hand before you touch the framework.** In the ReAct lab the class writes the Thought, Action, Observation loop in about 50 lines with no framework, and then watches where it breaks. Later, in the harness lab, the same idea comes back as a minimal agent loop of about 25 lines, before we look at how real coding agents like Claude Code, Codex CLI and opencode do it at scale.

Once you have written the loop yourself, a framework stops being magic. It is just someone else's version of the 50 lines, with more edge cases handled.

## Start with why the model needs help

The course opens on a failure. Ask a model whether 9.11 or 9.9 is larger and it can get it wrong, even though the same model can write working Python.

I put that to the class as a question before explaining anything: why would a model that can write working Python still get 9.11 vs 9.9 wrong?

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab1_1-tokenization_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab1_1-tokenization.mp4" type="video/mp4">
</video>

*From Lab 1.1: following "9.11 is larger..." from raw text to subword tokens, token IDs, and embedding plus position vectors on their way into the model.*

The answer lives in tokenization. The model never sees the number. It sees pieces of text. And once you see that, the case for tools makes itself. A bare LLM guesses text, so it needs tools.

That becomes the thread for the whole course. From loops and tools, to retrieval, search, harnesses, multi-agent coordination and fine-tuning, to reliability, and finally to packaging what students built as plugins for the coding assistants they already use.

## Show the real output instead of describing it

The decks have one trick I care about more than any other. On a slide for a code cell, pressing a key types in what that cell actually printed when it ran.

The point is the pause before the keypress. Students predict first, then see the answer.

**Let the screen make the point.** If I say "the small model gets confused here," people nod. If the actual output appears on screen and a 0.6B model reasons its way from a spider's 8 legs to 4, nobody needs me to say anything.

Every lab has a deliberate predict-then-run moment like this. In the lab on Maximal Marginal Relevance the prompt is: before running, which 5 documents do you predict? And after: why did the duplicates survive?

A wrong prediction teaches more than a correct explanation, as long as the person made it themselves.

## Build the diagram, do not just show it

The other thing I learned building these decks is that a finished figure is the worst way to explain a system. It shows everything at once, so nothing has an order.

The concept diagrams in the decks build step by step instead. One box, then the arrow, then the next box, then the thing that loops back. The order the pieces appear in is the explanation.

That takes more time to make than a static slide. It is also the only version I have found where the audience is looking at the same part of the diagram I am talking about.

## Failure is the lesson

Most course material shows the happy path. These labs are built around where things break, on purpose.

The 0.6B model gets the spider wrong. Tree of Thoughts gets benchmarked against plain prompting and chain-of-thought on Game of 24, including what it costs: roughly 100 times more LLM calls. The capstone research agent can produce a beautifully formatted report about the wrong topic, which is why the capstone lab opens by asking students to write down three criteria for a good report before reading any code, so we can grade the output against them later.

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab6_1-layered-guardrails_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab6_1-layered-guardrails.mp4" type="video/mp4">
</video>

*From Lab 6.1: where hallucinations enter an agent pipeline, and why a guardrail before, during and after generation catches more than a single check at the end.*

In the guardrails lab, every cheap guardrail gets broken on purpose. In the monitoring lab, an attacker that hides its intent in hidden reasoning gets past a monitor that only watches actions.

I would rather students leave knowing exactly how their guardrail fails than believing it works.

Most of the labs run on small local open models, between 0.5B and 4B parameters, and that is a feature. Small models fail visibly. You can watch scale effects happen on your own screen instead of reading about them.

## Design for the student who is one cell behind

A live lab runs somewhere between 85 and 120 minutes, and the room never moves at one speed. Somebody's environment broke. Somebody is still reading the last output. Somebody already finished and is bored.

So the teaching guides are built for that. Each one has a time budget bar with every section sized by its planned minutes. Each step has a "watch for" note that flags the common mistake at that point and an "expect" note that says what students should be seeing. There are "covered" checkboxes so I can track where the class actually is, not where the plan says it should be.

While teaching I run two screens: the starter notebook on one, the matching guide on the other.

**The goal is that anyone can rejoin at any cell.** Every deck stands on its own, opens on a title slide and ends with a wrap-up of the same shape: three to five takeaways, two to four discussion questions, and one sentence that bridges to the next lab. The second lab of each module also ends with a module recap.

A fixed shape sounds rigid. In practice it is what lets a person who fell behind find their footing again.

The guides also double as onboarding for new lab instructors and TAs. If I wrote it clearly enough for the class, I wrote it clearly enough for the next person teaching it.

## What it did to my engineering

I did not expect teaching to change how I build at OctaPulse, but it has.

The 50-line loop is the clearest example. Writing down exactly which parts of an agent the model controls and which parts my code controls is now how I read any system that has a model in it. The model is the stateless part. Everything that can go silently wrong lives in the code around it.

Failure as the lesson carries over too. At OctaPulse we have learned to pick the side of the error we can recover from, to hard-fail on missing identity instead of falling back to a default, and to check whether a camera is reachable rather than whether its process is alive. Building labs where every guardrail gets broken on purpose is the same instinct pointed at a different system.

And the predict-then-run habit is just good engineering with an audience. Before I run something now, I try to say what I expect to see. When I am wrong, that is the interesting part.

**If you cannot explain a system step by step, in the order it actually runs, you do not understand it yet.** Teaching is the fastest way I have found to find out which parts I only thought I understood.
