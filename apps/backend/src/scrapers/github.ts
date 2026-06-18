import { Octokit } from "octokit";

// Initialize Octokit (Keep your token secure in environment variables)
const octokit = new Octokit({
  auth: process.env.SCRAPING_TOKEN,
});

// Define an interface for the clean data you want to send back to the frontend
interface CleanRepoData {
  name: string;
  description: string | null;
  starCount: number;
  fullName: string;
}

export async function getUserPublicRepos(
  username: string,
): Promise<CleanRepoData[]> {
  try {
    // octokit.paginate automatically handles users with 100+ public repos
    const repos = await octokit.paginate("GET /users/{username}/repos", {
      username: username,
      type: "owner",
      per_page: 100, // Maximizes items per API hit to save your 5,000 rate limit
    });

    // Map the messy GitHub response payload into your clean object structure
    return repos.map((repo) => ({
      name: repo.name,
      description: repo.description,
      starCount: repo.stargazers_count ?? 0, // Fallback to 0 if undefined
      fullName: repo.full_name,
      languages: repo.language,
      pushedAt: repo.pushed_at,
      isFork: repo.fork,
      topics: repo.topics,
    }));
  } catch (error: any) {
    // Gracefully handle common errors like a wrong username
    if (error.status === 404) {
      throw new Error(`GitHub user "${username}" not found.`);
    }
    throw new Error(`Failed to fetch GitHub data: ${error.message}`);
  }
}
