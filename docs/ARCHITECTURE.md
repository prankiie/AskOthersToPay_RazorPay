# Architecture

This document describes what was built in this repository — the actual implementation, not a speculative future architecture.

## L0 — the whole thing in one picture

```
┌──────────────────────────────────────────────────────────────┐
│  ENTRY SURFACES                                              │
│  A: Checkout SDK     B: QR Landing     C: Payment Link       │
└────────────────────────┬─────────────────────────────────────┘
                         │  POST /v1/delegations
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  DELEGATION PRIMITIVE (bound to an existing order_id)        │
│  • Server-assigned advisory tier (T1–T4)                     │
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

One primitive. Three entry points create it. One approval page resolves it. One set of webhook events delivers the result.

---

## What's in this repository

### Backend (`src/backend/`)

**Runtime:** Node.js + Express. SQLite via `better-sqlite3` (schema at `db.js`). One process.

**Routes (`src/backend/routes/`):**

- `delegation.js` — the core API. Nine endpoints for the delegation lifecycle:
  - `POST /v1/delegations` — create
  - `GET /v1/delegations/:id` — fetch with full context (auto-expires if TTL passed)
  - `POST /v1/delegations/:id/share` — mark shared
  - `POST /v1/delegations/:id/open` — approver opened the link
  - `POST /v1/delegations/:id/pay` — approver selected a payment method
  - `POST /v1/delegations/:id/capture` — payment succeeded
  - `POST /v1/delegations/:id/fail` — payment attempt failed (retryable)
  - `POST /v1/delegations/:id/decline` — approver declined
  - `POST /v1/delegations/:id/redelegate` — closed delegation spawns a new one for a different approver

- `scenarios.js` — lists the five demo scenarios and supports per-scenario reset for replay.

- `webhooks.js` — read-only inspection of webhook events fired during the demo.

Full schema in [API_REFERENCE.md](../src/backend/API_REFERENCE.md).

**Services (`src/backend/services/`):**

- `delegationMessageService.js` — generates the outgoing WhatsApp/SMS message. Two parts:
  - **Preamble** (optional, user-supplied): sanitized server-side. URLs stripped, phone numbers stripped, RTL overrides and homoglyphs removed, hard-capped at 140 characters.
  - **System block** (always present, server-generated): `Razorpay payment request`, amount, merchant name + verification badge, tier-specific context line (T1 shows item summary; T2 shows category; T3/T4 show neither), approval URL, expiry.
  
  The system block is cryptographically independent of the preamble — a user cannot construct a preamble that mimics the system block's tamper-proof section.

**Data (`src/backend/db.js`):**

- Schema: `merchants`, `orders`, `payment_links`, `qr_sessions`, `delegations`, `webhook_events`.
- Unique index `one_open_delegation_per_order` enforces the single-open constraint.
- Advisory tier assignment (`assignTrustTier()`) is computed server-side from merchant signals:
  - T4 — `risk_flagged` OR `tenure < 30 days` OR unverified
  - T1 — order has line items AND merchant `kyc_approved`
  - T2 — `kyc_approved` AND `mcc_code` AND tenure > 365 days
  - T3 — any other verified merchant (fallback)
  
  Tier is **never user-supplied**. The frontend cannot coerce it.

**Seed data:** five merchants mapped to the five demo scenarios, across all four tiers.

### Frontend (`src/`)

**Runtime:** React 18 + Vite. Inline styles (no UI framework — deliberate, to keep the prototype self-contained).

**Entry point:** `App.jsx` toggles between `ScenarioLauncher` (the landing page) and `DemoFlow` (the step-by-step journey for a chosen scenario).

**Core flow:** `DemoFlow.jsx` orchestrates the five steps — entry → compose → preview → approver → status — passing the delegation state between them.

**Entry surfaces:** `EntryCheckout.jsx` (A), `EntryQRLanding.jsx` (B, both dynamic and static variants), `EntryPaymentLink.jsx` (C).

**Delegation UI:** `DelegationCompose.jsx` (the form), `WhatsAppPreview.jsx` (what the approver receives), `ApproverPage.jsx` (the approval experience with the tier-adaptive trust panel), `StatusPage.jsx` (result).

**Supporting components:**
- `TrustPanel.jsx` — advisory panel, tier-adaptive (T1 very strong support → T4 caution advised).
- `HandshakePanel.jsx` — the "Under the Hood" developer panel. Shows API call, state transition, webhook events at each step. Collapsible.
- `WebhookLog.jsx` — fixed bottom panel with a live log of the webhook events the merchant receives.

**Theme:** `theme.js` — Razorpay-aligned palette (primary navy `#072654`, secondary blue `#528FF0`, accent green `#1CA672`, tier colors).

**API client:** `api.js` — thin fetch wrapper around the backend endpoints.

---

## Design decisions worth calling out

- **One primitive, not three parallel features.** The delegation table and state machine are shared across A, B, C. The entry point is a field, not a code path.
- **Server-side advisory tier.** The tier cannot be spoofed by the client. Merchant trust signals live in Razorpay's data; the frontend renders what the server decides.
- **Anti-spoofing on the outgoing message.** Preamble sanitized; system block server-generated. The design intent is that a malicious preamble cannot forge merchant or amount claims.
- **No requestor-name line on the approver page.** The delivery channel (WhatsApp/SMS from the requestor's own number) already carries identity. Razorpay does not invent one. See [MESSAGE_TEMPLATES.md](MESSAGE_TEMPLATES.md).
- **Identical webhook contract to direct payments.** `payment.captured` and `order.paid` fire exactly as they do for non-delegated payments — merchants do not change their integration.
- **TTL is a request-validity window, not a payment SLA.** 24 hours for web, 15 minutes for POS, inherits for Payment Links. It governs how long the approver has to act, nothing more.

---

## What the production version would add

This list reflects the gap between the demo and a production deployment. None of it is built in this repository.

- **Real payment rail integration.** The demo simulates `/capture` and `/fail` — production wires these to Razorpay's actual payment APIs.
- **Real messaging.** WhatsApp + SMS delivery via registered templates (see the Messaging infrastructure dependency in the executive summary).
- **Real merchant trust data.** The demo seeds merchant records with hardcoded tiers. Production reads live signals from Razorpay's existing merchant data pipelines.
- **Rate limiting, authentication, observability.** Omitted from the demo for clarity. Production would layer standard Razorpay-platform controls on top.
- **Storage at scale.** SQLite is fine for a single-process demo. Production would use whatever Razorpay already uses for payment-side storage.

The point of the demo is to prove the primitive, the UX, and the webhook contract — not to reproduce production infrastructure.
