import { Router } from "express";
import { submitPreInterview } from "./preInterview.controller.js";

const router = Router();

router.route("/pre-interview").post(submitPreInterview);

export default router;
