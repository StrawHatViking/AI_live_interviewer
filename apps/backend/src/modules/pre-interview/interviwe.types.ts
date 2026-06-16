import { z } from "zod";

export const preInterviewSchema = z.object({
  linkedin: z.string().optional(),
  github: z.string().url("Invalid GitHub URL"),
});

export type PreInterviewInput = z.infer<typeof preInterviewSchema>;
