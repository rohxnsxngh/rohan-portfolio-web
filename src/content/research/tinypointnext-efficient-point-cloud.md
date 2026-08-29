---
title: "TinyPointNeXt: Lightweight Architecture for Real-Time Human Detection in 3D Point Clouds"
date: "2025-05"
status: "completed"
image: "images/project/PointnextCustomDataset.jpg"
description: "A comprehensive study on efficient point cloud processing architectures, demonstrating that strategic model compression and optimized training procedures can achieve 81% parameter reduction while improving classification accuracy for dynamic object segmentation."
tags: ["3D point clouds", "deep learning", "model compression", "real-time inference", "semantic segmentation", "autonomous systems", "computer vision"]
---

# TinyPointNeXt: Lightweight Architecture for Real-Time Human Detection in 3D Point Clouds

## Abstract

Point cloud processing has emerged as a critical capability for autonomous systems, robotics, and augmented reality applications. However, state-of-the-art architectures often prioritize accuracy over computational efficiency, limiting deployment on resource-constrained platforms. This paper presents TinyPointNeXt, a lightweight neural network architecture optimized for human detection in dynamic 3D point cloud environments. Through systematic architectural modifications and comprehensive training optimization, we demonstrate that an 81% reduction in model parameters (from 1.36M to 0.26M) can be achieved while simultaneously improving classification accuracy by 1.31%. Our experiments on custom-collected datasets from real-world environments validate the effectiveness of our approach, achieving 93.98% overall accuracy with inference times of 2.47ms per sample. These results challenge the prevailing assumption that model complexity correlates directly with performance, suggesting that task-specific architectural optimization yields superior efficiency-accuracy trade-offs for specialized applications.

![Dynamic Object Segmentation in Point Clouds](@images/project/PointnextCustomDataset.jpg)

## I. Introduction

The proliferation of LiDAR sensors in autonomous vehicles, mobile robots, and surveillance systems has created an urgent demand for efficient 3D point cloud processing algorithms. Unlike structured image data, point clouds present unique computational challenges: they are unordered, sparse, and exhibit significant variation in point density across spatial regions. These characteristics necessitate specialized neural network architectures capable of extracting meaningful features from irregular geometric data.

Human detection in dynamic environments represents a particularly critical application domain. Autonomous vehicles must reliably identify pedestrians to ensure safety; service robots require accurate human localization for effective interaction; and industrial automation systems depend on human detection for collaborative workspace management. The latency requirements for these applications are stringent: detection delays measured in milliseconds can have significant safety implications.

Current state-of-the-art point cloud processing networks, while achieving impressive accuracy benchmarks, often exhibit computational demands incompatible with real-time deployment on embedded platforms. The PointNeXt architecture (Qian et al., 2022), for instance, demonstrates excellent performance on standard benchmarks but requires substantial computational resources that may exceed the capabilities of mobile robotic platforms.

This research addresses a fundamental question: *Can we design point cloud processing architectures that achieve real-time performance on resource-constrained platforms without sacrificing detection accuracy?*

Our contributions are threefold:

1. **Architectural Analysis**: We present a systematic study of PointNeXt architectural components, identifying which elements contribute most significantly to computational overhead versus classification performance.

2. **TinyPointNeXt Architecture**: We introduce a family of lightweight model variants that achieve substantial parameter reductions through strategic modifications to MLP width, encoder depth, and set abstraction configurations.

3. **Training Optimization Framework**: We develop a comprehensive training methodology incorporating optimized data augmentation, label smoothing, and learning rate scheduling that enables smaller models to match or exceed the performance of larger baselines.

![Complete Processing Pipeline](@images/project/PointnextPipeline.jpg)

## II. Related Work

### A. Point Cloud Processing Architectures

The seminal PointNet architecture (Qi et al., 2017a) established the foundation for deep learning on point clouds by demonstrating that permutation-invariant networks could effectively process unordered point sets. PointNet++ (Qi et al., 2017b) extended this work by introducing hierarchical feature learning through set abstraction layers, enabling the network to capture local geometric structures at multiple scales.

Subsequent research has explored various architectural innovations. PointConv (Wu et al., 2019) introduced continuous convolution operations for point clouds, while DGCNN (Wang et al., 2019) proposed dynamic graph convolution to capture local geometric relationships. More recently, transformer-based approaches such as Point Transformer (Zhao et al., 2021) have demonstrated state-of-the-art performance by leveraging self-attention mechanisms for point cloud understanding.

PointNeXt (Qian et al., 2022) revisited the PointNet++ architecture, demonstrating that much of the performance gap between classical and modern architectures could be attributed to training procedures rather than architectural innovations. Their work introduced the Inverted Residual MLP (InvResMLP) block and established improved training recipes that significantly boosted PointNet++ performance.

### B. Model Compression for Point Clouds

While model compression techniques are well-established for image-based neural networks (Han et al., 2015; Hinton et al., 2015), their application to point cloud architectures remains relatively unexplored. Knowledge distillation approaches have shown promise for compressing 3D object detection models (Yang et al., 2022), but systematic studies of architectural efficiency for point cloud segmentation are limited.

Our work differs from prior compression efforts by focusing on task-specific optimization for human detection, demonstrating that domain-specialized architectures can achieve superior efficiency compared to general-purpose compressed models.

### C. Dynamic Object Detection in Point Clouds

Dynamic object segmentation in point cloud sequences has gained attention for autonomous navigation applications. Dynablox (Schmid et al., 2023) proposed a volumetric approach for detecting moving objects in LiDAR scans, while 4D-PLS (Aygun et al., 2021) explored panoptic segmentation across temporal point cloud sequences.

Our approach complements these methods by providing an efficient classification stage that distinguishes human subjects from other dynamic objects, enabling more nuanced scene understanding for human-robot interaction scenarios.

## III. Technical Background

### A. Point Cloud Representation

A point cloud $\mathcal{P} = \{p_i\}_{i=1}^{N}$ consists of $N$ unordered points, where each point $p_i \in \mathbb{R}^{d}$ contains spatial coordinates and optional feature channels (e.g., intensity, color, normals). For LiDAR-based sensing, points typically include 3D coordinates $(x, y, z)$ and reflectance intensity $r$, yielding $d = 4$.

The fundamental challenge in point cloud processing arises from the lack of inherent ordering; any permutation of points represents the same underlying scene. Neural network architectures must therefore exhibit permutation invariance to ensure consistent outputs regardless of input ordering.

### B. PointNeXt Architecture

PointNeXt builds upon the hierarchical feature learning paradigm of PointNet++ while incorporating modern architectural components. The network consists of an encoder-decoder structure with set abstraction (SA) blocks for feature extraction and feature propagation (FP) blocks for upsampling.

![PointNeXt Mathematical Formulation](@images/project/PointnextFormula.jpg)

The Set Abstraction operation can be formalized as:

$$x_i^{(l+1)} = \mathcal{R}_{j \in \mathcal{N}(i)} \left( h_\Theta \left( p_j^{(l)} - p_i^{(l)}, x_j^{(l)} \right) \right)$$

where $\mathcal{R}$ denotes a reduction function (typically max pooling), $\mathcal{N}(i)$ represents the neighborhood of point $i$, $p_i^{(l)}$ and $x_i^{(l)}$ are the coordinates and features of point $i$ at layer $l$, and $h_\Theta$ represents shared MLPs parameterized by $\Theta$.

The Inverted Residual MLP (InvResMLP) block, a key innovation in PointNeXt, combines:

- **Residual connections**: Enabling gradient flow through deep networks
- **Separable MLPs**: Reducing parameter count through factorized transformations
- **Inverted bottleneck design**: Expanding intermediate representations before compression

This design achieves improved feature expressiveness while maintaining computational efficiency.

## IV. TinyPointNeXt Architecture

### A. Design Methodology

Our architectural exploration follows a principled approach: starting from the baseline PointNeXt-S configuration, we systematically reduce model complexity along three dimensions while monitoring classification performance:

1. **MLP Width Reduction**: Decreasing the number of channels in MLP layers
2. **Encoder Depth Reduction**: Reducing the number of Set Abstraction blocks
3. **Layer Reduction**: Decreasing MLP layers within each SA block

![Model Architecture Baseline](@images/project/PointnextBaseline.jpg)

### B. Architectural Variants

We developed five primary architectural variants, each targeting different aspects of model complexity:

**Architecture 1 & 2: MLP Width Reduction**

The baseline PointNeXt-S employs 32-channel MLPs throughout the network. We explored reduced configurations:

- Architecture 1: 24-channel MLPs (25% reduction)
- Architecture 2: 16-channel MLPs (50% reduction)

![Model Architecture Variants 1 & 2](@images/project/PointnextModel12.jpg)

These modifications directly reduce the parameter count of fully-connected layers, which constitute a significant portion of total model parameters.

**Architecture 3 & 4: Encoder Depth Reduction**

The standard configuration includes 6 Set Abstraction blocks. We investigated shallower alternatives:

- Architecture 3: 5 SA blocks (17% reduction)
- Architecture 4: 4 SA blocks (33% reduction)

![Model Architecture Variants 3](@images/project/PointnextModel3.jpg)

![Model Architecture Variants 4](@images/project/PointnextModel4.jpg)

Reducing encoder depth decreases both parameters and computational complexity, as each SA block involves expensive neighborhood queries and feature aggregation operations.

**Architecture 5: Layer Reduction**

Each SA block in the baseline contains 2 MLP layers. Architecture 5 reduces this to a single layer:

- Architecture 5: 1 MLP layer per SA block (50% layer reduction)

![Model Architecture Variants 5](@images/project/PointnextModel5.jpg)

### C. Optimal Configuration

Through extensive experimentation (detailed in Section VI), we identified the optimal configuration combining multiple reduction strategies:

| Component | Baseline | TinyPointNeXt |
|-----------|----------|---------------|
| MLP Width | 32 | 16 |
| SA Blocks | 6 | 4 |
| MLP Layers/Block | 2 | 1 |
| Total Parameters | 1.36M | 0.26M |
| Reduction | - | 81% |

This configuration achieves the most favorable efficiency-accuracy trade-off for human detection tasks.

## V. Training Optimization

### A. Data Augmentation Strategy

Point cloud data augmentation presents unique challenges compared to image augmentation, as transformations must preserve geometric consistency while introducing meaningful variation. We conducted systematic ablation studies on the HeliMOS dataset to evaluate augmentation strategies:

| Augmentation Strategy | Overall Accuracy |
|-----------------------|------------------|
| No augmentation | 47.84% |
| Geometric only (rotation, scaling, translation) | 38.63% |
| Noise injection only | 37.15% |
| Subsampling only | 46.92% |
| Combined (all techniques) | 69.07% |

A critical finding emerged: while individual augmentation techniques often degraded performance, their combination yielded substantial improvements (+21.23% OA). This suggests that diverse augmentation creates a more robust feature space, preventing overfitting to specific geometric configurations.

Our final augmentation pipeline includes:

- **Random rotation**: $\theta \sim \mathcal{U}(-\pi, \pi)$ around the vertical axis
- **Random scaling**: $s \sim \mathcal{U}(0.8, 1.2)$ applied uniformly
- **Random translation**: $t \sim \mathcal{N}(0, 0.1)$ in each dimension
- **Gaussian noise**: $\epsilon \sim \mathcal{N}(0, 0.02)$ added to point coordinates
- **Random subsampling**: Retaining 80-100% of points randomly

### B. Loss Function Design

We employ Smooth Cross-Entropy loss with label smoothing to improve model generalization:

$$\mathcal{L}(p, g) = -\frac{1}{n} \sum_{i=1}^{n} \sum_{j=1}^{c} y_{i,j} \log(\text{softmax}(p_{i,j}))$$

where the smoothed labels are defined as:

$$y_{i,j} = \begin{cases} 1 - \alpha + \frac{\alpha}{c-1} & \text{if } j = g_i \\ \frac{\alpha}{c-1} & \text{if } j \neq g_i \end{cases}$$

With smoothing factor $\alpha = 0.2$, this formulation prevents the model from becoming overconfident on training samples, improving generalization to unseen data distributions.

### C. Optimization Configuration

We employ the AdamW optimizer (Loshchilov & Hutter, 2019) with the following hyperparameters:

- Initial learning rate: $\eta_0 = 0.001$
- Weight decay: $\lambda = 0.01$
- Batch size: 32 (training), 16 (validation)
- Epochs: 100 with early stopping (patience = 15)

Learning rate scheduling follows a cosine annealing schedule:

$$\eta_t = \eta_{min} + \frac{1}{2}(\eta_0 - \eta_{min})\left(1 + \cos\left(\frac{t\pi}{T}\right)\right)$$

where $\eta_{min} = 10^{-6}$ and $T$ is the total number of training epochs.

## VI. Experimental Evaluation

### A. Dataset Construction

![Human Cluster and False Positive Examples](@images/project/PointnextDynamicObject.jpg)

Existing point cloud benchmarks (e.g., ModelNet40, ShapeNet) lack domain-specific samples for human detection in outdoor LiDAR environments. We therefore constructed a specialized dataset comprising two subsets:

**Clean Training Set** (Carnegie Mellon University, Mill 19):
- 4,614 human cluster samples
- 2,397 false positive cluster samples
- Train/Validation/Test split: 65%/17.5%/17.5%
- Collected using Ouster OS1-128 LiDAR

**Challenging Test Set** (CMU Scaife Drone Arena):
- 2,430 human cluster samples
- 3,321 false positive cluster samples
- Includes humans with carried objects (backpacks, carts)
- Represents distribution shift from training data

Each sample consists of a point cluster extracted by the Dynablox dynamic object detector, containing 3D coordinates $(x, y, z)$ and intensity values. Human clusters capture point patterns corresponding to human figures, while false positives include vegetation, vehicles, and other dynamic objects incorrectly flagged as potential humans.

### B. Ablation Study

We conducted a comprehensive ablation study evaluating 48 configurations across five architectural dimensions:

| Factor | Levels Tested |
|--------|---------------|
| Training Batch Size | 16, 32, 64 |
| Validation Batch Size | 8, 16, 32 |
| Encoder Width | 16, 24, 32 |
| Encoder Blocks | 4, 5, 6 |
| SA Layers | 1, 2 |

Key findings from the ablation study:

1. **Width reduction** (32→16) incurred minimal accuracy loss (<0.5%) while reducing parameters by 75%
2. **Block reduction** (6→4) improved accuracy by 0.4% while reducing parameters by 33%
3. **Layer reduction** (2→1) showed negligible impact on accuracy (<0.2%)
4. **Batch size** of 32 provided optimal convergence stability

### C. Comparative Results

The optimized TinyPointNeXt configuration was evaluated against the baseline PointNeXt-S:

| Metric | PointNeXt-S (Baseline) | TinyPointNeXt | Delta |
|--------|------------------------|---------------|-------|
| Overall Accuracy | 92.67% | 93.98% | +1.31% |
| Human Detection Accuracy | 92.64% | 94.67% | +2.03% |
| False Positive Accuracy | 92.67% | 93.28% | +0.61% |
| Parameters | 1.36M | 0.26M | -81% |
| Inference Time | 2.98ms | 2.47ms | -17% |
| Model Size (FP32) | 5.4MB | 1.0MB | -81% |

These results demonstrate that TinyPointNeXt achieves superior classification performance while requiring significantly fewer computational resources.

### D. Generalization Analysis

To evaluate generalization capability, we tested models trained on the clean dataset against the challenging test set:

| Model | Clean Test Accuracy | Challenging Test Accuracy | Degradation |
|-------|--------------------|-----------------------------|-------------|
| PointNeXt-S | 92.67% | 84.23% | -8.44% |
| TinyPointNeXt | 93.98% | 87.91% | -6.07% |

TinyPointNeXt demonstrates improved robustness to distribution shift, exhibiting smaller accuracy degradation on out-of-distribution samples. We attribute this to the regularization effect of reduced model capacity, which prevents overfitting to training data idiosyncrasies.

### E. Computational Efficiency

Inference benchmarks were conducted on an NVIDIA Jetson AGX Xavier, representative of embedded platforms for autonomous systems:

| Metric | PointNeXt-S | TinyPointNeXt | Improvement |
|--------|-------------|---------------|-------------|
| Latency (mean) | 12.4ms | 8.1ms | 35% faster |
| Latency (p99) | 18.7ms | 11.2ms | 40% faster |
| Throughput | 80.6 samples/s | 123.5 samples/s | 53% higher |
| Memory Usage | 412MB | 198MB | 52% lower |
| Power Consumption | 8.2W | 5.1W | 38% lower |

These efficiency gains enable real-time processing at sensor frame rates (10-20 Hz) on embedded platforms, a critical requirement for deployment in autonomous systems.

## VII. System Integration

### A. Processing Pipeline

TinyPointNeXt is designed for integration into complete perception pipelines for autonomous navigation:

1. **Sensor Input**: Raw point cloud acquisition from Ouster LiDAR (128 channels, 10Hz) with pose estimates from LiDAR-IMU odometry
2. **Dynamic Detection**: Dynablox volumetric processing extracts candidate dynamic object clusters
3. **Classification**: TinyPointNeXt classifies each cluster as human or false positive
4. **Filtering**: False positive clusters are removed from the dynamic object set
5. **Output**: Refined dynamic object detections with human identifications

### B. Deployment Considerations

For practical deployment, we provide:

- **ONNX Export**: Platform-agnostic model format for deployment flexibility
- **TensorRT Optimization**: 2.3x additional speedup on NVIDIA platforms
- **Quantization Support**: INT8 inference with <1% accuracy degradation
- **ROS2 Integration**: Prepared nodes for robotic middleware compatibility

## VIII. Discussion

### A. Implications for Architecture Design

Our findings challenge the conventional assumption that larger models necessarily yield better performance. For specialized tasks like human detection, we observe that:

1. **Task-specific capacity**: The classification task requires less model capacity than general-purpose architectures provide
2. **Regularization through compression**: Reduced parameters act as implicit regularization, improving generalization
3. **Training importance**: Optimized training procedures can compensate for architectural simplifications

These observations suggest that future point cloud architecture design should consider task-specific optimization rather than pursuing universal architectures.

### B. Limitations

Several limitations warrant acknowledgment:

- **Task specificity**: TinyPointNeXt is optimized for binary human detection; multi-class segmentation may require different trade-offs
- **Sensor dependency**: Results are validated on Ouster LiDAR; transferability to other sensor modalities requires further study
- **Environmental scope**: Training data represents structured outdoor environments; performance in cluttered indoor settings remains to be evaluated

### C. Broader Impact

Efficient human detection in point clouds has implications for:

- **Autonomous vehicle safety**: Reliable pedestrian detection is critical for collision avoidance
- **Human-robot collaboration**: Accurate human localization enables safe shared workspaces
- **Privacy-preserving surveillance**: Point cloud representations avoid capturing personally identifiable visual features

## IX. Future Directions

Based on our findings, we identify several promising research directions:

1. **Multi-class extension**: Extending TinyPointNeXt for fine-grained dynamic object classification (vehicles, cyclists, animals)

2. **Temporal modeling**: Incorporating recurrent or attention-based temporal aggregation for improved tracking consistency

3. **Neural Architecture Search**: Automated discovery of optimal architectures for specific deployment constraints

4. **Cross-sensor transfer**: Investigating domain adaptation techniques for deployment across different LiDAR sensor types

5. **Self-supervised pretraining**: Leveraging unlabeled point cloud data for improved feature representations

## X. Conclusion

This paper presented TinyPointNeXt, a lightweight architecture for human detection in 3D point clouds that achieves an 81% reduction in model parameters while improving classification accuracy by 1.31% compared to baseline PointNeXt-S. Through systematic architectural analysis and comprehensive training optimization, we demonstrated that task-specific model design can yield substantial efficiency gains without sacrificing performance.

Our results establish new efficiency benchmarks for point cloud classification and provide practical guidelines for deploying deep learning models on resource-constrained autonomous platforms. The success of our approach suggests that the point cloud processing community should revisit assumptions about model complexity, focusing on task-specific optimization rather than pursuing ever-larger architectures.

The TinyPointNeXt framework, training procedures, and pretrained models are publicly available to facilitate reproducibility and further research in efficient point cloud processing.

---

## References

- Aygun, M., et al. (2021). "4D Panoptic LiDAR Segmentation." IEEE Conference on Computer Vision and Pattern Recognition (CVPR).

- Han, S., et al. (2015). "Deep Compression: Compressing Deep Neural Networks with Pruning, Trained Quantization and Huffman Coding." arXiv preprint arXiv:1510.00149.

- Hinton, G., et al. (2015). "Distilling the Knowledge in a Neural Network." arXiv preprint arXiv:1503.02531.

- Loshchilov, I., & Hutter, F. (2019). "Decoupled Weight Decay Regularization." International Conference on Learning Representations (ICLR).

- Qi, C. R., et al. (2017a). "PointNet: Deep Learning on Point Sets for 3D Classification and Segmentation." IEEE Conference on Computer Vision and Pattern Recognition (CVPR).

- Qi, C. R., et al. (2017b). "PointNet++: Deep Hierarchical Feature Learning on Point Sets in a Metric Space." Advances in Neural Information Processing Systems (NeurIPS).

- Qian, G., et al. (2022). "PointNeXt: Revisiting PointNet++ with Improved Training and Scaling Strategies." Advances in Neural Information Processing Systems (NeurIPS).

- Schmid, L., et al. (2023). "Dynablox: Real-time Detection of Diverse Dynamic Objects in Complex Environments." IEEE Robotics and Automation Letters (RA-L).

- Wang, Y., et al. (2019). "Dynamic Graph CNN for Learning on Point Clouds." ACM Transactions on Graphics (TOG).

- Wu, W., et al. (2019). "PointConv: Deep Convolutional Networks on 3D Point Clouds." IEEE Conference on Computer Vision and Pattern Recognition (CVPR).

- Yang, Z., et al. (2022). "Knowledge Distillation for 3D Object Detection." IEEE Conference on Computer Vision and Pattern Recognition (CVPR).

- Zhao, H., et al. (2021). "Point Transformer." IEEE International Conference on Computer Vision (ICCV).

---
