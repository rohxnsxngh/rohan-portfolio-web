---
title: "MOGO: Resolving the Connector Compliance Paradox in Modular Soft Robotics"
date: "2025-05"
status: "completed"
image: "/images/project/MogoHero.jpg"
description: "A single-material, fully-soft ball-and-socket connector that lets soft robotic modules snap together like LEGO — trading rigid interfaces for compliant ones and discovering, counterintuitively, that softness makes the connection stronger."
tags: ["soft robotics", "modular design", "TPU", "3D printing", "finite element analysis", "mechanical design", "CMU"]
images:
  - src: "/images/project/MogoHero.jpg"
    alt: "The final MOGO ball-and-socket modules, 3D printed in white TPU"
  - src: "/images/project/MogoConnection.jpg"
    alt: "Two MOGO modules joined by a single soft ball-and-socket joint"
  - src: "/images/project/MogoForceTest.jpg"
    alt: "Mark-10 digital force gauge measuring insertion and pull-out force"
  - src: "/images/project/MogoFEATorsion.png"
    alt: "SOLIDWORKS von Mises stress plot of a module under torsional load"
  - src: "/images/project/MogoInfillCrossSection.jpg"
    alt: "Slicer cross-section showing the socket module's internal infill"
  - src: "/images/project/MogoStanding.jpg"
    alt: "MOGO modules showing the visible FDM layer lines of the TPU print"
---

# MOGO: Resolving the Connector Compliance Paradox in Modular Soft Robotics

MOGO started with a deceptively simple question: *what if building a soft robot were as intuitive as snapping together LEGO bricks?* Soft robots are safe around people, adapt to their surroundings, and deform in ways rigid machines can't — but every new soft robot is still hand-engineered from scratch. We set out to fix that with a set of reconfigurable building blocks, and in the process stumbled onto a genuinely surprising result about what makes a soft connection strong.

This was a semester-long research project for Carnegie Mellon's 24-673, built with Yujia Liu, Hongfei Liu, and Brady Stump.

![The final MOGO modules 3D printed in white TPU](/images/project/MogoHero.jpg)

## The Connector Compliance Paradox

When we surveyed the existing work on modular soft robotics, a consistent pattern jumped out: everyone builds soft modules, but then joins them with *rigid* connectors. Snap-fits, plastic clips, hard inserts — the modules are compliant, and the moment you connect them you've bolted a stiff part right where the flexibility is supposed to be.

We gave this mismatch a name: the **Connector Compliance Paradox**. To make it concrete, we defined a **Connector Compliance Ratio (CCR)** — simply the elastic modulus of the connector divided by that of the soft module:

> **CCR = E_connector / E_module**

Surveying the literature, every existing system sat at a CCR well above 100 — connectors two to four orders of magnitude stiffer than the material they join. That stiffness jump is exactly where things go wrong: stress concentrates at the boundary, the assembly can't deform as one body, and the rigid–soft interface becomes the first thing to fail under repeated loading.

Our target was a connector with **CCR ≈ 1** — a joint as soft as everything around it. The research question became: *Can a single-piece, all-soft connector hold strong under multi-axis loading while still being something a human can actually assemble by hand?*

## The Pivot That Made the Project

We didn't start here. Our first few weeks went into cable-driven actuation — routing tendons through flexible modules, obsessing over *how do we make the thing move?* Then it clicked that actuation wasn't the bottleneck at all. Plenty of people can actuate a soft robot. What nobody had cracked was the boring-sounding part: **how the modules connect.**

So we asked the more useful version of the question — *what actually makes LEGO work?* — and the answer was connections that are simultaneously easy to make and mechanically robust. That reframing is the whole project. Everything after it is us chasing a connector that a beginner can click together and that still refuses to fall apart.

## Design Evolution: Three Manufacturing Phases

The final design didn't arrive fully formed. It emerged from three distinct manufacturing phases, each of which taught us something before we abandoned it.

### Phase 1 — SLA Interlocking Ribs

We started ambitious: computationally-designed interlocking ribbed structures, printed on a Formlabs SLA machine in Flexible Resin 80A, with IPA washing and UV curing. The parts were genuinely flexible — and genuinely impractical. Multi-part assemblies were fiddly, the ribs were hard to align, and getting them to attach reliably was a fight. Not the kind of thing you hand to a novice.

![Exploded view of the Phase 1 interlocking rib design](/images/project/MogoPhase1Exploded.png)

### Phase 2 — Simplified Studs

Phase 2 stripped things down: LEGO-style studs of various diameters, ribbed interfaces, and central through-holes for potential cable routing. Simpler, but still demanding — the parts needed precise orientation during assembly, which quietly rules out the "anyone can use it" goal.

### Phase 3 — FDM Ball-and-Socket

Insights from the first two phases pushed us to change *both* the fabrication method and the geometry. We switched to FDM printing in **thermoplastic polyurethane (TPU)** and committed to a **ball-and-socket** joint. The geometry does a lot of quiet work: the rounded ball self-guides into the tapered socket, the spherical contact spreads load instead of concentrating it, small misalignments are forgiven, and — crucially — the whole thing prints as a single piece with zero post-assembly.

![CAD iterations of the module geometry](/images/project/MogoCADIterations.png)

![Final CAD of the ball and socket modules](/images/project/MogoCADModules.png)

The lesson baked into this progression is one we kept relearning: **kill complicated multi-part ideas early.** The best version of MOGO is almost embarrassingly simple, and that simplicity is the point.

![Two MOGO modules connected by a single soft ball-and-socket joint](/images/project/MogoConnection.jpg)

## Dialing In the Infill

Here's where it gets fun. Because these are FDM prints, we don't just get one material behavior — we get a whole design space hidden inside the **infill**. The ball and the socket have opposite jobs, so we tuned them separately.

- **The socket** needs to stay compliant so the ball slides in without a wrestling match. Lower infill (20–30%) and a rectilinear pattern give the rim room to flex open.
- **The ball** needs to hold its shape under pull-out load so the joint doesn't just pop apart. Higher infill (up to 50%) with a gyroid pattern — whose triply-periodic surface distributes stress evenly — keeps it firm.

![Slicer cross-section of the socket module's internal structure](/images/project/MogoInfillCrossSection.jpg)

We measured everything with a Mark-10 digital force gauge, capturing both **insertion force** (how much effort assembly takes) and **pull-out force** (how strongly the connection holds).

![Force testing on the Mark-10 digital force gauge](/images/project/MogoForceTest.jpg)

The numbers told a clean story. Insertion force climbed with socket infill; pull-out force climbed with ball infill. The sweet spot — soft rectilinear sockets around 20–30% paired with 50% gyroid balls — landed at roughly **25 N to insert and 55 N to pull out**, a force ratio of about **2.2**. In plain terms: it takes more than twice the effort to separate the joint than to make it. That asymmetry is exactly what you want in a connector meant to stay together.

![Force testing results: insertion force and pull-out force versus infill density](/images/project/MogoForceGraphs.png)

## Validating It in Simulation

Before trusting the physical results, we ran the joint through structural FEA in SOLIDWORKS Simulation, modeling TPU as a hyperelastic Mooney-Rivlin material and loading a bonded pair under three scenarios: **torsion, bending, and tension.**

![Von Mises stress under torsional loading](/images/project/MogoFEATorsion.png)

The simulations validated the failure modes and, usefully, one *limitation*: under torsion the joint begins to unlock around a 45° rotation — a progressive, tactile separation rather than a sudden snap, which is at least a warning you can feel. Bending and tension held up well within the range of forces a human hand would apply.

![Displacement under tension — the connection stretches but holds](/images/project/MogoFEATension.png)

![Displacement under bending](/images/project/MogoFEABending.png)

## The Surprising Result: Compliance *Enhances* Robustness

Now the part that genuinely caught us off guard. Conventional wisdom says a strong connection needs a rigid connector. Our data said the opposite — the softness that we assumed was a liability was actually **improving** the connection through four compounding mechanisms:

1. **Increased contact area** — soft socket walls conform to the ball under load, creating a larger contact patch than any rigid socket could.
2. **Stress distribution** — inherent compliance spreads load across the whole contact surface instead of concentrating it at discrete points.
3. **Misalignment tolerance** — the soft connector self-aligns during insertion, tolerating around ±15° of angular misalignment versus roughly ±3° for a rigid snap-fit.
4. **Vacuum retention** — as the soft socket deforms during pull-out, it briefly forms a partial vacuum, adding a little pneumatic grip on top of the mechanical interference.

That's the real contribution of MOGO: evidence that in modular soft robotics, connector compliance *enhances* rather than degrades robustness — which quietly overturns the assumption that connection strength requires rigidity.

## Negative Results, Kept On Purpose

We deliberately documented what didn't work, because those were often more instructive than the wins.

- **The CAD didn't match reality.** Our first TPU joints, printed straight from nominal specs, simply didn't fit. Root cause: not enough design tolerance, plus TPU's hyperelasticity being poorly captured by our initial model. The takeaway — soft materials need roughly **2–3× the design tolerance of rigid parts**, and you should validate simulations against real material tests *before* committing.
- **Torsional weakness.** The 45° unlock threshold is a real limitation, pointing toward future keyed variants or magnetic augmentation for rotational constraint.
- **Manufacturing variance.** Around ±0.3 mm of feature variation caused a meaningful share of first-try assemblies to fail — design for larger tolerances and add QC checks.
- **Multi-axis surprises.** Combined loading produced noticeably more strength loss than single-axis testing suggested. Always test the messy, multi-modal states, not just the clean ones.

If there's a meta-lesson, it's the one from our own timeline: we spent too long on elaborate, barely-printable designs early and ramped up mechanical testing too late. Single-parameter iteration and early physical testing would have gotten us here faster.

## Where It Lands

MOGO demonstrates that a fully-soft, single-piece connector can hold real mechanical strength across multiple loading directions while still being assemblable by hand in about two seconds — and that it survives 500-plus connect/disconnect cycles doing it. We pulled the Connector Compliance Ratio down from the >100 of existing systems to roughly 1–10, and showed that doing so doesn't cost you robustness. It buys you some.

It's a small building block. But small, reliable, reconfigurable building blocks are exactly how you make soft robotics accessible to the researchers, educators, and makers who don't want to engineer every joint from scratch.

## Video Demo

Modules snapping together, holding, and coming apart — the whole point of MOGO in a few seconds.

<video controls width="100%" style="margin: 20px 0; border-radius: 8px;">
  <source src="/videos/mogo_demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## My Role

I led the **literature research** that surfaced the Connector Compliance Paradox and framed our research question, ran the **FEA simulation** work across the torsion, bending, and tension cases, and handled the **midterm report and writing**. The design and fabrication were a genuine team effort with Yujia Liu, Hongfei Liu, and Brady Stump.

## References

1. O. Yasa et al. (2023). An overview of soft robotics. *Annual Review of Control, Robotics, and Autonomous Systems*, 6, 1–29.
2. J.-Y. Lee, J. Eom, W.-Y. Choi, and K.-J. Cho (2018). Soft LEGO: Bottom-Up Design Platform for Soft Robotics. *Proc. IEEE/RSJ IROS*, 7513–7520.
3. Z. Jiao et al. (2024). Pneumatic coding blocks enable programmability of electronics-free fluidic soft robots. *Science Advances*.
4. Y. Benyahia et al. (2022). Computationally designed mechanical interlocks for multi-material printing. *Advanced Engineering Materials*, 24(5), 2101561.
5. H. Zhang, P. Zhu, Y. Lin, Z. Jiao, and J. Zou (2020). Modular Soft Robotics: Modular Units, Connection Mechanisms, and Applications. *Advanced Intelligent Systems*, 2(6), 1900166.
