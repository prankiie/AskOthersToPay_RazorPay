# User Flows — Demo Walkthrough

This document walks through the five scenarios in the demo, step by step. It reflects exactly what the code does, not a speculative design.

For the technical mechanics (state machine, API shape, TTLs), see [PAYMENT_FLOW_MECHANICS.md](PAYMENT_FLOW_MECHANICS.md). This doc is the product-narrative companion.

---

## Shared flow across all scenarios

Every scenario walks the same five-step journey. Only the entry surface, merchant, amount, and advisory tier differ.

1. **Entry** — the requestor reaches a Razorpay payment surface (Checkout, POS QR, or Payment Link) and sees "Ask Someone to Pay" alongside the usual pay buttons.
2. **Compose** — the requestor fills in the approver's phone, optionally their name, and an optional 140-char message. WhatsApp + SMS are both on by default.
3. **Share / Preview** — the requestor sees what their approver will receive: a WhatsApp-style preview with the preamble + tamper-proof system block (merchant, amount, verified badge where applicable, approval URL, expiry).
4. **Approver page** — the approver opens `rzp.io/r/{delegation_id}`, sees the merchant trust panel (tier-adaptive), reads the note, picks a payment method, pays.
5. **Status** — the result screen shows the outcome and the webhook events the merchant received.

The "Under the Hood" developer panel on every step shows the API call, state transition, and webhook events for that moment. Open it during the demo to make the architecture visible.

---

## Scenario 1 — Priya asks Dad to pay for headphones

**Entry:** A (Web Checkout)  **Advisory tier:** T1 — Very strong support  **Amount:** ₹4,999 at Croma Electronics

Priya is on Croma's checkout page for a pair of Sony WH-CH720N wireless headphones. Her own UPI has failed twice. Instead of trying a third time, she taps "Ask Someone to Pay." She picks her father from her contacts, leaves the default message, and hits share.

Rajesh receives the link on WhatsApp. The system block shows `Amount: ₹4,999`, `Merchant: Croma Electronics ✓ Verified`, `For: Sony WH-CH720N Wireless Headphones`, the `rzp.io/r/{id}` link, and the expiry. He opens it, sees the T1 "Very strong support" panel — full KYC badge, category, tenure on Razorpay, the line items — and pays via UPI. Croma receives `payment.captured` and `order.paid`. Done.

**What this demonstrates:** The full T1 flow where Razorpay has all the information — line items from the order, KYC verification, tenure. The approver gets the richest trust context available.

---

## Scenario 2 — Meera asks husband to pay the restaurant bill

**Entry:** B (POS Dynamic QR)  **Advisory tier:** T2 — Strong support  **Amount:** ₹2,400 at The Bombay Canteen

Meera is at The Bombay Canteen with a friend. The bill comes. She scans the QR from the POS soundbox. Instead of opening her UPI app, the scan opens `rzp.io/q/{merchant_id}/{order_id}` — a Razorpay-hosted landing page with the bill amount pre-filled. She taps "Ask Someone to Pay" and sends the link to her husband.

Arjun receives the link on WhatsApp, opens it, sees the T2 "Strong support" panel (merchant name, category, KYC verified, tenure on Razorpay), and pays via UPI. The restaurant's POS closes the bill.

**What this demonstrates:** Entry B pattern — the QR payload opens a Razorpay page, not a direct UPI URI. This is the dependency on QR platform behaviour (flagged in the exec summary). It also shows T2, where the trust panel has category and tenure but not itemized order data.

---

## Scenario 3 — Rohan asks Mom at the kirana store

**Entry:** B (POS Static QR — concept)  **Advisory tier:** T3 — Neutral  **Amount:** customer-entered, ~₹850 at Sharma General Store

Rohan is at his neighbourhood kirana store buying groceries. The store has a printed static QR (no per-transaction amount). He scans, lands on the Razorpay page, types in ₹850, and taps "Ask Someone to Pay." He picks his mother.

Sunita receives the link, opens it, sees the T3 "Neutral" panel — merchant name and status, no richer data because Sharma General Store is a small merchant without KYC depth — and pays.

**What this demonstrates:** T3, where Razorpay has verified the merchant but doesn't have category, tenure, or itemized data. The advisory gradient drops from "strong" to "neutral" because Razorpay isn't hiding anything, just honest about how much it can vouch for. The UI notes this is a concept — a real static QR amount path would need the landing page to create an order before delegation.

---

## Scenario 4 — Accountant forwards invoice to CFO

**Entry:** C (Payment Link)  **Advisory tier:** T1 — Very strong support  **Amount:** ₹17,700 at Zoho Corporation

Anita, an accountant, receives a Razorpay Payment Link from Zoho for the monthly invoice. Instead of paying from her own account, she taps "Ask Someone to Pay" on the payment link page, enters her CFO's phone, and shares.

Suresh (CFO) opens the link, sees Zoho's T1 trust panel (KYC verified enterprise, category, multi-year tenure), and pays via netbanking. Zoho's accounts receivable sees the payment settle.

**What this demonstrates:** Entry C pattern — Payment Links are already URL-shareable, so the "Ask Someone" button is a clean addition. Also demonstrates the B2B use case — this isn't just about family payments.

---

## Scenario 5 — T4: Caution advised

**Entry:** A (Web Checkout)  **Advisory tier:** T4 — Caution advised  **Amount:** ₹12,999 at QuickDeals Online

Vikram initiates a delegation at QuickDeals Online for a phone. When his mother opens the approval link, Razorpay's trust panel shows the **T4 advisory**: Razorpay has limited information to share about this merchant right now, and she should check with Vikram before paying. She can still pay if she chooses — but the panel is honest about the confidence level.

**What this demonstrates:** The advisory gradient at its lowest tier. Eligibility to initiate a delegation is gated upstream — merchants must be verified and meet tenure minimums. T4 is the advisory level when a merchant that passed eligibility has less corroborating data, or when trust signals shift during an in-flight delegation. The approver is trusted to make the call with complete information.

---

## Common edge cases the demo handles

- **Decline** — on any scenario's approver page, tap "Decline." The approver can add a reason. Status moves to `declined`, the merchant receives `order.delegation_declined`, and the order status reverts to `created`.
- **Redelegate** — a declined or expired delegation can spawn a new one for a different approver (API supports this; UI adds it on request).
- **One open delegation per order** — DB-level unique constraint. Trying to create a second open delegation for the same order returns `409 ORDER_HAS_OPEN_DELEGATION`.
- **Expiry** — delegations have a TTL (24h for web entries, 15min for POS, inherits the link's expiry for payment links). Expired delegations can't be opened or paid; merchant receives `order.delegation_expired`.

## What to watch during the demo

- The **step indicator** at top (Entry → Compose → Share → Pay → Done) shows where you are.
- The **"Under the Hood"** developer panel shows the API call, state transition, and context for each step. Open it to see the wiring.
- The **Webhook Log** at the bottom shows each webhook the merchant would receive, in order, with its full JSON payload.
- The **Back button** next to "All scenarios" lets you step back through the journey. The merchant and approver pages are all demonstrable without losing state.
