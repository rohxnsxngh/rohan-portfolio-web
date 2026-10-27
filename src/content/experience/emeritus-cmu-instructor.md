---
title: "Lab Instructor, Agentic AI Program"
company: "Emeritus x Carnegie Mellon University"
description: "Teaching the Guided Virtual Labs for Carnegie Mellon School of Computer Science Executive Education's seven-week Agentic AI Program, delivered with Emeritus, and building the live slide decks and teaching guides for all 14 labs."
date: "2026-09"
endDate: ""
location: "Remote"
tags: ["Agentic AI", "Teaching", "LLMs", "RAG", "Multi-Agent Systems", "MCP", "AI Safety", "CMU"]
---

## Teaching Agentic AI at Carnegie Mellon

I teach the Guided Virtual Labs for the [Agentic AI Program](https://execonline.cs.cmu.edu/agentic-ai-program) from Carnegie Mellon University's School of Computer Science Executive Education, delivered in collaboration with Emeritus.

The program runs seven weeks, live and online. Each week has one faculty-led live session and two hands-on labs, and it ends with a capstone. The program is built for working engineers: AI and ML engineers, backend and platform engineers, data scientists. They already know Python. They want to know how agents actually work, and they want to build one.

That is fourteen labs. I built the teaching layer for all of them: a cell-by-cell instructor guide for every lab, and a live, animated slide deck for every lab.

**An agent is just a loop around an LLM.** That is the kind of plain-language framing my guides open with, and almost everything in the course is a variation on that loop.

### How I built the labs to be taught

In a lab, students have a notebook open, and the slides have to keep pace with the code without giving the answers away.

So the decks are built around **reveal on keypress**. Nothing appears until I press a key. Students predict first, then we look.

Diagrams build one step at a time instead of appearing finished. A finished figure is something you glance at. A diagram that assembles itself in front of you is something you follow.

Each lab is its own deck, so any lab can stand on its own. Every lab opens with a plain-language big picture and every deck closes with the same wrap-up shape: a handful of takeaways, a few discussion questions, and a one-sentence bridge to the next lab. Speaker notes, a clickable outline and fullscreen are built in.

The guides are the other half. Each one has a time budget for every section, "ask the class" prompts placed at specific moments, notes on what students should expect to see, and notes on the mistakes to watch for. While teaching I run two screens: the notebook on one, the guide on the other. The guides also double as onboarding for new lab instructors and TAs.

Two principles run through the whole thing.

**Build it by hand before you use the framework.** A ReAct loop with no library. A harness in a couple dozen lines. MMR from scratch. Then the same idea at production scale.

**Failure is the lesson.** Most labs run on small local open models on purpose, so the class can watch scale effects and breakdowns directly. Where things break is usually where the understanding is.

The clips below are the concept diagrams from the decks, one or two per module, recorded straight from the live slides.

### Module 1: Foundations of Agentic AI and LLM Capabilities

The course starts by taking the magic out. An LLM predicts the next token. We compare plain prompting, few-shot chain of thought and native thinking modes across a range of small open models, and treat model choice as what it really is: a tradeoff between quality, cost and latency.

Then tokenization. The classic "is 9.11 bigger than 9.9" failure is the best argument I know for why agents need tools. A model that can write working Python can still get that wrong, and the reason lives in how the text was cut up before the model ever saw it.

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab1_1-tokenization_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab1_1-tokenization.mp4" type="video/mp4">
</video>

*Lab 1.1: following "9.11 is larger..." from raw text to subword tokens, token IDs, and embedding plus position vectors on the way into the model.*

The second lab is the Model Context Protocol. Without a shared protocol, M applications and N tools means M times N custom integrations. With one, it is M plus N. We cover tools, resources and prompts, the transports, and authentication.

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab1_2-mcp-host-client-server_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab1_2-mcp-host-client-server.mp4" type="video/mp4">
</video>

*Lab 1.2: the MCP architecture. A host embeds the LLM and runs one client per server, and every message is JSON-RPC 2.0.*

### Module 2: Agent Architecture: Memory, Tools, and Reasoning Loops

This is where the loop gets built. Students write a ReAct agent by hand, Thought, Action, Observation, repeat, with no framework underneath, and then watch where it breaks.

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab2_1-react-loop_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab2_1-react-loop.mp4" type="video/mp4">
</video>

*Lab 2.1: the ReAct cycle step by step, and which parts the model writes versus which parts our code writes.*

The second lab gives the same tools to a model four different ways: hand-written ReAct, LangChain with a local model, native tool calling, and an MCP server. The tools never change. Only the way they are described and parsed does. Once that clicks, every agent framework looks a lot less mysterious.

### Module 3: RAG Agents and Vector Databases

Retrieval is the first real memory an agent gets. Students build a small dense passage retriever, look at how retrieved passages get combined into an answer, and weigh long context against RAG against MemGPT-style memory.

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab3_1-rag-pipeline_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab3_1-rag-pipeline.mp4" type="video/mp4">
</video>

*Lab 3.1: assembling retrieval-augmented generation. A DPR retriever pulls the top-K passages from a non-parametric index, and a seq2seq generator combines them into the answer.*

The second lab is Maximal Marginal Relevance, built from scratch, to trade relevance against redundancy. The predict-then-run moment here is a good one: which five documents will come back, and why did the duplicates survive? The takeaway is that the right setting depends on the geometry of your embeddings, so it has to be tuned rather than copied.

### Module 4: Tree-of-Thought Reasoning and Multi-Agent Concepts

The first lab rebuilds Tree of Thoughts (Yao et al., NeurIPS 2023) on the Game of 24: a proposer, an evaluator and a search over partial solutions, benchmarked against plain prompting and chain of thought. Part of the lesson is counting how many more model calls that better reasoning takes.

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab4_1-tree-of-thoughts_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab4_1-tree-of-thoughts.mp4" type="video/mp4">
</video>

*Lab 4.1: from IO prompting to chain of thought, self-consistency voting, and finally Tree of Thoughts, which searches, evaluates and backtracks over partial reasoning.*

The second lab is about harnesses, the loop at the core of the coding agents many students already use without looking under the hood. We write a minimal agent loop over a tool registry, compare Claude Code, Codex CLI, Antigravity CLI and opencode, and drive opencode headlessly while reading its event stream. The anchor paper is SWE-agent.

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab4_2-agent-harness_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab4_2-agent-harness.mp4" type="video/mp4">
</video>

*Lab 4.2: coding agents stripped down to the loop they share. The transcript goes to a stateless model, the harness runs any tool calls, appends the results, and repeats until a final answer comes back.*

### Module 5: Multi-Agent Workflows With CrewAI and LangGraph

Adding agents adds cost. In LangGraph, students build shared state, conditional routing, capped retry loops, failover and a tool adapter, and they measure what each coordination choice costs.

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab5_1-multi-agent-topologies_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab5_1-multi-agent-topologies.mp4" type="video/mp4">
</video>

*Lab 5.1: four design questions for multi-agent systems and four standard topologies: linear pipeline, supervisor, peer-to-peer swarm, and ensemble vote.*

The second lab is fine-tuning with LoRA on a small open model: domain-adaptive pretraining, then instruction tuning, while training a tiny fraction of the weights. The line I want everyone to leave with is that training loss is not evaluation.

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab5_2-lora_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab5_2-lora.mp4" type="video/mp4">
</video>

*Lab 5.2: LoRA freezes the pretrained W0 and trains only a small low-rank update BA, about 56x fewer weights for a single Qwen projection.*

### Module 6: Evaluation, Guardrails, Logging, and Observability

The first lab builds guardrails before, during and after generation for a medical-safety agent, chains them into one pipeline, and runs an ablation to see what each layer actually buys. Then we break every cheap guardrail on purpose, including showing how easily a chain-of-thought monitor can be evaded.

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab6_1-layered-guardrails_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab6_1-layered-guardrails.mp4" type="video/mp4">
</video>

*Lab 6.1: where hallucinations enter an agent pipeline, and why guardrails before, during and after generation catch more than a single check at the end.*

The second lab rebuilds a small SHADE-Arena-style loop: log the agent's trajectory, score it with a suspicion monitor calibrated to a false-positive budget, and escalate to a human. The uncomfortable result is that an attacker that hides its intent in its hidden reasoning gets past a monitor that only watches actions. The readings include Anthropic's SHADE-Arena and recent work on chain-of-thought obfuscation and monitorability.

**Watching only what an agent does is not the same as knowing what it is doing.**

### Module 7: Capstone Project

The last module turns what students built into something they can ship. In the first lab, one MCP server plus a skill, a sub-agent and session hooks become a single plugin that installs in both Claude Code and Gemini CLI. The protocol is the portability layer.

<video autoplay muted loop playsinline preload="none" poster="/videos/teaching/lab7_1-plugin-architecture_poster.jpg" width="100%" style="margin: 20px 0; border-radius: 8px; aspect-ratio: 1280 / 720;">
  <source src="/videos/teaching/lab7_1-plugin-architecture.mp4" type="video/mp4">
</video>

*Lab 7.1: the host (Claude Code or Gemini CLI) runs the agent loop while a plugin supplies the parts it calls: an MCP tool, a skill, an agent persona and a lifecycle hook.*

The capstone sample is a modular web-research agent, and it is judged on the quality of its report, not on whether tests pass. Before we read any code I ask the class to write down three criteria for a good research report, and we grade the output against them at the end. A report can be beautifully formatted and still be about the wrong thing. That is a better lesson about evaluating agents than any metric I could hand them.

### Why I teach this

I build ML systems at OctaPulse. Teaching is a different discipline. You cannot hand-wave a step when someone is about to run it, and you find out very quickly which parts you actually understand.

The thread through all seven weeks is simple. A bare model guesses text, so it needs tools. Tools need a loop. The loop needs memory, search and coordination. And once it can act, it needs guardrails and someone watching. The goal is for a room of engineers to go from "what makes this an agent and not a chatbot?" to shipping one.

---
