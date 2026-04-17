import React from 'react';
import { theme } from '../theme';

/**
 * StatusPage — final result after payment/decline/expiry.
 * Shows to both requestor and approver.
 */
export default function StatusPage({ delegation, order, merchant, scenario, paymentMethod, onStartOver, onRedelegate }) {
  const s = scenario;
  const amount = (order.amount / 100).toLocaleString('en-IN');
  const isPaid = delegation.state === 'paid';
  const isDeclined = delegation.state === 'declined';
  const isExpired = !isPaid && !isDeclined;
  const canRedelegate = (isDeclined || isExpired) && typeof onRedelegate === 'function';

  const methodLabels = { upi: 'UPI', card: 'Card', netbanking: 'Net Banking', wallet: 'Wallet' };

  return (
    <div>
      <div style={{
        background: theme.card, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow, overflow: 'hidden',
      }}>
        {/* Status header */}
        <div style={{
          padding: '32px 20px', textAlign: 'center',
          background: isPaid ? `${theme.accent}08` : isDeclined ? `${theme.danger}08` : `${theme.warning}08`,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
            background: isPaid ? theme.accent : isDeclined ? theme.danger : theme.warning,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: '#fff',
          }}>
            {isPaid ? '\u2713' : isDeclined ? '\u2717' : '!'}
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, marginBottom: 4 }}>
            {isPaid && 'Payment Successful'}
            {isDeclined && 'Request Declined'}
            {!isPaid && !isDeclined && 'Request Expired'}
          </h2>

          <p style={{ fontSize: 14, color: theme.textSecondary }}>
            {isPaid && `${s.approver.name} paid \u20B9${amount} via ${methodLabels[paymentMethod] || paymentMethod || 'Razorpay'}`}
            {isDeclined && `${s.approver.name} declined this payment request`}
          </p>
        </div>

        {/* Details */}
        <div style={{ padding: '20px' }}>
          <DetailRow label="Order" value={order.id} />
          <DetailRow label="Amount" value={`\u20B9${amount}`} />
          <DetailRow label="Merchant" value={merchant.name} />
          <DetailRow label="Requested by" value={s.requestor.name} />
          <DetailRow label="Approver" value={`${s.approver.name} (${s.approver.relation || 'Approver'})`} />
          <DetailRow label="Entry point" value={`${s.entry_point}: ${s.entry_label.split('(')[0].trim()}`} />
          <DetailRow label="Trust tier" value={delegation.trust_tier} />
          <DetailRow label="Delegation" value={delegation.id} mono />
          {isPaid && delegation.payment_method && (
            <DetailRow label="Payment method" value={methodLabels[delegation.payment_method] || delegation.payment_method} />
          )}
          {isDeclined && delegation.decline_reason && (
            <DetailRow label="Decline reason" value={delegation.decline_reason} />
          )}
          <DetailRow label="State" value={delegation.state} highlight />

          <div style={{ height: 1, background: theme.divider, margin: '16px 0' }} />

          {/* What merchant receives */}
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 8 }}>
            Merchant receives
          </div>
          <div style={{
            background: '#F9FAFB', borderRadius: theme.radius, padding: '10px 12px',
            fontSize: 12, fontFamily: 'monospace', color: theme.text, lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {isPaid && (
              <>
                <span style={{ color: theme.accent }}>order.delegation_approved</span>{'\n'}
                <span style={{ color: theme.accent }}>payment.captured</span>{'\n'}
                <span style={{ color: theme.accent }}>order.paid</span>
              </>
            )}
            {isDeclined && <span style={{ color: theme.danger }}>order.delegation_declined</span>}
            {!isPaid && !isDeclined && <span style={{ color: theme.warning }}>order.delegation_expired</span>}
          </div>
          <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 6 }}>
            Same webhook contract as a normal Razorpay payment. Merchant fulfils order as usual.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ marginTop: 20, textAlign: 'center', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {canRedelegate && (
          <button
            onClick={() => onRedelegate(delegation.id)}
            style={{
              padding: '12px 24px', borderRadius: theme.radius,
              background: theme.accent, color: '#fff', fontSize: 14, fontWeight: 600,
            }}
            title="Spawn a new delegation for a different approver on the same order"
          >
            Redelegate to someone else
          </button>
        )}
        <button
          onClick={onStartOver}
          style={{
            padding: '12px 24px', borderRadius: theme.radius,
            background: canRedelegate ? theme.card : theme.secondary,
            color: canRedelegate ? theme.textSecondary : '#fff',
            fontSize: 14, fontWeight: 500,
            border: canRedelegate ? `1px solid ${theme.border}` : 'none',
          }}
        >
          &larr; Try Another Scenario
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${theme.divider}` }}>
      <span style={{ fontSize: 13, color: theme.textSecondary }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: highlight ? 600 : 500, color: highlight ? theme.accent : theme.text,
        fontFamily: mono ? 'monospace' : 'inherit', textAlign: 'right', maxWidth: '60%',
        wordBreak: 'break-all',
      }}>{value}</span>
    </div>
  );
}
