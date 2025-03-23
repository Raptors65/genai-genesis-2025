"use client";

import { Smile, Frown, Angry, Laugh, Meh, Heart } from "lucide-react";

type EmotionType = "happy" | "sad" | "angry" | "laugh" | "neutral" | "love";

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
  messageHistory = [],
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

  // Only show the chat container if there are messages
  const hasMessages = message || messageHistory.length > 0;

  return (
    <div className="flex items-end gap-4">
      {hasMessages && (
        <div className="relative max-h-[450px] overflow-y-auto pr-4 flex flex-col-reverse">
          {/* Current message */}
          {message && (
            <div className="mb-2 flex items-center">
              <div className="relative bg-white border-2 border-gray-200 rounded-lg shadow-md p-3 max-w-[240px]">
                <p
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: message }}
                ></p>
                <div
                  className="absolute right-0 bottom-4 translate-x-4 w-0 h-0 
                  border-t-[10px] border-t-transparent
                  border-l-[10px] border-l-gray-200
                  border-b-[10px] border-b-transparent"
                ></div>
              </div>
            </div>
          )}

          {/* Message history as separate bubbles (no triangles) */}
          {messageHistory.slice(0, -1).map((historyMessage, index) => (
            <div key={index} className="mb-2 flex items-center">
              <div className="relative bg-white border-2 border-gray-100 rounded-lg shadow-sm p-2 max-w-[240px]">
                <p
                  className="text-xs text-gray-500"
                  dangerouslySetInnerHTML={{ __html: historyMessage }}
                ></p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Icon size={size} color={color} />
    </div>
  );
}
