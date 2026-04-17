import React, { useState } from 'react';
import { theme } from '../theme';

export default function CheckoutPage({ onAskOthersClick }) {
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handlePayNow = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
    }, 1500);
  };

  if (paymentStatus === 'processing') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.spinnerContainer}>
            <div style={styles.spinner}></div>
            <h2 style={styles.processingText}>Processing Payment...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successText}>Payment Successful!</h2>
            <p style={styles.successSubtext}>Your order has been confirmed</p>
            <button
              style={styles.newOrderBtn}
              onClick={() => setPaymentStatus(null)}
            >
              New Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Razorpay</h1>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>Order Summary</h2>

        <div style={styles.orderItem}>
          <div>
            <p style={styles.itemName}>Sony WH-CH720 Headphones</p>
            <p style={styles.itemSubtext}>Blue - Wireless</p>
          </div>
          <p style={styles.itemPrice}>₹4,999</p>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.merchantInfo}>
          <h3 style={styles.merchantTitle}>Merchant</h3>
          <p style={styles.merchantName}>ElectroHub India</p>
          <p style={styles.merchantSubtext}>Electronics Retailer • Verified</p>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total Amount</span>
          <span style={styles.totalAmount}>₹4,999</span>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.buttonContainer}>
          <button
            style={{
              ...styles.btn,
              ...styles.payNowBtn,
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#0a1f47';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = theme.primary;
            }}
            onClick={handlePayNow}
          >
            Pay Now
          </button>

          <button
            style={{
              ...styles.btn,
              ...styles.askOthersBtn,
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#4078d4';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = theme.secondary;
            }}
            onClick={onAskOthersClick}
          >
            💬 Ask Someone to Pay
          </button>
        </div>

        <p style={styles.securityNote}>
          🔒 Your payment information is secure and encrypted
        </p>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>Powered by Razorpay</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.lightGray,
    padding: '16px',
  },
  header: {
    padding: '20px 0',
    textAlign: 'center',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    color: theme.primary,
    margin: 0,
  },
  card: {
    backgroundColor: theme.white,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '480px',
    margin: '0 auto',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: theme.primary,
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  itemName: {
    fontSize: '15px',
    fontWeight: '500',
    color: theme.textPrimary,
    margin: 0,
  },
  itemSubtext: {
    fontSize: '13px',
    color: theme.textSecondary,
    margin: '4px 0 0 0',
  },
  itemPrice: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.primary,
    margin: 0,
  },
  divider: {
    height: '1px',
    backgroundColor: theme.mediumGray,
    margin: '16px 0',
  },
  merchantInfo: {
    marginBottom: '16px',
  },
  merchantTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    margin: '0 0 8px 0',
  },
  merchantName: {
    fontSize: '15px',
    fontWeight: '500',
    color: theme.textPrimary,
    margin: 0,
  },
  merchantSubtext: {
    fontSize: '13px',
    color: theme.textSecondary,
    margin: '4px 0 0 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  totalLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: theme.textSecondary,
  },
  totalAmount: {
    fontSize: '24px',
    fontWeight: '700',
    color: theme.primary,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
  btn: {
    padding: '14px 16px',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  payNowBtn: {
    backgroundColor: theme.primary,
    color: theme.white,
  },
  askOthersBtn: {
    backgroundColor: theme.secondary,
    color: theme.white,
  },
  securityNote: {
    fontSize: '12px',
    color: theme.textSecondary,
    textAlign: 'center',
    margin: 0,
  },
  footer: {
    textAlign: 'center',
    marginTop: '32px',
  },
  footerText: {
    fontSize: '12px',
    color: theme.textSecondary,
  },
  spinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: `4px solid ${theme.mediumGray}`,
    borderTop: `4px solid ${theme.secondary}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  processingText: {
    marginTop: '24px',
    fontSize: '18px',
    fontWeight: '600',
    color: theme.primary,
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: theme.trustGreen,
    color: theme.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    fontWeight: '700',
  },
  successText: {
    marginTop: '24px',
    fontSize: '20px',
    fontWeight: '600',
    color: theme.primary,
  },
  successSubtext: {
    marginTop: '8px',
    fontSize: '14px',
    color: theme.textSecondary,
  },
  newOrderBtn: {
    marginTop: '24px',
    padding: '12px 24px',
    backgroundColor: theme.secondary,
    color: theme.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
