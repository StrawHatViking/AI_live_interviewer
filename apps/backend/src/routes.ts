import { Router } from "express";
import { preInterviewRoutes } from "./modules/pre-interview/preInterview.routes.js";
import { startInterviewRoutes } from "./modules/startInterview/start-interview.routes.js";

export const routes = Router();

routes.use("/pre-interview", preInterviewRoutes);
routes.use("/start-interview", startInterviewRoutes);
