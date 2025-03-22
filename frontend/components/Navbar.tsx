"use client";

import { Button } from "@/components/ui/button";
import { Piano } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Piano className="w-6 h-6 text-[#F39C12]" />
          <div className="text-xl font-bold font-serif italic">pianowise</div>
        </Link>
        <div className="flex gap-4">
          <Link href="/practice">
            <Button variant="ghost" className="text-[#F39C12] hover:text-[#F39C12]/80">Practice</Button>
          </Link>
          <Link href="/tutor">
            <Button className="bg-[#F39C12] hover:bg-[#f39d12a7] text-white">Tutor</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
} 