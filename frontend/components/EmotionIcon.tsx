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
  messageHistory?: string[];
}

export function EmotionIcon({ 
  emotion, 
  size = 48, 
  color = "#8E44AD", 
  message,
  messageHistory = [] 
}: EmotionIconProps) {
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
        <div className="relative bg-white border-2 border-gray-200 rounded-lg shadow-md p-3 max-w-[200px] max-h-[180px] overflow-y-auto">
          {/* Display message history as a chat log */}
          {messageHistory.length > 0 && (
            <div className="space-y-2 mb-2">
              {messageHistory.slice(0, -1).map((historyMessage, index) => (
                <div key={index} className="text-xs text-gray-500 border-b pb-2">
                  <p dangerouslySetInnerHTML={{ __html: historyMessage }}></p>
                </div>
              ))}
            </div>
          )}
          
          {/* Display current message */}
          <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: message }}></p>
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-0 h-0 
            border-t-[15px] border-t-transparent
            border-l-[15px] border-l-gray-200
            border-b-[15px] border-b-transparent">
          </div>
        </div>
      )}
      <Icon size={size} color={color} />
    </div>
  );
} 