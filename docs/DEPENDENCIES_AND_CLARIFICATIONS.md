# Dependencies & Clarifications: Ask Others to Pay

**Last Updated:** April 15, 2026  
**Status:** Handoff tracker; v1 blocker list below.  
**Audience:** Implementation team, platform partners, legal/compliance stakeholders.

---

## Change Log (April 15, 2026)

**Decision 1**: Replaced custom merchant trust score with Razorpay internal fraud/risk score + merchant-age gate. Removed custom score data pipeline as v1 blocker; added "access to Razorpay internal fraud/risk score API" as BLOCKER.

**Decision 2**: All three entry points (A, B, C) remain in Phase 1. No scope cut; no "Entry A only" language.

**Decision 3**: Compliance requirements (NPCI, RBI 2FA, DPDP) are built into the code. NPCI opinion on whether merchant-anchored delegation is distinct from P2P collect is a dependency tracked in parallel — it does not gate engineering but must be resolved before production launch.

**Decision 4**: Metrics to track in pilot: approval rate, fraud rate, merchant adoption rate, approver complaint rate. Thresholds to be set by pilot team based on baseline measurement.

**Decision 5**: Fraud mitigations phased by rollout trust tier. Pilot rolls out to trusted merchants first (tier selection by Razorpay GTM). Biometric step-up and CAPTCHA are scale-up dependencies, not v1 requirements.

**Decision 6** (April 15, 2026): **Captured all unknown external identifiers as named assumptions** so the build is integration-ready. Code centralizes all assumed field names, endpoint patterns, template IDs, and webhook event names in `src/backend/config/assumedIntegrations.js`. When external teams confirm the real names, we swap-the-name-and-go in one file. See §8 below.

---

## 1. How to Use This Document

**For the handoff team:** Resolve **BLOCKER** items before Phase 1 ships (core APIs, ops setup, compliance baked into code); **HIGH** items before shipping Phase 1 (launch readiness); **MEDIUM** items can be deferred to Phase 2 but must be tracked; **LOW** items are informational and guide future phases. (Note: Regulatory approvals are sought in parallel; NPCI opinion must be resolved before production launch.)

This document **does not** re-explain product design. It consolidates every external dependency, stakeholder sign-off, and unverified assumption into one artifact so handoff is clean and blockers are visible upfront.

---

## 1.5. Named Assumptions for Unknown External Identifiers (§8)

**Goal:** The build is "integration-ready" — all external identifiers (field names, API endpoints, event names, template IDs) are explicitly assumed and documented. When an external team confirms the real name, we swap-the-name-and-go in one file: `src/backend/config/assumedIntegrations.js`.

**What changed:** Instead of flagging "exact field name TBD" and leaving a code gap, we now:
1. Pick a reasonable placeholder that reads like the real name.
2. Wire the code against the assumption.
3. Document the assumption in the matrix below (§8).
4. On handoff, the integration team updates `assumedIntegrations.js` when the external team confirms.

**Central config file:** `src/backend/config/assumedIntegrations.js`
- Contains all assumed field names, endpoint patterns, event names, template IDs.
- Imported by services that depend on external identifiers.
- One change here propagates everywhere.

**See full matrix in §8 below.** Each row lists:
- Unknown (what we're guessing about)
- Assumed name (what we're using in code)
- Owner (who to ask for confirmation)
- What swaps if wrong (impact of the assumption)
- Blocker status (does it gate Phase 1 launch?)

---

## 8. Named Assumptions for Unknown External Identifiers

**Reference file:** `src/backend/config/assumedIntegrations.js`

| # | Unknown External Identifier | Assumed Name (in code) | Config Field | Owner to Confirm | What Swaps if Wrong | Blocker? | Status |
|---|---------------------------|----------------------|--------------|------------------|---------------------|----------|--------|
| 1 | Razorpay internal fraud/risk score field name | `razorpay_internal_fraud_score_flagged` (boolean) | `razorpayInternalFraudScore.fieldNameFraudFlagHigh` | Razorpay Risk / Fraud team | Update `assumedIntegrations.js::razorpayInternalFraudScore.fieldNameFraudFlagHigh` + `merchantTrustService.js` query logic | BLOCKER (gates T4 warning overlay, gates Phase 1) | OPEN |
| 2 | Razorpay fraud/risk score API endpoint | `GET /v1/merchants/{merchant_id}/risk-profile` | `razorpayInternalFraudScore.endpointPattern` | Razorpay Risk / Fraud team | Update `assumedIntegrations.js::razorpayInternalFraudScore.endpointPattern` + http client in `merchantTrustService.js` | BLOCKER | OPEN |
| 3 | Webhook event name: delegation approved | `order.delegation_approved` | `razorpayWebhookEvents.delegationApproved` | Razorpay Webhooks / Platform team | Update `assumedIntegrations.js::razorpayWebhookEvents.delegationApproved` + webhook handler in `server.js` | BLOCKER (gates Phase 1 merchant integration) | OPEN |
| 4 | Webhook event name: delegation declined | `order.delegation_declined` | `razorpayWebhookEvents.delegationDeclined` | Razorpay Webhooks / Platform team | Update `assumedIntegrations.js::razorpayWebhookEvents.delegationDeclined` + webhook handler | BLOCKER | OPEN |
| 5 | Webhook event name: delegation expired | `order.delegation_expired` | `razorpayWebhookEvents.delegationExpired` | Razorpay Webhooks / Platform team | Update `assumedIntegrations.js::razorpayWebhookEvents.delegationExpired` + webhook handler | BLOCKER | OPEN |
| 6 | Webhook event name: delegation created | `order.delegation_created` | `razorpayWebhookEvents.delegationCreated` | Razorpay Webhooks / Platform team | Update `assumedIntegrations.js::razorpayWebhookEvents.delegationCreated` + webhook handler | BLOCKER | OPEN |
| 7 | WhatsApp template ID: T1 (rich e-commerce) | `aop_t1_enterprise_items` | `whatsappTemplateNames.t1_enterpriseItems` | Razorpay Comms / Compliance | Update `assumedIntegrations.js::whatsappTemplateNames.t1_enterpriseItems` + `delegationMessageService.js` template selection | BLOCKER (DLT approval gates send) | OPEN |
| 8 | WhatsApp template ID: T2 (standard merchant) | `aop_t2_standard_category` | `whatsappTemplateNames.t2_standardCategory` | Razorpay Comms / Compliance | Update `assumedIntegrations.js::whatsappTemplateNames.t2_standardCategory` + message service | BLOCKER | OPEN |
| 9 | WhatsApp template ID: T3 (small merchant) | `aop_t3_small_merchant` | `whatsappTemplateNames.t3_smallMerchant` | Razorpay Comms / Compliance | Update `assumedIntegrations.js::whatsappTemplateNames.t3_smallMerchant` + message service | BLOCKER | OPEN |
| 10 | WhatsApp template ID: T4 (low-trust warning) | `aop_t4_low_trust_warning` | `whatsappTemplateNames.t4_lowTrustWarning` | Razorpay Comms / Compliance | Update `assumedIntegrations.js::whatsappTemplateNames.t4_lowTrustWarning` + message service | BLOCKER | OPEN |
| 11 | DLT SMS template ID: T1 | `DLT_AOP_T1_ITEMS` | `dltSmsTemplateIds.t1_template_id` | Razorpay SMS Ops / Compliance | Update `assumedIntegrations.js::dltSmsTemplateIds.t1_template_id` + config/delegation.js + delegationMessageService.js | BLOCKER (DLT approval gates SMS send) | OPEN |
| 12 | DLT SMS template ID: T2 | `DLT_AOP_T2_CATEGORY` | `dltSmsTemplateIds.t2_template_id` | Razorpay SMS Ops / Compliance | Update `assumedIntegrations.js` + configs | BLOCKER | OPEN |
| 13 | DLT SMS template ID: T3 | `DLT_AOP_T3_BASIC` | `dltSmsTemplateIds.t3_template_id` | Razorpay SMS Ops / Compliance | Update `assumedIntegrations.js` + configs | BLOCKER | OPEN |
| 14 | DLT SMS template ID: T4 | `DLT_AOP_T4_WARNING` | `dltSmsTemplateIds.t4_template_id` | Razorpay SMS Ops / Compliance | Update `assumedIntegrations.js` + configs | BLOCKER | OPEN |
| 15 | SMS sender ID / brand name | `RAZORP` (Razorpay's existing sender) | `smsSenderId` | Razorpay SMS Ops | Update `assumedIntegrations.js::smsSenderId` + SMS service config | MEDIUM (not core logic; DLT may require specific sender) | OPEN |
| 16 | Merchant tier field name (for pilot gating) | `merchant_tier` | `merchantTierEnum.fieldName` | Razorpay Data / GTM | Update `assumedIntegrations.js::merchantTierEnum.fieldName` + feature flag logic | MEDIUM (tier gating deferred to Phase 2) | OPEN |
| 17 | MCC-to-label mapping source | `GET /v1/categories/{mcc_code}` (or static JSON) | `mccLabelMapping.source` | Razorpay Data / Platform | Update `assumedIntegrations.js::mccLabelMapping.source` + service layer | MEDIUM (graceful fallback: omit line if unavailable) | OPEN |
| 18 | WhatsApp reachability check endpoint | `POST /contacts/check` | `wabaReachabilityCheck.endpointPattern` | Platform Messaging / Integration team | Update `assumedIntegrations.js::wabaReachabilityCheck.endpointPattern` + WABA client | HIGH (fallback to SMS if unreachable) | OPEN |
| 19 | Ezetap QR payload pattern | `https://rzp.io/q/{merchant_id}/{order_id}` | `ezetapQrEncoding.newPayloadPattern` | Ezetap product / Platform QR | Update `assumedIntegrations.js::ezetapQrEncoding.newPayloadPattern` + QR generation service | BLOCKER (Entry B entirely depends on this) | OPEN |
| 20 | Merchant age field name for gating | `created_at` (timestamp) | `merchantAgeDataSource.fieldName` | Razorpay Data / Platform | Update `assumedIntegrations.js::merchantAgeDataSource.fieldName` + delegation.js creation gate | HIGH (merchant <30 days ineligibility is core v1) | OPEN |

**Integration Workflow:**
1. External team confirms real identifier (e.g., "The fraud score field is actually `merchant_risk_signal`, not `razorpay_internal_fraud_score_flagged`").
2. Integration engineer updates `src/backend/config/assumedIntegrations.js` with the real name.
3. All services referencing that field pick up the change automatically.
4. Update DEPENDENCIES_AND_CLARIFICATIONS.md row to mark as CONFIRMED + date.
5. No code rewrites; no service-level changes needed.

---

## 2. Razorpay Platform Dependencies

| Item | Assumption | Requirement | Owner Role | Severity | Status | Date Confirmed |
|------|-----------|-------------|-----------|----------|--------|---|
| **Orders API: `line_items` readability** | Existing Orders API already passes `line_items` in `GET /v1/orders/{id}` response; builder can read and render in T1 template without new API feature. | Confirm that `line_items` (if present in order creation) is returned in full (`name`, `description`, `quantity`, `amount`) at payment/delegation time; no truncation or filtering. | Platform API owner (Razorpay Core) | BLOCKER | OPEN | — |
| **New webhook events: 5 delegation lifecycle events** | Four new events required: `order.delegation_requested`, `.delegation_approved`, `.delegation_declined`, `.delegation_expired`. Not currently part of standard webhook payload. | Platform must commit to (a) event schema design (payload structure, included fields), (b) release timeline (target Phase 1 launch), (c) webhook versioning strategy (v1, v2 backwards compat). See §18.9 acceptance criteria. | Platform Webhooks owner (Razorpay) | BLOCKER | OPEN | — |
| **New API namespace: `/v1/delegations`** | Feature requires 7 new endpoints (create, get, approve, decline, resend, redelegate, request_otp) under a new namespace. Platform API gateway must route and rate-limit this namespace. | API versioning/gateway team confirms: (a) namespace routing rule, (b) rate-limit bucket (separate from orders/payments or shared?), (c) authentication/authorization middleware compatible with existing Razorpay API key + webhook signature, (d) no breaking changes to existing `/v1/*` namespaces. | Platform API gateway owner | BLOCKER | OPEN | — |
| **Short URL namespace: `rzp.io/r/{id}` for approvals** | Feature uses `rzp.io/r/{delegation_id}` as canonical approval page URL. Requires DNS + short-URL generation service. | Platform confirms: (a) `rzp.io/r/*` namespace allocated for this feature (no collision with existing shortlinks), (b) URL shortening service can generate >1M unique IDs/month at launch (scalability), (c) redirect logic + 404 handling for expired delegations. | Platform DNS/short-URL service owner | BLOCKER | OPEN | — |
| **Short URL namespace: `rzp.io/q/{...}` for Entry B QR landing pages** | Entry B (Ezetap POS) dynamic QR encodes `rzp.io/q/{merchant_id}/{order_id}` URLs instead of legacy `upi://pay?...` payloads. Requires new URL namespace + routing. | Platform confirms: (a) `rzp.io/q/*` namespace allocated, (b) landing page routing (POST, GET, OPTIONS), (c) Open Graph metadata serving (for WhatsApp preview), (d) scoped to this feature, no cross-contamination with other POS flows. | Platform DNS/short-URL service owner | BLOCKER | OPEN | — |
| **Razorpay Dynamic QR & Static QR re-provisioning** | Current Razorpay DQR/static QR generation pipeline encodes `upi://pay?{params}` UPI Intent strings. Must migrate to encode `rzp.io/q/...` URLs instead. Not a firmware change; platform-side QR payload change. | Platform Data/QR team confirms: (a) migration timeline (Phase 0 or Phase 1?), (b) rollout strategy (immediate or gradual merchant cohort?), (c) backwards compatibility (can old printed QRs still work, or do they break?), (d) existing merchant static QRs — do they auto-regenerate or require manual re-provisioning? (a) internal QR generation library updated, (b) Ezetap terminal firmware can call new endpoint, (c) one-time re-provisioning batch for existing merchants. | Platform QR generation owner / Ezetap product owner | BLOCKER | OPEN | — |
| **Razorpay internal fraud/risk score API** | v1 does NOT compute custom merchant trust scores. Instead, T4 warning overlay is triggered by: (a) Razorpay's internal fraud/risk score flagged-high, OR (b) merchant age < 30 days. Requires access to Razorpay's internal risk signal. | Razorpay risk team confirms: (a) exact field name for fraud/risk flag in merchant data API (e.g., `razorpay_internal_fraud_score_flagged`), (b) integration endpoint + SLA for query, (c) definition of "flagged-high" state, (d) update frequency. Engineering adds stub in `src/backend/services/merchantTrustService.js` to query this score. | Platform Risk / Fraud team | BLOCKER | OPEN | — |
| **Merchant age (tenure) data exposure** | Feature gates delegations by merchant age: < 30 days ineligible to initiate. Age data must be accessible to all entry points (A, B, C) at request time. | Platform confirms: (a) merchant age data readily available (existing field `created_at` on merchant record?), (b) propagated to Entry A (Checkout SDK check), Entry B (landing page check), Entry C (Payment Link check), (c) gating logic: if `now() - merchant.created_at < 30 days`, hide "Ask Someone" button or return 403. Testable at launch. | Platform Data / Entry point teams | BLOCKER | OPEN | — |
| **Checkout SDK extensibility: "Ask Someone to Pay" button** | Entry A (web/app checkout) requires "Ask Someone to Pay" button in Checkout SDK's payment method list. Does NOT require new SDK release if extensible; can be feature-flagged button in existing SDK. | Checkout SDK team confirms: (a) SDK supports feature-flag-gated UI elements, (b) can inject "Ask Someone" button into method list without breaking existing merchants, (c) button click triggers delegations API (not SDk-side; flow is SDK → modal → delegations endpoint), (d) button hidden if merchant not eligible (age >30 days). Minimal scope: one button + modal compose view. | Platform Checkout SDK owner | BLOCKER | OPEN | — |
| **Checkout SDK extensibility: Compose modal (requestor UI)** | Entry A compose flow (approver phone entry, preamble, channel toggles, preview) is a full-screen modal triggered by the "Ask Someone" button. Hosted by Razorpay or merchant site? Scoping question. | Clarify: (a) modal hosted on Razorpay side (`rzp.io/compose/{order_id}`) OR embedded in Checkout SDK? (b) If Razorpay-hosted, does browser nav to Razorpay, then back to merchant on cancel/submit? (c) If SDK-embedded, full modal code in SDK. **Proposal:** Razorpay-hosted (cleaner scope, consistent UX across entries). Decision pending product + Checkout team. | Platform Checkout SDK owner / Product | BLOCKER | OPEN | — |

---

## 3. Ezetap / POS Dependencies

| Item | Assumption | Requirement | Owner Role | Severity | Status | Date Confirmed |
|------|-----------|-------------|-----------|----------|--------|---|
| **Entry B scope: No terminal firmware update** | Spec explicitly removes firmware changes from Entry B scope. Terminal firmware stays as-is; only change is backend API routing + landing page (`rzp.io/q/{order_id}`) adds "Ask Someone to Pay" button. | Ezetap product confirms: (a) terminal firmware is NOT modified (v1 scope), (b) terminal continues to show "Awaiting Payment" with countdown, (c) all delegation entry is via landing page post-QR-scan, not terminal UI button, (d) terminal sends `order_id` to backend; backend generates URL; backend serves landing page. | Ezetap product owner | BLOCKER | OPEN | — |
| **Entry B QR payload migration: `upi://` → `rzp.io/q/...`** | Existing Razorpay terminals encode `upi://pay?{params}` in static/dynamic QRs. Must shift to encoding `rzp.io/q/{merchant_id}/{order_id}` URLs. Platform-side change; no terminal firmware involved. | Ezetap + Platform QR team confirm: (a) QR generation service (backend) updated to emit `rzp.io/q/...` URLs, (b) timeline: Phase 0 or concurrent with Phase 1 launch?, (c) rollout strategy (all terminals immediately? or phased by merchant cohort in Phase 2?), (d) printed static QRs (existing merchant assets) — do they break if old or auto-refresh? See also Razorpay DQR dep. above. | Ezetap product owner / Platform QR owner | BLOCKER | OPEN | — |
| **Entry B landing page (`rzp.io/q/{order_id}`)** | Approver scans QR → phone opens landing page. Page must show (a) "Pay Now" button (UPI Intent), (b) "Ask Someone to Pay" button (delegation), (c) merchant branding, (d) amount (if not in QR). | Platform confirms: (a) landing page routes `GET /q/{order_id}` and `GET /q/{merchant_id}` (both dynamic and static), (b) page responds with Open Graph metadata (for WhatsApp preview if link shared), (c) "Ask Someone" button routes to compose modal (or inline compose on landing page?), (d) mobile-responsive (<600px stacking). | Platform Web team / Razorpay | BLOCKER | OPEN | — |
| **Merchant communication for QR migration** | Existing Razorpay merchants with printed/provisioned static QRs must be informed that new-flow delegations require landing-page interaction. If old QR continues to encode `upi://`, approver won't see "Ask Someone" option. | Marketing/Comms team plans: (a) merchant education (email, in-dashboard notification), (b) timeline for QR re-provisioning, (c) FAQ for merchant support (old QRs still work? will they break?), (d) success metrics (% of merchants re-provisioned by target date). | Ezetap/Razorpay Comms team | MEDIUM | OPEN | — |
| **Entry B rollout phasing (Phase 2)** | Feature can be rolled out to Ezetap merchants gradually (cohort 1: Razorpay employees, cohort 2: 100 select merchants, cohort 3: all). Depends on feature-flag support in terminal routing. | Backend + Ezetap confirm: (a) feature flag gates Entry B (can disable without firmware rollback), (b) merchant cohort gating logic (by `merchant_id` or region?), (c) monitoring (Entry B request volume, errors, delegation success rate). | Ezetap product owner | MEDIUM | OPEN | — |
| **Entry B POS compatibility: VPN/low-end devices** | Approver scans QR on low-end Android device with VPN running. UPI Intent must still work. Landing page must load on 2G/3G. | Platform confirms: (a) landing page optimized for low bandwidth (<500KB assets), (b) UPI Intent fallback (if Intent fails, fallback to web payment?), (c) tested on devices: Samsung J2, Redmi 5A, or equivalent low-end stock. | Ezetap + Platform QA/UX team | MEDIUM | OPEN | — |

---

## 4. WhatsApp / SMS Messaging Dependencies

| Item | Assumption | Requirement | Owner Role | Severity | Status | Date Confirmed |
|------|-----------|-------------|-----------|----------|--------|---|
| **WABA ownership: Who sends delegation messages?** | Delegation messages (SMS, WhatsApp) sent to approver. WABA/SMS sender identity unclear. Is it Razorpay-platform WABA? Merchant's WABA? New delegation-specific WABA? | Product + Comms decide: (a) single platform-owned WABA for all delegations (simplest, no merchant coordination), OR (b) merchant-supplied WABA (requires merchant setup, more complex), (c) dedicate WABA for delegations only (reputational isolation from other Razorpay messages). **Proposal:** Single platform WABA (simplest, launched in Phase 1). | Razorpay Comms/Product | BLOCKER | OPEN | — |
| **WhatsApp Business API templates: DLT registration** | Four message templates (T1 enterprise, T2 standard, T3 small, T4 low-trust warning) must be registered with WhatsApp Business API + DLT. DLT approval required before send. | Comms team confirms: (a) all 4 templates drafted and reviewed by Legal, (b) submitted to WABA + DLT for approval (typical: 1–3 business days per template), (c) template IDs stored in config (§18.10 Appendix C), (d) approval gating Phase 1 launch (cannot ship without DLT approval). | Razorpay Comms/Compliance | BLOCKER | OPEN | — |
| **WhatsApp message delivery receipts** | Feature requires tracking delivery status: sent → delivered → read. Used for analytics + retry logic (if not delivered in 5 min, retry or fallback to SMS). | WABA integration confirms: (a) webhook for delivery status (`status: delivered`, `read`), (b) latency for delivery notification (<1 min typical), (c) no charge for failed sends (platform absorbs cost). | Platform Messaging/Integration team | HIGH | OPEN | — |
| **SMS DLT template registration: 4 templates, 7–14 day approval timeline** | All SMS messages sent via DLT-registered template IDs. Four templates (T1–T4) must be pre-registered with Indian telecom DLT (Airtel, Vodafone, Jio, BSNL). | Comms/SMS Ops confirm: (a) templates drafted, reviewed, submitted (Phase 0), (b) approval dates tracked for each carrier (can take 7–14 days), (c) template IDs live in config before launch, (d) cannot ship SMS until all approvals received. | SMS Ops / Compliance | BLOCKER | OPEN | — |
| **SMS sender phone number & brand name** | Outgoing SMS must show "from" number (sender) and brand name for trust. What's the sender ID for delegations? Razorpay's main SMS sender or dedicated? | SMS Ops/Comms confirm: (a) sender ID (e.g., "RAZORP" or "AOTPAY"?), (b) branded number (if available in India), (c) approved by DLT (DLT may restrict sender ID choice), (d) consistent across all carriers. | SMS Ops | HIGH | OPEN | — |
| **WhatsApp fallback if approver unreachable** | Spec: "If approver's number not WhatsApp-reachable (checked at send time), fall back to SMS only." No hybrid fallback; binary: WhatsApp+SMS or SMS-only. | Platform Messaging team confirms: (a) WhatsApp reachability check API call (WABA has `/check-contact-number` or similar), (b) fallback logic (if not reachable, send SMS only; UI shows "SMS sent instead"), (c) does NOT comply with approver's "both" preference if WhatsApp unavailable — constraint of platform, not product choice. Documented in approver notification. | Platform Messaging team | HIGH | OPEN | — |
| **SMS delivery SLA & retry logic** | Spec does not define SMS delivery SLA (e.g., "99.5% within 5 min") or retry strategy. Default assumption: one send per channel, no retry. | Clarify: (a) SMS delivery SLA (target: 95%+ within 5 min), (b) retry strategy if failed (retry once after 60s? or give up?), (c) how long to wait for delivery confirmation before timeout (5 min?), (d) what UX does requestor see ("SMS sent" or "SMS delivery pending"?). | Platform Messaging team / Product | MEDIUM | OPEN | — |

---

## 5. NPCI / UPI Ecosystem Dependencies

| Item | Assumption | Requirement | Owner Role | Severity | Status | Date Confirmed |
|------|-----------|-------------|-----------|----------|--------|---|
| **NPCI P2P Collect Ban (Oct 1, 2025) exemption** | Spec frames feature as "merchant-facilitated delegation," NOT peer-to-peer collect. Legal review concluded it is compliant with Oct 1, 2025 ban. However, no formal NPCI letter obtained yet. | Legal team obtains: (a) formal NPCI opinion letter confirming feature is NOT a P2P collect request per Oct 2025 directive, (b) exemption cited in all regulatory submissions, (c) contingency plan if NPCI disagrees (unlikely but catastrophic if feature rolled back post-launch). **Blocking Phase 1 launch.** | Razorpay Legal / Compliance | BLOCKER | OPEN | — |
| **UPI Intent invocation: Android app chooser UX** | Approval page (desktop/mobile) has "Approve & Pay" button that triggers UPI Intent. On Android, Intent launches app chooser (PhonePe, Google Pay, etc.). UX must be frictionless on low-end devices. | Platform QA confirms: (a) UPI Intent formatted per UPI spec (upi://{params}), (b) tested on stock Android 8+ devices (Samsung J2, Redmi 5A), (c) app chooser shows <1s, not hung/frozen, (d) Intent fallback if no UPI app installed (user shown error, guided to install). | Platform Web/Mobile team | MEDIUM | OPEN | — |
| **UPI Intent invocation: iOS Safari app-linking** | iOS browsers cannot invoke UPI Intent directly; instead use app-linking (deep link to UPI app or safari fallback). Must work on low-end iPhones. | Platform QA confirms: (a) Universal Links / app-linking configured for PhonePe, GPay, etc., (b) tested on iOS 13+ (iPhone 6S minimum), (c) fallback if no UPI app (show error, app store links), (d) no jailbreak or side-load required. | Platform Web/Mobile team | MEDIUM | OPEN | — |
| **2FA mandate (April 1, 2026): OTP + bank auth separation** | RBI mandate effective April 1, 2026: all payment approvals must have 2FA (OTP or biometric separate from payment initiation). Feature uses 6-digit OTP on approval page; UPI payment may require second auth at bank level. | Compliance confirms: (a) OTP is standalone 2FA (separate from bank's UPI 2FA if any), (b) OTP valid for 10 min (RBI guideline: 5–15 min), (c) max 5 OTP attempts before lockout (RBI guidance: 3–5), (d) approved by Legal. | Razorpay Legal / Compliance | BLOCKER | OPEN | — |
| **UPI AutoPay Integration (Phase 2+)** | Spec mentions "UPI AutoPay mandate linking" for recurring delegations (Phase 2, not v1 blocker). Requires NPCI UPI AutoPay spec compliance. | Compliance clarifies (Phase 2 planning): (a) which NPCI/UPI AutoPay spec version (currently v2.0?), (b) mandate creation flow (one-time vs. standing), (c) cancellation rights (approver can cancel anytime?), (d) merchant responsibilities (must not over-charge, etc.), (e) Razorpay certification as "service provider" (may need re-cert post-launch). | Razorpay Legal / Platform | LOW | OPEN | — |

---

## 6. Legal / Regulatory Dependencies

| Item | Assumption | Requirement | Owner Role | Severity | Status | Date Confirmed |
|------|-----------|-------------|-----------|----------|--------|---|
| **Chargeback liability allocation (approver vs. merchant)** | Spec: "Approver liable for approver-initiated chargeback; merchant liable for fraud/non-delegated chargeback." T&C wording required. Approach locked; legal wording pending. | Legal drafts & signs off: (a) merchant T&C amendment (addendum for delegation terms), (b) approver disclosure (shown at approval time or in FAQ?), (c) disputes workflow documented (proof of delegation approval, OTP validation attached to dispute), (d) circular filed with RBI if required. **Gating Phase 1 launch.** | Razorpay Legal | BLOCKER | OPEN | — |
| **DPDP Act 2023: Delegation record classification** | Spec defers to "extant Razorpay policy." Clarification: Is a delegation record "personal data"? Is merchant trust score "sensitive"? | Legal/DPO clarifies: (a) delegation record (order_id, phone, amount, timestamp) classified as personal data (yes, contains phone), (b) merchant trust score NOT personal data (aggregate, business-relevant), (c) approver contact classified as "functional necessity" for payment processing (legal justification in privacy policy), (d) no explicit approver consent required beyond TOS acceptance (reuse existing), (e) DPO sign-off. | Razorpay Legal / DPO | BLOCKER | OPEN | — |
| **Data retention: Delegation records, RBI + DPDP alignment** | Spec says "follow extant Razorpay policy." Config default: 2 years (730 days, per RBI guideline for transaction records). No custom language; delegate to platform policy. | Legal/Compliance confirm: (a) transaction record retention (RBI: min 2 years after close), (b) KYC retention (RBI: 7 years post-account close), (c) OTP/auth logs retention (30 days standard; DPDP: shorter if not needed), (d) deletion/anonymization process documented (scheduled job). Config value in Appendix C. | Razorpay Legal / Compliance | MEDIUM | OPEN | — |
| **Consumer protection disclosures: Approval page wording** | Approval page must disclose (per RBI/consumer guidelines): amount, merchant verification, expiry, what happens on approve. Exact wording requires legal review. | Legal reviews + approves: (a) all text on approval page (system block, trust panel, buttons, warnings), (b) no misleading language (e.g., "auto-approved" if not), (c) disclosure of chargeback policy (link to FAQ or inline), (d) approver can cancel anytime (if true; if not, must state), (e) tested for plain-language clarity (8th-grade reading level target per RBI). | Razorpay Legal | BLOCKER | OPEN | — |
| **PII in webhooks: Approver identity NOT sent to merchant** | Spec: "Merchant does NOT receive approver identity. They track **buyer** (requestor) instead." Decision locked; confirms platform default (privacy-preserving). Confirms no approver consent required for webhook disclosure. | Legal confirms: (a) approver phone/name NOT in webhook payload (no PII leakage to merchant), (b) merchant payload includes `buyer_id` (requestor) only, (c) approver privacy not violated (no T&C amendment required), (d) if future phase requires payer tracking, requires explicit approver consent (gated feature). | Razorpay Legal | MEDIUM | OPEN | — |
| **GST implications: Delegation feature** | Spec defers to "no new GST implications" assumption. Clarification needed: Is delegation a "service"? Does Razorpay owe GST on approvals? | Tax team confirms: (a) delegation feature does NOT create new "supply" event (payment processing already subject to GST; delegation routing is not incremental service), (b) no new GST rate/classification, (c) existing Razorpay fee structure unchanged (no separate delegation fee in v1), (d) tax clearance letter issued. | Razorpay Finance / Tax | MEDIUM | OPEN | — |

---

## 7. Trust & Safety / Operational Dependencies

| Item | Assumption | Requirement | Owner Role | Severity | Status | Date Confirmed |
|------|-----------|-------------|-----------|----------|--------|---|
| **Pilot-to-scale monitoring criteria** | v1 does not define hard kill thresholds. Instead, pilot team measures baseline metrics in weeks 1–2, sets thresholds, then gates graduation to GA on sustained performance. Metrics: approval rate, fraud rate, merchant adoption rate, approver complaint rate. | Pilot team owns: (a) baseline measurement in weeks 1–2 (week 1 launch, week 2 full measurement), (b) threshold setting per metric (based on baseline + business judgment), (c) monitoring dashboard (daily snapshots, alerts if threshold breached), (d) graduation decision (2 consecutive weeks of all 4 metrics meeting threshold = GA; else stay in pilot, iterate). | Product/Pilot team | MEDIUM | OPEN | — |
| **Rollout to trusted merchants first** | Pilot phase rolls out only to Razorpay's top-tier/enterprise/established merchants (existing tier already defined). Specific tier selection and merchant list owned by Razorpay GTM. | GTM confirms: (a) which merchant tier qualifies for pilot (e.g., Razorpay-level "enterprise" tier?), (b) merchant list (50–100 merchants target), (c) rollout comms to selected merchants, (d) feedback collection mechanism (survey, support tickets, etc.). | Razorpay GTM | MEDIUM | OPEN | — |
| **High-risk merchant category gating (rollout-based)** | Spec: "Do NOT hard-block delegations by merchant category in v1. Instead gate by merchant age (<30 days ineligible)." High-risk categories (e.g., gaming, crypto) deferred to Phase 2 category-based blocking. | T&S ops clarifies: (a) v1 gating: merchant age >30 days on Razorpay (simple, config-driven), (b) Phase 2 roadmap: category-based gating (if age-based insufficient), (c) which categories in scope for Phase 2 (crypto, gambling, high-chargeback industries?), (d) category list maintained by T&S. | Trust & Safety run-ops | MEDIUM | OPEN | — |
| **Merchant age data source & propagation** | Decision locked: merchants <30 days on Razorpay platform ineligible to receive delegations (requestor cannot initiate). Data: `merchant.created_at` timestamp. Must be accessible to all entry points (A, B, C). | Platform confirms: (a) merchant age data readily available (existing field?), (b) propagated to Entry A (Checkout SDK check), Entry B (Ezetap landing page check), Entry C (Payment Link check), (c) gating logic: if `now() - created_at < 30 days`, hide "Ask Someone" button (or block API call). Testable at launch. | Platform Data / Entry point teams | HIGH | OPEN | — |
| **Fraud rules for approver behavior (VPN/proxy/velocity)** | Feature reuses existing Razorpay fraud stack (VPN/proxy detection, velocity rules). No new fraud signals built in v1; leverage existing. | Fraud team confirms: (a) existing Razorpay fraud stack can be queried during approval (risk score), (b) high-risk approver behavior (VPN, multiple failed OTP, high velocity) may trigger challenge (additional verification) or block, (c) no special delegation-specific fraud rules in v1 (can add in Phase 2), (d) integration point: call fraud API during approval validation. | Razorpay Fraud team | MEDIUM | OPEN | — |
| **T&S manual review cadence for edge cases** | Spec mentions "daily batch job (trust score update) scheduled 2am IST" and "manual review SLA TBD by ops." No defined cadence for escalations (e.g., merchant disputes score, or unusual patterns). | T&S ops defines: (a) manual review SLA for score disputes (e.g., merchant appeals elevated score; SLA: 48h response), (b) daily monitoring dashboard (high chargebacks, unusual velocity), (c) escalation process if fraud pattern detected post-launch (batch job fails? manual review triggers?), (d) documented in runbook. | Trust & Safety run-ops | MEDIUM | OPEN | — |

---

## 8. Ops & Support Dependencies

| Item | Assumption | Requirement | Owner Role | Severity | Status | Date Confirmed |
|------|-----------|-------------|-----------|----------|--------|---|
| **Approver-side support SLA & triage** | Approvers may face issues: OTP not delivered, approval page broken, payment failed after approval. Support must handle delegation-specific tickets. No SLA defined yet. | Support lead defines: (a) tier-1 SLA (e.g., <4 hours first response for payment-affecting issues), (b) triage logic (OTP issue → SMS team, payment issue → payments team, page issue → platform team), (c) FAQ + runbook created (common issues + fixes), (d) escalation path (to platform on-call). Runbook required Phase 1 launch. | Razorpay Support | MEDIUM | OPEN | — |
| **Merchant chargeback dispute flow: Delegation-specific handling** | Approver initiates chargeback after approval. Merchant disputes it. Current dispute flow likely NOT delegation-aware; needs tweak. | Disputes team documents: (a) delegation-specific dispute workflow (proof of delegation approval + OTP validation attached to dispute ticket), (b) evidence collection (approver consent to dispute, delegation record access), (c) SLA for merchant response (same as standard chargebacks? or custom?), (d) when delegation initiates chargeback, merchant can reference delegation_id + OTP proof. | Disputes operations | MEDIUM | OPEN | — |
| **Fraud review cadence: Delegation-specific chargebacks** | If chargeback rate spikes post-launch (e.g., intentional fraud by approver cohort), T&S must spot it quickly. Daily monitoring + manual review process needed. | T&S ops schedules: (a) daily monitoring report (chargebacks by merchant, approver, time-of-day), (b) alert threshold (e.g., "if chargeback rate >1 per 1000 approvals, escalate"), (c) weekly review meeting (T&S, fraud, disputes teams), (d) rollback protocol if fraud spike detected. | Trust & Safety run-ops | MEDIUM | OPEN | — |

---

## 9. Scale-Up Dependencies (Beyond Pilot, Gated for Rollout)

These are NOT v1 requirements; they gate rollout beyond trusted merchants to broader audience.

| Item | Purpose | Owner | Severity | Status |
|------|---------|-------|----------|--------|
| **Biometric step-up on approval page** | v1 uses OTP only for 2FA. Biometric (fingerprint, face) as alternative/fallback deferred. Requires mobile SDK integration + testing across device types. | Mobile team | MEDIUM | DEFERRED to Phase 2+ |
| **CAPTCHA provider integration** | v1 does not include CAPTCHA for approver. Phishing risk mitigated by OTP validation only. If fraud spike post-pilot, CAPTCHA can be added as friction. Requires integration with CAPTCHA provider (Google reCAPTCHA, hCaptcha, etc.). | Platform / Fraud team | MEDIUM | DEFERRED to Phase 2+ |
| **Trusted-merchant tier list from GTM** | Pilot phase gates rollout to specific merchant tier (e.g., Razorpay enterprise). Broader rollout requires GTM to define next-tier cohort (e.g., "established" merchants with 90+ days tenure) and merchant list. | Razorpay GTM | MEDIUM | OPEN (pilot decision needed) |

---

## 9. Acceptance Gates by Phase

| Phase | Major Dependencies | BLOCKER Items Needing Approval | Target Date (Proposal) |
|-------|-------------------|------------------------------|--------|
| **Phase 1: MVP Launch (All Entry Points A, B, C)** | <ul><li>Legal (parallel track): NPCI exemption letter, Chargeback T&C, DPDP DPO sign-off, Approval page wording</li><li>Compliance (parallel track): DLT template approvals (SMS + WhatsApp)</li><li>API team: `/v1/delegations` namespace live</li><li>Webhooks team: 4 new events live</li><li>Checkout SDK: "Ask Someone" button live (Entry A)</li><li>Ezetap: Entry B landing page live (`rzp.io/q/...`)</li><li>Payment Link: Entry C integration live</li><li>Messaging: WhatsApp+SMS templates approved (DLT)</li><li>QA: Integration test passing (create → send → approve → pay)</li><li>Support: Runbook + FAQ ready</li><li>Razorpay Risk team: Internal fraud/risk score API confirmed</li></ul> | <ul><li>DLT approvals complete (SMS + WhatsApp)</li><li>API endpoints live & tested (all 7 endpoints)</li><li>Webhooks delivering</li><li>All 3 entry points working (A + B + D)</li><li>Legal sign-off: approval page, merchant T&C, DPDP (in parallel, does not gate engineering)</li><li>Razorpay risk team provides fraud/risk score integration details</li></ul> | **May 2026 (target)** |
| **Phase 2: Trust Engine & Broader Rollout** | <ul><li>Pilot success metrics met (approval rate, fraud rate, adoption, complaints)</li><li>GTM: Next merchant tier cohort identified (graduated from pilot tier)</li><li>Data Eng: Real fraud/risk score integration (currently mock or via Razorpay internal API)</li><li>Scale-up dependencies ready (biometric, CAPTCHA)</li></ul> | <ul><li>Pilot graduation criteria met</li><li>Merchant tier expansion plan confirmed by GTM</li></ul> | **June 2026 (proposal)** |

---

## 10. Change Log

| Date | Item | Decision / Resolution | Owner | Status |
|------|------|---------------------|-------|--------|
| April 15, 2026 | Initialized Dependencies doc | Consolidated BLOCKER, HIGH, MEDIUM, LOW items from all source docs | Product/Handoff team | OPEN |
| — | NPCI exemption letter | OPEN — legal to obtain formal opinion | Legal | PENDING |
| — | DLT template approvals (SMS) | OPEN — submitted to carriers; awaiting approval (7–14 days typical) | Comms | PENDING |
| — | WhatsApp WABA template approvals | OPEN — submitted to DLT; awaiting approval (1–3 days typical) | Comms | PENDING |
| — | Chargeback policy wording | OPEN — legal drafting | Legal | PENDING |
| — | Trust score algorithm | OPEN — T&S to finalize weights | T&S | PENDING |
| — | Merchant data pipeline audit | OPEN — Data Eng to confirm availability | Data Eng | PENDING |
| — | API namespace routing | OPEN — Platform API gateway to confirm design | Platform API | PENDING |

---

## 11. References & Links

**Canonical Spec Docs:**
- [docs/PAYMENT_FLOW_MECHANICS.md](PAYMENT_FLOW_MECHANICS.md) — Technical mechanics of the delegation flow, entry points, data tiers, state machine
- [docs/MESSAGE_TEMPLATES.md](MESSAGE_TEMPLATES.md) — T1–T4 templates, anti-spoofing, DLT
- [docs/ARCHITECTURE.md](ARCHITECTURE.md) — L0 architecture and what's in this repository

**Regulatory:**
- NPCI P2P Collect Ban: Oct 1, 2025 directive
- RBI 2FA Mandate: Effective April 1, 2026
- DPDP Act 2023: Data retention, consent, DPO sign-off
- GST: Razorpay fee structure (no change)

---

## 12. Handoff Checklist

Before handing code to Phase 1 builder:

- [ ] **All BLOCKER items above have an owner assigned** (name + email)
- [ ] **Legal has committed timeline for NPCI exemption & chargeback wording** (target: Phase 0 week 4)
- [ ] **DLT submissions sent** (SMS templates) + timeline tracked (typically 7–14 days)
- [ ] **WhatsApp WABA templates submitted** + timeline tracked (typically 1–3 days)
- [ ] **Platform API team has confirmed** `/v1/delegations` design (routing, rate limits, auth)
- [ ] **Razorpay Core team has confirmed** new webhook events (`order.delegation_*`) roadmap + design
- [ ] **Data team has audited** merchant data availability (fraud, disputes, tenure, category)
- [ ] **T&S team has finalized** trust score weights + provided algorithm
- [ ] **Support team has drafted** runbook + FAQ
- [ ] **Product + Checkout SDK team have clarified** Entry A compose flow (Razorpay-hosted or embedded?)
- [ ] **Ezetap team has confirmed** Entry B scope (no firmware changes, landing page only)
- [ ] **Product has assigned** product manager + design lead to implementation team
- [ ] **This doc reviewed & signed by** Legal, Compliance, T&S, Data Eng, Platform leads

---

**Document Prepared By:** Architecture / Handoff Team  
**Last Updated:** April 15, 2026  
**Next Review:** After Phase 0 regulatory approvals received  
**Status:** Ready for handoff to Phase 1 builder; all BLOCKER items visible for concurrent resolution.
