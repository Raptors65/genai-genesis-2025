"use client";

import { useEffect, useRef } from "react";
import { Renderer, Stave, StaveNote, Formatter, Voice, Accidental } from "vexflow";

interface NoteDisplayProps {
  currentNote: string | null;
}

export function NoteDisplay({ currentNote }: NoteDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert note name to VexFlow format
  const convertToVexFlowNote = (note: string | null): string => {
    if (!note) return "c/4"; // Default to middle C
    
    try {
      // Properly detect accidentals without misinterpreting F and B notes
      let baseNote = '';
      let octave = '';
      
      // Extract the octave - should be the last character
      octave = note.charAt(note.length - 1);
      
      // Check if the note has exactly 3 characters and the middle character is 'F' or 'S'
      // This pattern would match notes like "CF4" or "DS3" (C-flat in octave 4 or D-sharp in octave 3)
      const isStandardAccidentalPattern = 
        note.length === 3 && 
        (note.charAt(1) === 'F' || note.charAt(1) === 'S');
      
      if (isStandardAccidentalPattern) {
        const noteLetter = note.charAt(0);
        const accidentalChar = note.charAt(1);
        
        if (accidentalChar === "S") {
          // Sharp note
          baseNote = noteLetter.toLowerCase() + "#";
        } else if (accidentalChar === "F") {
          // Flat note
          baseNote = noteLetter.toLowerCase() + "b";
        }
      } else {
        // Simple note like "C4" or "F3" or "B3"
        // Or non-standard pattern - just use the note name without the octave
        baseNote = note.charAt(0).toLowerCase();
      }
      
      const vexFlowNote = `${baseNote}/${octave}`;
      return vexFlowNote;
    } catch (error) {
      console.error("Error converting note:", note, error);
      return "c/4"; // Default to middle C if there's an error
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous content
    containerRef.current.innerHTML = '';
    
    // Create a unique ID for the SVG element
    const svgId = `vf-svg-${Date.now()}`;
    
    // Create SVG element container
    const svgContainer = document.createElement('div');
    svgContainer.id = svgId;
    containerRef.current.appendChild(svgContainer);
    
    try {
      // Initialize renderer
      const renderer = new Renderer(svgContainer, Renderer.Backends.SVG);
      
      // Get container width to make it responsive
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = 150;
      
      // Size our SVG to fit the container
      renderer.resize(containerWidth, containerHeight);
      
      // Get the drawing context
      const context = renderer.getContext();
      
      // Create and draw the staff (stave)
      const stave = new Stave(10, 20, containerWidth - 20);
      stave.addClef('treble');
      stave.setContext(context).draw();
      
      // Only add a note if currentNote is not null
      if (currentNote) {
        // Convert note to VexFlow format
        const vexNote = convertToVexFlowNote(currentNote);
        
        // Create the note
        const note = new StaveNote({
          keys: [vexNote],
          duration: "q"
        });
        
        // Simple direct check for accidentals in the original note
        // If the second character is 'b', it's a flat
        // If the second character is '#', it's a sharp
        const hasFlat = currentNote.length === 3 && currentNote.charAt(1) === 'b';
        const hasCustomFlat = currentNote.length === 3 && currentNote.charAt(1) === 'F';
        const hasSharp = currentNote.length === 3 && currentNote.charAt(1) === '#';
        const hasCustomSharp = currentNote.length === 3 && currentNote.charAt(1) === 'S';
        
        // Apply accidentals based on direct checks
        if (hasSharp || hasCustomSharp) {
          note.addModifier(new Accidental("#"), 0);
        } else if (hasFlat || hasCustomFlat) {
          note.addModifier(new Accidental("b"), 0);
        }
        
        // Create a voice with only 1 beat to match our single quarter note
        const voice = new Voice({
          numBeats: 1,
          beatValue: 4
        });
        voice.addTickable(note);
        
        // Format and draw
        new Formatter().joinVoices([voice]).format([voice], containerWidth - 100);
        voice.draw(context, stave);
      }
      
    } catch (error) {
      console.error("Error rendering note:", error);
      
      // Display a fallback message if rendering fails
      const errorMessage = document.createElement('div');
      errorMessage.textContent = 'Could not render staff. Check console for errors.';
      errorMessage.style.color = 'red';
      containerRef.current.appendChild(errorMessage);
    }
  }, [currentNote]);

  return (
    <div className="p-2 bg-white rounded-lg shadow-sm w-full max-w-full overflow-hidden">
      <div 
        ref={containerRef}
        className="flex justify-center items-center w-full overflow-hidden"
      ></div>
      <div className="text-sm text-center text-gray-500 mt-2 truncate">
        Current note: {currentNote || "-"}
      </div>
    </div>
  );
} 