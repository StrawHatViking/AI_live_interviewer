import { Router } from "express";
import {
  startInterview,
  updateScore,
  updateStatus,
  getResults,
} from "./start-interview.controller.js";

export const startInterviewRoutes = Router();

startInterviewRoutes.post("/:interviewId", startInterview);
startInterviewRoutes.patch("/:interviewId/score", updateScore);
startInterviewRoutes.patch("/:interviewId/status", updateStatus);
startInterviewRoutes.get("/:interviewId/results", getResults);
