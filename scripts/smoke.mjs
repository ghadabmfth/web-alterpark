/*
 * Post-deployment smoke test (Preview or Production), read-only:
 *   node scripts/smoke.mjs https://<deployment>            [--indexable] [--expect-database]
 * Protected previews: add VERCEL_AUTOMATION_BYPASS_SECRET to the environment (Vercel → Deployment
 * Protection → Protection Bypass for Automation).
 */
const [base, ...flags] = process.argv.slice(2);
if (!base) {
  console.error("Usage: node scripts/smoke.mjs <url> [--indexable] [--expect-database]");
  process.exit(2);
}
const indexable = flags.includes("--indexable");
const expectDb = flags.includes("--expect-database");
const headers = process.env.VERCEL_AUTOMATION_BYPASS_SECRET ? { "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET } : {};
let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed += 1;
};
const get = (path, init = {}) => fetch(new URL(path, base), { redirect: "manual", ...init, headers: { ...headers, ...(init.headers ?? {}) } });

for (const path of ["/", "/parkings", "/parkings/nantes", "/reservation", "/faq", "/contact", "/connexion", "/sitemap.xml"]) {
  const r = await get(path);
  check(`GET ${path}`, r.status === 200, String(r.status));
}
const home = await get("/");
const h = home.headers;
check("security headers", !!h.get("content-security-policy") && h.get("x-frame-options") === "DENY" && !!h.get("strict-transport-security"));
const robots = await (await get("/robots.txt")).text();
check(indexable ? "robots.txt open" : "robots.txt closed", indexable ? !/Disallow: \/\s*$/m.test(robots) : /Disallow: \/\s*$/m.test(robots));
const health = await get("/api/health");
const hj = await health.json().catch(() => ({}));
check("health", health.status === 200 && hj.status === "ok", JSON.stringify(hj));
if (expectDb) check("database reachable", hj.database === "ok");
const admin = await get("/admin");
check("/admin requires sign-in", [302, 303, 307, 308].includes(admin.status) && (admin.headers.get("location") ?? "").includes("/connexion"), `${admin.status} ${admin.headers.get("location") ?? ""}`);
check("cron refuses anonymous calls", (await get("/api/cron/notifications")).status === 401);
const hook = await get("/api/webhooks/stripe", { method: "POST", body: "{}", headers: { "stripe-signature": "t=1,v1=0" } });
check("webhook refuses unsigned events", [400, 503].includes(hook.status), String(hook.status));
check("unknown page is 404", (await get("/nexiste-pas")).status === 404);

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
