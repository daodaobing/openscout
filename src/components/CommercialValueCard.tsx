"use client";
import { t, Lang } from "@/lib/i18n";
import type { CommercialValue } from "@/lib/types";

function bar(value: "high" | "medium" | "low"): { pct: number; color: string } {
  if (value === "high") return { pct: 85, color: "bg-green-500" };
  if (value === "medium") return { pct: 55, color: "bg-yellow-500" };
  return { pct: 25, color: "bg-red-500" };
}

export default function CommercialValueCard({ data, lang }: { data: CommercialValue; lang: Lang }) {
  const rows = [
    { label: t("user.value", lang), value: data.userValue },
    { label: t("enterprise.value", lang), value: data.enterpriseWillingness },
    { label: t("market.size", lang), value: data.marketSize },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider">{t("commercial.title", lang)}</h3>
        <span className="text-sm font-medium">{data.score}/100</span>
      </div>

      {data.painPoint && (
        <div className="mb-4 bg-gray-50 rounded-xl p-3 text-sm text-gray-700 italic">
          &ldquo;{data.painPoint}&rdquo;
        </div>
      )}

      <div className="space-y-3">
        {rows.map(r => {
          const b = bar(r.value as "high" | "medium" | "low");
          return (
            <div key={r.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">{r.label}</span>
                <span className="text-gray-400 uppercase">{r.value}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${b.color}`} style={{ width: b.pct + "%" }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-gray-400">
        <span>Competition: <span className="text-gray-700 uppercase">{data.competitionLevel}</span></span>
        <span>Maturity: <span className="text-gray-700 uppercase">{data.marketMaturity}</span></span>
      </div>
    </div>
  );
}
