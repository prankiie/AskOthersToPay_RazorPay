# Ask Others to Pay: Unified Payment Flow Mechanics for Razorpay

**Scope:** Complete technical specification for Razorpay's "Ask Others to Pay" feature, unified across all entry points (Checkout SDK, POS QR, payment links).

**Core Concept:** The "delegation" is the primitive — a Razorpay Order combined with a delegation record. The customer's entry point varies (web button, POS QR, static QR scan, payment link), but the downstream flow is identical.

**Regulatory Context:** NPCI banned P2P UPI collect requests (Oct 2025), but merchant-to-consumer collect is still allowed. This design routes payment through the merchant — the compliance thesis is that merchant-anchored delegation is not P2P collect, pending NPCI confirmation.

---

## 1. The Unified Flow (Spine)

All entry points converge to a single payment flow. Here's the canonical sequence:

### 1.1 Flow Diagram

```
┌─────────────────┐
│ ORDER CREATION  │  (Entry-specific: API, QR scan, link tap, checkout button)
│   via any       │
│  Entry Point    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ REQUESTOR INITIATES          │
│ DELEGATION on order          │
│ (picks contact to request)   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ SHARE SHEET: Share via      │
│ WhatsApp + SMS (both by     │
│ default, toggleable)         │
│ Link: rzp.io/r/{id}         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ APPROVER TAPS LINK          │
│ Lands on rzp.io/r/{id}      │
│ (Razorpay-hosted page)      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ APPROVER SEES CONTEXT:      │
│ • Merchant name, logo       │
│ • Amount, item description  │
│ • Trust panel (if available)│
│ • Decline option            │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ APPROVER CHOOSES PAYMENT    │
│ METHOD & PAYS               │
│ (UPI Intent, Card, NB, etc.)│
│ Standard Razorpay flow      │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ PAYMENT CAPTURED            │
│ Order marked PAID           │
│ Requestor's cart fulfilled  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ WEBHOOKS FIRE:              │
│ Standard (required):        │
│ • payment.captured          │
│ • order.paid                │
│ Delegation lifecycle        │
│ (opt-in):                   │
│ • order.delegation_approved │
│ Merchant fulfills order     │
└──────────────────────────────┘
```

> **Webhook integration note:** Existing merchant handlers for `payment.captured` and `order.paid` work unchanged — zero code change is required for existing integrations. The four `order.delegation_*` events (`requested / approved / declined / expired`) are **opt-in** for merchants who want to surface delegation state in their own UI (e.g., showing "Waiting for approval from Rajesh…" in an order dashboard). Merchants who ignore them lose nothing — the order still settles via the standard events.

### 1.2 Step-by-Step Walkthrough

**Scenario** (illustrative): A requestor at an e-commerce merchant buys a product (amount varies). An approver must authorize payment.

#### Step 1: Order Creation (entry-specific)
- Merchant backend calls `POST /v1/orders` with amount, currency, optional `line_items`
- Razorpay returns `order_id` (e.g., `order_5Oy8aAijPWzDHu`)
- Response includes standard order metadata

**API Reference:** [Create an Order - Razorpay Docs](https://razorpay.com/docs/api/orders/create/)

#### Step 2: Requestor Initiates Delegation
- Requestor clicks "Ask Someone to Pay" button (source varies: Checkout SDK, Payment Link, landing page)
- Frontend calls `POST /v1/delegations` with:
  ```json
  {
    "order_id": "order_5Oy8aAijPWzDHu",
    "requestor_id": "priya_123",
    "approver_contact": "+919876543210",
    "message": "please buy me headphones",
    "ttl_seconds": 86400
  }
  ```
  (No `approver_name` field — per [MESSAGE_TEMPLATES.md](MESSAGE_TEMPLATES.md), identity rides the delivery channel; Razorpay does not fabricate or auto-fill approver names.)
- Razorpay creates delegation record with status `PENDING`
- Response: `delegation_id` (e.g., `deleg_abc123xyz`)

**NEW API:** `POST /v1/delegations` (not yet in Razorpay docs — this is new)

#### Step 3: Share Sheet
- Requestor's OS share sheet opens (native iOS/Android or web fallback)
- Default channels: **WhatsApp + SMS** (both enabled by default)
- Requestor can toggle either channel off before sending
- Link shared: `https://rzp.io/r/{delegation_id}`
- Message body: server-rendered per [MESSAGE_TEMPLATES.md](MESSAGE_TEMPLATES.md) (optional requester preamble + tamper-proof system block). No fabricated salutation or requester signature.

#### Step 4: Approver Receives Notifications
- **SMS:** Direct SMS from Razorpay or partner (Twilio/AWS SNS) with link and inline preview
- **WhatsApp:** Rich card from Razorpay's WhatsApp Business API with OG metadata (logo, merchant name, amount)
- Both messages deduped: once approver pays via one channel, the other shows "already paid" status

#### Step 5: Approver Clicks Link
- Tap opens `https://rzp.io/r/{delegation_id}` on approver's browser/app
- Razorpay-hosted landing page loads with:
  - Merchant branding (logo, name)
  - Order context: amount, item description (if available)
  - Optional trust panel (merchant tenure, ratings, dispute rate)
  - "Approve & Pay" button
  - "Decline" button

#### Step 6: Approver Reviews & Decides
- Approver sees:
  - Merchant name, verification badge, amount
  - Optional preamble the requester typed (e.g., "please buy me headphones"), if any
  - Tier-adaptive trust panel (see §4)
  - Approve & Pay / Decline buttons
- No "From: {requester_name}" line is rendered on the approver page — identity rides the delivery channel (WhatsApp/SMS from the requester's own number). See [MESSAGE_TEMPLATES.md](MESSAGE_TEMPLATES.md).
- Approver clicks "Approve & Pay"

#### Step 7: Standard Razorpay Checkout
- Razorpay's payment page opens with available methods (UPI Intent, Card, NB, Wallet)
- UPI Intent pre-selected if available on mobile
- Approver selects UPI → deeplink to PhonePe/GPay/Paytm
- Enters UPI PIN → payment authorized

**API Reference:** [UPI Intent - Razorpay Docs](https://razorpay.com/docs/payments/payment-methods/upi/upi-intent/)

#### Step 8: Payment Capture
- Razorpay receives authorization from bank
- Automatically captures: `POST /v1/payments/{payment_id}/capture`
- Order status changes: `created` → `attempted` → `paid`
- Delegation status: `PENDING` → `APPROVED`

**API Reference:** [Capture a Payment - Razorpay Docs](https://razorpay.com/docs/api/payments/capture/)

#### Step 9: Webhooks Fire
Razorpay sends to merchant webhook endpoint:
```json
{
  "event": "order.paid",
  "payload": {
    "order": {
      "id": "order_5Oy8aAijPWzDHu",
      "amount": 499900,
      "status": "paid",
      "notes": {
        "delegation_requestor_id": "priya_123",
        "delegation_id": "deleg_abc123xyz"
      }
    }
  }
}
```

Also fires:
- `payment.captured` (standard — existing merchant handlers work unchanged)
- `order.delegation_approved` (NEW webhook event — **opt-in**; merchants subscribe only if they want to surface delegation state in their own UI. Ignoring it is safe; the order still settles via `order.paid` + `payment.captured`.)

**API Reference:** [Webhooks - Razorpay Docs](https://razorpay.com/docs/webhooks/)

#### Step 10: Fulfillment
- Merchant backend receives webhook, marks order as paid
- Fulfillment system ships item to requestor's address
- Both requestor and approver see confirmation pages with order ID

---

## 2. Entry Points (3 Variants, Identical Downstream)

All entry points create an order and trigger the unified flow above. Differences are **only** in order seeding and available context.

### Entry A: Razorpay Checkout SDK (Web/App E-Commerce)

**Use Case:** Online e-commerce merchant embedding Razorpay Checkout.

**Entry Mechanism:**
- Merchant embeds Razorpay Checkout SDK on checkout page
- Customer reviews cart, enters shipping address
- Merchant's backend calls `POST /v1/orders` with:
  ```json
  {
    "amount": 499900,
    "currency": "INR",
    "receipt": "croma_ORD_123456",
    "notes": {
      "customer_id": "priya_123",
      "source": "web"
    },
    "line_items": [
      {
        "item_code": "WH-CH720N",
        "description": "{product_description}",
        "amount": 499900,
        "quantity": 1
      }
    ]
  }
  ```
- Checkout opens with payment method options including "Ask Someone to Pay" button
- Customer clicks button → delegation flow starts

**Data Available:**
- Full merchant context: name, logo, MCC, website
- Full order context: line items, item descriptions, quantities
- Customer profile: verified account, tenure, dispute history
- Rich trust signals available

**TTL:** 24 hours (canonical, for web checkout Entry A)

**Cashier UI:** N/A (online only)

**API Reference:** [Razorpay Checkout SDK - Integration Steps](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/), [Orders API with line_items](https://razorpay.com/docs/api/orders/create/)

---

### Entry B: Razorpay-Hosted QR Landing Page (In-Store Dynamic & Static QR) — WEB-ONLY CHANGE, NO FIRMWARE UPDATE

**Use Case:** Brick-and-mortar merchant (restaurant, kirana) with Razorpay DQR device or Ezetap POS terminal generating dynamic QR; or merchant displaying static QR.

**QR Encoding (Dynamic & Static):**
- **Dynamic QR (DQR Device / Ezetap POS):** Generates URL-encoded QR:
  ```
  rzp.io/q/{merchant_id}/{order_id}
  ```
  (or `rzp.io/q/{merchant_id}` for static; order_id optional)
- **Static QR:** Encodes:
  ```
  rzp.io/q/{merchant_id}
  ```
  (permanent, amount entered by payer on landing page)
- Both are URLs, NOT `upi://pay` deep-links
- Trade-off: Loses one-tap UPI app launch from strict UPI handlers; gains controllable Razorpay-owned landing surface

**Entry Mechanism (v1):**
- Cashier punches amount (₹4,999) into Ezetap terminal using EXISTING interface (no changes to terminal firmware or UI)
- Terminal generates dynamic QR encoding Razorpay URL: `rzp.io/q/{merchant_id}/{order_id}`
- Customer scans QR with phone camera or Google Lens (recognized as URL by default mobile browser handler)
- **Critical:** QR is a URL pointing to Razorpay, not a `upi://` deep-link
- Phone's default browser opens Razorpay-hosted landing page: `https://rzp.io/q/{merchant_id}/{order_id}`
- **NEW (v1):** Landing page offers two CTAs: **"Pay now"** (launches UPI Intent for buyer's own apps) or **"Ask someone else to pay"** (enters unified delegation compose flow)
- **Scope Reduction:** NO terminal firmware changes. No "Ask Someone" button on terminal itself. No terminal UI updates. No terminal-side delegation flow. Terminal continues to show standard "Awaiting payment" screen with countdown. All delegation entry is via the landing page (web), not terminal UI.
- A rollout would need existing Razorpay Dynamic QR devices currently encoding `upi://` strings to be migrated to encode `rzp.io/q/...` URLs (platform-side QR generation change, not firmware change)

**Order Creation Flow:**
- Ezetap terminal calls Razorpay `POST /v1/orders` server-to-server:
  ```json
  {
    "amount": 499900,
    "currency": "INR",
    "receipt": "ezetap_TERMINAL_123_TXN456",
    "notes": {
      "terminal_id": "TERMINAL_123",
      "source": "pos",
      "entry_point": "dynamic_qr"
    }
  }
  ```
- Razorpay generates `order_id` and creates dynamic QR encoding URL: `rzp.io/q/{merchant_id}/{order_id}`
- Ezetap terminal displays "Awaiting payment" status with 15-min countdown

**Landing Page (Razorpay-Hosted, Mobile-Optimized):**
- **URL:** `https://rzp.io/q/{merchant_id}/{order_id}` (dynamic) or `https://rzp.io/q/{merchant_id}` (static, with amount input)
- **Displayed Elements:**
  - Merchant name & verification badge
  - Amount (if dynamic QR carries it; otherwise input field for static QR)
  - Trust signals (if available: merchant rating, tenure, dispute rate)
- **CTAs:**
  - **"Pay now"** → initiates standard UPI Intent for buyer's installed UPI app (PhonePe, Google Pay, Paytm, BHIM)
  - **"Ask someone else to pay"** → opens unified delegation compose modal: "Who should I ask?" (phone + optional note) → creates delegation → OS share sheet
- **Responsive:** Works on all mobile browsers, tablets, desktop fallback

**Data Available:**
- Merchant name, MCC, verification badge (from enrollment)
- Amount only (dynamic) or amount entered by payer (static)
- No line items (cashier didn't enter item details)
- Merchant tenure, avg transaction value, dispute rate (if T2 data available)

**Data Tier Assigned:** T2 (MCC + tenure + verification) unless merchant's integration sends line_items per order → T1.

**TTL:**
- **Dynamic QR in-store session:** 15 minutes (starts when order created, enforced on terminal countdown)
- **Static QR:** Perennial (no TTL on QR itself); TTL applies only once a delegation is created (15m standard, configurable)

**Terminal Cashier UI:**
- Terminal shows "Payment Awaiting" status with 15-min countdown (unchanged from existing dynamic QR flow)
- No changes to terminal UI
- Terminal does NOT display "Ask Someone to Pay" indicator or approver phone
- Delegation flow happens entirely on customer's phone after scanning the QR and landing on Razorpay web page
- Auto-timeout if no payment after TTL (existing behavior)

**API Reference:** [Razorpay QR Code APIs](https://razorpay.com/docs/payments/qr-codes/apis/), [Razorpay POS Integration](https://razorpay.com/docs/payments/pos/)

---

### Entry C: Razorpay Payment Link

**Use Case:** Merchant sends payment link via SMS/email/WhatsApp (e.g., invoice payment, donation request).

**Entry Mechanism:**
- Merchant calls `POST /v1/payment_links` with amount, description, expiry, etc.:
  ```json
  {
    "amount": 499900,
    "currency": "INR",
    "accept_partial": true,
    "first_min_partial_amount": 0,
    "description": "{product_description}",
    "customer": {
      "name": "{requester_name}",
      "email": "priya@example.com",
      "contact": "+919123456789"
    },
    "notify": {
      "sms": true,
      "email": true
    },
    "reminder_enable": true,
    "expire_by": 1680000000
  }
  ```
- Razorpay generates payment link: `https://rzp.io/i/{payment_link_id}`
- Sends SMS/email to customer with link
- Customer taps link → Razorpay-hosted payment page opens
- Payment page shows: amount, description, payment method options, **+ "Ask Someone to Pay" button**

**Order Creation:**
- When customer initiates delegation from payment link:
  - Payment Link already has amount + description
  - Razorpay creates order and delegation with payment link context:
    ```json
    {
      "amount": 499900,
      "currency": "INR",
      "notes": {
        "payment_link_id": "{payment_link_id}",
        "source": "payment_link",
        "description": "{product_description}"
      }
    }
    ```

**Data Available:**
- Merchant name, description, amount
- Customer name (if pre-filled by merchant)
- Limited trust signals (merchant tenure if Razorpay merchant)

**TTL:** Inherits payment link expiry (merchant-set via `expire_by` param; canonical default is 24 hours for delegation use, though payment link defaults to 6 months). Entry C's delegation uses the payment link's own expiry.

**Cashier UI:** N/A (online)

**API Reference:** [Payment Links APIs - Razorpay Docs](https://razorpay.com/docs/payments/payment-links/apis/), [Create Standard Payment Link - Razorpay Docs](https://razorpay.com/docs/api/payments/payment-links/create-standard/)

---

## 3. Razorpay API Grounding

This section maps every system operation to real Razorpay APIs. Existing products are verified and NEW endpoints flagged.

### 3.1 Existing APIs (Already Documented)

#### Orders API
- **Endpoint:** `POST /v1/orders` (create), `GET /v1/orders/{id}` (fetch)
- **Purpose:** Create order with amount, currency, receipt, notes, optional line_items, expire_by
- **Status Lifecycle:** `created` → `attempted` → `paid`
- **Response:** Returns order object with `id`, `amount`, `status`, `expire_by`
- **Documentation:** [Create an Order - Razorpay Docs](https://razorpay.com/docs/api/orders/create/)
- **New Field:** Notes can include `delegation_requestor_id`, `delegation_id`, `source` (web/pos/scanner/payment_link)

#### Payments API
- **Endpoint:** `POST /v1/payments/{id}/capture` (capture), `GET /v1/payments/{id}` (fetch)
- **Purpose:** Capture authorized payment, move to `captured` state
- **Requirement:** Capture within 3 days of payment authorization or refund auto-triggers
- **Response:** Returns payment object with `id`, `status`, `amount_captured`, `method`, `vpa`, `acquirer_data`
- **Documentation:** [Capture a Payment - Razorpay Docs](https://razorpay.com/docs/api/payments/capture/)

#### Payment Links API
- **Endpoint:** `POST /v1/payment_links` (create), `GET /v1/payment_links/{id}` (fetch), `PATCH /v1/payment_links/{id}` (update), `POST /v1/payment_links/{id}/notify_by/{channel}` (resend)
- **Purpose:** Generate shareable payment URL with SMS/email notifications
- **Expiry:** Default 6 months from creation; customizable with `expire_by`
- **Response:** Returns link object with `short_url`, `user_id`, `status`, `amount`, `expire_by`
- **Documentation:** [Payment Links APIs - Razorpay Docs](https://razorpay.com/docs/payments/payment-links/apis/)

#### Checkout SDK
- **Platform:** JavaScript SDK embedded on merchant site
- **Scope:** Renders payment method options (cards, net banking, UPI, wallets, etc.)
- **Configuration:** Payment method order and visibility via `options.method`
- **Documentation:** [Razorpay Checkout SDK - Integration Steps](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
- **New:** Requires button for "Ask Someone to Pay" to be added to method list

#### QR Code API
- **Endpoint:** `POST /v1/qr_codes` (create), `GET /v1/qr_codes` (fetch), `PATCH /v1/qr_codes/{id}` (close)
- **Purpose:** Generate static or dynamic UPI QR codes
- **Dynamic QR:** One-time, non-reusable, includes `url` param for redirect
- **Response:** Returns QR object with `qr_string`, `image_url`, `entity`
- **Documentation:** [QR Code APIs - Razorpay Docs](https://razorpay.com/docs/payments/qr-codes/apis/)

#### Webhooks
- **Supported Events:** `payment.authorized`, `payment.captured`, `order.paid`, `payment.failed`, `payment.refunded`
- **Request:** HTTP POST to configured endpoint with JSON payload
- **Signature Verification:** X-Razorpay-Signature header (HMAC SHA256)
- **Payload Structure:** `event`, `created_at`, `payload` (contains entity details)
- **Documentation:** [Webhooks - Razorpay Docs](https://razorpay.com/docs/webhooks/)
- **New Events (opt-in for merchants):** `order.delegation_requested`, `order.delegation_approved`, `order.delegation_declined`, `order.delegation_expired`. These are emitted for merchants who want to track delegation state in their own UI. Existing merchants who only subscribe to `payment.captured` + `order.paid` need zero code changes — their handlers work unchanged.

#### UPI Intent
- **Mechanism:** Deep link to UPI app (PhonePe, GPay, Paytm) with payment pre-filled
- **Intent Format:** `upi://pay?pa=VPA&pn=NAME&am=AMOUNT&tr=TXNREF&tn=NOTE`
- **Platform Support:** Mobile (Android/iOS) — desktop shows QR fallback automatically
- **Documentation:** [UPI Intent - Razorpay Docs](https://razorpay.com/docs/payments/payment-methods/upi/upi-intent/)

#### Ezetap POS
- **Ownership:** Razorpay-owned subsidiary (acquired 2022)
- **Terminal APIs:** Initialize SDK, invoke payment via universal `pay()` API
- **Integration:** Server-to-server calls to Razorpay API from terminal backend
- **Status Display:** Terminal firmware shows transaction status in real-time
- **Documentation:** [Razorpay POS Integration](https://corp.ezetap.com/), [Razorpay POS Android SDK - GitHub](https://github.com/AtifQEzetap/razorpay-pos-payment-sdk)

#### POP (Consumer UPI App)
- **Investment:** $30 million by Razorpay (2024)
- **Scanner Capability:** Built-in QR scanner in POP app to scan static/dynamic merchant QRs
- **Merchant Lookup:** VPA parsing + Razorpay merchant registry check
- **Integration:** Deeplinks from POP app to Razorpay hosted pages
- **Status:** 1M+ monthly active users, 13.6M transactions/month as of May 2025
- **Source:** [Razorpay Invests $30 Million in POP](https://www.angelone.in/news/market-updates/razorpay-invests-30-million-in-pop-enters-consumer-upi-segment)

---

### 3.2 New APIs & Surfaces Required

#### Delegations API (NEW)

**Endpoint 1: Create Delegation**
```
POST /v1/delegations
Authorization: Basic {api_key}:{api_secret}

{
  "order_id": "order_5Oy8aAijPWzDHu",
  "requestor_id": "priya_123",
  "requestor_contact": "+919876543210",
  "approver_contact": "+919876543211",
  "message": "please buy me headphones",
  "ttl_seconds": 86400
}

Response:
{
  "id": "deleg_abc123xyz",
  "order_id": "order_5Oy8aAijPWzDHu",
  "status": "PENDING",
  "requestor_id": "priya_123",
  "approver_contact": "+919876543211",
  "created_at": 1681234567,
  "expires_at": 1681320967
}
```

**Endpoint 2: Get Delegation Status**
```
GET /v1/delegations/{delegation_id}

Response:
{
  "id": "deleg_abc123xyz",
  "status": "APPROVED",
  "order_id": "order_5Oy8aAijPWzDHu",
  "payment_id": "pay_xyz789abc",
  "approver_payment_method": "upi",
  "approver_vpa": "rajesh@hdfc"
}
```

**Endpoint 3: Decline Delegation**
```
POST /v1/delegations/{delegation_id}/decline

Response:
{
  "id": "deleg_abc123xyz",
  "status": "DECLINED",
  "declined_at": 1681234600,
  "reason": "requestor_provided"
}
```

**Endpoint 4: Resend Delegation (WhatsApp/SMS)**
```
POST /v1/delegations/{delegation_id}/resend
{
  "channels": ["whatsapp", "sms"]
}

Response: { success: true }
```

**Endpoint 5: Re-delegate (Pick New Approver)**
```
POST /v1/delegations/{delegation_id}/redelegate
{
  "new_approver_contact": "+919876543212"
}

Response:
{
  "new_delegation_id": "deleg_new456def",
  "status": "PENDING"
}
```

#### Hosted Landing Pages (NEW)

**URL: `https://rzp.io/r/{delegation_id}` — Approver Payment Page**
- Hosted by Razorpay
- Shows: merchant branding, order context, trust panel, payment methods
- Rendered server-side with OG metadata for link previews (WhatsApp)
- Calls delegation status endpoint to check payment progress
- On payment success: shows confirmation + order tracking
- On decline: shows decline confirmation + requestor notification

**URL: `https://rzp.io/q/{merchant_id}/{order_id}` — Dynamic QR Landing (POS)**
- Hosted by Razorpay
- Shows: amount, merchant name, "Pay Now" button, "Ask Someone to Pay" button
- For this flow to work, dynamic QRs would need to resolve to this landing page rather than to direct `upi://` deeplinks

#### New Webhook Events (NEW — opt-in for merchants)

> These four events document delegation lifecycle state. They are **opt-in**: merchants subscribe only if they want to surface delegation progress in their own order dashboard or UI. Merchants who only subscribe to the existing `payment.captured` + `order.paid` events need zero integration changes — their handlers work unchanged and the order still settles via those standard events. The payloads below are for merchants who choose to consume them.

**Event: `order.delegation_requested`**
```json
{
  "event": "order.delegation_requested",
  "created_at": 1681234567,
  "payload": {
    "order": {
      "id": "order_5Oy8aAijPWzDHu",
      "status": "created"
    },
    "delegation": {
      "id": "deleg_abc123xyz",
      "requestor_id": "priya_123",
      "approver_contact": "+919876543211",
      "status": "PENDING"
    }
  }
}
```

**Event: `order.delegation_approved`**
```json
{
  "event": "order.delegation_approved",
  "created_at": 1681234650,
  "payload": {
    "order": {
      "id": "order_5Oy8aAijPWzDHu",
      "status": "attempted"
    },
    "delegation": {
      "id": "deleg_abc123xyz",
      "status": "APPROVED",
      "approved_at": 1681234650
    },
    "payment": {
      "id": "pay_xyz789abc"
    }
  }
}
```

**Event: `order.delegation_declined`**
```json
{
  "event": "order.delegation_declined",
  "created_at": 1681234700,
  "payload": {
    "delegation": {
      "id": "deleg_abc123xyz",
      "status": "DECLINED",
      "declined_at": 1681234700
    }
  }
}
```

**Event: `order.delegation_expired`**
```json
{
  "event": "order.delegation_expired",
  "created_at": 1681320970,
  "payload": {
    "delegation": {
      "id": "deleg_abc123xyz",
      "status": "EXPIRED",
      "expired_at": 1681320970
    }
  }
}
```

---

## 4. Data Available Per Entry Point × Merchant Tier

The trust panel and share message quality varies by entry point and merchant tier. This table shows what's knowable.

| **Data Point** | **Tier 1: Enterprise (Line Items)** | **Tier 2: Standard Razorpay** | **Tier 3: New/Small Razorpay** |
|---|---|---|---|
| **Entry Points** | Checkout SDK (web/app) | POS, Link | Checkout, POS, Link |
| **Example** | Major e-commerce | Mid-size D2C | New marketplace, small Razorpay merchants |
| **Merchant Name** | ✓ Full | ✓ Full | ✓ Full |
| **Merchant Logo** | ✓ Full color | ✓ Full color | ✓ B/W or basic |
| **Merchant Rating** | ✓ (4.8/5) | ✓ (3.5+) | ⚠ If available |
| **Review Count** | ✓ (1000+) | ✓ (50+) | ⚠ If available |
| **MCC** | ✓ Verified | ✓ Verified | ✓ Verified |
| **Tenure** | ✓ 5+ years | ✓ 1-5 years | ⚠ <1 year |
| **Dispute Rate** | ✓ <0.1% | ✓ <1% | ⚠ <5% |
| **Line Items** | ✓ Full details | ✗ Not passed | ✗ Not passed |
| **Item Description** | ✓ Product name | ✗ Amount only | ✗ Amount only |
| **Trust Panel** | Full signals | Partial signals | Minimal signals |

**Tier 4 (low-trust overlay):** Any merchant flagged `risk_flagged` OR `tenure < 30 days` OR unverified — regardless of line-items / MCC availability — gets a T4 caution overlay on the approver page and a warning prefix on the outgoing message (see [MESSAGE_TEMPLATES.md](MESSAGE_TEMPLATES.md) §T4). T4 is an overlay, not a row in the table above; the base template is still chosen by data availability.

Tier assignment is server-side and advisory; see [ARCHITECTURE.md](ARCHITECTURE.md) for the exact computation (`assignTrustTier()` in `src/backend/db.js`).

**Trust Panel Rendering:**

- **Tier 1 & 2:** Show rating, review count, tenure, dispute rate in hero section
- **Tier 3:** Show tenure only; omit ratings if <50 reviews
- **Tier 4:** Caution copy ("review carefully") replaces positive-signal hero; warning reason code surfaced (e.g., `recent merchant`)

---

## 5. Order Lifecycle + Delegation State Machine

### 5.1 Order States (Razorpay Standard)

- **`created`** → Order created, awaiting payment
- **`attempted`** → Payment initiated (could be direct or via delegation)
- **`paid`** → Payment captured successfully
- **`expired`** → Order TTL exceeded without payment

**New Delegation Substates for `attempted`:**

- **`attempted.pending_delegation`** → Payment method = delegation, awaiting approver decision
- **`attempted.delegation_approved`** → Approver approved, payment authorized (before capture)
- **`attempted.delegation_declined`** → Approver declined, order reverts to `created`

### 5.2 Delegation States

```
┌─────────┐
│ PENDING │  (Awaiting approver response)
└────┬────┘
     │
     ├──→ APPROVED ──→ (payment authorized) ──→ CAPTURED
     │       (transition to order.attempted.delegation_approved)
     │
     ├──→ DECLINED
     │       (order reverts to created, requestor can re-delegate)
     │
     └──→ EXPIRED (TTL exceeded)
             (order reverts to created, requestor can re-delegate)
```

**State Transitions:**

| From | To | Trigger | Webhook |
|---|---|---|---|
| PENDING | APPROVED | Approver submits payment, Razorpay authorizes | `order.delegation_approved` |
| PENDING | DECLINED | Approver clicks "Decline" button | `order.delegation_declined` |
| PENDING | EXPIRED | TTL exceeded without approver response | `order.delegation_expired` |
| APPROVED | CAPTURED | Payment capture succeeds (auto or manual) | `payment.captured`, `order.paid` |

---

## 6. Share/Handover Mechanics

The share flow is the critical conversion step. This is where requestor → approver handoff happens.

### 6.1 Share Sheet

**Trigger:** After delegation created, frontend invokes OS-level share sheet. The `text` passed to `navigator.share` is the server-rendered outgoing message (preamble + system block) defined in [MESSAGE_TEMPLATES.md](MESSAGE_TEMPLATES.md); `url` is the canonical `https://rzp.io/r/{delegation_id}`.

**UI:** Native share sheet (iOS/Android) or web fallback (copy link button)

### 6.2 Default Channels: WhatsApp + SMS

**Both channels enabled by default.** Requestor can toggle either off:

```
☑ Send via WhatsApp
☑ Send via SMS
☐ Telegram (future)

[Cancel] [Send]
```

### 6.3 WhatsApp & SMS Message Bodies

See [MESSAGE_TEMPLATES.md](MESSAGE_TEMPLATES.md) for the authoritative template structure (preamble + tamper-proof system block, per-tier variants, anti-spoofing rules, and OG preview metadata). PAYMENT_FLOW_MECHANICS does not redefine those templates.

**Character budget:** the full outgoing message is engineered to fit 2 GSM-7 segments (~306 chars) for English; 1 UCS-2 segment (70 chars) is reserved for future localised variants. Preamble is hard-capped at 140 chars (HTTP 400 if exceeded).

### 6.4 Deduplication

Once approver taps the link and **completes payment**, both WhatsApp and SMS links show **"already paid"** status:

```
https://rzp.io/r/deleg_abc123xyz?status=paid

Shows to subsequent tapers:
"This payment request has already been approved and paid.
Order #ORD123 is processing."
```

### 6.5 "Let Razorpay Send It" Fallback

If requestor doesn't want to send via personal WhatsApp/SMS:

```
[Send via WhatsApp/SMS myself] [Let Razorpay send it]
```

**If "Let Razorpay send it":**
- Razorpay sends SMS + WhatsApp Business API from verified Razorpay sender
- No personal contact info exposed
- Pre-filled message: "{requester_name} asked Razorpay to notify you of a payment request..."
- Approver can tap link or decline

---

## 7. Edge Cases

### Edge Case 1: Approver Declines
**Flow:**
- Approver clicks "Decline" on rzp.io/r/{id}
- Delegation status → `DECLINED`
- Order status → reverts to `created`
- Webhook: `order.delegation_declined` fires to merchant
- Requestor notification: SMS/email "Rajesh declined your payment request. You can ask someone else or pay directly."
- Requestor can click "Ask Someone Else" → `POST /v1/delegations/{id}/redelegate` with new approver phone

### Edge Case 2: Delegation Expires (TTL Exceeded)
**Flow:**
- TTL timer reaches 0 (24h for Checkout, 15m for POS/Scanner)
- Delegation status → `EXPIRED`
- Order status → reverts to `created`
- Webhook: `order.delegation_expired` fires
- Requestor notification: "Your payment request expired. Try again or pay directly."
- Requestor can re-delegate with new TTL: `POST /v1/delegations` (new delegation record)

### Edge Case 3: Approver Taps Link After Expiry
**Flow:**
- User taps `rzp.io/r/{id}`, delegation already `EXPIRED`
- Landing page shows: "This request has expired. Ask Priya to send a new request."
- No payment flow opens

### Edge Case 4: Duplicate Payments (Both Channels Tapped)
**Flow:**
- Approver taps WhatsApp link → enters payment details → payment authorizes
- Approver (confused or accidental) taps SMS link while payment is processing
- Second tap lands on `rzp.io/r/{id}?status=processing`
- Page shows: "A payment is already in progress for this request. Please wait..."
- Second tap is a no-op; first payment completes

### Edge Case 5: Requestor Cancels Before Approver Pays
**Flow:**
- Priya clicks "Cancel Request" on her waiting page
- Frontend calls `POST /v1/delegations/{id}/decline` (requestor self-decline)
- Delegation → `DECLINED`
- If Rajesh taps link afterwards: "This request was cancelled. Contact Priya."

### Edge Case 6: Payment Fails Mid-Flow
**Flow:**
- Rajesh selects UPI Intent → PhonePe app opens with pre-fill
- Rajesh closes PhonePe without confirming → payment auth fails
- Razorpay webhook: `payment.failed` (status `failed`)
- Order status remains `attempted`
- Delegation status remains `PENDING`
- Rajesh can retry: tap link again, select different payment method
- Requestor sees: "Awaiting approval from Rajesh" (still pending)

### Edge Case 7: Payment Link with Incorrect Amount
**Flow:**
- Requestor creates payment link for ₹500 but manually enters delegation amount ₹4,999
- Razorpay creates delegation with ₹4,999 but shows warning: "Verify amount with merchant"
- Share message: "Confirm amount ₹4,999 before paying."
- Approver sees landing page with amount; can proceed or decline

### Edge Case 8: Requestor Account Suspended
**Flow:**
- Priya's account flagged for suspicious activity
- Priya tries to initiate delegation
- API returns 403: "Your account is under review. Delegation unavailable."
- Priya directed to customer support
- Delegation flow blocked until review complete

---

## 8. Out of Scope for v1

The following are explicitly NOT supported in v1:

- **Scanning non-Razorpay static QRs in PhonePe/GPay directly** — Razorpay doesn't own that surface. Customers would need to use the Razorpay consumer scanner (POP app or rzp.io/scan).
- **Recurring/Mandate delegation** — Different legal model (NPCI mandate rules differ from one-time). Future feature.
- **International/NRI approvers** — India-only (UPI, NPCI compliance). International support requires cross-border payment infrastructure.
- **Approver reputation/trust scores** — Only merchant trust signals supported; not requestor-approver relationship scoring.
- **Approval workflows (multi-approver, conditional approval)** — Single approver only in v1.
- **Auto-approval by trust policy** — All delegations require explicit approver action.
- **Bulk delegation to groups** — One-to-one only; no group payments.
- **Pledge/IOUs (pay later delegation)** — Payment must happen within TTL; no deferred settlement.

---

## 9. Data Model

This section is the spec-level schema shape. For what's actually implemented in the prototype (tables, indexes, the single-open constraint, `assignTrustTier()` location), see [ARCHITECTURE.md](ARCHITECTURE.md).

### 9.1 Delegations Table

```sql
CREATE TABLE delegations (
  id VARCHAR(32) PRIMARY KEY,           -- deleg_abc123xyz
  order_id VARCHAR(32) NOT NULL,        -- Foreign key to orders
  requestor_id VARCHAR(64),             -- Merchant-provided customer ID
  requestor_contact VARCHAR(20),        -- +919876543210
  approver_contact VARCHAR(20) NOT NULL, -- +919876543211
  message TEXT,                         -- "please buy me headphones"
  status ENUM(PENDING, APPROVED, DECLINED, EXPIRED, CAPTURED),
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  approved_at BIGINT,
  declined_at BIGINT,
  expired_at BIGINT,
  payment_id VARCHAR(32),               -- Foreign key to payments (if approved)
  approver_vpa VARCHAR(64),             -- rajesh@hdfc (after payment)
  approver_payment_method VARCHAR(32),  -- upi, card, netbanking
  ttl_seconds INT DEFAULT 86400,
  entry_point VARCHAR(32),              -- checkout_sdk, pos_qr, static_qr, payment_link
  metadata JSON
);
```

### 9.2 Orders Table Extensions

**New columns (not in current Razorpay Orders):**

```sql
ALTER TABLE orders ADD COLUMN (
  delegation_id VARCHAR(32),            -- Current active delegation (if any)
  delegation_status VARCHAR(32),        -- PENDING, APPROVED, etc.
  entry_point VARCHAR(32),              -- checkout_sdk, pos_qr, static_qr, payment_link
  line_items JSON                       -- [{item_code, description, amount, quantity}, ...]
);
```

### 9.3 Payments Table Extensions

**New columns:**

```sql
ALTER TABLE payments ADD COLUMN (
  delegation_id VARCHAR(32),            -- Foreign key to delegations
  delegation_requestor_id VARCHAR(64),  -- Who asked for payment
  is_delegation BOOLEAN DEFAULT FALSE   -- Flag to identify delegation payments
);
```

---

## 10. Security & Compliance

### 10.1 NPCI Merchant-Facilitated Model

**Regulatory Requirement:** "Ask Others to Pay" routes through merchant, not P2P.

**Flow Compliance:**
1. Requestor initiates delegation **via merchant** (not direct to approver)
2. Razorpay generates link → approver clicks
3. Approver pays **to Razorpay** (not requestor)
4. Razorpay pays merchant (settlement flow)
5. Merchant fulfills order (goods/services to requestor)

**Not P2P because:** Merchant is integral to the flow; payment is for goods/services, not cash transfer.

**NPCI Guidance:** Compliance thesis; pending NPCI confirmation. The argument is that merchant-anchored delegation is not P2P collect (Oct 2025 ban applies to P2P Collect requests; merchant-facilitated collect is still allowed). Final clearance requires NPCI confirmation and Razorpay legal review.

### 10.2 Two-Factor Authentication (2FA)

**Approver Identity Verification:**
- SMS OTP to approver's phone (standard Razorpay payment flow)
- UPI app PIN/biometric (if using UPI Intent)
- No additional 2FA required for delegation itself (piggyback on payment 2FA)

### 10.3 PII Handling

**Data Minimization:**
- Only phone numbers stored for contact, not names (requestor/approver names are optional metadata)
- Approver never sees requestor's full details (no email, address exposure)
- Requestor doesn't see approver's VPA until payment completes

**Data Retention:**
- Delegations records retained for 180 days (audit trail)
- Share messages (SMS/WhatsApp) deleted after 30 days (logs only)
- Payment receipts retained per Razorpay policy (7 years for compliance)

**Data Exposure Vectors:**
- rzp.io/r/{id} landing page: Only person with link can see order context
- Webhook payloads: Merchant receives requestor_id + delegation_id (design intent: merchant fulfills to correct customer)
- Share message: Only approver receives message; link is secret token (not guessable)

### 10.4 Fraud Prevention

**Checks Implemented:**

1. **Requestor Velocity:** Max 10 requests per hour, 50 per day per requestor (illustrative defaults)
2. **Approver Velocity:** Max 50 approvals per hour, 200 per day per approver (illustrative defaults)
3. **Amount Limits:** Suggest warning for delegations >₹50,000 (configurable per merchant)
4. **Contact Validation:** SMS OTP to approver phone before creating delegation (optional, per merchant setting)
6. **Duplicate Prevention:** One delegation per order at a time (redelegate creates new delegation)

---

## 11. Unified Flow: Complete Walkthrough with APIs

This section combines all entry points into one canonical trace.

### Scenario: Requestor (e-commerce) → Approver — Product Purchase (Illustrative)

**T=0:00 — Requestor adds to cart, clicks checkout**

```
POST /v1/orders (Merchant backend)
{
  "amount": 499900,
  "currency": "INR",
  "receipt": "croma_ORD_123456",
  "notes": {
    "customer_id": "priya_123",
    "source": "web"
  },
  "line_items": [{
    "item_code": "{item_code}",
    "description": "{product_description}",
    "amount": {amount_paise},
    "quantity": 1
  }]
}

← {order_id}
```

**T=0:30 — Razorpay Checkout SDK renders, Requestor clicks "Ask Someone to Pay"**

```
Checkout shows: UPI, Card, NB, Wallet, [Ask Someone to Pay]
Priya clicks [Ask Someone to Pay]
```

**T=1:00 — Priya enters approver details**

```
Form: Approver phone: "+919876543210"
Form: Message: "please buy me headphones"
Priya clicks [Send Request]

POST /v1/delegations (Merchant backend on behalf of {requester_name})
{
  "order_id": "order_5Oy8aAijPWzDHu",
  "requestor_id": "priya_123",
  "requestor_contact": "+919123456789",
  "approver_contact": "+919876543210",
  "message": "please buy me headphones",
  "ttl_seconds": 86400
}

← deleg_abc123xyz
  status: PENDING
  expires_at: 1681320967 (24h later)
```

**T=1:30 — Delegation created, share sheet opens**

```
Webhook to merchant: order.delegation_requested  [opt-in — delegation lifecycle event; merchants who don't subscribe see nothing until the standard order.paid + payment.captured fire at capture time]
{
  "event": "order.delegation_requested",
  "payload": {
    "delegation": {
      "id": "deleg_abc123xyz",
      "status": "PENDING"
    }
  }
}

Frontend shows:
☑ Send via WhatsApp
☑ Send via SMS
[Cancel] [Send Request]

Priya clicks [Send Request]
```

**T=2:00 — WhatsApp + SMS sent**

```
WhatsApp + SMS body: server-rendered per MESSAGE_TEMPLATES.md
(optional preamble + tamper-proof system block with merchant, amount,
tier-specific context, rzp.io/r/{id} URL, and expiry). No fabricated
salutation, no "From: {name}" line, no requester signature.
```

**T=15:00 — Rajesh taps WhatsApp link**

```
Browser opens: https://rzp.io/r/deleg_abc123xyz

GET /v1/delegations/deleg_abc123xyz (Razorpay frontend)
← status: PENDING

Landing page renders:
┌──────────────────────────────┐
│ {merchant_name} LOGO         │
├──────────────────────────────┤
│ Payment request              │
│ ₹4,999                       │
│                              │
│ {product_description}        │
│                              │
│ Requester's optional note    │
│ (if any): "please buy me     │
│ headphones"                  │
├──────────────────────────────┤
│ Trust Panel (T1):            │
│ ⭐ 4.8/5 (1000+ reviews)     │
│ Merchant since 2015          │
│ <0.1% dispute rate           │
├──────────────────────────────┤
│ [Approve & Pay]  [Decline]   │
└──────────────────────────────┘
(No "From: Priya" line — identity rides the delivery channel. See MESSAGE_TEMPLATES.md.)
```

**T=15:30 — Rajesh clicks "Approve & Pay"**

```
Razorpay Checkout opens with payment methods:
• UPI Intent (pre-selected on mobile)
• Credit Card
• Net Banking
• Wallet

Rajesh selects UPI Intent → Phone deeplink opens PhonePe with pre-fill:
upi://pay?pa={merchant_vpa}&pn={merchant_name}&am={amount_paise}&tn=Payment%20for%20{requester_name}&tr={order_id}
```

**T=16:00 — Rajesh enters UPI PIN in PhonePe**

```
PhonePe shows:
Paying ₹{amount} to {merchant_name}
For: Payment for Priya

Rajesh enters UPI PIN → Bank authorizes payment
```

**T=16:30 — Payment captured, webhooks fire**

```
Razorpay captures payment:
POST /v1/payments/{payment_id}/capture
← status: captured

Webhooks to merchant endpoint (standard events 1 & 3 are required and match
existing Razorpay handlers — zero code change; event 2 is opt-in for merchants
who want delegation-state visibility):

1) payment.captured  [standard — existing handler works unchanged]
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "id": "pay_xyz789abc",
      "order_id": "order_5Oy8aAijPWzDHu",
      "status": "captured",
      "amount": 499900,
      "vpa": "rajesh@hdfc"
    }
  }
}

2) order.delegation_approved  [opt-in — delegation lifecycle event]
{
  "event": "order.delegation_approved",
  "payload": {
    "delegation": {
      "id": "deleg_abc123xyz",
      "status": "APPROVED"
    }
  }
}

3) order.paid  [standard — existing handler works unchanged]
{
  "event": "order.paid",
  "payload": {
    "order": {
      "id": "order_5Oy8aAijPWzDHu",
      "status": "paid",
      "notes": {
        "delegation_requestor_id": "priya_123",
        "delegation_id": "deleg_abc123xyz"
      }
    }
  }
}
```

**T=17:00 — Merchant fulfills order**

```
Merchant backend receives webhook, queries order:
GET /v1/orders/order_5Oy8aAijPWzDHu
← status: paid

Merchant initiates fulfillment:
1. Pick {product_description} from warehouse
2. Ship to {requester_name}'s address
3. Send SMS: "Your order #{order_id} has shipped"
```

**T=17:30 — Both see confirmation**

```
Priya's browser (was polling /delegation-status):
✓ Payment Successful!
Rajesh paid ₹4,999 for your headphones.
Order #ORD123 confirmed.
[Track Order] [Continue Shopping]

Rajesh's browser:
✓ Payment Approved!
Your ₹4,999 payment for Priya's purchase has been confirmed.
Order #ORD123 is processing.
[Download Receipt]

If Rajesh taps SMS link again:
✓ Already Paid
This payment request has already been approved and paid.
Order #ORD123 is processing.
```

---

## References & Documentation

### Razorpay Official Documentation

- [Orders API - Create](https://razorpay.com/docs/api/orders/create/)
- [Payments API - Capture](https://razorpay.com/docs/api/payments/capture/)
- [Payment Links APIs](https://razorpay.com/docs/payments/payment-links/apis/)
- [QR Code APIs](https://razorpay.com/docs/payments/qr-codes/apis/)
- [Checkout SDK - Integration Steps](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
- [UPI Intent](https://razorpay.com/docs/payments/payment-methods/upi/upi-intent/)
- [Webhooks](https://razorpay.com/docs/webhooks/)

### Razorpay Products

- [Razorpay POS (Ezetap)](https://corp.ezetap.com/)
- [POP Consumer UPI Investment](https://www.angelone.in/news/market-updates/razorpay-invests-30-million-in-pop-enters-consumer-upi-segment)

### Regulatory

- NPCI UPI Regulations (merchant-facilitated, Oct 2025 P2P collect ban)

---

**Document Version:** 2.0 — Unified Flow Architecture
**Last Updated:** April 2026
**Status:** Proposal — pending Razorpay legal review and NPCI confirmation
