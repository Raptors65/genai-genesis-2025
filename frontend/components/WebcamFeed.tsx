'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as Soundfont from "soundfont-player";

// Define the type for piano hotspots
interface PianoHotspot {
  x: number;
  y: number;
  note: string;
}

// Add to the global Window interface
declare global {
  interface Window {
    pianoHotspots?: PianoHotspot[];
  }
}

// declare global {
//   interface Window { handDetector: handPoseDetection.HandDetector; }
// }

// (window as any).handDetector = (window as any).handDetector || {};

interface HandDetectionProps {
  onStartNotePlay: (note: string, finger: string, hand: string) => void;
  onEndNotePlay: (note: string, finger: string, hand: string) => void;
};

const pianoEdges = [[[80, 340], [20, 420]], // left edge
                    [[560, 340], [620, 420]], // right edge
                    [[80, 340], [560, 340]], // top edge
                    [[20, 420], [620, 420]] // bottom edge
                  ];
const blackKeyHeightRatio = 0.5;
const topY = pianoEdges[0][0][1];
const botY = pianoEdges[0][1][1];

// const notes = [
//   {
//     x: 558, // width 34
//     y: 360,
//     note: "C3"
//   },
//   {
//     x: 567, // width 38
//     y: 400,
//     note: "C3F"
//   },
//   {
//     x: 524,
//     y: 360,
//     note: "D3"
//   },
//   {
//     x: 529,
//     y: 400,
//     note: "D3F"
//   },
//   {
//     x: 490,
//     y: 360,
//     note: "E3"
//   },
//   {
//     x: 456,
//     y: 360,
//     note: "F3"
//   },
//   {
//     x: 453,
//     y: 400,
//     note: "F3F"
//   },
//   {
//     x: 422,
//     y: 360,
//     note: "G3"
//   },
//   {
//     x: 415,
//     y: 400,
//     note: "G3F"
//   },
//   {
//     x: 388,
//     y: 360,
//     note: "A4"
//   },
//   {
//     x: 377,
//     y: 400,
//     note: "A4S"
//   },
//   {
//     x: 354,
//     y: 360,
//     note: "B4"
//   },
//   {
//     x: 320,
//     y: 360,
//     note: "C4"
//   },
//   {
//     x: 301,
//     y: 400,
//     note: "C4S"
//   },
//   {
//     x: 286,
//     y: 360,
//     note: "D4"
//   },
//   {
//     x: 263,
//     y: 400,
//     note: "D4S"
//   },
//   {
//     x: 252,
//     y: 360,
//     note: "E4"
//   },
//   {
//     x: 218,
//     y: 360,
//     note: "F4"
//   },
//   {
//     x: 187,
//     y: 400,
//     note: "F4S"
//   },
//   {
//     x: 184,
//     y: 360,
//     note: "G4"
//   },
//   {
//     x: 149,
//     y: 400,
//     note: "G4S"
//   },
//   {
//     x: 150,
//     y: 360,
//     note: "A4"
//   },
//   {
//     x: 111,
//     y: 400,
//     note: "A4S"
//   },
//   {
//     x: 116,
//     y: 360,
//     note: "B4"
//   },
//   {
//     x: 82,
//     y: 360,
//     note: "C4"
//   },
// ]

const notesPos: {
  note: string;
  polygon: [number, number][]
}[] = [
  {
      "note": "C5",
      "polygon": [
          [
              80,
              340
          ],
          [
              20,
              420
          ],
          [
              60,
              420
          ],
          [
              112,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "B4",
      "polygon": [
          [
              112,
              340
          ],
          [
              60,
              420
          ],
          [
              100,
              420
          ],
          [
              144,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "A4",
      "polygon": [
          [
              144,
              340
          ],
          [
              100,
              420
          ],
          [
              140,
              420
          ],
          [
              176,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "G4",
      "polygon": [
          [
              176,
              340
          ],
          [
              140,
              420
          ],
          [
              180,
              420
          ],
          [
              208,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "F4",
      "polygon": [
          [
              208,
              340
          ],
          [
              180,
              420
          ],
          [
              220,
              420
          ],
          [
              240,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "E4",
      "polygon": [
          [
              240,
              340
          ],
          [
              220,
              420
          ],
          [
              260,
              420
          ],
          [
              272,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "D4",
      "polygon": [
          [
              272,
              340
          ],
          [
              260,
              420
          ],
          [
              300,
              420
          ],
          [
              304,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "C4",
      "polygon": [
          [
              304,
              340
          ],
          [
              300,
              420
          ],
          [
              340,
              420
          ],
          [
              336,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "B3",
      "polygon": [
          [
              336,
              340
          ],
          [
              340,
              420
          ],
          [
              380,
              420
          ],
          [
              368,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "A3",
      "polygon": [
          [
              368,
              340
          ],
          [
              380,
              420
          ],
          [
              420,
              420
          ],
          [
              400,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "G3",
      "polygon": [
          [
              400,
              340
          ],
          [
              420,
              420
          ],
          [
              460,
              420
          ],
          [
              432,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "F3",
      "polygon": [
          [
              432,
              340
          ],
          [
              460,
              420
          ],
          [
              500,
              420
          ],
          [
              464,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "E3",
      "polygon": [
          [
              464,
              340
          ],
          [
              500,
              420
          ],
          [
              540,
              420
          ],
          [
              496,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "D3",
      "polygon": [
          [
              496,
              340
          ],
          [
              540,
              420
          ],
          [
              580,
              420
          ],
          [
              528,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "C3",
      "polygon": [
          [
              528,
              340
          ],
          [
              580,
              420
          ],
          [
              620,
              420
          ],
          [
              560,
              340
          ]
      ] as [number, number][]
  },
  {
      "note": "Bb4",
      "polygon": [
          [
              563,
              380
          ],
          [
              590,
              420
          ],
          [
              570,
              420
          ],
          [
              545,
              380
          ]
      ] as [number, number][]
  },
  {
      "note": "Ab4",
      "polygon": [
          [
              527,
              380
          ],
          [
              550,
              420
          ],
          [
              530,
              420
          ],
          [
              509,
              380
          ]
      ] as [number, number][]
  },
  {
      "note": "Gb4",
      "polygon": [
          [
              455,
              380
          ],
          [
              470,
              420
          ],
          [
              450,
              420
          ],
          [
              437,
              380
          ]
      ] as [number, number][]
  },
  {
      "note": "Eb4",
      "polygon": [
          [
              419,
              380
          ],
          [
              430,
              420
          ],
          [
              410,
              420
          ],
          [
              401,
              380
          ]
      ] as [number, number][]
  },
  {
      "note": "Db4",
      "polygon": [
          [
              383,
              380
          ],
          [
              390,
              420
          ],
          [
              370,
              420
          ],
          [
              365,
              380
          ]
      ] as [number, number][]
  },
  {
      "note": "Bb3",
      "polygon": [
          [
              311,
              380
          ],
          [
              310,
              420
          ],
          [
              290,
              420
          ],
          [
              293,
              380
          ]
      ] as [number, number][]
  },
  {
      "note": "Ab3",
      "polygon": [
          [
              275,
              380
          ],
          [
              270,
              420
          ],
          [
              250,
              420
          ],
          [
              257,
              380
          ]
      ] as [number, number][]
  },
  {
      "note": "Gb3",
      "polygon": [
          [
              203,
              380
          ],
          [
              190,
              420
          ],
          [
              170,
              420
          ],
          [
              185,
              380
          ]
      ] as [number, number][]
  },
  {
      "note": "Eb3",
      "polygon": [
          [
              167,
              380
          ],
          [
              150,
              420
          ],
          [
              130,
              420
          ],
          [
              149,
              380
          ]
      ] as [number, number][]
  },
  {
      "note": "Db3",
      "polygon": [
          [
              131,
              380
          ],
          [
              110,
              420
          ],
          [
              90,
              420
          ],
          [
              113,
              380
          ]
      ] as [number, number][]
  }
].toReversed();

// Remove or comment out verticals since we're not using it anymore
// const verticals = [0, 0, 0, 0, 0];

// We're not using this function anymore since we switched to hotspot detection
// function inside(point: [number, number], vs: [number, number][]) {
//   // ray-casting algorithm based on
//   // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
  
//   const x = point[0], y = point[1];
  
//   let inside = false;
//   for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
//       const xi = vs[i][0], yi = vs[i][1];
//       const xj = vs[j][0], yj = vs[j][1];
      
//       const intersect = ((yi > y) != (yj > y))
//           && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
//       if (intersect) inside = !inside;
//   }
  
//   return inside;
// };

const HandDetection = ({ onStartNotePlay, onEndNotePlay }: HandDetectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const piano = useRef<Soundfont.Player | null>(null);
  const ac = useRef<AudioContext | null>(null);
  const handleStartNotePlay = useCallback((note: string, finger: string, hand: string) => {
    if (piano.current) {
      piano.current.play(note, ac.current!.currentTime);
    }
    onStartNotePlay(note, finger, hand);
  }, [piano, onStartNotePlay]);
  
  // const [isDetecting, setIsDetecting] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const [landmarks, setLandmarks] = useState<handPoseDetection.Hand[]>([]);
  const notesBeingPlayed = useRef<{
    note: {
        note: string;
        polygon: [number, number][];
    };
    finger: string | undefined;
    hand: "Left" | "Right";
  }[]>([]);
  
  // Add smoothing for finger positions
  const previousFingerPositions = useRef<{ [key: string]: { x: number, y: number, z: number }[] }>({});
  
  // MediaPipe hand landmark indices for fingertips
  const FINGERTIP_INDICES = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky
  const FINGER_NAMES = ["thumb", "index", "middle", "ring", "pinky"];

  // Add mapping from finger names to piano fingering numbers
  const FINGER_TO_PIANO: { [key: string]: number } = {
    "thumb": 1,
    "index": 2,
    "middle": 3,
    "ring": 4,
    "pinky": 5
  };

  // Initialize webcam
  useEffect(() => {
    async function setupCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // setError('Your browser does not support webcam access');
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
        console.log(`Error accessing webcam: ${err}`)
        // setError('Error accessing webcam: ' + err);
      }
    }

    setupCamera();

    ac.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)();

    Soundfont.instrument(ac.current!, "acoustic_grand_piano").then((instrument) => {
      piano.current = instrument;
    });

    return () => {
      // Cleanup webcam stream
      if (videoRef.current && videoRef.current.srcObject) {
        // @ts-expect-error getTracks does exist
        const tracks = videoRef.current.srcObject.getTracks();
        // @ts-expect-error to deal with getTracks issue
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
            runtime: 'tfjs', // Using TensorFlow.js runtime
            modelType: 'full', // Use the full model for better accuracy
            maxHands: 2
          }
        ).then(detector => {
          // eslint-disable-next-line
          (window as any).handDetector = detector;
          setIsModelLoaded(true);
        });
      } catch (err) {
        console.log(`Error loading model: ${err}`)
        // setError('Error loading model: ' + err);
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
  // const toggleDetection = () => {
  //   if (isDetecting) {
  //     setIsDetecting(false);
  //   } else if (isModelLoaded && videoRef.current) {
  //     setIsDetecting(true);
  //     detectHands();
  //   }
  // };

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

    ctx!.save();
    ctx!.scale(-1, 1); // Flip horizontally
    ctx!.translate(-videoWidth, 0);
    
    // Draw piano
    ctx!.strokeStyle = 'white';
    ctx!.lineWidth = 2;
      
    for (const [[startX, startY], [endX, endY]] of pianoEdges) {
      ctx!.beginPath();
      ctx!.moveTo(startX, startY);
      ctx!.lineTo(endX, endY);
      ctx!.stroke();
    }

    // Create arrays to store the key data and hotspots
    const whiteKeyData: { x: number, y: number, botX: number, botY: number, topX: number, topY: number, note: string }[] = [];
    const blackKeyData: { x: number, y: number, botX: number, botY: number, topX: number, topY: number, note: string }[] = [];
    const whiteKeyHotspots: { x: number, y: number, note: string }[] = [];
    const blackKeyHotspots: { x: number, y: number, note: string }[] = [];
    
    // Draw white keys and create white key hotspots
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

      const { note } = notesPos[notesPos.length - i - 1];
      
      // Store complete key data including coordinates and note
      whiteKeyData.push({
        x: leftTopX + 16, // Hotspot x
        y: topY + 15,     // Hotspot y
        botX: leftBotX,
        botY: leftBotY,
        topX: leftTopX,
        topY: leftTopY,
        note: note
      });
      
      // Also store just the hotspot info
      whiteKeyHotspots.push({
        x: leftTopX + 16,
        y: topY + 15,
        note: note
      });

      if (notesBeingPlayed.current.some((playedNote) => playedNote.note.note === note)) {
        // Stronger visual feedback for white keys when pressed
        ctx!.fillStyle = 'rgba(255, 0, 0, 0.8)'; // Increased opacity for more obvious red
        ctx!.fill();
        
        // Add border highlight
        ctx!.strokeStyle = 'yellow';
        ctx!.lineWidth = 3;
        ctx!.stroke();
      }

      ctx!.stroke();
    }

    // Draw black keys and create black key hotspots
    ctx!.strokeStyle = 'black';
    ctx!.fillStyle = 'black';
    
    let blackKeyIndex = 15;
    for (let i = 0; i < 15; i++) {
      if ([1, 2, 4, 5, 6].includes(i % 7)) {
        const leftBotX = 620 - (i * 40 - 10);
        const leftBotY = botY;
        const leftTopX = 590 - (i * 36 - 9);
        const leftTopY = (botY - topY) * blackKeyHeightRatio + topY;

        ctx!.beginPath();
        ctx!.moveTo(leftTopX, leftTopY);
        ctx!.lineTo(leftBotX, leftBotY);
        ctx!.lineTo(leftBotX - 20, leftBotY);
        ctx!.lineTo(leftTopX - 18, leftTopY);
        ctx!.lineTo(leftTopX, leftTopY);
        ctx!.stroke();

        const { note } = notesPos[notesPos.length - blackKeyIndex - 1];
        
        // Store complete key data including coordinates and note
        blackKeyData.push({
          x: leftTopX - 9,
          y: leftTopY + 15,
          botX: leftBotX,
          botY: leftBotY,
          topX: leftTopX,
          topY: leftTopY,
          note: note
        });
        
        // Also store just the hotspot info
        blackKeyHotspots.push({
          x: leftTopX - 9,
          y: leftTopY + 15,
          note: note
        });

        if (notesBeingPlayed.current.some((playedNote) => playedNote.note.note === note)) {
          // Stronger visual feedback for black keys when pressed
          ctx!.fillStyle = 'rgba(255, 80, 80, 1.0)'; // Brighter, fully opaque red
          ctx!.fill();
          
          // Add border highlight
          ctx!.strokeStyle = 'yellow';
          ctx!.lineWidth = 3;
          ctx!.stroke();
          
          ctx!.strokeStyle = 'black';
          ctx!.lineWidth = 1;
          ctx!.fillStyle = 'black';
        } else {
          ctx!.fill();
        }
        blackKeyIndex++;
      }
    }
    
    // Draw white key hotspots with enhanced visual feedback
    for (const keyData of whiteKeyData) {
      ctx!.beginPath();
      ctx!.arc(keyData.x, keyData.y, 8, 0, 2 * Math.PI); // Smaller hotspot dots
      
      // Check if this key is being played
      const isKeyPressed = notesBeingPlayed.current.some(
        (playedNote) => playedNote.note.note === keyData.note
      );
      
      if (isKeyPressed) {
        // Draw the entire key in bright red
        ctx!.beginPath();
        ctx!.moveTo(keyData.topX, keyData.topY);
        ctx!.lineTo(keyData.botX, keyData.botY);
        ctx!.lineTo(keyData.botX + 40, keyData.botY);
        ctx!.lineTo(keyData.topX + 32, keyData.topY);
        ctx!.closePath();
        ctx!.fillStyle = 'rgb(255, 0, 0)'; // Solid red
        ctx!.fill();
        
        // Yellow border
        ctx!.strokeStyle = 'yellow';
        ctx!.lineWidth = 4;
        ctx!.stroke();
        
        // Draw a large flashing circle around the hotspot
        const pulseSize = 20 + Math.sin(Date.now() / 80) * 10; // Smaller pulsing effect
        
        ctx!.beginPath();
        ctx!.arc(keyData.x, keyData.y, pulseSize, 0, 2 * Math.PI);
        ctx!.fillStyle = 'rgba(255, 255, 0, 0.5)'; // Yellow glow
        ctx!.fill();
        
        // Draw the hotspot itself in bright yellow
        ctx!.beginPath();
        ctx!.arc(keyData.x, keyData.y, 8, 0, 2 * Math.PI);
        ctx!.fillStyle = 'yellow';
        ctx!.fill();
      } else {
        // Normal state - smaller dot with border
        ctx!.fillStyle = "red";
        ctx!.fill();
        ctx!.strokeStyle = 'white';
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }
    }
    
    // Draw black key hotspots with enhanced visual feedback
    for (const keyData of blackKeyData) {
      ctx!.beginPath();
      ctx!.arc(keyData.x, keyData.y, 8, 0, 2 * Math.PI); // Smaller hotspot dots
      
      // Check if this key is being played
      const isKeyPressed = notesBeingPlayed.current.some(
        (playedNote) => playedNote.note.note === keyData.note
      );
      
      if (isKeyPressed) {
        // Draw the entire key in bright red
        ctx!.beginPath();
        ctx!.moveTo(keyData.topX, keyData.topY);
        ctx!.lineTo(keyData.botX, keyData.botY);
        ctx!.lineTo(keyData.botX - 20, keyData.botY);
        ctx!.lineTo(keyData.topX - 18, keyData.topY);
        ctx!.closePath();
        ctx!.fillStyle = 'rgb(255, 50, 50)'; // Bright red
        ctx!.fill();
        
        // Yellow border
        ctx!.strokeStyle = 'yellow';
        ctx!.lineWidth = 4;
        ctx!.stroke();
        
        // Draw a large flashing circle around the hotspot
        const pulseSize = 20 + Math.sin(Date.now() / 80) * 10; // Smaller pulsing effect
        
        ctx!.beginPath();
        ctx!.arc(keyData.x, keyData.y, pulseSize, 0, 2 * Math.PI);
        ctx!.fillStyle = 'rgba(255, 255, 0, 0.5)'; // Yellow glow
        ctx!.fill();
        
        // Draw the hotspot itself in bright yellow
        ctx!.beginPath();
        ctx!.arc(keyData.x, keyData.y, 8, 0, 2 * Math.PI);
        ctx!.fillStyle = 'yellow';
        ctx!.fill();
      } else {
        // Normal state - smaller dot with border
        ctx!.fillStyle = "red";
        ctx!.fill();
        ctx!.strokeStyle = 'white';
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }
    }
    
    // Store all hotspots in a window variable for note detection
    window.pianoHotspots = [...whiteKeyHotspots, ...blackKeyHotspots];
    
    // Draw each detected hand with improved fingertip tracking
    hands.forEach(hand => {
      // Draw only the fingertips with improved visualization
      for (let i = 0; i < FINGERTIP_INDICES.length; i++) {
        const keypoint = hand.keypoints[FINGERTIP_INDICES[i]];
        if (!keypoint) continue;
        
        const { x, y } = keypoint;
        
        // Draw circles for fingertips
        ctx!.beginPath();
        ctx!.arc(x, y, 8, 0, 2 * Math.PI);
        
        // Use different colors for different fingers for better visualization
        const fingerColors = ['red', '#00FF00', '#00FFFF', '#FFFF00', '#FF00FF'];
        ctx!.fillStyle = fingerColors[i];
        ctx!.fill();
        
        // Add a white border to make dots more visible
        ctx!.strokeStyle = 'white';
        ctx!.lineWidth = 2;
        ctx!.stroke();
      }
      
      // Draw hand skeleton lines for better visualization
      ctx!.strokeStyle = 'rgba(0, 255, 0, 0.5)';
      ctx!.lineWidth = 2;
      
      // Draw palm connections
      const palmConnections = [
        [0, 1], [1, 2], [2, 3], [3, 4],  // thumb
        [0, 5], [5, 6], [6, 7], [7, 8],  // index
        [0, 9], [9, 10], [10, 11], [11, 12],  // middle
        [0, 13], [13, 14], [14, 15], [15, 16],  // ring
        [0, 17], [17, 18], [18, 19], [19, 20],  // pinky
        [0, 5], [5, 9], [9, 13], [13, 17]  // palm connections
      ];
      
      for (const [i, j] of palmConnections) {
        const from = hand.keypoints[i];
        const to = hand.keypoints[j];
        
        if (from && to) {
          ctx!.beginPath();
          ctx!.moveTo(from.x, from.y);
          ctx!.lineTo(to.x, to.y);
          ctx!.stroke();
        }
      }
    });

    
    
    ctx!.restore();
  };

  // Apply smoothing to landmark positions
  const smoothLandmarks = (hands: handPoseDetection.Hand[]): handPoseDetection.Hand[] => {
    const smoothingFactor = 0.4; // Reduced from 0.7 to 0.4 to decrease latency
    const smoothedHands = [...hands];
    
    hands.forEach((hand, handIndex) => {
      const handId = `${hand.handedness}-${handIndex}`;
      
      // Initialize position history if this is a new hand
      if (!previousFingerPositions.current[handId]) {
        previousFingerPositions.current[handId] = hand.keypoints.map(kp => ({ 
          x: kp.x, 
          y: kp.y, 
          z: hand.keypoints3D ? hand.keypoints3D[hand.keypoints.indexOf(kp)].z || 0 : 0 
        }));
        return;
      }
      
      // Apply smoothing to each keypoint
      hand.keypoints.forEach((keypoint, i) => {
        const prev = previousFingerPositions.current[handId][i];
        
        // Smooth the x, y positions
        const smoothedX = prev.x * smoothingFactor + keypoint.x * (1 - smoothingFactor);
        const smoothedY = prev.y * smoothingFactor + keypoint.y * (1 - smoothingFactor);
        
        // Update the keypoint with smoothed values
        smoothedHands[handIndex].keypoints[i].x = smoothedX;
        smoothedHands[handIndex].keypoints[i].y = smoothedY;
        
        // Smooth the z position if available
        if (hand.keypoints3D && hand.keypoints3D[i]) {
          const zValue = hand.keypoints3D[i].z || 0;
          const smoothedZ = prev.z * smoothingFactor + zValue * (1 - smoothingFactor);
          if (smoothedHands[handIndex].keypoints3D && smoothedHands[handIndex].keypoints3D[i]) {
            smoothedHands[handIndex].keypoints3D[i].z = smoothedZ;
          }
          
          // Update the stored z value
          prev.z = smoothedZ;
        }
        
        // Update stored positions for next frame
        prev.x = smoothedX;
        prev.y = smoothedY;
      });
    });
    
    // Clean up any stale hand data
    const activeHandIds = hands.map((hand, idx) => `${hand.handedness}-${idx}`);
    Object.keys(previousFingerPositions.current).forEach(handId => {
      if (!activeHandIds.includes(handId)) {
        delete previousFingerPositions.current[handId];
      }
    });
    
    return smoothedHands;
  };

  // Hand detection loop with smoothing
  const detectHands = async () => {
    // eslint-disable-next-line
    if (!(window as any).handDetector || !videoRef.current || !canvasRef.current) {
      return;
    }

    try {
      // eslint-disable-next-line
      let hands = await (window as any).handDetector.estimateHands(videoRef.current);
      
      // Apply smoothing to reduce jitter
      hands = smoothLandmarks(hands);
      
      // setLandmarks(hands);
      drawResults(hands);
      checkNotes(hands);
    } catch (err) {
      console.error('Detection error:', err);
    }

    // Continue detection loop
    requestAnimationFrame(detectHands);
  };

  const checkNotes = (hands: handPoseDetection.Hand[]) => {
    // Only use fingertips for note detection
    const fingertips = hands.flatMap((hand) => 
      FINGERTIP_INDICES.map((fingerIdx, i) => ({
        keypoints: hand.keypoints[fingerIdx], 
        keypoints3D: hand.keypoints3D?.[fingerIdx] || { x: 0, y: 0, z: 0 },
        handedness: hand.handedness,
        fingerName: FINGER_NAMES[i],
        pianoFinger: FINGER_TO_PIANO[FINGER_NAMES[i]]
      }))
    );

    // Get the piano hotspots that were created in drawResults
    const hotspots = window.pianoHotspots || [];

    const playedNotes = fingertips.flatMap((finger) => {
      if (!finger.keypoints) return []; // Skip if keypoint is missing
      
      // Find if the finger is touching any hotspot
      const hotspot = hotspots.find((spot: {x: number, y: number, note: string}) => {
        if (!spot || typeof spot.x !== 'number' || typeof spot.y !== 'number') return false;
        
        const dx = finger.keypoints.x - spot.x;
        const dy = finger.keypoints.y - spot.y;
        // Calculate squared distance (faster than using Math.sqrt for distance)
        const sqDistance = dx*dx + dy*dy;
        
        // VERY lenient detection - increase radius significantly for testing
        return sqDistance < 400; // Much larger detection radius to debug
      });

      // Return the note if a hotspot was found, otherwise empty array
      return hotspot ? [{ 
        note: { 
          note: hotspot.note, 
          polygon: [] // We still need to match the expected structure
        }, 
        finger: finger.pianoFinger.toString(), 
        hand: finger.handedness 
      }] : [];
    });
    
    // Log for debugging
    if (playedNotes.length > 0) {
      console.log('Notes being played:', playedNotes.map(note => note.note.note).join(', '));
    }
    
    // Log info about hotspots and fingertips for debugging
    if (fingertips.length > 0 && hotspots.length > 0) {
      console.log(`Found ${fingertips.length} fingertips and ${hotspots.length} hotspots`);
    }
    
    for (const note of notesBeingPlayed.current) {
      if (playedNotes.every((playedNote) => playedNote.note.note !== note.note.note)) {
        onEndNotePlay(note.note.note, note.finger!, note.hand === "Left" ? "Right" : "Left");
      }
    }

    for (const playedNote of playedNotes) {
      if (!notesBeingPlayed.current.some((noteBeingPlayed) => noteBeingPlayed.note.note === playedNote.note.note)) {
        handleStartNotePlay(playedNote.note.note, playedNote.finger!, playedNote.hand === "Left" ? "Right" : "Left");
      }
    }

    notesBeingPlayed.current = playedNotes;
  };

  return (
    <div className="flex justify-center items-center">
      <div className="relative mb-4 border-2 rounded-xl border-[#8E44AD]">
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
    </div>
  );
};

export default HandDetection;