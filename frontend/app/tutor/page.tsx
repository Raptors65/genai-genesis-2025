"use client";

import { EmotionIcon } from "@/components/EmotionIcon";
import { MusicNotes } from "@/components/MusicNotes";
import HandDetection from "@/components/WebcamFeed";
import { NoteDisplay } from "@/components/NoteDisplay";
import { useCallback, useEffect, useRef, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import clsx from "clsx";

export type Note = {
  note: string;
  startTime: number;
  duration?: number;
  hand?: string;
  finger?: number;
}

export default function TutorPage() {
  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [playedNotes, setPlayedNotes] = useState<Note[]>([]);
  const [expectedNotes, setExpectedNotes] = useState<Note[]>([]);
  const [mode, setMode] = useState<"left" | "right" | "both">("both");
  const [currentPlayedNote, setCurrentPlayedNote] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBassNotes, setGeneratedBassNotes] = useState<{ key: string | string[]; duration: "w" | "h" | "q" | "8" | "16"; fingering?: string | string[]; }[]>([
    { key: ["c/3"], duration: "q", fingering: "5" },
    { key: ["g/3"], duration: "q", fingering: "1" },
    { key: ["c/3"], duration: "h", fingering: "5" },
    { key: ["f/3"], duration: "q", fingering: "2" },
    { key: ["g/3"], duration: "q", fingering: "1" },
    { key: ["c/3"], duration: "h", fingering: "5" },
    { key: ["f/3"], duration: "w", fingering: "2" },
    { key: ["g/3"], duration: "8", fingering: "1" },
    { key: ["a/3"], duration: "8", fingering: "2" },
    { key: ["b/3"], duration: "8", fingering: "1" },
    { key: ["a/3"], duration: "8", fingering: "2" },
    { key: ["e/3"], duration: "h", fingering: "3" }
  ]);
  const [generatedTrebleNotes, setGeneratedTrebleNotes] = useState<{ key: string | string[]; duration: "w" | "h" | "q" | "8" | "16"; fingering?: string | string[]; }[]>([
    { key: ["c/4", "e/4" ], duration: "q", fingering: ["1", "3"] },
    { key: ["d/4"], duration: "q", fingering: "2" },
    { key: ["e/4", "g/4"], duration: "h", fingering: ["3", "5"] },
    { key: ["c/4"], duration: "h", fingering: "1" },
    { key: ["d/4"], duration: "q", fingering: "2" },
    { key: ["e/4"], duration: "q", fingering: "3" },
    { key: ["d/4", "f/4", "a/4"], duration: "w", fingering: ["1", "3", "5"] },
    { key: ["d/4"], duration: "8", fingering: "2" },
    { key: ["e/4"], duration: "8", fingering: "3" },
    { key: ["e/4"], duration: "8", fingering: "3" },
    { key: ["e/4"], duration: "8", fingering: "3" },
    { key: ["e/4", "g/4", "b/4"], duration: "h", fingering: ["1", "3", "5"] }
  ]);
  const startTime = useRef<number | null>(null);

  // Initialize startTime on component mount
  useEffect(() => {
    startTime.current = new Date().getTime();
    console.log("startTime initialized:", startTime.current);
  }, []);

  const handleGenerateMusic = async () => {
    setIsGenerating(true);
    try {
      console.log("Generating music");
      const response = await fetch('/api/generate-music', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Reset existing notes
        setPlayedNotes([]);

        const jsonData = JSON.parse(data[0].text);
        
        setGeneratedTrebleNotes(jsonData.trebleNotes);
        setGeneratedBassNotes(jsonData.bassNotes);
        console.log(jsonData);
        
        // Reset timer
        startTime.current = new Date().getTime();
      } else {
        console.error('Failed to generate music');
      }
    } catch (error) {
      console.error('Error generating music:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
      
      // Update the current message
      setMessage(data.response);
      
      // Add the new message to history
      setMessageHistory(prev => [...prev, data.response]);
    });

    setExpectedNotes([]);
    setPlayedNotes([]);
    startTime.current = new Date().getTime();
    
  }, [expectedNotes, playedNotes]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-white">
      <div className="container mx-auto px-4 h-full flex flex-col">
        {/* Top section with sheet music */}
        <div className="h-[60%] bg-white flex items-center justify-center">
          <div className="bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)] w-full max-w-[1200px]">
            <div className="flex items-center justify-between -mt-6 mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Practice mode:</span>
                <ToggleGroup type="single" value={mode} onValueChange={(value: string) => value && setMode(value as "left" | "right" | "both")}>
                  <ToggleGroupItem value="left">Left Hand</ToggleGroupItem>
                  <ToggleGroupItem value="right">Right Hand</ToggleGroupItem>
                  <ToggleGroupItem value="both">Both Hands</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <Button 
                onClick={handleGenerateMusic} 
                disabled={isGenerating}
                className="bg-[#8E44AD] hover:bg-[#8E44AD]/90 text-white flex items-center"
              >
                <RefreshCcw className={clsx("mr-2 h-4 w-4", { "animate-spin": isGenerating })} />
                Generate New Music
              </Button>
            </div>
            <MusicNotes 
              trebleNotes={generatedTrebleNotes}
              bassNotes={generatedBassNotes}
              onStartNote={handleStartExpectedNote} 
              mode={mode} 
              onEndNote={handleEndExpectedNote} 
              onStart={handleStart} 
              onEnd={handleEnd} 
            />
          </div>
        </div>

        {/* Bottom section with webcam and note display */}
        <div className="h-[40%] bg-white relative">
          <div className="h-full flex">
            {/* Note display section */}
            <div className="w-[155px] bg-white rounded-lg ml-16 h-[calc(100%-2rem)] flex flex-col justify-center">
              <NoteDisplay currentNote={currentPlayedNote} />
            </div>

            {/* Webcam section - showing only bottom half */}
            <div className="w-[60%] bg-white h-[calc(100%-2rem)] overflow-hidden">
              <div className="h-[200%] translate-y-[-50%]">
                <HandDetection onStartNotePlay={handleStartNotePlay} onEndNotePlay={handleEndNotePlay} />
              </div>
            </div>
          </div>

          {/* Emotion icon */}
          <div className="absolute bottom-0 right-[-25px]">
            <EmotionIcon 
              emotion="sad" 
              size={48} 
              message={message}
              messageHistory={messageHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 