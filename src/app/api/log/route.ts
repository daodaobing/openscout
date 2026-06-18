// In-memory log store (per-instance, resets on cold start)
const logStore: any[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entry = {
      repo: body.repo || "",
      timestamp: new Date().toISOString(),
      country: request.headers.get("x-vercel-ip-country") || "unknown",
      ip: request.headers.get("x-forwarded-for") || "",
    };
    logStore.push(entry);
    if (logStore.length > 500) logStore.splice(0, logStore.length - 500);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  const total = logStore.length;
  const countries: Record<string, number> = {};
  const repos: Record<string, number> = {};
  logStore.forEach((e) => {
    countries[e.country] = (countries[e.country] || 0) + 1;
    repos[e.repo] = (repos[e.repo] || 0) + 1;
  });
  return Response.json({
    total,
    countries: Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 20),
    repos: Object.entries(repos).sort((a, b) => b[1] - a[1]).slice(0, 30),
    recent: logStore.slice(-20).reverse(),
  });
}
