import { Router } from "express";
import { submitPreInterview } from "./preInterview.controller.js";

export const preInterviewRoutes = Router();

preInterviewRoutes.post("/", submitPreInterview);
