/*
 * Minimal local emulator of the Stripe API for end-to-end tests (never used in production: the app
 * only talks to it with TEST keys and STRIPE_API_BASE set). It implements what Alterpark calls —
 * Checkout Sessions (create with idempotency, expire), Refunds — plus a hosted « payment page »
 * whose buttons pay (sending a signed checkout.session.completed webhook, as Stripe does) or cancel.
 *
 *   node e2e/support/stripe-emulator.mjs   (PORT, APP_URL, STRIPE_WEBHOOK_SECRET from the env)
 */
import { createServer } from "node:http";
import { createHmac, randomBytes } from "node:crypto";

const PORT = Number(process.env.STRIPE_EMULATOR_PORT ?? 12111);
const APP_URL = process.env.APP_URL ?? "http://localhost:3100";
const SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_e2e_local_secret";
const sessions = new Map();
const byIdempotency = new Map();
const id = (prefix) => `${prefix}_e2e_${randomBytes(8).toString("hex")}`;

async function body(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return Object.fromEntries(new URLSearchParams(raw));
}

function send(res, status, payload, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(typeof payload === "string" ? payload : JSON.stringify(payload));
}

async function webhook(type, object) {
  const payload = JSON.stringify({ id: id("evt"), object: "event", type, api_version: "2026-10-28.endive", created: Math.floor(Date.now() / 1000), livemode: false, pending_webhooks: 1, request: null, data: { object } });
  const t = Math.floor(Date.now() / 1000);
  const sig = createHmac("sha256", SECRET).update(`${t}.${payload}`).digest("hex");
  const r = await fetch(`${APP_URL}/api/webhooks/stripe`, { method: "POST", body: payload, headers: { "Content-Type": "application/json", "Stripe-Signature": `t=${t},v1=${sig}` } });
  if (!r.ok) console.error("emulator: webhook rejected", r.status, await r.text());
  return r.status;
}

const page = (s) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Paiement (émulateur Stripe)</title></head>
<body><main><h1>Émulateur de paiement</h1><p>Montant : ${(s.amount_total / 100).toFixed(2)} ${s.currency.toUpperCase()}</p>
<form method="post" action="/pay/${s.id}/succeed"><button type="submit">Payer</button></form>
<form method="post" action="/pay/${s.id}/fail"><button type="submit">Refuser le paiement</button></form>
<p><a href="${s.cancel_url}">Retour au site</a></p></main></body></html>`;

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const parts = url.pathname.split("/").filter(Boolean);

    if (req.method === "POST" && url.pathname === "/v1/checkout/sessions") {
      const key = req.headers["idempotency-key"];
      if (key && byIdempotency.has(key)) return send(res, 200, sessions.get(byIdempotency.get(key)));
      const p = await body(req);
      const s = {
        id: id("cs_test"),
        object: "checkout.session",
        mode: "payment",
        status: "open",
        payment_status: "unpaid",
        amount_total: Number(p["line_items[0][price_data][unit_amount]"]),
        currency: p["line_items[0][price_data][currency]"],
        client_reference_id: p.client_reference_id ?? null,
        metadata: { reservationId: p["metadata[reservationId]"], reference: p["metadata[reference]"] },
        customer_email: p.customer_email ?? null,
        success_url: p.success_url,
        cancel_url: p.cancel_url,
        expires_at: Number(p.expires_at),
        payment_intent: null,
      };
      s.url = `http://localhost:${PORT}/pay/${s.id}`;
      sessions.set(s.id, s);
      if (key) byIdempotency.set(key, s.id);
      return send(res, 200, s);
    }

    if (req.method === "POST" && parts[0] === "v1" && parts[1] === "checkout" && parts[4] === "expire") {
      const s = sessions.get(parts[3]);
      if (!s || s.status !== "open") return send(res, 400, { error: { type: "invalid_request_error", message: "Session is not open" } });
      s.status = "expired";
      await webhook("checkout.session.expired", s);
      return send(res, 200, s);
    }

    if (req.method === "POST" && url.pathname === "/v1/refunds") {
      const p = await body(req);
      return send(res, 200, { id: id("re"), object: "refund", status: "succeeded", amount: Number(p.amount), payment_intent: p.payment_intent, metadata: { refundId: p["metadata[refundId]"], reservationId: p["metadata[reservationId]"] } });
    }

    if (req.method === "GET" && parts[0] === "pay" && sessions.has(parts[1])) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(page(sessions.get(parts[1])));
    }

    if (req.method === "POST" && parts[0] === "pay" && sessions.has(parts[1])) {
      const s = sessions.get(parts[1]);
      if (parts[2] === "succeed" && s.status === "open") {
        Object.assign(s, { status: "complete", payment_status: "paid", payment_intent: id("pi") });
        await webhook("checkout.session.completed", s);
        res.writeHead(303, { Location: s.success_url });
        return res.end();
      }
      if (parts[2] === "fail" && s.status === "open") {
        s.status = "expired";
        await webhook("checkout.session.async_payment_failed", s);
        res.writeHead(303, { Location: s.cancel_url });
        return res.end();
      }
    }

    if (url.pathname === "/health") return send(res, 200, { ok: true });
    send(res, 404, { error: { type: "invalid_request_error", message: `Not emulated: ${req.method} ${url.pathname}` } });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: { message: String(e) } });
  }
}).listen(PORT, () => console.log(`Stripe emulator on http://localhost:${PORT}`));
