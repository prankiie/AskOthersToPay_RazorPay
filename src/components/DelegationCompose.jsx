import React, { useState } from 'react';
import { theme } from '../theme';

/**
 * Delegation Compose — the requestor fills in who to ask.
 *
 * Fields:
 *   - Approver phone (pre-filled from scenario)
 *   - Approver name (optional)
 *   - Preamble note (max 140 chars, share-intent: requestor's own words)
 *   - Channel toggles (WhatsApp + SMS, both default on)
 *   - "Share link yourself" as primary, "Let Razorpay send" as fallback
 */
export default function DelegationCompose({ scenario, onSubmit, onCancel }) {
  const s = scenario;
  const [approverPhone, setApproverPhone] = useState(s.approver.phone);
  const [approverName, setApproverName] = useState(s.approver.name);
  const [preamble, setPreamble] = useState(s.default_preamble || '');
  const [channelWhatsApp, setChannelWhatsApp] = useState(true);
  const [channelSMS, setChannelSMS] = useState(true);
  const [sending, setSending] = useState(false);

  const amount = (s.order.amount / 100).toLocaleString('en-IN');
  const charsLeft = 140 - preamble.length;

  function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    onSubmit({
      approverPhone,
      approverName,
      preamble,
      channelWhatsApp,
      channelSMS,
    });
  }

  return (
    <div style={{ background: theme.card, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, boxShadow: theme.shadow, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.divider}` }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: theme.text, marginBottom: 4 }}>Ask Someone to Pay</h2>
        <p style={{ fontSize: 13, color: theme.textSecondary }}>
          {'\u20B9'}{amount} at {s.merchant.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '16px 20px' }}>
        {/* Approver phone */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Who should pay?</label>
          <div style={{ position: 'relative' }}>
            <input
              type="tel"
              value={approverPhone}
              onChange={e => setApproverPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            {/* Contact picker icon — would invoke native contact picker on mobile */}
            <button
              type="button"
              title="Pick from contacts"
              style={{
                position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: theme.radiusSm,
                background: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.secondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Approver name */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Their name (optional)</label>
          <input
            type="text"
            value={approverName}
            onChange={e => setApproverName(e.target.value)}
            placeholder="e.g. Papa, Arjun, Suresh sir"
            style={inputStyle}
          />
        </div>

        {/* Preamble */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Your message (optional)</label>
          <textarea
            value={preamble}
            onChange={e => { if (e.target.value.length <= 140) setPreamble(e.target.value); }}
            placeholder="Write a short note..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
          />
          <div style={{ fontSize: 11, color: charsLeft < 20 ? theme.warning : theme.textMuted, textAlign: 'right', marginTop: 4 }}>
            {charsLeft} characters left
          </div>
        </div>

        {/* Channels */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Send via</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <ChannelToggle
              label="WhatsApp"
              checked={channelWhatsApp}
              onChange={() => setChannelWhatsApp(!channelWhatsApp)}
              color="#25D366"
            />
            <ChannelToggle
              label="SMS"
              checked={channelSMS}
              onChange={() => setChannelSMS(!channelSMS)}
              color={theme.secondary}
            />
          </div>
          <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 8 }}>
            You share the link from your own WhatsApp / SMS. More trusted than a message from Razorpay.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={onCancel} style={{
            flex: 1, padding: '12px', borderRadius: theme.radius,
            background: theme.bg, color: theme.textSecondary, fontSize: 14, fontWeight: 500,
            border: `1px solid ${theme.border}`,
          }}>
            Cancel
          </button>
          <button type="submit" disabled={sending || (!channelWhatsApp && !channelSMS)} style={{
            flex: 2, padding: '12px', borderRadius: theme.radius,
            background: theme.secondary, color: '#fff', fontSize: 14, fontWeight: 600,
            opacity: sending || (!channelWhatsApp && !channelSMS) ? 0.6 : 1,
          }}>
            {sending ? 'Sending...' : 'Share Payment Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ChannelToggle({ label, checked, onChange, color }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        flex: 1, padding: '10px 14px', borderRadius: theme.radius,
        background: checked ? `${color}10` : theme.bg,
        border: `1.5px solid ${checked ? color : theme.border}`,
        color: checked ? color : theme.textMuted,
        fontSize: 13, fontWeight: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}
    >
      <span style={{
        width: 16, height: 16, borderRadius: theme.radiusSm,
        border: `2px solid ${checked ? color : theme.border}`,
        background: checked ? color : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, color: '#fff',
      }}>
        {checked && '\u2713'}
      </span>
      {label}
    </button>
  );
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600, color: theme.textSecondary,
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.3px',
};

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: theme.radius,
  border: `1px solid ${theme.border}`, fontSize: 14, color: theme.text,
  outline: 'none', background: theme.bg,
};
