import React, { useState } from 'react';
import { theme } from '../theme';
import TrustPanel from './TrustPanel';

/**
 * Approver Page — rzp.io/r/{delegation_id}
 *
 * Single screen: trust context + payment method selection + pay.
 * No separate "approve" then "pick method" — one page, one action.
 *
 * Shows:
 *   - Requestor's message
 *   - Amount
 *   - Trust panel (adapts to T1/T2/T3/T4)
 *   - Payment method selector (inline)
 *   - Pay button / Decline
 */

const METHODS = [
  { id: 'upi', label: 'UPI', desc: 'PhonePe, Google Pay, Paytm, BHIM', icon: 'U', color: '#5F259F' },
  { id: 'card', label: 'Card', desc: 'Credit / Debit — Visa, Mastercard, RuPay', icon: 'C', color: '#1A1A2E' },
  { id: 'netbanking', label: 'Net Banking', desc: 'All major Indian banks', icon: 'N', color: '#0E4DA4' },
  { id: 'wallet', label: 'Wallet', desc: 'Paytm, PhonePe, Amazon Pay', icon: 'W', color: '#00BAF2' },
];

export default function ApproverPage({ delegation, message, merchant, order, scenario, onApproveAndPay, onDecline }) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const s = scenario;
  const amount = (order.amount / 100).toLocaleString('en-IN');
  const lineItems = order.line_items ? (typeof order.line_items === 'string' ? JSON.parse(order.line_items) : order.line_items) : [];

  return (
    <div>
      {/* URL bar */}
      <div style={{
        background: '#F3F4F6', borderRadius: `${theme.radius} ${theme.radius} 0 0`,
        padding: '8px 14px', fontSize: 12, color: theme.textSecondary, fontFamily: 'monospace',
        border: `1px solid ${theme.border}`, borderBottom: 'none',
      }}>
        rzp.io/r/{delegation.id}
      </div>

      <div style={{
        background: theme.card, borderRadius: `0 0 ${theme.radiusLg} ${theme.radiusLg}`,
        border: `1px solid ${theme.border}`, boxShadow: theme.shadow, overflow: 'hidden',
      }}>
        {/* Razorpay header */}
        <div style={{ background: theme.primary, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Razorpay</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Payment Request</span>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Preamble — the requestor's own words.
              Note: we intentionally do NOT display a separate "From: {name}" line.
              The WhatsApp/SMS delivery channel carries identity via the saved
              contact on the approver's phone. Razorpay has no verified identity
              to surface here, so we don't invent one. */}
          {delegation.preamble_text && (
            <div style={{
              background: '#F9FAFB', borderRadius: theme.radius, padding: '12px 14px',
              marginBottom: 16, fontSize: 14, color: theme.text, lineHeight: 1.5,
              borderLeft: `3px solid ${theme.secondary}`,
            }}>
              &ldquo;{delegation.preamble_text}&rdquo;
            </div>
          )}

          {/* Amount */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Amount to Pay</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: theme.text }}>{'\u20B9'}{amount}</div>
            {order.description && (
              <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>{order.description}</div>
            )}
          </div>

          {/* Line items (T1 only) */}
          {lineItems.length > 0 && delegation.trust_tier === 'T1' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 8 }}>
                Items
              </div>
              {lineItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: theme.text }}>
                  <span>{item.description}</span>
                  <span style={{ fontWeight: 500 }}>{'\u20B9'}{(item.amount / 100).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ height: 1, background: theme.divider, margin: '16px 0' }} />

          {/* Trust panel — adapts to tier */}
          <TrustPanel merchant={merchant} tier={delegation.trust_tier} />

          <div style={{ height: 1, background: theme.divider, margin: '16px 0' }} />

          {/* Payment method selector (inline) */}
          {!showDecline && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 10 }}>
                Pay with
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {METHODS.map(m => {
                  const isSelected = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: theme.radius,
                        border: `1.5px solid ${isSelected ? m.color : theme.border}`,
                        background: isSelected ? `${m.color}06` : theme.card,
                        display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: theme.radiusSm,
                        background: isSelected ? `${m.color}15` : '#F3F4F6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: isSelected ? m.color : theme.textMuted,
                      }}>{m.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: theme.textMuted }}>{m.desc}</div>
                      </div>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: `2px solid ${isSelected ? m.color : theme.border}`,
                        background: isSelected ? m.color : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pay button */}
              <button
                onClick={() => onApproveAndPay(selectedMethod)}
                style={{
                  width: '100%', padding: '14px', borderRadius: theme.radius,
                  background: theme.accent, color: '#fff', fontSize: 15, fontWeight: 600,
                  marginBottom: 10,
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#168A5F'; }}
                onMouseOut={e => { e.currentTarget.style.background = theme.accent; }}
              >
                Pay {'\u20B9'}{amount} via {METHODS.find(m => m.id === selectedMethod)?.label}
              </button>

              <button
                onClick={() => setShowDecline(true)}
                style={{
                  width: '100%', padding: '12px', borderRadius: theme.radius,
                  background: theme.bg, color: theme.textSecondary, fontSize: 14,
                  border: `1px solid ${theme.border}`,
                }}
              >
                Decline
              </button>
            </>
          )}

          {/* Decline form */}
          {showDecline && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: theme.text, marginBottom: 8 }}>
                Reason for declining (optional)
              </div>
              <textarea
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                placeholder="Let them know why..."
                rows={3}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: theme.radius,
                  border: `1px solid ${theme.border}`, fontSize: 13, outline: 'none',
                  marginBottom: 10, resize: 'none', background: theme.bg,
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowDecline(false)} style={{
                  flex: 1, padding: '10px', borderRadius: theme.radius,
                  background: theme.bg, color: theme.textSecondary, fontSize: 13,
                  border: `1px solid ${theme.border}`,
                }}>Cancel</button>
                <button onClick={() => onDecline(declineReason)} style={{
                  flex: 1, padding: '10px', borderRadius: theme.radius,
                  background: theme.danger, color: '#fff', fontSize: 13, fontWeight: 600,
                }}>Decline</button>
              </div>
            </div>
          )}

          {/* Expiry + security */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 11, color: theme.textMuted }}>
              Expires: {delegation.expires_at ? new Date(delegation.expires_at).toLocaleString('en-IN') : '24 hours'}
            </span>
            <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>
              Secured by Razorpay. All payment methods available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
