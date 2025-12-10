Here’s the full checklist content in Markdown so you can copy it into Word and format as you like:

---

# NetSuite + Braintree Integration Checklist

A comprehensive guide to help merchants evaluate their payment processing requirements and ensure proper configuration of Braintree SuitePayments for NetSuite.

---

## Part 1: Pre-Integration Discovery

### Business Model & Volume Assessment

- [ ] **Confirm business model**: B2C, B2B, B2B2C, or hybrid
- [ ] **Geographic markets served**: Which countries/regions will you process from?

### Current Payment Infrastructure

- [ ] **Current payment processor**: \***\*\*\*\*\***\_\***\*\*\*\*\***
- [ ] **Current customer bases to migrate**: Card holders? PayPal agreements? Other methods?
- [ ] **Historical chargeback/fraud rates**: **\_** %
- [ ] **Existing tokenization/vaulting** with previous processor: Yes / No

---

## Part 2: Processing Capabilities Assessment

This section identifies your specific payment processing needs. Reference the Braintree SuitePayments Admin Guide for technical configuration details.

### A. Authorization & Capture Strategy

**Key Decision**: How long is the typical gap between order authorization and fulfillment?

- [ ] **Same-day capture** (e-commerce typical): Authorization and capture happen immediately or same business day

  - Reference: Admin Guide, Section 3.2 “Credit Card Processing” (p. 151) – Sale operation
  - Braintree Link: https://developer.paypal.com/braintree/docs/guides/credit-cards/overview

- [ ] **Multi-day capture** (MOTO, B2B typical): Authorization on Day 1, capture on Day 3–7

  - Reference: Admin Guide, Section 3.2 “Credit Card Processing” (p. 151) – Authorization/Capture workflow
  - Implication: You’ll want to vault/tokenize payment methods to avoid re-entering card data

- [ ] **Custom processing time**: **\_** days typical
  - Question: If >1 day, will you require **reauthorization** for expired auths?
  - Reference: Admin Guide, Section 2.18 “Setup for Reauthorization” (p. 111)
  - Braintree Link: https://developer.paypal.com/braintree/docs/guides/authorization/overview

### B. Partial & Over-Capture Requirements

**Key Decision**: Do you need to adjust capture amounts after authorization?

- [ ] **Partial Capture** (e.g., split shipments, drop-shipping scenarios)

  - Allows capturing LESS than authorized amount on multiple transactions
  - Reference: Admin Guide, Section 2.19 “Setup for Over Capture Partial Capture” (p. 116)
  - Use Case: Item Fulfillment → Bill → Capture Authorization (Section 3.2, p. 154)
  - Setup Required: Contact PayPal team for merchant eligibility
  - Braintree Link: https://developer.paypal.com/braintree/docs/guides/credit-cards/overview#partial-settlements

- [ ] **Over-Capture** (e.g., added shipping, taxes, processing fees discovered post-authorization)

  - Allows capturing MORE than original authorization amount
  - **Important:** Over-Capture only applies to Visa and Mastercard brands, and your MCC (Merchant Category Code) must be eligible
  - Reference: Admin Guide, Section 2.19 (p. 116)
  - Use Case examples in Section 3.2 (p. 155): Discount items, additional items, shipping charges added
  - **How to perform in NetSuite:** Create Sales Order with initial authorization → Add discount/fee item post-authorization → Bill → Capture over-authorized amount
  - Setup Required: Must be enabled by PayPal team (PSD2/regulatory compliance)
  - Limitation: PayPal General Tokens capped at 115% of original auth
  - Braintree Link: https://developer.paypal.com/braintree/docs/guides/credit-cards/overview#overcapture

- [ ] **Neither** – Always capture exact authorized amount immediately

### C. Level 2 & Level 3 (L2/L3) Data Processing

**Key Decision**: Do you sell to businesses (B2B) or need to reduce interchange rates?

- [ ] **No L2/L3 needed** – B2C only with standard card rates

- [ ] **Yes – L2/L3 Processing** (B2B, corporate cards, or interchange optimization)

  - Captures purchase order numbers, tax amounts, shipping, line items
  - Can reduce interchange rates by 0.25%–1.5% on qualified transactions
  - Reference: Admin Guide, Section 5.8 “L2L3 Data processing” (p. 312)
  - All Payment Methods must have “Requires Line-Level Data” checkbox enabled
  - Braintree Link: https://developer.paypal.com/braintree/docs/reference/general/level-2-and-3-processing/required-fields/php/

- [ ] If Yes: Do you have the following data ready to send?
  - [ ] Order/PO Number for each transaction
  - [ ] Line-item details (description, quantity, unit price)
  - [ ] Tax amount
  - [ ] Shipping amount
  - [ ] Discount amounts (if any)

### D. ACH (Bank Transfer) Processing

**Key Decision**: Do you accept direct bank payments?

- [ ] **No ACH** – Card and PayPal only

- [ ] **Yes – ACH Enabled** (recurring billing, B2B payments, MOTO)

  - Reference: Admin Guide, Section 2.7 “Setup Automated Clearing House ACH Payment Processing” (p. 43)
  - Additional section: Section 5.19 “Additional Information on ACH Processing” (p. 334)
  - Braintree Link: https://developer.paypal.com/braintree/docs/guides/ach/overview

- [ ] If Yes to ACH:
  - [ ] Network Check required? (Verify account ownership upfront)
    - Reference: Admin Guide, Section 5.19 (p. 334)
  - [ ] Recurring payments via ACH: Yes / No
  - [ ] Real-time status updates needed? (Enable webhook configuration)
    - Reference: Admin Guide, Section 2.3, “Enable Real time ACH status” checkbox (p. 23)
  - [ ] Understand ACH settlement times (typically 1–2 business days) vs. card settlement (next business day)

### E. Payment Methods Beyond Cards

- [ ] **PayPal** (standard account payments)

  - Reference: Admin Guide, Section 2.10 “Setup PayPal and Venmo on Product and Shopping Cart Page” (p. 61)

- [ ] **PayPal Buy Now Pay Later** (4-payment installments)

  - Reference: Admin Guide, Section 2.10 (p. 61) and Section 3.4 (p. 198)

- [ ] **Digital Wallets** (Apple Pay, Google Pay)

  - Reference: Admin Guide, Sections 2.9 & 2.10 (pp. 70–87)
  - Requires: Google Merchant ID (for Google Pay), Apple Pay domain configuration

- [ ] **Venmo** (peer-to-peer app payments)
  - Reference: Admin Guide, Section 2.10 (p. 87)
  - Requires: Business profile in Braintree Control Panel

---

## Part 3: Tokenization & Vaulting Strategy

**Key Decision**: How will you handle payment method reuse?

### Tokenization Overview

Reference: Admin Guide, Section 2.14 “Setup Tokenization” (p. 97) and Section 5.10 “Tokenization” (p. 319)

- [ ] **Enable Payment Card Tokenization**

  - Securely stores card details in Braintree vault after first transaction
  - Customers don’t re-enter card info for future purchases
  - Setup: Check “Replace Payment Card by Token” on Payment Processing Profile (Section 2.3, p. 22)
  - End User: Section 3.5 “Payment Card Tokenization” (p. 238)
  - Braintree Link: https://developer.paypal.com/braintree/docs/guides/payment-card-processing/vaulting

- [ ] **Enable PayPal/Alternate Payment Vaulting**

  - Store PayPal, Venmo, digital wallet tokens for repeat customers
  - Reference: Admin Guide, Section 2.25 “Vaulting of Alternate Payment method” (p. 130)
  - Threshold: Decide if customer sees “Save for Later” checkbox or merchant vaults automatically

- [ ] **Token Retrieval for External Platforms**
  - Retrieve tokens created on external e-commerce sites (Shopify, BigCommerce, custom)
  - Reference: Admin Guide, Section 2.15 “Setup Token Retrieval” (p. 99)
  - Setup: Create “External Checkout” payment method + enable “Retrieve Braintree Vaulted Token” checkbox
  - Use Case: Customer pays on Shopify, NetSuite pulls token for later MOTO processing

---

## Part 4: Fraud Management & Security

### Fraud Protection Assessment

- [ ] **Basic Fraud Management** (AVS/CVV checks only)

  - Reference: Admin Guide, Section 2.16 “Setup Basic Fraud Management” (p. 103)
  - AVS: Address Verification System – checks billing address
  - CVV: Card security code verification
  - Braintree Link: https://developer.paypal.com/braintree/docs/guides/fraud-tools/overview

- [ ] **Fraud Protection Advanced** (Machine learning risk scoring)

  - Recommended if chargeback rate >0.5% or high-risk vertical
  - Reference: Admin Guide, Section 2.17 “Setup Fraud Protection Advanced” (p. 105)
  - Provides risk scores and auto-decline thresholds
  - Additional fees apply
  - Dashboard review required for flagged transactions (Section 2.17, p. 109)
  - Braintree Link: https://developer.paypal.com/braintree/docs/guides/fraud-tools/advanced-fraud-tools

- [ ] **3D Secure 2.0** (SCA/Strong Customer Authentication)
  - For EU/UK transactions or high-value card-not-present sales
  - Reference: Admin Guide, Section 2.6 “3D Secure 2.0” (p. 39)
  - Requires additional setup in Braintree Control Panel + NetSuite

### CVV/AVS Handling

- [ ] **Automatic CVV/AVS checks**: Let system reject based on rules (default)

  - Reference: Admin Guide, Section 3.10 “Skip AVSCVV Checks” (p. 262)

- [ ] **Manual override capability**: Allow users to skip for business exceptions
  - Setup: “Skip Basic Fraud for Back Office Transaction” dropdown (Section 2.3, p. 23)

---

## Part 5: Processing Location & Channel Strategy

### Where will payments be authorized and captured?

- [ ] **eCommerce only** (SuiteCommerce Advanced or External Cart)

  - Reference: Admin Guide, Section 2.9 “Setup Alternate Payment Method for Embedded Buttons SuiteCommerce Advanced” (p. 47)
  - Auto-capture on checkout (Sale operation) typical

- [ ] **NetSuite Back Office only** (MOTO, manual order entry, sales rep)

  - Reference: Admin Guide, Section 3.2 “Credit Card Processing” (p. 151)
  - Separate Payment Processing Profile recommended for back office

- [ ] **Both** (split workflows: online checkout + manual MOTO)

  - Consider separate Payment Processing Profiles for reporting/security
  - Reference: Admin Guide, Section 2.3 “Setup a Payment Processing Profile” (p. 21)

- [ ] **Payment Link** (email invoices with pay-now button)

  - Reference: Admin Guide, Section 2.12 “Setup Payment Link” (p. 89)
  - Customers click link → fill payment form → auto-applied to invoice
  - Supports partial payments if enabled (Section 2.12, p. 96)

- [ ] **Braintree Payment Request Link** (Sales Order → email payment link)
  - Reference: Admin Guide, Section 2.13 “Braintree Payment Request Link” (p. 91)
  - Merchant generates link on Sales Order → email to customer
  - Supports multiple payment methods + vaulting

---

## Part 6: NetSuite Transaction Support Verification

Reference: Admin Guide, Section 1.3 “Common Workflows Supported” (p. 4)

### Verify your transaction types are supported:

- [ ] **Sales Order** – Authorization, Capture, Void, Refund, Reauthorization
- [ ] **Cash Sale** – Capture, Refund, Partial Capture, Over-Capture
- [ ] **Customer Payment** – Sale, Refund
- [ ] **Customer Deposit** – Sale, Refund (auto-created from Sales Order Sale operation)
- [ ] **Cash Refund** – Refund operation
- [ ] **Invoice** (via Payment Link) – Sale operation, Partial payments
- [ ] **Quote/Estimate** (via Braintree PRL) – Sale or Authorization
- [ ] **Customer Refund** – Refund operation

---

## Part 7: Account Setup & Configuration Checklist

### Pre-Setup: Braintree Side

- [ ] Braintree Sandbox Account created

  - Sandbox ID: \***\*\*\*\*\***\_\***\*\*\*\*\***
  - Reference: Admin Guide, Section 2.2 “Setup Braintree Control Panel” (p. 9)

- [ ] Braintree Production Account created

  - Production ID: \***\*\*\*\*\***\_\***\*\*\*\*\***

- [ ] Merchant Account IDs created for each subsidiary + currency combination

  - Reference: Admin Guide, Section 2.2 (p. 10)
  - Sandbox MAID: \***\*\*\*\*\***\_\***\*\*\*\*\*** / Prod MAID: \***\*\*\*\*\***\_\***\*\*\*\*\***

- [ ] API Keys (Public/Private) generated

  - Reference: Admin Guide, Section 2.2 (p. 11)

- [ ] Tokenization Key generated

  - Reference: Admin Guide, Section 2.2 (p. 12)

- [ ] PayPal Developer Account linked (if accepting PayPal)

  - Reference: Admin Guide, Section 2.2 (p. 13)
  - Client ID: \***\*\*\*\*\***\_\***\*\*\*\*\*** / Secret: \***\*\*\*\*\***\_\***\*\*\*\*\***

- [ ] Payment methods enabled in Braintree Control Panel

  - [ ] Credit/Debit Cards
  - [ ] ACH (if applicable)
  - [ ] PayPal
  - [ ] Digital Wallets (Apple Pay / Google Pay)
  - [ ] Venmo (if applicable)

- [ ] Fraud settings configured

  - [ ] AVS/CVV rules set (if using Basic Fraud)
  - [ ] Fraud Protection Advanced enabled (if applicable)
  - [ ] 3D Secure 2.0 enabled (if applicable)

- [ ] Over-Capture/Partial Capture eligibility confirmed

  - [ ] PayPal team approval obtained (if needed)

- [ ] ACH network check configuration (if applicable)
  - Reference: Braintree Link: https://developer.paypal.com/braintree/docs/guides/ach/testing-go-live#routing-numbers

### NetSuite Side – Setup

- [ ] Braintree SuiteApp installed

  - Reference: Admin Guide, Section 2.3 “Install the Braintree Payments SuiteApp” (p. 19)

- [ ] Chargeback Workflow Bundle installed (prerequisite)

  - Reference: Admin Guide, Section 2.3 (p. 18)

- [ ] Features enabled

  - [ ] Credit Card Payments
  - [ ] Payment Link (if using)
  - Reference: Admin Guide, Section 2.3 (p. 16)

- [ ] Braintree plug-in activated

  - Reference: Admin Guide, Section 2.3 (p. 20)

- [ ] Payment Processing Profile(s) created & configured

  - Profile Name: \***\*\*\*\*\***\_\***\*\*\*\*\*** / Subsidiary: \***\*\*\*\*\***\_\***\*\*\*\*\***
  - Reference: Admin Guide, Section 2.3 “Setup a Payment Processing Profile” (p. 21)
  - Settings configured:
    - [ ] API Keys (Public/Private) entered
    - [ ] Merchant ID & Merchant Account ID entered
    - [ ] Tokenization Key entered
    - [ ] Settlement Bank Account assigned
    - [ ] Support Line Level Data checkbox (if L2/L3 enabled)
    - [ ] Test Mode checkbox (Sandbox profiles)
    - [ ] Over Capture enabled (if applicable)
    - [ ] Partial Capture enabled (if applicable)
    - [ ] Enable Real time ACH status (if ACH enabled)
    - [ ] Tokenization settings (Replace Card by Token: Yes/No)

- [ ] Payment Methods created & linked

  - Reference: Admin Guide, Section 2.3 (p. 27)
  - [ ] Credit/Debit Card Payment Method
  - [ ] Payment Card Token Method (if tokenization enabled)
  - [ ] General Token Method (for PayPal/Venmo tokens)
  - [ ] External Checkout Method (if external e-commerce)
  - [ ] ACH Payment Method (if ACH enabled)
  - [ ] PayPal Payment Method
  - [ ] Digital Wallet Method (Google Pay / Apple Pay)
  - [ ] Braintree PRL Method (if using Payment Request Links)
  - [ ] Payment Link Method (if using Payment Link)

- [ ] Webhooks configured
  - Reference: Admin Guide, Section 2.3 “Configure Supported Webhooks” (p. 30)
  - Postback URL copied from PPP → entered in Braintree Control Panel
  - Webhook notifications enabled:
    - [ ] Dispute → Disputed
    - [ ] Disbursement → Disbursement
    - [ ] Transaction → Transaction Settlement Declined
    - [ ] Transaction → Transaction Settlement Settled

---

## Part 8: Sandbox Testing Checklist

Reference: Admin Guide, Appendix, Section 5.2 “Processing Payments” (p. 299)

### Core Payment Operations

**Credit Cards:**

- [ ] Authorization (check balance holds for 24 hours)

  - Braintree test card: 4111111111111111 (Visa)
  - Reference: Braintree Link: https://developer.paypal.com/braintree/docs/guides/credit-cards/testing

- [ ] Capture after Authorization
- [ ] Sale (Auth + Capture in one step)
- [ ] Void Authorization
- [ ] Refund
- [ ] Payment Card Tokenization (save card for later)

**ACH (if enabled):**

- [ ] Authorize ACH
- [ ] Capture ACH
- [ ] Refund ACH
  - Braintree Link: https://developer.paypal.com/braintree/docs/guides/ach/testing-go-live

**PayPal:**

- [ ] Authorization
- [ ] Sale
- [ ] Refund
- [ ] Void
- [ ] PayPal Token Vaulting
  - Braintree Link: https://developer.paypal.com/braintree/docs/guides/paypal/testing

**Digital Wallets (if enabled):**

- [ ] Apple Pay: Auth, Capture, Refund, Void
- [ ] Google Pay: Auth, Capture, Refund, Void
  - Braintree Link: https://developer.paypal.com/braintree/docs/guides/digital-wallets/apple-pay/overview#testing

### Advanced Features (if applicable)

**Partial Capture:**

- [ ] Create Sales Order with multiple items
- [ ] Fulfill partial shipment (Item Fulfillment)
- [ ] Bill → Capture partial amount
- [ ] Fulfill remaining items
- [ ] Bill → Capture remaining amount
- Reference: Admin Guide, Section 3.2 “Cash Sale – Partial Capture” (p. 154)

**Over-Capture:**

- [ ] Create Sales Order with initial authorization
- [ ] Add discount/fee item post-authorization
- [ ] Bill → Capture over-authorized amount
- Verify Braintree Control Panel shows over-capture transaction
- Reference: Admin Guide, Section 3.2 “Cash Sale – Over Capture” (p. 155)

**Reauthorization:**

- [ ] Create Sales Order with authorization expiring in <7 days
- [ ] Deploy BT Map Reauthorization script
- [ ] Verify authorization renewed
- Reference: Admin Guide, Section 2.18 “Setup for Reauthorization” (p. 111)

**L2/L3 Data:**

- [ ] Enable “Requires Line-Level Data” on payment method
- [ ] Create transaction with PO#, tax, shipping, line-items
- [ ] Verify line-level data in Braintree Control Panel transaction details
- Reference: Admin Guide, Section 5.8 “L2L3 Data processing” (p. 312)

**Fraud Management:**

- [ ] Test AVS/CVV rule enforcement
- [ ] Test Fraud Protection Advanced scoring/decisions
- [ ] Test transaction hold logic
- Reference: Admin Guide, Section 3.13 “Fraud Protection Advanced” (p. 268)

### Payment Events & Troubleshooting

- [ ] Verify Payment Event records created for each transaction

  - Reference: Admin Guide, Section 2.3 “Viewing Payment Events” (p. 137)
  - Check Raw Request & Raw Response for data accuracy
  - Expected Payment Statuses: Authorized, Captured, Settled, Refunded
  - Reference: Admin Guide, Section 5.4 “Payment Statuses” (p. 305)

- [ ] Test transaction failure scenarios
  - [ ] Gateway Rejection (e.g., address mismatch, fraud score)
    - Reference: Braintree Link: https://developer.paypal.com/braintree/articles/control-panel/transactions/gateway-rejections
  - [ ] Authorization Decline (e.g., insufficient funds)
    - Reference: Braintree Link: https://developer.paypal.com/braintree/articles/control-panel/transactions/declines#authorization-decline-codes
  - [ ] Settlement Decline (post-authorization failure)
    - Reference: Braintree Link: https://developer.paypal.com/braintree/articles/control-panel/transactions/declines#settlement-decline-codes

---

## Part 9: Go-Live & Production Readiness

### Pre-Production Approval

- [ ] Braintree Production Account approved by PayPal underwriting

  - Approval timeframe: 1–5 business days (depends on risk profile)
  - Production Merchant ID: \***\*\*\*\*\***\_\***\*\*\*\*\***
  - Production MAID: \***\*\*\*\*\***\_\***\*\*\*\*\***

- [ ] NetSuite Production Payment Processing Profile created (copy from Sandbox, update credentials)

  - Reference: Admin Guide, Section 2.3 (p. 21)
  - Uncheck “Test Mode” checkbox
  - Test Mode OFF verification: \***\*\*\*\*\***\_\***\*\*\*\*\***

- [ ] Webhooks re-configured in Production
  - Reference: Admin Guide, Section 2.3 (p. 30)
  - New Postback URL from Production PPP
  - Verify webhook test: “Success! Server responded with 202”

### Operations Handoff

- [ ] User training completed

  - Credit Card Processing: End User Guide, Section 3.2 (p. 151)
  - ACH Processing (if applicable): End User Guide, Section 3.3 (p. 187)
  - Tokenization: End User Guide, Section 3.5 (p. 238)
  - Reauthorization (if applicable): End User Guide, Section 3.8 (p. 258)

- [ ] Runbooks created for common scenarios

  - Payment failures & troubleshooting
  - Refund procedures
  - Token management
  - ACH network check process

- [ ] Support escalation path defined
  - Level 1: NetSuite Admin
  - Level 2: Braintree Support
  - Reference: Admin Guide, Section 5.17 “Braintree Support Contact Links” (p. 332)

### Post-Go-Live Monitoring (First 30 Days)

- [ ] Daily transaction review

  - Payment Event status (Captured, Settled)
  - Failed transactions → troubleshooting via Raw Request/Response
  - Reference: Admin Guide, Section 2.3 “Viewing the Payment Event for a Transaction” (p. 137)

- [ ] Weekly reconciliation

  - Compare NetSuite captured amounts vs. Braintree deposits
  - Verify settlement bank account deposits match expectations

- [ ] ACH validation (if enabled)

  - Confirm real-time status webhook delivery
  - Test network check process with sample transactions

- [ ] Fraud management tuning
  - Monitor auto-decline rate (should be <2% of transactions)
  - Adjust AVS/CVV rules if excessive false positives

---

## Quick Reference: Braintree Developer Links

| Topic                                  | URL                                                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Credit Cards                           | https://developer.paypal.com/braintree/docs/guides/credit-cards/overview                                    |
| ACH Processing                         | https://developer.paypal.com/braintree/docs/guides/ach/overview                                             |
| Tokenization & Vaulting                | https://developer.paypal.com/braintree/docs/guides/payment-card-processing/vaulting                         |
| PayPal Integration                     | https://developer.paypal.com/braintree/docs/guides/paypal/overview                                          |
| Digital Wallets (Apple Pay/Google Pay) | https://developer.paypal.com/braintree/docs/guides/digital-wallets/overview                                 |
| Fraud Tools                            | https://developer.paypal.com/braintree/docs/guides/fraud-tools/overview                                     |
| 3D Secure 2.0                          | https://developer.paypal.com/braintree/docs/guides/3d-secure-2/overview                                     |
| Level 2/3 Data                         | https://developer.paypal.com/braintree/docs/reference/general/level-2-and-3-processing/required-fields/php/ |
| Webhooks                               | https://developer.paypal.com/braintree/docs/guides/webhooks/overview/                                       |
| Gateway Rejections                     | https://developer.paypal.com/braintree/articles/control-panel/transactions/gateway-rejections               |
| Transaction Declines                   | https://developer.paypal.com/braintree/articles/control-panel/transactions/declines                         |
| Testing & Go-Live                      | https://developer.paypal.com/braintree/docs/guides/credit-cards/testing-go-live/php/                        |

---

## Documentation References

All section references in this checklist are from:

**Braintree SuitePayments SuiteApp Admin and End User Guide**

- Version: V.42, Release 1.3.51
- Date: October 24, 2025
- Document Status: Current

**External Documentation:**

- Braintree Developer Portal: https://developer.paypal.com/braintree/
- PayPal Integration Resources: https://developer.paypal.com/

---

## Notes Section

### Discovery Findings:

---

---

### Implementation Decisions:

---

---

### Special Requirements/Exceptions:

---

---
