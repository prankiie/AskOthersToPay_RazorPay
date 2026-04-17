# Dependencies & Clarifications: Ask Others to Pay

## About This Document

This is an outside-in proposal artifact. It lists the external dependencies a Razorpay team would own if it chose to build the "Ask Others to Pay" feature described in the rest of this repo, and it documents the placeholders the prototype wired in for identifiers that only Razorpay can confirm (field names, endpoint shapes, webhook event names, template IDs, sender IDs).

**Audience:** Razorpay teams evaluating the proposal — Platform/Webhooks, QR platform, Checkout SDK, Risk/Fraud, Messaging/Comms, Legal/Compliance, GTM.

Severity labels (BLOCKER / HIGH / MEDIUM) describe external readiness, not an internal schedule.

---

## 1. Dependencies by Owning Team

### Platform / Webhooks / API Gateway — BLOCKER

- **Orders API `line_items` readability.** T1 template rendering assumes `line_items` (name, quantity, amount) is available on the order at delegation time, un-truncated.
- **New webhook events.** Four delegation lifecycle events would need to be defined and emitted by the platform: requested, approved/paid, declined, expired. Schema, versioning, and delivery guarantees are platform decisions. **These events are opt-in for merchants** — merchants already consuming `payment.captured` and `order.paid` keep working with no change; delegation-specific events are only needed by merchants who want to surface delegation state in their own UX.
- **New API namespace `/v1/delegations`.** 9 endpoints (see §2 matrix row) under a new namespace — routing, rate limits, auth middleware, versioning owned by the API gateway team.
- **Short-URL namespaces `rzp.io/r/{id}` and `rzp.io/q/{...}`.** Allocation, scale, redirect/404 handling, Open Graph metadata for link previews.

### QR Platform / Ezetap — BLOCKER (for Entry B only)

- **QR payload migration `upi://pay?...` → `rzp.io/q/{merchant_id}/{order_id}`.** Platform-side re-encoding of dynamic + static QRs; no terminal firmware changes in the proposed scope. Existing printed static QRs and backwards compatibility are a platform decision.
- **Landing page at `rzp.io/q/...`.** Routes a scan into either "Pay Now" (UPI Intent) or the delegation compose flow.

### Checkout SDK — BLOCKER (for Entry A)

- **"Ask Someone to Pay" button** in the Checkout SDK payment-method list, feature-flag-gated by merchant eligibility.
- **Compose modal hosting.** Proposal assumes a Razorpay-hosted compose page (`rzp.io/compose/{order_id}`) rather than SDK-embedded, for consistency across entry points; the Checkout SDK team would decide.

### Risk / Fraud — BLOCKER

- **Internal fraud/risk score access.** T4 low-trust warning is triggered by (a) Razorpay's internal risk signal being flagged-high, OR (b) merchant age < 30 days. The prototype does not build a custom score; it assumes an existing Razorpay signal and queries it. Field name, endpoint, and "flagged-high" definition are Risk-team decisions — placeholders used in code, see §2.
- **Merchant age field** (e.g. `merchant.created_at`) exposed to all three entry points for the <30-day ineligibility gate.

### Messaging / Comms — BLOCKER

- **WABA ownership decision.** Single platform-owned WABA vs. merchant-supplied vs. delegation-dedicated. Proposal assumes platform-owned.
- **WhatsApp template DLT approval.** Four templates (T1 enterprise / T2 standard / T3 small-merchant / T4 low-trust warning) would need legal review, WABA submission, and DLT approval before send.
- **SMS DLT template approval.** Same four tiers; carrier approval timelines owned by SMS Ops.
- **Sender ID.** Outgoing SMS sender identity is a Razorpay SMS Ops decision — see §2.
- **Delivery-status webhooks** (sent/delivered/read) for retry + fallback logic. HIGH, not BLOCKER, if the prototype-level "best-effort send" is acceptable for pilot.

### Legal / Compliance — BLOCKER (production launch gate, not engineering gate)

- **NPCI opinion** on whether merchant-anchored delegation is distinct from P2P collect under the Oct 1, 2025 directive. Engineering does not gate on this; production launch does.
- **Chargeback liability wording.** Merchant T&C addendum + approver-side disclosure. Approach in the prototype: approver liable for approver-initiated disputes; merchant liable for fraud/non-delegated. Legal owns the wording.
- **DPDP classification + DPO sign-off** for the delegation record and approver phone number.
- **Approval-page consumer disclosures** reviewed for plain-language compliance.
- **RBI 2FA alignment** (OTP as standalone 2FA, validity window, attempt limits) for the April 1, 2026 mandate.

### GTM — MEDIUM

- **Pilot tier selection.** Which merchant tier qualifies for an initial rollout and the merchant list itself would be a GTM decision. The proposal does not pick merchants.

### Ops / Support — MEDIUM

- **Support runbook** for delegation-specific tickets (OTP not delivered, approval page errors, post-approval payment failure) and a **chargeback disputes workflow** that accepts a delegation_id + OTP-validation proof as evidence.

### Scale-up (beyond any initial rollout) — informational

- Biometric step-up on the approval page, CAPTCHA on high-risk cohorts, and category-based merchant gating are all out of scope for the prototype and listed here only so they aren't mistaken for v1 requirements.

---

## 2. Named Assumptions: External Identifiers Used as Placeholders

The prototype wires every unknown external identifier to a named placeholder in `src/backend/config/assumedIntegrations.js`, so a Razorpay team can swap the real name in one file once it is confirmed. The table below is the full list.

**Note on webhook rows (3–5):** delegation lifecycle events are **opt-in** for merchants. Merchants already consuming `payment.captured` and `order.paid` continue to work unchanged; delegation-specific events only matter to merchants who want to expose delegation state in their own surfaces.

| # | Unknown External Identifier | Placeholder (in code) | Owner to Confirm | Severity |
|---|---|---|---|---|
| 1 | Razorpay internal fraud/risk score — field name | `razorpay_internal_fraud_score_flagged` (boolean) | Risk / Fraud | BLOCKER |
| 2 | Razorpay internal fraud/risk score — endpoint | `GET /v1/merchants/{merchant_id}/risk-profile` | Risk / Fraud | BLOCKER |
| 3 | Webhook event — delegation approved *(opt-in)* | `order.delegation_approved` | Webhooks / Platform | BLOCKER |
| 4 | Webhook event — delegation declined *(opt-in)* | `order.delegation_declined` | Webhooks / Platform | BLOCKER |
| 5 | Webhook event — delegation expired *(opt-in)* | `order.delegation_expired` | Webhooks / Platform | BLOCKER |
| 6 | WhatsApp template ID — T1 (rich e-commerce) | `aop_t1_enterprise_items` | Comms / Compliance | BLOCKER |
| 7 | WhatsApp template ID — T2 (standard merchant) | `aop_t2_standard_category` | Comms / Compliance | BLOCKER |
| 8 | WhatsApp template ID — T3 (small merchant) | `aop_t3_small_merchant` | Comms / Compliance | BLOCKER |
| 9 | WhatsApp template ID — T4 (low-trust warning) | `aop_t4_low_trust_warning` | Comms / Compliance | BLOCKER |
| 10 | DLT SMS template ID — T1 | `DLT_AOP_T1_ITEMS` | SMS Ops / Compliance | BLOCKER |
| 11 | DLT SMS template ID — T2 | `DLT_AOP_T2_CATEGORY` | SMS Ops / Compliance | BLOCKER |
| 12 | DLT SMS template ID — T3 | `DLT_AOP_T3_BASIC` | SMS Ops / Compliance | BLOCKER |
| 13 | DLT SMS template ID — T4 | `DLT_AOP_T4_WARNING` | SMS Ops / Compliance | BLOCKER |
| 14 | SMS sender ID / brand name | `RAZORP` (assumed placeholder — Razorpay SMS Ops to confirm actual sender ID) | SMS Ops | MEDIUM |
| 15 | Merchant tier field name (for pilot gating) | `merchant_tier` | Data / GTM | MEDIUM |
| 16 | MCC-to-label mapping source | `GET /v1/categories/{mcc_code}` (or static JSON) | Data / Platform | MEDIUM |
| 17 | WhatsApp reachability check endpoint | `POST /contacts/check` | Platform Messaging | HIGH |
| 18 | Ezetap QR payload pattern | `https://rzp.io/q/{merchant_id}/{order_id}` | Ezetap / Platform QR | BLOCKER |
| 19 | Merchant age field name for gating | `created_at` (timestamp) | Data / Platform | HIGH |
| 20 | Delegation API endpoints (9 total) | `POST /v1/delegations`, `GET /v1/delegations/:id`, `POST /v1/delegations/:id/share`, `POST /v1/delegations/:id/open`, `POST /v1/delegations/:id/pay`, `POST /v1/delegations/:id/capture`, `POST /v1/delegations/:id/fail`, `POST /v1/delegations/:id/decline`, `POST /v1/delegations/:id/redelegate` | API Gateway | BLOCKER |

The prototype references all of these through `src/backend/config/assumedIntegrations.js`; updating a placeholder there propagates to every service that uses it.

---

## 3. Open Empirical Questions

The proposal's value hinges on four numbers that nobody — inside or outside Razorpay — can know before a pilot:

- **Adoption.** What fraction of requestors, when shown the "Ask Someone to Pay" button, use it?
- **Approval rate.** Of delegations sent, what fraction are approved and paid?
- **Completion rate / time-to-resolution.** How long between share and capture, and what fraction expire or get declined?
- **Fraud / dispute rate relative to baseline.** Is chargeback-per-thousand materially different from ordinary merchant transactions, by entry point and tier?

A pilot would be the cheapest way to resolve all four. Thresholds for a graduation decision are not proposed here — a Razorpay pilot team would set them from baseline.

---

## 4. References

- [README.md](../README.md) — repository overview.
- [docs/EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) — the proposal in brief.
- [docs/PAYMENT_FLOW_MECHANICS.md](PAYMENT_FLOW_MECHANICS.md) — entry points, state machine, data tiers.
- [docs/MESSAGE_TEMPLATES.md](MESSAGE_TEMPLATES.md) — T1–T4 templates and DLT notes.
- [docs/ARCHITECTURE.md](ARCHITECTURE.md) — what is and isn't in this repository.
- `src/backend/config/assumedIntegrations.js` — the single file that holds every placeholder in §2.
- `src/backend/routes/delegation.js` — the 9 delegation endpoints listed in row 20.

Regulatory references a Razorpay team would want to keep in view: NPCI P2P Collect directive (Oct 1, 2025), RBI 2FA mandate (April 1, 2026), DPDP Act 2023.
