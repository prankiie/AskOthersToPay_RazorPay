const MerchantTrust = require('../models/MerchantTrust');

/**
 * Mock merchant data with realistic Indian merchants
 * Per MESSAGE_TEMPLATES.md §Templates by merchant data tier:
 * - T1: Rich e-commerce (merchant passed line_items)
 * - T2: Standard Razorpay merchant (MCC + tenure + dispute data)
 * - T3: Small / new Razorpay merchant (basic KYC only)
 * - T4: Low-trust warning overlay (any tier)
 *
 * These would come from Razorpay's merchant database in production
 */
const mockMerchants = {
  'MERC_001': new MerchantTrust({
    merchantId: 'MERC_001',
    name: 'Swiggy Food Delivery',
    category: 'Food & Beverage',
    subcategory: 'Food Delivery',
    trustScore: 92,
    fraudIncidenceRate: 0.2,
    complaintCount: 15,
    rating: 4.8,
    totalTransactions: 450000,
    verificationStatus: 'kyc_approved',
    categoryAvgFraudRate: 1.5,
    riskLevel: 'low',
    onboardingDate: '2018-06-15T00:00:00Z',
    // Data tier T1: Has line_items + all trust signals
    data_tier: 'T1',
    has_line_items: true,
    mcc_code: 5812,
    mcc_label: 'Eating Places and Restaurants',
    tenure_days: 2500,
    is_razorpay_merchant: true
  }),

  'MERC_002': new MerchantTrust({
    merchantId: 'MERC_002',
    name: 'Myntra Fashion Store',
    category: 'Retail',
    subcategory: 'Fashion & Apparel',
    trustScore: 88,
    fraudIncidenceRate: 0.8,
    complaintCount: 42,
    rating: 4.6,
    totalTransactions: 350000,
    verificationStatus: 'kyc_approved',
    categoryAvgFraudRate: 2.0,
    riskLevel: 'low',
    onboardingDate: '2017-03-22T00:00:00Z',
    // Data tier T1: Rich e-commerce with line_items
    data_tier: 'T1',
    has_line_items: true,
    mcc_code: 5411,
    mcc_label: 'Department Stores',
    tenure_days: 2800,
    is_razorpay_merchant: true
  }),

  'MERC_003': new MerchantTrust({
    merchantId: 'MERC_003',
    name: 'Croma Electronics',
    category: 'Electronics',
    subcategory: 'Consumer Electronics',
    trustScore: 85,
    fraudIncidenceRate: 1.2,
    complaintCount: 28,
    rating: 4.5,
    totalTransactions: 280000,
    verificationStatus: 'kyc_approved',
    categoryAvgFraudRate: 2.5,
    riskLevel: 'low',
    onboardingDate: '2016-11-10T00:00:00Z',
    // Data tier T2: Has MCC + tenure + disputes but limited line_items
    data_tier: 'T2',
    has_line_items: false,
    mcc_code: 5732,
    mcc_label: 'Electronics and Appliance Stores',
    tenure_days: 3100,
    is_razorpay_merchant: true
  }),

  'MERC_004': new MerchantTrust({
    merchantId: 'MERC_004',
    name: 'BookMyShow Entertainment',
    category: 'Entertainment',
    subcategory: 'Ticketing',
    trustScore: 90,
    fraudIncidenceRate: 0.5,
    complaintCount: 8,
    rating: 4.7,
    totalTransactions: 520000,
    verificationStatus: 'kyc_approved',
    categoryAvgFraudRate: 1.8,
    riskLevel: 'low',
    onboardingDate: '2015-08-01T00:00:00Z',
    // Data tier T1: E-commerce with line_items
    data_tier: 'T1',
    has_line_items: true,
    mcc_code: 7999,
    mcc_label: 'Entertainment and Recreation Services',
    tenure_days: 3400,
    is_razorpay_merchant: true
  }),

  'MERC_005': new MerchantTrust({
    merchantId: 'MERC_005',
    name: 'FreshMart Groceries',
    category: 'Grocery',
    subcategory: 'Online Grocery',
    trustScore: 72,
    fraudIncidenceRate: 3.5,
    complaintCount: 67,
    rating: 4.1,
    totalTransactions: 95000,
    verificationStatus: 'verified',
    categoryAvgFraudRate: 4.2,
    riskLevel: 'medium',
    onboardingDate: '2020-02-14T00:00:00Z',
    // Data tier T3: Small, newer merchant with basic KYC
    data_tier: 'T3',
    has_line_items: false,
    mcc_code: 5411,
    mcc_label: 'Grocery Stores',
    tenure_days: 1500,
    is_razorpay_merchant: true
  }),

  'MERC_006': new MerchantTrust({
    merchantId: 'MERC_006',
    name: 'TechStore Online',
    category: 'Electronics',
    subcategory: 'Gadgets',
    trustScore: 45,
    fraudIncidenceRate: 8.7,
    complaintCount: 156,
    rating: 3.2,
    totalTransactions: 12000,
    verificationStatus: 'unverified',
    categoryAvgFraudRate: 2.5,
    riskLevel: 'high',
    onboardingDate: '2024-01-20T00:00:00Z',
    // Data tier T3: Very new merchant
    data_tier: 'T3',
    has_line_items: false,
    mcc_code: null,
    mcc_label: null,
    tenure_days: 90,
    is_razorpay_merchant: true
  })
};

/**
 * Get merchant trust data by ID
 */
function getMerchantTrust(merchantId) {
  return mockMerchants[merchantId] || null;
}

/**
 * Get all merchants (for listing/search)
 */
function getAllMerchants() {
  return Object.values(mockMerchants);
}

/**
 * Initialize with data (for testing)
 */
function initializeMerchants() {
  return mockMerchants;
}

module.exports = {
  mockMerchants,
  getMerchantTrust,
  getAllMerchants,
  initializeMerchants
};
