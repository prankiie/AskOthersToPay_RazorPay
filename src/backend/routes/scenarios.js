const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

/**
 * GET /v1/scenarios
 *
 * Returns the 5 demo scenarios with all context needed to drive the frontend.
 * Each scenario includes: order, merchant, entry point details, and story context.
 */
router.get('/scenarios', (_req, res) => {
  const db = getDb();

  try {
    const scenarios = [
      buildScenario(db, {
        id: 'daughter_asks_dad',
        title: 'Priya asks Dad to pay for headphones',
        subtitle: 'Daughter buying electronics online, asks father to pay',
        entry_point: 'A',
        entry_label: 'Web Checkout (Razorpay Checkout SDK)',
        order_id: 'order_PRIYA_HP',
        requestor: { name: 'Priya Sharma', phone: '+919876543210' },
        approver: { name: 'Rajesh Sharma', phone: '+919876543211', relation: 'Father' },
        default_preamble: 'Papa, can you please pay for these headphones? Need them for college.',
      }),

      buildScenario(db, {
        id: 'wife_asks_husband',
        title: 'Meera asks husband to pay restaurant bill',
        subtitle: 'Wife at restaurant, scans QR, asks husband to pay',
        entry_point: 'B',
        entry_label: 'POS Dynamic QR (Razorpay-hosted QR Landing \u2014 Concept)',
        order_id: 'order_MEERA_DINNER',
        qr_session_id: 'qr_BOMBAY_DYN',
        requestor: { name: 'Meera Iyer', phone: '+919876543220' },
        approver: { name: 'Arjun Iyer', phone: '+919876543221', relation: 'Husband' },
        default_preamble: 'Arjun, please pay for dinner. Having a lovely time with Kavya!',
      }),

      buildScenario(db, {
        id: 'son_asks_mom',
        title: 'Rohan asks Mom at kirana store',
        subtitle: 'Son at neighbourhood store, scans static QR, asks mother',
        entry_point: 'B',
        entry_label: 'POS Static QR (Razorpay-hosted QR Landing \u2014 Concept)',
        order_id: 'order_ROHAN_KIRANA',
        qr_session_id: 'qr_SHARMA_STATIC',
        requestor: { name: 'Rohan Kapoor', phone: '+919876543230' },
        approver: { name: 'Sunita Kapoor', phone: '+919876543231', relation: 'Mother' },
        default_preamble: 'Amma, getting groceries for home. Can you pay?',
      }),

      buildScenario(db, {
        id: 'accountant_asks_cfo',
        title: 'Vendor invoice \u2192 CFO approval',
        subtitle: 'Accountant receives invoice link, forwards to CFO for payment',
        entry_point: 'C',
        entry_label: 'Payment Link (Merchant Dashboard)',
        order_id: 'order_ZOHO_INVOICE',
        payment_link_id: 'plink_ZOHO_INV',
        requestor: { name: 'Anita Desai', phone: '+919876500001', title: 'Accountant' },
        approver: { name: 'Suresh Patel', phone: '+919876500002', relation: 'CFO', title: 'CFO, Patel Engineering' },
        default_preamble: 'Suresh sir, Zoho renewal invoice for approval. Due by end of month.',
      }),

      buildScenario(db, {
        id: 'flagged_merchant_warning',
        title: 'T4 \u2014 Caution advised',
        subtitle: 'Limited merchant information \u2014 approver sees a \u201ccaution advised\u201d panel',
        entry_point: 'A',
        entry_label: 'Web Checkout (T4 Caution panel)',
        order_id: 'order_QUICK_PHONE',
        requestor: { name: 'Vikram Patel', phone: '+919876543240' },
        approver: { name: 'Rekha Patel', phone: '+919876543241', relation: 'Mother' },
        default_preamble: 'Mom, found this phone at a great deal. Can you pay?',
      }),
    ];

    res.json({ status: 'ok', count: scenarios.length, data: scenarios });
  } catch (err) {
    console.error('GET /v1/scenarios error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

/**
 * GET /v1/scenarios/:id/reset
 * Reset a scenario's order and delegation state so it can be replayed
 */
router.post('/scenarios/:id/reset', (req, res) => {
  const db = getDb();
  const orderMap = {
    daughter_asks_dad: 'order_PRIYA_HP',
    wife_asks_husband: 'order_MEERA_DINNER',
    son_asks_mom: 'order_ROHAN_KIRANA',
    accountant_asks_cfo: 'order_ZOHO_INVOICE',
    flagged_merchant_warning: 'order_QUICK_PHONE',
  };

  const orderId = orderMap[req.params.id];
  if (!orderId) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Scenario not found' } });
  }

  try {
    // Delete delegations and webhook events for this order
    const delegations = db.prepare('SELECT id FROM delegations WHERE order_id = ?').all(orderId);
    for (const d of delegations) {
      db.prepare('DELETE FROM webhook_events WHERE delegation_id = ?').run(d.id);
    }
    db.prepare('DELETE FROM delegations WHERE order_id = ?').run(orderId);

    // Reset order status
    db.prepare(`UPDATE orders SET status = 'created' WHERE id = ?`).run(orderId);

    res.json({ status: 'ok', message: `Scenario ${req.params.id} reset` });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildScenario(db, config) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(config.order_id);
  const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(order.merchant_id);

  // Parse JSON fields
  let lineItems = null;
  if (order.line_items) {
    try { lineItems = JSON.parse(order.line_items); } catch (e) { /* ignore */ }
  }

  // Check for existing delegation
  const existingDelegation = db.prepare(`
    SELECT * FROM delegations WHERE order_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(config.order_id);

  // Get QR session if applicable
  let qrSession = null;
  if (config.qr_session_id) {
    qrSession = db.prepare('SELECT * FROM qr_sessions WHERE id = ?').get(config.qr_session_id);
  }

  // Get payment link if applicable
  let paymentLink = null;
  if (config.payment_link_id) {
    paymentLink = db.prepare('SELECT * FROM payment_links WHERE id = ?').get(config.payment_link_id);
  }

  // Determine trust tier server-side
  const { assignTrustTier } = require('../db');
  const trustTier = assignTrustTier(merchant);

  return {
    id: config.id,
    title: config.title,
    subtitle: config.subtitle,
    entry_point: config.entry_point,
    entry_label: config.entry_label,
    trust_tier: trustTier,
    requestor: config.requestor,
    approver: config.approver,
    default_preamble: config.default_preamble,
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      description: order.description,
      status: order.status,
      line_items: lineItems,
    },
    merchant: {
      id: merchant.id,
      name: merchant.name,
      category: merchant.category,
      mcc_label: merchant.mcc_label,
      kyc_status: merchant.kyc_status,
      risk_flagged: !!merchant.risk_flagged,
      tenure_days: merchant.tenure_days,
    },
    qr_session: qrSession,
    payment_link: paymentLink,
    existing_delegation: existingDelegation ? {
      id: existingDelegation.id,
      state: existingDelegation.state
    } : null,
  };
}

module.exports = router;
