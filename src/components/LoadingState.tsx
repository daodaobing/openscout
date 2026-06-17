"use client";
import React from "react";
import { t, Lang } from "@/lib/i18n";

const phases = [
  "loading.phase1", "loading.phase2", "loading.phase3",
  "loading.phase4", "loading.phase5",
];

export default function LoadingState({ lang }: { lang: Lang }) {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (active >= phases.length) return;
    const id = setTimeout(() => setActive(a => a + 1), 2000 + Math.random() * 3000);
    return () => clearTimeout(id);
  }, [active]);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {phases.map((p, i) => (
        <div key={p} className={`flex items-center gap-3 text-sm ${i <= active ? "text-gray-700" : "text-gray-300"}`}>
          <span className={`w-4 h-4 rounded-full border ${i < active ? "bg-green-500 border-green-500" : i === active ? "border-yellow-400 animate-pulse" : "border-gray-200"}`} />
          {t(p, lang)}
        </div>
      ))}
    </div>
  );
}
