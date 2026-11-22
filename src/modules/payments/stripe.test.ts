import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import { InvalidWebhookError } from "./provider";
import { StripeProvider } from "./stripe";

const SECRET = "whsec_test_secret_for_unit_tests";
const provider = new StripeProvider("sk_test_unit", SECRET);
const stripe = new Stripe("sk_test_unit");

function signed(event: object, secret = SECRET) {
  const payload = JSON.stringify(event);
  return { payload, header: stripe.webhooks.generateTestHeaderString({ payload, secret }) };
}

const session = (o: object = {}) => ({
  id: "cs_test_1",
  object: "checkout.session",
  client_reference_id: "res-1",
  metadata: { reservationId: "res-1" },
  payment_intent: "pi_1",
  amount_total: 2700,
  currency: "eur",
  payment_status: "paid",
  ...o,
});
const event = (type: string, object: object) => ({ id: "evt_1", object: "event", type, data: { object }, api_version: "2026-10-28.endive", created: 1, livemode: false, pending_webhooks: 1, request: null });

describe("Stripe webhook verification", () => {
  it("accepts a correctly signed event and normalises it", async () => {
    const { payload, header } = signed(event("checkout.session.completed", session()));
    expect(await provider.parseWebhook(payload, header)).toEqual({
      eventId: "evt_1", type: "checkout.session.completed", kind: "checkout.completed", sessionId: "cs_test_1",
      reservationId: "res-1", providerPaymentId: "pi_1", amountCents: 2700, currency: "EUR", paid: true,
    });
  });

  it("rejects a missing, forged or tampered signature", async () => {
    const { payload, header } = signed(event("checkout.session.completed", session()));
    await expect(provider.parseWebhook(payload, null)).rejects.toBeInstanceOf(InvalidWebhookError);
    await expect(provider.parseWebhook(payload, signed(JSON.parse(payload), "whsec_other").header)).rejects.toBeInstanceOf(InvalidWebhookError);
    await expect(provider.parseWebhook(payload.replace("2700", "1"), header)).rejects.toBeInstanceOf(InvalidWebhookError);
  });

  it("maps delayed payments, expiry, failure, refunds and ignores the rest", async () => {
    const parse = (type: string, obj: object) => {
      const { payload, header } = signed(event(type, obj));
      return provider.parseWebhook(payload, header);
    };
    expect(await parse("checkout.session.completed", session({ payment_status: "unpaid" }))).toMatchObject({ kind: "checkout.completed", paid: false });
    expect(await parse("checkout.session.async_payment_succeeded", session())).toMatchObject({ kind: "checkout.completed", paid: true });
    expect(await parse("checkout.session.async_payment_failed", session())).toMatchObject({ kind: "checkout.failed", sessionId: "cs_test_1" });
    expect(await parse("checkout.session.expired", session({ payment_status: "unpaid" }))).toMatchObject({ kind: "checkout.expired" });
    expect(await parse("refund.updated", { id: "re_1", object: "refund", status: "succeeded", metadata: { refundId: "r-1" }, failure_reason: null })).toMatchObject({ kind: "refund.updated", providerRefundId: "re_1", refundId: "r-1", status: "SUCCEEDED" });
    expect(await parse("customer.created", { id: "cus_1", object: "customer" })).toMatchObject({ kind: "ignored" });
  });
});
