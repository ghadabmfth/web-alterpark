import { after } from "next/server";
import { InvalidWebhookError } from "@/modules/payments/provider";
import { paymentProvider, paymentsConfigured } from "@/modules/payments/stripe";
import { handlePaymentEvent } from "@/modules/payments/service";
import { processOutbox } from "@/modules/notifications/outbox";

/*
 * Stripe webhook endpoint. Authenticated by signature only (raw body + Stripe-Signature header);
 * the redirect after payment never confirms anything. 400 on a bad signature, 500 on a processing
 * error so Stripe retries (events are idempotent), 200 otherwise.
 */
export async function POST(request: Request) {
  if (!paymentsConfigured()) return new Response("Payments not configured", { status: 503 });
  const body = await request.text();
  let event;
  try {
    event = await paymentProvider().parseWebhook(body, request.headers.get("stripe-signature"));
  } catch (e) {
    if (e instanceof InvalidWebhookError) return new Response("Invalid signature", { status: 400 });
    throw e;
  }
  try {
    const outcome = await handlePaymentEvent(event);
    after(() => processOutbox().catch((err) => console.error("outbox", err)));
    return Response.json({ received: true, outcome });
  } catch (e) {
    console.error("webhook: processing failed", event.eventId, e);
    return new Response("Processing error", { status: 500 });
  }
}
