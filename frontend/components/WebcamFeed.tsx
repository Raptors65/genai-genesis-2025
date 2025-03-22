'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';

declare global {
  interface Window { handDetector: handPoseDetection.HandDetector; }
}

window.handDetector = window.handDetector || {};

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
      "note": "B5",
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
      "note": "A5",
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
      "note": "B4",
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
      "note": "A4",
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
      "note": "A5S",
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
      "note": "G4S",
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
      "note": "F4S",
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
      "note": "D4S",
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
      "note": "C4S",
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
      "note": "A4S",
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
      "note": "G3S",
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
      "note": "F3S",
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
      "note": "D3S",
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
      "note": "C3S",
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

const verticals = [0.05, 0.06, 0.05, 0.05, 0.045];

function inside(point: [number, number], vs: [number, number][]) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
  
  const x = point[0], y = point[1];
  
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];
      
      const intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
  }
  
  return inside;
};

const HandDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  // const [isDetecting, setIsDetecting] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const [landmarks, setLandmarks] = useState<handPoseDetection.Hand[]>([]);
  const notesBeingPlayed = useRef<string[]>([]);

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
            runtime: 'tfjs',
            modelType: 'full',
            maxHands: 2
          }
        ).then(detector => {
          window.handDetector = detector;
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

  // Hand detection loop
  const detectHands = async () => {
    if (!window.handDetector || !videoRef.current || !canvasRef.current) {
      return;
    }

    try {
      const hands = await window.handDetector.estimateHands(videoRef.current);
      
      // setLandmarks(hands);
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

      const { note } = notesPos[notesPos.length - i - 1];

      // console.log(notesBeingPlayed.current, note === 'F4')
      if (notesBeingPlayed.current.includes(note)) {
        // console.log("!")
        ctx!.fillStyle = 'red';
        ctx!.fill();
      }

      ctx!.stroke();
    }


    ctx!.strokeStyle = 'black';
    ctx!.fillStyle = 'black';
    let noteI = 15;
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

        const { note } = notesPos[notesPos.length - noteI - 1];

        // console.log(notesBeingPlayed.current, note === 'F4')
        if (notesBeingPlayed.current.includes(note)) {
          // console.log("!")
          ctx!.fillStyle = 'red';
          ctx!.fill();
          ctx!.fillStyle = 'black';
        } else {
          ctx!.fill();
        }
        noteI++;
      }
    }
    // console.log(notes)

    // ctx!.fillStyle = "red";
    // for (const note of notes) {
    //   ctx?.beginPath();
    //   ctx!.arc(note.x, note.y, 5, 0, 2 * Math.PI);
    //   ctx?.fill();
    // }
    
    // Draw each detected hand
    hands.forEach(hand => {
      // Draw landmarks
      const keypoints = hand.keypoints;
      
      // Draw connections
      // const connections = [
      //   // Thumb
      //   [0, 1], [1, 2], [2, 3], [3, 4],
      //   // Index finger
      //   [0, 5], [5, 6], [6, 7], [7, 8],
      //   // Middle finger
      //   [0, 9], [9, 10], [10, 11], [11, 12],
      //   // Ring finger
      //   [0, 13], [13, 14], [14, 15], [15, 16],
      //   // Pinky
      //   [0, 17], [17, 18], [18, 19], [19, 20],
      //   // Palm connections
      //   [5, 9], [9, 13], [13, 17]
      // ];
      
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
      keypoints: k, keypoints3D: hand.keypoints3D![i], handedness: hand.handedness
    })).filter((_, i) => i !== 0 && i % 4 === 0));

    // if (hands.length > 0 && hands[0].keypoints3D) {
    //   // console.log(hands[0]?.keypoints3D[8].y)
    // }

    // const playedNotes = notes.filter((note) => fingers.some((finger, i) => {
    //   const dx = finger.keypoints.x - note.x;
    //   const dy = finger.keypoints.y - note.y;
    //   const sqDistance = dx*dx + dy*dy;
    //   const vertical = finger.keypoints3D.y;

    //   return sqDistance < 50 && vertical > 0.045;
    // }))

    const playedNotes = fingers.flatMap((finger, i) => {
      const note = notesPos.find((note) => {
        const vertical = finger.keypoints3D.y;

        return inside([finger.keypoints.x, finger.keypoints.y], note.polygon) && vertical > verticals[i % 5];
      });

      return note === undefined ? [] : [{note, finger: finger.keypoints.name, hand: finger.handedness}];
    });
    
    for (const note of notesBeingPlayed.current) {
      if (playedNotes.every((playedNote) => playedNote.note.note !== note)) {
        console.log(`stopped playing ${note}`);
      }
    }

    for (const playedNote of playedNotes) {
      if (!notesBeingPlayed.current.includes(playedNote.note.note)) {
        console.log(`started playing ${playedNote.note.note} with ${playedNote.finger} ${playedNote.hand}`)
      }
    }

    notesBeingPlayed.current = playedNotes.map((playedNote) => playedNote.note.note);
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