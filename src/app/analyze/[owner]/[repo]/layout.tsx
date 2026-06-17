import type { Metadata } from "next";
import { fetchRepoData } from "@/lib/github";

type Props = { params: Promise<{ owner: string; repo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, repo } = await params;
  const fullName = owner + "/" + repo;
  let desc = "Complete commercial evaluation of " + fullName + ": technical maturity, commercial potential, market opportunities, and risks.";
  try {
    const data = await fetchRepoData(fullName);
    if (data.repoInfo.description) desc = data.repoInfo.description.slice(0, 200);
  } catch {}

  return {
    title: "GitWorth Analysis: " + fullName + " — Free GitHub Repo Analyzer",
    description: desc,
    openGraph: {
      title: "GitWorth — " + fullName + " Commercial Evaluation",
      description: desc.slice(0, 150),
      type: "article",
      url: "https://openscout-tau.vercel.app/analyze/" + fullName,
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "https://gitworth-landing.vercel.app/analyze/" + fullName },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
