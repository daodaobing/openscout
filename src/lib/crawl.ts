export type CrawlResult = {
  hasPricingPage: boolean;
  hasEnterprisePage: boolean;
  officialProductName: string;
};

export async function crawlOfficialSite(homepage: string | null): Promise<CrawlResult> {
  if (!homepage) {
    return { hasPricingPage: false, hasEnterprisePage: false, officialProductName: "" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(homepage, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return { hasPricingPage: false, hasEnterprisePage: false, officialProductName: "" };

    const text = await res.text();
    const lower = text.toLowerCase();

    const hasPricing = lower.includes("pricing") || lower.includes("/pricing") || lower.includes("price") || lower.includes("plans");
    const hasEnterprise = lower.includes("enterprise") || lower.includes("/enterprise");
    let productName = "";

    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      productName = titleMatch[1].trim().split("|")[0].split("–")[0].trim();
    }

    return { hasPricingPage: hasPricing, hasEnterprisePage: hasEnterprise, officialProductName: productName };
  } catch {
    return { hasPricingPage: false, hasEnterprisePage: false, officialProductName: "" };
  }
}
