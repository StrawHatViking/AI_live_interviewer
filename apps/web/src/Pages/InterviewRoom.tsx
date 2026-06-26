import { useGeminiLive } from "@/hooks/useGeminiLive";
import { API_URL } from "@/lib/config";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { Mic, MicOff, X } from "lucide-react";

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [token, settoken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(true);

  const { connected, startMic, stopMic, startConversation, isAISpeaking, volume, subtitles } = useGeminiLive(
    token,
    id,
  );

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await axios.post(`${API_URL}/start-interview/${id}`);
        settoken(res.data.data.token);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchToken();
  }, [id]);

  const handleMicToggle = () => {
    if (isMicMuted) {
      startMic();
      setIsMicMuted(false);
    } else {
      stopMic();
      setIsMicMuted(true);
    }
  };

  const handleStartConversation = () => {
    setHasStarted(true);
    startConversation();
  };

  if (loading || !connected) {
    return (
      <div className="min-h-screen w-screen bg-[#FAFAFA] flex flex-col items-center justify-center font-sans">
         <div className="w-4 h-4 bg-stone-900 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (connected && !hasStarted) {
    return (
      <div className="min-h-screen w-screen bg-[#FAFAFA] flex flex-col items-center justify-center font-sans p-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 mb-4">Ready to Begin</h2>
        <p className="text-stone-500 font-medium mb-8 max-w-md">
          Your AI interviewer is connected and ready. Make sure you are in a quiet environment.
        </p>
        <button 
          onClick={handleStartConversation}
          className="px-8 py-4 rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-all text-sm font-bold tracking-[0.1em] uppercase shadow-lg cursor-pointer"
        >
          Join Interview
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#FAFAFA] flex flex-col items-center p-6 md:p-12 font-sans text-stone-900 overflow-x-hidden relative">
      
      {/* Top Header - Ultra Minimal */}
      <div className="w-full flex justify-center py-6 shrink-0">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-stone-400 uppercase">Interview Session</h2>
      </div>

      {/* Visualizer & Premium Typography Subtitles */}
      <div className="flex-1 w-full flex flex-col items-center justify-center max-w-4xl space-y-12">
        <AudioVisualizer volume={volume} isAI={isAISpeaking} />
        
        <div className="min-h-[120px] flex flex-col items-center justify-start px-4 w-full max-w-3xl overflow-y-auto max-h-[40vh]">
          <p className="text-xl md:text-3xl font-medium tracking-tight text-stone-600 text-center leading-relaxed">
            {subtitles || (isAISpeaking ? "..." : "")}
          </p>
        </div>
      </div>

      {/* Minimalist Borderless Controls */}
      <div className="w-full max-w-sm flex justify-center items-center gap-16 py-8 shrink-0">
        <button
          onClick={handleMicToggle}
          className="group flex flex-col items-center transition-all"
        >
          <div className={`p-4 rounded-full transition-all duration-300 ${isMicMuted ? 'text-stone-400 hover:text-stone-900' : 'text-stone-900 bg-stone-200'}`}>
            {isMicMuted ? (
              <MicOff className="w-7 h-7" strokeWidth={1.5} />
            ) : (
              <Mic className="w-7 h-7" strokeWidth={1.5} />
            )}
          </div>
        </button>

        <button
          onClick={() => { stopMic(); navigate(`/results/${id}`); }}
          className="group flex flex-col items-center transition-all text-stone-400 hover:text-red-500"
        >
          <div className="p-4 rounded-full transition-all duration-300">
            <X className="w-7 h-7" strokeWidth={1.5} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default InterviewRoom;
