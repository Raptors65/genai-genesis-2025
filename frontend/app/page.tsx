"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Clock, BarChart } from "lucide-react";
import { Piano as PianoComponent } from "@/components/Piano";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24 relative">
        <PianoComponent />
        <div className="text-center max-w-3xl mx-auto relative z-10">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#F39C12] to-[#F39C12]/80">
            Master Piano with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your personal AI piano tutor that adapts to your learning style and helps you master the piano at your own pace.
          </p>
          <Button size="lg" className="bg-[#F39C12] text-white hover:bg-[#F39C12]/90">
            Start Learning Now
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-[#8E44AD] transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-[#8E44AD]/10 rounded-full flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-[#8E44AD]" />
              </div>
              <CardTitle className="text-black">Real-time Feedback</CardTitle>
              <CardDescription className="text-gray-600">Get instant feedback on your playing technique and accuracy.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-[#8E44AD] transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-[#8E44AD]/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-[#8E44AD]" />
              </div>
              <CardTitle className="text-black">Personalized Learning</CardTitle>
              <CardDescription className="text-gray-600">AI adapts to your progress and creates custom practice sessions.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-[#8E44AD] transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-[#8E44AD]/10 rounded-full flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-[#8E44AD]" />
              </div>
              <CardTitle className="text-black">Progress Tracking</CardTitle>
              <CardDescription className="text-gray-600">Monitor your improvement with detailed analytics and insights.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-[#F39C12] text-white border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Musical Journey?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are learning piano with our AI tutor. Start your free trial today!
            </p>
            <Button size="lg" variant="outline" className="bg-white text-[#F39C12] hover:text-[#F39C12]">
              Try for Free
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center border-t">
        <p>© 2025 Pianowise. All rights reserved.</p>
      </footer>
    </div>
  );
}
