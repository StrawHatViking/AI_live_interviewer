import { Router } from "express";
import { startInterview } from "./start-interview.controller";

export const startInterviewRoutes = Router();

startInterviewRoutes.post("/:interviewId", startInterview);
