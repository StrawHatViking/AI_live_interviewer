import { generateEphemeralToken } from "../Ai/ephemeral.js";
import { fetchDataInMd } from "../Ai/convert.js";
import { buildSystemPrompt } from "../Ai/prompt.js";
import { prisma } from "../../../db.js";
import ApiError from "../../utils/ApiError.js";
import type { InterviewStatus } from "../../generated/prisma/client.js";

export class StartInterview {
  async startInterview(interviewId: string) {
    const githubMarkdown = await fetchDataInMd(interviewId);

    // Fetch the interview settings and resume text from the database
    const interviewData = await prisma.interview.findUnique({
      where: { id: interviewId },
      select: {
        resumeText: true,
        jobRole: true,
        difficulty: true,
        durationMins: true,
      },
    });

    const prompt = buildSystemPrompt(
      githubMarkdown?.toString() || "",
      interviewData?.resumeText || null,
      interviewData?.jobRole || null,
      interviewData?.difficulty || "Medium",
      interviewData?.durationMins || 10,
    );

    const token = await generateEphemeralToken(prompt);

    // Mark interview as Ongoing when it starts
    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: "Ongoing" },
    });

    return {
      githubMarkdown,
      prompt,
      token,
    };
  }

  async updateScore(
    interviewId: string, 
    score: number, 
    feedback?: string,
    conversations?: { message: string; type: "User" | "Assistant" }[]
  ) {
    const updated = await prisma.interview.update({
      where: {
        id: interviewId,
      },
      data: {
        score,
        feedback: feedback ?? null,
        status: "Done",
        ...(conversations?.length ? {
          conversations: {
            create: conversations.map(c => ({
              message: c.message,
              type: c.type
            }))
          }
        } : {})
      },
    });

    if (!updated)
      throw new ApiError(500, "Something went wrong while updating the score!");

    return updated.id;
  }

  async updateStatus(interviewId: string, status: InterviewStatus) {
    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: { status },
    });

    if (!updated)
      throw new ApiError(
        500,
        "Something went wrong while updating the status!",
      );

    return updated;
  }

  async getResults(interviewId: string) {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      select: {
        id: true,
        score: true,
        feedback: true,
        status: true,
        conversations: {
          select: {
            message: true,
            type: true,
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      },
    });

    if (!interview) throw new ApiError(404, "Interview not found!");

    return interview;
  }
}
