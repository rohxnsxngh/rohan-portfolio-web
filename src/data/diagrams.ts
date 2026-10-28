// Which animated diagrams each detail page mounts in its "// HOW IT WORKS"
// section, keyed by `<collection>/<slug>`. Kinds live in src/diagrams/kinds;
// a key with no kind file yet simply renders its caption.
//
// Every label and caption here is checked against the page's own content
// file. When that content changes, the numbers here have to change with it.

export interface DiagramSpec {
  kind: string;
  /** what the canvas shows, read by screen readers */
  label: string;
  /** visible under the figure: what is happening and why it matters */
  caption: string;
  aspect?: number;
  aspectSm?: number;
  data?: unknown;
}

const pointcloud: DiagramSpec = {
  kind: 'pointcloud-sa',
  aspect: 2,
  aspectSm: 0.8,
  label: 'A LiDAR cluster of a walking person is downsampled by farthest point sampling, grouped by ball query and pooled twice, then classified as human; a non-human cluster is rejected as a false positive.',
  caption: 'Set abstraction, the block PointNeXt is built from. Farthest point sampling picks well spread centroids, a ball query gathers each centroid\'s neighbours, and pooling collapses each group into one richer point. Two levels later the cluster is small enough to classify. Cutting the encoder from 6 set abstraction blocks to 4 took the model from 1.36M to 0.26M parameters.',
};

const mogo: DiagramSpec = {
  kind: 'mogo-connector',
  aspect: 2,
  aspectSm: 0.68,
  label: 'Cross-section of the MOGO TPU ball-and-socket joint being inserted and pulled out, with socket lips flexing and a force against displacement curve traced alongside.',
  caption: 'The socket lips are soft enough to flex open as the ball passes, so assembly takes about 25 N. Pulling out, the conforming lips and a brief partial vacuum hold the ball until about 55 N, a ratio of 2.2. The socket prints at 20 to 30% rectilinear infill to stay compliant and the ball at 50% gyroid to keep its shape. The force curve is a schematic drawn through the measured peaks.',
};

export const DIAGRAMS: Record<string, DiagramSpec[]> = {
  'project/strandbeest-robot': [{
    kind: 'jansen-linkage',
    aspect: 2,
    aspectSm: 1,
    label: 'A Jansen linkage leg and its mirrored twin turning on one crank, with the foot path traced underneath and its flat stance stretch highlighted.',
    caption: 'One crank drives every joint. The link lengths shape the foot path so its bottom is nearly flat, which keeps the body level while the foot is planted, then lifts the foot clear on the return. Each leg runs a third of a turn behind the next so some feet are always on the ground. Move the pointer across the figure to turn the crank by hand.',
  }],
  'project/biorobotics': [{
    kind: 'fish-undulation',
    aspect: 2,
    aspectSm: 0.9,
    label: 'Top view of the T-Bone robot fish: five servo tail segments driven by phase-shifted sine waves, alternating between constant amplitude and multiplying undulation, with the joint angle traces below.',
    caption: 'Each of the five tail servos follows the same sine wave, shifted in phase from the one before, so a wave travels down the tail. Constant tail propulsion gives every joint the same amplitude and, in the pool, left the robot stationary. Multiplying undulation scales the joints by 0.5, 0.6, 1.1, 1.2 and 1.3, concentrating motion at the tail, and moved it forward. The parameters are trials 2 and 4 from the results table. Tap to switch patterns.',
  }],
  'project/mogo-modular-soft-robotics': [mogo],
  'research/mogo-fully-soft-connector': [mogo],
  'project/lidar-maze-robot': [{
    kind: 'lidar-maze',
    aspect: 1.8,
    aspectSm: 0.75,
    label: 'A maze robot sweeps a LiDAR beam to build an occupancy grid, then plans with fast-marching trees, smooths the path with Bezier curves and drives it with a time-optimal speed profile.',
    caption: 'The known-maze planning pipeline the software group built, with the LiDAR sweep that the full solver was meant to feed it. Fast-marching trees grow a tree of samples outward in order of cost from the start. The shortest branch is smoothed with Bezier curves whose control polygons stay inside free space, so the curve cannot clip a wall. TOPP-RA then caps speed where the curve is tight and accelerates on the straights.',
  }],
  'project/efficient-3d-point-cloud-processing': [pointcloud],
  'research/tinypointnext-efficient-point-cloud': [pointcloud],
  'project/attention-mechanisms-and-memory-networks': [{
    kind: 'transformer-attention',
    aspect: 2,
    aspectSm: 0.75,
    label: 'A Transformer decoder emits subword tokens one at a time; six cross-attention heads look over the encoded audio frames while a causal mask hides future tokens from decoder self-attention.',
    caption: 'Decoding one token at a time. Each step\'s query attends over the encoder\'s audio frames through 6 heads, and the averaged weights walk along the audio as the transcript advances. The decoder\'s own self-attention is causal: the triangle shows each token seeing only the tokens before it. The model has 3 encoder and 3 decoder layers at d_model 384, and beam search brought CER from about 14.3% greedy to 11.6% at width 10.',
  }],
  'project/connectionist-temporal-classification': [{
    kind: 'ctc-alignment',
    aspect: 2,
    aspectSm: 0.75,
    label: 'A CTC trellis for the phoneme target B UH K K EY S: the forward pass fills the grid, sampled valid alignment paths collapse to the target, and a path without a blank between the two K phonemes collapses to the wrong sequence.',
    caption: 'The CTC forward pass over the extended target, blank, B, blank, UH and so on. Every frame-level path that merges repeats and drops blanks into B UH K K EY S counts toward the loss, and the dynamic program sums them all at once. A path may skip a blank between different phonemes, but not between the two Ks: without a blank between them, they merge into one.',
  }],
  'experience/asml-robotics-intern': [{
    kind: 'asml-sweep',
    aspect: 2,
    aspectSm: 0.62,
    label: 'A non-convex gripper profile decomposed into a few convex hulls by CoACD and many voxel boxes by V-HACD, beside a parameter sweep scatter that maps where a handoff succeeds, collides or slips.',
    caption: 'Simscape collides only convex shapes, so each non-convex part is split into convex hulls. CoACD keeps the features that matter for contact with few pieces, while V-HACD\'s voxel pass needs many more and rounds off detail. With collisions working, sweeps over misalignment, calibration, friction and approach speed map the boundary between a clean handoff and a failure. The profile and the sweep here are schematic.',
  }],
  'blog/teaching-agentic-ai': [{
    kind: 'agent-loop',
    aspect: 2,
    aspectSm: 0.75,
    label: 'A ReAct agent loop answering whether 9.11 or 9.9 is larger: the model writes thoughts and actions, the surrounding code runs the tool and appends observations, and the whole transcript is fed back to a stateless model every turn.',
    caption: 'An agent is a loop around a stateless model. Each turn the model reads the whole transcript and writes a Thought and an Action. Our code, not the model, runs the tool and appends the Observation, then asks again. The transcript, and the context the model has to reread, grows every turn.',
  }],
};

export const diagramsFor = (collection: string, slug: string) => DIAGRAMS[`${collection}/${slug.toLowerCase()}`] ?? [];
