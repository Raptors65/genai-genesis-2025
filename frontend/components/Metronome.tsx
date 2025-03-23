"use client";

import { useEffect, useRef, useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { Slider, Box } from "@mui/material";

interface MetronomeProps {
  tempo: number;
  isPlaying: boolean;
  enabled: boolean;
  onTick?: () => void;
  onToggle?: (enabled: boolean) => void;
  onTempoChange?: (tempo: number) => void;
}

export function Metronome({ 
  tempo, 
  isPlaying, 
  enabled, 
  onTick, 
  onToggle,
  onTempoChange
}: MetronomeProps) {
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

  // Get indicator color based on state
  const getIndicatorColor = () => {
    if (!isPlaying || !enabled) {
      return "bg-gray-300"; // Gray when off
    }
    return isTicking ? "bg-[#F39C12]" : "bg-gray-300"; // Flash between orange and purple when on
  };

  // Handle switch toggle
  const handleSwitchChange = (checked: boolean) => {
    if (onToggle) {
      onToggle(checked);
    }
  };

  // Handle tempo slider change
  const handleTempoChange = (_event: Event, value: number | number[]) => {
    if (onTempoChange && typeof value === 'number') {
      onTempoChange(value);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Sliding On/Off Switch */}
      <Switch.Root
        id="metronome-switch"
        checked={enabled}
        onCheckedChange={handleSwitchChange}
        className={`w-[42px] h-[25px] rounded-full relative ${
          enabled ? 'bg-[#F39C12]' : 'bg-gray-300'
        } outline-none cursor-pointer`}
      >
        <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
      </Switch.Root>
      
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full ${getIndicatorColor()} transition-colors duration-200 mb-1`}
        />
        <p className="text-sm text-gray-600">{tempo} BPM</p>
      </div>
      
      {/* Tempo Slider */}
      <Box sx={{ width: 140 }}>
        <Slider
          aria-label="Metronome Speed"
          value={tempo}
          onChange={handleTempoChange}
          valueLabelDisplay="auto"
          step={10}
          marks
          min={40}
          max={180}
          size="small"
          sx={{
            color: '#F39C12',
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: '#F39C12',
            }
          }}
        />
      </Box>
    </div>
  );
}