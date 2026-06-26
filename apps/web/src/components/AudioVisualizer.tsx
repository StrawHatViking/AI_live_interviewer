import React from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  volume: number;
  isAI: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ volume, isAI }) => {
  const normalizedVol = Math.min(Math.max(volume, 0), 1);
  const scale = 1 + normalizedVol * 1.5; // Big smooth expansion

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer pulsing ring */}
      <div
        className={cn(
          "rounded-full transition-all duration-100 ease-out absolute",
          isAI ? "bg-stone-900" : "bg-stone-300"
        )}
        style={{ 
          width: '80px', 
          height: '80px',
          transform: `scale(${scale})`,
          opacity: isAI ? 0.8 - (normalizedVol * 0.5) : 0.3
        }}
      />
      {/* Inner solid dot */}
      <div className={cn(
        "w-4 h-4 rounded-full z-10 transition-colors duration-500",
        isAI ? "bg-stone-900" : "bg-stone-400"
      )} />
    </div>
  );
};
