import React, { useState } from 'react';
import { theme } from '../theme';
import * as api from '../api';

import EntryCheckout from './EntryCheckout';
import EntryQRLanding from './EntryQRLanding';
import EntryPaymentLink from './EntryPaymentLink';
import DelegationCompose from './DelegationCompose';
import WhatsAppPreview from './WhatsAppPreview';
import ApproverPage from './ApproverPage';
import StatusPage from './StatusPage';
import HandshakePanel from './HandshakePanel';
import WebhookLog from './WebhookLog';

/**
 * DemoFlow orchestrates the full journey for one scenario.
 *
 * Steps:
 *   entry    -> Entry surface (checkout / QR landing / payment link)
 *   compose  -> Delegation compose (phone, note, channel toggles)
 *   preview  -> WhatsApp/SMS message preview (what approver receives)
 *   approver -> Approver opens link, sees trust context + picks method + pays
 *   processing -> Payment processing
 *   status   -> Result (paid / declined / failed)
 *
 * Webhook log is always visible as a collapsible panel.
 */
export default function DemoFlow({ scenario, onBack }) {
  const [step, setStep] = useState('entry');
  const [delegationResult, setDelegationResult] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [customAmount, setCustomAmount] = useState(null);
  const [error, setError] = useState(null);

  const s = scenario;
  // If static QR set a custom amount, override it for display in compose
  const effectiveScenario = customAmount ? {
    ...s,
    order: { ...s.order, amount: customAmount },
  } : s;

  // ── Step handlers ──────────────────────────────────────────────────

  async function handleAskOthers(overrideAmount) {
    // Only set custom amount if a real number was passed (some call sites pass the click event)
    if (typeof overrideAmount === 'number' && overrideAmount > 0) {
      setCustomAmount(overrideAmount);
    }
    setStep('compose');
  }

  async function handleCompose(formData) {
    try {
      setError(null);
      const res = await api.createDelegation({
        order_id: s.order.id,
        approver_phone: formData.approverPhone || s.approver.phone,
        approver_name: formData.approverName || s.approver.name,
        requestor_phone: s.requestor.phone,
        preamble_text: formData.preamble,
        entry_point: s.entry_point,
        channel_whatsapp: formData.channelWhatsApp,
        channel_sms: formData.channelSMS,
      });
      setDelegationResult(res.data);

      // Mark as shared
      await api.shareDelegation(res.data.delegation.id);
      const updated = await api.getDelegation(res.data.delegation.id);
      setDelegationResult(updated.data);

      setStep('preview');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handlePreviewContinue() {
    try {
      // Mark as opened (approver tapped link)
      await api.openDelegation(delegationResult.delegation.id);
      const updated = await api.getDelegation(delegationResult.delegation.id);
      setDelegationResult(updated.data);
      setStep('approver');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleApproveAndPay(method) {
    try {
      setPaymentMethod(method);
      await api.startPayment(delegationResult.delegation.id, method);
      setStep('processing');

      // Simulate payment processing (2s)
      setTimeout(async () => {
        try {
          await api.capturePayment(delegationResult.delegation.id);
          const updated = await api.getDelegation(delegationResult.delegation.id);
          setDelegationResult(updated.data);
          setStep('status');
        } catch (e) {
          setError(e.message);
        }
      }, 2000);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDecline(reason) {
    try {
      await api.declineDelegation(delegationResult.delegation.id, reason);
      const updated = await api.getDelegation(delegationResult.delegation.id);
      setDelegationResult(updated.data);
      setStep('status');
    } catch (e) {
      setError(e.message);
    }
  }

  // ── Back navigation ────────────────────────────────────────────────
  // Go back one step within the flow. Disabled on 'entry' (use "All scenarios"),
  // 'processing' (payment in flight), and 'status' (terminal).
  const BACK_MAP = { compose: 'entry', preview: 'compose', approver: 'preview' };
  const canGoBack = step in BACK_MAP;
  function handleStepBack() {
    if (canGoBack) setStep(BACK_MAP[step]);
  }

  // ── Render ─────────────────────────────────────────────────────────

  const entryColor = s.entry_point === 'A' ? theme.secondary : s.entry_point === 'B' ? theme.accent : s.entry_point === 'C' ? '#8B5CF6' : theme.secondary;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {/* Top bar */}
      <div style={{
        background: theme.primary, padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{
            background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0',
          }}>
            &larr; All scenarios
          </button>
          {canGoBack && (
            <button onClick={handleStepBack} style={{
              background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 500,
              padding: '4px 10px', borderRadius: theme.radiusFull,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
              title="Go back one step">
              &larr; Back
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Entry {s.entry_point}</span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: entryColor,
            background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: theme.radiusFull,
          }}>{s.trust_tier}</span>
        </div>
      </div>

      {/* Step progress */}
      <StepProgress current={step} entryPoint={s.entry_point} />

      {/* Error banner */}
      {error && (
        <div style={{ background: '#FEF2F2', borderBottom: `1px solid #FECACA`, padding: '10px 16px', fontSize: 13, color: theme.danger }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 12, color: theme.danger, textDecoration: 'underline', background: 'none', fontSize: 13 }}>Dismiss</button>
        </div>
      )}

      {/* Content */}
      <div className="fade-in" style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        {step === 'entry' && s.entry_point === 'A' && (
          <EntryCheckout scenario={s} onAskOthers={handleAskOthers} />
        )}
        {step === 'entry' && s.entry_point === 'B' && (
          <EntryQRLanding scenario={s} onAskOthers={handleAskOthers} />
        )}
        {step === 'entry' && s.entry_point === 'C' && (
          <EntryPaymentLink scenario={s} onAskOthers={handleAskOthers} />
        )}

        {step === 'compose' && (
          <DelegationCompose scenario={effectiveScenario} onSubmit={handleCompose} onCancel={() => setStep('entry')} />
        )}

        {step === 'preview' && delegationResult && (
          <WhatsAppPreview
            delegation={delegationResult.delegation}
            message={delegationResult.message}
            merchant={delegationResult.merchant}
            order={delegationResult.order}
            scenario={s}
            onContinue={handlePreviewContinue}
          />
        )}

        {step === 'approver' && delegationResult && (
          <ApproverPage
            delegation={delegationResult.delegation}
            message={delegationResult.message}
            merchant={delegationResult.merchant}
            order={delegationResult.order}
            scenario={s}
            onApproveAndPay={handleApproveAndPay}
            onDecline={handleDecline}
          />
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{
              width: 48, height: 48, border: `3px solid ${theme.border}`, borderTopColor: theme.accent,
              borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 24px',
            }} />
            <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.text, marginBottom: 8 }}>Processing Payment</h2>
            <p style={{ fontSize: 14, color: theme.textSecondary }}>
              {paymentMethod === 'upi' && 'Completing UPI payment...'}
              {paymentMethod === 'card' && 'Authorizing card payment...'}
              {paymentMethod === 'netbanking' && 'Connecting to bank...'}
              {paymentMethod === 'wallet' && 'Processing wallet payment...'}
            </p>
          </div>
        )}

        {step === 'status' && delegationResult && (
          <StatusPage
            delegation={delegationResult.delegation}
            order={delegationResult.order}
            merchant={delegationResult.merchant}
            scenario={s}
            paymentMethod={paymentMethod}
            onStartOver={onBack}
          />
        )}

        {/* Handshake panel — shows API/state/webhook context on every screen */}
        <HandshakePanel
          step={step}
          scenario={s}
          delegation={delegationResult?.delegation}
          paymentMethod={paymentMethod}
        />
      </div>

      {/* Webhook log (always visible at bottom) */}
      {delegationResult && (
        <WebhookLog orderId={delegationResult.order.id} />
      )}
    </div>
  );
}

// ── Step progress indicator ──────────────────────────────────────────────

const STEPS = [
  { key: 'entry', label: 'Entry' },
  { key: 'compose', label: 'Compose' },
  { key: 'preview', label: 'Share' },
  { key: 'approver', label: 'Pay' },
  { key: 'status', label: 'Done' },
];

function StepProgress({ current }) {
  const currentIdx = STEPS.findIndex(s => s.key === current);
  // Map processing to approver step (payment in progress)
  const effectiveIdx = current === 'processing' ? 3 : currentIdx;

  return (
    <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, maxWidth: 480, margin: '0 auto' }}>
        {STEPS.map((s, i) => {
          const isDone = i < effectiveIdx;
          const isActive = i === effectiveIdx;
          return (
            <React.Fragment key={s.key}>
              {i > 0 && (
                <div style={{ width: 24, height: 1, background: isDone ? theme.accent : theme.border }} />
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', fontSize: 10, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone ? theme.accent : isActive ? theme.secondary : theme.bg,
                  color: isDone || isActive ? '#fff' : theme.textMuted,
                  border: isActive ? 'none' : isDone ? 'none' : `1px solid ${theme.border}`,
                }}>
                  {isDone ? '\u2713' : i + 1}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: isActive ? 600 : 400,
                  color: isActive ? theme.text : isDone ? theme.accent : theme.textMuted,
                  display: isActive || isDone ? 'inline' : 'none',
                }}>
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
