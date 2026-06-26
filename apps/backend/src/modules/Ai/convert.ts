import { prisma } from "../../../db.js";

// 1. Define the structure of your GitHub data
interface Repository {
  name: string;
  languages: string | null;
  pushedAt: string;
  isFork: boolean;
  description: string | null;
  starCount: number;
  topics: string[];
}

export async function fetchDataInMd(interviewId: string) {
  try {
    const rawData = await prisma.interview.findFirst({
      where: {
        id: interviewId,
      },
      select: {
        githubMetadata: true,
      },
    });
    if (!rawData || !rawData.githubMetadata) {
      console.log("No GitHub metadata found for interviewId:", interviewId);
      return null;
    }
    if (!Array.isArray(rawData.githubMetadata)) {
      throw new Error("GitHub metadata is missing or is not an array");
    }

    const repos = rawData.githubMetadata as unknown as Repository[];

    // Convert and write output
    return jsonToMarkdown(repos);
  } catch (error) {
    console.error("Failed to convert data:", error);
  }
}

function jsonToMarkdown(repos: Repository[]): string {
  let markdown = "# GitHub User Data\n\n";

  for (const repo of repos) {
    const isForkText = repo.isFork ? "Yes" : "No";

    // Wrap topics in backticks for clean markdown formatting
    const topicsText =
      repo.topics.length > 0
        ? repo.topics.map((topic) => `\`${topic}\``).join(", ")
        : "None";

    markdown += `## Repo: ${repo.name}\n`;
    markdown += `- **Language:** ${repo.languages || "Not specified"}\n`;
    markdown += `- **Stars:** ${repo.starCount}\n`;
    markdown += `- **Is Fork:** ${isForkText}\n`;
    markdown += `- **Last Pushed:** ${repo.pushedAt}\n`;
    markdown += `- **Topics:** ${topicsText}\n`;
    markdown += `- **Description:** ${repo.description || "No description provided."}\n\n`;
  }

  return markdown;
}
