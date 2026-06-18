import { GoogleGenAI, Modality } from "@google/genai";
import { useEffect, useRef, useState } from "react";

const MODEL_NAME = "gemini-3.1-flash-live-preview";

export function useGeminiLive(token: string | null) {
  const sessionRef = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Add these with your other refs at the top
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0); // Keeps track of when the next chunk should play

  // 1. Manage the WebSocket Lifecycle
  useEffect(() => {
    console.log("Token:", token);
    if (!token) return;

    const ai = new GoogleGenAI({
      apiKey: token ?? undefined,
      httpOptions: {
        apiVersion: "v1alpha",
      },
    });
    clientRef.current = ai;

    async function startSession() {
      try {
        const session = await ai.live.connect({
          model: MODEL_NAME,
          // config: {
          //   responseModalities: [Modality.AUDIO],
          // },
          callbacks: {
            onopen: () => setConnected(true),
            onclose: () => console.log("Closed"),
            onerror: (e) => console.error("Error:", e),
            onmessage: (message) => {
              // 2. The official documentation's message listener matches your audio playback
              const content = message.serverContent;
              if (content?.modelTurn?.parts) {
                for (const part of content.modelTurn.parts) {
                  if (part.inlineData?.data) {
                    // Handle your playing logic right here inside the official callback
                    playAudioOutput(part.inlineData.data);
                  }
                }
              }
            },
          },
        });
        sessionRef.current = session;
      } catch (err) {
        console.error("SDK Connection Error:", err);
        setConnected(false);
      }
    }

    startSession();

    // Cleanup hook if the user changes tabs or routes away
    return () => {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
    };
  }, [token]);
  // 2. Start the Mic and pipe raw 16kHz PCM data to Gemini
  async function startMic() {
    if (!sessionRef.current) {
      console.log("No active session available!");
      return;
    }

    // Force context at Gemini's exact native recording speed (16000Hz)
    if (!audioContextRef.current) {
      audioContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({
        sampleRate: 16000,
      });
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    processorRef.current = audioContextRef.current.createScriptProcessor(
      4096,
      1,
      1,
    );

    sourceRef.current.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);

    processorRef.current.onaudioprocess = (e) => {
      if (!sessionRef.current) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const buffer = new ArrayBuffer(inputData.length * 2);
      const view = new DataView(buffer);

      // Converts float streams into standard linear 16-bit PCM bytes
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }

      const base64Chunk = btoa(String.fromCharCode(...new Uint8Array(buffer)));

      // 5. Official SDK layout for sending chunks safely
      sessionRef.current.sendRealtimeInput({
        audio: {
          data: base64Chunk,
          mimeType: "audio/pcm;rate=16000",
        },
      });
    };
  }

  // 3. Stop processing microphone data
  function stopMic() {
    cleanupMic();
  }

  function cleanupMic() {
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
  }

  // 4. Play back the 24kHz raw PCM responses streamed from Gemini
  function playAudioOutput(base64Audio: string) {
    // 1. Only create the speaker context ONCE
    if (!playbackContextRef.current) {
      playbackContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 24000 });
    }
    const ctx = playbackContextRef.current;

    const binaryStr = atob(base64Audio);
    const len = binaryStr.length / 2;
    const int16Array = new Int16Array(len);

    for (let i = 0; i < len; i++) {
      int16Array[i] =
        (binaryStr.charCodeAt(i * 2 + 1) << 8) | binaryStr.charCodeAt(i * 2);
    }

    const float32Array = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const val = int16Array[i];
      if (val !== undefined) float32Array[i] = val / 32768;
    }

    const buffer = ctx.createBuffer(1, len, 24000);
    buffer.getChannelData(0).set(float32Array);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    // 2. THE QUEUE SYSTEM: Schedule the chunks to play one after another
    // If the audio context timer is further ahead than our next play time, reset it
    if (nextPlayTimeRef.current < ctx.currentTime) {
      nextPlayTimeRef.current = ctx.currentTime;
    }

    // Start playing this chunk exactly when the previous chunk finishes
    source.start(nextPlayTimeRef.current);

    // Advance the timer by the length of this chunk
    nextPlayTimeRef.current += buffer.duration;
  }

  return { startMic, stopMic, connected };
}
