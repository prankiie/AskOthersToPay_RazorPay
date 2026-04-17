const express = require('express');
const router = express.Router();
const { getDb, generateId, assignTrustTier } = require('../db');
const { sanitizePreamble, validatePreamble, generateMessage, formatAmount } = require('../services/delegationMessageService');

// ─── Helpers ───────────────────────────────────────────────────────────────

function fireWebhook(db, delegationId, orderId, eventType, extraPayload = {}) {
  const id = generateId('evt');
  const delegation = db.prepare('SELECT * FROM delegations WHERE id = ?').get(delegationId);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

  const payload = {
    event: eventType,
    created_at: new Date().toISOString(),
    payload: {
      order: { id: orderId, amount: order?.amount, status: order?.status },
      delegation: {
        id: delegationId,
        state: delegation?.state,
        entry_point: delegation?.entry_point,
        trust_tier: delegation?.trust_tier
      },
      ...extraPayload
    }
  };

  db.prepare(`
    INSERT INTO webhook_events (id, delegation_id, order_id, event_type, payload)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, delegationId, orderId, eventType, JSON.stringify(payload));

  return payload;
}

function getDelegationWithContext(db, delegationId) {
  const delegation = db.prepare('SELECT * FROM delegations WHERE id = ?').get(delegationId);
  if (!delegation) return null;

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(delegation.order_id);
  const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(delegation.merchant_id);

  // Parse JSON fields
  if (order?.line_items) order.line_items = JSON.parse(order.line_items);
  if (order?.notes) order.notes = JSON.parse(order.notes);

  // Generate message
  const message = generateMessage(delegation, order, merchant, delegation.requestor_name);

  return { delegation, order, merchant, message };
}

// Check and expire stale delegations
function expireIfNeeded(db, delegation) {
  if (!delegation) return delegation;
  if (['created', 'shared', 'opened', 'payment_started'].includes(delegation.state)) {
    if (new Date(delegation.expires_at) < new Date()) {
      db.prepare(`UPDATE delegations SET state = 'expired', expired_at = datetime('now') WHERE id = ?`).run(delegation.id);
      fireWebhook(db, delegation.id, delegation.order_id, 'order.delegation_expired');
      delegation.state = 'expired';
      delegation.expired_at = new Date().toISOString();
    }
  }
  return delegation;
}

// ─── POST /v1/delegations ──────────────────────────────────────────────────
// Create a new delegation on an order

router.post('/delegations', (req, res) => {
  const db = getDb();
  try {
    const {
      order_id,
      approver_phone,
      approver_name = null,
      requestor_name = null,
      requestor_phone = null,
      preamble_text = '',
      entry_point,
      channel_whatsapp = true,
      channel_sms = true,
      ttl_seconds
    } = req.body;

    // Validate required fields
    if (!order_id || !approver_phone || !entry_point) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', description: 'Required: order_id, approver_phone, entry_point (A|B|C)' }
      });
    }
    if (!['A', 'B', 'C'].includes(entry_point)) {
      return res.status(400).json({
        error: { code: 'INVALID_ENTRY_POINT', description: 'entry_point must be A, B, or C' }
      });
    }

    // Validate preamble
    const pv = validatePreamble(preamble_text);
    if (!pv.valid) {
      return res.status(400).json({ error: { code: 'INVALID_PREAMBLE', description: pv.error } });
    }

    // Fetch order
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id);
    if (!order) {
      return res.status(404).json({ error: { code: 'ORDER_NOT_FOUND', description: `Order ${order_id} not found` } });
    }

    // Fetch merchant
    const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(order.merchant_id);
    if (!merchant) {
      return res.status(404).json({ error: { code: 'MERCHANT_NOT_FOUND', description: 'Merchant not found' } });
    }

    // Enforce one open delegation per order
    const existing = db.prepare(`
      SELECT id FROM delegations
      WHERE order_id = ? AND state IN ('created', 'shared', 'opened', 'payment_started')
    `).get(order_id);
    if (existing) {
      return res.status(409).json({
        error: { code: 'ORDER_HAS_OPEN_DELEGATION', description: `Order already has open delegation: ${existing.id}` }
      });
    }

    // Assign trust tier SERVER-SIDE
    const trust_tier = assignTrustTier(merchant);

    // Determine TTL
    const effectiveTtl = ttl_seconds || (entry_point === 'B' ? 900 : 86400);
    const expiresAt = new Date(Date.now() + effectiveTtl * 1000).toISOString();

    // Sanitize preamble
    const cleanPreamble = sanitizePreamble(preamble_text);

    // Create delegation
    const id = generateId('deleg');
    db.prepare(`
      INSERT INTO delegations (
        id, order_id, merchant_id, entry_point,
        requestor_name, requestor_phone,
        approver_name, approver_phone,
        preamble_text, trust_tier,
        channel_whatsapp, channel_sms,
        state, ttl_seconds, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'created', ?, ?)
    `).run(
      id, order_id, merchant.id, entry_point,
      requestor_name, requestor_phone,
      approver_name, approver_phone,
      cleanPreamble, trust_tier,
      channel_whatsapp ? 1 : 0, channel_sms ? 1 : 0,
      effectiveTtl, expiresAt
    );

    // Fire webhook
    fireWebhook(db, id, order_id, 'order.delegation_requested');

    // Return delegation with context
    const result = getDelegationWithContext(db, id);

    res.status(201).json({ status: 'created', data: result });

  } catch (err) {
    console.error('POST /v1/delegations error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

// ─── GET /v1/delegations/:id ──────────────────────────────────────────────
// Fetch delegation with full context (used by approver page)

router.get('/delegations/:id', (req, res) => {
  const db = getDb();
  try {
    const result = getDelegationWithContext(db, req.params.id);
    if (!result) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Delegation not found' } });
    }

    // Check expiry
    expireIfNeeded(db, result.delegation);

    res.json({ status: 'ok', data: result });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

// ─── POST /v1/delegations/:id/share ────────────────────────────────────────
// Requestor shared the link (state: created -> shared)

router.post('/delegations/:id/share', (req, res) => {
  const db = getDb();
  try {
    let d = db.prepare('SELECT * FROM delegations WHERE id = ?').get(req.params.id);
    if (!d) return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Delegation not found' } });

    d = expireIfNeeded(db, d);
    if (d.state === 'expired') {
      return res.status(400).json({ error: { code: 'DELEGATION_EXPIRED', description: 'This request has expired' } });
    }
    if (d.state !== 'created') {
      return res.status(400).json({ error: { code: 'INVALID_STATE', description: `Cannot share from state '${d.state}'` } });
    }

    db.prepare(`UPDATE delegations SET state = 'shared', shared_at = datetime('now') WHERE id = ?`).run(d.id);

    const result = getDelegationWithContext(db, d.id);
    res.json({ status: 'ok', data: result });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

// ─── POST /v1/delegations/:id/open ─────────────────────────────────────────
// Approver opened the link (state: shared/created -> opened)

router.post('/delegations/:id/open', (req, res) => {
  const db = getDb();
  try {
    let d = db.prepare('SELECT * FROM delegations WHERE id = ?').get(req.params.id);
    if (!d) return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Delegation not found' } });

    d = expireIfNeeded(db, d);
    if (d.state === 'expired') {
      return res.status(400).json({ error: { code: 'DELEGATION_EXPIRED', description: 'This request has expired' } });
    }
    if (!['created', 'shared'].includes(d.state)) {
      return res.status(400).json({ error: { code: 'INVALID_STATE', description: `Cannot open from state '${d.state}'` } });
    }

    db.prepare(`UPDATE delegations SET state = 'opened', opened_at = datetime('now') WHERE id = ?`).run(d.id);

    // Don't mark order as attempted here — opening link is not a payment attempt.
    // Order moves to 'attempted' on /pay when approver actually starts payment.

    const result = getDelegationWithContext(db, d.id);
    res.json({ status: 'ok', data: result });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

// ─── POST /v1/delegations/:id/pay ──────────────────────────────────────────
// Approver selected payment method, payment started

router.post('/delegations/:id/pay', (req, res) => {
  const db = getDb();
  try {
    const { payment_method } = req.body;
    const VALID_METHODS = ['upi', 'card', 'netbanking', 'wallet'];
    if (!payment_method || !VALID_METHODS.includes(payment_method)) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', description: `payment_method must be one of: ${VALID_METHODS.join(', ')}` } });
    }

    let d = db.prepare('SELECT * FROM delegations WHERE id = ?').get(req.params.id);
    if (!d) return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Delegation not found' } });

    d = expireIfNeeded(db, d);
    if (d.state === 'expired') {
      return res.status(400).json({ error: { code: 'DELEGATION_EXPIRED', description: 'This request has expired' } });
    }
    if (!['opened', 'payment_failed'].includes(d.state)) {
      return res.status(400).json({ error: { code: 'INVALID_STATE', description: `Cannot start payment from state '${d.state}'` } });
    }

    db.prepare(`
      UPDATE delegations SET state = 'payment_started', payment_method = ?, payment_started_at = datetime('now')
      WHERE id = ?
    `).run(payment_method, d.id);

    // Now mark order as attempted — approver is actually paying
    db.prepare(`UPDATE orders SET status = 'attempted' WHERE id = ?`).run(d.order_id);

    const result = getDelegationWithContext(db, d.id);
    res.json({ status: 'ok', data: result });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

// ─── POST /v1/delegations/:id/capture ──────────────────────────────────────
// Payment succeeded (state: payment_started -> paid)

router.post('/delegations/:id/capture', (req, res) => {
  const db = getDb();
  try {
    const d = db.prepare('SELECT * FROM delegations WHERE id = ?').get(req.params.id);
    if (!d) return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Delegation not found' } });
    if (d.state !== 'payment_started') {
      return res.status(400).json({ error: { code: 'INVALID_STATE', description: `Cannot capture from state '${d.state}'` } });
    }

    // Update delegation
    db.prepare(`UPDATE delegations SET state = 'paid', paid_at = datetime('now') WHERE id = ?`).run(d.id);

    // Update order to paid
    db.prepare(`UPDATE orders SET status = 'paid' WHERE id = ?`).run(d.order_id);

    // Fire webhooks (merchant receives these)
    fireWebhook(db, d.id, d.order_id, 'order.delegation_approved');
    fireWebhook(db, d.id, d.order_id, 'payment.captured', {
      payment: {
        id: generateId('pay'),
        amount: db.prepare('SELECT amount FROM orders WHERE id = ?').get(d.order_id)?.amount,
        method: d.payment_method
      }
    });
    fireWebhook(db, d.id, d.order_id, 'order.paid');

    const result = getDelegationWithContext(db, d.id);
    res.json({ status: 'ok', data: result });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

// ─── POST /v1/delegations/:id/fail ─────────────────────────────────────────
// Payment failed (approver can retry)

router.post('/delegations/:id/fail', (req, res) => {
  const db = getDb();
  try {
    const d = db.prepare('SELECT * FROM delegations WHERE id = ?').get(req.params.id);
    if (!d) return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Delegation not found' } });
    if (d.state !== 'payment_started') {
      return res.status(400).json({ error: { code: 'INVALID_STATE', description: `Cannot fail from state '${d.state}'` } });
    }

    db.prepare(`UPDATE delegations SET state = 'payment_failed' WHERE id = ?`).run(d.id);
    fireWebhook(db, d.id, d.order_id, 'payment.failed');

    const result = getDelegationWithContext(db, d.id);
    res.json({ status: 'ok', data: result });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

// ─── POST /v1/delegations/:id/decline ──────────────────────────────────────
// Approver declined

router.post('/delegations/:id/decline', (req, res) => {
  const db = getDb();
  try {
    const { reason } = req.body;
    let d = db.prepare('SELECT * FROM delegations WHERE id = ?').get(req.params.id);
    if (!d) return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Delegation not found' } });

    d = expireIfNeeded(db, d);
    if (d.state === 'expired') {
      return res.status(400).json({ error: { code: 'DELEGATION_EXPIRED', description: 'This request has expired' } });
    }
    if (!['created', 'shared', 'opened'].includes(d.state)) {
      return res.status(400).json({ error: { code: 'INVALID_STATE', description: `Cannot decline from state '${d.state}'` } });
    }

    db.prepare(`
      UPDATE delegations SET state = 'declined', declined_at = datetime('now'), decline_reason = ?
      WHERE id = ?
    `).run(reason || null, d.id);

    // Order reverts to created
    db.prepare(`UPDATE orders SET status = 'created' WHERE id = ?`).run(d.order_id);

    fireWebhook(db, d.id, d.order_id, 'order.delegation_declined');

    const result = getDelegationWithContext(db, d.id);
    res.json({ status: 'ok', data: result });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

// ─── POST /v1/delegations/:id/redelegate ───────────────────────────────────
// Pick a new approver (from declined/payment_failed/expired)

router.post('/delegations/:id/redelegate', (req, res) => {
  const db = getDb();
  try {
    const { approver_phone, approver_name, preamble_text } = req.body;
    if (!approver_phone) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', description: 'approver_phone required' } });
    }

    const d = db.prepare('SELECT * FROM delegations WHERE id = ?').get(req.params.id);
    if (!d) return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Delegation not found' } });
    if (!['declined', 'expired', 'payment_failed'].includes(d.state)) {
      return res.status(400).json({ error: { code: 'INVALID_STATE', description: `Cannot redelegate from state '${d.state}'` } });
    }

    // Mark old as redelegated
    db.prepare(`UPDATE delegations SET state = 'redelegated' WHERE id = ?`).run(d.id);

    // Create new delegation
    const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(d.merchant_id);
    const trust_tier = assignTrustTier(merchant);
    const effectiveTtl = d.ttl_seconds;
    const expiresAt = new Date(Date.now() + effectiveTtl * 1000).toISOString();
    const cleanPreamble = sanitizePreamble(preamble_text || d.preamble_text);

    const newId = generateId('deleg');
    db.prepare(`
      INSERT INTO delegations (
        id, order_id, merchant_id, entry_point,
        requestor_name, requestor_phone,
        approver_name, approver_phone,
        preamble_text, trust_tier,
        channel_whatsapp, channel_sms,
        state, ttl_seconds, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'created', ?, ?)
    `).run(
      newId, d.order_id, d.merchant_id, d.entry_point,
      d.requestor_name, d.requestor_phone,
      approver_name || null, approver_phone,
      cleanPreamble, trust_tier,
      d.channel_whatsapp, d.channel_sms,
      effectiveTtl, expiresAt
    );

    fireWebhook(db, newId, d.order_id, 'order.delegation_requested');

    const result = getDelegationWithContext(db, newId);
    res.status(201).json({ status: 'created', old_delegation_id: d.id, data: result });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

module.exports = router;
