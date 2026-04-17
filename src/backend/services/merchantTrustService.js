const { getMerchantTrust } = require('../data/mockMerchants');
const assumedIntegrations = require('../config/assumedIntegrations');

/**
 * MerchantTrustService
 * Service to fetch merchant trust signals and fraud/risk assessment
 *
 * v1 APPROACH (April 2026):
 * - Does NOT compute custom merchant trust scores
 * - Reuses Razorpay's internal fraud/risk score (query from Razorpay risk API)
 * - T4 warning overlay triggered by: (a) Razorpay internal fraud/risk score flagged-high, OR (b) merchant age < 30 days
 * - Displays KYC badge, merchant age (tenure), MCC category as trust signals only
 *
 * ASSUMPTION: Razorpay risk team to confirm exact field name for fraud/risk flag
 * See config/assumedIntegrations.js::razorpayInternalFraudScore for details
 * Owner: Razorpay Risk / Fraud team
 * Blocker: YES (gates T4 warning overlay, gates Phase 1 launch)
 *
 * See DEPENDENCIES_AND_CLARIFICATIONS.md#Section8 for full matrix of assumptions.
 */
class MerchantTrustService {
  /**
   * Check if merchant should trigger T4 warning overlay
   * v1 logic: warning if (a) Razorpay internal fraud/risk score flagged-high, OR (b) merchant age < 30 days
   * @param {string} merchantId - The merchant ID
   * @returns {boolean} True if warning overlay should be shown
   */
  static shouldShowWarningOverlay(merchantId) {
    const merchantTrust = getMerchantTrust(merchantId);

    if (!merchantTrust) {
      return false;
    }

    // ASSUMPTION: Razorpay risk team to confirm exact field name for fraud/risk flag
    // Currently using mock data: if trustScore < 40 OR merchant age < 30 days, show warning
    // On integration, replace fieldName with actual API field from assumedIntegrations::razorpayInternalFraudScore::fieldNameFraudFlagHigh
    // See config/assumedIntegrations.js for details; owner: Razorpay risk team
    const ageDays = Math.floor((Date.now() - new Date(merchantTrust.onboardingDate)) / (1000 * 60 * 60 * 24));
    const fraudScoreFlaggedHigh = merchantTrust.trustScore < 40; // Mock: use trust_score as proxy for fraud flag

    // Integration point: Replace with actual call to Razorpay risk API
    // const fraudScoreFlaggedHigh = await this.queryRazorpayFraudScore(merchantId);
    // const fraudScoreFieldName = assumedIntegrations.razorpayInternalFraudScore.fieldNameFraudFlagHigh;

    return fraudScoreFlaggedHigh || ageDays < 30;
  }

  /**
   * Get merchant age in days
   * @param {string} merchantId - The merchant ID
   * @returns {number} Age in days since onboarding
   */
  static getMerchantAgeDays(merchantId) {
    const merchantTrust = getMerchantTrust(merchantId);

    if (!merchantTrust) {
      return null;
    }

    return Math.floor((Date.now() - new Date(merchantTrust.onboardingDate)) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get full trust profile for a merchant
   * @param {string} merchantId - The merchant ID
   * @returns {object} Trust profile with all signals
   */
  static getTrustProfile(merchantId) {
    const merchantTrust = getMerchantTrust(merchantId);

    if (!merchantTrust) {
      return null;
    }

    return {
      merchant_id: merchantTrust.merchantId,
      name: merchantTrust.name,
      category: merchantTrust.category,
      subcategory: merchantTrust.subcategory,
      trust_score: merchantTrust.trustScore,
      fraud_incidence_rate: merchantTrust.fraudIncidenceRate,
      complaint_count: merchantTrust.complaintCount,
      rating: merchantTrust.rating,
      total_transactions: merchantTrust.totalTransactions,
      verification_status: merchantTrust.verificationStatus,
      category_avg_fraud_rate: merchantTrust.categoryAvgFraudRate,
      risk_level: merchantTrust.riskLevel,
      risk_color: merchantTrust.getRiskColor(),
      summary_verdict: merchantTrust.getSummaryVerdict(),
      onboarding_date: merchantTrust.onboardingDate,
      last_updated_at: merchantTrust.lastUpdatedAt,
      // Additional signals for approver decision
      signals: this.getSignals(merchantTrust),
      recommendation: this.getRecommendation(merchantTrust)
    };
  }

  /**
   * Get trust signals for display to approver
   * @param {MerchantTrust} merchantTrust - Trust object
   * @returns {array} Array of signals with icons/colors
   */
  static getSignals(merchantTrust) {
    const signals = [];

    // Verification status signal
    if (merchantTrust.verificationStatus === 'kyc_approved') {
      signals.push({
        type: 'verification',
        status: 'verified',
        label: 'KYC Verified',
        color: 'green',
        icon: 'checkmark'
      });
    } else if (merchantTrust.verificationStatus === 'verified') {
      signals.push({
        type: 'verification',
        status: 'partially_verified',
        label: 'Verified',
        color: 'yellow',
        icon: 'info'
      });
    } else {
      signals.push({
        type: 'verification',
        status: 'unverified',
        label: 'Not Verified',
        color: 'red',
        icon: 'alert'
      });
    }

    // Fraud rate signal
    if (merchantTrust.fraudIncidenceRate < 1) {
      signals.push({
        type: 'fraud_rate',
        status: 'low',
        label: `Low fraud rate (${merchantTrust.fraudIncidenceRate.toFixed(2)}%)`,
        color: 'green',
        icon: 'shield'
      });
    } else if (merchantTrust.fraudIncidenceRate < 3) {
      signals.push({
        type: 'fraud_rate',
        status: 'medium',
        label: `Medium fraud rate (${merchantTrust.fraudIncidenceRate.toFixed(2)}%)`,
        color: 'yellow',
        icon: 'warning'
      });
    } else {
      signals.push({
        type: 'fraud_rate',
        status: 'high',
        label: `High fraud rate (${merchantTrust.fraudIncidenceRate.toFixed(2)}%)`,
        color: 'red',
        icon: 'alert'
      });
    }

    // Rating signal
    if (merchantTrust.rating >= 4.5) {
      signals.push({
        type: 'rating',
        status: 'excellent',
        label: `Excellent rating (${merchantTrust.rating}/5)`,
        color: 'green',
        icon: 'star'
      });
    } else if (merchantTrust.rating >= 3.5) {
      signals.push({
        type: 'rating',
        status: 'good',
        label: `Good rating (${merchantTrust.rating}/5)`,
        color: 'green',
        icon: 'star'
      });
    } else if (merchantTrust.rating >= 2.5) {
      signals.push({
        type: 'rating',
        status: 'fair',
        label: `Fair rating (${merchantTrust.rating}/5)`,
        color: 'yellow',
        icon: 'star'
      });
    } else {
      signals.push({
        type: 'rating',
        status: 'poor',
        label: `Poor rating (${merchantTrust.rating}/5)`,
        color: 'red',
        icon: 'star'
      });
    }

    // Transaction volume signal
    if (merchantTrust.totalTransactions > 100000) {
      signals.push({
        type: 'volume',
        status: 'high',
        label: `High transaction volume (${(merchantTrust.totalTransactions / 1000).toFixed(0)}K+ transactions)`,
        color: 'green',
        icon: 'trending_up'
      });
    } else if (merchantTrust.totalTransactions > 10000) {
      signals.push({
        type: 'volume',
        status: 'medium',
        label: `Moderate transaction volume (${(merchantTrust.totalTransactions / 1000).toFixed(0)}K+ transactions)`,
        color: 'yellow',
        icon: 'trending_up'
      });
    } else {
      signals.push({
        type: 'volume',
        status: 'low',
        label: `Low transaction volume (${merchantTrust.totalTransactions} transactions)`,
        color: 'red',
        icon: 'alert'
      });
    }

    return signals;
  }

  /**
   * Get recommendation text for approver
   * @param {MerchantTrust} merchantTrust - Trust object
   * @returns {object} Recommendation with status and message
   */
  static getRecommendation(merchantTrust) {
    if (merchantTrust.trustScore >= 80) {
      return {
        status: 'recommended',
        message: 'This is a well-established, trusted merchant. Safe to approve.',
        color: 'green'
      };
    } else if (merchantTrust.trustScore >= 60) {
      return {
        status: 'caution',
        message: 'This merchant is moderately trusted. Review before approving.',
        color: 'yellow'
      };
    } else if (merchantTrust.trustScore >= 40) {
      return {
        status: 'not_recommended',
        message: 'This merchant has some concerns. Consider declining.',
        color: 'orange'
      };
    } else {
      return {
        status: 'high_risk',
        message: 'This merchant has high risk signals. We recommend declining.',
        color: 'red'
      };
    }
  }

  /**
   * Get trust score breakdown (for analytics/debugging)
   * @param {string} merchantId - The merchant ID
   * @returns {object} Score breakdown
   */
  static getTrustScoreBreakdown(merchantId) {
    const merchantTrust = getMerchantTrust(merchantId);

    if (!merchantTrust) {
      return null;
    }

    // Score components (weighted)
    const verificationWeight = 20;
    const fraudRateWeight = 30;
    const ratingWeight = 25;
    const volumeWeight = 15;
    const complaintWeight = 10;

    let verificationScore = 0;
    if (merchantTrust.verificationStatus === 'kyc_approved') {
      verificationScore = 100;
    } else if (merchantTrust.verificationStatus === 'verified') {
      verificationScore = 60;
    }

    // Fraud rate: lower is better (reverse scoring)
    const fraudRateScore = Math.max(0, 100 - (merchantTrust.fraudIncidenceRate * 15));

    // Rating: normalize to 0-100
    const ratingScore = (merchantTrust.rating / 5) * 100;

    // Volume: normalize (assume max 500k is excellent)
    const volumeScore = Math.min(100, (merchantTrust.totalTransactions / 500000) * 100);

    // Complaints: lower is better (normalize)
    const complaintScore = Math.max(0, 100 - (merchantTrust.complaintCount / 10));

    return {
      merchant_id: merchantTrust.merchantId,
      overall_score: merchantTrust.trustScore,
      components: {
        verification: {
          weight: verificationWeight,
          score: Math.round(verificationScore),
          status: merchantTrust.verificationStatus
        },
        fraud_rate: {
          weight: fraudRateWeight,
          score: Math.round(fraudRateScore),
          rate: merchantTrust.fraudIncidenceRate,
          category_avg: merchantTrust.categoryAvgFraudRate
        },
        rating: {
          weight: ratingWeight,
          score: Math.round(ratingScore),
          rating: merchantTrust.rating,
          total_reviews: merchantTrust.totalTransactions
        },
        volume: {
          weight: volumeWeight,
          score: Math.round(volumeScore),
          transactions: merchantTrust.totalTransactions
        },
        complaints: {
          weight: complaintWeight,
          score: Math.round(complaintScore),
          count: merchantTrust.complaintCount
        }
      }
    };
  }
}

module.exports = MerchantTrustService;
