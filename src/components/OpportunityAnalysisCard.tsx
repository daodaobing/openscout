"use client";
import { t, Lang } from "@/lib/i18n";
import type { OpportunityAnalysis } from "@/lib/types";

export default function OpportunityAnalysisCard({ data, lang }: { data: OpportunityAnalysis; lang: Lang }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs text-zinc-500 uppercase tracking-wider">{t("top3.title", lang)}</h3>
        <span className="text-sm font-medium">{Math.round(data.score)}/100</span>
      </div>

      {data.top3.map((opp, i) => (
        <div key={i} className="bg-zinc-800/40 rounded-xl p-4 mb-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-zinc-600 mr-2">#{i + 1}</span>
              <span className="text-sm font-medium">{opp.name}</span>
            </div>
            <span className={`text-sm font-bold ${opp.score >= 80 ? "text-green-400" : opp.score >= 60 ? "text-yellow-400" : "text-zinc-500"}`}>
              {opp.score}
            </span>
          </div>
          {opp.reason && <div className="text-xs text-zinc-500 mt-1">{opp.reason}</div>}
          <div className="mt-2 h-1 bg-zinc-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${opp.score >= 80 ? "bg-green-500" : opp.score >= 60 ? "bg-yellow-500" : "bg-zinc-600"}`}
              style={{ width: opp.score + "%" }} />
          </div>
        </div>
      ))}

      {data.notRecommended.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">{t("not.recommended.title", lang)}</div>
          {data.notRecommended.map((opp, i) => (
            <div key={i} className="bg-red-900/10 border border-red-900/20 rounded-xl p-3 mb-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-400">{opp.name}</span>
                <span className="text-red-400/60">{opp.score}</span>
              </div>
              {opp.reason && <div className="text-xs text-red-400/60 mt-1">{opp.reason}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
