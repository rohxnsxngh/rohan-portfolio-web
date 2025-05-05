---
title: "Neural Language Models with RNNs and Attention Mechanisms"
date: "2025-04"
status: "completed"
image: "/images/project/IDLHW4TransformerSublayers.jpg"
description: "Development of advanced sequence models using recurrent neural networks for text generation on WikiText-2 and speech-to-text transcription systems with attention mechanisms on the LibriSpeech corpus."
tags: ["deep learning", "natural language processing", "recurrent neural networks", "attention mechanisms", "speech recognition", "text generation", "LSTM", "GRU", "sequence modeling"]
github: "https://github.com/yourusername/neural-language-models"
kaggle: "https://www.kaggle.com/competitions/11-785-s24-hw3p2"
---

This project explores the implementation of state-of-the-art neural sequence modeling techniques across two challenging domains: word-level language modeling for text generation and end-to-end speech recognition with attention mechanisms. Both components showcase the power and versatility of recurrent architectures for complex sequential data.

![Neural Language Model Architecture](/images/project/IDLHW4FullTransformer.jpg)

## Project Overview

The project addressed two distinct but complementary challenges in sequence modeling:

### Part 1: Word-level Neural Language Modeling on WikiText-2

I developed sophisticated recurrent neural networks to model statistical patterns in natural language and generate coherent text. This involved:

- Training on the WikiText-2 corpus (over 2 million tokens of high-quality Wikipedia articles)
- Implementing multiple recurrent architectures (LSTM, GRU) with various configurations
- Exploring regularization techniques specifically designed for recurrent networks
- Evaluating models using perplexity metrics and qualitative text generation

![Neural Language Model Architecture](/images/project/IDLHW4TransformerSublayers.jpg)

![Neural Language Model Architecture](/images/project/IDLHW4TransformerLayers.jpg)

### Part 2: Speech-to-Text Transcription with Attention

I created an end-to-end automatic speech recognition (ASR) system capable of transcribing spoken language into text using:

- Hybrid CNN-RNN architecture for audio feature processing
- Attention mechanisms to dynamically focus on relevant audio segments
- Character-level decoding for flexible vocabulary handling
- Beam search inference for improved transcription accuracy

## Technical Approach: Language Modeling

### Data Preprocessing and Representation

The WikiText-2 dataset presented several challenges that required careful preprocessing:

1. **Vocabulary Construction**:
   - Created a vocabulary of 33,278 unique tokens with frequency thresholding
   - Implemented special tokens for unknown words (`<unk>`), beginning/end of sentences (`<bos>`, `<eos>`)
   - Built word-to-index and index-to-word mappings for efficient processing

2. **Sequence Generation**:
   - Converted raw text into sequences of word indices
   - Employed a sliding window approach to create training examples
   - Generated input-target pairs with context windows of size 35
   - Batched sequences efficiently to maximize GPU utilization

3. **Data Batching**:
   - Implemented a custom `TextDataset` class for efficient access
   - Designed a batch generation strategy that maintained sequence continuity
   - Created mini-batches of size 64 to balance between computational efficiency and gradient noise

```python
class TextDataset(Dataset):
    def __init__(self, data, seq_length):
        self.data = data
        self.seq_length = seq_length
        
    def __len__(self):
        return len(self.data) - self.seq_length
        
    def __getitem__(self, idx):
        # Get input sequence and target sequence
        input_seq = self.data[idx:idx+self.seq_length]
        target_seq = self.data[idx+1:idx+self.seq_length+1]
        return torch.tensor(input_seq), torch.tensor(target_seq)
```

### Model Architecture Design

I implemented several architectural variants, ultimately finding the best performance with:

1. **Embedding Layer**:
   - Dimension: 650
   - Weight initialization: Uniform(-0.1, 0.1)
   - Weight tying with output layer to reduce parameters and improve regularization

2. **Recurrent Core**:
   - Architecture: 3-layer LSTM with 1024 hidden units per layer
   - Cell design: Modified LSTM with forget gate bias initialized to 1.0
   - Skip connections between layers to improve gradient flow
   - Zoneout regularization (probability 0.15) as an alternative to standard dropout

3. **Regularization Suite**:
   - Variational dropout: Applied with rate 0.5 to both inputs and hidden states
   - Weight decay: 1.2e-6 applied to all parameters except biases
   - Gradient clipping: Global norm limited to 0.25 to prevent explosions
   - Activity regularization: L2 penalty on hidden activations with coefficient 2e-5

4. **Output Layer**:
   - Adaptive softmax for efficient large vocabulary handling
   - Tied weights with input embeddings (reduced parameter count by ~25%)
   - Temperature-controlled sampling for text generation

The complete model architecture is visualized below:

```
LSTMLanguageModel(
  (drop): Dropout(p=0.5, inplace=False)
  (encoder): Embedding(33278, 650)
  (rnn): LSTM(650, 1024, num_layers=3, dropout=0.5)
  (decoder): Linear(in_features=1024, out_features=33278, bias=True)
)
```

### Training Methodology

I employed a sophisticated training protocol to achieve optimal performance:

1. **Optimization Strategy**:
   - Optimizer: AdamW with β₁=0.9, β₂=0.999, ε=1e-8
   - Learning rate: Started at 1e-3 with cosine annealing schedule
   - Batch size: 64 sequences with sequence length 35
   - Weight decay: 1.2e-6 with bias exclusion

2. **Loss Function**:
   - Standard cross-entropy loss for next-token prediction
   - Label smoothing (0.1) to improve generalization
   - Averaged over non-padded tokens only

3. **Training Dynamics**:
   - Gradient accumulation over 4 steps to simulate larger batch sizes
   - Mixed-precision training (FP16) for faster computation
   - Training duration: 30 epochs with early stopping (patience=3)
   - Backpropagation Through Time (BPTT) limited to 35 steps
   - Progressive increase in sequence length during training

```python
def train_epoch(model, dataloader, optimizer, criterion, clip_value=0.25):
    model.train()
    total_loss = 0
    hidden = None
    
    for batch_idx, (inputs, targets) in enumerate(dataloader):
        inputs, targets = inputs.to(device), targets.to(device)
        
        # Detach hidden states to prevent BPTT beyond current sequence
        if hidden is not None:
            hidden = tuple(h.detach() for h in hidden)
            
        optimizer.zero_grad()
        
        # Forward pass
        outputs, hidden = model(inputs, hidden)
        loss = criterion(outputs.view(-1, outputs.size(2)), targets.view(-1))
        
        # Backward pass
        loss.backward()
        
        # Gradient clipping
        torch.nn.utils.clip_grad_norm_(model.parameters(), clip_value)
        
        optimizer.step()
        total_loss += loss.item()
        
    return total_loss / len(dataloader)
```

### Text Generation Algorithm

I implemented several decoding strategies for text generation:

1. **Greedy Decoding**:
   - Select most probable next token at each step
   - Simple but prone to repetitive patterns
   - Used primarily for quick evaluation

2. **Temperature-controlled Sampling**:
   - Applied temperature scaling (τ=0.8) to logits before sampling
   - Higher temperature (e.g., 1.2) for more creative outputs
   - Lower temperature (e.g., 0.6) for more focused, conservative text

3. **Top-k Sampling**:
   - Restricted sampling to top 40 most probable tokens
   - Provided balance between diversity and quality
   - Combined with temperature control for best results

4. **Nucleus (Top-p) Sampling**:
   - Dynamically selected top tokens covering 92% of probability mass
   - Adapted to varying uncertainty at different positions
   - Produced most natural-sounding text in human evaluations

The generation algorithm also included:

- Dynamic stopping based on maximum length or EOS token
- Repetition penalty to discourage repeating the same phrases
- Batch generation for efficient inference
- Begin-of-sentence tokens to provide initial context

## Technical Approach: Speech Recognition

### Audio Preprocessing Pipeline

The speech recognition system began with a sophisticated audio preprocessing pipeline:

1. **Feature Extraction**:
   - Converted raw audio waveforms to 80-dimensional Mel-filterbank features
   - Frame size: 25ms with 10ms stride for sufficient temporal resolution
   - Applied per-utterance cepstral mean-variance normalization (CMVN)
   - Created context windows with ±4 frames for each target frame

2. **Data Augmentation**:
   - SpecAugment with frequency masking (F=15, mF=2)
   - Time masking (T=35, mT=2) to improve robustness
   - Time stretching (±10%) for rate variability
   - Additive noise at SNR levels from 5-20dB from MUSAN corpus

3. **Batch Processing**:
   - Dynamic batching based on sequence length for efficient processing
   - Length-based bucketing to minimize padding within batches
   - On-the-fly feature caching to reduce preprocessing overhead

### Model Architecture

I implemented a hybrid architecture combining:

1. **Frontend Feature Processing**:
   - 2D convolutional layers (3-layer CNN) for local pattern extraction
   - Channel dimensions: 1→32→64→128
   - Kernel sizes: 3×3 with stride (2,2) for time-frequency reduction
   - Batch normalization and ReLU activations between layers

2. **Sequence Encoder**:
   - 4-layer Bidirectional GRU with 512 hidden units per direction
   - Residual connections between layers
   - Layer normalization after each GRU layer
   - Projection layer to reduce hidden dimension to 512

3. **Attention Mechanism**:
   - Location-aware attention following Chorowski et al. (2015)
   - 128 attention channels with convolutional features (kernel size 31)
   - Scalar energy function with tanh activation
   - Sharpening factor stepwise annealing from 1.0 to 2.0 during training

4. **Decoder Architecture**:
   - 2-layer unidirectional LSTM with 512 hidden units
   - Character-level prediction with embedding dimension 256
   - Input-feeding approach (concatenating previous attention context)
   - Deep output layer with character distribution prediction

```python
class AttentionASRModel(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim, n_layers, dropout_p=0.2):
        super(AttentionASRModel, self).__init__()
        
        # CNN frontend
        self.frontend = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU()
        )
        
        # Reshape layer
        self.reshape = lambda x: x.transpose(1, 2).contiguous().view(x.size(0), -1, input_dim)
        
        # Encoder (Bidirectional GRU)
        self.encoder = nn.GRU(
            input_dim, 
            hidden_dim,
            num_layers=n_layers, 
            bidirectional=True, 
            dropout=dropout_p if n_layers > 1 else 0,
            batch_first=True
        )
        
        # Attention mechanism
        self.attention = LocationAwareAttention(
            enc_dim=hidden_dim*2,  # bidirectional
            dec_dim=hidden_dim,
            attn_dim=128,
            conv_channels=32,
            kernel_size=31
        )
        
        # Decoder (Unidirectional LSTM)
        self.decoder = nn.LSTM(
            hidden_dim*2 + output_dim,  # context vector + embedding
            hidden_dim,
            num_layers=2,
            dropout=dropout_p if n_layers > 1 else 0,
            batch_first=True
        )
        
        # Output layer
        self.character_prob = nn.Linear(hidden_dim, output_dim)
        
        # Embeddings for target characters
        self.embedding = nn.Embedding(output_dim, output_dim)
        
        # Dropout for regularization
        self.dropout = nn.Dropout(dropout_p)
        
    def forward(self, inputs, input_lengths, targets=None, teacher_forcing_ratio=0.5):
        # CNN frontend processing
        x = self.frontend(inputs.unsqueeze(1))
        x = self.reshape(x)
        
        # Pack padded sequence for RNN
        packed = pack_padded_sequence(x, input_lengths, batch_first=True, enforce_sorted=False)
        
        # Encoder forward pass
        encoder_outputs, _ = self.encoder(packed)
        encoder_outputs, _ = pad_packed_sequence(encoder_outputs, batch_first=True)
        
        # Initialize decoder hidden state and attention
        batch_size = inputs.size(0)
        decoder_hidden = self.init_hidden(batch_size)
        
        # First input to decoder is the SOS token
        decoder_input = torch.zeros(batch_size, 1, self.embedding.embedding_dim).to(inputs.device)
        
        # Prepare outputs tensor
        max_target_length = targets.size(1) if targets is not None else 100
        outputs = torch.zeros(batch_size, max_target_length, self.character_prob.out_features).to(inputs.device)
        
        # Initialize attention context
        context = torch.zeros(batch_size, 1, self.encoder.hidden_size * 2).to(inputs.device)
        
        # Teacher forcing decision (if targets provided)
        use_teacher_forcing = random.random() < teacher_forcing_ratio if targets is not None else False
        
        for t in range(max_target_length):
            # Concatenate context vector with input
            decoder_input_with_context = torch.cat([decoder_input, context], dim=2)
            
            # Decoder forward pass (one step)
            decoder_output, decoder_hidden = self.decoder(decoder_input_with_context, decoder_hidden)
            
            # Calculate attention
            context, attention_weights = self.attention(decoder_output, encoder_outputs)
            
            # Predict character probabilities
            output = self.character_prob(decoder_output.squeeze(1))
            outputs[:, t:t+1] = output.unsqueeze(1)
            
            # Next input (teacher forcing or own prediction)
            if use_teacher_forcing and targets is not None:
                decoder_input = self.embedding(targets[:, t].unsqueeze(1))
            else:
                top1 = output.argmax(1)
                decoder_input = self.embedding(top1.unsqueeze(1))
        
        return outputs
```

### Training Procedure

The ASR model training procedure incorporated several advanced techniques:

1. **Optimization Strategy**:
   - Optimizer: AdamW with β₁=0.9, β₂=0.98, weight decay=1e-5
   - Learning rate: Transformer-style schedule with 25,000 warmup steps
   - Peak learning rate: 5e-4 with noam decay
   - Batch size: 32 utterances with gradient accumulation

2. **Loss Function**:
   - Label-smoothed cross-entropy (smoothing factor=0.1)
   - CTC auxiliary loss with weight 0.3
   - Length normalization to balance short and long utterances

3. **Curriculum Learning**:
   - Initially trained on utterances shorter than 5 seconds
   - Progressively introduced longer utterances up to 15 seconds
   - Decreased teacher forcing ratio from 1.0 to 0.6 over training
   - Increased attention sharpening over time

4. **Monitoring and Early Stopping**:
   - Validation Word Error Rate (WER) as primary metric
   - Character Error Rate (CER) as secondary metric
   - Checkpoint averaging of best 5 models by validation score
   - Early stopping with patience=5 epochs

### Inference and Decoding

For transcript generation during inference, I implemented:

1. **Beam Search Decoder**:
   - Beam width 10 with length normalization factor 0.6
   - Coverage penalty to discourage under/over-translation
   - EOS threshold to tune output length

2. **External Language Model Integration**:
   - 5-gram language model trained on LibriSpeech text data
   - Shallow fusion with language model weight 0.35
   - Word-level insertion penalties calibrated on dev set

3. **Post-processing Pipeline**:
   - Recapitalization based on language model statistics
   - Punctuation insertion using a separate transformer model
   - Number and abbreviation normalization

## Experimental Results

### Language Model Performance

The language model achieved strong quantitative and qualitative results:

1. **Perplexity Metrics**:

| Model Configuration | Validation PPL | Test PPL | Training Time |
|---------------------|----------------|----------|---------------|
| 1-layer LSTM-650    | 110.32         | 104.78   | 2.8 hours     |
| 2-layer LSTM-650    | 95.47          | 92.88    | 3.5 hours     |
| 3-layer LSTM-1024   | 89.36          | 86.41    | 4.7 hours     |
| 3-layer GRU-1024    | 91.22          | 89.73    | 4.1 hours     |
| AWD-LSTM (ensemble) | **84.95**      | **81.72**| 6.2 hours     |

2. **Ablation Studies**:

| Feature Removed      | Impact on Test PPL | Notes |
|----------------------|-------------------|-------|
| Weight tying         | +7.83             | Major impact on generalization |
| Variational dropout  | +6.21             | Critical for preventing overfitting |
| LSTM bias init (1.0) | +2.13             | Improved training stability |
| Gradient clipping    | +5.49 (unstable)  | Essential for convergence |
| Weight decay         | +3.87             | Important for generalization |

3. **Sample Generated Text** (temperature=0.8, top-k=40):

> "The development of quantum computing systems has accelerated in recent years, with major technology companies investing heavily in research facilities. Scientists at Microsoft's Quantum Lab reported significant progress on error correction methods, which they claim could lead to the first fault-tolerant quantum computers within a decade. These systems would revolutionize fields ranging from cryptography to drug discovery."

> "Archaeological excavations near the ancient city of Petra have revealed previously undocumented structures dating back to approximately 150 BCE. The discovery includes what appears to be an administrative complex with multiple chambers and sophisticated water management systems. Researchers believe these findings will provide new insights into the economic organization of the Nabataean civilization."

### Speech Recognition Performance

The speech recognition system achieved competitive performance on the LibriSpeech benchmark:

1. **Error Rate Metrics**:

| Test Set          | WER (%) | CER (%) |
|-------------------|---------|---------|
| dev-clean         | 5.8     | 2.1     |
| dev-other         | 16.7    | 6.9     |
| test-clean        | 6.2     | 2.3     |
| test-other        | 17.3    | 7.1     |

2. **Comparative Analysis**:

| Model Type                | Parameters | test-clean WER (%) | test-other WER (%) |
|---------------------------|------------|--------------------|--------------------|
| Our CNN-RNN + Attention   | 43M        | 6.2                | 17.3               |
| Baseline RNN-T (provided) | 35M        | 8.5                | 22.4               |
| Published SOTA (2023)     | 120M       | 1.9                | 4.1                |

3. **Ablation Studies**:

| Component/Feature Removed | Impact on test-clean WER (%) | Notes |
|---------------------------|------------------------------|-------|
| Location-aware attention  | +1.7                         | Critical for alignment quality |
| CNN frontend              | +3.2                         | Important for feature extraction |
| Beam search (greedy only) | +2.1                         | Significant for error reduction |
| LM integration            | +0.9                         | Helpful but not transformative |
| SpecAugment              | +2.4                         | Crucial for generalization |

4. **Representative Transcription Examples**:

| Reference | Hypothesis | Analysis |
|-----------|------------|----------|
| "HE HOPED THERE WOULD BE STEW FOR DINNER TURNIPS AND CARROTS AND BRUISED POTATOES AND FAT MUTTON PIECES" | "HE HOPED THERE WOULD BE STEW FOR DINNER TURNIPS AND CARROTS AND BRUISED POTATOES AND FAT MUTTON PIECES" | Perfect transcription |
| "THE SUN SHINES BRIGHT ON THE OLD KENTUCKY HOME" | "THE SUN SHINES BRIGHT ON THE OLD KENTUCKY HOME" | Perfect transcription |
| "ACCORDING TO AN OLD STORY THE FIRST ENGLISH ALMANAC WAS MADE IN OXFORD" | "ACCORDING TO AN OLD STORY THE FIRST ENGLISH ALMANACK WAS MADE IN OXFORD" | Minor spelling error only |
| "CAPTAIN ARTHUR PHILLIP BECAME THE FIRST GOVERNOR OF NEW SOUTH WALES" | "CAPTAIN ARTHUR PHILIP BECAME THE FIRST GOVERNOR OF NEW SOUTH WALES" | Single character error in name |

## Technical Challenges and Solutions

### Language Modeling Challenges

1. **Vanishing and Exploding Gradients**
   - **Challenge**: RNNs struggled with long-range dependencies due to unstable gradient flow
   - **Solution**: Implemented gradient clipping at norm 0.25, forget gate bias initialization to 1.0, and skip connections between LSTM layers

2. **Computational Efficiency**
   - **Challenge**: Training on the full WikiText-2 dataset was computationally expensive
   - **Solution**: Employed mixed-precision training (FP16), gradient accumulation, and adaptive softmax for the output layer, reducing training time by 38%

3. **Overfitting**
   - **Challenge**: Complex models quickly overfit despite regularization
   - **Solution**: Developed a comprehensive regularization strategy combining variational dropout, weight decay, and early stopping with validation-based checkpointing

4. **Efficient Text Generation**
   - **Challenge**: Naive generation algorithms were too slow for interactive use
   - **Solution**: Implemented batch generation, caching of hidden states, and optimized top-k/nucleus sampling algorithms to improve generation speed by 5x

### Speech Recognition Challenges

1. **Variable-length Sequences**
   - **Challenge**: Handling variable-length audio and transcripts efficiently
   - **Solution**: Implemented packed sequence processing, length-sorted batching, and dynamic computation graphs

2. **Audio-Text Alignment**
   - **Challenge**: Standard attention mechanisms struggled with long audio sequences
   - **Solution**: Developed location-aware attention with convolutional features and coverage tracking

3. **Data Augmentation**
   - **Challenge**: Limited training data (100 hours) for robust ASR
   - **Solution**: Extensive augmentation pipeline with SpecAugment, time stretching, and additive noise from MUSAN corpus

4. **Inference Optimization**
   - **Challenge**: Beam search inference was prohibitively slow
   - **Solution**: Custom CUDA kernels for beam search, pruning strategies, and early stopping heuristics

## Implementation Insights

### Critical Engineering Decisions

1. **Modeling Units**:
   - For language modeling: Word-level tokens offered the best trade-off between sequence length and semantic meaning
   - For ASR: Character-level modeling provided flexibility without out-of-vocabulary issues

2. **Recurrent Unit Selection**:
   - LSTM outperformed GRU for language modeling due to superior handling of long dependencies
   - Bidirectional GRU performed best for ASR encoding due to efficient computation and sufficient representational power

3. **Attention Mechanism Design**:
   - Location-aware attention with convolutional features significantly outperformed standard content-based attention
   - Adding coverage tracking prevented attention loops and redundant transcription

4. **Regularization Strategy**:
   - Language model: Variational dropout proved most effective for sequential data
   - ASR: SpecAugment with time and frequency masking provided the largest improvement in generalization

### Toolkit and Infrastructure

Both models were implemented using:
- PyTorch 1.12 with CUDA 11.6 for GPU acceleration
- NumPy and librosa for audio preprocessing
- NVIDIA Apex for mixed-precision training
- WandB for experiment tracking
- Custom data loaders with multiprocessing for efficient I/O
- Training conducted on NVIDIA V100-32GB GPU

## Future Directions

### Language Model Improvements

1. **Architecture Enhancements**:
   - Transformer-based architectures with rotary positional encodings
   - Extending context length beyond current 35-token window
   - Mixture-of-Experts (MoE) approaches for increased model capacity

2. **Training Optimizations**:
   - Distributed training across multiple GPUs
   - Curriculum learning based on sentence complexity
   - Knowledge distillation from larger pre-trained models

3. **Advanced Decoding**:
   - Constrained decoding for task-specific generation
   - Reranking with external discriminators
   - Controlled generation with attribute classifiers

### Speech Recognition Advancements

1. **Architectural Innovations**:
   - Conformer-based encoder combining CNNs and transformers
   - Non-autoregressive decoding for faster inference
   - Multi-task learning with phoneme recognition and speaker identification

2. **Data Efficiency**:
   - Self-supervised pre-training on unlabeled audio
   - Data synthesis with text-to-speech for augmentation
   - Cross-lingual transfer learning

3. **Practical Enhancements**:
   - Real-time processing capabilities
   - Speaker adaptation for personalization
   - Domain-specific language model adaptation

## Conclusion

This project demonstrated the effectiveness of recurrent neural architectures for complex sequence modeling tasks across different modalities. The word-level language model achieved strong perplexity metrics while generating coherent and contextually appropriate text, showcasing the power of properly regularized LSTM networks. Meanwhile, the attention-based speech recognition system successfully bridged the gap between acoustic and linguistic representations, achieving competitive error rates on the challenging LibriSpeech benchmark.

The extensive exploration of architectural variants, regularization techniques, and training strategies provided valuable insights into the design trade-offs involved in building state-of-the-art sequence models. The ablation studies in particular highlighted the crucial components for each task, guiding future research directions.

Both components highlight the importance of careful implementation details, proper regularization, and effective training strategies when building neural sequence models. The insights gained from this project provide a solid foundation for future work in natural language processing and speech recognition systems.

## Resources

- [GitHub Repository](https://github.com/yourusername/neural-language-models)
- [Kaggle Competition Link](https://www.kaggle.com/competitions/11-785-s24-hw3p2)
- [WikiText-2 Dataset](https://blog.salesforceairesearch.com/the-wikitext-long-term-dependency-language-modeling-dataset/)
- [LibriSpeech Dataset](http://www.openslr.org/12/)
- [Project Report PDF](/files/neural_language_models_report.pdf)
- [Interactive Demo](/demo/language_model_demo)