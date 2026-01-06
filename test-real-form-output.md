# NetSuite-Braintree Integration Summary

**Merchant:** Real Form Test Inc.
**Email:** test@realform.com
**Generated:** 12/10/2025
**Business Model:** Business to Consumer (B2C)

---

## Your Selected Configuration

This integration summary has been customized for **Real Form Test Inc.** based on your specific requirements. Below is a review of your selections followed by implementation guidance and resources.

### Configuration Review

- **Same-Day Capture** - Transactions will be authorized and captured immediately
- **ACH Processing** enabled for bank transfers (Network Check)
- **Payment Methods:** Credit/Debit Cards, PayPal, Google Pay
- **Processing Channels:** eCommerce/SCA, Payment Link
- **3D Secure 2.0** enabled for SCA compliance

---

## Implementation Guide

The following sections provide specific implementation guidance for your selected features. These sections have been automatically selected based on your requirements to ensure you only see relevant information.

### Integration Complexity: ⚠️ MODERATE

Moderate - Standard configuration with some additional features

**Your Configuration Tags:** ecommerce, payment_link, credit_card, ach, paypal, digital_wallet, sale, authorization, capture, refund, void, tokenization, vaulting, 3ds_2, fraud_protection, ach_network_check, reconciliation

---

### Relevant Sections (12 sections matched)

## OVERVIEW OF THE BRAINTREE ECOSYSTEM

**Tags**: [general reference]

### What We Support

The Braintree-NetSuite integration consists of two primary SuiteApps:

1. **SuitePayments** - Payment processing, authorization, capture, and refund operations
2. **Reporting & Reconciliation** - Transaction reconciliation and fund disbursement tracking

### Integration Scope

- Real-time payment authorization, capture, and reauthorization
- Partial and over-capture transactions
- Tokenization and vaulting of payment methods
- Multiple payment method support (credit cards, ACH, PayPal, Google Pay, Apple Pay, Venmo)
- Multi-subsidiary and multi-currency processing
- Fraud protection (basic and advanced)
- Automated reconciliation via Disbursement Fee Reports (DFR)

---

## MAIN SUPPORT DOCUMENTS

**Tags**: [general reference]

### Admin and End User Guides

All documentation is version-controlled and accessible through the Payment Processing Profile in NetSuite:

| Document | Purpose | Location |
|---|---|---|
| **SuitePayments Admin Guide (V.42, Release 1.3.51)** | Setup, configuration, payment methods, fraud management | Braintree Configuration > Payment Processing Profile > Admin End User Guide link |
| **Reporting & Reconciliation Admin Guide (V2.9, Release 2025.1.0.29)** | SFTP setup, reconciliation configuration, deposit creation | Braintree Reconciliation > Configuration > Admin and End User Guide link |
| **NetSuite Training Slides** | High-level sales and technical overview | Internal training repository |
| **NetSuite Basics** | General NetSuite platform navigation and functionality | Oracle NetSuite Help Center |

### Key Reference Materials

- Braintree Control Panel documentation (available via Braintree support)
- PayPal Developer Portal (for alternate payment methods)
- NetSuite SuiteAnswers and Help Center
- Integration-specific mapping documentation (provided during setup)

**Note:** Request the latest documentation versions from ELIM Solutions or check the SuiteApp marketplace for the most current releases.

---

## SEPARATION OF DUTIES AND SUPPORT BOUNDARIES

**Tags**: [general reference]

### Where We Support (ELIM Solutions / Braintree Integration Team)

#### SuiteApp Installation & Configuration
- Payment Processing Profile setup and credential management
- Payment method configuration (card brands, tokenization, fraud settings)
- Webhook and postback URL configuration
- Theme record and UI customization
- Reporting and reconciliation SFTP setup and DFR configuration
- Script scheduling and deployment

#### Payment Processing Workflows
- Authorization, capture, refund, void operations
- Reauthorization logic and expiration handling
- Tokenization and token retrieval workflows
- External ecommerce transaction recording
- Payment status and event tracking

#### Reconciliation & Reporting
- DFR import configuration and troubleshooting
- Deposit record creation and linking issues
- Transaction matching and discrepancy resolution
- Account allocation and manual transaction linking

#### Advanced Features
- Fraud Protection Advanced setup and decision handling
- 3D Secure 2.0 configuration
- L2/L3 data processing for specialized merchants
- Account Updater for expired card renewal
- Dynamic descriptors and custom field mapping

### Where Merchant Supports (Merchant / Customer Success)

#### Braintree Account Management
- Merchant account setup and sandbox provisioning
- Braintree credentials and API key generation
- Merchant Account ID creation for subsidiaries and currencies
- Settlement account configuration in Braintree Control Panel

#### NetSuite Configuration
- Enable Features and Accounting Preferences
- Subsidiary and legal entity structure setup
- Bank account and chart of accounts configuration
- User roles and permissions for payment processing

#### Business Process Design
- Payment workflow decisions (authorization vs. sale, capture timing)
- Refund policies and procedures
- Reconciliation schedule and responsibility assignment

#### Operational Support
- End-user training and support
- Daily transaction monitoring and issue escalation
- Chargeback and dispute handling
- Invoice and payment reminder processes

---

## TOKENIZATION AND RE-AUTHORIZATION

*Tags: credit_card, paypal, tokenization, reauthorization, feature, moderate*

**Tags**: `credit_card`, `paypal`, `tokenization`, `reauthorization`, `feature`, `moderate`

### Overview

Tokenization stores payment card details securely in Braintree vault. Tokens remain valid until card expiration or Account Updater renewal.

Re-authorization is required when:
- Authorization expires (typically 7 days)
- Amount changes
- Order needs to be rebilled

### Configuration

**Setup Location**: Braintree Configuration > Payment Processing Profile > Tokenization section

**Required Fields**:
- **Replace Payment Card by Token**: Set to `true`
- **Payment Card Token Payment Method**: Select or create payment method (type: Payment Card Token)
- **General Token Payment Method**: Select or create (for PayPal/alternate methods)

**Re-auth Button Display Options**:
- `No` - Never show re-auth button
- `Based on days before expiry` - Show when approaching authorization expiration
- `Always` - Always show re-auth button

**Days Prior to Expiry for ReAuth button**: Specify number of days (e.g., 3 days before expiry)

### Payment Processing Steps

1. Initial transaction processes with credit card
2. Card tokenized and stored in Braintree vault
3. Token stored on customer record in NetSuite (under Custom tab)
4. Token reused for future transactions
5. Account Updater automatically refreshes expired cards
6. Re-auth initiated when auth expires or amount changes

### Common Issues and Resolution

| Issue | Cause | Resolution |
|---|---|---|
| Token expiration not detected | Auth events not monitored | Enable Account Updater; regularly review Auth Event records |
| Re-auth fails | Card no longer in vault | Verify token exists in Braintree; check Account Updater status |
| Duplicate tokens created | Poor token management during import | Implement token deduplication logic; verify import mapping |
| Expired cards still being used | Account Updater not enabled | Enable Account Updater on Payment Processing Profile |

### Account Updater Configuration

**Purpose**: Automatically refresh expired cards before reauth fails

**Setup**:
1. Navigate to Braintree Configuration > Payment Processing Profile
2. Scroll to Account Updater section
3. Ensure Account Updater is enabled
4. Review Account Update Summary Report for token status

**Monitoring**:
- Check Account Update Summary Report for refresh status
- Watch for "Invalid" token status requiring manual action
- Set up email alerts for update failures

---

## 3D SECURE 2.0

*Tags: credit_card, 3ds_2, feature, moderate, payment_link, payment_request_link*

**Tags**: `credit_card`, `3ds_2`, `feature`, `moderate`, `payment_link`, `payment_request_link`

### Overview

Three-Domain Secure 2.0 is an authentication protocol for card-not-present transactions. Can trigger customer challenge or seamless authentication depending on issuer rules.

### When 3DS 2.0 is Used

- Regulatory requirement (e.g., PSD2 in Europe)
- High-risk transaction profiles
- Merchant preference for additional security
- Payment Link and Payment Request Link transactions
- Payment Card and Google Pay checkout flows

### Configuration

**Enable on Payment Processing Profile**:
1. Navigate to Braintree Configuration > Payment Processing Profile
2. Scroll to Primary section
3. Check "Payer Authentication" checkbox
4. Save

**Add Authentication to Gateway Request Types**:
1. Scroll down to Gateway Request Types section
2. Ensure "Authentication" is listed
3. If not present, manually add it
4. Save

**Enable on Braintree Control Panel**:
1. Login to Braintree
2. Navigate to Account Settings > Processing
3. Verify 3DS 2.0 enabled
4. Save

### Billing Address Configuration (Critical as of v1.3.50+)

**Importance**: Incorrect billing address format causes authentication challenge failures

**Configuration Options on Payment Processing Profile**:
- `Use Payment Card For Billing Address By Default`: Enabled = use card's billing address; Disabled = use transaction billing address

**Best Practice**:
- Enable for payment card transactions
- Ensure card billing address matches NetSuite customer record
- Test with multiple card issuers before production

### Customer Experience

When transaction triggers 3DS 2.0:
1. Customer redirected to issuing bank's authentication page
2. Bank challenges customer (password, OTP, biometric, etc.)
3. Upon successful auth, transaction proceeds
4. If auth fails, transaction declined

### Common Issues and Resolution

| Issue | Cause | Resolution |
|---|---|---|
| 3DS challenge fails | Incorrect billing address format | Verify address format matches card issuer; enable "Use Payment Card For Billing Address" |
| Authentication gateway request type not found | Not configured on Payment Processing Profile | Add "Authentication" to Gateway Request Types section |
| Timezone/locale affecting challenge UI | Regional configuration issue | Contact Braintree support for locale settings |
| Merchant not configured on Braintree | 3DS 2.0 not activated | Enable 3DS 2.0 on Braintree Control Panel |

---

## EXTERNAL ECOMMERCE INTEGRATION

*Tags: ecommerce, external_checkout, integration, complex*

**Tags**: `ecommerce`, `external_checkout`, `integration`, `complex`

### Overview

SuiteApp designed to work with external platforms (Shopify, Magento, BigCommerce, custom integrations).

Transactions can be:
1. **Recorded** with handling mode "Record External Event"
2. **Imported** with data mapping
3. **Created directly** via API or integration

### Tokenization for External Platforms

**Important**: Tokenization must occur on external platform for vaulting in NetSuite

**Flow**:
1. Customer enters payment card on external checkout
2. External platform tokenizes card (via Braintree hosted fields or own tokenizer)
3. External platform stores token
4. External platform processes auth/capture with token
5. External platform sends PN Ref to NetSuite via integration
6. NetSuite records transaction with PN Ref

**For vaulting in NetSuite**:
- Enable "Enable Retrieve Vaulted Token" checkbox on Sales Order
- System fetches token from Braintree using PN Ref
- Token stored on NetSuite customer record

### PN Ref (Legacy ID) Critical for Linking

**Definition**: Unique transaction identifier from Braintree

**Importance**: PN Ref is the key link between external transaction and NetSuite record

**Common Issues**:
- PN Ref not passed in integration mapping → Transactions orphaned, duplicates created
- PN Ref format incorrect → Matching fails
- PN Ref not unique → Multiple transactions linked incorrectly

**Resolution**:
1. Establish clear PN Ref mapping requirements before integration build
2. Validate PN Ref field in integration data mapping
3. Test with small transaction volume first (10-20 transactions)
4. Reconcile before scaling to production volume

### Recording External Events

**When to Use**: Transaction already authorized/captured on external platform; need to record in NetSuite

**Configuration**:
1. Create Sales Order in NetSuite
2. Set Payment Option to external platform payment method
3. Set Handling Mode to "Record External Event"
4. Enter PN Ref (transaction ID from external platform)
5. Enter Auth Code (if available)
6. Set Payment Operation to Authorization or Sale
7. Save

**Result**: Payment Event record created showing transaction recorded (not processed in real-time)

### Token Retrieval for Externally Authorized Transactions

**When to Use**: Customer authorized on external platform; want to retrieve token for future NetSuite transactions

**Configuration**:
1. On Sales Order, check "Enable Retrieve Vaulted Token" checkbox
2. Set Handling Mode to "Record External Event"
3. Enter PN Ref from external transaction
4. Save

**Result**: Token fetched from Braintree and stored on customer record

### Common Issues and Resolution

| Issue | Cause | Resolution |
|---|---|---|
| PN Ref mapping incorrect | Integration mapping error | Verify mapping with external platform team; validate sample transactions |
| External authorization not yet settled | Timing issue | Wait 24-48 hours for settlement; retry import/recording |
| Payment method doesn't exist in NetSuite | External platform not configured | Create external platform payment method in NetSuite first |
| Amount mismatches | Calculation error in integration | Verify amount field mapping; test with manual transaction |
| Duplicate transactions created | PN Ref collision or multiple import attempts | Implement deduplication logic; check for duplicate integration runs |
| Token retrieval fails | Vaulting not enabled on external platform | Verify external platform has vaulting enabled; check token exists in Braintree |

---

## CREDIT CARD PROCESSING

*Tags: credit_card, operation, payment_link, payment_request_link, moto, suitcommerce*

**Tags**: `credit_card`, `operation`, `payment_link`, `payment_request_link`, `moto`, `suitcommerce`

### Authorization Workflow

**Use Case**: Hold funds without capturing immediately (e.g., before shipment)

**NetSuite Steps**:
1. Create Sales Order
2. Under Billing tab: Set Payment Option to credit card
3. Set Payment Operation to "Authorization"
4. Set Payment Processing Profile to Braintree
5. Set Handling Mode to "Process"
6. Optional: Set Authorization Amount if different from total
7. Click Save

**Result**: 
- Authorization created in Braintree
- Payment Event record shows "Authorization" with status
- Funds held for 7 days (typically)

**Next Step**: Capture authorization when ready to charge

### Capture Authorization Workflow

**Use Case**: Capture previously authorized funds

**NetSuite Steps**:
1. Open Sales Order with existing Authorization
2. Click "Fulfill" or "Bill" to trigger capture
3. Verify Payment Operation shows "Capture Authorization"
4. Click Save

**Result**:
- Capture request sent to Braintree
- Payment Event shows "Capture Authorization" status
- Funds pulled from customer account

### Sale Workflow (Auth + Capture)

**Use Case**: Authorize and capture in single operation (e.g., e-commerce checkout, Payment Link)

**NetSuite Steps**:
1. Create Cash Sale or Customer Deposit
2. Under Billing tab: Set Payment Option to credit card
3. Set Payment Operation to "Sale"
4. Set Payment Processing Profile to Braintree
5. Set Handling Mode to "Process"
6. Click Save

**Result**:
- Authorization created and immediately captured
- Funds pulled from customer account
- Single Payment Event record shows "Sale"

### Payment Link (Invoice-Based Sale)

**Use Case**: Customer pays invoice online via secure link

**Setup**:
1. Navigate to Setup > Company > Enable Features
2. Enable "Payment Link" under Transactions tab
3. Navigate to Commerce > Payment Link
4. Configure: Domain Prefix, Payment Methods, Company Logo, Email Templates
5. Save

**Workflow**:
1. Create Invoice
2. Under Billing tab: Set Payment to "Payment Link"
3. Click Save
4. Share Payment Link URL with customer
5. Customer clicks link, selects payment method, enters card details
6. Transaction processed securely via Braintree
7. Customer Payment record created automatically
8. Email confirmation sent

**Key Configuration**:
- **Domain Prefix**: Unique identifier for your Payment Link URL
- **Payment Methods**: Select which payment types customer can use
- **Allow Partial Payments**: Enable if customer can pay invoice amount partially
- **Email Templates**: Customize acceptance/rejection messages

### Refund Workflow

**Important**: Braintree supports referenced refunds only (must reference original transaction)

**NetSuite Steps**:
1. Open Cash Sale with successful Capture or Sale
2. Click "Refund" button (appears if transaction settled)
3. Verify Payment Operation shows "Refund"
4. Review refund amount (may partial)
5. Click Save

**Result**:
- Refund request sent to Braintree
- Funds returned to customer account (1-3 business days)
- Payment Event shows "Refund" status

**Timing Note**: Braintree may error if transaction not yet settled (typically 24 hours after capture)

### Void Authorization Workflow

**Use Case**: Cancel authorization before capture (e.g., order cancelled before shipment)

**NetSuite Steps**:
1. Open Sales Order with Authorization
2. Click "Close Order"
3. Confirm void

**Result**:
- Authorization voided in Braintree
- Funds released immediately
- Payment Event shows "Void Authorization"

---

## ACH (AUTOMATED CLEARING HOUSE)

*Tags: ach, operation, payment_link, suitcommerce, moderate*

**Tags**: `ach`, `operation`, `payment_link`, `suitcommerce`, `moderate`

### Overview

ACH processes bank-to-bank transfers. Typically settles in 1-2 business days (not immediate like credit cards).

### Configuration

**Enable on Braintree**:
1. Login to Braintree Control Panel
2. Navigate to Account Settings > Processing
3. Verify ACH enabled
4. Confirm Merchant Account supports ACH

**Enable on NetSuite**:
1. Navigate to Braintree Configuration > Payment Methods > New
2. Set Name: "ACH"
3. Set Type: "ACH"
4. Set Associated Payment Processing Profile: Your Braintree profile
5. Set Account: Expense account for ACH fees (if applicable)
6. Save

2. Add to Payment Processing Profile
   - Navigate to Braintree Configuration > Payment Processing Profile
   - Scroll to Payment Information section
   - Ensure ACH appears in supported payment methods
   - Save

### Usage Scenarios

| Scenario | Payment Operation | Processing |
|---|---|---|
| Sales Order payment | Sale | Auth and immediate clearing house debit |
| Invoice payment via Payment Link | Sale | Customer initiates debit from Payment Link |
| Customer Payment (manual entry) | Sale | Back-office operator enters bank details |
| SuiteCommerce MyAccount | Sale | Customer self-service payment |

### Real-Time ACH Status (Optional)

**Purpose**: Receive webhook notifications when ACH transaction status changes

**Configuration**:
1. Navigate to Braintree Configuration > Payment Processing Profile
2. Check "Enable Real time ACH status" checkbox
3. Save

**Result**: Webhook sent to NetSuite when ACH settles or fails

### Common Issues and Resolution

| Issue | Cause | Resolution |
|---|---|---|
| ACH not appearing in payment methods | Not enabled on Braintree or Payment Method not created | Enable on Control Panel; create ACH Payment Method in NetSuite |
| Transaction fails with "not supported" | Merchant Account doesn't support ACH | Contact Braintree to enable ACH on Merchant Account |
| Settlement delayed | Standard 1-2 business day ACH cycle | Inform customer of standard timeline; provide transaction reference |
| ACH marked failed but no status update | Real-time ACH status not enabled | Enable webhook or manually check transaction status in Braintree |

---

## PAYPAL AND EXTERNAL CHECKOUT

*Tags: paypal, external_checkout, digital_wallet, payment_link, payment_request_link, suitcommerce*

**Tags**: `paypal`, `external_checkout`, `digital_wallet`, `payment_link`, `payment_request_link`, `suitcommerce`

### PayPal Setup

**Prerequisites**:
1. PayPal Developer Account created (https://developer.paypal.com)
2. Braintree connected to PayPal account
3. NetSuite credentials configured

**Configuration Steps**:

1. **Create PayPal App**
   - Login to PayPal Developer Portal
   - Navigate to Apps & Credentials
   - Create new Merchant App
   - Copy: Client ID, Secret

2. **Connect PayPal to Braintree**
   - Login to Braintree Control Panel
   - Navigate to Processing > PayPal > Options
   - Paste PayPal Email, Client ID, Secret
   - Save

3. **Setup Payment Method in NetSuite**
   - Navigate to Braintree Configuration > Payment Methods > New
   - Set Name: "PayPal"
   - Set Type: "External Checkout"
   - Set Associated Payment Processing Profile: Your profile
   - Save

4. **Add to Payment Processing Profile**
   - Navigate to Braintree Configuration > Payment Processing Profile
   - Under Allowed Alternate Payments: Select "PayPal"
   - Save

### PayPal Checkout Flow

**Returning Payer Experience**: Reduces friction for repeat customers

**Buy Now Pay Later (BNPL)**: PayPal financing option available to eligible customers

**Configuration**:
- Enable "PayPal Checkout Returning Payer" in Allowed Alternate Payments
- Enable "PayPal Buy Now Pay Later" in Allowed Alternate Payments

### Usage Scenarios

| Scenario | Location | Result |
|---|---|---|
| Payment Link (invoice) | Customer clicks Payment Link | Redirect to PayPal | Select PayPal or BNPL |
| Braintree Payment Request Link | Sales Order payment request | Redirect to Braintree PRL hosted page |
| SuiteCommerce Advanced | Checkout page | PayPal button embedded in checkout |
| External Checkout | Any checkout requiring alternate payment | Redirect to Braintree payment page |

### PayPal Tokenization (General Tokens)

**Important**: PayPal uses General Tokens (not Payment Card Tokens)

**Configuration**:
1. Navigate to Braintree Configuration > Payment Processing Profile
2. Under Tokenization section: Set General Token Payment Method to PayPal General Token
3. Check "Replace Payment Card by Token" if vaulting desired
4. Save

**Result**: PayPal account stored as General Token on customer record for future use

### Common Issues and Resolution

| Issue | Cause | Resolution |
|---|---|---|
| PayPal not showing on Payment Link | Not in Allowed Alternate Payments | Add PayPal to Allowed Alternate Payments on PPP |
| Redirect fails | Redirect URL not configured | Verify Braintree Control Panel redirect settings |
| Token not created | General Token payment method not configured | Create PayPal General Token payment method |
| BNPL not showing | Not enabled in Allowed Alternate Payments | Enable PayPal Buy Now Pay Later |

---

## DIGITAL WALLETS (GOOGLE PAY, APPLE PAY, VENMO)

*Tags: digital_wallet, external_checkout, payment_link, payment_request_link, suitcommerce*

**Tags**: `digital_wallet`, `external_checkout`, `payment_link`, `payment_request_link`, `suitcommerce`

### Google Pay

**Configuration**:

1. **Get Google Merchant ID**
   - Sign in to Google Merchant Center
   - Navigate to Account Settings
   - Copy Merchant ID

2. **Enable on Braintree Control Panel**
   - Login to Braintree
   - Navigate to Account Settings > Payment Method > Google Pay
   - Enable Google Pay toggle
   - Save

3. **Add Google Merchant ID to NetSuite**
   - Navigate to Braintree Configuration > Payment Processing Profile
   - Scroll to Digital Wallet Configuration section
   - Paste Google Merchant ID in "Google Merchant ID" field
   - Save

4. **Add to Allowed Alternate Payments**
   - Under Allowed Alternate Payments: Select "Google Pay"
   - Save

**Result**: Google Pay button appears on Payment Link, Payment Request Link, and SuiteCommerce checkout

### Apple Pay

**Configuration** (More Complex):

1. **Enable on Braintree Control Panel**
   - Login to Braintree
   - Navigate to Account Settings > Payment Method > Apple Pay
   - Enable Apple Pay toggle

2. **Add Website Domains**
   - Click "Options" > "Add Website Domain"
   - For SuiteCommerce: Copy SCA primary domain from SCA configuration
   - For Payment Link/PRL: Generate test transaction, copy domain from URL until .com
   - Add domain and agree to terms
   - Click "Create a Certificate Signing Request"
   - Download CSR file (save for later)

3. **Configure on Apple Developer Account** (Requires macOS)
   - Sign in to Apple Developer Account (Team Agent or Admin role)
   - Navigate to Certificates, IDs & Profiles
   - Create Merchant ID
   - Create Apple Pay Payment Processing Certificate (upload CSR)
   - Create Apple Pay Merchant Identity Certificate
   - Download certificates

4. **Add Certificates to NetSuite**
   - Navigate to Setup > Company > Keys
   - Create new Key record
   - Upload Apple certificates

5. **Add to Payment Processing Profile**
   - Navigate to Braintree Configuration > Payment Processing Profile
   - Under Digital Wallet Configuration: Ensure Apple Pay payment method selected
   - Under Allowed Alternate Payments: Select "Apple Pay"
   - Save

**Result**: Apple Pay button appears on supported transactions

### Venmo

**Important**: Requires PayPal qualification and business profile setup

**Configuration**:

1. **Get Business Profile from Braintree**
   - Contact PayPal to enable Venmo
   - Create Business Profile in Braintree Control Panel
   - Navigate to Account Settings > Payment Method > Venmo > Options > Add New Profile

2. **Enable on Payment Processing Profile**
   - Navigate to Braintree Configuration > Payment Processing Profile
   - Under Digital Wallet Configuration: Select Venmo payment method
   - Under Allowed Alternate Payments: Select "Venmo"
   - Save

**Result**: Venmo option appears on Payment Link, Payment Request Link, and SuiteCommerce

### Vaulting Digital Wallets

All digital wallets can be tokenized and stored as General Tokens

**Configuration**:
1. Ensure General Token payment method created
2. Check "Vault Alternate Payment" on Payment Processing Profile
3. Enable Theme Record vaulting option
4. Save

**Result**: "Save this payment method" checkbox appears for customers; tokens stored for future use

### Common Issues and Resolution

| Issue | Cause | Resolution |
|---|---|---|
| Google Pay button not showing | Google Merchant ID not set | Add Google Merchant ID to PPP |
| Apple Pay certificate errors | macOS not used for setup | Use macOS for certificate creation; ensure Team Agent role |
| Venmo not enabled | PayPal qualification not obtained | Contact PayPal to enable Venmo |
| Domain verification failed | Incorrect domain added | Verify domain matches exact URL (until .com); re-verify on Apple account |

---

## RECONCILIATION AND REPORTING

*Tags: reconciliation, moderate, complex*

**Tags**: `reconciliation`, `moderate`, `complex`

### Overview

Reconciliation SuiteApp automates matching bank deposits to NetSuite transactions.

**Flow**:
1. Braintree generates Disbursement Fee Report (DFR) every 2 calendar days
2. DFR uploaded to Braintree SFTP server
3. NetSuite scheduled script pulls DFR from SFTP
4. System creates Braintree Reconciliation Summary records
5. Individual transactions linked via Legacy ID (PN Ref)
6. NetSuite deposit records created automatically or manually
7. Reconciliation Summary marked "Ready for Reconciliation"

### Configuration Areas

**SFTP Connection**:
- SSH key generation (3072-bit RSA)
- Host key retrieval
- Private key upload to NetSuite
- SFTP start date configuration

**DFR Configuration**:
- Merchant Account IDs mapped to subsidiaries
- Settlement types (Net or Gross)
- Deposit bank accounts
- Fee accounts for processing charges

**Script Deployment**:
- BT Import DFR file from SFTP server scheduled script
- Frequency (typically daily)
- Error notification recipients

**File Cabinet**:
- Create folder for storing downloaded DFR files
- Set appropriate access restrictions

### Reconciliation Summary Record

**Contains**:
- Disbursement details (amount, date, settlement type)
- Associated transactions (sales, refunds, disputes, fees)
- Generated deposit records (linked)
- Status (Pending, Transactions Identified, Pending Resolution, Error in Deposits, Ready for Reconciliation)

**Common Statuses**:
- **Pending**: Reconciliation Summary still processing
- **Transactions Identified**: All transactions found but no deposit created
- **Pending Resolution**: Manual action needed (linking or allocation)
- **Error in Deposits**: Issue creating deposit record
- **Ready for Reconciliation**: Deposit created; ready to match against bank statement

### Common Issues and Resolution

| Issue | Cause | Resolution |
|---|---|---|
| SFTP Connection Test Unsuccessful | Invalid credentials, SSH key error | Verify SSH key ID; confirm public key shared with Braintree; test host key format |
| Transactions Not Found | Legacy ID mismatch, transaction not settled | Verify transaction imported; check 2-day settlement timing |
| Amount Mismatch | Partial captures, fees, currency | Review Braintree Reconciliation Transaction details; manually link or allocate |
| Duplicate Transactions | Multiple NetSuite records for same Braintree transaction | Use "Link a Transaction" action; manually select correct transaction |
| Error in Deposits | Clearing account not set, subsidiary/bank mismatch | Configure DFR with correct clearing account and bank account |

### Monitoring Reconciliation

**Check Daily**:
- Reconciliation Summary Dashboard for new disbursements
- Status of recent reconciliations
- Error logs for failed transactions

**Weekly**:
- Month-to-Date and Year-to-Date Transaction/Fee Reports
- Compare to bank deposits
- Investigate discrepancies

**Monthly**:
- Full reconciliation against bank statement
- Address any pending or error status summaries

---

## FRAUD PROTECTION

*Tags: fraud_protection, fraud_advanced, feature*

**Tags**: `fraud_protection`, `fraud_advanced`, `feature`

### Basic Fraud Management (AVS/CVV)

**Configuration**:

1. **Enable on Braintree Control Panel**
   - Login to Braintree
   - Navigate to Fraud Management
   - Configure AVS rules (Address Verification System)
   - Configure CVV rules (Card Verification Value)
   - Save

2. **Configure on Payment Processing Profile**
   - Navigate to Braintree Configuration > Payment Processing Profile
   - Under Skip Basic Fraud section:
     - Skip Basic Fraud For Back Office Transaction: Set to desired option
     - Skip Basic Fraud For Payment Link: Set to desired option
     - Skip Basic Fraud For SCA: Set to desired option
   - Save

**AVS/CVV Checks**:
- **AVS**: Verifies billing address matches card issuer's records
- **CVV**: Verifies 3/4-digit security code on back of card

**Result**: Transactions flagged or declined based on AVS/CVV mismatch

### Fraud Protection Advanced

**Configuration** (More Complex):

1. **Enable on Braintree Control Panel**
   - Login to Braintree
   - Navigate to Fraud Management
   - Check "Enable Fraud Protection Advanced"
   - Additional fees apply
   - Navigate to API Webhooks
   - Edit webhook configured for NetSuite
   - Check "Transaction Reviewed" under Notification
   - Save

2. **Enable on Payment Processing Profile**
   - Navigate to Braintree Configuration > Payment Processing Profile
   - Check "Enable Fraud Protection Advanced" checkbox
   - Save

3. **Configure NetSuite Scripts**
   - Navigate to Customization > Scripting > Scripts
   - Filter for "BT Generate Refund for Fraud Review Deployment"
   - Click View
   - Navigate to Deployments tab
   - Set Status to "Scheduled"
   - Choose schedule (typically daily)
   - Add notification email recipients
   - Save

**Risk Decision Types**:
- **Approve**: Transaction approved; proceed with fulfillment
- **Review**: Transaction flagged; manual review required
- **Decline**: Transaction declined; cannot be reversed by merchant

**Workflow**:
1. Customer completes transaction
2. Braintree Fraud Protection Advanced analyzes transaction
3. Decision sent to NetSuite via webhook
4. Transaction placed on hold if "Review" status
5. Merchant reviews transaction in Fraud Protection Advanced dashboard
6. Merchant approves or rejects
7. If rejected: Scheduled script generates refund automatically

### Common Issues and Resolution

| Issue | Cause | Resolution |
|---|---|---|
| Webhook not sending decisions | "Transaction Reviewed" not enabled | Enable "Transaction Reviewed" notification on webhook |
| Refund not generated | Scheduled script not deployed | Deploy and schedule BT Generate Refund script |
| False positives (good transactions flagged) | Fraud rules too aggressive | Review and adjust filters in Fraud Protection Advanced dashboard |
| Legitimate transactions blocked | AVS/CVV mismatch | Review AVS/CVV rules; consider lowering strictness for certain regions |

---

---

## Next Steps

1. **Review this summary** with your implementation team
2. **Access the Braintree Control Panel** to configure your payment methods
3. **Install the NetSuite SuiteApp** (Bundle ID: 283423)
4. **Follow the implementation guides** referenced in each section above
5. **Test thoroughly** in the Braintree Sandbox environment
6. **Schedule a review** with your Braintree account representative

## Key Resources

- **[Braintree Developer Portal](https://developer.paypal.com/braintree/)** - Complete API documentation
- **[NetSuite SuitePayments Documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N2988163.html)** - NetSuite integration guides
- **[Testing & Go-Live Checklist](https://developer.paypal.com/braintree/docs/guides/credit-cards/testing-go-live/)** - Pre-production validation
- **Braintree SuitePayments Admin Guide** - Version V.42, Release 1.3.51 (contact your Braintree representative)

---

*This implementation summary was generated on 12/10/2025 based on your discovery form responses. Please review with your implementation team and Braintree account representative for the most current guidance.*
