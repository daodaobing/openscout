const GH = "https://api.github.com";

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (process.env.GITHUB_TOKEN) h["Authorization"] = "Bearer " + process.env.GITHUB_TOKEN;
  return h;
}

export type RepoData = {
  repoInfo: { name: string; fullName: string; description: string; stars: number; forks: number; openIssues: number; language: string; license: string | null; topics: string[]; homepage: string | null };
  ownerAvatar: string; ownerLogin: string; createdAt: string; lastPushed: string;
  readmeExcerpt: string;
  packageJson: Record<string, any> | null;
  releaseCount: number;
  hasCiCd: boolean; hasDocker: boolean; hasExamples: boolean; hasWebsite: boolean;
  commits30d: number; contributorCount: number;
};

export async function fetchRepoData(fullName: string): Promise<RepoData> {
  const [owner, repo] = fullName.split("/");
  const h = headers();

  const repoRes = await fetch(`${GH}/repos/${owner}/${repo}`, { headers: h });
  if (repoRes.status === 404) throw new Error("Repo not found");
  if (repoRes.status === 403) throw new Error("API rate limited. Add GITHUB_TOKEN env var.");
  const r = await repoRes.json();

  const readmeRes = await fetch(`${GH}/repos/${owner}/${repo}/readme`, { headers: h }).catch(() => null);
  let readmeExcerpt = "";
  if (readmeRes && readmeRes.ok) {
    const readmeJson = await readmeRes.json();
    try {
      readmeExcerpt = Buffer.from(readmeJson.content, "base64").toString("utf-8").slice(0, 3000);
    } catch {}
  }

  const pkgRes = await fetch(`${GH}/repos/${owner}/${repo}/contents/package.json`, { headers: h }).catch(() => null);
  let packageJson: Record<string, any> | null = null;
  if (pkgRes && pkgRes.ok) {
    try {
      const pkgContent = await pkgRes.json();
      packageJson = JSON.parse(Buffer.from(pkgContent.content, "base64").toString("utf-8"));
    } catch {}
  }

  const releasesRes = await fetch(`${GH}/repos/${owner}/${repo}/releases?per_page=1`, { headers: h }).catch(() => null);
  const releases = releasesRes && releasesRes.ok ? await releasesRes.json() : [];

  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const commitsRes = await fetch(`${GH}/repos/${owner}/${repo}/commits?per_page=30&since=${since}`, { headers: h }).catch(() => null);
  const commits = commitsRes && commitsRes.ok ? await commitsRes.json() : [];

  const contribRes = await fetch(`${GH}/repos/${owner}/${repo}/contributors?per_page=1`, { headers: h }).catch(() => null);
  let contribCount = 0;
  if (contribRes && contribRes.ok) {
    const linkHeader = contribRes.headers.get("link") || "";
    const match = linkHeader.match(/page=(\d+)>; rel="last"/);
    contribCount = match ? parseInt(match[1]) : (await contribRes.json()).length;
  }

  const contentsRes = await fetch(`${GH}/repos/${owner}/${repo}/contents`, { headers: h }).catch(() => null);
  let hasCiCd = false, hasDocker = false, hasExamples = false;
  if (contentsRes && contentsRes.ok) {
    const files = await contentsRes.json() as any[];
    if (Array.isArray(files)) {
      hasCiCd = files.some((f: any) => f.name === ".github");
      hasDocker = files.some((f: any) => f.name === "Dockerfile" || f.name === "docker-compose.yml" || f.name === "Dockerfile.dev");
      hasExamples = files.some((f: any) => f.name === "examples" || f.name === "tests" || f.name === "test" || f.name === "example");
    }
  }

  const homepage = r.homepage && !r.homepage.includes("github.com") ? r.homepage : null;

  return {
    repoInfo: {
      name: r.name, fullName: r.full_name, description: r.description || "",
      stars: r.stargazers_count, forks: r.forks_count, openIssues: r.open_issues_count,
      language: r.language || "", license: r.license ? r.license.spdx_id : null,
      topics: r.topics || [], homepage,
    },
    ownerAvatar: r.owner.avatar_url, ownerLogin: r.owner.login,
    createdAt: r.created_at, lastPushed: r.pushed_at,
    readmeExcerpt,
    packageJson,
    releaseCount: releases.length,
    hasCiCd, hasDocker, hasExamples,
    hasWebsite: homepage !== null,
    commits30d: Array.isArray(commits) ? commits.length : 0,
    contributorCount: contribCount,
  };
}
