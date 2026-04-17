import React from 'react';
import { theme } from '../theme';

/**
 * PaymentMethodSelector — Razorpay Checkout payment method selection.
 *
 * The approver picks how to pay: UPI, Card, Net Banking, or Wallet.
 * This is standard Razorpay Checkout — the delegation doesn't constrain
 * the payment rail. All methods are available.
 */
export default function PaymentMethodSelector({ order, merchant, onSelect, onBack }) {
  const amount = (order.amount / 100).toLocaleString('en-IN');

  const methods = [
    {
      id: 'upi',
      label: 'UPI',
      description: 'PhonePe, Google Pay, Paytm, BHIM',
      icon: 'U',
      color: '#5F259F',
    },
    {
      id: 'card',
      label: 'Credit / Debit Card',
      description: 'Visa, Mastercard, RuPay',
      icon: 'C',
      color: '#1A1A2E',
    },
    {
      id: 'netbanking',
      label: 'Net Banking',
      description: 'All major Indian banks',
      icon: 'N',
      color: '#0E4DA4',
    },
    {
      id: 'wallet',
      label: 'Wallet',
      description: 'Paytm, PhonePe, Amazon Pay',
      icon: 'W',
      color: '#00BAF2',
    },
  ];

  return (
    <div style={{
      background: theme.card, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ background: theme.primary, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onBack} style={{ background: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 16, padding: 0 }}>&larr;</button>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Choose Payment Method</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>{'\u20B9'}{amount}</span>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 16 }}>
          Paying to <strong>{merchant.name}</strong>
        </p>

        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: theme.radius,
              border: `1px solid ${theme.border}`, background: theme.card,
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: 8, textAlign: 'left',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = m.color; e.currentTarget.style.background = `${m.color}05`; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.card; }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: theme.radius, background: `${m.color}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: m.color, flexShrink: 0,
            }}>
              {m.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{m.label}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>{m.description}</div>
            </div>
            <div style={{ color: theme.textMuted, fontSize: 14 }}>&rarr;</div>
          </button>
        ))}

        <p style={{ fontSize: 11, color: theme.textMuted, textAlign: 'center', marginTop: 12 }}>
          Secured by Razorpay. All payment methods available.
        </p>
      </div>
    </div>
  );
}
