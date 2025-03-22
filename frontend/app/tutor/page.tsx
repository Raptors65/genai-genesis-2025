"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { EmotionIcon } from "@/components/EmotionIcon";
import { MusicNotes } from "@/components/MusicNotes";

export default function TutorPage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-white">
      <div className="container mx-auto px-4 h-full">
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Piano Section - Top 1/3 */}
          <ResizablePanel defaultSize={33} minSize={20} maxSize={50}>
            <div className="h-full bg-white">
              <div className="bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)]">
                <MusicNotes />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle/>
          <ResizablePanel defaultSize={67}>
            <div className="h-full bg-white relative">
              <div className="bg-white rounded-lg m-4 p-4 h-[calc(100%-2rem)]">
                <p className="text-gray-500">Tutor interface coming soon...</p>
              </div>
              {/* Emotion Icon with Dialogue */}
              <div className="absolute top-4 right-8">
                <EmotionIcon 
                  emotion="sad" 
                  size={48} 
                  message="That note was a bit off. Let's try again!" 
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
} 