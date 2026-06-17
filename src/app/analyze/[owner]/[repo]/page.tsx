import type { Metadata } from "next";
import { fetchRepoData } from "@/lib/github";
import { crawlOfficialSite } from "@/lib/crawl";

type Props = { params: Promise<{ owner: string; repo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, repo } = await params;
  const fullName = owner + "/" + repo;
  let desc = "Complete commercial evaluation of " + fullName + ": technical maturity, commercial potential, market opportunities, and risks.";
  try {
    const data = await fetchRepoData(fullName);
    if (data.repoInfo.description) desc = data.repoInfo.description.slice(0, 200);
  } catch {}

  return {
    title: "GitWorth Analysis: " + fullName + " — Free GitHub Repo Analyzer",
    description: desc,
    openGraph: {
      title: "GitWorth — " + fullName + " Commercial Evaluation",
      description: desc.slice(0, 150),
      type: "article",
    },
  };
}

function sv(level: string, lang: "zh" | "en"): string {
  const m: Record<string, Record<string, string>> = {
    en: { high: "High", medium: "Medium", low: "Low", large: "Large", small: "Small" },
    zh: { high: "高", medium: "中", low: "低", large: "大", small: "小" },
  };
  return m[lang]?.[level] || level;
}

async function Page({ params }: Props) {
  const { owner, repo } = await params;
  const fullName = owner + "/" + repo;

  let report: any = null;
  let error = "";
  try {
    const base = process.env.VERCEL_URL
      ? "https://" + process.env.VERCEL_URL
      : "http://localhost:3000";
    const res = await fetch(base + "/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: fullName, lang: "en" }),
      cache: "no-store",
    });
    if (!res.ok) error = "Failed to analyze";
    else report = await res.json();
  } catch { error = "Analysis unavailable"; }

  if (error) {
    return (
      <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
        <h1>GitWorth — {fullName}</h1>
        <p>{error}</p>
        <p><a href="https://gitworth-landing.vercel.app/">Try GitWorth</a></p>
      </main>
    );
  }

  const basics = report?.projectBasics || {};
  const cv = report?.commercialValue || {};
  const mon = report?.monetizationStatus || {};
  const opp = report?.opportunityAnalysis || {};
  const risk = report?.riskAnalysis || {};
  const score = report?.openscoutScore || 0;
  const label = report?.openscoutLabel || "watch";

  const labelMap: Record<string, string> = { focus: "Focus", recommended: "Worth Building", watch: "Watch", not_recommended: "Not Recommended" };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px", fontFamily: "system-ui, sans-serif", background: "#fafbfc", color: "#0f0f1a" }}>
      <a href="https://gitworth-landing.vercel.app/" style={{ color: "#7c3aed", textDecoration: "none", fontSize: 14 }}>← GitWorth</a>

      <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0 8px" }}>
        <span style={{ fontSize: 48, fontWeight: 700 }}>{score}</span>
        <span style={{ color: "#999", fontSize: 20 }}>/ 100</span>
        <span style={{ fontSize: 14, fontWeight: 600, padding: "4px 12px", borderRadius: 6, background: score >= 70 ? "#ecfdf5" : score >= 40 ? "#fef3c7" : "#fef2f2", color: score >= 85 ? "#7c3aed" : score >= 70 ? "#059669" : "#d97706" }}>
          {labelMap[label] || label}
        </span>
      </div>
      {report?.oneLineVerdict && <p style={{ fontSize: 16, color: "#6b7280", fontStyle: "italic", marginBottom: 24 }}>"{report.oneLineVerdict}"</p>}

      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{fullName}</h2>
      {basics.description && <p style={{ color: "#6b7280", marginBottom: 12 }}>{basics.description}</p>}
      {basics.category && <p style={{ color: "#7c3aed", fontSize: 13, marginBottom: 8 }}>Category: {basics.category}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
        {[
          ["Stars", (basics.stars || 0).toLocaleString()],
          ["Commits (30d)", basics.commits30d || "-"],
          ["Contributors", basics.contributorCount || "-"],
          ["Health", basics.engineeringHealth || "-"],
        ].map(([k, v]) => (
          <div key={k as string} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
            <div style={{ fontSize: 11, color: "#999" }}>{k}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 24, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        {[
          ["Commercial", sv(cv.userValue, "en")],
          ["Monetization", mon.hasOfficialCommercial ? "Yes" : "No"],
          ["Market", sv(cv.marketSize, "en")],
          ["Competition", sv(cv.competitionLevel === "low" ? "low" : cv.competitionLevel === "high" ? "high" : "medium", "en")],
          ["Risk", (risk.overallRisk || "medium").toUpperCase()],
        ].map(([k, v]) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>

      {cv.painPoint && (
        <div style={{ background: "#f9fafb", borderRadius: 10, padding: 14, marginBottom: 20, borderLeft: "3px solid #7c3aed22" }}>
          <p style={{ fontSize: 14, color: "#6b7280", fontStyle: "italic" }}>"{cv.painPoint}"</p>
        </div>
      )}

      {Array.isArray(opp.top3) && opp.top3.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#4b5563", marginBottom: 10 }}>Top Opportunities</h3>
          {opp.top3.slice(0, 3).map((o: any, i: number) => (
            <div key={i} style={{ background: "#faf5ff", borderRadius: 8, padding: 12, marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "#7c3aed", fontSize: 14 }}>{o.name}</span>
                <span style={{ fontWeight: 700, color: "#7c3aed", fontSize: 16 }}>{o.score}</span>
              </div>
              {o.reason && <p style={{ fontSize: 13, color: "#6d28d9", marginTop: 2 }}>{o.reason}</p>}
            </div>
          ))}
        </div>
      )}

      {Array.isArray(risk.factors) && risk.factors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#4b5563", marginBottom: 10 }}>Risk Factors</h3>
          {risk.factors.map((f: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: f.severity === "low" ? "#ecfdf5" : "#fef3c7", color: f.severity === "low" ? "#059669" : "#d97706" }}>
                {(f.type || "").toUpperCase()}
              </span>
              <span style={{ fontSize: 13, color: "#6b7280" }}>{f.description}</span>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 12, color: "#999", borderTop: "1px solid #e5e7eb", paddingTop: 16, marginTop: 24 }}>
        Generated by GitWorth — <a href="https://gitworth-landing.vercel.app/" style={{ color: "#7c3aed" }}>Evaluate Before You Build</a>
      </p>
    </main>
  );
}

export default Page;
