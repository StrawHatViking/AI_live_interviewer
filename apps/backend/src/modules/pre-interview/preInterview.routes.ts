import { Router } from "express";
import { submitPreInterview } from "./preInterview.controller.js";
import { uploadPdfInMemory } from "../../middlewares/multer.js";

export const preInterviewRoutes = Router();

preInterviewRoutes.post(
  "/",
  uploadPdfInMemory.single("resume"),
  submitPreInterview,
);
