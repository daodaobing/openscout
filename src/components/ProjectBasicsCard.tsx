"use client";
import { t, Lang } from "@/lib/i18n";
import type { ProjectBasics } from "@/lib/types";

const healthColors: Record<string, string> = { excellent: "text-green-600", good: "text-yellow-600", fair: "text-red-600" };

export default function ProjectBasicsCard({ data, lang }: { data: ProjectBasics; lang: Lang }) {
  const checks = [
    { label: "README", ok: data.hasReadme },
    { label: "License", ok: !!data.license },
    { label: "CI/CD", ok: data.hasCiCd },
    { label: "Docker", ok: data.hasDocker },
    { label: "Examples/Tests", ok: data.hasExamples },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
      <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-4">{t("project.title", lang)}</h3>

      <div className="flex items-start gap-4 mb-4">
        <img src={data.ownerAvatar} alt="" className="w-10 h-10 rounded-full" />
        <div>
          <div className="text-lg font-semibold">{data.fullName}</div>
          {data.description && <div className="text-sm text-gray-500 mt-0.5">{data.description}</div>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
        <span>★ {data.stars.toLocaleString()}</span>
        <span>⑂ {data.forks.toLocaleString()}</span>
        <span>⚠ {data.openIssues}</span>
        <span>{data.language || "?"}</span>
        {data.license && <span>{data.license}</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-center text-sm">
        {[
          { label: "Stars", value: data.stars.toLocaleString() },
          { label: "Commits (30d)", value: data.commits30d },
          { label: "Contributors", value: data.contributorCount },
          { label: "Releases", value: "-" },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3">
            <div className="font-medium">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {data.techStack.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Tech Stack</div>
          <div className="flex flex-wrap gap-1.5">
            {data.techStack.map(t => (
              <span key={t} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs">
        <span>Engineering: <span className={healthColors[data.engineeringHealth]}>{data.engineeringHealth.toUpperCase()}</span></span>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {checks.map(c => (
          <span key={c.label} className={`text-xs px-2 py-0.5 rounded ${c.ok ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
            {c.ok ? "✓" : "✗"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
