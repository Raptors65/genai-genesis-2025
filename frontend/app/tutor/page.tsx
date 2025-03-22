"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { EmotionIcon } from "@/components/EmotionIcon";
import { MusicNotes } from "@/components/MusicNotes";
import HandDetection from "@/components/WebcamFeed";
import { useCallback, useRef, useState } from "react";

export type Note = {
  note: string;
  startTime: number;
  duration?: number;
}

export default function TutorPage() {
  const [message, setMessage] = useState("");
  const [playedNotes, setPlayedNotes] = useState<Note[]>([]);
  const [expectedNotes, setExpectedNotes] = useState<Note[]>([]);
  const startTime = useRef<number | null>(null);

  const handleStartNotePlay = useCallback((note: string, finger: string, hand: string) => {
    console.log(`Started playing ${note} using ${hand} ${finger}`);
    if (startTime.current === null) return;
    setPlayedNotes((prev) => [...prev, { note: note, startTime: (new Date().getTime() - startTime.current!) / 1000 }]);
  }, [playedNotes, startTime.current]);

  const handleEndNotePlay = useCallback((note: string, finger: string, hand: string) => {
    console.log(`Stopped playing ${note} using ${hand} ${finger}`);
    if (startTime.current === null) return;
    setPlayedNotes((prev) => {
      const index = prev.findLastIndex((prevNote) => prevNote.note === note);
      if (index === -1) return prev;
      return [...prev.slice(0, index), { ...prev[index], duration: (new Date().getTime() - startTime.current!) / 1000 - prev[index].startTime }, ...prev.slice(index + 1)]
    });
  }, [playedNotes, startTime.current]);

  const handleStartExpectedNote = useCallback((note: string) => {
    console.log(`Expecting ${note}`);
    if (startTime.current === null) return;
    setExpectedNotes((prev) => [...prev, { note: note, startTime: (new Date().getTime() - startTime.current!) / 1000 }]);
  }, [expectedNotes, startTime.current]);

  const handleEndExpectedNote = useCallback((note: string) => {
    if (startTime.current === null) return;
    setExpectedNotes((prev) => {
      const index = prev.findLastIndex((prevNote) => prevNote.note === note);
      if (index === -1) return prev;
      return [...prev.slice(0, index), { ...prev[index], duration: (new Date().getTime() - startTime.current!) / 1000 - prev[index].startTime }, ...prev.slice(index + 1)]
    });
  }, [expectedNotes, startTime]);

  const handleStart = () => {
    startTime.current = new Date().getTime();
  };

  const handleEnd = useCallback(async () => {
    fetch('/api/get-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expectedNotes,
        playedNotes
      })
    }).then(async (response) => {
      if (!response.ok) {
        return;
      }
  
      const data = await response.json();
  
      setMessage(data.response);
    });

    setExpectedNotes([]);
    setPlayedNotes([]);
    startTime.current = new Date().getTime();
    
  }, [expectedNotes, playedNotes]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-white">
      <div className="container mx-auto px-4 h-full flex flex-col">
        {/* Top section - 25% height */}
        <div className="h-[30%] bg-white">
          <div className="bg-white rounded-lg m-4 p-4">
            <MusicNotes onStartNote={handleStartExpectedNote} onEndNote={handleEndExpectedNote} onStart={handleStart} onEnd={handleEnd} />
          </div>
        </div>
        
        {/* Bottom section - 75% height */}
        <div className="h-[70%] bg-white relative">
          <div className="bg-white rounded-lg m-4 p-4">
            <HandDetection onStartNotePlay={handleStartNotePlay} onEndNotePlay={handleEndNotePlay} />
          </div>
          <div className="absolute top-4 right-8">
            <EmotionIcon 
              emotion="sad" 
              size={48} 
              message={message}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 