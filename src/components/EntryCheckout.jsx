import React from 'react';
import { theme } from '../theme';

/**
 * Entry A: Razorpay Checkout SDK surface.
 * Simulates a merchant checkout page with the Razorpay Checkout overlay
 * showing "Ask Someone to Pay" as a payment option.
 */
export default function EntryCheckout({ scenario, onAskOthers }) {
  const s = scenario;
  const amount = (s.order.amount / 100).toLocaleString('en-IN');
  const lineItems = s.order.line_items || [];

  return (
    <div>
      {/* Simulated merchant page header */}
      <div style={{ background: theme.card, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, boxShadow: theme.shadow, overflow: 'hidden' }}>
        {/* Merchant header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.divider}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: theme.radius, background: `${theme.secondary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: theme.secondary }}>{s.merchant.name[0]}</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{s.merchant.name}</div>
            <div style={{ fontSize: 12, color: theme.textSecondary }}>{s.merchant.category}</div>
          </div>
        </div>

        {/* Order details */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Order Summary
          </div>

          {lineItems.length > 0 ? (
            lineItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: theme.text }}>{item.description}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{'\u20B9'}{(item.amount / 100).toLocaleString('en-IN')}</span>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: theme.text }}>{s.order.description}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{'\u20B9'}{amount}</span>
            </div>
          )}

          <div style={{ height: 1, background: theme.divider, margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: theme.text }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: theme.primary }}>{'\u20B9'}{amount}</span>
          </div>
        </div>
      </div>

      {/* Razorpay Checkout Overlay */}
      <div style={{ marginTop: 16, background: theme.card, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, boxShadow: theme.shadow, overflow: 'hidden' }}>
        {/* Checkout header */}
        <div style={{ padding: '12px 20px', background: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Razorpay Checkout</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{'\u20B9'}{amount}</span>
        </div>

        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Payment Method
          </div>

          {/* Standard payment options (greyed out for demo) */}
          {['UPI / QR', 'Credit / Debit Card', 'Net Banking', 'Wallet'].map((method) => (
            <div key={method} style={{
              padding: '12px 16px', borderRadius: theme.radius, border: `1px solid ${theme.border}`,
              marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              opacity: 0.5,
            }}>
              <span style={{ fontSize: 14, color: theme.text }}>{method}</span>
              <span style={{ fontSize: 12, color: theme.textMuted }}>&rarr;</span>
            </div>
          ))}

          {/* Ask Someone to Pay — the new option */}
          <div style={{ height: 1, background: theme.divider, margin: '12px 0' }} />
          <div style={{ fontSize: 11, fontWeight: 500, color: theme.textSecondary, marginBottom: 8, textAlign: 'center' }}>
            or
          </div>

          <button
            onClick={onAskOthers}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: theme.radius,
              background: `${theme.secondary}10`, border: `1.5px solid ${theme.secondary}`,
              color: theme.secondary, fontSize: 15, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseOver={e => { e.currentTarget.style.background = `${theme.secondary}20`; }}
            onMouseOut={e => { e.currentTarget.style.background = `${theme.secondary}10`; }}
          >
            Ask Someone to Pay
          </button>

          <p style={{ fontSize: 11, color: theme.textMuted, textAlign: 'center', marginTop: 8 }}>
            Send a secure payment request to a family member, friend, or colleague
          </p>
        </div>
      </div>
    </div>
  );
}
