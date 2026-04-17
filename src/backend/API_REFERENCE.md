# Ask Others to Pay — API Reference

API documentation matching the actual demo backend implementation.

## Base URL

```
http://localhost:3001/v1
```

Demo backend runs on port 3001. No authentication in demo mode — in production, Razorpay Basic Auth (`key_id:key_secret`).

## Response Format

### Success
```json
{
  "status": "ok",
  "data": { ... }
}
```

### Error
```json
{
  "error": {
    "code": "ERROR_CODE",
    "description": "Human-readable message"
  }
}
```

---

## Health

### Service Health Check

**Endpoint:** `GET /health`

```json
{
  "status": "ok",
  "service": "ask-others-to-pay-demo",
  "timestamp": "2026-04-16T10:30:00.000Z"
}
```

---

## Delegations

The delegation is the core primitive. One order can carry one open delegation at a time.

### State Machine

```
created → shared → opened → payment_started → paid
                                             → payment_failed → (retry via /pay)
         → declined (from created, shared, or opened)
         → expired (from created, shared, opened, or payment_started)
         → redelegated (old delegation closed, new one created)
```

---

### Create Delegation

**Endpoint:** `POST /v1/delegations`

Creates a new delegation on an existing order. Trust tier is assigned server-side from merchant data (not user-supplied).

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_id` | string | Yes | Razorpay order ID |
| `approver_phone` | string | Yes | Approver's phone number |
| `entry_point` | string | Yes | `A` (Checkout), `B` (QR), or `C` (Payment Link) |
| `approver_name` | string | No | Approver's display name |
| `requestor_name` | string | No | Requestor's display name |
| `requestor_phone` | string | No | Requestor's phone number |
| `preamble_text` | string | No | Personal message (max 140 chars, sanitized server-side) |
| `channel_whatsapp` | boolean | No | Send via WhatsApp (default: true) |
| `channel_sms` | boolean | No | Send via SMS (default: true) |
| `ttl_seconds` | number | No | Custom expiry (default: 86400 for web, 900 for QR) |

**Response (201 Created):**
```json
{
  "status": "created",
  "data": {
    "delegation": {
      "id": "deleg_abc123",
      "order_id": "order_PRIYA_HP",
      "merchant_id": "m_CROMA",
      "entry_point": "A",
      "state": "created",
      "trust_tier": "T1",
      "preamble_text": "Papa, can you please pay for these headphones?",
      "approver_phone": "+919876543211",
      "expires_at": "2026-04-17T10:30:00.000Z"
    },
    "order": { "id": "order_PRIYA_HP", "amount": 499900, "currency": "INR", "description": "Sony WH-CH720N" },
    "merchant": { "id": "m_CROMA", "name": "Croma Electronics", "category": "Electronics & Appliances" },
    "message": {
      "full_message": "Papa, can you please pay...\n\n━━━━━━━━━━━━━━━━━━━━━━\nRazorpay payment request\n₹4,999.00 • Croma Electronics ✓ Verified\n...",
      "preview": "Payment request • ₹4,999.00 • Croma Electronics",
      "template": "T1"
    }
  }
}
```

**Error Codes:**
- `400 BAD_REQUEST` — Missing required fields
- `400 INVALID_ENTRY_POINT` — entry_point must be A, B, or C
- `400 INVALID_PREAMBLE` — Preamble validation failed
- `404 ORDER_NOT_FOUND` — Order ID doesn't exist
- `404 MERCHANT_NOT_FOUND` — Merchant not found
- `409 ORDER_HAS_OPEN_DELEGATION` — Order already has an active delegation

**Constraint:** One open delegation per order (enforced at DB level).

---

### Get Delegation

**Endpoint:** `GET /v1/delegations/:id`

Returns delegation with full context (order, merchant, generated message). Auto-expires if TTL has passed.

**Response (200 OK):**
```json
{
  "status": "ok",
  "data": {
    "delegation": { "id": "deleg_abc123", "state": "shared", "trust_tier": "T1", "..." : "..." },
    "order": { "id": "order_PRIYA_HP", "amount": 499900, "line_items": [...] },
    "merchant": { "id": "m_CROMA", "name": "Croma Electronics", "kyc_status": "kyc_approved" },
    "message": { "full_message": "...", "preview": "...", "template": "T1" }
  }
}
```

---

### Share Delegation

**Endpoint:** `POST /v1/delegations/:id/share`

Transition: `created → shared`. Called when requestor sends the link.

**Response:** Returns updated delegation with context.

**Error:** `400 INVALID_STATE` if not in `created` state.

---

### Open Delegation

**Endpoint:** `POST /v1/delegations/:id/open`

Transition: `created|shared → opened`. Called when approver opens the link.

Auto-expires the delegation if TTL has passed before opening.

**Error:** `400 DELEGATION_EXPIRED` if expired, `400 INVALID_STATE` if not in valid state.

---

### Start Payment

**Endpoint:** `POST /v1/delegations/:id/pay`

Transition: `opened|payment_failed → payment_started`. Approver selected a payment method.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `payment_method` | string | Yes | `upi`, `card`, `netbanking`, or `wallet` |

**Side effect:** Order status moves to `attempted`.

**Error:** `400 DELEGATION_EXPIRED` if expired, `400 INVALID_STATE` if not in valid state.

---

### Capture Payment

**Endpoint:** `POST /v1/delegations/:id/capture`

Transition: `payment_started → paid`. Payment succeeded.

**Side effects:**
- Order status moves to `paid`
- Fires 3 webhooks to merchant:
  1. `order.delegation_approved`
  2. `payment.captured` (includes payment ID, amount, method)
  3. `order.paid`

**Key design point:** The `payment.captured` and `order.paid` webhooks are identical to standard Razorpay payment events. **Merchants receive the same events they already handle — zero integration changes required.**

---

### Fail Payment

**Endpoint:** `POST /v1/delegations/:id/fail`

Transition: `payment_started → payment_failed`. Payment failed; approver can retry via `/pay`.

**Side effect:** Fires `payment.failed` webhook.

---

### Decline Delegation

**Endpoint:** `POST /v1/delegations/:id/decline`

Transition: `created|shared|opened → declined`. Approver chose not to pay.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | No | Optional decline reason |

**Side effects:**
- Order status reverts to `created`
- Fires `order.delegation_declined` webhook

---

### Redelegate

**Endpoint:** `POST /v1/delegations/:id/redelegate`

Creates a new delegation from a closed one (`declined|expired|payment_failed`). Allows requestor to ask a different approver.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `approver_phone` | string | Yes | New approver's phone |
| `approver_name` | string | No | New approver's name |
| `preamble_text` | string | No | Updated message (falls back to original) |

**Response (201 Created):** Returns new delegation. Old delegation state moves to `redelegated`.

---

## Scenarios (Demo)

### List Scenarios

**Endpoint:** `GET /v1/scenarios`

Returns 5 pre-built demo scenarios with full order, merchant, trust tier, and story context.

**Response:**
```json
{
  "status": "ok",
  "count": 5,
  "data": [
    {
      "id": "daughter_asks_dad",
      "title": "Priya asks Dad to pay for headphones",
      "entry_point": "A",
      "trust_tier": "T1",
      "order": { "id": "order_PRIYA_HP", "amount": 499900 },
      "merchant": { "id": "m_CROMA", "name": "Croma Electronics" },
      "requestor": { "name": "Priya Sharma" },
      "approver": { "name": "Rajesh Sharma", "relation": "Father" }
    }
  ]
}
```

### Reset Scenario

**Endpoint:** `POST /v1/scenarios/:id/reset`

Clears all delegations and webhook events for a scenario's order. Resets order status to `created`.

**Scenario IDs:** `daughter_asks_dad`, `wife_asks_husband`, `son_asks_mom`, `accountant_asks_cfo`, `flagged_merchant_warning`

---

## Webhook Events (Demo)

### List Webhook Events

**Endpoint:** `GET /v1/webhook-events`

Returns webhook events fired during demo — shows what the merchant would receive.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `order_id` | string | Filter by order ID |
| `delegation_id` | string | Filter by delegation ID |
| `limit` | number | Max results (default: 50) |

### Clear Webhook Events

**Endpoint:** `DELETE /v1/webhook-events`

Clears all webhook events (for demo reset).

---

## Webhook Event Types

These are the events merchants receive. Standard Razorpay events are reused wherever possible.

| Event | When | Merchant action required |
|-------|------|--------------------------|
| `order.delegation_requested` | Delegation created | None (informational) |
| `order.delegation_approved` | Approver paid successfully | None |
| `payment.captured` | Payment captured | **Same handler as direct payments** |
| `order.paid` | Order fully paid | **Same handler as direct payments** |
| `order.delegation_declined` | Approver declined | Optional: notify buyer |
| `order.delegation_expired` | Delegation TTL elapsed | Optional: notify buyer |
| `payment.failed` | Payment attempt failed | None (approver can retry) |

**Key insight:** `payment.captured` and `order.paid` are existing Razorpay webhook events. Merchants already handle these. A delegated payment produces the same events as a direct payment — the merchant's existing webhook handler works without modification.

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `BAD_REQUEST` | 400 | Missing or invalid fields |
| `INVALID_ENTRY_POINT` | 400 | entry_point must be A, B, or C |
| `INVALID_PREAMBLE` | 400 | Preamble failed validation |
| `INVALID_STATE` | 400 | Action not allowed in current state |
| `DELEGATION_EXPIRED` | 400 | Delegation TTL has elapsed |
| `NOT_FOUND` | 404 | Delegation not found |
| `ORDER_NOT_FOUND` | 404 | Order ID doesn't exist |
| `MERCHANT_NOT_FOUND` | 404 | Merchant not found |
| `ORDER_HAS_OPEN_DELEGATION` | 409 | Order already has active delegation |
| `ROUTE_NOT_FOUND` | 404 | Endpoint doesn't exist |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Delegation States

| State | Description |
|-------|-------------|
| `created` | Delegation created, not yet shared |
| `shared` | Requestor sent the link |
| `opened` | Approver opened the link |
| `payment_started` | Approver selected payment method |
| `paid` | Payment captured successfully |
| `declined` | Approver declined |
| `expired` | TTL elapsed |
| `payment_failed` | Payment attempt failed (retryable) |
| `redelegated` | Closed; replaced by new delegation |

## Trust Tiers

| Tier | Criteria | Approver sees |
|------|----------|---------------|
| **T1** | `has_line_items` AND `kyc_approved` | Full details: merchant name, KYC badge, category, tenure, line items |
| **T2** | `kyc_approved` AND `mcc_code` AND `tenure > 365 days` | Standard: merchant name, category, tenure, verification |
| **T3** | Basic verified (fallback) | Basic: merchant name, status |
| **T4** | `risk_flagged` OR `tenure < 30 days` OR `unverified` | Warning banner: "Review carefully", risk reason |

Trust tier is computed server-side from merchant data via `assignTrustTier()` — never user-supplied.
