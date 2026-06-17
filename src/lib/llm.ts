import { LlmInput, LlmOutput, Opportunity, RiskFactor } from "./types";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-chat";

function buildPrompt(data: LlmInput, lang: "zh" | "en"): string {
  const inst = lang === "zh"
    ? "你是一个开源项目商业化分析师。分析以下 GitHub 开源项目，输出结构化 JSON。只输出 JSON，不要 markdown。"
    : "You are an open-source commercialization analyst. Analyze the following GitHub project and output structured JSON. Output JSON only, no markdown.";

  const jsonExample = JSON.stringify({
    painPoint: "...",
    userValue: "high|medium|low",
    enterpriseWillingness: "high|medium|low",
    marketSize: "large|medium|small",
    competitionLevel: "low|medium|high",
    marketMaturity: "early|growth|crowded",
    top3: [{ name: "...", score: 95, reason: "..." }],
    notRecommended: [{ name: "...", score: 30, reason: "..." }],
    oneLineVerdict: "...",
    recommendedDirection: "...",
    mvpCycleWeeks: 6,
    riskLevel: "low|medium|high",
    riskFactors: [{ type: "license|technical|market|business", severity: "low|medium|high", description: "..." }],
  }, null, 2);

  return `${inst}

Input:
- Repo: ${data.fullName}
- Description: ${data.description}
- Stars: ${data.stars}
- Category: ${data.category}
- Tech Stack: ${data.techStack.join(", ")}
- Engineering Health: ${data.engineeringHealth}
- Has Pricing Page: ${data.hasPricingPage}
- Has Enterprise Page: ${data.hasEnterprisePage}
- Release Count: ${data.releaseCount}
- Contributors: ${data.contributorsCount}
- Commits (30d): ${data.commits30d}

README excerpt:
${data.readmeExcerpt.slice(0, 1000)}

Output JSON:
${jsonExample}`;
}

export async function callLLM(data: LlmInput, lang: "zh" | "en"): Promise<LlmOutput | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://openscout.dev",
        "X-Title": "OpenScout",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: buildPrompt(data, lang) }],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as LlmOutput;
  } catch {
    return null;
  }
}
