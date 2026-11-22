import "server-only";
import Stripe from "stripe";
import { env } from "@/server/config/env";
import { InvalidWebhookError, type PaymentEvent, type PaymentProvider, type ProviderRefundStatus } from "./provider";

/*
 * Stripe implementation: hosted Checkout Sessions (no card data on our side, 3-D Secure and wallets
 * by Stripe), refunds, signed webhooks. The SDK pins its API version (stripe@23.1.0).
 */

const REFUND_STATUS: Record<string, ProviderRefundStatus> = {
  pending: "PENDING",
  requires_action: "PENDING",
  succeeded: "SUCCEEDED",
  failed: "FAILED",
  canceled: "CANCELED",
};

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : (v?.id ?? null));

export function normaliseStripeEvent(event: Stripe.Event): PaymentEvent {
  const base = { eventId: event.id, type: event.type };
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const s = event.data.object;
      return {
        ...base,
        kind: "checkout.completed",
        sessionId: s.id,
        reservationId: s.client_reference_id ?? s.metadata?.reservationId ?? null,
        providerPaymentId: idOf(s.payment_intent),
        amountCents: s.amount_total,
        currency: s.currency?.toUpperCase() ?? null,
        paid: s.payment_status === "paid",
      };
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const s = event.data.object;
      return { ...base, kind: event.type === "checkout.session.expired" ? "checkout.expired" : "checkout.failed", sessionId: s.id, reservationId: s.client_reference_id ?? s.metadata?.reservationId ?? null };
    }
    case "refund.created":
    case "refund.updated":
    case "refund.failed": {
      const r = event.data.object;
      return { ...base, kind: "refund.updated", providerRefundId: r.id, refundId: r.metadata?.refundId ?? null, status: REFUND_STATUS[r.status ?? ""] ?? "PENDING", failureReason: r.failure_reason ?? null };
    }
    default:
      return { ...base, kind: "ignored" };
  }
}

/**
 * End-to-end tests point the SDK at a local Stripe emulator (e2e/support/stripe-emulator.ts) with
 * STRIPE_API_BASE. Honoured with TEST keys only: a live key always talks to Stripe.
 */
export function emulatorEndpoint(secretKey: string, base = process.env.STRIPE_API_BASE): { host?: string; port?: number; protocol?: "http" | "https" } {
  if (!base || !/^(sk|rk)_test_/.test(secretKey)) return {};
  const u = new URL(base);
  return { host: u.hostname, port: Number(u.port || (u.protocol === "https:" ? 443 : 80)), protocol: u.protocol === "https:" ? "https" : "http" };
}

export class StripeProvider implements PaymentProvider {
  readonly name = "STRIPE" as const;
  private readonly stripe: Stripe;

  constructor(
    secretKey: string,
    private readonly webhookSecret: string,
  ) {
    this.stripe = new Stripe(secretKey, { maxNetworkRetries: 2, timeout: 20_000, appInfo: { name: "alterpark" }, ...emulatorEndpoint(secretKey) });
  }

  async createCheckout(i: Parameters<PaymentProvider["createCheckout"]>[0]) {
    const s = await this.stripe.checkout.sessions.create(
      {
        mode: "payment",
        locale: "fr",
        customer_email: i.customerEmail,
        client_reference_id: i.reservationId,
        metadata: { reservationId: i.reservationId, reference: i.reference },
        payment_intent_data: { description: `ALTERPARK ${i.reference}`, metadata: { reservationId: i.reservationId, reference: i.reference } },
        line_items: [{ quantity: 1, price_data: { currency: i.currency.toLowerCase(), unit_amount: i.amountCents, product_data: { name: i.label, description: i.description } } }],
        expires_at: Math.floor(i.expiresAt.getTime() / 1000),
        success_url: i.successUrl,
        cancel_url: i.cancelUrl,
      },
      { idempotencyKey: i.idempotencyKey },
    );
    if (!s.url) throw new Error("Stripe returned a session without URL");
    return { sessionId: s.id, url: s.url };
  }

  async expireCheckout(sessionId: string) {
    try {
      await this.stripe.checkout.sessions.expire(sessionId);
    } catch (e) {
      // Already completed or expired: nothing to do.
      if (!(e instanceof Stripe.errors.StripeInvalidRequestError)) throw e;
    }
  }

  async refund(i: Parameters<PaymentProvider["refund"]>[0]) {
    const r = await this.stripe.refunds.create(
      { payment_intent: i.providerPaymentId, amount: i.amountCents, reason: "requested_by_customer", metadata: { refundId: i.refundId, reservationId: i.reservationId } },
      { idempotencyKey: i.idempotencyKey },
    );
    return { providerRefundId: r.id, status: REFUND_STATUS[r.status ?? ""] ?? "PENDING" };
  }

  async parseWebhook(rawBody: string, signature: string | null): Promise<PaymentEvent> {
    if (!signature) throw new InvalidWebhookError("Missing signature");
    let event: Stripe.Event;
    try {
      event = await this.stripe.webhooks.constructEventAsync(rawBody, signature, this.webhookSecret);
    } catch {
      throw new InvalidWebhookError("Invalid signature");
    }
    return normaliseStripeEvent(event);
  }
}

let override: PaymentProvider | null = null;
let instance: StripeProvider | null = null;

/** True when the payment variables are set (the funnel enables « Payer » only then). */
export function paymentsConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET;
}

export function paymentProvider(): PaymentProvider {
  if (override) return override;
  if (!instance) {
    const e = env("stripe");
    instance = new StripeProvider(e.STRIPE_SECRET_KEY, e.STRIPE_WEBHOOK_SECRET);
  }
  return instance;
}

/** Tests only: replaces the provider (integration tests never call Stripe). */
export function setPaymentProviderForTests(p: PaymentProvider | null) {
  override = p;
}
