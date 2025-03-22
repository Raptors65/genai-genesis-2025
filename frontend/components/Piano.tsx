import { useState, useEffect } from 'react';

interface PianoKeyProps {
  isBlack: boolean;
  isActive: boolean;
}

const PianoKey = ({ isBlack, isActive }: PianoKeyProps) => {
  return (
    <div
      className={`relative ${isBlack ? 'w-8 h-32 -mx-4 z-10' : 'w-12 h-48'}`}
    >
      <div
        className={`absolute w-full h-full rounded-b-lg transition-transform duration-100 ${
          isBlack
            ? 'bg-black'
            : 'bg-white border border-gray-800'
        } ${isActive ? 'translate-y-3' : ''}`}
      />
    </div>
  );
};

export const Piano = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const generateKeys = (octaves: number) => {
    const keys = [];
    for (let octave = 0; octave < octaves; octave++) {
      keys.push({ isBlack: false }); // White
      keys.push({ isBlack: true });  // Black
      keys.push({ isBlack: false }); // White
      keys.push({ isBlack: true });  // Black
      keys.push({ isBlack: false }); // White
      keys.push({ isBlack: false }); // White
      keys.push({ isBlack: true });  // Black
      keys.push({ isBlack: false }); // White
      keys.push({ isBlack: true });  // Black
      keys.push({ isBlack: false }); // White
      keys.push({ isBlack: true });  // Black
      keys.push({ isBlack: false }); // White
    }
    return keys;
  };

  const keys = generateKeys(3); // Generate 3 octaves

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % keys.length);
    }, 150); // Change key every 200ms

    return () => clearInterval(interval);
  }, [keys.length]);

  return (
    <div className="absolute inset-0 flex justify-center items-center opacity-10">
      <div className="flex items-begin h-32">
        {keys.map(({ isBlack }, index) => (
          <PianoKey
            key={index}
            isBlack={isBlack}
            isActive={index === activeIndex}
          />
        ))}
      </div>
    </div>
  );
}; 