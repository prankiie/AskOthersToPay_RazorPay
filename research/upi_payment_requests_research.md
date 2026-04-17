# UPI Payment Request Flows in India: Comprehensive Research (2025-2026)

**Research Date**: April 2026  
**Scope**: Current state of UPI payment request flows, regulations, fraud landscape, and gap analysis for legitimate use cases

---

## Executive Summary

UPI (Unified Payments Interface) has undergone significant regulatory changes in 2025-2026, particularly around person-to-person (P2P) collect requests due to high fraud abuse. While merchant collect requests continue, P2P collect requests were discontinued on October 1, 2025. This research examines the technical landscape, fraud patterns, regulatory framework, and opportunities for features like "Ask Others to Pay" (delegated payment requests) that address legitimate use cases.

---

## 1. UPI Collect Requests: Technical Flow & Current State

### 1.1 What is a Collect Request?

UPI supports two main transaction flows:
- **Push Flow**: User sends money proactively
- **Pull Flow (Collect Request)**: User requests money from another party, who approves it

A collect request is essentially a payment request where the requestee (the person asking for money) initiates contact and the payer must explicitly approve the transaction using their UPI PIN.

### 1.2 Technical Flow Architecture

**Step-by-Step Process** ([Source: Razorpay](https://razorpay.com/blog/upi-collect-vs-intent-flow-business-guide)):

1. **VPA Validation**: Customer enters Virtual Payment Address (VPA) on checkout page
2. **Routing to Issuing Bank**: Payment Service Provider (PSP) validates VPA through NPCI infrastructure
3. **Notification Delivery**: Issuing bank sends UPI notification via SMS or push alert to customer's registered device
4. **User Approval**: Customer opens their UPI app and approves the request using their PIN
5. **Transaction Settlement**: Transaction completes in issuing bank's system

**Timeline**: Full transaction typically takes 60-90 seconds with application switching

### 1.3 Collect vs Intent Flow: Performance Comparison

| Metric | Collect Flow | Intent Flow |
|--------|-------------|------------|
| Success Rate | 75-85% | 85-95% |
| User Steps | Multi-step (manual VPA entry) | Single-step (auto-launch) |
| Friction Points | VPA entry errors, app switching, notification delays | Minimal context switching |
| Use Case | Desktop, web checkout | Mobile primary experience |

**Key Difference**: Intent flow is push-based and auto-launches the user's banking app, while Collect requires manual VPA entry and creates application switching friction ([Source: Razorpay](https://razorpay.com/blog/upi-collect-vs-intent-flow-business-guide)).

### 1.4 Critical Regulatory Change: P2P Collect Request Discontinuation

**Effective Date**: October 1, 2025

**NPCI Circular**: Dated 29 July 2025, NPCI directed all banks and Payment Service Providers to:
- Stop initiation, routing, and processing of all person-to-person (P2P) collect requests
- Continue supporting merchant collect requests (B2C transactions)

**Scope**: 
- **Banned**: P2P collect (person requesting money from another person)
- **Allowed**: Merchant collect (business requesting money from customer for goods/services)

**Rationale**: Reduce fraud, which was the primary abuse vector for this feature.

---

## 2. UPI Apps: Collect Request Features Comparison

### 2.1 Market Overview (March 2024 Data)

| App | UPI Transactions (Monthly) | Market Position |
|-----|---------------------------|-----------------|
| PhonePe | 650.2 Cr | #1 Leader (45% UPI volume in Dec 2025) |
| Google Pay | 506.1 Cr | #2 |
| Paytm | 123 Cr | #3 |
| BHIM | 3 Cr | Government app |

[Source: Multiple payment app comparison sources](https://www.ifsc.co/blogs/digital-banking/bhim-vs-gpay-vs-phonepe-vs-paytm-best-upi-app-india-2026)

### 2.2 Individual App Features

**Google Pay (GPay)**
- Smooth, minimal interface; fast loading
- Collect request support (pre-Oct 2025); now merchant-only
- Strong merchant QR integration
- Primary strength: User experience simplicity

**PhonePe**
- All-in-one finance platform (UPI + bill payments + investments)
- Widest merchant QR acceptance offline
- Advanced merchant analytics and business tools
- Dominant position: 9.8 billion transactions in Dec 2025 (45% market share)
- Business tools include invoicing, business loans, POS systems

**Paytm**
- Dual functionality: wallet + bank transfer
- Strong for small business owners (daily transactions, QR payments, FASTag)
- Additional services: bookings, bill payments
- Target segment: High-frequency merchants

**BHIM (Government App)**
- Simplest interface, direct bank account linkage
- Multi-account management (select which bank account per transaction)
- No clutter or additional features
- Primary use: Straightforward P2P and merchant payments

### 2.3 Delegated Payments Feature: UPI Circle

**Introduction**: NPCI launched UPI Circle to address delegated payment use cases (parents managing dependent spending, elderly users delegating to caretakers).

**Key Features** ([Source: NPCI/IBEF](https://www.ibef.org/news/npci-launches-upi-circle-for-secure-delegated-payments-with-trusted-users)):

1. **Partial Delegation Mode**:
   - Secondary user (e.g., child) cannot initiate independent payments
   - Must send payment request to primary user
   - Primary user has 10 minutes to review, approve, and complete transaction
   - Both parties receive alerts confirming payment

2. **Spending Limits & Controls**:
   - Primary user sets per-transaction limits
   - Daily spending caps
   - Category-based restrictions possible
   - Long validity periods (can be set for months/year)

3. **Cross-App Visibility** (August 2025+):
   - Customers can view all active mandates across different UPI apps linked to same bank account
   - Eliminates "hidden" mandates
   - Increases consumer trust in system
   - Mandate management: pause, resume, revoke actions available

**Friction vs. Security Trade-off**: The payment request step introduces "positive friction" for security—it prevents unauthorized spending while maintaining convenience through real-time notifications and 10-minute approval windows.

---

## 3. Fraud & Trust Issues in UPI Collect Requests

### 3.1 Fraud Scale & Impact

**FY25 Statistics** ([Source: UPI Fraud Statistics](https://aseemjuneja.in/upi-fraud-statistics-india/)):
- **Total Cases**: 10.64 lakh UPI fraud cases
- **Total Losses**: ₹805 crore
- **Mid-Year FY25** (by Sept 2024): 632,000 cases, ₹485 crore in losses

**User Impact**: Approximately 1 in 5 Indian UPI users have been hit by fraud since 2022 ([Source: The Logical Indian](https://thelogicalindian.com/1-in-5-indian-upi-users-hit-by-fraud-since-2022-survey-rbi-npci-launch-new-safeguards-from-june-30))

### 3.2 Collect Request Fraud Patterns

**Attack Vector**: Fraudsters exploit user misunderstanding about UPI PIN purpose.

**Common Scam Sequence** ([Source: The420.in](https://the420.in/upi-fraud-scams-collect-request-qr-code-cybercrime-india/)):

1. Fraudster sends collect request under false pretense (e.g., "cashback reward," "refund due")
2. Fraudster calls victim and claims victim must enter UPI PIN to "receive" money
3. Victim enters PIN thinking they're receiving funds
4. PIN authorizes the fraudster's collect request
5. Money is debited from victim's account instead of credited

**Real-World Example**: PhonePe customer service impersonator called victim about ₹9,999 cashback reward, sent collect request, forced PIN entry—₹9,999 immediately debited ([Source: UPI Fraud Statistics](https://aseemjuneja.in/upi-fraud-statistics-india/))

**Root Cause**: Critical digital literacy gap—most users don't understand that UPI PIN is for **sending** money, not receiving it.

### 3.3 NPCI's Response: Collect Request Safeguards

**Pre-Discontinuation Measures**:
- **Transaction Cap**: ₹2,000 per collect request (significantly reduced fraud scope)
- **Beneficiary Name Display Mandate** (June 30, 2025+):
  - All UPI apps must display bank-registered beneficiary name during transactions
  - Prevents fake/misleading payee names common in impersonation scams
  - Enhanced transparency reduces impersonation risk

**Post-October 1, 2025**:
- P2P collect requests completely discontinued
- Merchant collect requests continue with existing safeguards
- Expected fraud reduction in peer-to-peer space

### 3.4 Multi-Layered Security Enhancements (2025)

**AI and Machine Learning Integration** ([Source: UPILinks - NPCI Security Protocols](https://blog.upilinks.in/npci-strengthens-upi-fraud-prevention-measures-a-deep-dive-into-new-security-protocols/)):

1. **Predictive Analytics**:
   - Real-time transaction pattern monitoring
   - Behavioral anomaly detection
   - Device fingerprinting analysis
   - Free tools provided to partner banks (e.g., MuleHunter.AI)

2. **Cooling-Off Period for High-Risk Transactions**:
   - Mandatory delay for first-time beneficiaries: 4-24 hours
   - Applies to large-value transfers
   - Allows users to revoke fraudulent requests

3. **Mobile Application Security Framework**:
   - Mandatory root/jailbreak detection
   - Blocks installation on rooted/jailbroken devices
   - OTP auto-read (SMS-only, no voice calls)
   - Sender ID whitelisting
   - Unknown number alerts

4. **API Rate Limiting** (August 2025+):
   - Balance check limit: 50 per day per app per user
   - Account listing: 25 per day per app per user
   - Autopayment execution: Non-peak hours only
   - Maximum 4 retry attempts per mandate (1 original + 3 retries)

---

## 4. NPCI Regulations & RBI Guidelines

### 4.1 Key Regulatory Milestones (2025-2026)

**August 1, 2025 Changes** ([Source: NPCI Rules](https://www.paisabazaar.com/banking/new-upi-rules/)):
- Balance check limits: 50 per 24 hours per app
- Account listing: 25 per 24 hours per app
- AutoPay mandate scheduling: Regulated processing windows
- API call caps implemented

**October 1, 2025**:
- P2P collect request discontinuation effective
- Merchant collect requests continue

**April 1, 2026 - Two-Factor Authentication Mandate** ([Source: RBI Digital Payments](https://www.useideem.com/post/how-rbis-new-2fa-mandate-impacts-indias-digital-payments)):
- **Requirement**: All domestic digital payments (UPI, cards, wallets, recurring mandates) must use two authentication factors from different categories:
  - Factor 1: PIN
  - Factor 2: Registered device/token
  - Factor 3: Biometric identification
- **Dynamic Factor Rule**: At least one factor must be dynamic (unique per transaction)
- **Scope**: Includes UPI, credit cards, debit cards, wallet payments, and AutoPay mandates

### 4.2 UPI AutoPay Regulations

**AutoPay Mandate Growth**:
- Reached 1.27 billion active mandates in November 2025
- 10x growth from January 2024 to November 2025
- For calendar 2025: ~228 billion transactions worth ₹300 lakh crore

**Transaction Limits** ([Source: Razorpay AutoPay Guide](https://razorpay.com/blog/master-recurring-payments-upi-autopay-guide)):
- Standard limit: ₹15,000 per transaction
- Enhanced categories: Up to ₹1,00,000 per transaction without additional factor authentication
- Enhanced categories: Utilities, subscriptions, insurance, loans, bills

**Mandate Execution Rules** (August 2025+):
- Non-peak hours execution only (to prevent congestion)
- Maximum 4 attempts per mandate (1 original + 3 retries)
- Pre-charge notification mandatory: 24-48 hours before debit
- Notification channels: SMS or email (customer preference)
- Must include: Merchant name, amount, date/time of charge

**Interoperability Requirement**:
- Customers can view all active mandates across different UPI apps linked to same bank account
- Single mandate management: pause, resume, revoke actions
- Cross-app visibility prevents hidden/duplicate mandates

### 4.3 Non-Peak Hours for Mandate Execution

Mandates for recurring payments (bills, subscriptions, EMIs) now execute only during designated non-peak time slots. This addresses congestion concerns and improves transaction success rates during execution windows.

---

## 5. Merchant Trust Signals & Fraud Prevention

### 5.1 Current Merchant Trust Mechanisms

**Formal Merchant Rating System**: No comprehensive public merchant trust score rating system currently exists in major UPI apps (Google Pay, PhonePe, Paytm, BHIM) as of 2026.

**Existing Trust Signals**:

1. **Beneficiary Name Display** (June 2025+):
   - Bank-registered name shown during transaction
   - Primary fraud prevention mechanism
   - Reduces impersonation scams

2. **Merchant Verification**:
   - PhonePe for Business: Merchant verification through KYC
   - BHIM: Government-backed merchant programs
   - Paytm for Business: Merchant verification and rating systems

3. **Transaction Analytics**:
   - PhonePe: Merchant transaction analytics dashboard
   - Merchant fraud indicators built into PhonePe's merchant app
   - Paytm: Business analytics and reporting tools

### 5.2 Opportunities for Trust Enhancement

**Gap**: No unified merchant trust score visible to consumers during payment requests

**Opportunities for Razorpay "Ask Others to Pay" Feature**:

1. **Merchant Category Transparency**:
   - Display merchant category (food, utilities, shopping, travel)
   - Show transaction category history

2. **Fraud Incident Rate Indicators**:
   - Industry average fraud rate by category
   - Merchant fraud incident flags (if available)
   - Comparative risk scoring

3. **Merchant Verification Badges**:
   - KYC verification status
   - RBI/NPCI registered status
   - Business registration confirmation

4. **Consumer Signal Integration**:
   - Number of past transactions with merchant
   - User relationship to merchant (saved payee, repeat vendor)
   - Peer transaction volume (anonymized)

---

## 6. Gap Analysis: Friction Points in Current UPI Payment Request Flows

### 6.1 Legitimate Use Cases Facing Friction

#### Use Case 1: Family Delegated Payments
**Scenario**: Daughter buys an expensive item, asks father to pay

**Current Solutions**:
- Manual transfer: Father sends money after buying
- UPI Circle: Father adds daughter as secondary user, daughter initiates request, father approves within 10 minutes
- Split bill: Manual splitting, doesn't address permission-based payment

**Friction Points**:
- UPI Circle requires advance setup and KYC linking
- Split bill doesn't address authorization hierarchy
- No rich context about merchant/transaction purpose in request

#### Use Case 2: Vendor Invoiced Payments
**Scenario**: Small business owner receives invoice from supplier, wants to delegate approval to manager

**Current Solutions**:
- Merchant collect requests: Limited to verified business accounts
- AutoPay: Requires mandate setup, not suitable for one-off invoiced payments

**Friction Points**:
- AutoPay too heavy for infrequent payments
- No payment request for B2B without merchant infrastructure
- P2P collect banned, so no peer supplier payments possible

#### Use Case 3: Emergency Money Request
**Scenario**: Person needs urgent funds, requests from family member

**Current Solutions**:
- Phone call + manual transfer
- P2P collect banned (as of Oct 2025)

**Friction Points**:
- No native UPI mechanism for authenticated money requests
- Collect request feature removed due to fraud
- No context or trust signals in emergency scenarios

#### Use Case 4: Bill Splitting Among Friends
**Scenario**: Friends split restaurant bill, want to request portions from others

**Current Solutions**:
- Manual transfers by each person
- Split bill apps (non-UPI native)
- P2P collect banned

**Friction Points**:
- Multiple manual transactions required
- Friction in requesting payment from friends
- No native UPI split bill request mechanism

### 6.2 Technical & UX Friction Points

| Friction Point | Impact | Severity |
|---|---|---|
| Manual VPA Entry | 10-15% error rate in collect flow | High |
| App Context Switching | Increases drop-off during payment | High |
| Notification Dependency | SMS delays, missed notifications | Medium |
| No Rich Context | User doesn't see merchant/purpose details in request | High |
| No Trust Signals | No fraud/trust information for payer decision | High |
| Lengthy Setup for Mandates | Users hesitant to activate recurring payments | Medium |
| Cooling-Off Period | Mandatory delay frustrates urgent payments | Medium |

### 6.3 User Experience Gaps Specific to Collect Requests

**Problem 1: Low Digital Literacy**
- Users don't understand that PIN is for sending money, not receiving it
- Fraudsters exploit this misunderstanding
- Trust in request feature eroded by scams

**Problem 2: Missing Context in Requests**
- User receives collect request notification with minimal context
- Doesn't know merchant credibility, transaction category
- Makes "yes/no" decision without trust signals

**Problem 3: No Request Management**
- Limited ability to review pending requests
- No way to see request history or patterns
- Difficult to identify suspicious requests among legitimate ones

**Problem 4: Fraud Aftermath**
- Limited dispute resolution for collect request fraud
- Complex claim process through banks
- No transparent fraud handling in UPI apps

---

## 7. "Ask Others to Pay" Feature Opportunity: Rich Payment Request Context

### 7.1 Gap This Addresses

Current UPI payment requests (collect and delegated) lack rich contextual information to help payers make informed decisions. A smart payment request system can:

1. **Surface Merchant Trust Information**
   - Merchant fraud incident rate (by category)
   - Transaction history with merchant (if repeat customer)
   - Merchant verification status
   - Category of merchant

2. **Provide Transaction Context**
   - Purpose of payment (if requestor provides context)
   - Category of transaction (food, utilities, shopping, travel, etc.)
   - Relationship between requestor and merchant
   - Industry average fraud rate for category

3. **Enable Informed Decision-Making**
   - Payer sees all context before approving
   - Can reject suspicious requests with clear rationale
   - Reduces fraud by empowering informed approvals
   - Builds trust in payment request mechanism

### 7.2 Feature Requirements for "Ask Others to Pay"

**Core Flow**:
1. Requestor initiates payment request to payer
2. Requestor provides: amount, merchant, category, purpose (optional)
3. System enriches request with:
   - Merchant trust score (if available)
   - Category fraud incident rate
   - Requestor relationship to merchant
   - Similar transaction history
4. Payer receives rich request notification
5. Payer reviews context and approves/rejects

**Regulatory Compliance**:
- If P2P: Must comply with post-Oct 2025 NPCI rules (currently banned)
- If B2C: Merchant-to-consumer collect requests allowed
- If Delegated: UPI Circle framework for family/authorized payments

### 7.3 Data Requirements for Rich Context

1. **Merchant Data**:
   - Merchant category code
   - KYC status, registration verification
   - Fraud incident rate (sourced from NPCI/RBI data)
   - Repeat customer indicators

2. **Transaction Data**:
   - Category distribution across UPI ecosystem
   - Category fraud rates
   - Typical transaction values by category

3. **User Data**:
   - Relationship validation (family, friend, business contact)
   - Transaction history
   - Spending patterns

4. **Trust Scoring**:
   - Merchant risk classification
   - Category risk classification
   - Transaction anomaly scoring

---

## 8. Key Findings & Recommendations

### 8.1 Key Findings

1. **P2P Collect Requests Permanently Banned** (Oct 1, 2025)
   - Due to high fraud abuse (1 in 5 users hit by fraud)
   - Legitimate use cases now lack native UPI mechanism
   - Merchant collect requests continue

2. **Two Authentication Factor Mandate** (April 1, 2026)
   - All domestic payments require 2FA from different categories
   - At least one dynamic factor mandatory
   - Includes UPI, cards, wallets, mandates

3. **UPI Circle Addresses Delegated Payment Gap**
   - Partial delegation allows parent/primary user control
   - Payment request mechanism built into secondary user workflow
   - 10-minute approval window provides control without excessive friction

4. **Critical Digital Literacy Gap Exists**
   - Users don't understand UPI PIN purpose (send vs. receive)
   - Fraudsters actively exploit this misunderstanding
   - Education+UX improvements needed alongside regulations

5. **Merchant Trust Data Currently Unavailable to Consumers**
   - No public merchant trust score systems in major apps
   - Beneficiary name display is primary fraud prevention
   - Opportunity for Razorpay to provide differentiation

6. **AutoPay Mandates Growing Rapidly**
   - 1.27 billion active mandates (Nov 2025), 10x growth
   - Non-peak execution, retry limits, pre-charge notifications now required
   - Cross-app mandate visibility improves consumer trust

### 8.2 Recommendations for "Ask Others to Pay" Feature

**Regulatory Approach**:
1. Position as **delegated payment feature** (similar to UPI Circle) rather than P2P collect
2. Ensure compliance with NPCI's 2FA mandate (April 2026)
3. Target legitimate use cases: family payments, B2B invoicing, authorized delegated payments

**UX/Feature Approach**:
1. **Surface Trust Signals**:
   - Merchant fraud incident rate by category
   - KYC verification status
   - Repeat customer indicators
   - Category average transaction values

2. **Reduce Fraud Through Context**:
   - Require requestor to provide purpose/category
   - Show payer clear risk indicators
   - Enable payer to decline with reason

3. **Streamline Setup**:
   - Integrate with Razorpay merchant ecosystem (existing KYC data)
   - Leverage Razorpay's transaction history
   - Build on UPI Circle framework for delegated scenarios

**Implementation Priorities**:
1. **Phase 1**: B2B/invoiced payments (merchant to business contact)
   - Leverage existing Razorpay merchant verification
   - Lower fraud risk than P2P
   - Clear business use case

2. **Phase 2**: Family delegated payments
   - Position as Razorpay alternative to UPI Circle
   - Add merchant trust context that UPI Circle lacks
   - Target parents, elderly users

3. **Phase 3**: Peer split/request payments
   - Only if P2P restrictions lifted or alternative regulatory pathway found
   - Require highest trust signals and limits

---

## 9. Sources & References

### Regulatory & Guidelines
- [NPCI UPI Circular on P2P Collect Discontinuation (July 29, 2025)](https://www.billcut.com/blogs/new-upi-risk-rules-for-collect-requests/)
- [NPCI Strengthens UPI Fraud Prevention Measures (2025)](https://blog.upilinks.in/npci-strengthens-upi-fraud-prevention-measures-a-deep-dive-into-new-security-protocols/)
- [RBI Two-Factor Authentication Mandate (April 1, 2026)](https://www.useideem.com/post/how-rbis-new-2fa-mandate-impacts-indias-digital-payments)
- [NPCI UPI AutoPay Guidelines](https://razorpay.com/blog/master-recurring-payments-upi-autopay-guide)
- [NPCI August 2025 UPI Rule Changes](https://www.paisabazaar.com/banking/new-upi-rules/)

### Fraud & Security
- [UPI Fraud Statistics in India: Rising Cases in 2025](https://aseemjuneja.in/upi-fraud-statistics-india/)
- [UPI Fraud: How Cybercriminals Exploit Collect Requests](https://the420.in/upi-fraud-scams-collect-request-qr-code-cybercrime-india/)
- [1 in 5 Indian UPI Users Hit by Fraud Since 2022](https://thelogicalindian.com/1-in-5-indian-upi-users-hit-by-fraud-since-2022-survey-rbi-npci-launch-new-safeguards-from-june-30)

### Technical & Product
- [UPI Collect vs Intent Flow: A Guide to Higher Success Rates (Razorpay)](https://razorpay.com/blog/upi-collect-vs-intent-flow-business-guide)
- [Unified Payments Interface - Wikipedia](https://en.wikipedia.org/wiki/Unified_Payments_Interface)
- [BHIM vs GPay vs PhonePe vs Paytm: Comparison 2026](https://www.ifsc.co/blogs/digital-banking/bhim-vs-gpay-vs-phonepe-vs-paytm-best-upi-app-india-2026)

### Delegated Payments & UPI Circle
- [NPCI Launches UPI Circle for Secure Delegated Payments](https://www.ibef.org/news/npci-launches-upi-circle-for-secure-delegated-payments-with-trusted-users)
- [What is UPI Circle: A Smarter Way to Handle Instant Payments](https://www.redcompasslabs.com/insights/what-is-upi-circle-a-smarter-way-to-handle-instant-payments/)
- [BHIM Rolls Out Delegated UPI Payments With Spending Caps](https://www.outlookmoney.com/banking/bhim-rolls-out-delegated-upi-payments-with-spending-caps-and-long-validity)
- [UPI's Next Frontier: Delegated Payments and Financial Access](https://d91labs.substack.com/p/upis-next-frontier-delegated-payments)

### Market & App Analysis
- [Top UPI Apps in India: Best Features & Security (Cashfree)](https://www.cashfree.com/blog/top-upi-apps-in-india/)
- [UPI Statistics 2026: Insights and Trends](https://coinlaw.io/upi-statistics-2026/)
- [PhonePe Market Dominance: 45% UPI Transaction Volume (Dec 2025)](https://meetanshi.com/blog/upi-statistics/)

---

## Appendix: Timeline of Key Events (2025-2026)

| Date | Event | Impact |
|------|-------|--------|
| June 30, 2025 | Beneficiary Name Display Mandate | Fraud reduction through name verification |
| Aug 1, 2025 | API Rate Limiting, AutoPay Execution Rules | System stability, fraud prevention |
| Oct 1, 2025 | P2P Collect Request Discontinuation | Eliminates major fraud vector for peer payments |
| Nov 2025 | UPI AutoPay Reaches 1.27B Mandates | 10x growth in recurring payments |
| April 1, 2026 | Two-Factor Authentication Mandate | All transactions require 2FA with dynamic factor |
| April 2026 | Present Date | Document date; regulations being implemented |

---

**Document Status**: Comprehensive research compiled from 2025-2026 sources  
**Intended Use**: Informing "Ask Others to Pay" feature design and regulatory approach for Razorpay
