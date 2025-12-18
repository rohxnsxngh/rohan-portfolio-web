---
title: "Carnegie Mellon University: Intro to Deep Learning"
date: "2025-03"
author: "Rohan Singh"
image: "/images/blog/cmu-cv.jpg"
status: "Published"
description: "My journey through CMU's world renowned Intro to Deep Learning class, focused on unraveling the black box and exploring a techniques in deep learning, and model training best practices."
tags: ["model training", "deep learning", "education", "research", "CMU 11-785", "autograd"]
---

# Carnegie Mellon University: Intro to Deep Learning (11-785)

I definitely underestimated this class. Like seriously underestimated it. When I signed up for Introduction to Deep Learning (11-785) at CMU, I thought it would be challenging but manageable. I was wrong. This class ended up consuming about 20 hours of my week, sometimes more. To put that in perspective, that's comparable to the time I spent on Operating Systems, which is notorious for being one of the hardest classes at CMU.

## About the Course

The course is taught by Professor Bhiksha Raj, who is genuinely one of the kindest and most passionate professors I have had. You can tell he absolutely loves deep learning and wants everyone to understand it at a fundamental level. The way he explains concepts makes you feel like you're uncovering the secrets behind how AI actually works, not just using libraries blindly.

The course covers everything you need to know about deep learning. We started with feedforward neural networks and progressively moved into more complicated concepts like attention mechanisms and sequence to sequence models. By the end of the course, you have a solid understanding of:

- Feedforward Neural Networks (MLPs)
- Convolutional Neural Networks (CNNs)
- Recurrent Neural Networks (RNNs, LSTMs, GRUs)
- Transformer Networks and Self-Attention
- Generative Adversarial Networks (GANs)

## The Assignment Structure

Here's where things get intense. Each homework assignment is split into two parts, and both are equally demanding.

**Part 1: Autolab (The PyTorch Recreation)**

In the first part, you recreate components of PyTorch from scratch. Yeah, you read that right. You're essentially building your own deep learning library. This means implementing forward and backward propagation, loss functions, optimizers, everything. It's brutal but incredibly educational. You really learn how everything works under the hood when you have to code it yourself.

**Part 2: Kaggle Competition**

The second part is a Kaggle competition where you apply what you learned to real world problems. This is where you get your hands dirty with actual data science work, tuning hyperparameters, trying different architectures, and competing against your classmates for leaderboard positions. The competitive aspect makes it fun but also stressful when you're trying to squeeze out that extra 0.5% accuracy at 3am.

## Homework 1: MLP and Phoneme Recognition

The first homework eases you in (relatively speaking). 

For Part 1, I implemented the building blocks for a Multi-Layer Perceptron from scratch. This included activation functions, Mean Squared Error and Cross Entropy loss functions, Stochastic Gradient Descent, and Batch Normalization. It sounds simple but getting the gradients right for backpropagation was painful. I spent hours debugging why my network wasn't learning only to find I had a sign error in my gradient calculation.

Part 2 was the Kaggle challenge for frame level classification of speech. The dataset consisted of audio recordings from Wall Street Journal articles that were read aloud and labeled with phoneme states. The task was to identify the phoneme state label for each frame in the test dataset. The tricky part was that utterances were of variable length, so you had to think about how to handle that properly.

## Homework 2: CNN for Face Recognition

Part 1 had us implementing Convolutional Neural Networks from scratch. This meant coding forward and backward propagation through convolutional layers, pooling layers, and resampling layers. The math for convolution backpropagation is honestly pretty intense, and I definitely had to review my calculus.

Part 2 was face classification and verification. Given an image of a person's face, the system had to predict the ID of the face. This was an N-way classification problem with a pretty large number of classes. Getting good accuracy required trying different architectures, data augmentation techniques, and a lot of patience. I remember spending entire weekends tweaking my model architecture.

## Homework 3: RNN and Utterance to Phoneme Mapping

This is where things got really hard. Part 1 involved implementing Recurrent Neural Networks, LSTM layers, and GRU layers from scratch. The backpropagation through time made my brain hurt. There are so many gradients to track and the implementation is way more complex than a feedforward network.

Part 2 was the Kaggle challenge for utterance to phoneme mapping. The interesting twist here was that we had unaligned labels. This means the correlation between the features and labels wasn't given explicitly. You had a list of phonemes for each utterance, but not which frames corresponded to which phonemes. We had to use Connectionist Temporal Classification (CTC) and beam search to handle this. I had never dealt with CTC before and the learning curve was steep.

## Homework 4: Transformers and Attention

The final homework was all about transformers. Part 1 had us implementing the building blocks for a Transformer Network from scratch, including the self-attention mechanism. We also had to complete next token prediction and sequence generation functions. The attention mechanism is beautiful once you understand it, but getting there took a while.

Part 2 was training a neural language model and then doing a speech to text transcription challenge using attention mechanisms. We used a combination of RNNs, CNNs, and Dense Networks to design a system that could transcribe speech utterances to text. This was probably the most satisfying assignment because you could actually see your model generating text from audio, which felt like magic.

## My Honest Experience

This class was really hard. I'm not going to sugarcoat it. There were multiple times I questioned my life choices and wondered if I would even finish the assignments on time. The workload is no joke, and you need to be prepared to dedicate a significant portion of your week to this class.

That being said, I learned more from this class than almost any other class I have taken at CMU. The Part 1 assignments gave me a deep understanding of how neural networks actually work. I'm not just talking about a surface level understanding. I mean I can now explain exactly what happens during backpropagation through an LSTM or how the gradient flows through a convolutional layer. The Part 2 assignments taught me how to apply these concepts to real world problems, which is equally important.

Having friends in the class helped a lot. We would work together, debug each other's code, and share ideas for the Kaggle competitions. I don't think I would have survived without them honestly. If you're planning to take this class, I highly recommend finding a study group early on.

Professor Bhiksha Raj made the experience much better. His lectures were engaging and he was always willing to help during office hours. You could tell he wanted everyone to succeed and learn the material properly, not just memorize formulas.

## Should You Take This Class?

If you're serious about understanding deep learning and you're willing to put in the work, absolutely take this class. You'll come out with a solid foundation in deep learning that will give you a significant advantage whether you're going into research or industry. Just make sure you go in with realistic expectations about the time commitment. This is not an easy class, but it's worth it.

Also, clear your schedule. You're going to need those 20+ hours per week. And maybe stock up on coffee.
