# Message Templates — Ask Others to Pay

## Grounding rule (read first)

**We only use data we actually have.** We never infer relationships, tone, familiarity, language preference, or names. Specifically:

| We have | We do NOT have |
|---------|----------------|
| Requester's name from their Razorpay/POP account (if authenticated) | The approver's name |
| Approver's phone number (requester types or picks) | The approver's relationship to the requester (parent, spouse, friend, etc.) |
| Phonebook label for the approver IF the requester uses the OS contact picker (raw string, uninterpreted) | What that label means semantically ("Papa" ≠ "father" for our purposes) |
| Free-text note the requester types (optional, capped at 140 chars) | Tone register, language register, preferred salutation style |
| Merchant data by tier (see PAYMENT_FLOW_MECHANICS.md §4) | Anything the merchant didn't send us |
| Amount, order_id, delegation_id, expiry | The reason for the purchase unless requester types it |
| Locale of the requester's app/device | Locale of the approver (inferred only from country code on phone number) |

If we don't have a piece of data, we omit it. We never fabricate a salutation, a name, or a relationship.

## Message architecture

Every outgoing message has two parts:

### Part 1 — Requester preamble (editable, optional)

- Default state: **empty**. The UI shows a placeholder like "Add a short note (optional)".
- If the requester types something, it goes at the top, verbatim, capped at 140 chars (hard cap, enforced server-side after sanitisation). Requests with preamble >140 chars return HTTP 400. Sanitised: strip URLs, phone numbers, RTL override chars (see Anti-spoofing below).
- If the requester used the OS contact picker, we prepend the raw phonebook label as a salutation *only if the requester opted in via a "Address them as {label}?" confirmation*. Default: off. The label is treated as an opaque string; no interpretation ("Papa" is not read as "father").

**No requester signature.** v1 does not append a `— {FirstName}` signature to the message, nor does the approver page display a "From: {name}" line. The delivery channel (WhatsApp / SMS from the requester's own number) already carries identity via the saved contact name on the approver's phone. Razorpay has no verified identity to surface beyond what the phone number implies, so we do not invent one.

### Part 2 — System block (non-editable, tamper-proof)

System-appended, always present, always in the same structure. This is the part the approver can trust because it's generated server-side and the preamble cannot mimic it (see Anti-spoofing).

```
Razorpay payment request
Amount: ₹{amount}
Merchant: {merchant_name}{verification_mark}
{optional_context_line}
Approve: {short_url}
Expires: {expiry_local}
```

- `verification_mark`: ` ✓ Verified` if merchant KYC is complete, else nothing. No other adjectives.
- `optional_context_line`: present only when we have tier-appropriate data (see Templates by tier).
- `short_url`: `rzp.io/r/{delegation_id}` — always the canonical hosted approval URL, never a redirect.
- `expiry_local`: rendered in the approver's phone's inferred timezone if determinable from country code, else UTC with an explicit "UTC" suffix.

## Channels

Both **SMS and WhatsApp** are pre-selected the moment a valid phone number is entered or a contact is picked. The requester can uncheck either, but both are on by default.

- SMS: always sent if checked. Uses DLT-registered template IDs.
- WhatsApp: sent if checked AND the approver's number is WhatsApp-reachable (checked at send time via WhatsApp Business API). If not reachable, we fall back to SMS only and surface that to the requester.
- Requester's own share (WhatsApp / SMS / copy-link / QR) is always available in parallel — that path carries the message through the requester's trusted identity and is usually the higher-converting channel.

## Templates by merchant data tier

Template is chosen automatically by the merchant data tier (see PAYMENT_FLOW_MECHANICS.md). The requester does not pick a template. v1 supports only Razorpay merchants (T1, T2, T3) with optional low-trust warning overlay (T4).

### T1 — Rich e-commerce (merchant passed `line_items`)

```
{optional_preamble}

Razorpay payment request
Amount: ₹{amount}
Merchant: {merchant_name} ✓ Verified
For: {item_summary}{items_suffix}
Approve: rzp.io/r/{id}
Expires: {expiry}
{optional_signature}
```

- `item_summary`: the `name` field of the first line item from the Orders API, truncated at 40 chars.
- `items_suffix`: ` +{n-1} more` if there are additional line items, else empty.
- We do NOT invent product names, categories, or descriptions.

### T2 — Standard Razorpay merchant (MCC + tenure + dispute data)

```
{optional_preamble}

Razorpay payment request
Amount: ₹{amount}
Merchant: {merchant_name} ✓ Verified
Category: {mcc_label}
Approve: rzp.io/r/{id}
Expires: {expiry}
{optional_signature}
```

- `mcc_label`: the human-readable label for the merchant's MCC (e.g., "Electronics & Appliances"). If MCC is missing, omit the Category line entirely.

### T3 — Small / new Razorpay merchant (basic KYC only)

```
{optional_preamble}

Razorpay payment request
Amount: ₹{amount}
Merchant: {merchant_name}{verification_mark}
Approve: rzp.io/r/{id}
Expires: {expiry}
{optional_signature}
```

No category, no item summary. Just what we have.

### T4 — Low-trust warning overlay (any tier)

If the merchant has a flagged-high internal fraud/risk score OR merchant age < 30 days, a warning prefix replaces the standard header. Preamble and signature are unchanged.

```
{optional_preamble}

⚠ Razorpay payment request — review carefully
Amount: ₹{amount}
Merchant: {merchant_name}
Category: {mcc_label}
Warning: {reason_code} — see details on the approval page.
Approve: rzp.io/r/{id}
Expires: {expiry}
{optional_signature}
```

- `reason_code`: a short machine-selected phrase from a fixed list (e.g., `recent merchant`, `elevated fraud risk`, `requires review`). We never editorialise beyond this fixed vocabulary.

## WhatsApp link preview (OG metadata)

The hosted approval URL serves Open Graph tags so WhatsApp renders a preview card. The card is populated server-side from the same fields as the system block — what the approver sees in the preview matches what they see on the approval page.

- `og:title`: `Payment request • ₹{amount} • {merchant_name}`
- `og:description`: merchant category + verification state + expiry
- `og:image`: merchant logo if we have a KYC-verified logo on file; otherwise a generic Razorpay-branded placeholder. **Never** a scraped or inferred image.
- `og:url`: canonical `rzp.io/r/{id}`

No client-side control over preview content.

## Localisation

We do **not** machine-translate the preamble. The system block is rendered in the language chosen by:

1. **v1 (Launch):** System block sent in English only, regardless of requester's app locale. Approval page does NOT offer language toggle in v1.
2. **v2+ (Phase 6):** Support for Indian scheduled languages (Hindi first, then 8 others) will be added. System block rendered in requester's app locale if that locale is a scheduled language; otherwise English. Approval page will offer language toggle to approver.

Translation tables for the system block live in `src/backend/i18n/delegation/*.json`. Launch set: English only. Hindi + 8 other scheduled languages deferred to Phase 6.

We **never** translate the requester's preamble or the merchant name.

## Template selection logic (pseudocode)

```
function pickTemplate(order, merchant):
  if shouldRenderWarningOverlay(merchant):
    return T4(base=pickByDataAvailability(merchant))
  return pickByDataAvailability(merchant)

function shouldRenderWarningOverlay(merchant):
  // T4 warning overlay is rendered if:
  // (a) Razorpay internal fraud/risk score is flagged-high, OR
  // (b) merchant age < 30 days
  return merchant.razorpay_internal_fraud_score_is_high OR merchant.age_days < 30

function pickByDataAvailability(merchant):
  // T1 canonical rule: line_items non-empty AND merchant.tier == enterprise AND merchant.kyc_status == complete
  if order.line_items is non-empty and merchant.tier == enterprise and merchant.kyc_status == complete:
    return T1
  if merchant.mcc is known and merchant.tenure_days >= TENURE_MIN:
    return T2
  return T3
```

`TENURE_MIN` is defined in `src/backend/config/trust.js` and reviewed quarterly by Trust & Safety. The `razorpay_internal_fraud_score_is_high` field is a dependency on the Razorpay risk team (see DEPENDENCIES_AND_CLARIFICATIONS.md for exact field name and integration point).

## Anti-spoofing

The preamble must not be able to imitate the system block. Controls:

1. **Server-side rendering only.** The preamble is sanitised before concatenation — strip all URLs, all phone-number-shaped strings, all Unicode bidirectional override characters (U+202A–U+202E, U+2066–U+2069), and all homoglyphs for the literal string "Razorpay".
2. **Hard separator.** Two newlines separate preamble from the system block. The system block always begins with the literal header string ("Razorpay payment request" / "Razorpay-facilitated payment request" / "⚠ Razorpay payment request — review carefully") as the first line after the separator.
3. **URL locking.** Exactly one URL is permitted in the outgoing message — the canonical `rzp.io/r/{id}`. Any URL found in the preamble is removed.
4. **Length caps.** Preamble is hard-capped at 140 chars (enforced server-side, requests >140 return HTTP 400). System block is fixed-structure with a known maximum length. Full outgoing message is engineered to fit within 2 GSM-7 segments (~306 chars usable) for English; 1 UCS-2 segment (70 chars) reserved for future localised variants.
5. **DLT template registration.** SMS templates are pre-registered with telecom DLT; any tampering is rejected at carrier ingress.
6. **No executable preview.** The approval page itself (not any intermediate link) is what the approver sees; WhatsApp preview metadata is server-controlled.

## Compose UI (what the requester sees)

Intentionally minimal:

1. Approver phone / pick contact (both SMS and WhatsApp pre-checked).
2. "Add a short note (optional)" — 140-char textbox, **empty by default**. No suggested text.
3. Preview card showing exactly what will be sent, including the system block.
4. Primary action: "Send via Razorpay". Secondary: "Send from your own WhatsApp / SMS" — opens an OS share sheet with the same text.

No template picker. No relationship picker. No salutation picker. No emoji picker.

## What we explicitly do NOT build in v1

- No relationship inference or labels ("Dad", "Mom", "Spouse" — none of it).
- No auto-translation of the preamble.
- No AI-suggested preamble text.
- No emoji auto-insertion.
- No name extraction from phonebook labels for grammar.

These are exactly the class of feature that invents data we don't have. Any revisit post-launch must be gated on explicit user research.

## Review cadence for template changes

Every change requires:

1. Legal review (DLT template registration, consumer protection language).
2. Trust & Safety review (anti-spoofing, warning wording).
3. Localisation review for each enabled language.
4. A/B test with a fallback to the prior template.
