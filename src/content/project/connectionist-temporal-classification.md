---
title: "Automatic Speech Recognition with RNN and CTC Beam Search"
date: "2025-04"
status: "completed"
image: "/images/project/IDLHW3RNNEncoder.jpg"
description: "A pyramidal bidirectional LSTM trained with CTC loss to transcribe speech into phoneme sequences without frame-level alignments, decoded with CTC beam search to a validation edit distance of about 4.7 phonemes per utterance."
tags: ["deep learning", "speech recognition", "RNN", "LSTM", "CTC", "beam search", "audio processing"]
kaggle: "https://www.kaggle.com/competitions/hw-3-p-2-automatic-speech-recognition-asr-11-785"
---

This was the third homework of Carnegie Mellon's 11-785 Introduction to Deep Learning in Spring 2025. In the first homework, every audio frame came with its own phoneme label. Here that crutch is gone: each utterance comes with only the **sequence** of phonemes that was spoken, with no indication of which frames belong to which phoneme. The model has to learn the alignment on its own, and the tool that makes that possible is **Connectionist Temporal Classification (CTC)**.

Because this is course work, this page describes the design, the experiments and what I learned, not the implementation itself.

![From audio frames to a phoneme sequence](@images/project/IDLHW3AudioToPhoneme.jpg)

## Why Alignment Is the Hard Part

An utterance might be several hundred frames long and contain only a few dozen phonemes. Each phoneme stretches over a variable number of frames, there are pauses between words, and the same phoneme can legitimately appear twice in a row. Hand-labeling every frame is expensive, which is exactly why real speech datasets usually do not have those labels.

CTC sidesteps the problem by never committing to one alignment:

1. At every frame the network outputs a probability over the phonemes plus one extra symbol, the **blank**.
2. A frame-level path is turned into a transcript by **merging repeated symbols and then removing blanks**. Many different paths collapse to the same transcript, and the blank is what lets the model write a genuine double phoneme: two copies separated by a blank survive the merge.
3. The loss is the negative log of the **total probability of every path** that collapses to the correct transcript. A forward-backward dynamic program sums over all those paths efficiently, the same way an HMM sums over hidden state sequences.

The network is never told where a phoneme starts or ends. It is only rewarded for putting probability mass on paths that spell the right answer.

![CTC collapses many frame-level paths into one transcript](@images/project/IDLHW3CTC.jpg)

## The Model

The network is an encoder that turns MFCC frames into a shorter sequence of rich features, followed by a small classifier that turns each feature into phoneme probabilities.

- **Input:** 28 MFCC coefficients per frame, normalized per utterance to zero mean and unit variance in each coefficient.
- **Convolutional front end:** two 1D convolutions (kernel size 3, widening from 28 to 128 to 256 channels) with batch normalization, which pick up local spectral patterns across neighboring frames.
- **Bidirectional LSTM:** two stacked BiLSTM layers read the whole utterance forward and backward, so every frame's representation depends on the context on both sides.
- **Pyramidal BiLSTM:** two more BiLSTM layers that each concatenate pairs of adjacent frames before processing, halving the sequence length each time. After both, the encoder runs at a quarter of the input frame rate. That cuts computation, and it brings the number of output steps much closer to the number of phonemes, which makes the CTC alignment easier to learn. The one requirement is that the shortened sequence must still be at least as long as the transcript, or CTC has no valid path.
- **Classifier:** batch normalization and a three-layer MLP (512, 256, then the 41 output symbols: 40 phonemes plus blank), with a log-softmax for the CTC loss.

Dropout of 0.2 sits between the LSTM layers, after each pyramidal layer and inside the classifier. Variable-length utterances are padded and **packed**, so the LSTMs never process padding, and the sequence lengths are tracked through every downsampling step because CTC needs the true output length of each utterance.

![The pyramidal BiLSTM encoder](@images/project/IDLHW3RNNEncoder.jpg)

## Training

- **Loss:** CTC, with the blank as its own output class.
- **Optimizer:** AdamW with weight decay of 1e-5, and a `ReduceLROnPlateau` schedule that halves the learning rate when validation distance stops improving for two epochs.
- **Augmentation:** random frequency masking and time masking on the MFCCs, in the style of SpecAugment, so the model cannot depend on any single coefficient band or short stretch of audio.
- **Mixed precision** training, for faster runs on a single GPU.

## Decoding with Beam Search

The network's output is a probability for every symbol at every step, not a transcript. The simplest way to read it is **greedy decoding**: take the most likely symbol at every step, then merge and remove blanks. That misses the point of CTC, though, because the most likely single path is not necessarily the most likely transcript. A transcript that many moderately likely paths collapse to can beat one supported by a single strong path.

**CTC beam search** fixes that by working in transcript space. It keeps the top few candidate prefixes at each step, tracking for each prefix the probability that it currently ends in a blank and the probability that it ends in its last phoneme. Keeping those two apart is what lets it merge paths correctly: extending a prefix with the same phoneme it already ends with means "still the same phoneme" after a non-blank, but "a new copy of it" after a blank. Prefixes that turn out to be identical are merged by adding their probabilities, and the list is pruned back to the beam width.

I used torchaudio's GPU CTC beam search decoder with a narrow beam of 3 during training, to keep validation cheap, and a beam of 10 for the final test predictions.

## Results

The metric is the **Levenshtein distance** between the predicted and true phoneme sequences: the number of insertions, deletions and substitutions needed to turn one into the other, averaged over utterances. Lower is better.

I tracked about 30 runs in Weights & Biases. My first runs used learning rates that were far too small and stalled with validation distances between 16 and 26. Moving the learning rate up into the 1e-4 to 1e-3 range and training longer brought the distance down to around 10, and the final full-length runs landed between **4.7 and 5.4**, with the best at about **4.73** using a learning rate of 1e-4.

## What I Took Away

CTC is the first loss I used that marginalizes over something the data does not tell you, and once that clicked, the rest of the design followed from it. The pyramidal layers exist to make that marginalization tractable and the alignment easier. Packing and length tracking exist because the loss needs the true lengths. Beam search exists because the loss scores transcripts, not paths. The biggest practical lesson was less exciting: most of my improvement came from fixing the learning rate and training long enough, not from changing the architecture.

## Project Links
- [Kaggle Challenge](https://www.kaggle.com/competitions/hw-3-p-2-automatic-speech-recognition-asr-11-785)
