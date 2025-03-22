"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { EmotionIcon } from "@/components/EmotionIcon";
import { MusicNotes } from "@/components/MusicNotes";
import HandDetection from "@/components/WebcamFeed";
import { NoteDisplay } from "@/components/NoteDisplay";
import { useCallback, useEffect, useRef, useState } from "react";

export type Note = {
  note: string;
  startTime: number;
  duration?: number;
}

export default function TutorPage() {
  const [message, setMessage] = useState("");
  const [playedNotes, setPlayedNotes] = useState<Note[]>([]);
  const [expectedNotes, setExpectedNotes] = useState<Note[]>([]);
  const [currentPlayedNote, setCurrentPlayedNote] = useState<string | null>(null);
  const startTime = useRef<number | null>(null);

  // Initialize startTime on component mount
  useEffect(() => {
    startTime.current = new Date().getTime();
    console.log("startTime initialized:", startTime.current);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStartNotePlay = useCallback((note: string, _finger: string, _hand: string) => {
    console.log("Note played:", note);
    // Always set currentPlayedNote regardless of startTime
    setCurrentPlayedNote(note);
    
    if (startTime.current === null) {
      console.log("startTime was null, initializing it");
      startTime.current = new Date().getTime();
    }
    
    setPlayedNotes((prev) => [...prev, { note: note, startTime: (new Date().getTime() - startTime.current!) / 1000 }]);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEndNotePlay = useCallback((note: string, _finger: string, _hand: string) => {
    console.log("Note ended:", note);
    setCurrentPlayedNote(null);
    
    if (startTime.current === null) {
      console.log("startTime was null in endNotePlay");
      return;
    }
    
    setPlayedNotes((prev) => {
      const index = prev.findLastIndex((prevNote) => prevNote.note === note);
      if (index === -1) return prev;
      return [...prev.slice(0, index), { ...prev[index], duration: (new Date().getTime() - startTime.current!) / 1000 - prev[index].startTime }, ...prev.slice(index + 1)]
    });
  }, []);

  const handleStartExpectedNote = useCallback((note: string) => {
    if (startTime.current === null) return;
    setExpectedNotes((prev) => [...prev, { note: note, startTime: (new Date().getTime() - startTime.current!) / 1000 }]);
  }, []);

  const handleEndExpectedNote = useCallback((note: string) => {
    if (startTime.current === null) return;
    setExpectedNotes((prev) => {
      const index = prev.findLastIndex((prevNote) => prevNote.note === note);
      if (index === -1) return prev;
      return [...prev.slice(0, index), { ...prev[index], duration: (new Date().getTime() - startTime.current!) / 1000 - prev[index].startTime }, ...prev.slice(index + 1)]
    });
  }, []);

  const handleStart = () => {
    startTime.current = new Date().getTime();
    console.log("handleStart called, startTime set to:", startTime.current);
  };

  const handleEnd = useCallback(async () => {
    console.log("handleEnd", expectedNotes, playedNotes);

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
      <div className="container mx-auto px-4 h-full">
        <ResizablePanelGroup direction="vertical" className="h-full">
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
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
                  <div className="bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)] flex flex-col justify-center">
                    <h3 className="mb-4 text-lg font-medium">Currently Played Note</h3>
                    <NoteDisplay currentNote={currentPlayedNote} />
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={70}>
                  <div className="bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)]">
                    <HandDetection onStartNotePlay={handleStartNotePlay} onEndNotePlay={handleEndNotePlay} />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
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