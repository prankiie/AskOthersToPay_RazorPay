# Ask Others to Pay — Executive Summary

## The problem

Asking someone else to pay on your behalf is a common, legitimate, everyday act in India — a daughter buying something online and asking her father to pay; a wife at a restaurant asking her husband to cover the bill; an accountant forwarding a vendor invoice to the CFO. It happens constantly, offline and informally.

It has **never had a clean digital expression.** UPI P2P collect requests came closest but were banned by NPCI in October 2025 because of how badly they were abused for fraud. UPI Circle addresses a narrow slice (pre-registered trusted users with spending limits) but requires setup, doesn't carry merchant context, and isn't designed for ad-hoc delegation at the payment moment. Everything else is a phone call followed by a manual transfer — no merchant context, no trust signals, no audit trail, no receipt.

The use case is real and persistent. The open question is how well a structured digital path gets adopted, not whether the need exists.

## Why Razorpay

Razorpay can build this, and has good reason to. Not a claim no one else could do a version of it.

- **It fits Razorpay's existing surfaces.** The natural home for "Ask Someone to Pay" is the payment screen itself — Checkout, POS QR landing, Payment Link. Razorpay already runs all three.

- **Volume that's currently off-rail.** Today "ask someone to pay" resolves as a phone call followed by a separate UPI transfer — off Razorpay's rails, no order linkage, no audit trail. Bringing it on-rail is strategic volume for Razorpay and cleaner reconciliation for the merchant.

- **Adoption requires no merchant code.** Delegated payments emit the same `payment.captured` and `order.paid` events as direct ones, so the feature reaches a merchant's backend without integration work. That's a gateway-specific property.

## The solution

**Ask Others to Pay** is a merchant-facilitated payment delegation primitive built on Razorpay's existing payment infrastructure. It works like this:

1. A buyer reaches a Razorpay payment surface (Checkout, POS QR, or Payment Link — entry points A, B, C) and taps "Ask Someone to Pay" instead of paying directly.
2. They pick a contact and share a Razorpay-hosted approval link via WhatsApp or SMS, from their own device (the identity of the requestor is carried by the delivery channel — nothing fabricated).
3. The approver opens the link. The primary trust signal is interpersonal — the link came from a known contact over WhatsApp/SMS. The page adds secondary context (merchant name, amount, line items where available, and a graduated advisory indicator where Razorpay has signals) and they pay using their own UPI/card/netbanking.
4. The merchant receives the same `payment.captured` and `order.paid` webhooks they already handle. **No merchant code changes required.**

This is not a P2P collect request. It is anchored to a merchant order, carries merchant trust context, and flows through Razorpay's existing payment rails.

## How it works

One delegation primitive. Three entry points create it. One approval page resolves it. One set of webhook events delivers the result to the merchant — the same events the merchant already handles for direct payments.

```
┌──────────────────────────────────────────────────────────────┐
│  ENTRY SURFACES                                              │
│  A: Checkout SDK     B: QR Landing     C: Payment Link       │
└────────────────────────┬─────────────────────────────────────┘
                         │  POST /v1/delegations
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  DELEGATION PRIMITIVE (bound to an existing order_id)        │
│  • Server-assigned trust tier (T1–T4)                        │
│  • Sanitized preamble + tamper-proof system block            │
│  • One open delegation per order (DB-enforced)               │
│  • State machine + TTL                                       │
└────────────────────────┬─────────────────────────────────────┘
                         │  Share via WhatsApp/SMS
                         │  (from the requestor's own device)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  APPROVER PAGE — rzp.io/r/{delegation_id}                    │
│  • Razorpay-hosted, tier-adaptive trust panel                │
│  • Approver picks their own payment method                   │
└────────────────────────┬─────────────────────────────────────┘
                         │  Standard Razorpay payment rail
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  WEBHOOKS TO MERCHANT                                         │
│  payment.captured, order.paid                                 │
│  (Identical to direct-payment events → no merchant changes)   │
└──────────────────────────────────────────────────────────────┘
```

## What was built

This repository contains a **working end-to-end prototype** — not slides or mockups:

- **React frontend** with 5 demo scenarios covering all entry points (Checkout, Dynamic QR, Static QR concept, Payment Link, Low-trust Warning)
- **Express/Node backend** with a complete delegation state machine, server-side trust tier assignment, anti-spoofing message sanitization, and webhook event logging
- **SQLite database** with seeded merchants (T1 enterprise, T2 standard, T3 basic, T4 flagged), orders, and demo data
- **Developer "Under the Hood" panel** showing API calls, state transitions, and webhook events at every step — designed for an engineering audience

The prototype demonstrates:

- **End-to-end user journey, walkable in the browser.** Five scenarios covering all entry surfaces. Pick one → compose delegation → WhatsApp/SMS preview → approver opens → pays with their own method → result flows back.

- **One primitive, three entry points, one approval page.** Checkout, Dynamic QR, and Payment Link all `POST /v1/delegations` against the same backend and converge on the same approver route. On success, standard `payment.captured` + `order.paid` events are emitted so a merchant's existing handler works unchanged *(in the demo, events are logged in-process rather than delivered over HTTP)*. Entry surfaces are decoupled from the delegation primitive, and the primitive is decoupled from the merchant's integration.

- **Integrity mechanisms that make the flow safe to ship.** Server-side preamble sanitization (URLs, phone numbers, RTL overrides, homoglyphs stripped), tamper-proof server-generated system block regenerated on every open, a full delegation state machine with a working redelegate path, and a DB-level one-open-per-order constraint. The approver page deliberately carries no self-declared "From: {name}" — identity rides the delivery channel.

- **Tier-adaptive trust panel as a value-add layer.** Server-assigned trust tier (T1–T4) drives materially different approver-page layouts: T1 shows line items and a KYC badge, T4 shows a yellow caution banner. Useful as graduated context for the approver, but not load-bearing — Razorpay already controls which merchants reach these surfaces.

## Dependency categories for production

Categories of things to resolve with the right internal teams:

- **Regulatory** — confirmation that merchant-anchored delegation is distinct from banned P2P collect; any relevant NPCI / RBI positioning
- **Messaging infrastructure** — template registration and approval for SMS and WhatsApp notifications per Indian telecom rules
- **Risk and trust signals** — access to existing merchant fraud/risk scoring so the trust panel reflects real data
- **Platform events** — webhook event naming and registration for delegation lifecycle events alongside existing payment events
- **QR platform** — for Entry B, whether QR payloads that open a Razorpay-hosted page (vs. direct `upi://` URIs) fit existing POS behaviour
- **Merchant data pipeline** — surfacing KYC status, category, tenure, and other trust signals to the approver page
- **Identity sources** — whether and how requestor identity propagates from Checkout prefill / Payment Link customer blocks / POP

## Open questions

All of these are empirical and can only be answered by pilot data:

- **Adoption** — whether people will choose this path over a phone-call-plus-transfer
- **Approval rate** — what percentage of shared delegations get approved by the approver
- **Payment completion rate** — what percentage of approvals result in captured payments (the industry-standard success-rate metric)
- **Time to resolution** — how long a typical delegation takes from share to paid

## Demo

```
cd Claude_AskOthersToPay
npm install
npm run dev       # frontend at localhost:5173
npm run server    # backend at localhost:3001
```

Pick a scenario. Walk the full journey: entry point → compose delegation → WhatsApp preview → approver page with trust panel → payment → webhook events.
