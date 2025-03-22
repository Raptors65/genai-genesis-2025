'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const pianoEdges = [[[80, 340], [20, 420]], // left edge
                    [[560, 340], [620, 420]], // right edge
                    [[80, 340], [560, 340]], // top edge
                    [[20, 420], [620, 420]] // bottom edge
                  ];
const blackKeyHeightRatio = 0.5;
const topY = pianoEdges[0][0][1];
const botY = pianoEdges[0][1][1];

const notes = [
  {
    x: 558, // width 34
    y: 360,
    note: "C3"
  },
  {
    x: 567, // width 38
    y: 400,
    note: "C3F"
  },
  {
    x: 524,
    y: 360,
    note: "D3"
  },
  {
    x: 529,
    y: 400,
    note: "D3F"
  },
  {
    x: 490,
    y: 360,
    note: "E3"
  },
  {
    x: 456,
    y: 360,
    note: "F3"
  },
  {
    x: 453,
    y: 400,
    note: "F3F"
  },
  {
    x: 422,
    y: 360,
    note: "G3"
  },
  {
    x: 415,
    y: 400,
    note: "G3F"
  },
  {
    x: 388,
    y: 360,
    note: "A4"
  },
  {
    x: 377,
    y: 400,
    note: "A4S"
  },
  {
    x: 354,
    y: 360,
    note: "B4"
  },
  {
    x: 320,
    y: 360,
    note: "C4"
  },
  {
    x: 301,
    y: 400,
    note: "C4S"
  },
  {
    x: 286,
    y: 360,
    note: "D4"
  },
  {
    x: 263,
    y: 400,
    note: "D4S"
  },
  {
    x: 252,
    y: 360,
    note: "E4"
  },
  {
    x: 218,
    y: 360,
    note: "F4"
  },
  {
    x: 187,
    y: 400,
    note: "F4S"
  },
  {
    x: 184,
    y: 360,
    note: "G4"
  },
  {
    x: 149,
    y: 400,
    note: "G4S"
  },
  {
    x: 150,
    y: 360,
    note: "A4"
  },
  {
    x: 111,
    y: 400,
    note: "A4S"
  },
  {
    x: 116,
    y: 360,
    note: "B4"
  },
  {
    x: 82,
    y: 360,
    note: "C4"
  },
]

const HandDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);
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

  useEffect(() => {
    if (isModelLoaded && videoRef.current) {
      detectHands();
    }
  }, [isModelLoaded, videoRef.current])

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
      
      setLandmarks(hands);
      drawResults(hands);
      checkNotes(hands);
    } catch (err) {
      console.error('Detection error:', err);
    }

    // Continue detection loop
    requestAnimationFrame(detectHands);
  };

  // Draw hand landmarks on canvas
  const drawResults = (hands: handPoseDetection.Hand[]) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const videoWidth = videoRef.current!.videoWidth;
    const videoHeight = videoRef.current!.videoHeight;
    
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    
    ctx!.clearRect(0, 0, videoWidth, videoHeight);
    ctx!.save();

    ctx.save();
    ctx.scale(-1, 1); // Flip horizontally
    ctx.translate(-videoWidth, 0);
    
    // Draw piano
    ctx!.strokeStyle = 'white';
    ctx!.lineWidth = 2;
      
    for (const [[startX, startY], [endX, endY]] of pianoEdges) {
      ctx!.beginPath();
      ctx!.moveTo(startX, startY);
      ctx!.lineTo(endX, endY);
      ctx!.stroke();
    }

    // draw 2 octaves

    ctx!.strokeStyle = 'white';
    ctx!.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      const leftBotX = i * 40 + 20;
      const leftBotY = botY;

      const leftTopX = i * 32 + 80;
      const leftTopY = topY;

      ctx!.beginPath();
      ctx!.moveTo(leftTopX, leftTopY);
      ctx!.lineTo(leftBotX, leftBotY);
      ctx!.lineTo(leftBotX + 40, leftBotY);
      ctx!.lineTo(leftTopX + 32, leftTopY);
      ctx!.lineTo(leftTopX, leftTopY);
      ctx!.stroke();
    }


    ctx!.strokeStyle = 'black';
    ctx!.fillStyle = 'black';
    for (let i = 0; i < 15; i++) {
      if ([1, 2, 4, 5, 6].includes(i % 7)) {
        const leftBotX = 620 - (i * 40 - 10);
        const leftBotY = botY;

        const leftTopX = 590 - (i * 36 - 9);
        const leftTopY = (botY - topY) * blackKeyHeightRatio + topY;

        // const leftBotX = Math.abs(i * botWhiteKeyWidth - i * topWhiteKeyWidth) + Math.min(i * botWhiteKeyWidth, i * topWhiteKeyWidth);
        // const leftBotY = Math.abs(topY - botY) + Math.min(topY, botY);



        ctx!.beginPath();
        ctx!.moveTo(leftTopX, leftTopY);
        ctx!.lineTo(leftBotX, leftBotY);
        ctx!.lineTo(leftBotX - 20, leftBotY);
        ctx!.lineTo(leftTopX - 18, leftTopY);
        ctx!.lineTo(leftTopX, leftTopY);
        ctx!.stroke();
        ctx!.fill();
      }
    }

    ctx!.fillStyle = "red";
    for (const note of notes) {
      ctx?.beginPath();
      ctx!.arc(note.x, note.y, 5, 0, 2 * Math.PI);
      ctx?.fill();
    }
    
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
      for (let i = 4; i < keypoints.length; i += 4) {
        const { x, y } = keypoints[i];
        
        ctx!.beginPath();
        ctx!.arc(x, y, 5, 0, 2 * Math.PI);
        ctx!.fillStyle = i === 0 ? 'red' : 'blue'; // Wrist point in red, others in blue
        ctx!.fill();
      }
      
      // Draw connections
      ctx!.strokeStyle = 'green';
      ctx!.lineWidth = 2;
      
      // for (const [i, j] of connections) {
      //   const from = keypoints[i];
      //   const to = keypoints[j];
        
      //   if (from && to) {
      //     ctx!.beginPath();
      //     ctx!.moveTo(from.x, from.y);
      //     ctx!.lineTo(to.x, to.y);
      //     ctx!.stroke();
      //   }
      // }
    });

    
    
    ctx!.restore();
  };

  const checkNotes = (hands: handPoseDetection.Hand[]) => {
    const fingers = hands.flatMap((hand) => hand.keypoints.map((k, i) => ({
      keypoints: k, keypoints3D: hand.keypoints3D![i]
    })).filter((_, i) => i !== 0 && i % 4 === 0));

    if (hands.length > 0 && hands[0].keypoints3D) {
      // console.log(hands[0]?.keypoints3D[8].y)
    }

    const playedNotes = notes.filter((note) => fingers.some((finger, i) => {
      const dx = finger.keypoints.x - note.x;
      const dy = finger.keypoints.y - note.y;
      const sqDistance = dx*dx + dy*dy;
      const vertical = finger.keypoints3D.y;

      return sqDistance < 50 && vertical > 0.045;
    }))
    
    console.log(playedNotes.map((note) => note.note));
  };

  return (
    <div className="relative mb-4">
      <video 
          ref={videoRef} 
          className="rounded-lg bg-gray-100 scale-x-[-1]" 
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
  );
};

export default HandDetection;