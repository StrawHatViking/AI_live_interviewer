import { useGeminiLive } from "@/hooks/useGeminiLive";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

const InterviewRoom = () => {
  const { id } = useParams();
  const [token, settoken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { connected, startMic, stopMic } = useGeminiLive(token);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await axios.post(
          `http://localhost:8000/api/v1/start-interview/${id}`,
        );
        const data = res.data;
        settoken(data.data.token);
        console.log("Token:", token);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchToken();
  }, [id]);
  if (loading) return <div>Setting up interview...</div>;

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2>Interview Session</h2>
      <p>Status: {connected ? "🟢 Online" : "🔴 Disconnected"}</p>

      <div>
        <button
          onClick={startMic}
          disabled={!connected}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Start Speaking
        </button>

        <button
          onClick={stopMic}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Mute Mic
        </button>
      </div>
    </div>
  );
};

export default InterviewRoom;
