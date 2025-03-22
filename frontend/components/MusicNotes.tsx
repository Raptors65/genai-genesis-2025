"use client";

import { useEffect, useRef, useState } from "react";
import { Factory, Beam, StaveNote } from "vexflow";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Metronome } from "./Metronome";

interface Note {
  key: string | string[];  // Can be a single note or array of notes
  duration: "w" | "h" | "q" | "8" | "16"; // w=whole, h=half, q=quarter, 8=eighth, 16=sixteenth
}

interface MusicNotesProps {
  tempo?: number;
  trebleNotes: Note[];
  bassNotes: Note[];
  onStartNote: (note: string) => void;
  onEndNote: (note: string) => void;
  onStart: () => void;
  onEnd: () => void;
  mode: "left" | "right" | "both";
}

export function MusicNotes({ 
  tempo = 80, 
  trebleNotes,
  bassNotes,
  onStartNote,
  onEndNote,
  onStart,
  onEnd,
  mode
}: MusicNotesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const factoryRef = useRef<Factory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [currentTempo, setCurrentTempo] = useState(tempo);
  const [highlightedTrebleIndex, setHighlightedTrebleIndex] = useState(0);
  const [highlightedBassIndex, setHighlightedBassIndex] = useState(0);
  // Convert note durations to beats
  const getBeats = (duration: string): number => {
    switch (duration) {
      case "w": return 4;  // whole note
      case "h": return 2;  // half note
      case "q": return 1;  // quarter note
      case "8": return 0.5;  // eighth note
      case "16": return 0.25;  // sixteenth note
      default: return 1;
    }
  };

  const togglePlaying = () => {
    setIsPlaying((prev) => {
      if (prev) {
        setHighlightedTrebleIndex(0);
        setHighlightedBassIndex(0);
        return false;
      } else {
        if (highlightedTrebleIndex === 0 && highlightedBassIndex === 0) {
          // Start playing treble notes
          if (mode === "right" || mode === "both") {
            const currentTrebleNote = trebleNotes[highlightedTrebleIndex].key;
            if (Array.isArray(currentTrebleNote)) {
              currentTrebleNote.forEach(note => {
                onStartNote(note.replaceAll("/", "").toUpperCase());
              });
            } else {
              onStartNote(currentTrebleNote.replaceAll("/", "").toUpperCase());
            }
          }
          
          // Start playing bass notes
          if (mode === "left" || mode === "both") {
            const currentBassNote = bassNotes[highlightedBassIndex].key;
            if (Array.isArray(currentBassNote)) {
              currentBassNote.forEach(note => {
                onStartNote(note.replaceAll("/", "").toUpperCase());
              });
            } else {
              onStartNote(currentBassNote.replaceAll("/", "").toUpperCase());
            }
          }
          
          onStart();
        }
        return true;
      }
    });
  }

  // Handle treble clef playback
  useEffect(() => {
    if (!isPlaying) return;

    // Function to handle the treble note progression
    const handleTrebleNote = () => {
      // End current note
      const currentTrebleNote = trebleNotes[highlightedTrebleIndex].key;
      if (Array.isArray(currentTrebleNote)) {
        currentTrebleNote.forEach(note => {
          onEndNote(note.replaceAll("/", "").toUpperCase());
        });
      } else {
        onEndNote(currentTrebleNote.replaceAll("/", "").toUpperCase());
      }

      // Move to next note
      const nextTrebleIndex = (highlightedTrebleIndex + 1) % trebleNotes.length;
      const nextTrebleNote = trebleNotes[nextTrebleIndex].key;
      
      // Start next note
      if (mode === "right" || mode === "both") {
          if (Array.isArray(nextTrebleNote)) {
            nextTrebleNote.forEach(note => {
              onStartNote(note.replaceAll("/", "").toUpperCase());
          });
        } else {
          onStartNote(nextTrebleNote.replaceAll("/", "").toUpperCase());
        }
      }

      setHighlightedTrebleIndex(nextTrebleIndex);
      
      // Call onEnd if both clefs have completed their cycles
      if (nextTrebleIndex === 0) {
        onEnd();
      }
    };

    // Set up interval for treble notes - using currentTempo instead of tempo
    const trebleInterval = (60000 / currentTempo) * getBeats(trebleNotes[highlightedTrebleIndex].duration);
    const timeoutId = setTimeout(handleTrebleNote, trebleInterval);

    return () => clearTimeout(timeoutId);
  }, [isPlaying, highlightedTrebleIndex, trebleNotes, tempo]);

  // Handle bass clef playback
  useEffect(() => {
    if (!isPlaying) return;

    // Function to handle the bass note progression
    const handleBassNote = () => {
      // End current note
      const currentBassNote = bassNotes[highlightedBassIndex].key;
      if (Array.isArray(currentBassNote)) {
        currentBassNote.forEach(note => {
          onEndNote(note.replaceAll("/", "").toUpperCase());
        });
      } else {
        onEndNote(currentBassNote.replaceAll("/", "").toUpperCase());
      }

      // Move to next note
      const nextBassIndex = (highlightedBassIndex + 1) % bassNotes.length;
      const nextBassNote = bassNotes[nextBassIndex].key;
      
      // Start next note
      if (mode === "left" || mode === "both") {
        if (Array.isArray(nextBassNote)) {
          nextBassNote.forEach(note => {
            onStartNote(note.replaceAll("/", "").toUpperCase());
          });
        } else {
          onStartNote(nextBassNote.replaceAll("/", "").toUpperCase());
        }
      }

      setHighlightedBassIndex(nextBassIndex);
    };

    // Set up interval for bass notes - using currentTempo instead of tempo
    const bassInterval = (60000 / currentTempo) * getBeats(bassNotes[highlightedBassIndex].duration);
    const timeoutId = setTimeout(handleBassNote, bassInterval);

    return () => clearTimeout(timeoutId);
  }, [isPlaying, highlightedBassIndex, trebleNotes, currentTempo]);

  // Initialize VexFlow factory once
  useEffect(() => {
    if (!containerRef.current) return;

    // Create a VexFlow factory
    factoryRef.current = new Factory({
      renderer: { elementId: containerRef.current.id, width: 900, height: 300 },
    });

    // Cleanup
    return () => {
      if (factoryRef.current) {
        factoryRef.current.getContext().clear();
      }
    };
  }, []); // Empty dependency array - only run once

  // Handle note highlighting and rendering
  useEffect(() => {
    if (!factoryRef.current) return;

    const factory = factoryRef.current;
    const context = factory.getContext();
    context.clear();

    const drawNotes = (notes: Note[], isHighlightedIndex: number, yPosition: number, clef: "treble" | "bass") => {
      // Calculate total beats and number of staves needed
      let currentBeats = 0;
      let staveCount = 0;
      const beatsPerStave = 4; // 4/4 time signature

      // First pass: calculate number of staves needed
      notes.forEach(note => {
        currentBeats += getBeats(note.duration);
        if (currentBeats >= beatsPerStave) {
          staveCount++;
          currentBeats -= beatsPerStave;
        }
      });
      if (currentBeats > 0) staveCount++; // Add one more stave if there are remaining beats

      // Create staves and distribute notes
      const staves = [];
      const staveWidth = 200;

      let currentStaveIndex = 0;
      let currentBeatsInStave = 0;
      let currentStaveNotes: StaveNote[] = [];

      // Create and draw staves and notes as we go
      for (let i = 0; i < 4; i++) {
        const stave = factory.Stave({ 
          x: 10 + (i * (staveWidth)) + (i == 0 ? 0 : 50), 
          y: yPosition, 
          width: staveWidth + (i == 0 ? 50 : 0)
        });
        
        // Add clef and time signature only to first stave
        if (i === 0) {
          stave.addClef(clef).setContext(context).draw();
          stave.addTimeSignature("4/4").setContext(context).draw();
        }
        
        stave.setContext(context).draw();
        staves.push(stave);

        // Add notes to this stave until we reach the beat limit
        while (currentStaveIndex < notes.length) {
          const note = notes[currentStaveIndex];
          const beats = getBeats(note.duration);
          
          // Check if this note would exceed the beat limit
          if (currentBeatsInStave + beats > beatsPerStave) {
            break;
          }
          
          const staveNote = factory.StaveNote({ 
            keys: Array.isArray(note.key) ? note.key : [note.key], 
            duration: note.duration,
            clef: clef,
            autoStem: true
          });
          
          // Don't try to set beam here, we'll handle beaming later
          
          if (currentStaveIndex === isHighlightedIndex) {
            staveNote.setStyle({ fillStyle: "#F39C12", strokeStyle: "#F39C12" });
          }
          
          currentStaveNotes.push(staveNote);
          currentBeatsInStave += beats;
          currentStaveIndex++;
        }

        // Create and draw voice for this stave's notes
        if (currentStaveNotes.length > 0) {
          const voice = factory.Voice().addTickables(currentStaveNotes);
          
          // Add final barline to the last stave
          if (i === staveCount - 1) {
            const barNote = factory.BarNote({ type: "end" });
            voice.addTickable(barNote);
          }
          
          factory.Formatter().joinVoices([voice]).format([voice], staveWidth);
          voice.setContext(context).draw();

          // Add beams for eighth notes and shorter durations
          const beams: Beam[] = [];
          let currentBeamNotes: StaveNote[] = [];
          
          currentStaveNotes.forEach((note: StaveNote, index) => {
            // Use our original note's duration instead of trying to access from StaveNote
            const originalNote = notes[index + (currentStaveIndex - currentStaveNotes.length)];
            const duration = originalNote.duration;
            
            if (duration === "8" || duration === "16") {
              currentBeamNotes.push(note);
              
              // Create a beam if we have at least 2 notes or this is the last note
              if (currentBeamNotes.length >= 2 || index === currentStaveNotes.length - 1) {
                const beam = factory.Beam({ notes: currentBeamNotes });
                beams.push(beam);
                currentBeamNotes = [];
              }
            } else {
              // If we have pending beam notes, create a beam before moving on
              if (currentBeamNotes.length >= 2) {
                const beam = factory.Beam({ notes: currentBeamNotes });
                beams.push(beam);
                currentBeamNotes = [];
              }
            }
          });

          // Draw all beams
          beams.forEach(beam => beam.setContext(context).draw());
        }

        // Reset for next stave
        currentBeatsInStave = 0;
        currentStaveNotes = [];
      }
    };
    
    // Draw treble clef notes
    if (mode === "right" || mode === "both") {
      drawNotes(trebleNotes, highlightedTrebleIndex, 40, "treble");
    }
    
    // Draw bass clef notes
    if (mode === "left" || mode === "both") {
      drawNotes(bassNotes, highlightedBassIndex, 160, "bass");
    }
    
  }, [trebleNotes, bassNotes, highlightedTrebleIndex, highlightedBassIndex, mode]);

  return (
    <div className="w-full h-fit -mt-2 flex items-center justify-center gap-4">
      <Metronome 
        tempo={currentTempo} 
        isPlaying={isPlaying} 
        enabled={metronomeEnabled}
        onToggle={(enabled) => {
          setMetronomeEnabled(enabled);
        }}
        onTempoChange={(newTempo) => {
          setCurrentTempo(newTempo);
        }}
      />
      <div id="music-notes" ref={containerRef} className="bg-white rounded-lg" style={{ width: '1220px', height: '300px' }} />
      <Button 
        onClick={togglePlaying}
        className="bg-[#F39C12] hover:bg-[#F39C12]/90"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
    </div>
  );
} 