import React, { useState } from 'react';
import { theme } from '../theme';

/**
 * UnderTheHood — developer-facing context panel shown on every screen.
 *
 * Shows what's happening behind the scenes at each step of the delegation flow.
 * Like a browser DevTools Network tab, but for the delegation state machine.
 *
 * Sections:
 *   - State transition
 *   - API endpoint(s)
 *   - Webhook events fired to merchant
 *   - Key context (only what's distinctive at this step)
 *
 * Styled as a dark developer console to visually separate from the user-facing UI.
 */
export default function HandshakePanel({ step, scenario, delegation, paymentMethod }) {
  const [expanded, setExpanded] = useState(true);
  const data = getStepData(step, scenario, delegation, paymentMethod);

  return (
    <div style={{
      marginTop: 16, borderRadius: theme.radius, overflow: 'hidden',
      border: '1px solid #2D3748',
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '10px 14px', background: '#1A202C',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#A0AEC0', fontFamily: 'monospace', fontWeight: 600 }}>
            {'{ }'} UNDER THE HOOD
          </span>
          {data.stateValue && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: theme.radiusSm,
              background: '#2D3748', color: stateColor(data.stateValue),
              fontFamily: 'monospace',
            }}>
              {data.stateValue}
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: '#718096' }}>
          {expanded ? '\u25B2' : '\u25BC'}
        </span>
      </button>

      {/* Body */}
      {expanded && (
        <div style={{ background: '#1A202C', padding: '0 14px 14px' }}>
          {/* State transition */}
          {data.state && (
            <Section label="STATE">
              <span style={{ color: '#E2E8F0', fontFamily: 'monospace', fontSize: 12 }}>
                {data.state}
              </span>
            </Section>
          )}

          {/* API */}
          {data.api && data.api.length > 0 && (
            <Section label="API">
              {data.api.map((call, i) => (
                <div key={i} style={{
                  fontFamily: 'monospace', fontSize: 11, color: '#68D391',
                  padding: '2px 0',
                }}>
                  {call}
                </div>
              ))}
            </Section>
          )}

          {/* Webhook */}
          {data.webhooks && data.webhooks.length > 0 && (
            <Section label="WEBHOOK \u2192 MERCHANT">
              {data.webhooks.map((wh, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: wh.includes('declined') || wh.includes('failed') ? '#FC8181'
                      : wh.includes('expired') ? '#F6E05E'
                      : '#68D391',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#E2E8F0' }}>
                    {wh}
                  </span>
                </div>
              ))}
            </Section>
          )}

          {/* Context — key variables and notes */}
          {data.context && data.context.length > 0 && (
            <Section label="CONTEXT">
              {data.context.map((item, i) => (
                item.note ? (
                  <div key={i} style={{
                    fontSize: 11, color: '#718096', fontStyle: 'italic',
                    padding: '3px 0 1px',
                  }}>
                    {item.note}
                  </div>
                ) : (
                  <div key={i} style={{
                    display: 'flex', gap: 4, padding: '1px 0',
                    fontFamily: 'monospace', fontSize: 11,
                  }}>
                    <span style={{ color: '#90CDF4', flexShrink: 0 }}>{item.key}:</span>
                    <span style={{ color: '#E2E8F0' }}>{item.value}</span>
                  </div>
                )
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        fontSize: 9, fontWeight: 700, color: '#718096', letterSpacing: '0.8px',
        marginBottom: 4, textTransform: 'uppercase',
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function stateColor(state) {
  if (!state || state === '\u2014') return '#718096';
  if (state === 'paid') return '#68D391';
  if (state === 'declined' || state === 'payment_failed') return '#FC8181';
  if (state === 'expired') return '#F6E05E';
  if (state === 'payment_started') return '#63B3ED';
  return '#E2E8F0';
}

// ── Step-specific data ──────────────────────────────────────────────────

function getStepData(step, scenario, delegation, paymentMethod) {
  const s = scenario;
  const amount = (s.order.amount / 100).toLocaleString('en-IN');
  const entryLabels = { A: 'Web Checkout SDK', B: 'POS QR Landing', C: 'Payment Link' };

  switch (step) {
    case 'entry':
      return {
        state: 'No delegation yet',
        stateValue: '\u2014',
        api: [],
        webhooks: [],
        context: [
          { key: 'order_id', value: s.order.id },
          { key: 'amount', value: `\u20B9${amount}` },
          { key: 'entry_point', value: `${s.entry_point}: ${entryLabels[s.entry_point]}` },
          { key: 'trust_tier', value: s.trust_tier },
          { note: 'Trust tier pre-computed from merchant KYC, MCC, tenure, risk flags' },
        ],
      };

    case 'compose':
      return {
        state: '\u2014 \u2192 created',
        stateValue: 'creating',
        api: ['POST /v1/delegations'],
        webhooks: [],
        context: [
          { key: 'approver_phone', value: s.approver.phone },
          { key: 'preamble_text', value: '\u2264140 chars' },
          { key: 'entry_point', value: s.entry_point },
          { note: 'One open delegation per order' },
          { note: 'Trust tier assigned server-side, not from user input' },
        ],
      };

    case 'preview':
      return {
        state: 'created \u2192 shared',
        stateValue: delegation?.state || 'shared',
        api: ['POST /v1/delegations/:id/share'],
        webhooks: ['order.delegation_requested'],
        context: [
          { key: 'delegation_id', value: delegation?.id || 'deleg_xxx' },
          { key: 'share_url', value: `rzp.io/r/${delegation?.id || 'deleg_xxx'}` },
          { key: 'trust_tier', value: delegation?.trust_tier || s.trust_tier },
          { note: 'Share-link-first: requestor sends from own WhatsApp' },
          { note: 'System block is server-generated, tamper-proof' },
        ],
      };

    case 'approver':
      return {
        state: 'shared \u2192 opened',
        stateValue: delegation?.state || 'opened',
        api: [
          'POST /v1/delegations/:id/open',
          'POST /v1/delegations/:id/pay  \u2190 on pay',
        ],
        webhooks: [],
        context: [
          { key: 'trust_tier', value: tierExplanation(delegation?.trust_tier || s.trust_tier) },
          { key: 'payment_methods', value: 'UPI, Card, NB, Wallet' },
          { note: 'Trust tier drives what context the approver sees' },
          { note: 'No webhook on open \u2014 merchant only notified on outcome' },
        ],
      };

    case 'processing':
      return {
        state: 'payment_started \u2192 paid',
        stateValue: 'payment_started',
        api: [
          'POST /v1/delegations/:id/pay',
          'POST /v1/delegations/:id/capture',
        ],
        webhooks: [
          'order.delegation_approved',
          'payment.captured',
          'order.paid',
        ],
        context: [
          { key: 'payment_method', value: paymentMethod || 'upi' },
          { note: 'Same webhook contract as a direct Razorpay payment' },
          { note: 'Merchant fulfils order as usual \u2014 zero code changes' },
        ],
      };

    case 'status':
      return {
        state: delegation?.state === 'paid' ? 'paid \u2713'
          : delegation?.state === 'declined' ? 'declined \u2717'
          : 'expired',
        stateValue: delegation?.state || 'paid',
        api: delegation?.state === 'declined'
          ? ['POST /v1/delegations/:id/decline']
          : ['POST /v1/delegations/:id/capture'],
        webhooks: delegation?.state === 'paid'
          ? ['order.delegation_approved', 'payment.captured', 'order.paid']
          : delegation?.state === 'declined'
          ? ['order.delegation_declined']
          : ['order.delegation_expired'],
        context: [
          { key: 'delegation.state', value: delegation?.state || 'paid' },
          { key: 'order.status', value: delegation?.state === 'paid' ? 'paid' : 'created' },
          ...(paymentMethod ? [{ key: 'payment_method', value: paymentMethod }] : []),
          ...(delegation?.decline_reason ? [{ key: 'decline_reason', value: delegation.decline_reason }] : []),
          { note: delegation?.state === 'paid'
            ? 'Merchant received standard payment webhooks \u2014 no delegation awareness needed'
            : 'Terminal state \u2014 delegation resolved' },
        ],
      };

    default:
      return { state: null, stateValue: '\u2014', context: [] };
  }
}

function tierExplanation(tier) {
  switch (tier) {
    case 'T1': return 'T1 \u2014 line_items + KYC + category + tenure';
    case 'T2': return 'T2 \u2014 category + KYC + tenure > 1yr';
    case 'T3': return 'T3 \u2014 name + basic verified';
    case 'T4': return 'T4 \u2014 risk-flagged or very new \u2192 warning';
    default: return tier;
  }
}
