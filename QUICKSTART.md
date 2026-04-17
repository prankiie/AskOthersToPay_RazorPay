# Quick Start — Ask Others to Pay Demo

## Setup

```bash
git clone https://github.com/prankiie/AskOthersToPay_RazorPay.git
cd AskOthersToPay_RazorPay
npm install
(cd src/backend && npm install)

# Terminal 1: backend
npm run server    # runs on localhost:3001

# Terminal 2: frontend
npm run dev       # runs on localhost:5173
```

## Demo walkthrough

The launcher shows 5 scenarios. Each walks the full delegation journey.

### Scenarios

| # | Scenario | Entry | Trust Tier |
|---|----------|-------|------------|
| 1 | Priya asks Dad to pay for headphones | A: Web Checkout | T1 (enterprise) |
| 2 | Meera asks husband to pay restaurant bill | B: POS Dynamic QR | T2 (standard) |
| 3 | Rohan asks Mom at kirana store | B: POS Static QR (concept) | T3 (basic) |
| 4 | Accountant forwards invoice to CFO | C: Payment Link | T2 (standard) |
| 5 | Low-trust merchant warning | A: Web Checkout | T4 (warning) |

### Journey steps (same for all scenarios)

1. **Entry page** — Simulates the Razorpay payment surface (Checkout, QR landing, or Payment Link). Tap "Ask Someone to Pay".
2. **Compose** — Pick approver, write a message (max 140 chars, sanitized server-side). Choose WhatsApp + SMS.
3. **WhatsApp preview** — See what the approver receives: preamble + tamper-proof system block with amount, merchant, verification, expiry.
4. **Approver page** — Trust panel adapts by tier (T1 shows line items + KYC badge; T4 shows warning banner). Pick payment method, pay.
5. **Status** — Result + webhook events the merchant received (`payment.captured`, `order.paid`).

### What to look for

- **Trust tier differences**: Compare scenario 1 (T1: full details) with scenario 5 (T4: yellow warning)
- **Webhook log**: Fixed panel at bottom shows merchant webhook events in real time
- **Under the Hood**: Developer panel shows API calls, state transitions, and context at each step
- **Executive Summary**: Collapsible panel on the launcher page — the one-page pitch

## File structure

```
src/
├── App.jsx                     # Scenario launcher ↔ demo flow router
├── api.js                      # HTTP client for backend
├── theme.js                    # Razorpay color palette
└── components/
    ├── ScenarioLauncher.jsx    # Landing page with 5 scenario cards + exec summary
    ├── DemoFlow.jsx            # Step orchestrator (entry → compose → preview → approver → status)
    ├── EntryCheckout.jsx       # Entry A: merchant checkout simulation
    ├── EntryQRLanding.jsx      # Entry B: QR landing page (dynamic + static concept)
    ├── EntryPaymentLink.jsx    # Entry C: payment link page
    ├── DelegationCompose.jsx   # Compose delegation form
    ├── WhatsAppPreview.jsx     # Message preview (preamble + system block)
    ├── ApproverPage.jsx        # Approval page with trust panel + payment method
    ├── TrustPanel.jsx          # Tier-adaptive trust display (T1-T4)
    ├── StatusPage.jsx          # Result + webhook events
    ├── HandshakePanel.jsx      # Developer "Under the Hood" context
    └── WebhookLog.jsx          # Live webhook event log

src/backend/
├── server.js                   # Express app (port 3001)
├── db.js                       # SQLite schema + seed data + trust tier logic
├── routes/
│   ├── delegation.js           # Core delegation API (9 endpoints)
│   ├── scenarios.js            # Demo scenario data
│   └── webhooks.js             # Webhook event inspection
└── services/
    └── delegationMessageService.js  # Anti-spoofing message generation
```

## Notes

- **Static QR (scenario 3)**: The custom amount input is a UI concept. In production, a static QR scan would need to create an order before delegation. The demo uses a pre-seeded order.
- **Backend resets**: Each scenario resets its state when selected. You can replay scenarios cleanly.
- **SQLite**: Database is in-memory at `/tmp/askotherstopay_demo.db`. Restart backend to reset all data.
