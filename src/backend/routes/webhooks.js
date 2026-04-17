const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

/**
 * GET /v1/webhook-events
 *
 * Returns webhook events fired during demo — shows what the merchant receives.
 * Optionally filter by order_id or delegation_id.
 */
router.get('/webhook-events', (req, res) => {
  const db = getDb();
  try {
    const { order_id, delegation_id, limit = 50 } = req.query;

    let query = 'SELECT * FROM webhook_events';
    const params = [];

    if (order_id) {
      query += ' WHERE order_id = ?';
      params.push(order_id);
    } else if (delegation_id) {
      query += ' WHERE delegation_id = ?';
      params.push(delegation_id);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const events = db.prepare(query).all(...params);

    // Parse payload JSON
    const parsed = events.map(e => ({
      ...e,
      payload: JSON.parse(e.payload)
    }));

    res.json({ status: 'ok', count: parsed.length, data: parsed });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

/**
 * DELETE /v1/webhook-events
 * Clear all webhook events (for demo reset)
 */
router.delete('/webhook-events', (_req, res) => {
  const db = getDb();
  try {
    db.prepare('DELETE FROM webhook_events').run();
    res.json({ status: 'ok', message: 'All webhook events cleared' });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
  }
});

module.exports = router;
