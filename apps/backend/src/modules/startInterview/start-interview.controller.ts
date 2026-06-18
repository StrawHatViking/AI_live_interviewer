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
