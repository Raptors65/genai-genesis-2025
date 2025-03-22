"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { EmotionIcon } from "@/components/EmotionIcon";
import { MusicNotes } from "@/components/MusicNotes";
import HandDetection from "@/components/WebcamFeed";
import { NoteDisplay } from "@/components/NoteDisplay";
import { useCallback, useEffect, useRef, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export type Note = {
  note: string;
  startTime: number;
  duration?: number;
}

export default function TutorPage() {
  const [message, setMessage] = useState("");
  const [playedNotes, setPlayedNotes] = useState<Note[]>([]);
  const [expectedNotes, setExpectedNotes] = useState<Note[]>([]);
  const [mode, setMode] = useState<"left" | "right" | "both">("both");
  const [currentPlayedNote, setCurrentPlayedNote] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBassNotes, setGeneratedBassNotes] = useState<{ key: string | string[]; duration: "w" | "h" | "q" | "8" | "16"; }[]>([
    { key: ["c/3"], duration: "q" },
    { key: ["g/3"], duration: "q" },
    { key: ["c/3"], duration: "h" },
    { key: ["f/3"], duration: "q" },
    { key: ["g/3"], duration: "q" },
    { key: ["c/3"], duration: "h" },
    { key: ["f/3"], duration: "w" },
    { key: ["g/3"], duration: "8" },
    { key: ["a/3"], duration: "8" },
    { key: ["b/3"], duration: "8" },
    { key: ["a/3"], duration: "8" },
    { key: ["e/3"], duration: "h" }
  ]);
  const [generatedTrebleNotes, setGeneratedTrebleNotes] = useState<{ key: string | string[]; duration: "w" | "h" | "q" | "8" | "16"; }[]>([
    { key: ["c/4", "e/4" ], duration: "q" },  // C major chord
    { key: ["d/4"], duration: "q" },  // D minor chord
    { key: ["e/4", "g/4"], duration: "h" },  // E minor chord
    { key: ["c/4"], duration: "h" },  // C major chord
    { key: ["d/4"], duration: "q" },  // D minor chord
    { key: ["e/4"], duration: "q" },  // E minor chord
    { key: ["d/4", "f/4", "a/4"], duration: "w" },  // D minor chord
    { key: ["d/4"], duration: "8" },  // D minor chord
    { key: ["e/4"], duration: "8" },  // E minor chord
    { key: ["e/4"], duration: "8" },  // E minor chord
    { key: ["e/4"], duration: "8" },  // E minor chord
    { key: ["e/4", "g/4", "b/4"], duration: "h" }   // E minor chord
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
          <ResizablePanel defaultSize={40} minSize={20} maxSize={60}>
            <div className="h-full bg-white">
              <div className="bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)]">
                <div className="flex items-center justify-between -mt-6 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Practice mode:</span>
                    <ToggleGroup type="single" value={mode} onValueChange={(value: string) => setMode(value as "left" | "right" | "both")}>
                      <ToggleGroupItem value="left">Left Hand</ToggleGroupItem>
                      <ToggleGroupItem value="right">Right Hand</ToggleGroupItem>
                      <ToggleGroupItem value="both">Both Hands</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <Button 
                    onClick={handleGenerateMusic} 
                    disabled={isGenerating}
                    className="flex items-center gap-1"
                  >
                    {isGenerating && <RefreshCcw className="h-4 w-4 animate-spin" />}
                    Generate New Music
                  </Button>
                </div>
                <MusicNotes 
                  onStartNote={handleStartExpectedNote} 
                  mode={mode} 
                  onEndNote={handleEndExpectedNote} 
                  onStart={handleStart} 
                  onEnd={handleEnd}
                  trebleNotes={generatedTrebleNotes.length > 0 ? generatedTrebleNotes : undefined}
                  bassNotes={generatedBassNotes.length > 0 ? generatedBassNotes : undefined}
                />
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