/*
 * Payment provider boundary (ADR-009). The rest of the application only knows these types; Stripe
 * lives in ./stripe.ts. A provider never decides anything about reservations: it creates hosted
 * checkout sessions and refunds, and turns verified webhooks into normalised events.
 */

export interface CheckoutInput {
  reservationId: string;
  reference: string;
  amountCents: number;
  currency: string;
  /** Shown on the hosted payment page. */
  label: string;
  description: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  expiresAt: Date;
  /** Same key → same session (safe retries). */
  idempotencyKey: string;
}

export interface RefundInput {
  providerPaymentId: string;
  amountCents: number;
  refundId: string;
  reservationId: string;
  idempotencyKey: string;
}

export type ProviderRefundStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED";

interface Base {
  eventId: string;
  type: string;
}

export type PaymentEvent =
  | (Base & {
      kind: "checkout.completed";
      sessionId: string;
      reservationId: string | null;
      providerPaymentId: string | null;
      amountCents: number | null;
      currency: string | null;
      /** false for delayed methods: wait for checkout.async_succeeded. */
      paid: boolean;
    })
  | (Base & { kind: "checkout.failed" | "checkout.expired"; sessionId: string; reservationId: string | null })
  | (Base & { kind: "refund.updated"; providerRefundId: string; refundId: string | null; status: ProviderRefundStatus; failureReason: string | null })
  | (Base & { kind: "ignored" });

export class InvalidWebhookError extends Error {}

export interface PaymentProvider {
  readonly name: "STRIPE";
  createCheckout(input: CheckoutInput): Promise<{ sessionId: string; url: string }>;
  /** Best effort: closes an open session so an abandoned booking cannot be paid later. */
  expireCheckout(sessionId: string): Promise<void>;
  refund(input: RefundInput): Promise<{ providerRefundId: string; status: ProviderRefundStatus }>;
  /** Verifies the signature (throws InvalidWebhookError) and normalises the event. */
  parseWebhook(rawBody: string, signature: string | null): Promise<PaymentEvent>;
}
