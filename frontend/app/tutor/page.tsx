"use client";

import { EmotionIcon } from "@/components/EmotionIcon";
import { MusicNotes } from "@/components/MusicNotes";
import HandDetection from "@/components/WebcamFeed";
import { NoteDisplay } from "@/components/NoteDisplay";
import { useCallback, useEffect, useRef, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type Note = {
  note: string;
  startTime: number;
  duration?: number;
  hand?: string;
  finger?: number;
}

export default function TutorPage() {
  const [message, setMessage] = useState("");
  const [playedNotes, setPlayedNotes] = useState<Note[]>([]);
  const [expectedNotes, setExpectedNotes] = useState<Note[]>([]);
  const [mode, setMode] = useState<"left" | "right" | "both">("both");
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
    
    setPlayedNotes((prev) => [...prev, { 
      note: note, 
      startTime: (new Date().getTime() - startTime.current!) / 1000,
      hand: _hand,
      finger: parseInt(_finger)
    }]);
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
      return [...prev.slice(0, index), { 
        ...prev[index], 
        duration: (new Date().getTime() - startTime.current!) / 1000 - prev[index].startTime,
        hand: _hand,
        finger: parseInt(_finger)
      }, ...prev.slice(index + 1)]
    });
  }, []);

  const handleStartExpectedNote = useCallback((note: string, hand: string, finger: number) => {
    console.log(`Expecting ${note} using ${hand} ${finger}`);
    if (startTime.current === null) return;
    setExpectedNotes((prev) => [...prev, { 
      note: note, 
      startTime: (new Date().getTime() - startTime.current!) / 1000,
      hand: hand,
      finger: finger
    }]);
  }, []);

  const handleEndExpectedNote = useCallback((note: string, hand: string, finger: number) => {
    if (startTime.current === null) return;
    setExpectedNotes((prev) => {
      const index = prev.findLastIndex((prevNote) => prevNote.note === note);
      if (index === -1) return prev;
      return [...prev.slice(0, index), { 
        ...prev[index], 
        duration: (new Date().getTime() - startTime.current!) / 1000 - prev[index].startTime,
        hand: hand,
        finger: finger
      }, ...prev.slice(index + 1)]
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
      <div className="container mx-auto px-4 h-full flex flex-col">
        {/* Top section with sheet music */}
        <div className="h-[60%] bg-white">
          <div className="bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)]">
            <div className="flex items-center space-x-2 -mt-6 mb-2">
              <span className="font-medium">Practice mode:</span>
              <ToggleGroup type="single" value={mode} onValueChange={(value: string) => value && setMode(value as "left" | "right" | "both")}>
                <ToggleGroupItem value="left">Left Hand</ToggleGroupItem>
                <ToggleGroupItem value="right">Right Hand</ToggleGroupItem>
                <ToggleGroupItem value="both">Both Hands</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <MusicNotes onStartNote={handleStartExpectedNote} mode={mode} onEndNote={handleEndExpectedNote} onStart={handleStart} onEnd={handleEnd} />
          </div>
        </div>

        {/* Bottom section with webcam and note display */}
        <div className="h-[40%] bg-white relative">
          <div className="h-full flex">
            {/* Note display section */}
            <div className="w-[30%] bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)] flex flex-col justify-center">
              <h3 className="mb-4 text-lg font-medium">Currently Played Note</h3>
              <NoteDisplay currentNote={currentPlayedNote} />
            </div>

            {/* Webcam section - showing only bottom half */}
            <div className="w-[70%] bg-white p-4 h-[calc(100%-2rem)] overflow-hidden">
              <div className="h-[200%] translate-y-[-50%]">
                <HandDetection onStartNotePlay={handleStartNotePlay} onEndNotePlay={handleEndNotePlay} />
              </div>
            </div>
          </div>

          {/* Emotion icon */}
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