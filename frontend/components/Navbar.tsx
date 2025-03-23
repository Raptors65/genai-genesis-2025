"use client";

import { Button } from "@/components/ui/button";
import { Piano } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();
  const isTutorPage = pathname === "/tutor";

  useEffect(() => {
    if (!isTutorPage) return;

    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      // Show navbar when mouse is in top 64px (height of navbar)
      const shouldShow = e.clientY <= 64;
      
      if (shouldShow) {
        setIsVisible(true);
        // Clear any existing timeout
        if (timeoutId) clearTimeout(timeoutId);
      } else {
        // Set a timeout to hide the navbar after 1 second of mouse being away
        timeoutId = setTimeout(() => {
          setIsVisible(false);
        }, 1000);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isTutorPage]);

  return (
    <nav className={`border-b fixed top-0 left-0 right-0 bg-white z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Piano className="w-6 h-6 text-[#F39C12]" />
          <div className="text-xl font-bold font-serif italic">pianowise</div>
        </Link>
        <div className="flex gap-4">
          <Link href="/practice">
            <Button variant="ghost" className="text-[#F39C12] hover:text-[#F39C12]/80">Practice</Button>
          </Link>
          <a href="/tutor">
            <Button className="bg-[#F39C12] hover:bg-[#f39d12a7] text-white">Tutor</Button>
          </a>
        </div>
      </div>
    </nav>
  );
} 