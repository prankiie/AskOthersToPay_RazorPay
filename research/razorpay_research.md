# RazorPay Comprehensive Research
## Product Feature: "Ask Others to Pay" in the Indian UPI Market

**Date**: April 2026  
**Research Focus**: Understanding RazorPay's ecosystem, products, go-to-market strategy, and UPI payment request capabilities to inform development of payment request flow features.

---

## 1. RazorPay Overview

### Founding Story and Evolution

RazorPay was founded in 2014 by Harshil Mathur and Shashank Kumar, both graduates of IIT Roorkee. The co-founders' origin story is rooted in rejection and persistence: after visiting over 100 banks seeking a payment gateway license, they faced initial rejection from Y Combinator. Upon their second application, they were accepted, which provided both credibility and capital to pursue bank relationships and regulatory approvals.

The company began as a solution to address India's payment acceptance problem, initially conceived while working on a crowdsourcing platform for online donations. What started as a payment gateway has evolved into a comprehensive financial operating system for Indian businesses, expanding into business banking, payroll, credit solutions, and consumer payments.

### Company Scale and Financial Performance (2025-2026)

**Current Valuation and Funding:**
- Latest valuation: **$9.2 billion** (as of June 2025)
- Total funding raised: **$742 million** over 11 rounds from 37 investors
- Series G funding: $490 million with $9.2B valuation
- IPO target: Late 2026

**Financial Performance (FY2025):**
- Annual revenue: ₹3,930 crore (as of March 31, 2025)
- Revenue growth: 65% YoY
- Gross profit: ₹1,277 crore (41% growth)
- Employee count: 3,028 (as of August 2025)

**Market Position:**
- Processed transactions: 7.4 billion total transactions
- Merchant retention rate: 94%
- Market share: a leading share of India's online payment gateway market ([CoinLaw, 2026](https://coinlaw.io/razorpay-statistics/))
- Merchant base: 450,000+ customers

### Strategic Vision

RazorPay positions itself as India's first and only full-stack financial solutions company for businesses. The 2025-2026 strategy emphasizes:
- Credit products (working capital loans) expansion
- International merchant base growth
- Leveraging India's UPI infrastructure as digital payments penetrate Tier 2 and Tier 3 cities
- AI-powered agentic payments and automation
- Consumer payments expansion through strategic investments

---

## 2. Product Suite

RazorPay's ecosystem has evolved from a pure payment gateway to a comprehensive fintech platform serving business payment acceptance, payouts, banking, credit, and emerging consumer payment solutions.

### Core Payment Products

#### Payment Gateway
The foundational product that enables businesses to accept payments online. Key features:
- Support for 180+ payment methods
- Multiple payment modes: cards, net banking, wallets, UPI
- PCI-DSS compliance
- AI fraud detection capabilities
- Intelligent routing for optimal success rates

#### Payment Links
Enables merchants to generate shareable payment links without hosting integration. Use cases:
- Invoice payments
- Quick payment collection
- Social media sharing of payment requests
- Simplified implementation for non-technical users

#### Payment Pages
Hosted custom payment pages for merchants to embed on their websites. Offers:
- Pre-built templates
- Instant setup without code
- Full customization capabilities
- Automated billing functionality

#### Subscriptions
Recurring payment management for subscription-based businesses:
- Automated billing cycles
- Payment failure recovery
- Customer lifecycle management
- Multiple billing models support

#### Smart Collect
Advanced payment collection with:
- Automated payment routing
- Multi-channel collection (SMS, email, chat)
- Retry logic and reconciliation
- High success rate optimization

#### UPI Payment Solutions
Comprehensive UPI capabilities addressing both one-time and recurring payments:
- UPI Intent flow (push model)
- UPI Collect flow (pull model)
- UPI AutoPay for recurring payments with mandates
- Smart Intent technology for app selection

### Payments Ecosystem Products

#### RazorpayX
All-in-one business banking suite enabling outbound payments:
- Bulk payouts and vendor payments
- Automated payroll processing
- Tax payment automation
- Neo-banking accounts (ICICI Bank partnerships)
- Business current accounts
- Settlement account management

#### Razorpay Capital
Credit and lending solutions for merchants:
- Working capital loans
- Easy onboarding with minimal documentation
- Capital for business growth and inventory
- Interest-based lending products

#### POS (Ezetap Integration)
Post-Ezetap acquisition, Razorpay integrated offline payment capabilities:
- Point-of-sale terminal management
- Unified online/offline payment dashboard
- Omnichannel transaction visibility
- Inventory and billing features

#### Route (Routing Intelligence)
Intelligent payment routing engine:
- Dynamic merchant account selection
- Success rate optimization per payment method
- Real-time routing decisions
- Fraud prevention and risk management

### Emerging Consumer Products

#### POP Investment (Consumer UPI)
A $30 million investment by RazorPay in POP, a consumer UPI application:
- Direct consumer UPI payments
- Rewards program integration
- Daily payment functionality
- D2C and lifestyle merchant partnerships
- Growing alternative to peer-to-peer and merchant payment apps

#### Agentic Payments (NPCI Partnership)
Collaborative initiative with NPCI and OpenAI:
- AI-powered conversational payment interface
- Integration with ChatGPT and similar LLMs
- In-app commerce with Zomato, Swiggy, PVR Inox, Vodafone Idea
- Natural language payment discovery and completion

### AI and Agentic Products (2025 Launch)

#### Agent Studio
AI-powered agent marketplace for payment automation. Production-ready agents include:
- **Abandoned Cart Conversion Agent**: Engages customers via voice/messaging with loyalty discounts and payment links
- **Dispute Responder Agent**: Automated dispute management
- **Subscription Recovery Agent**: Recovers failed subscriptions (built with ElevenLabs)

#### Agentic Experience Platform
Three core capabilities:
1. **Agentic Onboarding**: Reduces merchant onboarding from 30-45 minutes to ~5 minutes via automated identity verification
2. **Agentic Dashboard**: Natural language interface for payment operations (e.g., "reconcile bank statement against settlements")
3. **Agentic Integration**: Sub-10-minute integration via Claude Code and no-code platforms

#### AI Chat Payments Pilot
NPCI-Razorpay pilot enabling:
- Food and grocery ordering via chat (Zomato, Swiggy, Zepto)
- Order placement and UPI payment within single conversation
- Seamless checkout experience

---

## 3. Go-to-Market Strategy

RazorPay employs a sophisticated hybrid merchant acquisition and retention strategy combining volume efficiency, enterprise customization, and ecosystem partnerships.

### Developer-Led Growth Foundation

RazorPay's original GTM was "textbook developer-led growth": building superior developer experience that allowed engineers at startups to choose the product, with those startups naturally growing into enterprises and bringing scale. This remains a core positioning advantage.

Key elements:
- Comprehensive, developer-friendly API documentation
- Multiple language SDKs (Java, Go, PHP, Node.js, etc.)
- Sandbox environment for safe testing
- Postman Workspace for API exploration
- Inline feedback mechanisms for documentation improvement

### Merchant Acquisition Channels

#### Direct Digital Acquisition
AI-assisted merchant onboarding reducing conversion funnel drop-off by ~35% (2025). Automated qualification and KYC processes for self-serve activations at volume.

#### Channel Partner Network
Partners now contribute 25% of new merchants at 40% lower Customer Acquisition Cost (CAC) than direct channels. Partner referrals account for ~20% of new merchant acquisitions.

#### Vertical-Specific Sales Teams
Dedicated sales teams organized by industry (E-commerce, EdTech, SaaS) pursuing:
- Consultative selling approaches
- Custom pricing negotiations
- Deep technical integrations
- Higher ARPU and longer contract tenors

#### POS-Enabled Omnichannel Distribution
Post-Ezetap acquisition, integrated POS distribution enables:
- Unified online/offline merchant management
- Merchant acquisition through offline POS networks
- Cross-selling of payment products to existing terminal users

### Pricing Strategy

#### Standard MSME Plan
- Domestic transactions: 2% + 0.36% GST
- International transactions: 3% + 0.54% GST
- Debit card transactions: 1.99%
- Credit card transactions: 2.99%

#### Enterprise Plan
Customized pricing based on:
- Merchant volume and size
- Transaction mix
- Product usage depth
- Contract tenure and commitment

### Strategic Market Positioning

By 2025-2026, RazorPay's GTM emphasizes:
- **Top Choice for Startups/Tech Companies**: Best developer experience, high success rates, 180+ payment methods
- **International Expansion**: Growing international merchant base (targeting 20% of revenue by 2025)
- **Industry Verticals**: Deepening penetration in E-commerce, EdTech, SaaS with tailored solutions
- **Quick Commerce**: EMI products for instant delivery platforms (Dunzo, Blinkit, etc.)
- **Banking and Credit**: Expanding financial services depth beyond payments

---

## 4. Developer and Agentic Stack

RazorPay has built a world-class developer experience and is rapidly evolving toward AI/agentic-first product integration.

### API and SDK Architecture

#### REST API Foundation
All Razorpay APIs follow REST principles with JSON responses, organized for server-side integration across multiple languages.

#### Official SDKs
Razorpay provides production-grade SDKs for:
- Java (official bindings)
- Go
- PHP
- Node.js
- Python
- And others

Each SDK includes:
- Complete API coverage
- Webhook handling
- Testing utilities
- Error handling abstractions

#### API Documentation Philosophy

Razorpay's documentation approach emphasizes developer preferences:
- **Brevity**: Concise instructions without sacrificing context
- **Practical Examples**: Sample code in multiple languages
- **Sandbox Safety**: Testing environments before production
- **Developer Feedback**: Inline suggestion mechanisms for continuous improvement
- **Interactive Tools**: Postman Workspace integration for API exploration

### Webhook and Event System

Razorpay provides comprehensive webhook support for real-time event notifications:
- Payment completion events
- Refund notifications
- Subscription lifecycle events
- Payout status updates
- Dispute notifications

Webhooks enable asynchronous, event-driven architectures for merchant integrations.

### AI and Agentic Capabilities (2025 Launch)

#### Claude SDK Integration
RazorPay's agentic platform is built on Anthropic's Claude SDK, enabling:
- Natural language processing for merchant operations
- Automated decision-making for payment handling
- Contextual understanding of payment scenarios

#### Agent Studio Marketplace
Production-ready agents with extensibility:
- Abandoned Cart Conversion Agent
- Dispute Responder Agent  
- Subscription Recovery Agent
- Framework for custom agent development

#### Agentic Dashboard
Enables merchants to:
- Query payment data using natural language
- Upload documents (bank statements, invoices) for processing
- Generate reports and reconciliations
- Monitor operations without dashboard navigation

#### Sub-10-Minute Integration
RazorPay enables rapid merchant/developer integration via:
- Claude Code environments
- Replit no-code platforms
- Standardized integration patterns
- Agentic setup wizards

### Developer Ecosystem and Community

- Active GitHub repositories (Java SDK, Go SDK)
- DEV Community presence
- Regular API updates and feature releases
- Integration marketplace for pre-built connectors

---

## 5. UPI Ecosystem and Payment Request Flows

The UPI ecosystem is fundamental to RazorPay's product strategy, particularly for payment request features relevant to "Ask Others to Pay" functionality.

### UPI Fundamentals

**Unified Payments Interface (UPI)** is India's real-time, interbank digital payment system managed by NPCI (National Payments Corporation of India). Key characteristics:
- 24/7 operation (unlike traditional banking hours)
- Real-time settlement
- Built on existing banking infrastructure
- Phone number-based identifier (VPA - Virtual Payment Address)
- 709+ million QR codes deployed across India (2025)
- 63.85% of payment gateway market share in 2025

### UPI Payment Models

RazorPay supports two primary UPI payment flows, each with different characteristics:

#### UPI Intent Flow (Push Model)
Characteristics:
- Merchant/app initiates payment experience
- Customer is redirected to their preferred UPI app (PhonePe, Google Pay, Paytm, etc.)
- Customer enters UPI PIN in their app
- Immediate payment confirmation and settlement

Use Cases:
- E-commerce checkout
- App-based payments
- Requires customer app selection
- Higher conversion on repeat payments

Technical Approach:
- Merchant app displays list of supported UPI apps
- Deep linking to selected UPI app with pre-populated payment details
- Intent-based routing to customer's chosen app

#### UPI Collect Flow (Pull Model)
Characteristics:
- Merchant sends payment request to customer
- Customer receives notification in their UPI app
- Customer approves/rejects individual request
- Best for bill payments and standing instructions

Use Cases:
- Merchant-initiated payment collection
- Utility bill payments
- Subscription billing
- Mandate-based recurring payments

Technical Approach:
- Merchant provides customer VPA and amount
- NPCI routes request to customer's bank
- Customer's bank notifies via UPI app
- Customer enters PIN to authorize

### UPI AutoPay and Mandates (UPI 2.0)

**UPI AutoPay** enables recurring payments with automatic debits from customer bank accounts, addressing subscription and EMI use cases.

#### How UPI Mandates Work

1. **Initial Mandate Setup**:
   - ₹1 mandate collection for customer verification
   - Merchant obtains pre-authorization for recurring debits
   - QR code or link-based collection (Smart Intent technology selects best UPI app)

2. **Recurring Debit Execution**:
   - Automatic debits on scheduled dates
   - 24-hour advance notification requirement (mandate regulation)
   - Exhaustive retry mechanism for failed payments
   - Smart routing to highest-success-rate UPI app per customer

3. **Compliance**:
   - Merchants must notify customers 24 hours before each debit
   - Notification includes amount, date, and mandate reference
   - NPCI-mandated notification requirements

#### RazorPay's Smart Intent Technology

RazorPay's Smart Intent optimizes mandate collections by:
- Analyzing historical success patterns for each customer
- Dynamically routing requests to the UPI app most likely to successfully authorize
- Reducing consent drop-offs
- Lifting conversion rates for mandate approval

#### Success Metrics

- ~35% reduction in conversion funnel drop-off (2025 AI improvements)
- High success rates for recurring payments
- 94% merchant retention rate

### Payment Request Flow Architecture

For understanding "Ask Others to Pay" feature development, the payment request flow involves:

#### Request Generation Phase
1. Requester initiates payment request (merchant/consumer app)
2. Request includes: payer VPA, amount, purpose/description, reference ID
3. Request ID generated for tracking

#### Routing and Notification Phase
2. Request submitted to NPCI
3. NPCI routes to creditor's bank
4. Creditor's bank routes to debtor's bank
5. Debtor's UPI app receives notification with request details

#### User Approval Phase
6. Payer sees payment request in UPI app
7. Payer reviews amount and merchant/requester details
8. Payer enters UPI PIN to authorize payment
9. Confirmation sent back through UPI network

#### Settlement and Response Phase
10. Acquiring bank (payer's bank) debits customer account
11. Settlement to receiver's bank account
12. Transaction confirmation sent to both parties
13. Reference ID provided for tracking and disputes

#### Key Characteristics for "Ask Others to Pay" Development:
- **Asynchronous Nature**: Requester sends request, payer responds at their convenience
- **Non-Intrusive**: Payer receives notification but controls approval timing
- **Trackable**: Request ID enables follow-up and status visibility
- **Dispute Recoverable**: Failed requests can be retried with customer consent
- **Scalable**: Built on NPCI infrastructure supporting 700M+ active users

---

## 6. Competitive Landscape

The Indian payment gateway market is competitive and rapidly consolidating, with RazorPay leading developer-focused segment but facing strong competition in specific niches.

### Market Overview

**Market Size and Growth:**
- Market valuation (2025): USD 2.07 billion
- Projected market size (2031): USD 4.01 billion
- CAGR: 9.3% (2025-2031)
- UPI dominance: 63.85% of payment gateway market share

### Key Competitors

#### Razorpay
**Positioning**: Top choice for startups and tech companies
- Strengths:
  - Exceptional developer experience and documentation
  - High success rates through intelligent routing
  - 180+ payment methods support (cards, UPI, net banking, wallets)
  - Full-stack fintech expansion (banking, credit, payroll)
  - Early mover in AI/agentic payments
  - Leading market share in online payment gateways ([CoinLaw, 2026](https://coinlaw.io/razorpay-statistics/); industry estimates vary)
  - Most trusted by startup ecosystem
- Weaknesses:
  - Lower brand recognition among non-tech merchants
  - Limited consumer app presence until recent POP investment

#### PayU
**Positioning**: Established e-commerce choice
- Strengths:
  - 150+ payment methods support
  - Excellent for diverse customer demographics
  - Established relationships with major e-commerce platforms
  - Multi-currency support
  - Long market presence and stability
- Weaknesses:
  - More complex integrations compared to RazorPay
  - Higher fees in some segments
  - Less developer-focused

#### PhonePe
**Positioning**: UPI-native player with consumer dominance
- Strengths:
  - 100+ million daily active users (consumer app)
  - Best-in-class UPI conversion rates
  - Deeply integrated with merchant ecosystems (Flipkart)
  - Real-time settlement advantages
  - Strong consumer brand recognition
- Weaknesses:
  - Primarily focused on UPI (limited other payment methods)
  - Less suitable for international payments
  - Merchant exposure somewhat limited by Flipkart focus

#### Paytm
**Positioning**: Diversified fintech with established ecosystem
- Strengths:
  - 300 million consumer base with trusted brand
  - Instant merchant activation
  - Established wallet ecosystem
  - Payment bank and lending services
  - Strong in Tier 2/3 cities
- Weaknesses:
  - Regulatory challenges affecting payment bank operations
  - Reputation impacted by historical controversies
  - Integration complexity

#### BillDesk (Acquired by Citi, now NPCI subsidiary)
**Positioning**: Enterprise and recurring payment specialist
- Strengths:
  - Excellent for bill payments and utilities
  - Handles high transaction volumes reliably
  - 20+ year track record and trust
  - Strong in B2B and government payments
- Weaknesses:
  - Legacy technology stack
  - Less suitable for consumer e-commerce
  - Slower innovation pace

#### CCAvenue
**Positioning**: Regional leader with multi-country presence
- Strengths:
  - South Asia presence (India, UAE, Saudi Arabia, Nepal, Maldives, Singapore)
  - Multi-currency support
  - 20+ year operational history
  - Good for SMBs
- Weaknesses:
  - Limited international payment methods
  - Outdated user interface relative to modern competitors
  - Less developer documentation

#### Cashfree
**Positioning**: Modern competitor with specific verticals focus
- Strengths:
  - Competitive pricing
  - Good for e-commerce and marketplaces
  - Modern integrations (including WordPress)
- Weaknesses:
  - Smaller merchant base compared to RazorPay/PayU
  - Less brand recognition

### Competitive Positioning Matrix

| Factor | RazorPay | PayU | PhonePe | Paytm | BillDesk | CCAvenue |
|--------|----------|------|---------|-------|----------|----------|
| Developer Experience | Excellent | Good | Fair | Fair | Poor | Poor |
| UPI Integration | Excellent | Good | Excellent | Good | Fair | Fair |
| Payment Methods | 180+ | 150+ | Focused on UPI | Multiple | Multiple | Limited |
| Pricing | Competitive | Mid-range | Competitive | Competitive | Mid-range | Mid-range |
| Enterprise Ready | Yes | Yes | Limited | Yes | Yes | Yes |
| Consumer App | Growing (POP) | No | Yes | Yes | No | No |
| Agentic/AI | Leading Edge | None | Limited | None | None | None |
| Market Share | Leading (Online GW) | Strong (E-com) | UPI Leader | Declining | B2B/Utility | Niche |

### Market Trends and Shifts (2025-2026)

1. **UPI Dominance Acceleration**: UPI's 63.85% market share continues growing as internet penetration reaches Tier 2/3 cities
2. **AI Integration**: RazorPay's Agent Studio and agentic payments represent new competitive battleground
3. **Vertical Specialization**: Winners emerging in specific verticals (quick commerce, SaaS, e-commerce)
4. **International Expansion**: RazorPay and PayU pushing international merchant acquisition
5. **Consumer App Integration**: PhonePe and new entrants (POP) leveraging consumer app networks
6. **Credit and Banking**: RazorPay Capital and RazorpayX creating financial services moats

---

## 7. RazorPay's Approach to Consumer-Facing Features

While RazorPay historically focused on B2B merchant payments, the 2025-2026 period marks significant expansion into consumer-facing payment experiences. This shift is critical for understanding "Ask Others to Pay" positioning.

### Shift from B2B to B2C/B2B2C

#### Historical Focus (2014-2023)
- Pure merchant payment gateway
- Developer and business audience
- B2B transaction enablement
- Limited consumer visibility

#### Current Evolution (2025-2026)

**1. POP Investment ($30 Million)**
- Direct consumer UPI app acquisition
- Daily payment functionality
- Rewards program integration
- D2C and lifestyle merchant partnerships
- Growing alternative payment app for consumers

**2. Agentic Payments with NPCI and OpenAI**
- Conversational AI shopping interface
- Integration with ChatGPT and similar LLMs
- In-app purchases with Zomato, Swiggy, PVR Inox, Vodafone Idea
- Natural language payment discovery

**3. In-App Agentic Commerce Partnerships**
- Zomato: Food ordering via AI chat with seamless checkout
- Swiggy: Quick commerce with conversational UPI payments
- PVR Inox: Movie/entertainment ticketing via chat
- Vodafone Idea: Telecom service payments

### Consumer Product Philosophy

RazorPay's consumer strategy reflects:

**1. Conversational Payment Paradigm**
- Moving from form-based checkout to chat-based purchasing
- Natural language as interface for payment discovery
- AI agents mediating discovery → decision → payment flow

**2. Frictionless Authorization**
- QR code-based mandate setup for recurring payments
- One-tap approval flows
- Smart app routing reducing friction

**3. Rewards and Incentives**
- POP rewards integration
- Loyalty discount automation via Abandoned Cart Agent
- Integration with merchant loyalty programs

**4. Embedded Commerce**
- Payments within messaging apps and platforms
- In-app transaction completion without app switching
- Seamless Zomato/Swiggy integration within chat

### Strategic Implications for "Ask Others to Pay"

RazorPay's consumer expansion informs potential features:

1. **Conversational Request Interface**: 
   - AI agent to generate payment requests through chat
   - Natural language request creation ("ask Rohit for ₹500 for dinner")
   - Request tracking and follow-up via conversation

2. **Smart Notification and Approval**:
   - Intelligent routing to receiver's preferred UPI app
   - Optimized timing for request notifications
   - Context-rich request descriptions

3. **Integrated Rewards**:
   - Split bill workflows with automatic reconciliation
   - Loyalty integration for group expenses
   - Incentive-based payment encouragement

4. **In-App Consumer Experience**:
   - Potential integration with Zomato/Swiggy for split payment requests
   - Telegram/WhatsApp bot interface for payment requests
   - Chat-based payment collection from friends/family

---

## 8. Key Insights for "Ask Others to Pay" Feature Development

### Why UPI Payment Requests Matter

1. **Market Fit**: 700M+ UPI users with 63.85% payment market share
2. **Use Cases**: Split bills, shared expenses, vendor/service provider payments, informal lending among peers
3. **Regulatory Advantage**: NPCI infrastructure handles identity verification and settlement
4. **Low Friction**: Existing UPI app base (PhonePe, Google Pay, Paytm, etc.) reduces friction

### Technical Integration Points with RazorPay

1. **UPI Collect API**: Existing infrastructure for pull-based payment requests
2. **Smart Intent Technology**: Already proven for routing and conversion optimization
3. **Webhook System**: Real-time notifications for request status changes
4. **Agent Studio Framework**: Potential for agentic request generation and follow-up
5. **Payment Links**: Fallback for non-UPI payment request scenarios

### Competitive Opportunities

1. **Agentic Layer**: Chat-based payment request interface (Razorpay is building this)
2. **Consumer App Integration**: Leverage POP or partner with existing apps (Zomato, Swiggy)
3. **Emerging Use Case**: Group expense management is under-served compared to peer-to-peer
4. **B2B2C Model**: Enable merchants to collect from consumers at scale

### Market Conditions Favorable to "Ask Others to Pay"

1. **Demographic Growth**: Monthly UPI transactions exceeding 7 billion (2025)
2. **Trust Infrastructure**: NPCI-backed settlement and dispute resolution
3. **Feature Maturity**: UPI AutoPay and mandates enabling recurring group payments
4. **Consumer Habit**: Split bill culture prevalent in Indian metros
5. **Regulatory Tailwind**: RBI promoting digital payments in Tier 2/3 cities

---

## Sources

- [Tracxn - RazorPay 2026 Company Profile](https://tracxn.com/d/companies/razorpay/__ARWa67NVJPe3TC11rYSBnp-0zVHbDAze4xZvzRsZzAI)
- [Contrary Research - RazorPay Business Breakdown & Founding Story](https://research.contrary.com/company/razorpay)
- [Y Combinator - RazorPay Company Profile](https://www.ycombinator.com/companies/razorpay)
- [PitchBook - RazorPay 2026 Company Profile](https://pitchbook.com/profiles/company/110393-29)
- [ValueForStartups - RazorPay Investor Report 2026](https://valueforstartups.in/02-razorpay)
- [GetLatka - RazorPay Revenue and Customer Data](https://getlatka.com/companies/razorpay)
- [RazorPay - UPI AutoPay Product Page](https://razorpay.com/upi-autopay/)
- [RazorPay - Master Recurring Payments with UPI 2.0 AutoPay Guide](https://razorpay.com/blog/master-recurring-payments-upi-autopay-guide/)
- [RazorPay - Accept UPI Payments Documentation](https://razorpay.com/docs/payments/payment-methods/upi/)
- [RazorPay - UPI Mandate Blog](https://razorpay.com/blog/what-is-upi-mandate/)
- [RazorPay - UPI AutoPay Interoperability Launch](https://razorpay.com/blog/upi-autopay-interoperability/)
- [RazorPay Docs - API Documentation](https://razorpay.com/docs/api/)
- [RazorPay - Developer Documentation Philosophy Blog](https://razorpay.com/learn/empowering-coders-with-developer-documentation/)
- [RazorPay Docs - Developer Tools](https://razorpay.com/docs/developer-tools/)
- [Business Model Canvas - RazorPay Marketing Strategy](https://businessmodelcanvastemplate.com/blogs/marketing-strategy/razorpay-marketing-strategy)
- [CoinLaw - RazorPay Statistics 2026](https://coinlaw.io/razorpay-statistics/)
- [RazorPay Blog - FTX 2025 Product Launches](https://razorpay.com/blog/everything-we-launched-ftx-25/)
- [WhalesBook - AI Chat Payments RazorPay-NPCI Pilot](https://www.whalesbook.com/news/English/tech/AI-Chat-Payments-Debut-Razorpay-NPCI-Pilot-Challenges-Rivals/69983a0f057e346edab4171d)
- [Outlook Business - RazorPay Using AI Agents](https://www.outlookbusiness.com/ampstories/deeptech/how-is-razorpay-using-ai-agents-to-transform-payments-online-commerce-read-here/)
- [AngelOne - RazorPay Invests $30M in POP](https://www.angelone.in/news/market-updates/razorpay-invests-30-million-in-pop-enters-consumer-upi-segment)
- [Inc42 - RazorPay Biggest Bet: AI Brain for SMBs](https://inc42.com/features/razorpays-biggest-bet-from-payments-to-becoming-the-ai-brain-for-indias-small-businesses/)
- [The Paypers - RazorPay Launches AI Agent Studio](https://thepaypers.com/payments/news/razorpay-launches-ai-agent-studio-and-agentic-experience-platform)
- [RazorPay - Agent Studio: AI Agents Launch](https://razorpay.com/blog/agent-studio-ai-agents-by-razorpay/)
- [RazorPay - Agentic Payments Platform](https://razorpay.com/agentic-payments/)
- [RazorPay - Agentic Payments Blog](https://razorpay.com/blog/agentic-payments-the-future-of-in-app-commerce/)
- [Business Standard - RazorPay FTX 2025 Offerings](https://www.business-standard.com/companies/start-ups/razorpay-unveils-four-new-offerings-including-ai-features-at-ftx-2025-125022001150_1.html)
- [BusinessToday - RazorPay NPCI OpenAI Agentic Payments](https://www.businesstoday.in/tech-today/news/story/razorpay-npci-openai-launch-pilot-for-agentic-payments-where-ai-powered-shopping-meets-upi-497545-2025-10-09)
- [PYMNTS - RazorPay NPCI OpenAI Test Agentic Payments](https://www.pymnts.com/artificial-intelligence-2/2025/razorpay-npci-and-openai-test-agentic-payments-in-india/)
- [RazorPay - What is UPI Blog](https://razorpay.com/blog/what-is-upi-and-how-it-works/)
- [RazorPay - UPI Intent Documentation](https://razorpay.com/docs/payments/payment-methods/upi/upi-intent/)
- [RazorPay - UPI Collect vs Intent Flow Guide](https://razorpay.com/blog/upi-collect-vs-intent-flow-business-guide/)
- [RazorPay - UPI Collect 10X Faster Payments](https://razorpay.com/blog/upi-collect-razorpay-business-growth/)
- [RazorPay - Complete Guide to UPI Payment API](https://razorpay.com/blog/upi-payment-api-guide/)
- [TechJockey - Indian Payment Gateways Comparison](https://www.techjockey.com/blog/indian-payment-gateways)
- [ELEXtensions - Best Payment Gateways for Recurring Payments](https://elextensions.com/best-payment-gateways-india-recurring-payments/)
- [StartupTalky - Top 12 Best Online Payment Gateways](https://startuptalky.com/payment-gateways-business/)
- [HEN India - Digital Payments Gateways 2025](https://henindia.com/best-digital-payments-gateways-for-indian-women-entrepreneurs-and-sms-in-2025/)
- [IMARC Group - Top India Payment Gateway Companies](https://www.imarcgroup.com/top-india-payment-gateways-companies)

---

## Document Information

**Research Compiled**: April 2026  
**Data Freshness**: January 2025 - April 2026  
**Research Scope**: RazorPay ecosystem, competitive analysis, UPI payment flows, consumer expansion strategy  
**Target Use Case**: "Ask Others to Pay" feature development for Indian UPI market  
**Confidence Level**: High (based on official sources, investor reports, product announcements, and published documentation)

---

## Next Steps for Feature Development

1. **Technical Validation**: Request access to RazorPay UPI Collect API documentation and sandbox environment
2. **Partnership Exploration**: Evaluate potential RazorPay integration vs. building independent UPI infrastructure
3. **Consumer Research**: Validate payment request use cases (split bills, vendor payments, informal lending) with target users
4. **Competitive Analysis**: Deep dive into PhonePe's payment request features and Paytm's capabilities
5. **Regulatory Compliance**: Ensure compliance with NPCI UPI regulations and mandate requirements
6. **Agentic Layer Design**: Define conversational interface for payment request generation and status tracking
7. **Prototype Development**: Build MVP for payment request flow using RazorPay's APIs or NPCI's direct infrastructure

