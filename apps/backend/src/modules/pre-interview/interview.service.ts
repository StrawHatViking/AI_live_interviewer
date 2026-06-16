import type { PreInterviewInput } from "./interviwe.types";
import { prisma } from "../../../db.js";
import { getUserPublicRepos } from "../../scrapers/github";
import ApiError from "../../utils/ApiError.js";
import type { Prisma } from "../../../src/generated/prisma/client.js";

export class PreInterview {
  async preInterview(input: PreInterviewInput) {
    // TODO: URL can be malformed , implement a SLM here
    const githubUrl = input.github.endsWith("/")
      ? input.github.slice(0, -1)
      : input.github;
    const linkedinUrl = input.linkedin?.endsWith("/")
      ? input.linkedin?.slice(0, -1)
      : input.linkedin;

    const githubUsername = githubUrl.split("/").pop();
    const linkedinUsername = linkedinUrl?.split("/").pop();

    const data = await getUserPublicRepos(githubUsername?.toString() || "");
    if (!data) throw new ApiError(404, "Data not found!");

    // Scraping the data from linkedin
    // we'll do it later on

    const interview = await prisma.interview.create({
      data: {
        githubMetadata: data,
        status: "Pre",
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
