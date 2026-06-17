"use client";
import { t, Lang } from "@/lib/i18n";
import type { MonetizationStatus } from "@/lib/types";

export default function MonetizationStatusCard({ data, lang }: { data: MonetizationStatus; lang: Lang }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs text-zinc-500 uppercase tracking-wider">{t("monetization.title", lang)}</h3>
        <span className="text-sm font-medium">{data.marketValidationScore}/100</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
        <div className={`rounded-xl p-3 ${data.hasOfficialCommercial ? "bg-green-900/20" : "bg-zinc-800/40"}`}>
          <div className="text-xs text-zinc-500 mb-0.5">{t("official.commercial", lang)}</div>
          <div className={data.hasOfficialCommercial ? "text-green-400" : "text-zinc-400"}>
            {data.hasOfficialCommercial ? t("official.commercial.yes", lang) : t("official.commercial.no", lang)}
          </div>
        </div>
        <div className={`rounded-xl p-3 ${data.hasPricingPage ? "bg-green-900/20" : "bg-zinc-800/40"}`}>
          <div className="text-xs text-zinc-500 mb-0.5">{t("pricing.page", lang)}</div>
          <div className={data.hasPricingPage ? "text-green-400" : "text-zinc-400"}>{data.hasPricingPage ? "✓" : "✗"}</div>
        </div>
        <div className={`rounded-xl p-3 ${data.hasEnterprisePage ? "bg-green-900/20" : "bg-zinc-800/40"}`}>
          <div className="text-xs text-zinc-500 mb-0.5">{t("enterprise.page", lang)}</div>
          <div className={data.hasEnterprisePage ? "text-green-400" : "text-zinc-400"}>{data.hasEnterprisePage ? "✓" : "✗"}</div>
        </div>
      </div>

      {data.officialProductName && (
        <div className="text-sm text-zinc-400 mb-3">
          Product: <span className="text-zinc-200">{data.officialProductName}</span>
        </div>
      )}

      {data.thirdPartyProducts.length > 0 && (
        <div>
          <div className="text-xs text-zinc-500 mb-2">{t("third.party", lang)}</div>
          {data.thirdPartyProducts.map((p, i) => (
            <div key={i} className="text-sm bg-zinc-800/40 rounded-xl p-3 mb-2">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-zinc-500">{p.description}</div>
              <div className="text-xs text-zinc-600 mt-1">{p.revenueModel}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
