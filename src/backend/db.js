const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * SQLite database for Ask Others to Pay demo.
 *
 * Tables:
 *   merchants      — Razorpay merchant records (existing in production)
 *   orders         — Razorpay orders (existing in production)
 *   payment_links  — Razorpay payment links (existing in production)
 *   qr_sessions    — Razorpay QR sessions (existing in production)
 *   delegations    — THE NEW PRIMITIVE. One core table added to Razorpay.
 *   webhook_events — Log of webhook events fired to merchant
 *
 * The architectural story: Razorpay already has merchants, orders, payment_links.
 * This feature adds ONE new table (delegations) and a webhook event log.
 */

// Store DB in /tmp to avoid iCloud Drive sync issues with SQLite WAL
const DB_PATH = path.join(require('os').tmpdir(), 'askotherstopay_demo.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

// ─── Schema ────────────────────────────────────────────────────────────────

function createSchema() {
  const db = getDb();

  db.exec(`
    -- Merchants: what Razorpay already has on every merchant
    CREATE TABLE IF NOT EXISTS merchants (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      category        TEXT,
      mcc_code        INTEGER,
      mcc_label       TEXT,
      kyc_status      TEXT DEFAULT 'unverified',   -- unverified | verified | kyc_approved
      risk_flagged    INTEGER DEFAULT 0,            -- Razorpay internal fraud flag (0 or 1)
      tenure_days     INTEGER DEFAULT 0,
      onboarding_date TEXT,
      has_line_items  INTEGER DEFAULT 0,            -- does this merchant pass line_items?
      logo_url        TEXT,
      website         TEXT
    );

    -- Orders: standard Razorpay order
    CREATE TABLE IF NOT EXISTS orders (
      id          TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      amount      INTEGER NOT NULL,                 -- in paise
      currency    TEXT DEFAULT 'INR',
      status      TEXT DEFAULT 'created',            -- created | attempted | paid
      receipt     TEXT,
      description TEXT,
      line_items  TEXT,                              -- JSON array
      notes       TEXT,                              -- JSON object
      created_at  TEXT DEFAULT (datetime('now')),
      expire_by   TEXT
    );

    -- Payment Links: Razorpay payment link (Entry C)
    CREATE TABLE IF NOT EXISTS payment_links (
      id          TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      order_id    TEXT REFERENCES orders(id),
      amount      INTEGER NOT NULL,
      currency    TEXT DEFAULT 'INR',
      description TEXT,
      short_url   TEXT,
      status      TEXT DEFAULT 'created',
      customer_name    TEXT,
      customer_phone   TEXT,
      customer_email   TEXT,
      expire_by   TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    -- QR Sessions: Razorpay QR code session (Entry B)
    CREATE TABLE IF NOT EXISTS qr_sessions (
      id          TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id),
      order_id    TEXT REFERENCES orders(id),
      qr_type     TEXT NOT NULL,                     -- dynamic | static
      amount      INTEGER,                           -- null for static (customer enters)
      qr_url      TEXT,                              -- rzp.io/q/{merchant_id}/{order_id}
      status      TEXT DEFAULT 'active',
      ttl_seconds INTEGER DEFAULT 900,               -- 15 min for POS
      created_at  TEXT DEFAULT (datetime('now'))
    );

    -- ═══════════════════════════════════════════════════════════════════
    -- DELEGATIONS: The single new primitive this feature adds to Razorpay
    -- ═══════════════════════════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS delegations (
      id                  TEXT PRIMARY KEY,
      order_id            TEXT NOT NULL REFERENCES orders(id),
      merchant_id         TEXT NOT NULL REFERENCES merchants(id),
      entry_point         TEXT NOT NULL,              -- A | B | C

      -- Requestor
      requestor_name      TEXT,
      requestor_phone     TEXT,

      -- Approver
      approver_name       TEXT,
      approver_phone      TEXT NOT NULL,

      -- Message
      preamble_text       TEXT DEFAULT '',            -- max 140 chars, sanitized server-side

      -- Trust tier assigned SERVER-SIDE from merchant data
      trust_tier          TEXT NOT NULL,              -- T1 | T2 | T3 | T4

      -- Channels
      channel_whatsapp    INTEGER DEFAULT 1,
      channel_sms         INTEGER DEFAULT 1,

      -- State machine:
      -- created -> shared -> opened -> payment_started -> paid
      --                        |-> declined
      --                        |-> expired
      --                        |-> payment_failed -> (retry)
      --                                           -> redelegated
      state               TEXT DEFAULT 'created',
      payment_method      TEXT,                      -- upi | card | netbanking | wallet (set on payment_started)

      -- Timestamps
      created_at          TEXT DEFAULT (datetime('now')),
      shared_at           TEXT,
      opened_at           TEXT,
      payment_started_at  TEXT,
      paid_at             TEXT,
      declined_at         TEXT,
      expired_at          TEXT,
      decline_reason      TEXT,

      ttl_seconds         INTEGER DEFAULT 86400,     -- 24h for checkout, 900 for POS
      expires_at          TEXT NOT NULL
    );

    -- Enforce: only one open delegation per order
    CREATE UNIQUE INDEX IF NOT EXISTS idx_one_open_delegation_per_order
      ON delegations(order_id)
      WHERE state IN ('created', 'shared', 'opened', 'payment_started');

    -- Webhook Events: what the merchant receives
    CREATE TABLE IF NOT EXISTS webhook_events (
      id          TEXT PRIMARY KEY,
      delegation_id TEXT REFERENCES delegations(id),
      order_id    TEXT REFERENCES orders(id),
      event_type  TEXT NOT NULL,
      payload     TEXT NOT NULL,                     -- JSON
      created_at  TEXT DEFAULT (datetime('now'))
    );
  `);
}

// ─── Seed Data ─────────────────────────────────────────────────────────────

function seedData() {
  const db = getDb();

  // Check if already seeded
  const count = db.prepare('SELECT COUNT(*) as c FROM merchants').get();
  if (count.c > 0) return;

  // ── Merchants ──────────────────────────────────────────────────────
  const insertMerchant = db.prepare(`
    INSERT INTO merchants (id, name, category, mcc_code, mcc_label, kyc_status, risk_flagged, tenure_days, onboarding_date, has_line_items, logo_url, website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const merchants = [
    // T1: Enterprise e-commerce, passes line_items
    ['MERC_CROMA', 'Croma Electronics', 'Electronics', 5732, 'Electronics Stores', 'kyc_approved', 0, 2800, '2018-06-15', 1, null, 'croma.com'],
    // T2: Established restaurant, no line_items but MCC + tenure
    ['MERC_BOMBAY_CANTEEN', 'The Bombay Canteen', 'Food & Beverage', 5812, 'Eating Places and Restaurants', 'kyc_approved', 0, 1800, '2021-03-10', 0, null, null],
    // T3: Small kirana, basic KYC, short tenure
    ['MERC_SHARMA_STORE', 'Sharma General Store', 'Grocery', 5411, 'Grocery Stores', 'verified', 0, 240, '2025-08-15', 0, null, null],
    // T2: SaaS vendor for B2B scenario
    ['MERC_ZOHO', 'Zoho Corporation', 'Software', 5734, 'Computer Software Stores', 'kyc_approved', 0, 3200, '2017-09-01', 1, null, 'zoho.com'],
    // T4: Flagged merchant (risk_flagged = 1)
    ['MERC_QUICKDEALS', 'QuickDeals Online', 'Electronics', 5732, 'Electronics Stores', 'verified', 1, 45, '2026-03-01', 0, null, 'quickdeals.shop'],
  ];

  const insertMerchants = db.transaction(() => {
    for (const m of merchants) {
      insertMerchant.run(...m);
    }
  });
  insertMerchants();

  // ── Orders (pre-created for demo scenarios) ────────────────────────
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, merchant_id, amount, currency, status, receipt, description, line_items, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const orders = [
    // Scenario 1: Priya asks Dad — Croma headphones (Entry A)
    ['order_PRIYA_HP', 'MERC_CROMA', 499900, 'INR', 'created', 'CROMA_ORD_78234',
      'Sony WH-CH720N Wireless Headphones',
      JSON.stringify([{ item_code: 'WH-CH720N', description: 'Sony WH-CH720N Wireless Headphones - Blue', amount: 499900, quantity: 1 }]),
      JSON.stringify({ customer_name: 'Priya Sharma', source: 'web' })],
    // Scenario 2: Meera asks Arjun — restaurant bill (Entry B dynamic QR)
    ['order_MEERA_DINNER', 'MERC_BOMBAY_CANTEEN', 240000, 'INR', 'created', 'BC_TXN_9912',
      'Dinner for 2',
      null,
      JSON.stringify({ terminal_id: 'TERM_BC_01', source: 'pos', entry_point: 'dynamic_qr' })],
    // Scenario 3: Rohan asks Mom — kirana (Entry B static QR)
    ['order_ROHAN_KIRANA', 'MERC_SHARMA_STORE', 85000, 'INR', 'created', null,
      'Groceries',
      null,
      JSON.stringify({ source: 'pos', entry_point: 'static_qr' })],
    // Scenario 4: Accountant forwards invoice to CFO (Entry C)
    ['order_ZOHO_INVOICE', 'MERC_ZOHO', 1770000, 'INR', 'created', 'INV-2026-0412',
      'Zoho One Annual Subscription - 15 users',
      JSON.stringify([{ description: 'Zoho One Annual - 15 users', amount: 1500000, quantity: 1 }, { description: 'GST @18%', amount: 270000, quantity: 1 }]),
      JSON.stringify({ customer_name: 'Anita Desai', company: 'Patel Engineering Pvt Ltd', source: 'payment_link' })],
    // Scenario 5: Flagged merchant (Entry A, T4 warning)
    ['order_QUICK_PHONE', 'MERC_QUICKDEALS', 1299900, 'INR', 'created', 'QD_ORD_1122',
      'iPhone 15 Pro Max 256GB',
      null,
      JSON.stringify({ customer_name: 'Vikram Patel', source: 'web' })],
  ];

  const insertOrders = db.transaction(() => {
    for (const o of orders) {
      insertOrder.run(...o);
    }
  });
  insertOrders();

  // ── Payment Link (Scenario 4) ──────────────────────────────────────
  db.prepare(`
    INSERT INTO payment_links (id, merchant_id, order_id, amount, currency, description, short_url, status, customer_name, customer_phone, customer_email, expire_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'plink_ZOHO_INV', 'MERC_ZOHO', 'order_ZOHO_INVOICE', 1770000, 'INR',
    'Zoho One Annual Subscription - 15 users (INV-2026-0412)',
    'https://rzp.io/i/plink_ZOHO_INV', 'created',
    'Anita Desai', '+919876500001', 'anita@pateleng.com',
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  );

  // ── QR Sessions (Scenarios 2 & 3) ─────────────────────────────────
  const insertQR = db.prepare(`
    INSERT INTO qr_sessions (id, merchant_id, order_id, qr_type, amount, qr_url, status, ttl_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertQR.run('qr_BOMBAY_DYN', 'MERC_BOMBAY_CANTEEN', 'order_MEERA_DINNER', 'dynamic', 240000,
    'https://rzp.io/q/MERC_BOMBAY_CANTEEN/order_MEERA_DINNER', 'active', 900);
  insertQR.run('qr_SHARMA_STATIC', 'MERC_SHARMA_STORE', null, 'static', null,
    'https://rzp.io/q/MERC_SHARMA_STORE', 'active', 900);

  console.log('Database seeded with 5 demo scenarios');
}

// ─── Init ──────────────────────────────────────────────────────────────────

function initDb() {
  createSchema();
  seedData();
  return getDb();
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function generateId(prefix) {
  return `${prefix}_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
}

/**
 * Determine trust tier server-side from merchant data.
 * This is NOT a "score" — it's a data-availability tier that controls
 * how much context the approver sees.
 *
 * T1: Merchant passes line_items AND is kyc_approved
 * T2: KYC approved, has MCC, tenure > 365 days, not risk-flagged
 * T3: Basic verified merchant (KYC done, but limited data)
 * T4: Risk-flagged by Razorpay OR very new (< 30 days) OR unverified
 */
function assignTrustTier(merchant) {
  // T4: risk-flagged or very new or unverified
  if (merchant.risk_flagged || merchant.tenure_days < 30 || merchant.kyc_status === 'unverified') {
    return 'T4';
  }
  // T1: enterprise with line items
  if (merchant.has_line_items && merchant.kyc_status === 'kyc_approved') {
    return 'T1';
  }
  // T2: established, KYC approved, has MCC
  if (merchant.kyc_status === 'kyc_approved' && merchant.mcc_code && merchant.tenure_days > 365) {
    return 'T2';
  }
  // T3: basic verified
  return 'T3';
}

module.exports = { getDb, initDb, generateId, assignTrustTier };
