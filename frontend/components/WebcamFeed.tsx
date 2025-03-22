'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const HandDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState([]);

  // Initialize webcam
  useEffect(() => {
    async function setupCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Your browser does not support webcam access');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play();
          };
        }
      } catch (err) {
        setError('Error accessing webcam: ' + err.message);
      }
    }

    setupCamera();

    return () => {
      // Cleanup webcam stream
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Load MediaPipe model
  useEffect(() => {
    async function loadModel() {
      try {
        await handPoseDetection.createDetector(
          handPoseDetection.SupportedModels.MediaPipeHands, 
          {
            runtime: 'tfjs',
            modelType: 'full',
            maxHands: 2
          }
        ).then(detector => {
          window.handDetector = detector;
          setIsModelLoaded(true);
        });
      } catch (err) {
        setError('Error loading model: ' + err.message);
      }
    }

    loadModel();
  }, []);

  // Start/stop hand detection
  const toggleDetection = () => {
    if (isDetecting) {
      setIsDetecting(false);
    } else if (isModelLoaded && videoRef.current) {
      setIsDetecting(true);
      detectHands();
    }
  };

  // Hand detection loop
  const detectHands = async () => {
    if (!window.handDetector || !videoRef.current || !canvasRef.current) {
      return;
    }

    try {
      const hands = await window.handDetector.estimateHands(videoRef.current);
      
      if (hands.length > 0) {
        setLandmarks(hands);
        drawResults(hands);
      } else {
        // Clear canvas if no hands detected
        const ctx = canvasRef.current!.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        setLandmarks([]);
      }
    } catch (err) {
      console.error('Detection error:', err);
    }

    // Continue detection loop
    requestAnimationFrame(detectHands);
  };

  // Draw hand landmarks on canvas
  const drawResults = (hands) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    ctx.save();
    
    // Draw each detected hand
    hands.forEach(hand => {
      // Draw landmarks
      const keypoints = hand.keypoints;
      
      // Draw connections
      const connections = [
        // Thumb
        [0, 1], [1, 2], [2, 3], [3, 4],
        // Index finger
        [0, 5], [5, 6], [6, 7], [7, 8],
        // Middle finger
        [0, 9], [9, 10], [10, 11], [11, 12],
        // Ring finger
        [0, 13], [13, 14], [14, 15], [15, 16],
        // Pinky
        [0, 17], [17, 18], [18, 19], [19, 20],
        // Palm connections
        [5, 9], [9, 13], [13, 17]
      ];
      
      // Draw keypoints
      for (let i = 0; i < keypoints.length; i++) {
        const { x, y } = keypoints[i];
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = i === 0 ? 'red' : 'blue'; // Wrist point in red, others in blue
        ctx.fill();
      }
      
      // Draw connections
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      
      for (const [i, j] of connections) {
        const from = keypoints[i];
        const to = keypoints[j];
        
        if (from && to) {
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
        }
      }
    });
    
    ctx.restore();
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Hand Landmark Detection</h1>
      
      <div className="relative mb-4">
        <video 
          ref={videoRef} 
          className="rounded-lg bg-gray-100" 
          width="640" 
          height="480"
          muted
          playsInline
        />
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 z-10" 
          width="640" 
          height="480"
        />
      </div>
      
      <div className="flex flex-col gap-4">
        <button
          onClick={toggleDetection}
          disabled={!isModelLoaded}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
        >
          {isDetecting ? 'Stop Detection' : 'Start Detection'}
        </button>
        
        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {!isModelLoaded && !error && (
          <div className="p-2 bg-yellow-100 text-yellow-700 rounded-md">
            Loading model... Please wait.
          </div>
        )}
        
        {landmarks.length > 0 && (
          <div className="p-2 bg-green-100 text-green-700 rounded-md">
            Detected {landmarks.length} hand(s)
          </div>
        )}
      </div>
      
      <div className="mt-4 text-gray-600 text-sm">
        <p>Note: For best results, ensure good lighting and keep your hand clearly visible to the camera.</p>
      </div>
    </div>
  );
};

export default HandDetection;