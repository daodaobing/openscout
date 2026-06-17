import { LlmInput, LlmOutput, Opportunity, RiskFactor } from "./types";

const API_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";

function buildPrompt(data: LlmInput, lang: "zh" | "en"): string {
  const inst = lang === "zh"
    ? "你是一个开源项目商业化分析师。分析以下 GitHub 开源项目。所有文本字段使用中文回答。输出结构化 JSON。只输出 JSON，不要 markdown。"
    : "You are an open-source commercialization analyst. Analyze the following GitHub project and output structured JSON. All text values must be in English. Output JSON only, no markdown.";

  const example = lang === "zh"
    ? { painPoint: "开发者需要...但现有方案...", userValue: "high", enterpriseWillingness: "high", marketSize: "large", competitionLevel: "medium", marketMaturity: "growth",
        top3: [{ name: "企业私有部署", score: 95, reason: "企业付费能力强，客单价高" }],
        notRecommended: [{ name: "直接复制项目", score: 30, reason: "已高度竞争缺乏差异化" }],
        oneLineVerdict: "值得投入，但建议聚焦企业垂直场景", recommendedDirection: "企业知识库 Agent", mvpCycleWeeks: 6, riskLevel: "medium",
        riskFactors: [{ type: "license", severity: "low", description: "MIT 协议无限制" }] }
    : { painPoint: "Developers need... but existing...", userValue: "high", enterpriseWillingness: "high", marketSize: "large", competitionLevel: "medium", marketMaturity: "growth",
        top3: [{ name: "Enterprise Private Deployment", score: 95, reason: "Enterprise willing to pay high for self-hosted solutions" }],
        notRecommended: [{ name: "Direct Clone", score: 30, reason: "Highly competitive, no differentiation" }],
        oneLineVerdict: "Worth investing, focus on enterprise vertical", recommendedDirection: "Enterprise Knowledge Base Agent", mvpCycleWeeks: 6, riskLevel: "medium",
        riskFactors: [{ type: "license", severity: "low", description: "MIT allows free use" }] };
  const jsonExample = JSON.stringify(example, null, 2);

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
