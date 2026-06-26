import { z } from "zod";

export const preInterviewSchema = z.object({
  linkedin: z.string().optional(),
  github: z.string().url("Invalid GitHub URL"),
  jobRole: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
  duration: z.string().default("10"),
});

export type PreInterviewInput = z.infer<typeof preInterviewSchema>;
