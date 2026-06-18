import { Router } from "express";
import { preInterviewRoutes } from "./modules/pre-interview/preInterview.routes";
import { startInterviewRoutes } from "./modules/startInterview/start-interview.routes";

export const routes = Router();

routes.use("/pre-interview", preInterviewRoutes);
routes.use("/start-interview", startInterviewRoutes);
