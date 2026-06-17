"use client";
import React from "react";
import { t, Lang } from "@/lib/i18n";

export default function SearchBar({ onAnalyze, lang }: { onAnalyze: (url: string) => void; lang: Lang }) {
  const [value, setValue] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onAnalyze(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto mb-8">
      <input value={value} onChange={e => setValue(e.target.value)}
        placeholder={t("search.placeholder", lang)}
        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-600 transition-colors" />
      <button type="submit"
        className="bg-zinc-100 text-zinc-900 px-6 py-3 rounded-xl text-sm font-medium hover:bg-zinc-300 transition-all shrink-0">
        {t("search.button", lang)}
      </button>
    </form>
  );
}
