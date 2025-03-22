"use client";

import { Piano as PianoComponent } from "@/components/Piano";
import HandDetection from "@/components/WebcamFeed";

export default function PracticePage() {
  const handleStartNotePlay = (note: string, finger: string, hand: string) => {
    console.log(`Started playing ${note} using ${hand} ${finger}`);
  };

  const handleEndNotePlay = (note: string, finger: string, hand: string) => {
    console.log(`Stopped playing ${note} using ${hand} ${finger}`);
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-white">
      <div className="container mx-auto px-4 h-full">
        <div className="bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)]">
          <HandDetection onStartNotePlay={handleStartNotePlay} onEndNotePlay={handleEndNotePlay} />
        </div>
      </div>
    </div>
  );
} 