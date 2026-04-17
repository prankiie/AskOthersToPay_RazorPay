import React from 'react';
import { theme } from '../theme';

/**
 * WhatsApp Message Preview — shows what the approver actually receives.
 *
 * Renders:
 *   1. A simulated WhatsApp chat bubble with the message
 *   2. An OG-preview card (link preview with merchant info)
 *   3. "Approver taps link" CTA to continue demo
 */
export default function WhatsAppPreview({ delegation, message, merchant, order, scenario, onContinue }) {
  const s = scenario;
  const amount = (order.amount / 100).toLocaleString('en-IN');

  return (
    <div>
      {/* Context: what happened */}
      <div style={{
        background: `${theme.secondary}08`, borderRadius: theme.radius, padding: '12px 14px',
        marginBottom: 16, fontSize: 13, color: theme.textSecondary, lineHeight: 1.5,
      }}>
        {s.requestor.name} shared this link via WhatsApp to {s.approver.name} ({s.approver.relation || 'Approver'}).
        This is what {s.approver.name} sees on their phone.
      </div>

      {/* WhatsApp mock */}
      <div style={{
        background: '#E5DDD5', borderRadius: theme.radiusLg, overflow: 'hidden',
        boxShadow: theme.shadow, border: `1px solid ${theme.border}`,
      }}>
        {/* WhatsApp header */}
        <div style={{
          background: '#075E54', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#128C7E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 600, color: '#fff',
          }}>{s.requestor.name[0]}</div>
          <div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{s.requestor.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>online</div>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ padding: '16px 12px', minHeight: 200 }}>
          {/* Message bubble */}
          <div style={{
            maxWidth: '85%', marginLeft: 'auto',
            background: '#DCF8C6', borderRadius: '8px 0 8px 8px',
            padding: '8px 10px', position: 'relative',
          }}>
            {/* Preamble (user's note) */}
            {delegation.preamble_text && (
              <p style={{ fontSize: 14, color: '#303030', marginBottom: 8, lineHeight: 1.4 }}>
                {delegation.preamble_text}
              </p>
            )}

            {/* OG link preview card */}
            <div style={{
              background: '#F0F0F0', borderRadius: 6, overflow: 'hidden',
              border: '1px solid #E0E0E0', marginBottom: 4,
            }}>
              {/* OG preview header (merchant colour bar) */}
              <div style={{ height: 4, background: theme.secondary }} />

              <div style={{ padding: '10px 12px' }}>
                {/* Domain */}
                <div style={{ fontSize: 11, color: '#8696A0', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  rzp.io
                </div>
                {/* Title */}
                <div style={{ fontSize: 14, fontWeight: 600, color: '#303030', marginBottom: 4 }}>
                  {message?.preview?.title || `Payment request \u2022 \u20B9${amount}`}
                </div>
                {/* Description */}
                <div style={{ fontSize: 13, color: '#667781', lineHeight: 1.3 }}>
                  {merchant.kyc_status === 'kyc_approved'
                    ? `${merchant.name} \u2713 Verified`
                    : merchant.name}
                  {' \u2022 '}
                  Tap to review and pay
                </div>
              </div>
            </div>

            {/* System block (server-generated, tamper-proof) */}
            <div style={{
              fontSize: 12, color: '#667781', lineHeight: 1.5, marginTop: 4,
              borderTop: '1px solid #C8C8C8', paddingTop: 6, whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
            }}>
              {message?.system_block || `Razorpay payment request\nAmount: \u20B9${amount}\nMerchant: ${merchant.name}`}
            </div>

            {/* Timestamp */}
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: '#8696A0' }}>
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 12 }}>
          {s.approver.name} taps the link and opens the approval page...
        </p>
        <button
          onClick={onContinue}
          style={{
            width: '100%', padding: '14px', borderRadius: theme.radius,
            background: theme.secondary, color: '#fff', fontSize: 15, fontWeight: 600,
          }}
          onMouseOver={e => { e.currentTarget.style.background = theme.primary; }}
          onMouseOut={e => { e.currentTarget.style.background = theme.secondary; }}
        >
          {s.approver.name} Opens Link &rarr;
        </button>
      </div>
    </div>
  );
}
