import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { StartInterview } from "./start-interview.service.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

const InterviewStart = new StartInterview();

export const startInterview = asyncHandler(
  async (req: Request, res: Response) => {
    const interviewId = req.params.interviewId?.toString();
    if (!interviewId) throw new ApiError(400, "Interview Id not found");

    const interview = await InterviewStart.startInterview(interviewId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          interview,
          "Successfully fetched the required data!",
        ),
      );
  },
);

export const updateScore = asyncHandler(async (req: Request, res: Response) => {
  const interviewid = req.params.interviewId as string;
  const { score, feedback, conversations } = req.body;

  const updated = await InterviewStart.updateScore(interviewid, score, feedback, conversations);

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Score updated successfully"));
});

export const updateStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const interviewId = req.params.interviewId as string;
    const { status } = req.body;

    if (!status) throw new ApiError(400, "Status is required");

    const updated = await InterviewStart.updateStatus(interviewId, status);

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Status updated successfully"));
  },
);

export const getResults = asyncHandler(
  async (req: Request, res: Response) => {
    const interviewId = req.params.interviewId as string;

    const results = await InterviewStart.getResults(interviewId);

    return res
      .status(200)
      .json(new ApiResponse(200, results, "Results fetched successfully"));
  },
);
