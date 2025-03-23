# Pianowise

An interactive web application that helps users learn to play piano through real-time feedback and guided practice.

## Overview

This application uses computer vision to detect hand movements and provides real-time feedback on piano playing technique. It displays sheet music with fingering annotations and gives emotional feedback based on performance accuracy.

## Features

- **Interactive Sheet Music**: Display of treble and bass clef notes with proper musical notation
- **Fingering Annotations**: Visual indicators for which fingers to use on each note
- **Hand Detection**: Real-time webcam tracking of hand positions
- **Practice Modes**: Options to practice with left hand, right hand, or both hands
- **Performance Feedback**: Emotional feedback on your playing accuracy
- **Chat Log**: History of feedback messages for tracking progress
- **Music Generation**: AI-based generation of new practice pieces
- **Metronome**: Adjustable tempo for practice sessions
- **Demo Mode**: Listen to how the piece should sound

## Technology Stack

- Next.js (React framework)
- TypeScript
- TailwindCSS
- VexFlow (for sheet music rendering)
- TensorFlow for hand tracking

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A webcam for hand tracking functionality

### Installation

1. Clone the repository:
   ```
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the frontend folder with your API keys:
   ```
   cd frontend
   touch .env.local
   ```
   
   Add the following to your `.env.local` file:
   ```
   COHERE_API_KEY=your_cohere_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Select Practice Mode**: Choose to practice with left hand, right hand, or both hands
2. **Play the Notes**: Follow the highlighted notes and fingerings on the sheet music
3. **Get Feedback**: Receive emotional feedback on your performance accuracy
4. **Generate New Music**: Click "Generate New Music" to practice different pieces
5. **Use Demo**: Click the "Demo" button to hear how the piece should sound
6. **Adjust Tempo**: Use the metronome controls to set your preferred practice speed