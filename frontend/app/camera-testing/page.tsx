import HandDetection from "@/components/WebcamFeed";
import HandPianoDetection from "@/components/WebcamFeed";
import HandTracking from "@/components/WebcamFeed";
import Image from "next/image";

export default function Home() {
  return (
    <HandPianoDetection />
  );
}
