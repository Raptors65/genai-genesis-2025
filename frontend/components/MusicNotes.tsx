"use client";

import { useEffect, useRef, useState } from "react";
import { Factory } from "vexflow";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface Note {
  key: string | string[];  // Can be a single note or array of notes
  duration: "w" | "h" | "q" | "8" | "16"; // w=whole, h=half, q=quarter, 8=eighth, 16=sixteenth
  fingering?: string | string[];  // Optional fingering for each note
}

interface MusicNotesProps {
  tempo?: number;
  notes?: Note[];
  onStartNote: (note: string, hand: string, finger: number) => void;
  onEndNote: (note: string, hand: string, finger: number) => void;
  onStart: () => void;
  onEnd: () => void;
}

export function MusicNotes({ 
  tempo = 80, 
  notes = [
    { key: ["c/4", "e/4"], duration: "q", fingering: ["1", "3"] },  // C major chord
    { key: ["d/4"], duration: "q", fingering: "2" },  // D minor chord
    { key: ["e/4", "g/4"], duration: "h", fingering: ["3", "5"] },  // E minor chord
    { key: ["c/4"], duration: "q", fingering: "1" },  // C major chord
    { key: ["d/4"], duration: "q", fingering: "2" },  // D minor chord
    { key: ["e/4"], duration: "h", fingering: "3" },  // E minor chord
    { key: ["d/4", "f/4", "a/4"], duration: "w", fingering: ["2", "4", "5"] },  // D minor chord
    { key: ["d/4"], duration: "8", fingering: "2" },  // D minor chord
    { key: ["e/4"], duration: "8", fingering: "3" },  // E minor chord
    { key: ["e/4"], duration: "8", fingering: "3" },  // E minor chord
    { key: ["e/4"], duration: "8", fingering: "3" },  // E minor chord
    { key: ["e/4", "g/4", "b/4"], duration: "h", fingering: ["1", "3", "5"] }   // E minor chord
  ],
  onStartNote,
  onEndNote,
  onStart,
  onEnd
}: MusicNotesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const factoryRef = useRef<Factory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedNote, setHighlightedNote] = useState(0);

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
    setIsPlaying((prev) => !prev);
  }

  // Handle starting the first note when playing begins
  useEffect(() => {
    if (isPlaying && highlightedNote === 0) {
      const currentNote = notes[highlightedNote].key;
      if (Array.isArray(currentNote)) {
        currentNote.forEach(note => {
          onStartNote(note.replaceAll("/", "").toUpperCase(), "Right", 1);
        });
      } else {
        onStartNote(currentNote.replaceAll("/", "").toUpperCase(), "Right", 1);
      }
      onStart();
    }
  }, [isPlaying, highlightedNote]);

  // Reset highlighted note when stopping
  useEffect(() => {
    if (!isPlaying) {
      setHighlightedNote(0);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const currentNote = notes[highlightedNote].key;
      if (Array.isArray(currentNote)) {
        currentNote.forEach(note => {
          onEndNote(note.replaceAll("/", "").toUpperCase(), "Right", 1);
        });
      } else {
        onEndNote(currentNote.replaceAll("/", "").toUpperCase(), "Right", 1);
      }

      if (highlightedNote === notes.length - 1) {
        onEnd();
      }

      const nextNote = notes[(highlightedNote + 1) % notes.length].key;
      if (Array.isArray(nextNote)) {
        nextNote.forEach(note => {
          onStartNote(note.replaceAll("/", "").toUpperCase(), "Right", 1);
        });
      } else {
          onStartNote(nextNote.replaceAll("/", "").toUpperCase(), "Right", 1);
      }
      setHighlightedNote((prev) => (prev + 1) % notes.length);
    }, (60000 / tempo) * getBeats(notes[highlightedNote].duration));

    return () => clearInterval(interval);
  }, [isPlaying, highlightedNote]);

  // Initialize VexFlow factory once
  useEffect(() => {
    if (!containerRef.current) return;

    // Create a VexFlow factory
    factoryRef.current = new Factory({
      renderer: { elementId: containerRef.current.id, width: 900, height: 200 },
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
    let currentStaveNotes: any[] = [];

    // Create and draw staves and notes as we go
    for (let i = 0; i < staveCount; i++) {
      const stave = factory.Stave({ 
        x: 10 + (i * (staveWidth)) + (i == 0 ? 0 : 50), 
        y: 40, 
        width: staveWidth + (i == 0 ? 50 : 0)
      });
      
      // Add clef and time signature only to first stave
      if (i === 0) {
        stave.addClef("treble").setContext(context).draw();
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
        
        if (currentStaveIndex === highlightedNote) {
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
        const beams: any[] = [];
        let currentBeamNotes: any[] = [];
        
        currentStaveNotes.forEach((note, index) => {
          const duration = note.duration;
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
  }, [notes, highlightedNote]);

  return (
    <div className="w-full h-full flex items-center justify-center gap-4">
      <div id="music-notes" ref={containerRef} className="bg-white rounded-lg" style={{ width: '1220px' }} />
      <Button 
        onClick={togglePlaying}
        className="bg-[#F39C12] hover:bg-[#F39C12]/90"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
    </div>
  );
} 