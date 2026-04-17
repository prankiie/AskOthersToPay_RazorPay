import React, { useState } from 'react';
import { theme } from '../theme';

/**
 * DelegationApproverView
 *
 * Hosted approval page (rzp.io/r/{delegation_id})
 * Per PAYMENT_FLOW_MECHANICS.md §1.2 Step 5-6
 *
 * Shows:
 * - Merchant branding (logo, name)
 * - Order context (amount, item description if available)
 * - Trust panel sized to data tier (T1-T4)
 * - Approve & Pay button
 * - Decline button
 */
export default function DelegationApproverView({
  delegation,
  order,
  merchant,
  message,
  onApprove,
  onDecline
}) {
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onApprove();
    }, 1500);
  };

  const handleDeclineSubmit = () => {
    setIsProcessing(false);
    onDecline(declineReason);
  };

  if (isProcessing) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.spinnerContainer}>
            <div style={styles.spinner}></div>
            <h2 style={styles.processingText}>Opening UPI...</h2>
            <p style={styles.processingSubtext}>Complete payment on your UPI app</p>
          </div>
        </div>
      </div>
    );
  }

  // Render trust panel based on tier
  const renderTrustPanel = () => {
    const tier = delegation.merchant_data_tier;

    if (tier === 'T4') {
      // Low-trust warning overlay (for Razorpay merchants below trust threshold)
      return (
        <div style={styles.trustPanel}>
          <div style={styles.warningBox}>
            <div style={styles.warningIcon}>⚠️</div>
            <div style={styles.warningContent}>
              <h3 style={styles.warningTitle}>Review Carefully</h3>
              <p style={styles.warningText}>
                This merchant has a lower trust score. Please review the details carefully before paying.
              </p>
            </div>
          </div>
        </div>
      );
    } else if (tier === 'T3') {
      // Basic: just name and verification status
      return (
        <div style={styles.trustPanel}>
          <h3 style={styles.trustTitle}>Merchant</h3>
          <div style={styles.trustRow}>
            <span style={styles.trustLabel}>Name:</span>
            <span style={styles.trustValue}>{merchant.name}</span>
          </div>
        </div>
      );
    } else if (tier === 'T2') {
      // Standard: MCC + basic trust
      return (
        <div style={styles.trustPanel}>
          <h3 style={styles.trustTitle}>Merchant Information</h3>
          <div style={styles.trustRow}>
            <span style={styles.trustLabel}>Name:</span>
            <span style={styles.trustValue}>{merchant.name}</span>
          </div>
          {merchant.mcc_label && (
            <div style={styles.trustRow}>
              <span style={styles.trustLabel}>Category:</span>
              <span style={styles.trustValue}>{merchant.mcc_label}</span>
            </div>
          )}
          {merchant.verification_status && (
            <div style={styles.trustRow}>
              <span style={styles.trustLabel}>Status:</span>
              <span style={styles.trustValue}>
                {merchant.verification_status === 'kyc_approved'
                  ? '✓ KYC Verified'
                  : 'Verified'}
              </span>
            </div>
          )}
        </div>
      );
    } else {
      // T1: Full e-commerce trust panel
      return (
        <div style={styles.trustPanel}>
          <h3 style={styles.trustTitle}>Merchant Information & Trust Signals</h3>

          <div style={styles.trustRow}>
            <span style={styles.trustLabel}>Name:</span>
            <span style={styles.trustValue}>
              {merchant.name}
              {merchant.verification_status === 'kyc_approved' && ' ✓ Verified'}
            </span>
          </div>

          {merchant.mcc_label && (
            <div style={styles.trustRow}>
              <span style={styles.trustLabel}>Category:</span>
              <span style={styles.trustValue}>{merchant.mcc_label}</span>
            </div>
          )}

          {merchant.rating && (
            <div style={styles.trustRow}>
              <span style={styles.trustLabel}>Rating:</span>
              <span style={styles.trustValue}>
                {merchant.rating}/5 ({merchant.reviewCount} reviews)
              </span>
            </div>
          )}

          {merchant.trust_score !== undefined && (
            <div style={styles.trustRow}>
              <span style={styles.trustLabel}>Trust Score:</span>
              <span style={styles.trustValue}>{merchant.trust_score}/100</span>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Razorpay</h1>
      </div>

      <div style={styles.card}>
        {/* MESSAGE FROM REQUESTER */}
        <div style={styles.section}>
          <div style={styles.messageBox}>
            <pre style={styles.messageContent}>
              {message?.message || 'Payment request'}
            </pre>
          </div>
        </div>

        <div style={styles.divider}></div>

        {/* AMOUNT */}
        <div style={styles.amountSection}>
          <p style={styles.amountLabel}>Amount to Pay</p>
          <p style={styles.amountValue}>
            ₹{order?.amount ? (order.amount / 100).toLocaleString('en-IN') : '0'}
          </p>
        </div>

        <div style={styles.divider}></div>

        {/* TRUST PANEL - sized to tier */}
        {renderTrustPanel()}

        <div style={styles.divider}></div>

        {/* ACTION BUTTONS */}
        <div style={styles.actionSection}>
          {!showDeclineReason ? (
            <>
              <button
                type="button"
                onClick={handleApprove}
                style={styles.approveBtn}
              >
                Approve & Pay
              </button>
              <button
                type="button"
                onClick={() => setShowDeclineReason(true)}
                style={styles.declineBtn}
              >
                Decline
              </button>
            </>
          ) : (
            <div style={styles.declineForm}>
              <p style={styles.declineLabel}>Reason for declining (optional):</p>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                style={styles.reasonInput}
                placeholder="Tell the requester why..."
              />
              <div style={styles.declineActions}>
                <button
                  type="button"
                  onClick={handleDeclineSubmit}
                  style={styles.submitDeclineBtn}
                >
                  Submit Decline
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeclineReason(false);
                    setDeclineReason('');
                  }}
                  style={styles.cancelDeclineBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* EXPIRY INFO */}
        <div style={styles.expiryInfo}>
          <p style={styles.expiryText}>
            Expires: {delegation.expires_at
              ? new Date(delegation.expires_at).toLocaleString('en-IN')
              : 'TBD'}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.lightGray,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    marginTop: '20px'
  },
  logo: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    color: '#3b82f6'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
    padding: '24px'
  },
  section: {
    marginBottom: '20px'
  },
  messageBox: {
    backgroundColor: theme.lightGray,
    borderRadius: '4px',
    padding: '16px',
    marginBottom: '12px'
  },
  messageContent: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.5',
    color: theme.darkText,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  divider: {
    height: '1px',
    backgroundColor: theme.lightGray,
    margin: '20px 0'
  },
  amountSection: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  amountLabel: {
    display: 'block',
    fontSize: '14px',
    color: theme.mediumGray,
    marginBottom: '8px'
  },
  amountValue: {
    display: 'block',
    fontSize: '36px',
    fontWeight: 700,
    color: '#10b981'
  },
  trustPanel: {
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
    padding: '16px',
    marginBottom: '12px'
  },
  trustTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: theme.darkText
  },
  trustRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: `1px solid ${theme.lightGray}`
  },
  trustLabel: {
    fontSize: '13px',
    color: theme.mediumGray
  },
  trustValue: {
    fontSize: '13px',
    fontWeight: 500,
    color: theme.darkText
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    padding: '12px',
    borderRadius: '4px',
    display: 'flex',
    gap: '12px'
  },
  warningIcon: {
    fontSize: '20px',
    lineHeight: '1'
  },
  warningContent: {
    flex: 1
  },
  warningTitle: {
    margin: '0 0 4px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#92400e'
  },
  warningText: {
    margin: 0,
    fontSize: '12px',
    color: '#92400e'
  },
  actionSection: {
    marginBottom: '12px'
  },
  approveBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '10px'
  },
  declineBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: theme.lightGray,
    color: theme.darkText,
    border: 'none',
    borderRadius: '4px',
    fontSize: '15px',
    cursor: 'pointer'
  },
  declineForm: {
    marginBottom: '12px'
  },
  declineLabel: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: 500,
    color: theme.darkText
  },
  reasonInput: {
    width: '100%',
    padding: '10px',
    border: `1px solid ${theme.lightGray}`,
    borderRadius: '4px',
    fontSize: '13px',
    minHeight: '80px',
    boxSizing: 'border-box',
    marginBottom: '10px'
  },
  declineActions: {
    display: 'flex',
    gap: '10px'
  },
  submitDeclineBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  cancelDeclineBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: theme.lightGray,
    color: theme.darkText,
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  expiryInfo: {
    textAlign: 'center',
    paddingTop: '12px',
    borderTop: `1px solid ${theme.lightGray}`
  },
  expiryText: {
    margin: 0,
    fontSize: '12px',
    color: theme.mediumGray
  },
  spinnerContainer: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `4px solid ${theme.lightGray}`,
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  processingText: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: theme.darkText
  },
  processingSubtext: {
    margin: 0,
    fontSize: '14px',
    color: theme.mediumGray
  }
};
