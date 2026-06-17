import { RepoData } from "./github";
import { CrawlResult } from "./crawl";
import { LlmOutput } from "./types";

export type ScoreComponents = {
  techAvailability: number;
  marketValidation: number;
  commercialPotential: number;
  opportunityWindow: number;
  riskLevelScore: number;
};

export function calculateScore(
  repo: RepoData,
  crawl: CrawlResult,
  llm: LlmOutput | null,
): { final: number; label: "focus" | "recommended" | "watch" | "not_recommended"; components: ScoreComponents } {

  // Tech Availability (20%)
  let tech = 0;
  if (repo.repoInfo.description) tech += 5;
  if (repo.readmeExcerpt) tech += 10;
  if (repo.repoInfo.license) tech += 10;
  if (repo.hasCiCd) tech += 10;
  if (repo.hasDocker) tech += 10;
  if (repo.hasExamples) tech += 5;
  if (repo.commits30d > 20) tech += 15;
  else if (repo.commits30d > 5) tech += 10;
  else tech += 5;
  if (repo.contributorCount > 10) tech += 15;
  else if (repo.contributorCount > 3) tech += 10;
  else tech += 5;
  if (repo.releaseCount > 5) tech += 15;
  else if (repo.releaseCount > 0) tech += 10;
  else tech += 0;
  tech = Math.min(tech, 100);

  // Market Validation (20%)
  let marketVal = 0;
  if (crawl.hasPricingPage) marketVal += 25;
  if (crawl.hasEnterprisePage) marketVal += 15;
  if (crawl.officialProductName) marketVal += 10;
  if (repo.repoInfo.stars > 5000) marketVal += 15;
  else if (repo.repoInfo.stars > 500) marketVal += 10;
  else marketVal += 5;
  if (repo.contributorCount > 10) marketVal += 10;
  marketVal = Math.min(marketVal, 100);

  // Commercial Potential (30%) - from LLM
  let commercial = 50;
  if (llm) {
    const uv: Record<string, number> = { high: 30, medium: 20, low: 5 };
    const ew: Record<string, number> = { high: 25, medium: 15, low: 5 };
    const ms: Record<string, number> = { large: 25, medium: 15, small: 5 };
    const clScore: Record<string, number> = { low: 20, medium: 10, high: 0 };
    commercial = (uv[llm.userValue] || 10) + (ew[llm.enterpriseWillingness] || 10) + (ms[llm.marketSize] || 10) + (clScore[llm.competitionLevel] || 5);
    commercial = Math.min(commercial, 100);
  }

  // Opportunity Window (20%)
  let oppScore = 50;
  if (llm && llm.top3.length > 0) {
    oppScore = llm.top3.reduce((s, o) => s + o.score, 0) / llm.top3.length;
  }
  oppScore = Math.min(oppScore, 100);

  // Risk Level Score (10%) - inverted
  let riskScore = 80;
  if (llm) {
    const rl: Record<string, number> = { low: 90, medium: 60, high: 30 };
    riskScore = rl[llm.riskLevel] || 50;
    for (const f of llm.riskFactors || []) {
      if (f.severity === "high") riskScore -= 10;
      else if (f.severity === "medium") riskScore -= 5;
    }
  }
  if (!repo.repoInfo.license) riskScore -= 10;
  if (repo.contributorCount === 1) riskScore -= 10;
  riskScore = Math.max(0, Math.min(100, riskScore));

  const final = Math.round(tech * 0.2 + marketVal * 0.2 + commercial * 0.3 + oppScore * 0.2 + riskScore * 0.1);

  let label: ScoreComponents["commercialPotential"] extends number ? "focus" | "recommended" | "watch" | "not_recommended" : never = "watch";
  if (final >= 85) label = "focus";
  else if (final >= 70) label = "recommended";
  else if (final >= 40) label = "watch";
  else label = "not_recommended";

  return {
    final,
    label,
    components: { techAvailability: tech, marketValidation: marketVal, commercialPotential: commercial, opportunityWindow: oppScore, riskLevelScore: riskScore },
  };
}
