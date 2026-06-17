"use client";
import { t, Lang } from "@/lib/i18n";
import type { RiskAnalysis } from "@/lib/types";

const sevColors: Record<string, string> = { low: "bg-green-900/30 text-green-400", medium: "bg-yellow-900/30 text-yellow-400", high: "bg-red-900/30 text-red-400" };
const riskColors: Record<string, string> = { low: "text-green-400", medium: "text-yellow-400", high: "text-red-400" };

export default function RiskAnalysisCard({ data, lang }: { data: RiskAnalysis; lang: Lang }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs text-zinc-500 uppercase tracking-wider">{t("risk.title", lang)}</h3>
        <span className={`text-sm font-medium ${riskColors[data.overallRisk] || ""}`}>{data.overallRisk.toUpperCase()}</span>
      </div>

      {data.score > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>{t("overall.risk", lang)}</span>
            <span>{data.score}/100</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${data.score >= 70 ? "bg-green-500" : data.score >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: data.score + "%" }} />
          </div>
        </div>
      )}

      {data.factors.length === 0 && (
        <div className="text-sm text-zinc-500">No significant risk factors detected.</div>
      )}

      {data.factors.map((f, i) => (
        <div key={i} className="flex items-start gap-3 py-2 border-b border-zinc-800/50 last:border-0">
          <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${sevColors[f.severity] || "bg-zinc-800 text-zinc-500"}`}>
            {f.type.toUpperCase()}
          </span>
          <div className="text-sm text-zinc-300">{f.description}</div>
        </div>
      ))}
    </div>
  );
}
