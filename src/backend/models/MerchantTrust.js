/**
 * MerchantTrust Model
 * Represents trust signals and fraud metrics for a merchant
 */
class MerchantTrust {
  constructor({
    merchantId,
    name,
    category,
    subcategory,
    trustScore = 0,
    fraudIncidenceRate = 0,
    complaintCount = 0,
    rating = 0,
    totalTransactions = 0,
    verificationStatus = 'unverified',
    categoryAvgFraudRate = 0,
    riskLevel = 'high',
    onboardingDate = null
  }) {
    this.merchantId = merchantId;
    this.name = name;
    this.category = category;
    this.subcategory = subcategory;
    this.trustScore = trustScore; // 0-100
    this.fraudIncidenceRate = fraudIncidenceRate; // percentage (0-100)
    this.complaintCount = complaintCount;
    this.rating = rating; // 1-5
    this.totalTransactions = totalTransactions;
    this.verificationStatus = verificationStatus; // unverified, verified, kyc_approved
    this.categoryAvgFraudRate = categoryAvgFraudRate;
    this.riskLevel = riskLevel; // low, medium, high
    this.onboardingDate = onboardingDate || new Date().toISOString();
    this.lastUpdatedAt = new Date().toISOString();
  }

  /**
   * Get risk level color for UI (green, yellow, red)
   */
  getRiskColor() {
    switch (this.riskLevel) {
      case 'low':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'high':
        return 'red';
      default:
        return 'gray';
    }
  }

  /**
   * Get summary verdict for approver
   */
  getSummaryVerdict() {
    if (this.trustScore >= 75) return 'Very Trustworthy';
    if (this.trustScore >= 50) return 'Moderate Trust';
    if (this.trustScore >= 25) return 'Low Trust';
    return 'Not Recommended';
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      merchant_id: this.merchantId,
      name: this.name,
      category: this.category,
      subcategory: this.subcategory,
      trust_score: this.trustScore,
      fraud_incidence_rate: this.fraudIncidenceRate,
      complaint_count: this.complaintCount,
      rating: this.rating,
      total_transactions: this.totalTransactions,
      verification_status: this.verificationStatus,
      category_avg_fraud_rate: this.categoryAvgFraudRate,
      risk_level: this.riskLevel,
      risk_color: this.getRiskColor(),
      summary_verdict: this.getSummaryVerdict(),
      onboarding_date: this.onboardingDate,
      last_updated_at: this.lastUpdatedAt
    };
  }
}

module.exports = MerchantTrust;
