import type { CheckoutInput, PaymentEvent, PaymentProvider, ProviderRefundStatus, RefundInput } from "@/modules/payments/provider";

/*
 * In-memory payment provider for integration tests: same contract as Stripe (idempotency keys,
 * session ids, refunds), no network. Webhook events are built by the tests and handed directly to
 * handlePaymentEvent (signature checking is covered by stripe.test.ts).
 */
export class FakePaymentProvider implements PaymentProvider {
  readonly name = "STRIPE" as const;
  readonly sessions = new Map<string, CheckoutInput & { sessionId: string }>();
  readonly refunds: (RefundInput & { providerRefundId: string })[] = [];
  readonly expired: string[] = [];
  refundStatus: ProviderRefundStatus = "SUCCEEDED";
  failCheckout = false;
  failRefund = false;
  private byKey = new Map<string, string>();
  private n = 0;

  async createCheckout(input: CheckoutInput) {
    if (this.failCheckout) throw new Error("provider down");
    let id = this.byKey.get(input.idempotencyKey);
    if (!id) {
      id = `cs_test_${++this.n}_${Math.random().toString(36).slice(2, 10)}`;
      this.byKey.set(input.idempotencyKey, id);
      this.sessions.set(id, { ...input, sessionId: id });
    }
    return { sessionId: id, url: `https://checkout.example/pay/${id}` };
  }

  async expireCheckout(sessionId: string) {
    this.expired.push(sessionId);
  }

  async refund(input: RefundInput) {
    if (this.failRefund) throw new Error("provider down");
    const existing = this.refunds.find((r) => r.idempotencyKey === input.idempotencyKey);
    if (existing) return { providerRefundId: existing.providerRefundId, status: this.refundStatus };
    const providerRefundId = `re_test_${++this.n}_${Math.random().toString(36).slice(2, 10)}`;
    this.refunds.push({ ...input, providerRefundId });
    return { providerRefundId, status: this.refundStatus };
  }

  async parseWebhook(): Promise<PaymentEvent> {
    throw new Error("not used in tests");
  }

  /* Event builders */
  completed(sessionId: string, o: { paid?: boolean; amountCents?: number; eventId?: string } = {}): PaymentEvent {
    const s = this.sessions.get(sessionId)!;
    return {
      kind: "checkout.completed",
      type: "checkout.session.completed",
      eventId: o.eventId ?? `evt_${Math.random().toString(36).slice(2)}`,
      sessionId,
      reservationId: s.reservationId,
      providerPaymentId: `pi_${sessionId}`,
      amountCents: o.amountCents ?? s.amountCents,
      currency: s.currency,
      paid: o.paid ?? true,
    };
  }

  closed(sessionId: string, kind: "checkout.expired" | "checkout.failed", eventId?: string): PaymentEvent {
    return { kind, type: kind === "checkout.expired" ? "checkout.session.expired" : "checkout.session.async_payment_failed", eventId: eventId ?? `evt_${Math.random().toString(36).slice(2)}`, sessionId, reservationId: this.sessions.get(sessionId)!.reservationId };
  }
}
