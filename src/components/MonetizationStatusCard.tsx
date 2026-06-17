"use client";
import { t, Lang } from "@/lib/i18n";
import type { MonetizationStatus } from "@/lib/types";

export default function MonetizationStatusCard({ data, lang }: { data: MonetizationStatus; lang: Lang }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider">{t("monetization.title", lang)}</h3>
        <span className="text-sm font-medium">{data.marketValidationScore}/100</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
        <div className={`rounded-xl p-3 ${data.hasOfficialCommercial ? "bg-green-50" : "bg-gray-50"}`}>
          <div className="text-xs text-gray-400 mb-0.5">{t("official.commercial", lang)}</div>
          <div className={data.hasOfficialCommercial ? "text-green-600" : "text-gray-500"}>
            {data.hasOfficialCommercial ? t("official.commercial.yes", lang) : t("official.commercial.no", lang)}
          </div>
        </div>
        <div className={`rounded-xl p-3 ${data.hasPricingPage ? "bg-green-50" : "bg-gray-50"}`}>
          <div className="text-xs text-gray-400 mb-0.5">{t("pricing.page", lang)}</div>
          <div className={data.hasPricingPage ? "text-green-600" : "text-gray-500"}>{data.hasPricingPage ? "✓" : "✗"}</div>
        </div>
        <div className={`rounded-xl p-3 ${data.hasEnterprisePage ? "bg-green-50" : "bg-gray-50"}`}>
          <div className="text-xs text-gray-400 mb-0.5">{t("enterprise.page", lang)}</div>
          <div className={data.hasEnterprisePage ? "text-green-600" : "text-gray-500"}>{data.hasEnterprisePage ? "✓" : "✗"}</div>
        </div>
      </div>

      {data.officialProductName && (
        <div className="text-sm text-gray-500 mb-3">
          Product: <span className="text-gray-800">{data.officialProductName}</span>
        </div>
      )}

      {data.thirdPartyProducts.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-2">{t("third.party", lang)}</div>
          {data.thirdPartyProducts.map((p, i) => (
            <div key={i} className="text-sm bg-gray-50 rounded-xl p-3 mb-2">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-gray-400">{p.description}</div>
              <div className="text-xs text-gray-400 mt-1">{p.revenueModel}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
