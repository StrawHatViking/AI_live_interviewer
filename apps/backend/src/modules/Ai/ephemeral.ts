import { GoogleGenAI, Modality } from "@google/genai";
const client = new GoogleGenAI({});

export async function generateEphemeralToken(systemPrompt: string) {
  const token = await client.authTokens.create({
    config: {
      uses: 1,
      expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      liveConnectConstraints: {
        model: "gemini-3.1-flash-live-preview",
        config: {
          systemInstruction: systemPrompt, // locked in token!
          responseModalities: [Modality.AUDIO],
          temperature: 0.7,
        },
      },
      httpOptions: { apiVersion: "v1alpha" },
    },
  });
  return token.name; // sirf name return karo
}
