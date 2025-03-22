"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { EmotionIcon } from "@/components/EmotionIcon";
import { MusicNotes } from "@/components/MusicNotes";
import HandDetection from "@/components/WebcamFeed";
import { useState } from "react";

export default function TutorPage() {
  const [message, setMessage] = useState("");

  const handleStartNotePlay = (note: string, finger: string, hand: string) => {
    console.log(`Started playing ${note} using ${hand} ${finger}`);
    setMessage(note); // just to show that it can update the tutor msg from here
  };

  const handleEndNotePlay = (note: string, finger: string, hand: string) => {
    console.log(`Stopped playing ${note} using ${hand} ${finger}`);
    setMessage("");
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-white">
      <div className="container mx-auto px-4 h-full">
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Piano Section - Top 1/3 */}
          <ResizablePanel defaultSize={33} minSize={20} maxSize={50}>
            <div className="h-full bg-white">
              <div className="bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)]">
                <MusicNotes />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle/>
          <ResizablePanel defaultSize={67}>
            <div className="h-full bg-white relative">
              <div className="bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)]">
                <HandDetection onStartNotePlay={handleStartNotePlay} onEndNotePlay={handleEndNotePlay} />
              </div>
              {/* Emotion Icon with Dialogue */}
              <div className="absolute top-4 right-8">
                <EmotionIcon 
                  emotion="sad" 
                  size={48} 
                  message={message}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
} 