"use client";

import { useEffect, useRef, useState } from "react";
import { Factory, Beam, StaveNote } from "vexflow";
import { Button } from "@/components/ui/button";
import { Play, Pause, Music } from "lucide-react";
import { Metronome } from "./Metronome";
import { handleKeyDown } from "./Audio";

interface Note {
  key: string | string[];  // Can be a single note or array of notes
  duration: "w" | "h" | "q" | "8" | "16"; // w=whole, h=half, q=quarter, 8=eighth, 16=sixteenth
  fingering?: string | string[];  // Optional fingering for each note
}

interface MusicNotesProps {
  tempo?: number;
  trebleNotes?: Note[];
  bassNotes?: Note[];
  onStartNote: (note: string, hand: string, finger: number) => void;
  onEndNote: (note: string, hand: string, finger: number) => void;
  onStart: () => void;
  onEnd: () => void;
  mode: "left" | "right" | "both";
}

export function MusicNotes({ 
  tempo = 80, 
  trebleNotes = [],
  bassNotes = [],
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
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  
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
            const currentTrebleFingering = trebleNotes[highlightedTrebleIndex].fingering;
            if (Array.isArray(currentTrebleNote)) {
              currentTrebleNote.forEach((note, index) => {
                const trebleFingering = Array.isArray(currentTrebleFingering) ? currentTrebleFingering[index] : currentTrebleFingering;
                onStartNote(note.replaceAll("/", "").toUpperCase(), "Right", parseInt(trebleFingering || "1"));
              });
            } else {
              onStartNote(currentTrebleNote.replaceAll("/", "").toUpperCase(), "Right", parseInt((currentTrebleFingering as string) || "1"));
            }
          }
          
          // Start playing bass notes
          if (mode === "left" || mode === "both") {
            const currentBassNote = bassNotes[highlightedBassIndex].key;
            const currentBassFingering = bassNotes[highlightedBassIndex].fingering;
            if (Array.isArray(currentBassNote)) {
              currentBassNote.forEach((note, index) => {
                const bassFingering = Array.isArray(currentBassFingering) ? currentBassFingering[index] : currentBassFingering;
                onStartNote(note.replaceAll("/", "").toUpperCase(), "Left", parseInt(bassFingering || "1"));
              });
            } else {
              onStartNote(currentBassNote.replaceAll("/", "").toUpperCase(), "Left", parseInt((currentBassFingering as string) || "1"));
            }
          }
          
          onStart();
        }
        return true;
      }
    });
  }

  // Function to play the demo
  const playDemo = () => {
    if (isDemoPlaying) return;
    
    setIsDemoPlaying(true);
    setHighlightedTrebleIndex(0);
    setHighlightedBassIndex(0);
    
    // Start the demo playback
    playNoteSequence(0, 0);
  };
  
  // Recursive function to play through the notes sequence
  const playNoteSequence = (trebleIndex: number, bassIndex: number) => {
    // Play current treble note
    if (mode === "right" || mode === "both") {
      const currentTrebleNote = trebleNotes[trebleIndex].key;
      if (Array.isArray(currentTrebleNote)) {
        currentTrebleNote.forEach(note => {
          handleKeyDown(note.replaceAll("/", "").toUpperCase());
        });
      } else {
        handleKeyDown(currentTrebleNote.replaceAll("/", "").toUpperCase());
      }
    }
    
    // Play current bass note
    if (mode === "left" || mode === "both") {
      const currentBassNote = bassNotes[bassIndex].key;
      if (Array.isArray(currentBassNote)) {
        currentBassNote.forEach(note => {
          handleKeyDown(note.replaceAll("/", "").toUpperCase());
        });
      } else {
        handleKeyDown(currentBassNote.replaceAll("/", "").toUpperCase());
      }
    }
    
    // Update highlighted indices
    setHighlightedTrebleIndex(trebleIndex);
    setHighlightedBassIndex(bassIndex);
    
    // Calculate the next indices
    const nextTrebleIndex = (trebleIndex + 1) % trebleNotes.length;
    const nextBassIndex = (bassIndex + 1) % bassNotes.length;
    
    // Calculate the delay for the next note based on the current tempo and note duration
    const trebleDelay = (60000 / currentTempo) * getBeats(trebleNotes[trebleIndex].duration);
    const bassDelay = (60000 / currentTempo) * getBeats(bassNotes[bassIndex].duration);
    
    // Use the shortest delay if both hands are playing
    const delay = mode === "both" ? Math.min(trebleDelay, bassDelay) : 
                 mode === "right" ? trebleDelay : bassDelay;
    
    // Check if we've completed the sequence
    if (nextTrebleIndex === 0 && nextBassIndex === 0) {
      setTimeout(() => {
        setIsDemoPlaying(false);
        setHighlightedTrebleIndex(0);
        setHighlightedBassIndex(0);
      }, delay);
    } else {
      // Continue to the next note
      setTimeout(() => {
        playNoteSequence(nextTrebleIndex, nextBassIndex);
      }, delay);
    }
  };

  // Handle treble clef playback
  useEffect(() => {
    if (!isPlaying) return;

    // Function to handle the treble note progression
    const handleTrebleNote = () => {
      // End current note
      const currentTrebleNote = trebleNotes[highlightedTrebleIndex].key;
      const currentTrebleFingering = trebleNotes[highlightedTrebleIndex].fingering;
      if (Array.isArray(currentTrebleNote)) {
        currentTrebleNote.forEach((note, index) => {
          const fingering = Array.isArray(currentTrebleFingering) ? currentTrebleFingering[index] : (currentTrebleFingering as string);
          onEndNote(note.replaceAll("/", "").toUpperCase(), "Right", parseInt(fingering || "1"));
        });
      } else {
        onEndNote(currentTrebleNote.replaceAll("/", "").toUpperCase(), "Right", parseInt((currentTrebleFingering as string) || "1"));
      }

      // Move to next note
      const nextTrebleIndex = (highlightedTrebleIndex + 1) % trebleNotes.length;
      const nextTrebleNote = trebleNotes[nextTrebleIndex].key;
      const nextTrebleFingering = trebleNotes[nextTrebleIndex].fingering;
      
      // Start next note
      if (mode === "right" || mode === "both") {
          if (Array.isArray(nextTrebleNote)) {
            nextTrebleNote.forEach((note, index) => {
              const fingering = Array.isArray(nextTrebleFingering) ? nextTrebleFingering[index] : (nextTrebleFingering as string);
              onStartNote(note.replaceAll("/", "").toUpperCase(), "Right", parseInt(fingering || "1"));
          });
        } else {
          onStartNote(nextTrebleNote.replaceAll("/", "").toUpperCase(), "Right", parseInt((nextTrebleFingering as string) || "1"));
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
      const currentBassFingering = bassNotes[highlightedBassIndex].fingering;
      if (Array.isArray(currentBassNote)) {
        currentBassNote.forEach((note, index) => {
          const fingering = Array.isArray(currentBassFingering) ? currentBassFingering[index] : (currentBassFingering as string);
          onEndNote(note.replaceAll("/", "").toUpperCase(), "Left", parseInt(fingering || "1"));
        });
      } else {
        onEndNote(currentBassNote.replaceAll("/", "").toUpperCase(), "Left", parseInt((currentBassFingering as string) || "1"));
      }

      // Move to next note
      const nextBassIndex = (highlightedBassIndex + 1) % bassNotes.length;
      const nextBassNote = bassNotes[nextBassIndex].key;
      const nextBassFingering = bassNotes[nextBassIndex].fingering;
      // Start next note
      if (mode === "left" || mode === "both") {
        if (Array.isArray(nextBassNote)) {
          nextBassNote.forEach((note, index) => {
            const fingering = Array.isArray(nextBassFingering) ? nextBassFingering[index] : (nextBassFingering as string);
            onStartNote(note.replaceAll("/", "").toUpperCase(), "Left", parseInt(fingering || "1"));
          });
        } else {
          onStartNote(nextBassNote.replaceAll("/", "").toUpperCase(), "Left", parseInt((nextBassFingering as string) || "1"));
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
    
    // Only create factory if we have valid data
    const hasTrebleNotes = trebleNotes && trebleNotes.length > 0;
    const hasBassNotes = bassNotes && bassNotes.length > 0;
    
    if (!hasTrebleNotes && !hasBassNotes) {
      return;
    }

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
  }, [trebleNotes, bassNotes]); // Add dependencies to check for data changes

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
          
          // Add fingering annotations if provided
          if (note.fingering) {
            if (Array.isArray(note.key)) {
              // For chords, add fingering to each note
              note.key.forEach((_, index) => {
                const fingering = Array.isArray(note.fingering) ? note.fingering[index] : note.fingering;
                staveNote.addModifier(factory.Annotation({ 
                  text: fingering,
                  vJustify: "top"  // Position above the note
                }), index);
              });
            } else {
              // For single notes
              staveNote.addModifier(factory.Annotation({ 
                text: Array.isArray(note.fingering) ? note.fingering[0] : note.fingering,
                vJustify: "top"  // Position above the note
              }));
            }
          }
          
          // Remove flags from eighth notes and shorter durations
          if (note.duration === "8" || note.duration === "16") {
            (staveNote as any).setBeam(null);
          }
          
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
    <div className="w-full h-fit -mt-2 flex items-center justify-between gap-12">
      <Metronome 
        tempo={currentTempo} 
        isPlaying={isPlaying || isDemoPlaying} 
        enabled={metronomeEnabled}
        onToggle={(enabled) => {
          setMetronomeEnabled(enabled);
        }}
        onTempoChange={(newTempo) => {
          setCurrentTempo(newTempo);
        }}
      />
      <div id="music-notes" ref={containerRef} className="bg-white rounded-lg flex-1" style={{ height: '300px' }} />
      <div className="flex flex-col gap-2">
        <Button 
          onClick={togglePlaying}
          className="bg-[#F39C12] hover:bg-[#F39C12]/90"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button 
          onClick={playDemo}
          disabled={isDemoPlaying}
          className="bg-[#8E44AD] hover:bg-[#8E44AD]/90 text-white flex items-center"
        >
          <Music className="mr-2 h-4 w-4" />
          Demo
        </Button>
      </div>
    </div>
  );
} 