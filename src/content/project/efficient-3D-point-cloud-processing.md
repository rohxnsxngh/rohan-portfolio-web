---
title: "TinyPointNeXt: Efficient 3D Point Cloud Processing"
date: "2025-05"
status: "completed"
image: "/images/project/PointnextCustomDataset.jpg"
description: "A lightweight architecture for dynamic object segmentation in 3D point clouds, optimizing for human detection with reduced model parameters while maintaining high accuracy."
tags: ["3D point clouds", "computer vision", "deep learning", "model optimization", "real-time inference", "point cloud segmentation"]
github: "https://github.com/rohansi2-cmu/tinypointnext"
---

# TinyPointNeXt: Efficient Point Cloud Processing for Human Detection

TinyPointNeXt is a specialized implementation and analysis of the PointNeXt architecture, optimized for dynamic object segmentation and human detection in 3D point cloud data. This project demonstrates how strategic architectural modifications and training procedures can significantly reduce model parameters while maintaining—or even improving—classification accuracy for real-time human detection in complex environments.

![Dynamic Object Segmentation in Point Clouds](@images/project/PointnextCustomDataset.jpg)

## Project Overview

Working with 3D point cloud data presents unique challenges in computer vision. Unlike structured data formats like images, point clouds are unordered sets of coordinates in 3D space that require specialized processing. Point cloud understanding has become critical for applications spanning autonomous driving, robotics, augmented reality, and industrial automation.

The goal of this project was to develop a computationally efficient model that could reliably detect humans in dynamic point cloud scenes, achieving:

- **Real-time processing** (< 0.1 seconds per inference)
- **Minimal parameter count** without sacrificing accuracy
- **Seamless integration** with autonomous navigation systems

Dynamic object segmentation is particularly important for several key reasons:
- Real-time navigation of dynamic environments in robotics and autonomous driving
- Improved pose estimation and static map reconstruction in modern SLAM pipelines
- Enabling safe human-robot interaction through accurate human detection and tracking

![Complete Processing Pipeline](@images/project/PointnextPipeline.jpg)

## Technical Background

### Point Cloud Processing Fundamentals

Point cloud processing networks face unique challenges due to the unordered and irregular nature of point sets. The classical PointNet++ framework established a foundation for handling this data type through hierarchical feature learning, but more recent architectures have introduced complex design patterns that increase computational demands.

Our work was motivated by a key observation: the performance gap between PointNet++ and state-of-the-art methods may be largely attributed to training strategies and model scaling rather than fundamental architectural innovations.

### PointNeXt Architecture

PointNeXt is a modern enhancement of the PointNet++ architecture that incorporates:

- **Inverted Residual MLP (InvResMLP)**: Combines residual connections, separable MLPs, and an inverted bottleneck design
- **Set Abstraction (SA) blocks**: Hierarchical feature learning through subsampling, grouping, feature extraction, and pooling
- **Feature propagation (FP) blocks**: Decoding process that upsamples and refines features

The architecture can be formulated mathematically as:

![PointNeXt Mathematical Formulation](@images/project/PointnextFormula.jpg)

Where R is the reduction function, N represents the neighborhood, p<sub>i</sub><sup>l</sup> and x<sub>i</sub><sup>l</sup> are the coordinates and features of point i at layer l, and h<sub>Θ</sub> denotes the shared MLPs.

## TinyPointNeXt Architecture

### Architectural Variants

Starting with the standard PointNeXt-S architecture as a baseline, we systematically explored multiple model variants to reduce parameters while maintaining performance:

![Model Architecture Variants](@images/project/PointnextBaseline.jpg)

1. **Model Architecture 1 & 2: Reduced MLP Width**
   - Architecture 1: Reduce the MLP width from 32 to 24
   - Architecture 2: Further reduce the MLP width from 24 to 16

![Model Architecture Variants 1 & 2](@images/project/PointnextModel12.jpg)

2. **Model Architecture 3 & 4: Reduced Set Abstraction Blocks**
   - Architecture 3: Reduce the number of Set Abstraction blocks from 6 to 5
   - Architecture 4: Further reduce the number of Set Abstraction blocks from 6 to 4

![Model Architecture Variants 3](@images/project/PointnextModel3.jpg)

![Model Architecture Variants 4](@images/project/PointnextModel4.jpg)

3. **Model Architecture 5: Reduced Set Abstraction Layers**
   - Architecture 5: Reduce the number of MLP layers in each Set Abstraction block from 2 to 1

![Model Architecture Variants 5](@images/project/PointnextModel5.jpg)

The most efficient variant achieved an 81% reduction in parameter count (from 1.36M to 0.26M) while actually improving classification accuracy by 1.19%.

### Comprehensive Training Optimization

We conducted extensive ablation studies to identify the optimal training strategies:

#### Data Augmentation Analysis

Our experiments on the HeliMOS dataset revealed significant performance differences with various augmentation strategies:

- **No augmentation**: 47.84% Overall Accuracy (OA)
- **Geometric augmentation**: 38.63% OA (random rotation, scaling, and translation)
- **Noise augmentation**: 37.15% OA (adding random noise to point coordinates)
- **Sampling augmentation**: 46.92% OA (random subsampling of points)
- **Combination of all techniques**: 69.07% OA

This demonstrated that while individual augmentations sometimes decreased performance, their combination significantly improved results (+21.23% OA), highlighting the importance of diverse data augmentation for point cloud processing.

#### Loss Function and Optimization

We implemented a Smooth Cross-Entropy loss function with label smoothing to improve model generalization:

```
L(p, g) = -1/n ∑(i=1 to n)∑(j=1 to c) y(i,j) log(softmax(p(i,j)))

where y(i,j) = {
    1 - α + α/(c-1)  if j = g(i)
    α/(c-1)          if j ≠ g(i)
}
```

With α = 0.2 as our label smoothing factor. This technique distributes a small probability mass uniformly across all non-target classes, making the model less confident about its predictions and thereby improving generalization.

For optimization, we employed the AdamW optimizer with an initial learning rate of 0.001 and implemented a cosine decay learning rate schedule, training for 100 epochs with early stopping based on validation loss.

### Custom Dataset Creation

To properly evaluate human detection performance, we created a specialized dataset consisting of:

![Human Cluster and False Positive Examples](@images/project/PointnextDynamicObject.jpg)

- **Clean Training Set**:
  - 4,614 human cluster files
  - 2,397 false positive cluster files
  - Train/Validation/Test split of 65%/17.5%/17.5%
  - Collected at Carnegie Mellon University's Mill 19

- **Difficult Test Set**:
  - 2,430 human cluster files
  - 3,321 false positive cluster files
  - Includes challenging cases with people holding or pushing objects
  - Collected at Scaife Drone Arena

Each cluster in the dataset consists of a point cloud segment with 3D coordinates (X, Y, Z) and intensity values. The human clusters contain points representing a human figure, while the false positive clusters contain points from non-human objects that were initially detected as dynamic by the Dynablox algorithm.

## Results and Performance Analysis

Our comprehensive ablation study evaluated 48 different configurations, varying training batch size, validation batch size, encoder width, encoder blocks, and set abstraction layers.

Our most optimized TinyPointNeXt variant achieved impressive results:

| Metric | Value | Comparison to Baseline |
|--------|-------|------------------------|
| Overall Accuracy | 93.98% | +1.31% |
| Human Detection Accuracy | 94.67% | +2.03% |
| False Positive Accuracy | 93.28% | +0.61% |
| Parameters | 0.2591M | -81% |
| Inference Time | 2.47ms | -17% |

The reduced models not only maintained but slightly improved the classification accuracy compared to the default PointNeXt-S architecture. This suggests that the original model may be overparameterized for this specific task, and the reduced variants are better suited for human detection in point clouds.

The 4-Block Encoder variant achieved the most significant reduction in both run time and model parameters, with only 0.2591M parameters (approximately 19% of the default model size) and an inference time of 2.47ms (approximately 17% faster than the default model).

## Integration and Deployment

The TinyPointNeXt model is integrated into a complete pipeline for dynamic environment understanding:

1. **Input**: Raw point cloud data from Ouster LiDAR (with position (X, Y, Z) and intensity channels) and LiDAR-IMU-INIT state estimates
2. **Dynablox processing**: Extraction of dynamic clusters from the point cloud using Dynablox
3. **TinyPointNeXt classification**: Classification of dynamic clusters as either humans or false positives
4. **Post-processing**: Removal of false positive clusters
5. **Output**: Visualization of the dynamic environment with accurately identified humans

This pipeline enables real-time human detection in complex environments, crucial for applications like autonomous navigation and human-robot interaction.

## Significance and Applications

The efficiency gains achieved with TinyPointNeXt have significant practical implications:

- **Mobile and Embedded Deployment**: The reduced model size and inference time make TinyPointNeXt suitable for deployment on resource-constrained platforms such as mobile robots, drones, and autonomous vehicles
- **Real-time Processing**: The faster inference time enables real-time human detection in dynamic environments, which is crucial for safety-critical applications
- **Energy Efficiency**: Smaller models consume less energy, extending the battery life of mobile platforms
- **Cost-effective Scaling**: The efficiency gains enable deployment on more affordable hardware, reducing the overall system cost

Our findings challenge the conventional wisdom that more complex models are always better, suggesting that for specialized tasks like human detection in point clouds, thoughtfully designed smaller models can achieve superior performance while being more computationally efficient.

## Future Directions

Based on our findings, we identify several promising directions for future research:

- **Transfer learning exploration**: Investigating whether the improved training strategies and architectural modifications transfer effectively to other point cloud tasks
- **Classification of different objects**: Extending TinyPointNeXt to classify multiple object categories beyond humans
- **Temporal modeling**: Incorporating temporal information across sequential point cloud frames to improve robustness in tracking
- **Hardware-aware optimizations**: Further tailoring the model architecture for specific hardware platforms
- **Dynamic scaling**: Developing approaches that adaptively adjust model capacity based on input characteristics

<!-- ![Human and False Positive Clusters](@images/projects/ClusterVisualization.jpg) -->

## Conclusion

TinyPointNeXt demonstrates that substantial efficiency improvements can be achieved without sacrificing performance through careful architectural design. By revisiting and enhancing the PointNeXt architecture with improved training procedures and strategic architectural modifications, we've developed a specialized model that excels at human detection in point clouds while requiring significantly fewer computational resources.

This work establishes stronger baselines and design principles for point cloud processing networks, emphasizing the importance of training strategies and efficient scaling approaches in developing high-performance solutions for 3D understanding tasks. The success of our relatively simple architecture suggests that future research in this domain should consider both training procedures and architectural design holistically, potentially leading to more efficient and effective solutions for 3D understanding tasks, particularly in resource-constrained application scenarios.

---