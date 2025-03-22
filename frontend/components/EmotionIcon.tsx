"use client";

import { 
  Smile, 
  Frown, 
  Angry, 
  Laugh, 
  Meh, 
  Heart,
} from "lucide-react";

type EmotionType = 
  | "happy" 
  | "sad" 
  | "angry" 
  | "laugh" 
  | "neutral" 
  | "love";

interface EmotionIconProps {
  emotion: EmotionType;
  size?: number;
  color?: string;
  message?: string;
}

export function EmotionIcon({ emotion, size = 48, color = "#8E44AD", message }: EmotionIconProps) {
  const iconMap = {
    happy: Smile,
    sad: Frown,
    angry: Angry,
    laugh: Laugh,
    neutral: Meh,
    love: Heart,
  };

  const Icon = iconMap[emotion];

  return (
    <div className="flex items-center gap-4">
      {message && (
        <div className="relative bg-white border-2 border-gray-200 rounded-lg shadow-md p-3 max-w-[200px]">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-0 h-0 
            border-t-[15px] border-t-transparent
            border-l-[15px] border-l-gray-200
            border-b-[15px] border-b-transparent">
          </div>
          <p className="text-sm text-gray-700">{message}</p>
        </div>
      )}
      <Icon size={size} color={color} />
    </div>
  );
} 