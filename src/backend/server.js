const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const delegationRoutes = require('./routes/delegation');
const scenarioRoutes = require('./routes/scenarios');
const webhookRoutes = require('./routes/webhooks');

// ── Initialize database ──────────────────────────────────────────────────
initDb();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ask-others-to-pay-demo', timestamp: new Date().toISOString() });
});

// ── API Routes (Razorpay convention: /v1/, snake_case) ───────────────────
// No auth for demo — in production, Basic Auth (key_id:key_secret)
app.use('/v1', delegationRoutes);
app.use('/v1', scenarioRoutes);
app.use('/v1', webhookRoutes);

// ── 404 ──────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', description: 'Not found' } });
});

// ── Error handler ────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: err.message } });
});

// ── Start ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Ask Others to Pay — Demo Backend`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Health: GET /health`);
  console.log(`  Scenarios: GET /v1/scenarios`);
  console.log(`  Delegations: POST /v1/delegations`);
  console.log(`  Webhooks: GET /v1/webhook-events\n`);
});
