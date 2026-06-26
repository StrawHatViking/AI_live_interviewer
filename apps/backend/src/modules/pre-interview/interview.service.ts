import type { PreInterviewInput } from "./interview.types.js";
import { prisma } from "../../../db.js";
import { getUserPublicRepos } from "../../scrapers/github.js";
import ApiError from "../../utils/ApiError.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { PDFParse } from "pdf-parse";

export class PreInterview {
  async preInterview(input: PreInterviewInput, fileBuffer: any) {
    // TODO: URL can be malformed , implement a SLM here
    const githubUrl = input.github.endsWith("/")
      ? input.github.slice(0, -1)
      : input.github;
    const linkedinUrl = input.linkedin?.endsWith("/")
      ? input.linkedin?.slice(0, -1)
      : input.linkedin;

    const extractedText = new PDFParse({ data: fileBuffer });
    const text = await extractedText.getText();

    const githubUsername = githubUrl.split("/").pop();
    const linkedinUsername = linkedinUrl?.split("/").pop();

    const data = await getUserPublicRepos(githubUsername?.toString() || "");
    if (!data) throw new ApiError(404, "Data not found!");

    // Scraping the data from linkedin
    // we'll do it later on

    const interview = await prisma.interview.create({
      data: {
        // cast to Prisma.InputJsonValue so the array of repos is accepted
        githubMetadata: data,
        status: "Pre",
        resumeText: text.text,
        jobRole: input.jobRole,
        difficulty: input.difficulty,
        durationMins: parseInt(input.duration, 10) || 10,
      },
    });

    if (!interview)
      throw new ApiError(
        500,
        "Something went wrong in writing into the database",
      );

    return interview;
  }
}
