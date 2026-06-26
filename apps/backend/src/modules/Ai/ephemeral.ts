import { GoogleGenAI, Modality, Type, type FunctionCall } from "@google/genai";
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
          outputAudioTranscription: {},
          tools: [
            {
              functionDeclarations: [functionDeclaration],
            },
          ],
        },
      },
      httpOptions: { apiVersion: "v1alpha" },
    },
  });
  return token.name; // sirf name return karo
}

const functionDeclaration = {
  name: "end_interview",
  description:
    "End the interview when all the questions are done and a score is given to the candidate.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      score: {
        type: Type.INTEGER,
        description: "The score you have given to the candidate (e.g. 85)",
      },
      feedback: {
        type: Type.STRING,
        description:
          "A feedback of the cadidate in 300-500 lines after all the questions are asked , be honest. (e.g. Strong understanding of React hooks but struggled with system design... and so on upto 500 words)",
      },
    },
    required: ["score", "feedback"],
  },
};
