import React from 'react';
import { theme } from '../theme';

/**
 * Entry C: Razorpay Payment Link page.
 * Customer receives a payment link (rzp.io/i/{id}), opens it,
 * sees invoice/amount, and can "Ask Someone to Pay".
 */
export default function EntryPaymentLink({ scenario, onAskOthers }) {
  const s = scenario;
  const amount = (s.order.amount / 100).toLocaleString('en-IN');
  const lineItems = s.order.line_items || [];

  return (
    <div>
      <div style={{
        background: theme.card, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow, overflow: 'hidden',
      }}>
        {/* URL bar */}
        <div style={{
          background: '#F3F4F6', padding: '8px 14px', borderBottom: `1px solid ${theme.divider}`,
          fontSize: 12, color: theme.textSecondary, fontFamily: 'monospace',
        }}>
          rzp.io/i/{s.payment_link?.id || 'plink_demo'}
        </div>

        {/* Header */}
        <div style={{ padding: '20px', background: theme.primary, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: theme.radius, background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700,
            }}>{s.merchant.name[0]}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.merchant.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{s.merchant.category}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>Payment request</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{'\u20B9'}{amount}</div>
        </div>

        {/* Invoice details */}
        <div style={{ padding: '16px 20px' }}>
          {s.order.description && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Description
              </div>
              <p style={{ fontSize: 14, color: theme.text, lineHeight: 1.5 }}>{s.order.description}</p>
            </div>
          )}

          {lineItems.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Line Items
              </div>
              {lineItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: theme.text }}>{item.description}</span>
                  <span style={{ color: theme.text, fontWeight: 500 }}>{'\u20B9'}{(item.amount / 100).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}

          {s.payment_link && (
            <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 16 }}>
              Sent to: {s.requestor.name} ({s.requestor.phone})
            </div>
          )}

          <div style={{ height: 1, background: theme.divider, margin: '0 0 16px' }} />

          {/* Pay button (greyed) */}
          <button style={{
            width: '100%', padding: '14px', borderRadius: theme.radius,
            background: theme.accent, color: '#fff', fontSize: 15, fontWeight: 600,
            opacity: 0.5, marginBottom: 12,
          }}>
            Pay {'\u20B9'}{amount}
          </button>

          {/* Ask someone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 12px' }}>
            <div style={{ flex: 1, height: 1, background: theme.divider }} />
            <span style={{ fontSize: 12, color: theme.textMuted }}>or</span>
            <div style={{ flex: 1, height: 1, background: theme.divider }} />
          </div>

          <button
            onClick={onAskOthers}
            style={{
              width: '100%', padding: '14px', borderRadius: theme.radius,
              background: `${theme.secondary}10`, border: `1.5px solid ${theme.secondary}`,
              color: theme.secondary, fontSize: 15, fontWeight: 600,
            }}
            onMouseOver={e => { e.currentTarget.style.background = `${theme.secondary}20`; }}
            onMouseOut={e => { e.currentTarget.style.background = `${theme.secondary}10`; }}
          >
            Ask Someone to Pay
          </button>
        </div>
      </div>
    </div>
  );
}
