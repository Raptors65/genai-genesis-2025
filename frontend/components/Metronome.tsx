"use client";

import { useEffect, useRef, useState } from "react";
import * as Switch from "@radix-ui/react-switch";

interface MetronomeProps {
  tempo: number;
  isPlaying: boolean;
  enabled: boolean;
  onTick?: () => void;
  onToggle?: (enabled: boolean) => void;
}

export function Metronome({ tempo, isPlaying, enabled, onTick, onToggle }: MetronomeProps) {
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

  // Start or stop the metronome based on both `isPlaying` and `enabled`
  useEffect(() => {
    if (!isPlaying || !enabled) {
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
  }, [tempo, isPlaying, enabled, onTick]);

  // Handle switch toggle
  const handleSwitchChange = (checked: boolean) => {
    if (onToggle) {
      onToggle(checked);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`w-8 h-8 rounded-full ${
          isTicking ? "bg-[#F39C12]" : "bg-gray-300"
        } transition-colors duration-200`}
      />
      <p className="text-sm text-gray-600">{tempo} BPM</p>
      
      {/* Sliding On/Off Switch */}
      <div className="flex items-center gap-2 mt-2">
        <label htmlFor="metronome-switch" className="text-sm text-gray-600">
          {enabled ? "On" : "Off"}
        </label>
        <Switch.Root
          id="metronome-switch"
          checked={enabled}
          onCheckedChange={handleSwitchChange}
          className="w-[42px] h-[25px] bg-gray-300 rounded-full relative data-[state=checked]:bg-[#F39C12] outline-none cursor-pointer"
        >
          <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
        </Switch.Root>
      </div>
    </div>
  );
}