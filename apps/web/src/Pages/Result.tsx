import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { API_URL } from "../lib/config";

interface InterviewResult {
  id: string;
  score: number;
  feedback: string | null;
  status: string;
  conversations?: { message: string; type: "User" | "Assistant" }[];
}

const Result = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await axios.get(
          `${API_URL}/start-interview/${interviewId}/results`,
        );
        setResult(res.data.data);
      } catch (err) {
        setError("Failed to load results.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#FAFAFA] flex items-center justify-center font-sans">
        <div className="w-4 h-4 bg-stone-900 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen w-screen bg-[#FAFAFA] flex flex-col items-center justify-center font-sans space-y-6">
        <p className="text-stone-500 tracking-wide text-center px-4">{error || "No results found."}</p>
        <button
          onClick={() => navigate("/setup")}
          className="px-6 py-3 rounded-full border border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-900 transition-colors text-sm font-medium tracking-wide uppercase cursor-pointer"
        >
          Start New Interview
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#FAFAFA] flex flex-col items-center justify-start pt-24 md:pt-32 p-8 font-sans text-stone-900 relative">
      
      {/* Header */}
      <div className="hidden md:flex absolute top-12 w-full justify-center">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-stone-400 uppercase">Interview Complete</h2>
      </div>

      <div className="w-full max-w-3xl flex flex-col items-center space-y-16">
        
        {/* Score Section */}
        <div className="text-center space-y-4">
          <p className="text-sm font-medium tracking-[0.2em] text-stone-400 uppercase">Your Score</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-[8rem] md:text-[10rem] font-bold tracking-tighter text-stone-900 leading-none">
              {result.score}
            </span>
            <span className="text-3xl text-stone-300 font-light">/100</span>
          </div>
        </div>

        {/* Feedback Section */}
        {result.feedback && (
          <div className="w-full text-center space-y-6">
            <p className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">AI Feedback</p>
            <p className="text-lg md:text-xl leading-relaxed text-stone-600 font-medium max-w-2xl mx-auto">
              "{result.feedback}"
            </p>
          </div>
        )}

        <div className="pt-8 w-full md:w-auto px-4 md:px-0">
          <button
            onClick={() => navigate("/setup")}
            className="w-full md:w-auto px-8 py-4 rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-all duration-300 text-sm font-bold tracking-[0.1em] uppercase cursor-pointer shadow-[0_10px_30px_rgba(28,25,23,0.15)] hover:shadow-[0_10px_40px_rgba(28,25,23,0.25)] hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Start New Session
          </button>
        </div>
      </div>

      {/* Transcript Section */}
      {result.conversations && result.conversations.length > 0 && (
        <div className="w-full max-w-3xl mt-32 space-y-10 pb-32">
          <div className="text-center mb-12">
            <div className="h-px w-24 bg-stone-200 mx-auto mb-8"></div>
            <p className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">Session Transcript</p>
          </div>
          
          <div className="space-y-6">
            {result.conversations.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'User' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%] p-6 rounded-3xl ${
                  msg.type === 'User' 
                    ? 'bg-stone-900 text-stone-50 rounded-br-sm' 
                    : 'bg-white border border-stone-100 text-stone-800 rounded-bl-sm shadow-sm'
                }`}>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3 opacity-40">
                    {msg.type === 'User' ? 'You' : 'Interviewer'}
                  </p>
                  <p className="text-sm md:text-[15px] leading-relaxed font-medium">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;
