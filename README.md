# Ask Others to Pay — Razorpay Feature

A delegation primitive that lets a buyer at a Razorpay merchant ask a trusted approver (parent, spouse, friend) to pay on their behalf, with merchant trust context the approver needs to decide confidently.

## The one-line pitch

One order can carry one open delegation. Three entry points seed the same primitive; the approver always lands on the same hosted Razorpay approval page; the merchant always gets paid (or doesn't) via a single webhook contract.

## Zero merchant code changes

When a delegated payment succeeds, Razorpay fires the same `payment.captured` and `order.paid` webhooks the merchant already handles for direct payments. **Merchants don't need to change their integration.** The delegation is invisible to the merchant's backend — they just see a paid order. This is what makes adoption frictionless at scale.

## Entry points (unified flow)

| Entry | Surface | Who owns the screen |
|-------|---------|---------------------|
| A | Web/App checkout (Checkout SDK) | Merchant site → Razorpay iframe |
| B | In-store dynamic & static QR | Razorpay-hosted QR landing page (`rzp.io/q/{merchant_id}/{order_id}` dynamic; `rzp.io/q/{merchant_id}` static — concept) |
| C | Payment Link | Merchant dashboard → Razorpay hosted page |

v1 covers Razorpay merchants only. Non-Razorpay merchants are out of scope.

All three converge at: `rzp.io/r/{delegation_id}` → approver sees trust context → pays → webhook to merchant.

## Start here

- **[docs/EXECUTIVE_SUMMARY.md](docs/EXECUTIVE_SUMMARY.md)** — One-page pitch: problem, solution, how it works (L0 architecture), why Razorpay, what was built, dependencies, open empirical questions

## Read order (for reviewers / deep context)

1. [research/razorpay_research.md](research/razorpay_research.md) — Razorpay products, GTM, agentic stack, UPI ecosystem
2. [research/upi_payment_requests_research.md](research/upi_payment_requests_research.md) — P2P collect ban, fraud landscape, trust gap
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — L0 + what's in this repository
4. [docs/PAYMENT_FLOW_MECHANICS.md](docs/PAYMENT_FLOW_MECHANICS.md) — Unified flow, API grounding, state machine, edge cases
5. [docs/MESSAGE_TEMPLATES.md](docs/MESSAGE_TEMPLATES.md) — Two-part message architecture, tier templates, anti-spoofing
6. [docs/USER_FLOWS.md](docs/USER_FLOWS.md) — Demo walkthrough for the five scenarios
7. [docs/DEPENDENCIES_AND_CLARIFICATIONS.md](docs/DEPENDENCIES_AND_CLARIFICATIONS.md) — External dependencies and open questions

## Core design decisions (and why)

- **Merchant-facilitated, not P2P.** NPCI's Oct 2025 P2P-collect ban makes a pure peer request non-compliant; a merchant-anchored delegation on an `order_id` is the compliance thesis (pending NPCI confirmation).
- **One primitive, three entry points.** Smaller change surface, one set of APIs/webhooks/state machine, consistent approver UX regardless of surface.
- **Share-intent by default.** Requestor shares the link from their own WhatsApp/SMS; platform-sent is a fallback.
- **WhatsApp + SMS both on by default.** OG preview on WhatsApp is the trust signal.
- **First-person voice.** The message is *from the requestor*, with a tamper-proof system-appended block (amount, merchant verification, expiry, link).
- **Graceful data degradation.** T1 enterprise (line items + KYC badge) → T2 standard (MCC + tenure) → T3 basic (merchant name + status) → T4 warning (risk-flagged or new merchant). UI adapts; nothing is fabricated.

## Running the demo

```
cd Claude_AskOthersToPay
npm install
npm run dev       # frontend at localhost:5173
npm run server    # backend at localhost:3001 (cd src/backend && node server.js)
```

5 scenarios. Pick one, walk the full journey: entry point → compose delegation → WhatsApp preview → approver page with trust panel → payment → status + webhook events.

See [QUICKSTART.md](QUICKSTART.md) for details.

## Canonical code

- **Backend**: `src/backend/routes/delegation.js` (state machine), `src/backend/services/delegationMessageService.js` (anti-spoofing), `src/backend/db.js` (schema + seed)
- **Frontend**: `src/App.jsx` → `src/components/ScenarioLauncher.jsx` → `src/components/DemoFlow.jsx` → entry/compose/preview/approver/status components
