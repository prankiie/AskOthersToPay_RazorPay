import React from 'react';
import { theme } from '../theme';

/**
 * TrustPanel — renders merchant context adapted to data tier.
 *
 * Not a "trust score". An advisory gradient based on how much information
 * Razorpay can surface about the merchant:
 *
 *   T1: Very strong support — verified enterprise with rich order data
 *   T2: Strong support — KYC-verified merchant with category and tenure
 *   T3: Neutral — basic merchant information
 *   T4: Caution advised — limited information or flagged signals
 *
 * Eligibility to use the feature is gated upstream (merchants must be
 * verified and meet tenure minimums). T4 is the advisory level when a
 * merchant that passed eligibility has less corroborating data, or when
 * trust signals shift during an in-flight delegation.
 */
export default function TrustPanel({ merchant, tier }) {
  if (tier === 'T4') return <T4Warning merchant={merchant} />;
  if (tier === 'T3') return <T3Basic merchant={merchant} />;
  if (tier === 'T2') return <T2Standard merchant={merchant} />;
  return <T1Enterprise merchant={merchant} />;
}

function T1Enterprise({ merchant }) {
  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ ...badgeStyle, background: `${theme.tierT1}15`, color: theme.tierT1 }}>T1</div>
        <span style={titleStyle}>Very strong support</span>
      </div>
      <Row label="Merchant" value={<>{merchant.name} <span style={{ color: theme.accent }}>{'\u2713'} KYC Verified</span></>} />
      {merchant.mcc_label && <Row label="Category" value={merchant.mcc_label} />}
      {merchant.tenure_days > 0 && <Row label="On Razorpay since" value={tenureLabel(merchant.tenure_days)} />}
      <Row label="Verification" value={kycLabel(merchant.kyc_status)} />
    </div>
  );
}

function T2Standard({ merchant }) {
  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ ...badgeStyle, background: `${theme.tierT2}15`, color: theme.tierT2 }}>T2</div>
        <span style={titleStyle}>Strong support</span>
      </div>
      <Row label="Merchant" value={merchant.name} />
      {merchant.mcc_label && <Row label="Category" value={merchant.mcc_label} />}
      <Row label="Verification" value={kycLabel(merchant.kyc_status)} />
      {merchant.tenure_days > 0 && <Row label="On Razorpay" value={tenureLabel(merchant.tenure_days)} />}
    </div>
  );
}

function T3Basic({ merchant }) {
  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ ...badgeStyle, background: `${theme.tierT3}15`, color: theme.tierT3 }}>T3</div>
        <span style={titleStyle}>Neutral</span>
      </div>
      <Row label="Name" value={merchant.name} />
      <Row label="Status" value={kycLabel(merchant.kyc_status)} />
    </div>
  );
}

function T4Warning({ merchant }) {
  return (
    <div style={{
      background: '#FFFBEB', border: `1px solid #FDE68A`, borderRadius: theme.radius,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ ...badgeStyle, background: `${theme.tierT4}15`, color: theme.tierT4, flexShrink: 0, marginTop: 2 }}>T4</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
            Caution advised
          </div>
          <p style={{ fontSize: 13, color: '#A16207', lineHeight: 1.5, marginBottom: 8 }}>
            Razorpay has limited information to share about this merchant right now.
            Check with the person who sent you this request before you pay.
          </p>
          <div style={{ fontSize: 12, color: '#A16207' }}>
            <strong>{merchant.name}</strong>
            {merchant.tenure_days < 90 && ` \u2022 Joined ${merchant.tenure_days} days ago`}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${theme.divider}` }}>
      <span style={{ fontSize: 13, color: theme.textSecondary }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: theme.text, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function kycLabel(status) {
  if (status === 'kyc_approved') return <span style={{ color: theme.accent }}>{'\u2713'} KYC Verified</span>;
  if (status === 'verified') return <span style={{ color: theme.textSecondary }}>{'\u2713'} Verified</span>;
  return <span style={{ color: theme.warning }}>Unverified</span>;
}

function tenureLabel(days) {
  if (days > 365) return `${Math.floor(days / 365)}+ years`;
  if (days > 30) return `${Math.floor(days / 30)} months`;
  return `${days} days`;
}

const panelStyle = {
  background: '#F9FAFB', borderRadius: theme.radius, padding: '14px 16px',
  border: `1px solid ${theme.border}`,
};

const badgeStyle = {
  fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: theme.radiusSm,
};

const titleStyle = {
  fontSize: 13, fontWeight: 600, color: theme.text,
};
