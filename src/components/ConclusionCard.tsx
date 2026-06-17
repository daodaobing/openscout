"use client";
import { t, Lang } from "@/lib/i18n";
import type { Report } from "@/lib/types";

const colors: Record<string, string> = {
  focus: "bg-green-500", recommended: "bg-emerald-500",
  watch: "bg-yellow-500", not_recommended: "bg-red-500",
};
const riskColors: Record<string, string> = { low: "text-green-600", medium: "text-yellow-600", high: "text-red-600" };

export default function ConclusionCard({ report, lang }: { report: Report; lang: Lang }) {
  const verdictKey = "verdict." + report.openscoutLabel;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("score.label", lang)}</div>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-bold ${report.openscoutScore >= 70 ? "text-green-600" : report.openscoutScore >= 40 ? "text-yellow-600" : "text-red-600"}`}>
              {report.openscoutScore}
            </span>
            <span className="text-gray-400 text-lg">/ 100</span>
          </div>
          <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${colors[report.openscoutLabel] || "bg-gray-600"} text-white`}>
            {t(verdictKey, lang)}
          </div>
        </div>
        <div className="text-right text-sm space-y-1">
          {report.recommendedDirection && (
            <div><span className="text-gray-400">{t("direction.label", lang)}: </span><span className="text-gray-800">{report.recommendedDirection}</span></div>
          )}
          {report.mvpCycleWeeks > 0 && (
            <div><span className="text-gray-400">{t("mvp.label", lang)}: </span><span className="text-gray-800">{report.mvpCycleWeeks} weeks</span></div>
          )}
          <div><span className="text-gray-400">{t("risk.label", lang)}: </span><span className={riskColors[report.riskLevel] || ""}>{report.riskLevel.toUpperCase()}</span></div>
        </div>
      </div>
      {report.oneLineVerdict && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500 italic">
          &ldquo;{report.oneLineVerdict}&rdquo;
        </div>
      )}
    </div>
  );
}
