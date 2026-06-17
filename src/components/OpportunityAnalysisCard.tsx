"use client";
import { t, Lang } from "@/lib/i18n";
import type { OpportunityAnalysis } from "@/lib/types";

export default function OpportunityAnalysisCard({ data, lang }: { data: OpportunityAnalysis; lang: Lang }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider">{t("top3.title", lang)}</h3>
        <span className="text-sm font-medium">{Math.round(data.score)}/100</span>
      </div>

      {data.top3.map((opp, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-gray-400 mr-2">#{i + 1}</span>
              <span className="text-sm font-medium">{opp.name}</span>
            </div>
            <span className={`text-sm font-bold ${opp.score >= 80 ? "text-green-600" : opp.score >= 60 ? "text-yellow-600" : "text-gray-400"}`}>
              {opp.score}
            </span>
          </div>
          {opp.reason && <div className="text-xs text-gray-400 mt-1">{opp.reason}</div>}
          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${opp.score >= 80 ? "bg-green-500" : opp.score >= 60 ? "bg-yellow-500" : "bg-gray-400"}`}
              style={{ width: opp.score + "%" }} />
          </div>
        </div>
      ))}

      {data.notRecommended.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">{t("not.recommended.title", lang)}</div>
          {data.notRecommended.map((opp, i) => (
            <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-3 mb-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-600">{opp.name}</span>
                <span className="text-red-500">{opp.score}</span>
              </div>
              {opp.reason && <div className="text-xs text-red-500 mt-1">{opp.reason}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
