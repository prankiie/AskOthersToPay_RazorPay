import React, { useState } from 'react';
import { theme } from '../theme';

/**
 * Entry B: Razorpay-hosted QR Landing Page — Concept
 *
 * Customer scans QR at POS, phone opens rzp.io/q/{merchant_id}/{order_id}.
 * Landing shows: merchant name, amount, "Pay Now" + "Ask Someone to Pay".
 *
 * Dynamic QR: amount pre-set by terminal.
 * Static QR: customer enters amount.
 */
export default function EntryQRLanding({ scenario, onAskOthers }) {
  const s = scenario;
  const isStatic = s.qr_session?.qr_type === 'static';
  const [customAmount, setCustomAmount] = useState('');

  const displayAmount = isStatic
    ? (customAmount ? parseInt(customAmount) * 100 : s.order.amount)
    : s.order.amount;
  const amountStr = (displayAmount / 100).toLocaleString('en-IN');

  return (
    <div>
      {/* Concept banner */}
      <div style={{
        background: `${theme.accent}10`, border: `1px solid ${theme.accent}30`,
        borderRadius: theme.radius, padding: '10px 14px', marginBottom: 16,
        fontSize: 12, color: theme.accent, fontWeight: 500,
      }}>
        Razorpay-hosted QR Landing Page &mdash; Concept (requires QR payload migration)
      </div>

      {/* QR scan simulation */}
      <div style={{
        background: theme.card, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow, overflow: 'hidden',
      }}>
        {/* URL bar mock */}
        <div style={{
          background: '#F3F4F6', padding: '8px 14px', borderBottom: `1px solid ${theme.divider}`,
          fontSize: 12, color: theme.textSecondary, fontFamily: 'monospace',
        }}>
          rzp.io/q/{s.merchant.id}{!isStatic ? `/${s.order.id}` : ''}
        </div>

        {/* Merchant info */}
        <div style={{ padding: '24px 20px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: theme.radiusLg, background: `${theme.accent}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: 24, fontWeight: 700, color: theme.accent,
          }}>
            {s.merchant.name[0]}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.text, marginBottom: 4 }}>{s.merchant.name}</h2>
          <p style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>{s.merchant.category}</p>
          {s.merchant.kyc_status === 'kyc_approved' && (
            <span style={{ fontSize: 12, color: theme.accent, fontWeight: 500 }}>{'\u2713'} Razorpay Verified</span>
          )}
          {s.merchant.kyc_status === 'verified' && (
            <span style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 500 }}>{'\u2713'} Verified</span>
          )}
        </div>

        {/* Amount */}
        <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
          {isStatic ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: theme.textSecondary, marginBottom: 8 }}>Enter Amount</label>
              <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 8 }}>
                Concept: in production, this amount would create a new order before delegation
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: theme.text }}>{'\u20B9'}</span>
                <input
                  type="number"
                  value={customAmount || (s.order.amount / 100)}
                  onChange={e => setCustomAmount(e.target.value)}
                  style={{
                    fontSize: 24, fontWeight: 700, color: theme.text, border: 'none',
                    borderBottom: `2px solid ${theme.secondary}`, width: 120, textAlign: 'center',
                    outline: 'none', background: 'transparent', padding: '4px 0',
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Amount</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: theme.text }}>{'\u20B9'}{amountStr}</div>
              {s.order.description && (
                <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>{s.order.description}</div>
              )}
            </div>
          )}

          {/* Pay Now button (greyed out for demo) */}
          <button style={{
            width: '100%', padding: '14px', borderRadius: theme.radius,
            background: theme.accent, color: '#fff', fontSize: 15, fontWeight: 600,
            opacity: 0.5, marginBottom: 12,
          }}>
            Pay Now
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 12px' }}>
            <div style={{ flex: 1, height: 1, background: theme.divider }} />
            <span style={{ fontSize: 12, color: theme.textMuted }}>or</span>
            <div style={{ flex: 1, height: 1, background: theme.divider }} />
          </div>

          {/* Ask Someone to Pay */}
          <button
            onClick={() => onAskOthers(isStatic ? displayAmount : null)}
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
