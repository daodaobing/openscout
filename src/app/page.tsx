"use client";
import React from "react";
import { t, Lang } from "@/lib/i18n";
import type { Report } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import LoadingState from "@/components/LoadingState";
import ConclusionCard from "@/components/ConclusionCard";
import ProjectBasicsCard from "@/components/ProjectBasicsCard";
import CommercialValueCard from "@/components/CommercialValueCard";
import MonetizationStatusCard from "@/components/MonetizationStatusCard";
import OpportunityAnalysisCard from "@/components/OpportunityAnalysisCard";
import RiskAnalysisCard from "@/components/RiskAnalysisCard";

type PageState = "idle" | "loading" | "result" | "error";

export default function Home() {
  const [state, setState] = React.useState<PageState>("idle");
  const [report, setReport] = React.useState<Report | null>(null);
  const [error, setError] = React.useState("");
  const [lang, setLang] = React.useState<Lang>("en");
  const lastUrl = React.useRef("");

  async function fetchReport(url: string, langCode: Lang) {
    setState("loading"); setError(""); setReport(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url, lang: langCode }),
      });
      const json = await res.json();
      if (!res.ok) { setState("error"); setError(json.error || "Request failed"); return; }
      setReport(json as Report);
      setState("result");
    } catch {
      setState("error"); setError("Network error");
    }
  }

  function handleAnalyze(url: string) {
    lastUrl.current = url;
    fetchReport(url, lang);
  }

  function handleToggleLang() {
    const newLang = lang === "en" ? "zh" : "en";
    setLang(newLang);
    if (lastUrl.current) {
      fetchReport(lastUrl.current, newLang);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <span className="text-sm font-bold tracking-tight">{t("app.name", lang)}</span>
          <button onClick={handleToggleLang}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            {t("lang.toggle", lang)}
          </button>
        </div>

        {state === "idle" && (
          <div className="pt-16 text-center">
            <h2 className="text-2xl font-bold mb-2">{t("app.name", lang)}</h2>
            <p className="text-zinc-500 text-sm mb-8">{t("app.slogan", lang)}</p>
            <SearchBar onAnalyze={handleAnalyze} lang={lang} />
          </div>
        )}

        {state === "loading" && <LoadingState lang={lang} />}

        {state === "result" && report && (
          <div>
            <SearchBar onAnalyze={handleAnalyze} lang={lang} />
            <ConclusionCard report={report} lang={lang} />
            <ProjectBasicsCard data={report.projectBasics} lang={lang} />
            <CommercialValueCard data={report.commercialValue} lang={lang} />
            <MonetizationStatusCard data={report.monetizationStatus} lang={lang} />
            <OpportunityAnalysisCard data={report.opportunityAnalysis} lang={lang} />
            <RiskAnalysisCard data={report.riskAnalysis} lang={lang} />
          </div>
        )}

        {state === "error" && (
          <div className="text-center pt-16">
            <div className="text-red-400 text-sm mb-4">{error}</div>
            <button onClick={() => setState("idle")}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline">
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
