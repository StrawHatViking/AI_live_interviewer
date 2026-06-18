import { describe, expect, test } from "bun:test";
import { preInterviewSchema } from "../modules/pre-interview/interview.types";

describe("PreInterview validation", () => {
  test("accepts valid github URL", () => {
    const result = preInterviewSchema.safeParse({
      github: "https://github.com/username",
    });
    expect(result.success).toBe(true);
  });

  test("accepts github URL with linkedin", () => {
    const result = preInterviewSchema.safeParse({
      github: "https://github.com/username",
      linkedin: "https://linkedin.com/in/username",
    });
    expect(result.success).toBe(true);
  });

  test("rejects missing github", () => {
    const result = preInterviewSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test("rejects invalid github URL", () => {
    const result = preInterviewSchema.safeParse({
      github: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});
