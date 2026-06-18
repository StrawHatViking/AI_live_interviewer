import { generateEphemeralToken } from "../Ai/ephemeral.js";
import { fetchDataInMd } from "../Ai/convert.js";
import { buildSystemPrompt } from "../Ai/prompt.js";

export class StartInterview {
  async startInterview(interviewId: string) {
    const githubMarkdown = await fetchDataInMd(interviewId);
    const prompt = buildSystemPrompt(githubMarkdown?.toString() || "");

    const token = await generateEphemeralToken(prompt);

    return {
      githubMarkdown,
      prompt,
      token,
    };
  }
}
