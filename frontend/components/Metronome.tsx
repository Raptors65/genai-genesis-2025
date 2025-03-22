"use client";

import { useEffect, useRef, useState } from "react";

interface MetronomeProps {
  tempo: number;
  isPlaying: boolean;
  onTick?: () => void; // Optional callback
}

export function Metronome({ tempo, isPlaying, onTick }: MetronomeProps) {
  const [isTicking, setIsTicking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Custom sound
  const playTickSound = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = gainNodeRef.current;

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime);

    gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextRef.current.currentTime + 0.1
    );

    // Connect and play the sound
    oscillator.connect(gainNode);
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.1); // Stop after 100ms
  };

  // Start or stop the metronome based on `isPlaying`
  useEffect(() => {
    if (!isPlaying) {
      setIsTicking(false);
      return;
    }

    const interval = setInterval(() => {
      setIsTicking((prev) => !prev); // Toggle visual indicator
      if (onTick) onTick(); // Trigger callback if provided

      playTickSound(); // Play the custom sound
    }, (60000 / tempo)); // Convert tempo (BPM) to ms per beat

    return () => {
      clearInterval(interval);
      setIsTicking(false);
    };
  }, [tempo, isPlaying, onTick]);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`w-8 h-8 rounded-full ${
          isTicking ? "bg-[#F39C12]" : "bg-gray-300"
        } transition-colors duration-200`}
      />
      <p className="text-sm text-gray-600">{tempo} BPM</p>
    </div>
  );
}