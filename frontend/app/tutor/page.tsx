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
    console.log(startTime)
    if (startTime.current === null) return;
    setPlayedNotes((prev) => {
      const index = prev.findLastIndex((prevNote) => prevNote.note === note);
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
  
      setMessage(data.response.content[0].text);
    });

    setExpectedNotes([]);
    setPlayedNotes([]);
    
  }, [expectedNotes, playedNotes]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-white">
      <div className="container mx-auto px-4 h-full">
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Piano Section - Top 1/3 */}
          <ResizablePanel defaultSize={33} minSize={20} maxSize={50}>
            <div className="h-full bg-white">
              <div className="bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)]">
                <MusicNotes onStartNote={handleStartExpectedNote} onEndNote={handleEndExpectedNote} onStart={handleStart} onEnd={handleEnd} />
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