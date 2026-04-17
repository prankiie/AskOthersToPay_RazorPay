/**
 * Assumed External Identifiers & Integration Points
 *
 * This file centralizes all assumed field names, template IDs, and API endpoint names
 * where we do not yet have the exact identifier from external systems (Razorpay, Ezetap, etc.).
 *
 * When the external team confirms the real name, update ONLY this file and all references
 * across the backend will pick up the change (swap-the-name-and-go pattern).
 *
 * Each assumption is documented with:
 * - The assumed identifier we use in code
 * - The owner team to confirm with
 * - What changes if the assumption is wrong
 *
 * See docs/DEPENDENCIES_AND_CLARIFICATIONS.md§8 for the full matrix of assumptions.
 *
 * Last Updated: April 15, 2026
 */

module.exports = {
  /**
   * § Razorpay Internal Fraud/Risk Score API
   * ASSUMPTION: Razorpay risk team will provide an API endpoint that returns merchant risk data
   * with a boolean flag indicating elevated fraud risk.
   *
   * OWNER: Razorpay Risk / Fraud team
   * BLOCKER: YES (gates T4 warning overlay, which blocks Phase 1 launch if not integrated)
   */
  razorpayInternalFraudScore: {
    // ASSUMPTION: Endpoint pattern for querying merchant risk profile
    // Real endpoint TBD by Razorpay risk team; could be:
    // GET /v1/merchants/{id}/risk-profile
    // GET /internal/merchants/{id}/fraud-assessment
    // or other pattern
    endpointPattern: 'GET /v1/merchants/{merchant_id}/risk-profile',

    // ASSUMPTION: Field name in merchant data API that indicates fraud flag
    // Example possibilities:
    // - razorpay_internal_fraud_score_flagged (boolean)
    // - risk_flag_high (boolean)
    // - fraud_risk_elevated (boolean)
    // - trust_flag (string: 'normal' | 'elevated' | 'high')
    fieldNameFraudFlagHigh: 'razorpay_internal_fraud_score_flagged',

    // ASSUMPTION: Field name for numeric fraud risk score (0-100)
    fieldNameRiskScore: 'risk_score',

    // ASSUMPTION: Definition of "flagged-high" state
    // We assume: if fraud_flag_high === true, show T4 warning overlay
    thresholdForWarning: true,  // boolean check; if field === true, trigger warning

    // ASSUMPTION: Update frequency of fraud score (when is it refreshed?)
    // Options: real-time, hourly, daily, weekly
    updateFrequency: 'daily',

    // SLA for query response (estimated; confirm with Razorpay)
    expectedResponseTimeMs: 200,
  },

  /**
   * § Razorpay Webhook Events for Delegation Lifecycle
   * ASSUMPTION: Razorpay webhooks team will emit these event names and payload structures.
   *
   * OWNER: Razorpay Webhooks / Platform team
   * BLOCKER: YES (gates Phase 1 launch; merchant integration depends on these events)
   *
   * Event schema assumed (confirm actual payload structure with Razorpay):
   * {
   *   id: string,
   *   event: string,  // event name below
   *   created_at: timestamp,
   *   entity: { delegation_id, order_id, merchant_id, status, ... }
   * }
   */
  razorpayWebhookEvents: {
    delegationCreated: 'order.delegation_created',
    delegationApproved: 'order.delegation_approved',
    delegationDeclined: 'order.delegation_declined',
    delegationExpired: 'order.delegation_expired',
    delegationPaymentFailed: 'order.delegation_payment_failed',
    delegationReversed: 'order.delegation_reversed',
  },

  /**
   * § WhatsApp Business API Template Names for DLT Registration
   * ASSUMPTION: Four message templates with these IDs will be registered with DLT + WABA.
   *
   * OWNER: Razorpay Comms / Compliance team
   * BLOCKER: YES (templates must be DLT-approved before SMS/WhatsApp send is live)
   *
   * These IDs map 1:1 to the DLT approval status. If a template is not approved,
   * we cannot send via that channel.
   */
  whatsappTemplateNames: {
    // T1: Rich e-commerce (merchant passed line_items)
    t1_enterpriseItems: 'aop_t1_enterprise_items',

    // T2: Standard Razorpay merchant (MCC + tenure data)
    t2_standardCategory: 'aop_t2_standard_category',

    // T3: Small / new Razorpay merchant (basic KYC only)
    t3_smallMerchant: 'aop_t3_small_merchant',

    // T4: Low-trust warning overlay (fraud flag high OR age < 30 days)
    t4_lowTrustWarning: 'aop_t4_low_trust_warning',
  },

  /**
   * § DLT SMS Template IDs
   * ASSUMPTION: These placeholder IDs map to actual DLT-registered templates.
   * Once registered, these IDs are placed in config/delegation.js; builder references them.
   *
   * OWNER: Razorpay SMS Ops / Compliance team
   * BLOCKER: YES (SMS send requires DLT template ID; cannot ship without approvals)
   *
   * These are populated after DLT approvals; currently placeholders.
   */
  dltSmsTemplateIds: {
    t1_template_id: 'DLT_AOP_T1_ITEMS',
    t2_template_id: 'DLT_AOP_T2_CATEGORY',
    t3_template_id: 'DLT_AOP_T3_BASIC',
    t4_template_id: 'DLT_AOP_T4_WARNING',
  },

  /**
   * § SMS Sender ID
   * ASSUMPTION: Outgoing delegation SMS will show this sender ID / brand name.
   *
   * OWNER: Razorpay SMS Ops / Comms team
   * BLOCKER: NO (not core functionality; DLT may require specific sender ID)
   *
   * Options (to be confirmed with SMS Ops):
   * - "RAZORP" (existing Razorpay brand sender)
   * - "AOTPAY" (dedicated for this feature)
   * - "RZRPAY" (alternate)
   */
  smsSenderId: 'RAZORP',  // ASSUMPTION: Razorpay's existing SMS sender ID

  /**
   * § Razorpay Merchant Tier Classification
   * ASSUMPTION: Razorpay GTM has defined merchant tiers for pilot rollout gating.
   * We assume an enum: enterprise, established, standard, new
   *
   * OWNER: Razorpay GTM / Product team
   * BLOCKER: NO for MVP (tier gating deferred to Phase 2; Phase 1 uses merchant age only)
   *
   * Pilot rollout gates to specific tier(s); builder will add feature flag that checks this.
   */
  merchantTierEnum: {
    values: ['enterprise', 'established', 'standard', 'new'],
    // ASSUMPTION: Pilot phase targets enterprise + established merchants
    pilotTiers: ['enterprise', 'established'],
    // Field name in merchant data (to be confirmed)
    fieldName: 'merchant_tier',
  },

  /**
   * § MCC (Merchant Category Code) to Label Mapping
   * ASSUMPTION: Razorpay has an internal MCC→label mapping service or checked-in data.
   *
   * OWNER: Razorpay Data / Platform team
   * BLOCKER: NO (T2 template uses MCC label; fallback to omit line if unavailable)
   *
   * Service options (to be confirmed):
   * - API endpoint: GET /v1/merchant/{id}/category-label
   * - Static JSON file: data/mcc_labels.json
   * - Inline lookup in merchant record (existing field)
   */
  mccLabelMapping: {
    // ASSUMPTION: Service endpoint or data file for MCC→human-readable label
    source: 'GET /v1/categories/{mcc_code}',  // or static JSON, TBD
    // Fallback: if MCC label unavailable, omit Category line from T2 template (graceful degradation)
    fallbackBehavior: 'omit_line',
  },

  /**
   * § Razorpay Orders API: line_items Field
   * ASSUMPTION: Orders API returns line_items in full (name, description, quantity, amount).
   *
   * OWNER: Razorpay Platform API team
   * BLOCKER: NO (T1 template reads line_items if present; graceful fallback to T2 if missing)
   *
   * Confirmation needed: full structure, no truncation, available at payment/delegation time.
   */
  ordersApiLineItems: {
    // ASSUMPTION: GET /v1/orders/{order_id} response includes line_items array
    fieldName: 'line_items',
    // Structure: [{ name, description, quantity, amount }, ...]
    // Confirmed to exist in Orders API? YES (Razorpay docs confirm this)
    // Issue: truncation or filtering at payment time? TBD
  },

  /**
   * § Razorpay Short URL Namespaces
   * ASSUMPTION: Two short URL namespaces allocated for delegation feature.
   *
   * OWNER: Razorpay Platform DNS / short-URL service owner
   * BLOCKER: YES (approval page and POS landing page both depend on these)
   */
  shortUrlNamespaces: {
    // ASSUMPTION: rzp.io/r/* is allocated for approval page canonical URLs
    approvalPagePattern: 'rzp.io/r/{delegation_id}',

    // ASSUMPTION: rzp.io/q/* is allocated for Entry B (Ezetap) QR landing pages
    qrLandingPagePattern: 'rzp.io/q/{merchant_id}/{order_id}',
  },

  /**
   * § Ezetap Dynamic QR Encoding
   * ASSUMPTION: Ezetap QR generation service will encode rzp.io/q/{...} URLs
   * instead of legacy upi://pay?{...} payloads.
   *
   * OWNER: Ezetap product / Platform QR team
   * BLOCKER: YES (Entry B feature entirely depends on this)
   *
   * Confirmation needed:
   * - Migration timeline (Phase 0 or Phase 1 concurrent?)
   * - Rollout strategy (immediate or gradual?)
   * - Backwards compatibility (old printed QRs break or still work?)
   */
  ezetapQrEncoding: {
    // ASSUMPTION: QR payload pattern
    newPayloadPattern: 'https://rzp.io/q/{merchant_id}/{order_id}',
    oldPayloadPattern: 'upi://pay?{upi_params}',
    // Confirmation: Are we migrating the QR generation service? YES (Phase 1 blocker)
  },

  /**
   * § Razorpay Merchant Data: created_at Field
   * ASSUMPTION: Merchant record has a created_at timestamp for tenure calculation.
   *
   * OWNER: Razorpay Data / Platform team
   * BLOCKER: HIGH (merchant age < 30 days gate is core v1 logic)
   *
   * Gate logic: if (now() - merchant.created_at < 30 days) => hide "Ask Someone" button
   */
  merchantAgeDataSource: {
    fieldName: 'created_at',  // timestamp in merchant record
    threshold: {
      minimumAgeDays: 30,
      gateLogic: 'if (now() - created_at < 30 days) => INELIGIBLE',
    },
  },

  /**
   * § WhatsApp Business API Reachability Check
   * ASSUMPTION: WABA provides an endpoint to check if a phone number is WhatsApp-reachable.
   *
   * OWNER: Platform Messaging / Integration team
   * BLOCKER: MEDIUM (fallback to SMS if check fails, but check is core v1 feature)
   *
   * Endpoint options (to be confirmed):
   * - POST /check-contact-number
   * - GET /contacts/{phone}/reachability
   * - other WABA endpoint
   */
  wabaReachabilityCheck: {
    // ASSUMPTION: WABA endpoint pattern
    endpointPattern: 'POST /contacts/check',  // or GET /contacts/{phone}/reachability, TBD
    // Return: { reachable: boolean }
    expectedResponseSchema: {
      reachable: 'boolean',
    },
  },

  /**
   * § Razorpay Feature Flag Namespace
   * ASSUMPTION: Delegation feature uses these feature flags for gradual rollout.
   *
   * OWNER: Platform Feature Flags team
   * BLOCKER: NO (gates Phase 2+ rollout; not required for Phase 1 MVP)
   *
   * Format: delegation.{scope}_{setting}
   */
  featureFlags: {
    // Master kill-switch
    masterEnabled: 'delegation.enabled',

    // Per-entry-point toggles
    entryAEnabled: 'delegation.entry_a_enabled',
    entryBEnabled: 'delegation.entry_b_enabled',
    entryCEnabled: 'delegation.entry_c_enabled',

    // Trust threshold (configurable)
    trustScoreWarningThreshold: 'delegation.trust_score_warning_threshold',
  },

  /**
   * § NPCI/RBI Compliance Field Names
   * ASSUMPTION: No special identifiers required; we re-use existing Razorpay compliance fields.
   *
   * OWNER: Razorpay Legal / Compliance
   * BLOCKER: NO (compliance baked into code; no external field lookups)
   */
  complianceAssumptions: {
    // ASSUMPTION: RBI 2FA mandate (April 1, 2026) requires OTP as separate 2FA
    // We assume: standard 6-digit OTP, valid 10 min, max 5 attempts
    otpLengthDigits: 6,
    otpValiditySeconds: 600,  // 10 minutes
    otpMaxAttempts: 5,

    // ASSUMPTION: NPCI exemption letter confirms feature is NOT P2P collect
    npciExemptionRequired: true,
    exemptionStatus: 'PENDING - Legal to obtain formal opinion',
  },

  /**
   * § Integration Handoff Summary
   *
   * To integrate a confirmed external identifier:
   * 1. Find the corresponding key above
   * 2. Replace the assumed value with the real identifier
   * 3. Commit the change (one file, one change)
   * 4. All references across src/backend/ will pick it up
   * 5. Update DEPENDENCIES_AND_CLARIFICATIONS.md to mark as CONFIRMED
   *
   * Example:
   * OLD: fieldNameFraudFlagHigh: 'razorpay_internal_fraud_score_flagged',
   * NEW: fieldNameFraudFlagHigh: 'merchant_risk_signal_high',  // Confirmed by Razorpay risk team on 2026-05-01
   */
};
