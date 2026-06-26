import { type Request, type Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import {
  preInterviewSchema,
  type PreInterviewInput,
} from "./interview.types.js";
import { PreInterview } from "./interview.service.js";

const InterviewService = new PreInterview();

const submitPreInterview = asyncHandler(async (req: Request, res: Response) => {
  const parsed = preInterviewSchema.safeParse(req.body);
  const { data } = parsed;

  if (!req.file) {
    res.status(400).json({ error: "Please select a PDF file to upload." });
    return;
  }

  const fileBuffer = req.file.buffer;

  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }
  const input = data as PreInterviewInput;

  const profiles = await InterviewService.preInterview(input, fileBuffer);

  return res
    .status(200)
    .json(new ApiResponse(200, profiles, "Profiles received successfully"));
});

export { submitPreInterview };
