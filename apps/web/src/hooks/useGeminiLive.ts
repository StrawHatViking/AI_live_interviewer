import { API_URL } from "@/lib/config";
import { StartSensitivity, EndSensitivity, GoogleGenAI } from "@google/genai";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const MODEL_NAME = "gemini-3.1-flash-live-preview";

export function useGeminiLive(
  token: string | null,
  interviewId: string | undefined,
) {
  const sessionRef = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const transcriptRef = useRef<string>("");
  const conversationHistory = useRef<
    { type: "User" | "Assistant"; message: string }[]
  >([]);

  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0); // Keeps track of when the next chunk should play
  const userAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const aiAnalyserRef = useRef<AnalyserNode | null>(null);
  const isAISpeakingRef = useRef<boolean>(false);

  const [volume, setVolume] = useState<number>(0);
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);

  const [subtitles, setSubtitles] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
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
          config: {
            realtimeInputConfig: {
              automaticActivityDetection: {
                disabled: false,
                startOfSpeechSensitivity:
                  StartSensitivity.START_SENSITIVITY_LOW,
                endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
                prefixPaddingMs: 500,
                silenceDurationMs: 1000,
              },
            },
          },
          callbacks: {
            onopen: () => {
              setConnected(true);
              // We no longer automatically start the conversation here.
              // Firefox requires a direct user gesture to play audio.
            },
            onclose: () => {},
            onerror: (e) => console.error("WebSocket Error:", e),
            onmessage: async (message) => {
              const content = message.serverContent;

              if (content?.interrupted) {
                if (playbackContextRef.current) {
                  playbackContextRef.current.close();
                  playbackContextRef.current = null;
                  nextPlayTimeRef.current = 0;
                }
                setSubtitles("");
              }
              if (content?.modelTurn?.parts) {
                for (const part of content.modelTurn.parts) {
                  if (part.inlineData?.data) {
                    // Handle your playing logic right here inside the official callback
                    playAudioOutput(part.inlineData.data);
                  }
                }
              }

              if (
                message.toolCall?.functionCalls &&
                message.toolCall.functionCalls.length > 0
              ) {
                const functionCall = message.toolCall.functionCalls[0];

                if (functionCall?.name === "end_interview") {
                  const score = functionCall.args?.score as number;
                  const feedback = functionCall.args?.feedback as string;
                  if (score) {
                    await axios.patch(
                      `${API_URL}/start-interview/${interviewId}/score`,
                      {
                        score,
                        feedback,
                        conversations: conversationHistory.current,
                      },
                    );

                    navigate(`/results/${interviewId}`);
                  }
                }
              }

              if (content?.inputTranscription?.text) {
                const history = conversationHistory.current;
                if (
                  history.length > 0 &&
                  history[history.length - 1]?.type === "User"
                ) {
                  history[history.length - 1]!.message +=
                    content.inputTranscription.text;
                } else {
                  history.push({
                    type: "User",
                    message: content.inputTranscription.text,
                  });
                }
              }

              if (content?.outputTranscription?.text) {
                transcriptRef.current += content.outputTranscription.text;

                const history = conversationHistory.current;
                if (
                  history.length > 0 &&
                  history[history.length - 1]?.type === "Assistant"
                ) {
                  history[history.length - 1]!.message +=
                    content.outputTranscription.text;
                } else {
                  history.push({
                    type: "Assistant",
                    message: content.outputTranscription.text,
                  });
                }

                // Better Subtitle Logic: Split by sentences instead of characters
                // This prevents the text from constantly scrolling/jumping.
                // It matches anything that isn't punctuation, followed by optional punctuation.
                const sentences =
                  transcriptRef.current.match(/[^.!?]+[.!?]*/g) || [];

                // Display only the last 2 sentences
                let display = sentences.slice(-2).join("").trim();
                setSubtitles(display);
              }

              // 1. Stop the volume animation loop
              // if (animationFrameRef.current) {
              //   cancelAnimationFrame(animationFrameRef.current);
              //   animationFrameRef.current = null;
              // }
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
      // 1. Stop the volume animation loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // 2. Disconnect mic processing nodes
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }

      // 3. Close the mic AudioContext (stops recording)
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // 4. Close the playback AudioContext (THIS is what silences the AI immediately)
      if (playbackContextRef.current) {
        playbackContextRef.current.close();
        playbackContextRef.current = null;
        nextPlayTimeRef.current = 0;
      }

      // 5. Close the WebSocket session
      if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
      }
    };
  }, [token]);
  // 2. Start the Mic and pipe raw 16kHz PCM data to Gemini
  async function startMic() {
    if (!sessionRef.current) {
      return;
    }

    // Let the browser use its native sample rate (Firefox ignores custom rates).
    // We'll resample to 16kHz manually before sending to Gemini.
    if (!audioContextRef.current) {
      audioContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }

    const nativeSampleRate = audioContextRef.current.sampleRate;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

    // Create the analyzer
    const analyser = audioContextRef.current.createAnalyser();
    // fftSize determines how many data points we get.
    // 256 means we will get an array of 128 frequency
    analyser.fftSize = 256;
    userAnalyserRef.current = analyser;
    sourceRef.current.connect(analyser);

    const aiData = new Uint8Array(128);
    const userData = new Uint8Array(128);
    let lastUpdateTime = 0;

    function updateVolume() {
      let finalVolume = 0;
      let isAI = false;

      // 1. Check AI Volume first
      if (aiAnalyserRef.current) {
        aiAnalyserRef.current.getByteFrequencyData(aiData);
        let aiSum = 0;
        for (let i = 0; i < aiData.length; i++) aiSum += aiData[i]!;
        const aiAvg = aiSum / aiData.length;

        if (aiAvg > 2) {
          finalVolume = (aiAvg / 255) * 1.5;
          isAI = true;
        }
      }

      // 2. Check User Volume (Only if AI is quiet)
      if (userAnalyserRef.current && !isAI) {
        userAnalyserRef.current.getByteFrequencyData(userData);
        let userSum = 0;
        for (let i = 0; i < userData.length; i++) userSum += userData[i]!;
        const userAvg = userSum / userData.length;

        finalVolume = (userAvg / 255) * 1.5;
      }

      // Throttle React state updates to prevent re-render lag (~20fps)
      const now = performance.now();
      if (now - lastUpdateTime > 50) {
        setVolume(finalVolume);
        setIsAISpeaking(isAI);
        isAISpeakingRef.current = isAI;
        lastUpdateTime = now;
      }

      animationFrameRef.current = requestAnimationFrame(updateVolume);
    }

    // Prevent multiple loops
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    updateVolume();

    processorRef.current = audioContextRef.current.createScriptProcessor(
      4096,
      1,
      1,
    );

    sourceRef.current.connect(processorRef.current);

    // Connect to a silent GainNode instead of destination.
    // This keeps the ScriptProcessorNode alive without routing mic audio
    // back through the speakers (which caused echo feedback in Firefox).
    const silentSink = audioContextRef.current.createGain();
    silentSink.gain.value = 0;
    silentSink.connect(audioContextRef.current.destination);
    processorRef.current.connect(silentSink);

    processorRef.current.onaudioprocess = (e) => {
      if (!sessionRef.current) return;

      // Don't send mic audio while the AI is speaking.
      // Firefox's echo cancellation is too weak — the mic picks up AI audio
      // from speakers and Gemini's VAD treats it as user speech, causing
      // an infinite self-interruption loop.
      if (isAISpeakingRef.current) return;

      const inputData = e.inputBuffer.getChannelData(0);

      // Resample from native rate to 16kHz for Gemini
      const targetRate = 16000;
      const ratio = nativeSampleRate / targetRate;
      const outputLength = Math.floor(inputData.length / ratio);
      const buffer = new ArrayBuffer(outputLength * 2);
      const view = new DataView(buffer);

      for (let i = 0; i < outputLength; i++) {
        // Linear interpolation resampling
        const srcIndex = i * ratio;
        const srcIndexFloor = Math.floor(srcIndex);
        const srcIndexCeil = Math.min(srcIndexFloor + 1, inputData.length - 1);
        const frac = srcIndex - srcIndexFloor;
        const sample =
          inputData[srcIndexFloor]! * (1 - frac) +
          inputData[srcIndexCeil]! * frac;
        const s = Math.max(-1, Math.min(1, sample));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }

      // Convert to base64 safely (no spread operator for Firefox compatibility)
      let binaryString = "";
      const bytes = new Uint8Array(buffer);
      const chunkSize = 1024;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64Chunk = btoa(binaryString);

      try {
        sessionRef.current.sendRealtimeInput({
          audio: {
            mimeType: "audio/pcm;rate=16000",
            data: base64Chunk,
          },
        });
      } catch (err) {
        console.error("sendRealtimeInput failed:", err);
      }
    };
  }

  // 3. Stop processing microphone data
  function stopMic() {
    cleanupMic();

    // if (animationFrameRef.current) {
    //   cancelAnimationFrame(animationFrameRef.current);
    // }
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
      const aiAnalyser = playbackContextRef.current.createAnalyser();
      aiAnalyser.fftSize = 256;
      aiAnalyserRef.current = aiAnalyser;
      aiAnalyser.connect(playbackContextRef.current.destination);
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
    source.connect(aiAnalyserRef.current!);

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

  // Called explicitly by a user click button to satisfy Firefox's Autoplay Policy
  function startConversation() {
    if (!playbackContextRef.current) {
      playbackContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 24000 });
      const aiAnalyser = playbackContextRef.current.createAnalyser();
      aiAnalyser.fftSize = 256;
      aiAnalyserRef.current = aiAnalyser;
      aiAnalyser.connect(playbackContextRef.current.destination);
    }

    // Explicitly resume the context inside the click handler for Firefox
    if (playbackContextRef.current.state === "suspended") {
      playbackContextRef.current.resume();
    }

    sessionRef.current?.sendClientContent({
      turns: [
        {
          role: "user",
          parts: [{ text: "Please start the interview now." }],
        },
      ],
    });
  }

  return {
    startMic,
    stopMic,
    startConversation,
    connected,
    volume,
    isAISpeaking,
    subtitles,
  };
}
