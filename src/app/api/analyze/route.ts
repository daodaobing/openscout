import { NextResponse } from "next/server";
import { fetchRepoData } from "@/lib/github";
import { crawlOfficialSite } from "@/lib/crawl";
import { callLLM } from "@/lib/llm";
import { calculateScore } from "@/lib/scorer";
import type { Report, ProjectBasics, CommercialValue, MonetizationStatus, OpportunityAnalysis, RiskAnalysis, ThirdPartyProduct, LlmInput } from "@/lib/types";

function parseRepoUrl(input: string): string {
  const m = input.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
  if (m) return m[1] + "/" + m[2];
  const parts = input.replace(/^https?:\/\//, "").split("/").filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 2] + "/" + parts[parts.length - 1];
  return input;
}

function categorize(techStack: string[], topics: string[], description: string): string {
  const all = [...techStack, ...topics, description.toLowerCase()].join(" ");
  if (all.includes("agent") || all.includes("llm") || all.includes("gpt") || all.includes("ai")) return "AI Application";
  if (all.includes("framework") || all.includes("library")) return "Framework / Library";
  if (all.includes("cli") || all.includes("terminal")) return "CLI Tool";
  if (all.includes("plugin") || all.includes("extension") || all.includes("vscode")) return "Plugin / Extension";
  if (all.includes("template") || all.includes("boilerplate") || all.includes("starter")) return "Template / Boilerplate";
  if (all.includes("dashboard") || all.includes("admin") || all.includes("cms")) return "Dashboard / CMS";
  if (all.includes("api") || all.includes("backend") || all.includes("server")) return "Backend / API";
  if (all.includes("mobile") || all.includes("react-native") || all.includes("flutter")) return "Mobile App";
  if (all.includes("game") || all.includes("unity") || all.includes("godot")) return "Game";
  if (all.includes("tool") || all.includes("utility")) return "Developer Tool";
  return "Other";
}

function extractTech(pkg: Record<string, any> | null): string[] {
  if (!pkg) return [];
  const all: string[] = [];
  for (const key of ["dependencies", "devDependencies", "peerDependencies"]) {
    if (pkg[key]) all.push(...Object.keys(pkg[key]));
  }
  const known: string[] = [];
  const signals = ["react", "vue", "angular", "svelte", "next", "nuxt", "express", "fastify", "koa",
    "tensorflow", "pytorch", "langchain", "tailwindcss", "shadcn", "prisma", "typeorm",
    "graphql", "trpc", "socket.io", "three.js", "d3", "zustand", "redux", "vite", "webpack"];
  for (const dep of all) {
    for (const sig of signals) {
      if (dep.toLowerCase().includes(sig) && !known.includes(sig)) known.push(sig);
    }
  }
  return known;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = (body.url || "").trim();
    const lang: "zh" | "en" = body.lang === "zh" ? "zh" : "en";
    if (!rawUrl) return NextResponse.json({ error: "URL required" }, { status: 400 });

    const fullName = parseRepoUrl(rawUrl);
    const repo = await fetchRepoData(fullName);
    const crawl = await crawlOfficialSite(repo.repoInfo.homepage);

    const techStack = extractTech(repo.packageJson);
    const category = categorize(techStack, repo.repoInfo.topics, repo.repoInfo.description);

    let engineeringHealth: "excellent" | "good" | "fair" = "fair";
    const healthScore = (repo.hasCiCd ? 1 : 0) + (repo.hasDocker ? 1 : 0) + (repo.hasExamples ? 1 : 0) + (repo.readmeExcerpt ? 1 : 0);
    if (healthScore >= 4) engineeringHealth = "excellent";
    else if (healthScore >= 2) engineeringHealth = "good";

    const llmInput: LlmInput = {
      fullName: repo.repoInfo.fullName,
      description: repo.repoInfo.description,
      stars: repo.repoInfo.stars,
      readmeExcerpt: repo.readmeExcerpt,
      category,
      techStack,
      hasPricingPage: crawl.hasPricingPage,
      hasEnterprisePage: crawl.hasEnterprisePage,
      engineeringHealth,
      releaseCount: repo.releaseCount,
      contributorsCount: repo.contributorCount,
      commits30d: repo.commits30d,
    };

    const llm = await callLLM(llmInput, lang);
    const scoring = calculateScore(repo, crawl, llm);

    const basics: ProjectBasics = {
      fullName: repo.repoInfo.fullName,
      description: repo.repoInfo.description,
      stars: repo.repoInfo.stars,
      forks: repo.repoInfo.forks,
      openIssues: repo.repoInfo.openIssues,
      language: repo.repoInfo.language,
      license: repo.repoInfo.license,
      topics: repo.repoInfo.topics,
      lastPushed: repo.lastPushed,
      createdAt: repo.createdAt,
      ownerAvatar: repo.ownerAvatar,
      ownerLogin: repo.ownerLogin,
      category, techStack, engineeringHealth,
      commits30d: repo.commits30d,
      contributorCount: repo.contributorCount,
      hasReadme: !!repo.readmeExcerpt,
      hasCiCd: repo.hasCiCd,
      hasDocker: repo.hasDocker,
      hasExamples: repo.hasExamples,
      hasWebsite: repo.hasWebsite,
    };

    const commercialValue: CommercialValue = {
      painPoint: llm?.painPoint || "",
      userValue: llm?.userValue || "medium",
      enterpriseWillingness: llm?.enterpriseWillingness || "medium",
      marketSize: llm?.marketSize || "medium",
      competitionLevel: llm?.competitionLevel || "medium",
      marketMaturity: llm?.marketMaturity || "early",
      score: scoring.components.commercialPotential,
    };

    const thirdPartyProducts: ThirdPartyProduct[] = [];
    const monetization: MonetizationStatus = {
      hasOfficialCommercial: crawl.hasPricingPage || crawl.hasEnterprisePage,
      hasPricingPage: crawl.hasPricingPage,
      hasEnterprisePage: crawl.hasEnterprisePage,
      officialProductName: crawl.officialProductName,
      thirdPartyProducts,
      marketValidationScore: scoring.components.marketValidation,
    };

    const oppAnalysis: OpportunityAnalysis = {
      top3: llm?.top3 || [{ name: "N/A (configure OpenRouter API key)", score: 0, reason: "LLM analysis requires an API key" }],
      notRecommended: llm?.notRecommended || [],
      score: scoring.components.opportunityWindow,
    };

    const riskAnalysis: RiskAnalysis = {
      factors: llm?.riskFactors || [],
      overallRisk: llm?.riskLevel || "medium",
      score: scoring.components.riskLevelScore,
    };

    const report: Report = {
      openscoutScore: scoring.final,
      openscoutLabel: scoring.label,
      oneLineVerdict: llm?.oneLineVerdict || (lang === "zh" ? "分析完成" : "Analysis complete"),
      recommendedDirection: llm?.recommendedDirection || "",
      recommendationScore: scoring.final,
      mvpCycleWeeks: llm?.mvpCycleWeeks || 0,
      riskLevel: llm?.riskLevel || "medium",
      projectBasics: basics,
      commercialValue,
      monetizationStatus: monetization,
      opportunityAnalysis: oppAnalysis,
      riskAnalysis,
    };

    return NextResponse.json(report);
  } catch (err: any) {
    const msg = err.message || "Analysis failed";
    if (msg.includes("not found")) return NextResponse.json({ error: msg }, { status: 404 });
    if (msg.includes("rate limit")) return NextResponse.json({ error: msg }, { status: 429 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
