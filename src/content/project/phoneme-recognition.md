---
title: "Phoneme Recognition: Neural Networks for Speech Classification"
date: "2025-02"
status: "completed"
image: "/images/project/IDLHW1Spectogram2.jpg"
description: "A frame-level phoneme classifier for speech built only from fully connected layers, using a 1.29-second context window and a diamond-shaped MLP to reach 86% validation accuracy."
tags: ["deep learning", "speech recognition", "neural networks", "pytorch", "signal processing", "machine learning"]
kaggle: "https://www.kaggle.com/competitions/11785-spring-25-hw-1-p-2"
---

This was the first homework of Carnegie Mellon's 11-785 Introduction to Deep Learning in Spring 2025: label every 10 ms frame of a speech recording with the phoneme being spoken, using nothing but a **multilayer perceptron**. No convolutions, no recurrence, no attention, and a cap of 20 million parameters. My best model reached **86.0% validation accuracy**.

Because this is course work, this page describes the design, the experiments and what I learned, not the implementation itself.

![A speech spectrogram with one frame and its context highlighted](@images/project/IDLHW1Spectogram3.jpg)

## The Problem

Each utterance arrives as a matrix of shape (T, 28): one row per 10 ms frame, each row 28 MFCC-style coefficients describing the spectrum of the audio in a 25 ms window. Every frame has a phoneme label, and the job is to predict that label for every frame in the test set.

The catch is that a single frame says very little. 10 ms of audio is a fraction of a phoneme, many phonemes look almost identical over that span, and the same sound changes shape depending on what comes before and after it. An MLP has no built-in notion of time, so all of that context has to be handed to it explicitly.

## Context Windows

The most important design choice was how much surrounding audio each prediction sees. Instead of classifying a frame on its own, the model is given the frame plus *k* frames on each side, flattened into one long input vector. For frames near the start or end of an utterance, the missing context is zero-padded.

I settled on **64 frames on each side**: 129 frames, or about 1.29 seconds of speech, around every prediction. With 28 coefficients per frame, that is a 3,612-dimensional input. Early runs with 30 to 48 frames of context topped out lower, and the gains from more context were the clearest signal in my whole experiment log.

## Model

The final network is what I called a **diamond** MLP, because the hidden layers widen and then narrow:

| Layer | Width |
|---|---|
| Input (129 frames x 28 coefficients) | 3,612 |
| Hidden 1 | 1,024 |
| Hidden 2 | 4,096 |
| Hidden 3 | 2,048 |
| Hidden 4 | 1,024 |
| Output | one score per phoneme |

Each hidden layer is a linear layer followed by batch normalization, a **GELU** activation and dropout of 0.25. I compared this against a constant-width "cylinder" network and an "inverse pyramid" that only gets wider. In my short comparison runs at the same context size, the diamond scored a point or two higher, so it became the base for every long run.

## Training

- **Normalization:** cepstral mean normalization, subtracting each coefficient's mean over the utterance. This removes much of the fixed coloration a particular microphone or room adds to every frame.
- **Augmentation:** frequency masking and time masking on the context window, applied to about 70% of batches, so the model cannot rely on a single band of coefficients or a single moment of audio.
- **Initialization:** Kaiming normal initialization for every linear layer.
- **Regularization:** dropout, batch normalization, and AdamW-style weight decay of 0.05.
- **Schedule:** I started with `ReduceLROnPlateau` and moved to a fixed step schedule that halves the learning rate on a set interval, which gave steadier long runs.
- **Mixed precision** training on a single T4 GPU.

![MFCC features with time and frequency masking applied](@images/project/IDLHW1Spectogram.jpg)

![Another masked training example](@images/project/IDLHW1Spectogram2.jpg)

## Results

I tracked 53 runs in Weights & Biases. A few patterns stood out:

- **Early runs** with a cylinder network, ReLU and smaller contexts sat between roughly 40% and 70% validation accuracy.
- **Switching to the diamond network with GELU and a 64-frame context** pushed short runs into the high 70s and low 80s.
- **Training on the full dataset for longer** did the rest. Runs of 72, 100, 152 and 172 epochs landed at 85.8%, 85.9%, 85.9% and **86.0%**, so by the end, extra epochs were buying only fractions of a point.

The best run trained for 172 epochs, about 12.4 hours, and finished at 86.02% validation accuracy with training accuracy almost exactly the same, a good sign the regularization was doing its job.

## What I Took Away

The lesson I keep coming back to is that the model has no idea time exists until you tell it. Almost every big improvement came from the input, not the network: more context, better normalization and augmentation. The architecture work mattered, but it mattered less than making sure each prediction could see enough of the sentence around it. It was also good motivation for the rest of the course, where convolutions, recurrence and attention build that sense of time into the model itself.

## Links
- [Kaggle Competition](https://www.kaggle.com/competitions/11785-spring-25-hw-1-p-2)
