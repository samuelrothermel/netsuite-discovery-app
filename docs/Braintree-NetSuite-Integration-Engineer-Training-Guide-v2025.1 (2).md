# Braintree SuiteApp for NetSuite: Integration Engineer Training Guide

## Introduction

This training document is designed to provide integration engineers with a comprehensive review of the Braintree SuitePayments SuiteApp processing functionalities within NetSuite. Rather than duplicating the detailed User Guide, this document outlines key features, processing capabilities, and important operational considerations that integration engineers must understand to effectively support Braintree-NetSuite integrations.

**Version:** v2025.1 (Based on SuiteApp v44, Release 1.3.53)  
**Date:** February 2026

---

## Related Resources

- **BETA (Internal Only) NetSuite Discovery Web App:** https://netsuite-discovery-app-dev.up.railway.app/
  - Use this tool when gathering a comprehensive list of a NetSuite merchant's processing needs with NetSuite
  - Provides early call-outs as well as a checklist to assist with matching integration steps to a merchant's processing needs
- **YOUR OWN AI-driven 'Space'** where you can feed questions/concerns into
  - Make sure to keep this space updated with the latest User Guide versions
  - Use this Space (in addition to the User Guide itself) for answering/relaying merchant's questions rather than immediately filing an ELIM ticket—giving the merchant/dev another informed attempt at resolving their bug/question

---

## Step-by-Step Process

1. IE assigned to NetSuite IHR case
2. Reach out to merchant/dev via e-mail to share User Guide and introduce yourself
3. Discovery/Kick-off Call for gathering and verifying merchant's processing needs, platforms, etc.
4. _(Optional)_ Schedule Demo with ELIM to gain overall understanding of how the Braintree SuiteApp operates including testing functionalities
5. _(Optional)_ Assist merchant with integrating their Sandbox Braintree account with their Staging NetSuite environment—limited to processing profile configuration and testing JUST MOTO orders
6. Merchant performs Sandbox testing:
   - IE continues to assist merchant, scheduling calls with ELIM on an as-needed basis (anything you can't answer or things that are too NetSuite-specific)
   - Merchant should aim to mimic their configuration/processing to match their expected activity in Production
7. Verify with AE that their Production BT account is enabled for all required processing steps/payments
8. Merchant goes Live (mirrors Staging NetSuite configuration/settings on their Production NetSuite instance)

---

## Section 1: SuiteApp Overview and Core Architecture

The Braintree SuitePayments SuiteApp is a certified NetSuite SuitePayments plug-in that enables seamless payment processing directly within NetSuite. As an integration engineer, understand these foundational points:

- **Native NetSuite Integration:** The SuiteApp is designed to process payments when transactions require them, with automatic general ledger impact handling
- **Payment Processing Scope:** Supports Credit/Debit cards, ACH, PayPal, Venmo, Digital Wallets (Google Pay, Apple Pay), and alternative payment methods
- **Transaction Support:** Works with Sales Orders, Cash Sales, Customer Deposits, Customer Payments, Invoices, and Quotes/Estimates
- **User Guide Reference:** See v44 User Guide, Section 1 (Overview) - pages 4-5

---

## Section 2: Installation and Configuration Prerequisites

### Admin Setup Checklist

User Guide Section 2.1 - pages 6-8

Integration Engineer should be able to guide merchants with the following configurations:

**Bundle Installation Order**

- Chargeback Workflow bundle (prerequisite - Bundle ID 127355)
- Braintree Payments SuiteApp installation
- Plugin activation in Manage Plug-ins

**Feature Enablement**

- Enable Credit Card Payments feature (Setup → Company → Enable Transactions → Payment Processing)
- Enable Payment Instruments and Payment Link features
- Configure Accounting Preferences (see Section 2.3, pages 16-18)

**Braintree Control Panel Credentials**

- Merchant ID, Public/Private Keys
- Merchant Account IDs (one per subsidiary/currency combination)
- Tokenization Keys
- PayPal credentials for alternate payment methods

**Payment Processing Profile Configuration**
User Guide Section 2.3, pages 20-29

- Subsidiary mapping
- Settlement bank account selection
- Webhook configuration for real-time transaction updates
- Payment method registration

---

## Section 3: Payment Processing Workflows and Operations

### Core Payment Operations

The SuiteApp supports six primary gateway request types:

| Operation             | Description                                                                                                 | Common Use Case              | User Guide Ref |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------- |
| Authorization (Auth)  | Reserves funds without capturing                                                                            | Sales Order processing       | Section 3.2    |
| Capture Authorization | Captures previously authorized funds                                                                        | Post-shipment fulfillment    | Section 3.2    |
| Sale                  | Authorizes and captures in single transaction                                                               | Immediate payment processing | Section 3.2    |
| Void Authorization    | Cancels pending authorization                                                                               | Order cancellations          | Section 3.2    |
| Credit                | Initiates refund (account crediting). Note: requires manual enablement and only available for a short time. | Vendor returns               | Section 2.20   |
| Refund                | Returns captured funds to customer                                                                          | Post-sale refunds            | Section 3.2    |

### Transaction Flow Mapping

- **Back Office (MOTO - Mail Order/Telephone Order):** Manual Sales Order Creation → Authorization → Invoice/Fulfillment → Capture Authorization → Cash Sale
- **Payment Link:** Invoice created → Payment Link generated → Customer payment via Payment Link → Automatic Customer Payment creation
- **Payment Request Link:** Sales Order created → Payment Link generated → Customer payment via Payment Link → Automatic Customer Payment creation
- **SuiteCommerce My Account:** Customer pays outstanding invoice via Portal → Sale operation → Customer Payment record
- **SuiteCommerce Orders (Hosted Checkout):** Customer → SuiteCommerce → Authorization/Sale → NetSuite Sales Order/Customer Deposit
- **SuiteCommerce Orders (Embedded Checkout):** Customer → SuiteCommerce → Authorization/Sale → NetSuite Sales Order/Customer Deposit
- **External eCommerce Orders (Record External Event):** Customer → 3rd party external eCommerce site → Authorization/Sale → 3rd party API Connector → NetSuite Sales Order/Customer Deposit

User Guide References: Sections 3.1-3.4, pages 149-198

---

## Section 4: Advanced Processing Features

### 4.1 Partial Capture and Over-Capture Functionality

**Multiple Partial Capture:**

- Allows capturing less than the total authorized amount
- Enables fulfilling orders in multiple shipments with separate captures
- Must be enabled on Payment Processing Profile (checkbox: "Enable Partial Capture")
- Requires qualification/enablement from PayPal – AE/CSM must verify merchant eligibility
- Processing method: Multiple Cash Sales linked to single Sales Order authorization
- User Guide Section 2.19, pages 116-117; Section 3.2, pages 151-156

**Over-Capture:**

- Allows capturing more than the originally authorized amount
- Used when final charges exceed initial authorization (e.g., shipping adjustments, additional fees)
- Must be enabled on Payment Processing Profile (checkbox: "Enable Overcapture")
- Requires PayPal qualification/enablement — AE/CSM must verify eligibility before enabling
- For PayPal General Tokens, limit capped at 115% of original authorization
- Processing: Modify Cash Sale amounts beyond original authorization; SuiteApp submits capture at the higher amount and Braintree attempts an incremental authorization adjustment at settlement time
- User Guide Section 2.19, pages 116-117; Section 3.2, pages 154-156

> **Critical Note — Over-Capture and Under-Capture Card Type and MCC Restrictions:**
>
> Both over-capture and under-capture (partial reversal) operate via [Braintree's authorization adjustment mechanism at settlement time](https://developer.paypal.com/braintree/articles/control-panel/transactions/managing-authorizations). This is **not** a guaranteed operation — the issuing bank can decline the adjustment, resulting in a validation error.
>
> **Card Type Eligibility:**
>
> - **Mastercard** — Supported for **all merchant categories**
> - **Visa** — Restricted to **specific MCCs only**: lodging, vehicle rentals, cruise lines, restaurants/bars, amusement parks, taxicabs/rideshares, general rental categories, electric vehicle charging, parking lots/meters/garages, and grocery stores/supermarkets
> - **Visa for General eCommerce Merchants** — **NOT supported**
> - **Amex, Discover, and other card brands** — **NOT supported**
> - **Apple Pay / Digital Wallets** — **NOT supported**; the one-time-use payment nonce is consumed at checkout and cannot be adjusted post-authorization
>
> Even for eligible card types, if the issuing bank declines the adjustment, Braintree returns a validation error and the transaction must be settled at exactly the originally authorized amount.
>
> **Under-Capture (Partial Reversal) Has the Same Restrictions:**
> Submitting for less than the authorized amount is equally subject to issuer-level decline. Both over- and under-capture go through Braintree's auth adjustment mechanism and can be rejected by the issuing bank. This is not a safe fallback operation.

**If over-capture is not supported or not eligible:**

- Authorize higher amounts upfront to accommodate variable costs
- Use discount items to add processing fees
- Issue refunds post-capture if amounts overrun authorization
- Vault the payment method at the time of Authorization to ensure the ability of the merchant to re-authorize for either the overage or void and re-authorize at the correct amount
- **Note:** Vaulting is only viable when the authorization originates within NetSuite or via a platform that supports Braintree token vaulting. For external platforms that do not vault to Braintree (see Section 5.3), void and re-authorization is not possible after the fact

---

### 4.2 Tokenization and Recurring Payments

**Overview:**

- Stores sensitive payment data as encrypted tokens for reuse
- Enables seamless recurring payments without re-entering card details
- User Guide Section 2.14, pages 97-98; Appendix 5.10, pages 319-322

**Configuration:**

- Enable "Replace Payment Card by Token" on Payment Processing Profile
- Create Payment Method records for:
  - Payment Card Tokens (for credit/debit cards)
  - General Tokens (for PayPal and alternate methods)
- User Guide Section 2.14, pages 97-98

**Reauthorization Workflow:**

- Merchant's devs configure Reauthorization extension (Section 2.18, pages 111-115)
- Enables re-authorizing sales orders for additional amounts
- Useful for open-ended charges or service adjustments
- User Guide Section 3.8, pages 258

---

### 4.3 Tokenization from External E-Commerce Platforms

**Token Retrieval for 3PEP Integration:**

- Supports importing tokens from external platforms (BigCommerce, Magento, WooCommerce, Shopify, etc.)
- Requires "Retrieve Vaulted Token" checkbox on Sales Order
- Method: Record External Event with Legacy ID of vaulted transaction
- Enables NEW Authorizations via back-office processing of externally-authorized transactions
- User Guide Section 2.15, pages 99-102; Appendix 5.21, pages 336-338

**External Token Data Mapping:**

- L2/L3 Level data mapping supported for external e-commerce orders
- Integration engineers map external order data to NetSuite line items and tax amounts
- User Guide Section 2.7, page 43; Appendix 5.8, pages 312-314

---

### 4.4 Fraud Management Tools

**Basic Fraud Management:**

- Configured via Braintree Control Panel (Fraud Management settings)
- Two-tier fraud protection: AVS (Address Verification System) and CVV checks
- Can be skipped at transaction level via Skip AVS/CVV fields on Payment Processing Profile
- Rules configured at gateway level; NetSuite passes card details for verification
- User Guide Section 2.16, pages 103-104

**Fraud Protection Advanced (PayPal's Advanced Fraud Tool):**

- Enhanced fraud detection with machine learning and risk scoring
- Requires additional fees; must be enabled on Braintree Control Panel
- In NetSuite: Enable "Fraud Protection Advanced" checkbox on Payment Processing Profile
- Transactions placed on hold for manual review; merchants review and approve/reject on Fraud Protection Advanced Dashboard
- Integration engineer assists with Webhook enablement/configuration
- Scheduled script required to process refunds for rejected transactions; Merchant's devs deploy scheduled script (Section 2.17, pages 105-110)
- **Important:** Enabling this feature changes native transaction flow — holds may prevent fulfillment

---

### 4.5 Alternative Payment Methods (APMs)

**Supported Methods:**

- PayPal (Standard, Checkout Flow, Returning Payer Experience, Buy Now Pay Later)
- Venmo
- Google Pay
- Apple Pay (hosting Apple Pay via SuiteCommerce requires Apple Pay Merchant Certificate as well as hosting of domain association file and registering domain)
- ACH (Automated Clearing House)

**Configuration Layers:**

- Braintree Control Panel setup (merchant accounts, API keys)
- NetSuite Payment Method record creation (specify APM type, display settings)
- Payment Processing Profile assignment (which APMs available for which subsidiary)
- Theme configuration for storefront display

**Key User Guide Sections:**

- PayPal: Section 2.10, pages 61-64; ACH: Section 2.7, pages 43-45
- Venmo: Section 2.10, pages 86-87
- Digital Wallets (Google/Apple Pay): Section 2.10, pages 70-86

---

### 4.6 Account Updater Service

- Automatically updates expired payment card information from card networks
- Reduces failed transaction rates for expired cards
- Configured on Payment Processing Profile (Section 2.26, pages 131-134)
- NetSuite receives updated card details from Braintree via webhooks

---

## Section 5: Important Call-Out Topics for Integration Engineers

### 5.1 Multiple-Partial-Settlement

**Definition:** When Braintree breaks a single transaction into multiple settlement batches, or when merchants process orders with split settlements across time periods.

_"Permits submitting multiple partial settlements for an authorized Credit Card transaction (not required for PayPal):"_

**Integration Concerns:**

- Braintree Support MUST first enable on merchant's Braintree gateway account
- CAD AMEX merchants must ensure their processor supports this functionality
- May result in transactions settling on different dates
- Initial Authorization will expire based on payment method, so ensure merchant is vaulting if their capture schedule is 7+ days later

---

### 5.2 Over-Capture and Under-Capture Implementation and Limitations

**Critical Points for Support:**

- **PayPal Qualification Required** — Merchants must contact PayPal Braintree team BEFORE enabling
- **Merchant Account, Card Type, and MCC Specific** — Not all merchant types, card brands, and merchant categories support over-capture or under-capture
  - **Mastercard:** Supported for all MCCs
  - **Visa:** Restricted to specific MCCs (lodging, vehicle rental, cruise lines, restaurants/bars, amusement parks, taxicabs/rideshares, general rental, EV charging, parking, grocery). **General eCommerce merchants do NOT qualify**
  - **Amex, Discover, other brands:** NOT supported
  - **Apple Pay/Digital Wallets:** NOT supported (one-time-use nonces)
- **PayPal Token Limitation** — Maximum 115% of original authorization (hard cap)
- **Under-Capture Is Also Restricted** — Submitting for less than the authorized amount is equally subject to issuer-level decline; it is not a guaranteed safe operation. Both over- and under-capture go through Braintree's auth adjustment mechanism and can be rejected by the issuing bank
- **Fallback Strategy** — If unavailable, merchants should authorize higher amounts upfront OR vault the payment method at the time of authorization. Note that vaulting is only viable when the authorization originates within or through a platform that supports Braintree token vaulting
- **Documentation** — When setup, maintain clear documentation of limits and qualifications

**Common Issues:**

- Merchant enabled without PayPal approval → transactions rejected
- Attempting over-capture >115% on PayPal tokens → decline
- Insufficient initial authorization → insufficient funds in over-capture
- Card type ineligible for auth adjustment (e.g., Visa non-qualifying MCC, Amex, Apple Pay) → "The current payment card does not support over capture" error even when Over Capture is enabled in NetSuite
- Issuer declines the auth adjustment despite card type eligibility → "Transaction must be submitted for settlement for the authorized amount" error; transaction is stuck and must be handled manually
- Under-capture attempted on ineligible card or declined by issuer → similar validation errors

**User Guide Reference:** Section 2.19, pages 116-117  
**Braintree Developer Reference:** [Managing Authorizations](https://developer.paypal.com/braintree/articles/control-panel/transactions/managing-authorizations)

---

### 5.3 Third-Party External E-Commerce Integration

**Scope of Support:**
The SuiteApp accepts payment processing BEFORE orders are migrated to NetSuite through integration connectors.

**Integration Pattern:**

1. Customer purchases on external platform (BigCommerce, Magento, WooCommerce, Shopify, etc.)
2. Braintree processes payment on external platform
3. Order migrates to NetSuite via connector integration
4. Merchant uses "Record External Event" feature to link external transaction to NetSuite
5. Token Retrieval feature imports vaulted payment details for recurring charges

> ⚠️ **Critical — Amount Mismatch Between External Platform and NetSuite:**
>
> A common and serious issue arises when the authorization amount sent to Braintree by the external platform differs from the amount NetSuite attempts to capture at settlement. Because the authorization is held by Braintree at the external-platform amount, and NetSuite has no access to void and re-authorize (no vaulted token is available), the only mechanism to resolve the difference is Braintree's authorization adjustment at settlement time — which is subject to the card type and MCC restrictions described in Section 5.2.
>
> **This is especially relevant for platforms that do not vault payment tokens to Braintree** (e.g., some platforms using proprietary payment gateways, or any platform where Apple Pay is offered). In these scenarios:
>
> - Void and re-authorization from NetSuite is **not possible** — no vaulted token exists
> - Apple Pay nonces are single-use and consumed at checkout — they cannot be re-used or re-vaulted after the fact
> - Over-capture will only partially mitigate the issue (Mastercard eligible MCCs only; Visa general eCommerce is excluded)
>
> **Durable solutions for these merchants are:**
>
> 1. **Align the external platform's authorization amount with what NetSuite will capture** — ensure tax, shipping, and fees calculated at checkout match NetSuite's order totals exactly
> 2. **Switch to Sale (immediate capture) at checkout** — import into NetSuite with Payment Operation set to Sale (creates a Customer Deposit); issue Cash Refunds for any post-fulfillment adjustments

**Data Mapping Requirements:**

- L2/L3 data passing (line-item details, tax amounts, shipping)
- PN Ref field mapping (Legacy ID from Braintree must be passed to NetSuite)
- Customer matching (external customer ID → NetSuite customer ID)
- Order total validation (prevent amount mismatches)

**Common Integration Points:**

- Mandatory External Ecommerce Mapping Fields: Section 5.20, page 335
- Mapping Information for Payment Card Tokens: Section 5.21, pages 336-338
- Mapping Information for General Tokens: Section 5.22, page 338

**Support Responsibility:**

- We do not configure this for them, but rather point them to the specific mapping details present in the User Guide for this flow
- They are responsible for customizing their 3rd party external eCommerce platform for any missing functionalities (for example, automatic vaulting) if not supported out-of-the-box

---

### 5.4 Data Migrations

**Migration Scenarios:**

- Importing payment methods from another payment processor
- Migrating customers with stored payment tokens
- Updating stored Payment Instruments within their NetSuite

**Integration Considerations:**

- Importing into NetSuite – User Guide details precise steps when updating their customers' payment instruments within NetSuite following Braintree Data Migration
- NetSuite Import is performed via .CSV file
- User Guide Reference: Appendix 5.10, pages 319-322 (Manual Token Import)

---

### 5.5 Internal Processes: Submitting Tickets and Scheduling Meetings with ELIM

- ELIM is available for questions any time via Slack as well as our weekly check-ins
- ELIM is available to meet with you and the merchant after submitting a ticket via their Support Portal
- ELIM is also available to provide a Demo of the NetSuite SuiteApp experience for merchants who want to learn more
- It is your responsibility to manage these cases/notes and to request updates as needed. If the issue is no longer present, inform ELIM to Close the ticket

**Support Escalation Process:**

_When to Escalate:_

- You have repeatedly shared specific guidance to a merchant on how to configure the SuiteApp but they are still confused
- They are receiving errors/blockers in their integration that the User Guide does not provide specific guidance on
- They need some re-assurance on our end on how to perform certain operations/processing

_Submission Method:_

- Receive access to ELIM's Atlassian for ticket submission/management
- Select the appropriate ticket-type depending on support need

_Required Information for Ticket:_

- Include all relevant information to assist ELIM in troubleshooting the issue. Be as detailed as possible to ensure everyone's on the same page
- Screenshots or logs (Payment Event details, Braintree Control Panel screenshots)
- Steps to reproduce behavior/error

---

## Section 6: Reporting and Reconciliation SuiteApp Overview

### 6.1 Purpose and Functionality

The Braintree Reports & Reconciliation SuiteApp automates the matching of Braintree disbursements (settlements) to NetSuite bank deposits, enabling clean financial reconciliation.

**Key Features:**

- Processes Disbursement Fee Reports (DFR) from Braintree SFTP server
- Automatically identifies transaction line items in each disbursement
- Generates Braintree Reconciliation Summary records
- Creates or links NetSuite bank deposits to disbursements
- Flags transaction-level errors for manual correction
- Provides Month-to-Date and Year-to-Date transaction/fee reporting
- User Guide Reference: Braintree Reports & Reconciliation Admin and End User Guide v2.9, all sections

---

### 6.2 Core Record Types

**Braintree Reconciliation Summary:**

- Parent record representing a single Braintree disbursement event
- Contains aggregated amounts: gross sales, refunds, disputes, fees, net disbursed
- Status tracking: Pending → Transactions Identified → Ready for Reconciliation
- Linked to generated NetSuite bank deposit record
- User Guide Section 3.2, pages 5-12

**Braintree Reconciliation Transaction:**

- Child record representing individual transaction line items within a disbursement
- Shows Gross Presentment Amount, Net Fees, Net Disbursed Amount
- Linked to corresponding NetSuite AR/AP transaction (Cash Sale, Customer Deposit, etc.)
- Supports manual linking and account allocation if transaction matching fails
- User Guide Section 3.3, pages 13-17

---

### 6.3 Settlement Types and Fee Processing

**Net Settlement:**

- Fees deducted from transaction amount at time of processing
- Merchant receives net amount immediately
- Typical for high-volume merchants

**Gross Settlement:**

- Merchant receives full transaction amount
- Fees captured separately in subsequent month
- Common for variable-volume merchants

**Integration Engineer Responsibility:**

- Configure correct settlement type on Merchant Account during setup
- Verify reconciliation app creates deposits with correct net amounts
- Understand fee timing differences between net and gross models

---

### 6.4 Reconciliation Workflow and Error Handling

**Automated Process:**

1. Braintree uploads DFR file to SFTP server
2. NetSuite scheduled script imports DFR
3. SuiteApp generates Reconciliation Summary record
4. SuiteApp matches transactions using PN Ref (Legacy ID)
5. Status updates automatically: Pending → Transactions Identified → Ready for Reconciliation
6. Bank deposit created (if automated deposits enabled)

**Manual Intervention Scenarios:**

| Error Type                   | Cause                                                        | Resolution                                                                                | User Guide           |
| ---------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------------------- |
| Duplicate Transactions Found | Multiple NetSuite transactions share same Legacy ID          | Merchant selects correct transaction or manually links                                    | Section 3.2, page 8  |
| Transaction Not Found        | PN Ref from Braintree doesn't match any NetSuite transaction | Manually search/link transaction or allocate to clearing account                          | Section 3.2, page 9  |
| Amount Mismatch              | Gross Presentment Amount ≠ NetSuite Transaction Amount       | Verify order amounts match; investigate refunds/adjustments; allocate to clearing account | Section 3.2, page 10 |
| Error in Deposits            | SuiteApp couldn't create bank deposit                        | Check bank account configuration; verify subsidiary mapping; process manually             | Section 3.2, page 8  |

**Action Links Available:**

- **Link a Transaction:** Manually associate correct NetSuite transaction
- **Allocate to Account:** Route mismatched amounts to clearing/variance account
- **Process Deposits:** Create bank deposit record
- **Delete Deposits:** Remove auto-created deposit if error detected

---

### 6.5 Reconciliation Reports

**Reconciliation Summary Dashboard:**

- Real-time view of all disbursements with status
- Sortable by date, settlement type, amount
- Quick identification of pending/error items
- User Guide Section 3.4, page 18

**Month-to-Date Transaction and Fee Report:**

- Transaction volume and fees by payment instrument (MasterCard, Visa, ACH, Google Pay, etc.)
- Average fee per instrument
- Helps identify fee trends and optimization opportunities

**Year-to-Date Transaction and Fee Report:**

- Historical performance by fiscal/calendar year
- Comparative analysis across periods
- User Guide Section 3.4, pages 20-24

**Custom Reports:**

- Leverages NetSuite Saved Searches on Reconciliation Summary and Transaction records
- Integration engineers can create custom reporting per merchant needs

---

### 6.6 Configuration and Operational Considerations

**SFTP Setup:**

- Braintree pushes DFR files to merchant's SFTP server
- NetSuite scheduled script retrieves files on defined schedule
- Integration engineers configure frequency and error notifications
- User Guide Section 2 (Admin), pages 1-4

**Multi-Subsidiary Support:**

- Separate SFTP configurations per subsidiary if needed
- Bank account mapping ensures deposits go to correct subsidiary account
- Merchant Account ID determines which subsidiary receives settlement
- User Guide Section 2, pages 1-4

**Webhook and Real-Time Updates:**

- Optional real-time settlement notifications
- ACH transactions can include real-time status updates if enabled
- Improves reconciliation speed vs. scheduled SFTP imports

---

### 6.7 Common Integration Engineer Responsibilities

**Configuration & Deployment:**

- Work with CSM to create SFTP Braintree Account for merchant
- Share SFTP onboarding steps with merchant
- Share NetSuite Reporting & Reconciliation SuiteApp User Guide and configuration/install steps with merchant

**Troubleshooting:**

- Work with CSM, BT SFTP Reporting, and the merchant to investigate transaction matching errors
- Loop in ELIM for any SuiteApp-specific bugs/errors related to this process

---

## Section 7: Supporting Payment Methods in Depth

### 7.1 ACH (Automated Clearing House)

**Configuration:** Section 2.7, pages 43-45

**Key Points:**

- Bank-to-bank electronic transfer
- 1-2 day settlement typical
- Supports authorization and sale operations
- Real-time ACH status updates available via webhooks (enable on Payment Processing Profile)
- Used for B2B and subscription payments
- Enable Processing via Cosmos and Network Validation in Sandbox
- See [Teams One-Note on ACH enablement](onenote:Braintree.one#Adding%20ACH%20to%20Braintree%20Sandbox%20%E2%80%93%2011/20/&section-id={39078a93-2cf8-4d7d-b7b1-4de95c49281e}&page-id={8cceb6f3-cd0c-498c-b968-c20e5472a324}&end) in Sandbox Braintree

**Integration Considerations:**

- Account routing number and account verification required
- Customers may see hold periods during bank verification
- Reconciliation tracks ACH settlement dates (may differ from authorization)

---

### 7.2 PayPal Integration

**Multiple PayPal Checkout Flows Supported:**

- Standard PayPal: Traditional PayPal wallet redirect
- PayPal Checkout: Hosted checkout with PayPal integration
- Returning Payer Experience: Pre-login for returning customers
- Buy Now Pay Later: PayPal credit/installment options (APM)

**Configuration:**

- Requires PayPal Developer Account
- Client ID and Secret from PayPal setup
- Braintree Control Panel payment method configuration
- NetSuite payment method and theme record setup

**User Guide References:**

- Setup: Section 2.10, pages 61-65
- End User: Section 3.4, pages 198-236

---

### 7.3 Digital Wallets: Google Pay and Apple Pay

**Google Pay:**

- Requires Google Merchant ID registration in Production (NOTE: You must enter TESTMODE or other text into the Google Merchant ID processing profile field when Sandbox testing)
- Configuration on Braintree Control Panel and Payment Processing Profile
- Supports embedded checkout and external checkout flows
- User Guide Section 2.10, pages 70-77

**Apple Pay:**

- Requires Apple Developer Account and Merchant ID
- Certificates and domain registration needed
- Domain verification via DNS TXT record
- Supported on SCA checkout and external flows
- User Guide Section 2.10, pages 77-86

**Integration Notes:**

- Both methods require domain whitelisting
- Testing should occur in sandbox before production
- Certificate renewal must be tracked annually
- **Apple Pay uses one-time-use nonces** — cannot be adjusted post-authorization (no over-capture/under-capture support)

---

## Section 8: Transaction Lifecycle and Payment Events

### 8.1 Payment Event Records

Each transaction processing step creates a Payment Event record on the associated NetSuite transaction (Sales Order, Cash Sale, Customer Payment, etc.).

**Fields Tracked in Payment Events:**

- Transaction ID (PN Ref in Braintree format)
- Operation (Auth, Capture, Refund, etc.)
- Result (Accept, Decline, Error)
- Reason code (operation-specific outcome)
- Amount
- Timestamp
- View Details link to Braintree transaction

User Guide Reference: Section 3.9, page 261; Appendix 5.4, pages 307

---

### 8.2 Authorization Lifecycle and Expiration

**Authorization Expiration:**

- Braintree authorizations expire after defined period (typically 7 days, varies by processor)
- Expired authorizations cannot be captured - requires new authorization
- Integration engineers must track expiration dates

**Reauthorization:**

- Available to extend or refresh authorization before expiry
- Configuration on Payment Processing Profile (Section 2.18, pages 111-115)
- Useful for long-fulfillment cycles or uncertain delivery dates

**Authorization Details Saved Search:**

- Lists all authorizations with expiration dates and status
- Color-coded status indicators
- Days-to-expiry calculation
- User Guide Section 3.15, pages 327-330 (Note: Check v44 for actual Appendix location)

---

### 8.3 Payment Statuses in NetSuite

Payment events have specific status values tracked during processing:

| Status  | Meaning                                 | Example Scenario                    |
| ------- | --------------------------------------- | ----------------------------------- |
| Pending | Submitted to gateway, awaiting response | Authorization in progress           |
| Accept  | Successfully processed                  | Authorization accepted by Braintree |
| Decline | Rejected by gateway                     | Declined due to insufficient funds  |
| Error   | Processing error                        | Network timeout, malformed request  |

User Guide Reference: Appendix 5.3, page 305

---

## Section 9: Common Integration Challenges and Troubleshooting

### 9.1 Customer Duplicate Transactions

**Scenario:** Same payment appears twice in Braintree Control Panel and NetSuite

**Causes:**

- Network timeout during authorization → merchant resubmits → creates duplicate
- Customer clicks Submit button twice rapidly
- Idempotency key not properly implemented in custom code

**Prevention:**

- Implement idempotent request handling in custom integrations
- Add duplicate detection checks on Braintree Control Panel (Section 2.2, page 9)
- Test network failure scenarios in sandbox

**Resolution:**

- Contact ELIM to void duplicate transaction in Braintree
- Update NetSuite payment event details
- Reconciliation SuiteApp handles duplicates with manual linking

---

### 9.2 Payment Capture Failures

**Common Reasons:**

- Authorization expired (>7 days)
- Authorization amount insufficient for capture amount
- Processor decline due to address/CVV mismatch
- Transaction flagged by fraud tools (on hold)
- **Over-capture attempted on ineligible card type or MCC** (Visa general eCommerce, Amex, Apple Pay, etc.)
- **Under-capture attempted and declined by issuer**

**Troubleshooting:**

- Check Payment Event details for reason code
- Verify authorization date against expiration
- Review Fraud Protection Advanced dashboard if applicable
- Check AVS/CVV skip settings vs. customer data
- **Verify card brand and merchant MCC eligibility for auth adjustments** (see Section 5.2)
- If validation error "must be submitted for settlement for the authorized amount" → capture exact auth amount or void/re-auth if token vaulted

---

### 9.3 Reconciliation Mismatches

**Amount Differences Between Braintree and NetSuite:**

- Pending refunds not yet settled
- Multi-currency conversion differences
- Pending disputes/chargebacks
- Reversal or adjustment transactions
- **Auth adjustment declined by issuer** — settled at original auth amount instead of adjusted amount

**Investigation:**

- Compare Braintree Control Panel totals with NetSuite transaction amounts
- Check for partial refunds or credits
- Verify settlement vs. posting dates
- Use Reconciliation Summary error logs
- Review Payment Events for auth adjustment validation errors

---

### 9.4 Webhook Configuration Issues

**Symptoms:**

- Transactions not showing settled status in NetSuite
- Payment events missing or incomplete
- ACH real-time status not updating

**Verification:**

- Confirm Postback URL generated and saved on Payment Processing Profile (Section 2.3, page 30)
- Test webhook in Braintree Control Panel ("Check URL" link)
- Verify webhook notification types enabled (Dispute, Disbursement, Transaction Settlement)
- Check NetSuite scheduled script logs for receipt/processing errors

User Guide Reference: Section 2.3, pages 30-32

---

### 9.5 SuiteApp Installation Issues

**Symptoms:**

- SuiteApp will not install
- Error occurs during SuiteApp installation process

**Verification:**

- Confirm Chargeback Workflow Bundle has been installed prior to installing SuiteApp

---

### 9.6 Payment Attempt Failure

**Symptoms:**

- No payment attempt is ever made when being attempted

**Verification:**

- Confirm all External Roles have been approved and enabled within NetSuite as these are required for the SuiteApp to perform successfully
- See Section 5.24 (page 341) for NetSuite Version 2025.1+ External Role requirements

---

### 9.7 Amount Mismatch Errors with External Platforms

**Symptoms:**

- "The current payment card does not support over capture" error when capturing from imported order
- Validation error during capture of externally authorized transaction
- Amount in NetSuite differs from amount authorized on external platform

**Root Cause:**

- External platform authorized amount differs from NetSuite order total
- No vaulted token available for void/re-auth
- Card type or MCC ineligible for auth adjustment
- Apple Pay or other non-reusable payment method

**Resolution:**

- **Immediate:** Capture at exact authorized amount (may require manual adjustment)
- **Long-term:** Implement one of the durable solutions from Section 5.3:
  1. Align external platform authorization with NetSuite totals
  2. Switch to Sale (immediate capture) at checkout, issue refunds for adjustments
- Work with merchant to vault tokens during external checkout if platform supports it
- Document external platform limitations in integration runbook

---

## Section 10: Best Practices and Recommendations for Integration Engineers

### 10.1 Discovery Phase Best Practices

**During initial discovery calls, prioritize gathering:**

- **External platform details** — Identify all eCommerce platforms (BigCommerce, Magento, WooCommerce, Shopify, custom solutions)
- **Payment methods offered** — Especially Apple Pay, Google Pay, PayPal (determine if vaulting is supported)
- **Order fulfillment timing** — If >7 days, vaulting is critical for reauth capability
- **Variable pricing scenarios** — Shipping adjustments, tips, fees added post-authorization
- **Card brand mix and MCC** — Determine if merchant qualifies for auth adjustments (critical for Visa merchants)

### 10.2 Proactive Risk Assessment

**Red Flags to Address Early:**

- External platform + Apple Pay + variable pricing → No auth adjustment capability; recommend Sale at checkout
- Visa MCC outside eligible categories + need for over-capture → Qualify merchant with PayPal team BEFORE implementation
- Long fulfillment cycles without vaulting → Authorization will expire; ensure vaulting enabled
- Multiple partial shipments without "Enable Partial Capture" → Set expectations and enable feature

### 10.3 Documentation Standards

**For every integration, maintain:**

- **External platform connector details** — Name, version, custom code locations
- **Token vaulting capability matrix** — Which platforms/payment methods support vaulting to Braintree
- **MCC and card brand eligibility** — Document if merchant qualifies for auth adjustments
- **Webhook configuration** — URLs, notification types enabled, test results
- **Fallback procedures** — What to do when auth adjustment fails (capture at original amount, void/reauth, issue refund)

### 10.4 Testing Checklist for External Platform Integrations

Before production launch, verify:

- [ ] Test order authorized on external platform imports correctly to NetSuite
- [ ] PN Ref (Legacy ID) mapping is accurate
- [ ] Amount in NetSuite matches amount authorized in Braintree
- [ ] Token retrieval works if enabled (test with vaulted transaction)
- [ ] Capture succeeds at exact authorized amount
- [ ] **If over-capture needed:** Test with eligible card (Mastercard), verify validation error with ineligible card (Visa general eCommerce, Amex)
- [ ] **If using Apple Pay:** Confirm Sale operation at checkout (no post-auth adjustments possible)
- [ ] L2/L3 data passing correctly (line items, tax, shipping)
- [ ] Reconciliation matches imported transactions to disbursements

### 10.5 Common Merchant Misconceptions to Correct

**Misconception 1:** "Over-capture is enabled in NetSuite, so we can capture any amount we want"

- **Reality:** Card type, MCC, and issuer must all support auth adjustment; not guaranteed even when enabled

**Misconception 2:** "We can just use under-capture (partial reversal) as a safe fallback"

- **Reality:** Under-capture has same restrictions as over-capture; issuer can decline

**Misconception 3:** "If we vault the token, we can always adjust the amount later"

- **Reality:** Vaulting enables void/reauth (new authorization), but does not bypass card brand restrictions on auth adjustments

**Misconception 4:** "Apple Pay works just like credit cards for authorization adjustments"

- **Reality:** Apple Pay uses one-time nonces; no adjustments possible; must use Sale at checkout

### 10.6 Escalation Criteria

**Escalate to ELIM when:**

- Validation error occurs that User Guide doesn't explain
- Auth adjustment fails for eligible card/MCC combination
- Webhook not firing despite correct configuration
- Reconciliation amount mismatch cannot be explained by standard causes
- External platform integration producing unexpected behavior in SuiteApp

**Escalate to PayPal Braintree team when:**

- Merchant needs over-capture/partial capture qualification
- MCC eligibility questions for auth adjustments
- External platform requires specific Braintree API capabilities
- Production account needs feature enablement not available in sandbox

---

## Appendix A: Glossary of Terms

**Authorization (Auth):** Reserves funds on customer's payment method without capturing (settling) them immediately

**Authorization Adjustment:** Braintree mechanism to increase (incremental auth) or decrease (partial reversal) authorized amount at settlement time; subject to card brand, MCC, and issuer approval

**Capture:** Settling previously authorized funds; moving money from customer to merchant

**Cash Sale:** NetSuite transaction type representing immediate fulfillment and payment capture

**Customer Deposit:** NetSuite transaction type representing prepayment for future order

**External Checkout:** Payment processed outside NetSuite (e.g., on external eCommerce platform or via payment link)

**General Token:** Vaulted payment method for PayPal, Venmo, and other alternative payment methods

**L2/L3 Data:** Line-level transaction details (item descriptions, quantities, prices, tax) for commercial card processing

**Legacy ID (PN Ref):** Braintree transaction identifier used to link external transactions to NetSuite records

**MCC (Merchant Category Code):** Four-digit code classifying merchant's business type; affects authorization adjustment eligibility

**MOTO (Mail Order/Telephone Order):** Back-office transaction entry (not customer-initiated online)

**Over-Capture:** Capturing more than originally authorized amount; subject to restrictions

**Partial Capture:** Capturing less than full authorized amount in one or more transactions

**Payment Card Token:** Vaulted credit/debit card for reuse in future transactions

**Payment Event:** NetSuite record documenting each gateway operation (auth, capture, void, refund) on a transaction

**Payment Processing Profile (PPP):** NetSuite configuration linking subsidiary to Braintree merchant account

**PN Ref:** See Legacy ID

**Sale:** Single operation that authorizes and captures funds immediately

**SuiteCommerce (SCA):** NetSuite's eCommerce platform for customer-facing online stores

**Token Vaulting:** Securely storing payment method details for future reuse without re-entering card data

**Under-Capture:** See Partial Capture; can also refer to partial reversal during auth adjustment

**3PEP (Third-Party E-Commerce Platform):** External eCommerce platform (BigCommerce, Magento, etc.) integrated with NetSuite

---

## Document Revision History

| Version | Date          | Changes                                                                                                                                                                                     | Author                  |
| ------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| v2025.1 | February 2026 | Updated for SuiteApp v44 (1.3.53); added comprehensive over/under-capture card brand and MCC restrictions; enhanced external platform integration guidance; added Section 10 best practices | Integration Engineering |

---

**End of Training Guide**
