import React, { useState } from 'react';
import { theme } from '../theme';

const ENTRY_ICONS = { A: 'laptop', B: 'qr', C: 'link' };
const TIER_COLORS = { T1: theme.tierT1, T2: theme.tierT2, T3: theme.tierT3, T4: theme.tierT4 };

export default function ScenarioLauncher({ scenarios, onSelect }) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, background: theme.primary, borderRadius: theme.radiusSm, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>R</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: theme.primary }}>Razorpay</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: theme.text, marginBottom: 8 }}>
          Ask Others to Pay
        </h1>
        <p style={{ fontSize: 15, color: theme.textSecondary, lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
          A unified delegation primitive for Razorpay. Three entry points.
          Pick a scenario below to walk the full journey.
        </p>
      </div>

      {/* Executive Summary */}
      <ExecutiveSummary open={summaryOpen} onToggle={() => setSummaryOpen(!summaryOpen)} />

      {/* Entry point legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          { label: 'A: Web Checkout', color: theme.secondary },
          { label: 'B: POS QR', color: theme.accent },
          { label: 'C: Payment Link', color: '#8B5CF6' },
        ].map(e => (
          <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.color }} />
            <span style={{ fontSize: 12, color: theme.textSecondary }}>{e.label}</span>
          </div>
        ))}
      </div>

      {/* Scenario cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {scenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} onClick={() => onSelect(s)} />
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 40, padding: '16px 0' }}>
        <p style={{ fontSize: 12, color: theme.textMuted }}>
          Demo backend running on localhost:3001 &middot; SQLite &middot; Single delegation primitive
        </p>
      </div>
    </div>
  );
}

function ExecutiveSummary({ open, onToggle }) {
  return (
    <div style={{
      background: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: theme.radiusLg,
      marginBottom: 28,
      overflow: 'hidden',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '14px 20px',
          background: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 14,
          fontWeight: 600,
          color: theme.primary,
        }}
      >
        <span>Executive Summary</span>
        <span style={{ fontSize: 12, color: theme.textMuted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>&#9660;</span>
      </button>

      {open && (
        <div style={{ padding: '0 20px 20px', fontSize: 13, lineHeight: 1.7, color: theme.textSecondary }}>
          <Section title="The problem">
            Asking someone else to pay on your behalf is a common, legitimate everyday act in India — a daughter buying online and asking her father to pay; a wife at a restaurant asking her husband to cover the bill; an accountant forwarding a vendor invoice to the CFO. It has never had a clean digital expression. UPI P2P collect requests came closest and were banned by NPCI in October 2025 because of how badly they were abused for fraud. UPI Circle addresses a narrow slice (pre-registered trusted users with spending limits) but requires setup, doesn't carry merchant context, and isn't designed for ad-hoc delegation at the payment moment. Everything else is a phone call followed by a manual transfer — no merchant context, no trust signals, no receipt.
          </Section>

          <Section title="Why Razorpay">
            <p style={{ marginBottom: 8 }}>Razorpay can build this, and has good reason to. Not a claim no one else could do a version of it.</p>
            <BulletList items={[
              { bold: 'It fits Razorpay\u2019s existing surfaces.', text: 'The natural home for "Ask Someone to Pay" is the payment screen itself \u2014 Checkout, POS QR landing, Payment Link. Razorpay already runs all three.' },
              { bold: 'Volume that\u2019s currently off-rail.', text: 'Today "ask someone to pay" resolves as a phone call followed by a separate UPI transfer \u2014 off Razorpay\u2019s rails, no order linkage, no audit trail. Bringing it on-rail is strategic volume for Razorpay and cleaner reconciliation for the merchant.' },
              { bold: 'Adoption requires no merchant code.', text: 'Delegated payments emit the same payment.captured and order.paid events as direct ones, so the feature reaches a merchant\u2019s backend without integration work. That\u2019s a gateway-specific property.' },
            ]} />
          </Section>

          <Section title="The solution">
            <strong style={{ color: theme.text }}>Ask Others to Pay</strong> is a merchant-facilitated payment delegation primitive on Razorpay's existing infrastructure:
            <ol style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 4 }}>Buyer reaches a Razorpay payment surface and taps "Ask Someone to Pay"</li>
              <li style={{ marginBottom: 4 }}>Picks a contact, shares a Razorpay-hosted approval link via WhatsApp/SMS from their own device</li>
              <li style={{ marginBottom: 4 }}>Approver opens the link. Primary trust signal is interpersonal — the link came from a known contact over WhatsApp/SMS. The page adds secondary context (merchant name, amount, line items where available, and a graduated advisory indicator where Razorpay has signals) and they pay with their own method</li>
              <li style={{ marginBottom: 4 }}>Merchant receives the same <code style={codeStyle}>payment.captured</code> and <code style={codeStyle}>order.paid</code> webhooks — <strong style={{ color: theme.text }}>zero code changes</strong></li>
            </ol>
          </Section>

          <Section title="How it works">
            <p style={{ marginBottom: 8 }}>
              One delegation primitive. Three entry points create it. One approval page resolves it. One set of webhook events delivers the result — the same events the merchant already handles for direct payments.
            </p>
            <pre style={{
              background: '#0F172A', color: '#E2E8F0', padding: 12, borderRadius: theme.radiusSm,
              fontSize: 10, fontFamily: 'monospace', lineHeight: 1.4, overflowX: 'auto', marginTop: 8,
            }}>{`ENTRY SURFACES
  A: Checkout SDK   B: QR Landing   C: Payment Link
          │ POST /v1/delegations
          ▼
DELEGATION PRIMITIVE  (bound to an existing order_id)
  • Server-assigned advisory tier (T1–T4)
  • Sanitized preamble + tamper-proof system block
  • One open delegation per order (DB-enforced)
          │ Share via WhatsApp/SMS (requestor's own device)
          ▼
APPROVER PAGE — rzp.io/r/{delegation_id}
  • Razorpay-hosted, tier-adaptive trust panel
  • Approver picks their own payment method
          │ Standard Razorpay payment rail
          ▼
WEBHOOKS TO MERCHANT
  payment.captured, order.paid
  (Identical to direct-payment events)`}</pre>
          </Section>

          <Section title="What this demo shows">
            <BulletList items={[
              { bold: 'End-to-end user journey:', text: 'Walk a scenario in the browser \u2014 compose delegation \u2192 WhatsApp/SMS preview \u2192 approver opens \u2192 pays with their own method \u2192 result flows back.' },
              { bold: 'One primitive, three entry points, one approval page:', text: 'Checkout, Dynamic QR, and Payment Link all POST /v1/delegations and converge on the same approver route. On success, standard payment.captured + order.paid fire so a merchant\u2019s existing handler works unchanged (in the demo, logged in-process rather than delivered over HTTP).' },
              { bold: 'Integrity mechanisms:', text: 'Server-side preamble sanitization (URLs, phone numbers, RTL overrides, homoglyphs stripped), tamper-proof system block regenerated on every open, full state machine with redelegate, and DB-level one-open-per-order. Approver page carries no self-declared "From: {name}" \u2014 identity rides the delivery channel.' },
              { bold: 'Tier-adaptive trust panel (value-add):', text: 'T1 shows line items and KYC badge; T4 shows a yellow caution banner. Useful graduated context, but not load-bearing \u2014 Razorpay already controls which merchants reach these surfaces.' },
            ]} />
          </Section>

          <Section title="Dependency categories for production">
            <BulletList items={[
              { bold: 'Regulatory.', text: 'Confirmation that merchant-anchored delegation is distinct from banned P2P collect; relevant NPCI / RBI positioning.' },
              { bold: 'Messaging infrastructure.', text: 'Template registration and approval for SMS and WhatsApp notifications per Indian telecom rules.' },
              { bold: 'Risk and trust signals.', text: 'Access to existing merchant fraud/risk scoring so the trust panel reflects real data.' },
              { bold: 'Platform events.', text: 'Webhook event naming and registration for delegation lifecycle alongside existing payment events.' },
              { bold: 'QR platform.', text: 'Whether QR payloads that open a Razorpay-hosted page fit existing POS behaviour (Entry B).' },
              { bold: 'Merchant data pipeline.', text: 'Surfacing KYC, category, tenure and other trust signals to the approver page.' },
              { bold: 'Identity sources.', text: 'How requestor identity propagates from Checkout prefill / Payment Link customer blocks / POP.' },
            ]} />
          </Section>

          <Section title="Open questions">
            <p style={{ marginBottom: 6 }}>All empirical; only a pilot can answer:</p>
            <BulletList items={[
              { bold: 'Adoption \u2014', text: 'whether people choose this path over a phone-call-plus-transfer.' },
              { bold: 'Approval rate \u2014', text: 'what percentage of shared delegations get approved.' },
              { bold: 'Payment completion rate \u2014', text: 'what percentage of approvals result in captured payments (the success-rate metric).' },
              { bold: 'Time to resolution \u2014', text: 'how long a typical delegation takes from share to paid.' },
            ]} />
          </Section>
        </div>
      )}
    </div>
  );
}

const codeStyle = {
  background: '#F1F5F9', padding: '1px 5px', borderRadius: 3, fontSize: 12, fontFamily: 'monospace', color: theme.primary,
};

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</h4>
      <div>{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul style={{ paddingLeft: 18, margin: 0 }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 4 }}>
          <strong style={{ color: theme.text }}>{item.bold}</strong> {item.text}
        </li>
      ))}
    </ul>
  );
}

function ScenarioCard({ scenario, onClick }) {
  const s = scenario;
  const entryColor = s.entry_point === 'A' ? theme.secondary : s.entry_point === 'B' ? theme.accent : '#8B5CF6';
  const tierColor = TIER_COLORS[s.trust_tier];
  const amount = (s.order.amount / 100).toLocaleString('en-IN');

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radiusLg,
        padding: '20px 24px',
        textAlign: 'left',
        boxShadow: theme.shadow,
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
      }}
      onMouseOver={e => { e.currentTarget.style.boxShadow = theme.shadowMd; e.currentTarget.style.borderColor = entryColor; }}
      onMouseOut={e => { e.currentTarget.style.boxShadow = theme.shadow; e.currentTarget.style.borderColor = theme.border; }}
    >
      {/* Entry point badge */}
      <div style={{
        width: 44, height: 44, borderRadius: theme.radius, background: `${entryColor}12`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: entryColor }}>{s.entry_point}</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{s.title}</span>
        </div>
        <p style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 8 }}>{s.subtitle}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color={entryColor} label={s.entry_label.split('(')[0].trim()} />
          <Tag color={tierColor} label={s.trust_tier} />
          <Tag color={theme.textSecondary} label={`${s.merchant.name}`} />
          <Tag color={theme.text} label={`\u20B9${amount}`} />
        </div>
      </div>

      {/* Arrow */}
      <div style={{ color: theme.textMuted, fontSize: 18, flexShrink: 0, marginTop: 8 }}>&rarr;</div>
    </button>
  );
}

function Tag({ color, label }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 500, color,
      background: `${color}10`, padding: '2px 8px', borderRadius: theme.radiusFull,
      border: `1px solid ${color}20`,
    }}>
      {label}
    </span>
  );
}
