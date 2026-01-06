---
title: 'Braintree SuitePayments Integration Reference Guide'
version: '2025.1.3.52'
document_version: 'V.43'
last_updated: 'November 28, 2025'
plugin_release: '2025.1.3.52'
tags:
  - braintree
  - netsuite
  - payments
  - integration
  - reference
  - technical-guide
---

# Braintree SuitePayments Integration Reference Guide

**Version:** 2025.1.3.52  
**Last Updated:** November 28, 2025  
**Document Version:** V.43

---

## Table of Contents

- [Overview](#overview)
- [Payment Methods Supported](#payment-methods-supported)
- [Supported Components & Workflows](#supported-components--workflows)
- [Payment Processing Transactions](#payment-processing-transactions)
- [Admin Configuration Guide](#admin-configuration-guide)
- [Payment Methods Configuration](#payment-methods-configuration)
- [Tokenization & Vaulting](#tokenization--vaulting)
- [Fraud Management](#fraud-management)
- [Payment Operations](#payment-operations)
- [Braintree Credentials](#braintree-credentials)
- [Webhook Configuration](#webhook-configuration)
- [Payment Request Link](#payment-request-link)
- [Dynamic Descriptors](#dynamic-descriptors)
- [Account Updater](#account-updater)
- [Payment Statuses & Events](#payment-statuses--events)
- [Appendix](#appendix)

---

## Overview

**Tags:** `general` `all-payment-methods` `all-components`

The Braintree SuitePayments SuiteApp is an integrated payment solution for NetSuite that seamlessly links your NetSuite account with Braintree's payment gateway, enabling:

- Real-time payment authorization and capture
- Reauthorization and over/partial capture
- Multiple payment method support
- Tokenization and secure payment storage
- Fraud protection and advanced fraud management
- Direct integration with SuiteCommerce Advanced
- External e-commerce platform support

---

## Payment Methods Supported

**Tags:** `payment-methods` `reference`

### Primary Payment Methods

**Tags:** `credit-card` `ach` `payment-method-setup`

- **Credit/Debit Cards** (VISA, MasterCard, American Express, Discover, JCB)
- **ACH (Automated Clearing House)** - Direct bank transfers

### Alternate Payment Methods

**Tags:** `paypal` `venmo` `google-pay` `apple-pay` `bnpl` `payment-method-setup`

- **PayPal** - Checkout & Returning Payer Experience
- **PayPal Buy Now Pay Later (BNPL)**
- **Venmo** - Mobile payment service
- **Digital Wallets**:
  - Google Pay
  - Apple Pay

---

## Supported Components & Workflows

**Tags:** `components` `workflows` `reference`

### NetSuite Components

**Tags:** `back-office` `suitecommerce` `payment-link` `payment-request-link`

- NetSuite BackOffice
- SuiteCommerce / My Account
- NetSuite Payment Link on Invoice
- Braintree Payment Request Link on Sales Order

### Common Workflows

**Tags:** `workflow` `ecommerce` `moto` `recurring`

- E-commerce Orders (authorized then captured)
- MOTO Orders (authorized then captured)
- Deposit Orders (charged upfront)
- Invoice Payments
- Online Payments via Payment Link
- Online Payments via SuiteCommerce My Account
- 3D Secure 2.0 Authentication
- Alternate Payment Method Embedded Buttons
- Payment Tokenization & Reauthorization
- Over/Partial Capture
- Refunds & Credits

---

## Payment Processing Transactions

**Tags:** `transactions` `payment-operations` `gl-impact` `reference`

### Supported NetSuite Transactions

| Transaction          | Payment Operation                       | GL Impact                                                | Tags                                    |
| -------------------- | --------------------------------------- | -------------------------------------------------------- | --------------------------------------- |
| **Sales Order**      | Authorization, Void Authorization, Sale | Non-posting; creates Customer Deposit for Sale operation | `sales-order` `authorization` `capture` |
| **Cash Sale**        | Capture Authorization, Sale             | Debit: Undeposited Funds / Credit: Revenue               | `cash-sale` `capture`                   |
| **Customer Payment** | Sale                                    | Debit: Undeposited Funds / Credit: Accounts Receivable   | `customer-payment` `sale`               |
| **Customer Deposit** | Sale                                    | Debit: Undeposited Funds / Credit: Customer Liability    | `customer-deposit` `sale`               |
| **Cash Refund**      | Refund                                  | Debit: Revenue / Credit: Undeposited Funds               | `refund` `cash-refund`                  |
| **Customer Refund**  | Credit                                  | Credit: Unreferenced Refunds                             | `refund` `credit`                       |

**Note:** When Payment Operation is "Sale" on a Sales Order, NetSuite automatically treats it as a Customer Deposit.

---

## Admin Configuration Guide

**Tags:** `admin` `setup` `configuration` `prerequisites`

### Initial Setup Checklist

**Tags:** `admin-checklist` `initial-setup` `all-components`

#### 1. Braintree Control Panel Setup

**Tags:** `admin` `braintree-setup` `credentials` `prerequisite`

- [ ] Sign up for Sandbox account at braintreepayments.com/sandbox
- [ ] Set up Braintree credentials:
  - Merchant ID
  - Public & Private Keys
  - Merchant Account ID
  - Tokenization Key (SDK Key)
- [ ] Sign up for PayPal developer account
- [ ] Connect PayPal account to Braintree

#### 2. NetSuite Account Setup

**Tags:** `admin` `netsuite-setup` `prerequisite` `plugin-installation`

- [ ] Enable Features:
  - Setup > Company > Enable > Transactions > Payment Processing
  - Enable: Credit Card Payments, Payment Instruments, Payment Link
- [ ] Setup Accounting Preferences (Setup > Accounting > Accounting Preference)
- [ ] Install Chargeback Workflow Bundle (Bundle ID: 127355)
- [ ] Install Braintree Payments SuiteApp
- [ ] Activate Braintree Payment plug-in (Customization > plug-ins > Manage plug-ins)
- [ ] Setup Payment Processing Profile
- [ ] Configure Webhooks

#### 3. Payment Methods Setup

**Tags:** `admin` `payment-method-setup` `credit-card` `ach` `paypal` `venmo` `google-pay` `apple-pay`

- [ ] Configure Credit/Debit Card payment methods
- [ ] Configure ACH payment method
- [ ] Configure PayPal payment method
- [ ] Configure Digital Wallet (Google Pay, Apple Pay)
- [ ] Configure Venmo payment method
- [ ] Setup Payment Link

#### 4. Advanced Features

**Tags:** `admin` `advanced-setup` `tokenization` `fraud` `reauthorization` `3ds` `capture`

- [ ] Setup Tokenization
- [ ] Setup Token Retrieval for external platforms
- [ ] Setup Fraud Management (Basic)
- [ ] Setup Fraud Protection Advanced (if applicable)
- [ ] Setup 3D Secure 2.0
- [ ] Setup Reauthorization
- [ ] Setup Over/Partial Capture
- [ ] Setup Account Updater
- [ ] Configure Theme Record for UI customization

---

## Braintree Credentials

**Tags:** `admin` `braintree-setup` `credentials` `prerequisite`

### Required Credentials for NetSuite Integration

**Tags:** `credentials` `reference`

#### Merchant ID

**Tags:** `credential` `required` `braintree-config`

- **Description:** Unique identifier for entire gateway account
- **Location in Braintree:** Business > Merchant Accounts
- **Different for:** Sandbox and Production gateways
- **Used for:** All transaction processing

#### Public & Private Keys

**Tags:** `credential` `required` `braintree-config` `api`

- **Description:** User-specific API credentials
- **Location in Braintree:** API > Keys > API Keys section
- **Notes:**
  - Each user has own public key
  - Private key should not be shared
  - Required for API calls

#### Merchant Account ID

**Tags:** `credential` `required` `braintree-config` `tokenization` `vaulting`

- **Description:** Identifier for specific merchant account
- **Location in Braintree:** Business > Merchant Accounts
- **Required for:** Tokenization/Vaulting
- **Important:** Create one for each subsidiary/currency combination

#### Tokenization Key (SDK Key)

**Tags:** `credential` `required` `braintree-config` `tokenization` `paypal` `embedded-buttons`

- **Description:** Key for client-side token generation
- **Location in Braintree:** API > Keys > Tokenization Keys
- **Used for:** PayPal external checkout, embedded buttons
- **How to create:** API > Keys > Generate New Tokenization Key

### Creating Merchant Accounts in Braintree

**Tags:** `admin` `braintree-setup` `merchant-account` `procedure`

```
1. Navigate to: Braintree Control Panel > Business > Merchant Accounts
2. Click "New Sandbox Merchant Account" (for testing)
3. Configure for each subsidiary/currency combination
4. Copy Merchant ID and Merchant Account ID
5. Paste into NetSuite Payment Processing Profile
```

---

## Payment Processing Profile Setup

**Tags:** `admin` `profile-configuration` `all-payment-methods` `core-setup`

### Location

**Tags:** `reference` `navigation`

Braintree > Configuration > Payment Processing Profiles

### Primary Configuration Fields

**Tags:** `profile-config` `reference` `core-fields`

| Field                       | Description               | Example                              |
| --------------------------- | ------------------------- | ------------------------------------ |
| **Name**                    | Unique profile identifier | "Braintree - USD", "Braintree - EUR" |
| **Subsidiary**              | NetSuite legal entity     | Select from list                     |
| **Settlement Bank Account** | Bank account for deposits | Select from GL accounts              |
| **Support Line Level Data** | Enable L2/L3 processing   | Checkbox                             |
| **Test Mode**               | Sandbox vs Production     | Checkbox                             |
| **Website**                 | SuiteCommerce sites       | Multi-select                         |

### Braintree Config Section

**Tags:** `profile-config` `braintree-credentials` `required`

| Field               | Value from Braintree               |
| ------------------- | ---------------------------------- |
| Public key          | API > Keys > API Keys              |
| Private key         | API > Keys > API Keys (click View) |
| Merchant ID         | Business > Merchant Accounts       |
| Merchant Account ID | Business > Merchant Accounts       |
| Tokenization key    | API > Keys > Tokenization Keys     |

### Advanced Configuration Options

**Tags:** `profile-config` `advanced` `optional`

#### Over/Partial Capture

**Tags:** `capture` `overcapture` `partial-capture` `admin` `advanced`

- **Enable Overcapture** - Checkbox (requires PayPal approval)
- **Enable Partial Capture** - Checkbox (requires PayPal approval)

#### ACH Processing

**Tags:** `ach` `admin` `webhook` `real-time-status`

- **Enable Real time ACH status** - Checkbox (requires webhook notifications)

#### Fraud Management

**Tags:** `fraud` `avs` `cvv` `admin` `advanced`

- **Skip Basic Fraud For Back Office Transaction** - Dropdown options
- **Skip Basic Fraud For Payment Link** - Dropdown options
- **Skip Basic Fraud For SCA** - Dropdown options
- **Enable Fraud Protection Advanced** - Checkbox

#### Payment Methods Configuration

**Tags:** `payment-method-setup` `tokenization` `admin`

```
1. Under "Payment Information" section
2. Add individual payment methods
3. Select "Replace Payment Card By Token" for tokenization
4. Choose Payment Card Token method
5. Choose General Token method (for PayPal, Venmo)
```

#### Tokenization Settings

**Tags:** `tokenization` `vaulting` `admin` `advanced`

| Field                                 | Description                           |
| ------------------------------------- | ------------------------------------- |
| **Replace Payment Card By Token**     | Enable tokenization for cards         |
| **Payment Card Token Payment Method** | Select Payment Card Token type method |
| **General Token Payment Method**      | Select General Token type method      |

#### Digital Wallet Configuration

**Tags:** `google-pay` `apple-pay` `digital-wallet` `admin` `profile-config`

| Field                                       | Description                                 |
| ------------------------------------------- | ------------------------------------------- |
| **Braintree Digital Wallet Payment Method** | Select digital wallet method                |
| **Allowed Alternate Payment**               | Multi-select (Google Pay, Apple Pay, Venmo) |
| **Google Merchant ID**                      | From Google Console (Google Pay only)       |

#### Dynamic Descriptors Configuration

**Tags:** `descriptors` `admin` `profile-config` `card-statement`

| Field                | Limit    | Notes                              |
| -------------------- | -------- | ---------------------------------- |
| **Company Name/DBA** | 18 chars | Truncated by Braintree if exceeded |
| **Phone Number**     | 10 chars | No special characters (\*, ., -)   |
| **URL**              | 13 chars | Processor-dependent                |

#### Payment Request Link Configuration

**Tags:** `payment-request-link` `prl` `admin` `profile-config`

| Field                                                   | Description                      |
| ------------------------------------------------------- | -------------------------------- |
| **Braintree Payment Request Link Method**               | Select associated payment method |
| **Braintree Payment Request Link Expiration (In Days)** | Default: 3 days                  |
| **Disable Payment Card For PRL**                        | Checkbox to hide card option     |
| **Disable PayPal For PRL**                              | Checkbox to hide PayPal option   |

#### Gateway Request Types

**Tags:** `payment-operations` `reference`

- Authorization
- Capture Authorization
- Credit
- Refund
- Sale
- Void Authorization

#### Webhook Configuration

**Tags:** `webhook` `admin` `profile-config` `notifications`

- Check **Reset Postback URL** to generate new webhook URL
- Copy generated URL to Braintree Control Panel
- Configure webhook notifications (see Webhook Configuration section)

### Saving and Activating Profile

**Tags:** `admin` `procedure` `profile-setup`

```
1. Fill all required fields
2. Click Save
3. Copy Internal ID for reauthorization configuration
4. Profile is ready for transaction processing
```

---

## Webhook Configuration

**Tags:** `webhook` `admin` `notifications` `integration` `real-time-status`

### Purpose

**Tags:** `reference` `overview`

Webhooks enable real-time notifications from Braintree to NetSuite for transaction status updates.

### Setup Steps

**Tags:** `admin` `procedure` `step-by-step`

1. **Get Postback URL from NetSuite**

   - Navigate to Payment Processing Profile (View mode)
   - Scroll to "Payment Information"
   - Copy "POSTBACK URL"

2. **Configure in Braintree Control Panel**

   - Login to Braintree Control Panel
   - Navigate to: API > Webhooks
   - Click gear icon > Select "API"
   - Click "+ Create New Webhook"

3. **Add Webhook Configuration**
   - Paste POSTBACK URL into "Destination URL"
   - Select Notifications:

| Section          | Notification                    | Tags                                  |
| ---------------- | ------------------------------- | ------------------------------------- |
| **Dispute**      | Disputed                        | `dispute` `chargeback`                |
| **Disbursement** | Disbursement                    | `disbursement` `settlement`           |
| **Transaction**  | Transaction Settlement Declined | `ach` `settlement` `real-time-status` |
|                  | Transaction Settlement Settled  | `ach` `settlement` `real-time-status` |

4. **Verify Webhook**
   - Click "Check URL" under Actions
   - Expected response: "Success! Server responded with 202"

### ACH Real-Time Status Updates

**Tags:** `ach` `webhook` `real-time-status` `admin` `advanced`

To enable real-time ACH transaction status:

1. Enable "Enable Real time ACH status" on Payment Processing Profile
2. Ensure these webhook notifications are configured:
   - Transaction Settlement Settled
   - Transaction Settlement Declined

**Note:** Real-time ACH status is NOT supported for native NetSuite Invoice Payment Link.

---

## Payment Methods Configuration

**Tags:** `payment-method-setup` `admin` `configuration`

### Credit/Debit Card Payment Method

**Tags:** `credit-card` `payment-method-setup` `admin` `core`

**Location:** Braintree > Configuration > Payment Methods > New

#### Required Fields

**Tags:** `payment-method-config` `required-fields` `reference`

| Field                              | Value                                               |
| ---------------------------------- | --------------------------------------------------- |
| **Name**                           | Card type name (e.g., "VISA", "MasterCard")         |
| **Type**                           | "Payment Card"                                      |
| **Card Brands**                    | Select card brand (REQUIRED for SCA & Payment Link) |
| **Requires Line-Level Data**       | Checkbox for L2/L3 processing                       |
| **Associated Processing Profiles** | Select Braintree profile                            |
| **Countries**                      | Select countries for display                        |
| **Account**                        | GL account to debit                                 |
| **Payment Visuals: web/standard**  | Standard format                                     |

#### Standard Card Setup Reference

**Tags:** `credit-card` `reference` `setup-template`

| Field       | VISA                                    | MasterCard                            | Amex                                    | Discover                                    | JCB                                    |
| ----------- | --------------------------------------- | ------------------------------------- | --------------------------------------- | ------------------------------------------- | -------------------------------------- |
| Type        | Payment Card                            | Payment Card                          | Payment Card                            | Payment Card                                | Payment Card                           |
| Card Brands | VISA                                    | MASTERCARD                            | AMEX                                    | DISCOVER                                    | JCB                                    |
| Image URL   | `/images/icons/creditcard/pmt_visa.gif` | `/images/icons/creditcard/pmt_mc.gif` | `/images/icons/creditcard/pmt_amex.gif` | `/images/icons/creditcard/pmt_discover.gif` | `/images/icons/creditcard/pmt_jcb.gif` |

### ACH Payment Method

**Tags:** `ach` `payment-method-setup` `admin` `core`

**Location:** Braintree > Configuration > Payment Methods > New

#### Required Fields

**Tags:** `payment-method-config` `required-fields` `reference`

| Field                              | Value                            |
| ---------------------------------- | -------------------------------- |
| **Name**                           | ACH method name                  |
| **Type**                           | "ACH"                            |
| **Requires Line-Level Data**       | Checkbox for L2/L3 processing    |
| **Associated Processing Profiles** | Select Braintree profile         |
| **Countries**                      | Countries where ACH is available |
| **Account**                        | GL account to debit              |
| **Payment Visuals**                | web/standard                     |

#### ACH Prerequisites

**Tags:** `ach` `prerequisites` `admin` `setup`

- PayPal must enable ACH in your Braintree portal
- ACH Sandbox Verification toggle required
- Contact PayPal representative for setup

#### Real-Time ACH Status Handling

**Tags:** `ach` `real-time-status` `webhook` `settlement` `refund`

- When "Enable Realtime ACH Status" is checked, transactions stay in Pending until settlement notification
- Webhook notifications required: Settlement Settled, Settlement Declined
- Failed ACH transactions trigger automatic refund if previously accepted

### PayPal External Checkout Method

**Tags:** `paypal` `payment-method-setup` `admin` `external-checkout`

**Location:** Braintree > Configuration > Payment Methods > New

#### Required Fields

**Tags:** `payment-method-config` `required-fields` `reference`

| Field                              | Value                                     |
| ---------------------------------- | ----------------------------------------- |
| **Name**                           | "PayPal Checkout", "PayPal BNPL", etc.    |
| **Type**                           | "External Checkout"                       |
| **Requires Line-Level Data**       | Optional (uncheck for decimal quantities) |
| **Associated Processing Profiles** | Select Braintree profile                  |
| **Countries**                      | Where PayPal is available                 |
| **Account**                        | GL account to debit                       |

#### PayPal Checkout Experience Options

**Tags:** `paypal` `checkout-experience` `reference` `advanced`

1. **PayPal Checkout** (Customers without vaulted PayPal)

   - Available for: NetSuite Payment Link, Braintree Payment Request Link, SuiteCommerce guests, first-time customers
   - Customers can enable "Vault Display" for returning payer experience

2. **PayPal Returning Payer** (Customers with vaulted PayPal)

   - Available for: Existing SuiteCommerce customers with vaulted token
   - Faster checkout experience

3. **PayPal Buy Now Pay Later (BNPL)**
   - Countries: Limited availability
   - Setup: Navigate to Payment Processing Profile > Allowed Alternate Payments
   - Select Digital Wallet Method and enable "Buy Now Pay Later"

#### PayPal Quantity Limitation

**Tags:** `paypal` `limitation` `important` `decimal-quantities` `l2l3-data`

**Important:** Users can only process PayPal transactions with whole number quantities. For decimal quantities, uncheck "Requires Line-Level Data" on payment method.

### Digital Wallet - Google Pay

**Tags:** `google-pay` `digital-wallet` `payment-method-setup` `admin`

**Setup Locations:**

1. Braintree Control Panel: Account Setting > Payment Method > Google Pay
2. NetSuite Payment Processing Profile: Digital Wallet Configuration

#### Steps

**Tags:** `admin` `procedure` `step-by-step`

1. **Enable on Braintree Control Panel**

   - Navigate to: Account Setting > Payment Method > Google Pay
   - Toggle Google Pay to enabled

2. **Setup Payment Method in NetSuite**

   - Type: "External Checkout"
   - Name: "Digital Wallets"
   - Associated Processing Profile: Select Braintree profile

3. **Configure on Payment Processing Profile**
   - Digital Wallet Section:
     - **Braintree Digital Wallet Payment Method:** Select digital wallet method
     - **Allowed Alternate Payments:** Check "Google Pay"
     - **Google Merchant ID:** Enter valid Google Merchant ID

#### Google Merchant ID

**Tags:** `google-pay` `credential` `required` `reference`

- Obtained from Google Merchant Center
- Different from Google Account ID
- Required for Google Pay functionality

### Digital Wallet - Apple Pay

**Tags:** `apple-pay` `digital-wallet` `payment-method-setup` `admin` `advanced`

**Setup Locations:**

1. Braintree Control Panel: Account Setting > Payment Method > Apple Pay
2. Apple Developer Account: Merchant IDs & Certificates
3. NetSuite: Payment Processing Profile + Website Hosting Files

#### Prerequisites

**Tags:** `apple-pay` `prerequisites` `advanced`

- Apple Developer Account (requires Team Agent or Admin role)
- Mac OS device for certificate management
- Compliance with Apple Pay Acceptable Use Guidelines

#### Setup Steps

**Tags:** `admin` `procedure` `step-by-step` `apple-pay`

1. **Enable on Braintree Control Panel**

   - Account Setting > Payment Method > Apple Pay
   - Toggle enabled
   - Add Website Domains via Options button

2. **Domain Setup in Braintree**

   - **For SCA Embedded Button:** Copy SCA primary domain from SCA configuration
   - **For External Checkout/PRL/Payment Link:**
     - Create test transaction to get URL
     - Copy URL until ".com"
     - Add as domain in Braintree

3. **Certificate Download**

   - Navigate to: Apple Pay Options > Click "Add" under Apple Merchant Certificates
   - Click "Download Certificate Signing Request"
   - Save for later certificate creation

4. **Create Apple Merchant ID & Certificates** (in Apple Developer Account)

   - Launch Safari on Mac OS
   - Sign in to Apple Developer
   - Navigate to: Certificates, IDs & Profile > Identifiers > Click "+"
   - Select "Merchant IDs" > Add Description and Identifier
   - Create Apple Pay Payment Processing Certificate
   - Upload downloaded Certificate Signing Request

5. **Create Merchant Identity Certificate**

   - In Keychain Access: Certificate Assistant > Request Certificate from CA
   - Enter email and key name
   - Upload generated certificate in Apple Developer

6. **Add Merchant Domains** (in Apple Developer)

   - Navigate to: Merchant IDs > Your Merchant ID
   - Click "Add Domain" under Merchant Domains
   - Add SCA primary domain and External Checkout domain

7. **Download Domain Association File**

   - Complete merchant domain verification
   - Download .txt merchant domain association file

8. **Upload to NetSuite**

   - Navigate to: Customization > Documents > Files > Website Hosting Files
   - Create new folder ".well-known"
   - Upload merchant domain association file
   - Return to Apple Developer > Click "Verify"

9. **Configure in NetSuite Payment Processing Profile**
   - Digital Wallet Configuration:
     - **Braintree Digital Wallet Payment Method:** Select digital wallet method
     - **Allowed Alternate Payments:** Check "Apple Pay"

### Venmo Payment Method

**Tags:** `venmo` `payment-method-setup` `admin` `external-checkout`

**Setup Locations:**

1. Braintree Control Panel: Account Setting > Payment Method > Venmo
2. NetSuite Payment Processing Profile

#### Prerequisites

**Tags:** `venmo` `prerequisites` `admin`

- Braintree must enable Venmo in your portal
- Contact PayPal representative
- Merchant must create Business Profile in Braintree

#### Setup Steps

**Tags:** `admin` `procedure` `step-by-step`

1. **Setup Business Profile on Braintree Control Panel**

   - Account Setting > Payment Method > Venmo > Options
   - Click "Add a New Profile"
   - Complete business profile configuration

2. **Setup on Payment Processing Profile**

   - Navigate to: Payment Processing Profile > Edit
   - Digital Wallet Configuration:
     - **Braintree Digital Wallet Payment Method:** Select digital wallet method
     - **Allowed Alternate Payments:** Select "Venmo"

3. **Create Payment Method**
   - Braintree > Configuration > Payment Methods > New
   - Type: "External Checkout"
   - Name: "Venmo"
   - Associated Processing Profile: Braintree profile

**Note:** Venmo is only supported in the United States.

---

## Tokenization & Vaulting

**Tags:** `tokenization` `vaulting` `admin` `advanced` `security`

### Payment Card Tokenization

**Tags:** `tokenization` `credit-card` `admin` `vaulting` `recurring`

**Purpose:** Securely store credit/debit card information for future transactions without storing sensitive data.

#### Setup Steps

**Tags:** `admin` `procedure` `step-by-step`

1. **Create Payment Method for Card Tokens**

   - Navigate to: Braintree > Configuration > Payment Methods > New
   - Set fields:
     - **Name:** "PayPal Braintree Card Token"
     - **Type:** "Payment Card Token"
     - **Associated Processing Profiles:** Select Braintree profile
     - **Requires Line-Level Data:** Optional
     - **Account:** GL account to debit

2. **Enable Tokenization on Payment Processing Profile**

   - Navigate to: Braintree > Configuration > Payment Processing Profile
   - Scroll to "Tokenization" section
   - Check: "Replace Payment Card By Token" = true
   - Select: "Payment Card Token Payment Method" = created method above

3. **Processing**
   - After first successful transaction, card is automatically tokenized
   - Token stored in NetSuite as Payment Card Token record
   - Token can be reused for future transactions

### General Token Tokenization

**Tags:** `tokenization` `paypal` `venmo` `general-token` `admin` `vaulting`

**Purpose:** Secure storage for PayPal, Venmo, and other alternate payment methods.

#### Setup Steps

**Tags:** `admin` `procedure` `step-by-step`

1. **Create General Token Payment Method**

   - Navigate to: Braintree > Configuration > Payment Methods > New
   - Set fields:
     - **Name:** "PayPal General Token"
     - **Type:** "General Token"
     - **Associated Processing Profiles:** Select Braintree profile
     - **Account:** GL account to debit

2. **Enable on Payment Processing Profile**

   - Navigate to: Payment Processing Profile > Tokenization section
   - Select: "General Token Payment Method" = created method above

3. **Vaulting on Theme Record** (Customer-facing)
   - See Theme Record setup for customer UI configuration

### Vaulting Alternate Payment Methods

**Tags:** `vaulting` `paypal` `venmo` `admin` `advanced` `customer-ui`

Allows secure storage of PayPal, Venmo, and digital wallet information for future transactions.

#### Backend Setup (Merchant)

**Tags:** `admin` `backend-config` `vaulting`

**Location:** Payment Processing Profile > Alternate Payment Configuration

| Field                             | Description                   | Tags                                   |
| --------------------------------- | ----------------------------- | -------------------------------------- |
| **Vault Alternate Payment**       | Checkbox to enable vaulting   | `admin` `vaulting`                     |
| **Theme (Commerce Payment Link)** | Select theme for Payment Link | `admin` `payment-link` `theme`         |
| **Theme (Payment Request Link)**  | Select theme for PRL          | `admin` `payment-request-link` `theme` |

#### Frontend Setup (Customer UI)

**Tags:** `customer-ui` `theme` `vaulting` `frontend`

See Theme Record setup section for displaying vault checkbox to customers.

---

## 3D Secure 2.0 Authentication

**Tags:** `3ds` `3d-secure` `authentication` `security` `admin` `credit-card`

**Purpose:** Additional authentication layer for card security, required for certain transactions.

### Supported For

**Tags:** `3ds` `compatible` `reference`

- Payment Cards
- Payment Card Tokens
- Google Pay

### Payment Processing Profile Setup

**Tags:** `admin` `procedure` `step-by-step` `profile-config`

1. **Navigate to:** Braintree > Configuration > Payment Processing Profile

2. **Enable 3DS 2.0**

   - Scroll to "Primary" section
   - Check: "Payer Authentication" checkbox

3. **Configure Gateway Requests**

   - Scroll to "Payment Information"
   - Under "Gateway Requests," ensure "Authentication" is selected

4. **Save Profile**

### SuiteCommerce Advanced Configuration (Additional)

**Tags:** `3ds` `suitecommerce` `embedded-buttons` `admin` `advanced`

1. **Navigate to:** Commerce > Website > Configuration
2. **Select:** Website and Domain Name
3. **Click:** Configure
4. **Under:** Payment Instrument & Methods (or Advanced tab)
5. **Check:** "Enable 3D Secure Payments"
6. **Save**

### End User Experience

**Tags:** `customer-experience` `authentication` `reference`

- 3DS 2.0 flow is embedded in checkout
- Cardholder may be redirected for identity verification
- Supported for: SuiteCommerce Advanced, Payment Link (Invoice), Payment Request Link, SuiteCommerce My Account

---

## Theme Record Setup

**Tags:** `theme` `customization` `ui` `admin` `payment-link` `payment-request-link` `suitecommerce`

**Purpose:** Customize the appearance and content of external checkout experiences.

### Available for

**Tags:** `theme` `supported-components` `reference`

- Payment Link (Invoice)
- Braintree Payment Request Link
- SuiteCommerce Advanced (SCA) embedded buttons

### Configuration Fields

**Tags:** `theme-config` `admin` `reference`

| Field                               | Usage                                | Tags                                   |
| ----------------------------------- | ------------------------------------ | -------------------------------------- |
| **Company Name/DBA**                | Displayed on checkout page           | `theme` `company-info`                 |
| **Phone Number**                    | Customer service contact             | `theme` `company-info`                 |
| **URL**                             | Business website                     | `theme` `company-info`                 |
| **Terms and Condition**             | Legal terms for checkout             | `theme` `legal`                        |
| **Skip Review for Login User**      | Skip review page for logged-in users | `theme` `ux-optimization`              |
| **Embedded Buttons HTML Container** | Customize button placement           | `theme` `technical` `embedded-buttons` |
| **Customized Height for Buttons**   | Adjust button heights in pixels      | `theme` `technical` `embedded-buttons` |
| **Vault Display Text**              | Customize vault/save checkbox label  | `theme` `vaulting` `customer-ui`       |

### SuiteCommerce Advanced Theme Configuration

**Tags:** `suitecommerce` `theme-config` `admin` `embedded-buttons`

**Location:** Commerce > Website > Configuration > Braintree > General Tab

| Field                                | Description                             | Tags                                      |
| ------------------------------------ | --------------------------------------- | ----------------------------------------- |
| **Default Embedded Payment Methods** | Multi-select payment methods to display | `suitecommerce` `payment-methods` `admin` |
| **Embedded Button Payment Method**   | Select which payment method to use      | `suitecommerce` `payment-methods` `admin` |
| **Display Vault Checkbox**           | Show save payment checkbox + disclaimer | `suitecommerce` `vaulting` `customer-ui`  |
| **Digital Wallet Button Preference** | Color choice for Apple Pay/Google Pay   | `suitecommerce` `theme` `digital-wallet`  |

---

## Fraud Management

**Tags:** `fraud` `admin` `advanced` `security`

### Basic Fraud Management

**Tags:** `fraud` `avs` `cvv` `admin` `core`

**Purpose:** AVS (Address Verification Service) and CVV (Card Verification Value) checks.

#### Setup on Braintree Control Panel

**Tags:** `fraud` `admin` `braintree-setup` `procedure`

1. **Navigate to:** Fraud Management
2. **Configure AVS Rules**
   - Click "Options" on AVS section
   - Set acceptance rules
3. **Configure CVV Rules**
   - Click "Options" on CVV section
   - Set acceptance rules
4. **Click "Save"**

#### Skip AVS/CVV on Payment Processing Profile

**Tags:** `fraud` `avs` `cvv` `profile-config` `admin`

| Field                                            | Purpose                  | Tags                                |
| ------------------------------------------------ | ------------------------ | ----------------------------------- |
| **Skip Basic Fraud For Back Office Transaction** | Back-office transactions | `fraud` `avs` `cvv` `back-office`   |
| **Skip Basic Fraud For Payment Link**            | Invoice Payment Link     | `fraud` `avs` `cvv` `payment-link`  |
| **Skip Basic Fraud For SCA**                     | SuiteCommerce checkout   | `fraud` `avs` `cvv` `suitecommerce` |

**Options:** Always, Never, By Profile

### Fraud Protection Advanced

**Tags:** `fraud` `fraud-protection-advanced` `ai-fraud-detection` `admin` `advanced`

**Purpose:** AI-driven fraud detection and transaction review workflow.

#### Prerequisites

**Tags:** `fraud-protection-advanced` `prerequisites` `admin`

- Additional fees apply
- Must enable on Braintree Control Panel first
- Requires webhook configuration

#### Setup Steps

**Tags:** `fraud-protection-advanced` `admin` `procedure` `step-by-step`

1. **Enable on Braintree Control Panel**

   - Navigate to: Fraud Management
   - Scroll to bottom
   - Enable "Fraud Protection Advanced"

2. **Configure Webhook Notifications**

   - Navigate to: API > Webhooks
   - Select configured webhook > Click Edit
   - Check: "Transaction Reviewed" under Notifications
   - Under Transactions: Select applicable options
   - Click Save

3. **Enable on NetSuite Payment Processing Profile**

   - Navigate to: Payment Processing Profile > Edit
   - Under "[BT] Braintree Config" section
   - Check: "Enable Fraud Protection Advanced"
   - Click Save

4. **Configure Review Filters** (Optional)
   - Login to Braintree Control Panel
   - Navigate to: Fraud Management > Fraud Protection Advanced Dashboard
   - Set custom filters and rules for auto-accept, reject, or review status

#### Processing Behavior

**Tags:** `fraud-protection-advanced` `behavior` `transaction-status` `hold-status`

**Impact:** When Fraud Protection Advanced is enabled:

- Credit card and token transactions are placed on HOLD pending risk decision
- System mirrors Braintree Control Panel transaction status
- Fulfillment cannot proceed until fraud review decision made
- Auto-refund script processes rejected transactions (if refund exists in Braintree)

#### Fraud Protection Advanced Scripts

**Tags:** `fraud-protection-advanced` `scripting` `automation` `refund`

**Script Name:** [BT] Generate Refund for Fraud Review

**Purpose:** Automatically process refunds for transactions rejected on Fraud Protection Advanced dashboard.

**Setup:**

1. Navigate to: Customization > Scripting > Scripts
2. Set Filter Type = Scheduled
3. View: [BT] Generate Refund for Fraud Review Script
4. Click Deployments > Select deployment
5. Set Status = Schedule
6. Choose desired schedule time
7. Click Save

#### Transaction Review Workflow

**Tags:** `fraud-protection-advanced` `workflow` `decision-actions` `reference`

Available actions in Fraud Protection Advanced Dashboard:

- **Approve:** Transaction accepted
- **Reject with refund:** Transaction rejected, refund issued
- **Reject without refund:** Transaction rejected, no refund

---

## Dynamic Descriptors

**Tags:** `descriptors` `bank-statement` `admin` `customization` `card-statement-clarity`

**Purpose:** Clarify charges on customer bank statements with business information.

### Features

**Tags:** `descriptors` `reference`

- Helps customers identify transactions
- Provides bank/card network required information
- Customizable at profile or transaction level

### Supported For

**Tags:** `descriptors` `compatible` `payment-methods`

- Payment Cards
- Payment Card Tokens

### Character Limits

**Tags:** `descriptors` `constraints` `reference`

| Field                | Limit                  | Notes                            | Tags                                       |
| -------------------- | ---------------------- | -------------------------------- | ------------------------------------------ |
| **Company Name/DBA** | 3, 7, or 12 characters | Auto-truncated to nearest limit  | `descriptors` `character-limit`            |
| **Phone Number**     | 10 characters          | No special characters (\*, ., -) | `descriptors` `character-limit` `format`   |
| **URL**              | 13 characters or less  | Processor-dependent              | `descriptors` `character-limit` `optional` |

### Setup on Payment Processing Profile

**Tags:** `descriptors` `admin` `profile-config` `procedure`

**Location:** Braintree > Configuration > Payment Processing Profile > Dynamic Descriptors Section

| Field                                               | Required | Description                                             | Tags                                              |
| --------------------------------------------------- | -------- | ------------------------------------------------------- | ------------------------------------------------- |
| **Company Name/DBA**                                | Yes      | Business name/DBA                                       | `descriptors` `required` `company-info`           |
| **Phone Number**                                    | No       | 10-digit phone number                                   | `descriptors` `optional` `company-info`           |
| **URL**                                             | No       | Business URL (13 chars max)                             | `descriptors` `optional` `company-info`           |
| **Use Custom Descriptors On Transactions**          | Dropdown | Options: "Product Description Only", "All Fields"       | `descriptors` `transaction-level` `customization` |
| **Default Transformation For Quotes**               | Dropdown | Sales Order or Cash Sale                                | `descriptors` `quote-transformation`              |
| **Use Payment Card For Billing Address By Default** | Checkbox | Use card billing address instead of transaction address | `descriptors` `billing-address` `avs`             |

### Transaction-Level Customization

**Tags:** `descriptors` `transaction-level` `customization` `admin` `advanced`

When enabled, users can customize descriptor fields directly on:

- Sales Order
- Cash Sale
- Customer Deposit
- Customer Payment
- Invoice

**Options:**

- **Product Description Only:** Custom product description only; other fields from profile
- **All Fields:** Fully customizable (Name, Phone, URL, Product description)

---

## Account Updater

**Tags:** `account-updater` `token-management` `admin` `advanced` `card-updates`

**Purpose:** Automatically update expired or changed credit card information from card networks.

### How It Works

**Tags:** `account-updater` `process` `workflow` `reference`

1. Braintree receives card updates from networks via Account Updater service
2. Webhook delivers AU Report to NetSuite
3. NetSuite processes updates to payment card tokens
4. Customers notified of updated card information

### Supported Update Types

**Tags:** `account-updater` `update-types` `reference`

| Update Type            | Description             | Token Action                                | Tags                                                    |
| ---------------------- | ----------------------- | ------------------------------------------- | ------------------------------------------------------- |
| **New Expiry Date**    | Card expiration changed | Update expiry; token remains active         | `account-updater` `expiry-date` `token-update`          |
| **New Account Number** | Card replaced           | Existing token marked invalid; memo updated | `account-updater` `account-number` `token-invalidation` |
| **Other Updates**      | Various card changes    | Processing rules applied                    | `account-updater` `other-updates`                       |

### AU Report Access

**Tags:** `account-updater` `reports` `reference`

**Method 1: Email Notification**

- Click link in email from Account Updater process
- Navigates to Account Updater Report record

**Method 2: Manual Navigation**

- Braintree > Account Updater > Account Updater Report List
- View all processed reports

### AU Report Fields

**Tags:** `account-updater` `report-fields` `reference`

| Field                              | Description                                                        | Tags                                         |
| ---------------------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| **Timestamp for Webhook Received** | When webhook arrived                                               | `account-updater` `timestamp` `webhook`      |
| **Status**                         | Waiting to process, Processing, Processed, Success, Error, Ignored | `account-updater` `status`                   |
| **Report Date**                    | When AU report was run                                             | `account-updater` `date`                     |
| **Report URL**                     | URL to download full report                                        | `account-updater` `download`                 |
| **Download File**                  | CSV file of updates                                                | `account-updater` `download` `csv`           |
| **Log File**                       | CSV with Status and Details columns                                | `account-updater` `download` `csv` `logging` |

### Processing Statuses

**Tags:** `account-updater` `statuses` `reference`

- **Waiting to be processed:** Queued to run
- **Processing:** Currently running
- **Processed:** Completed
- **Success:** Count of successfully processed updates
- **Error:** Count of errors
- **Ignored:** Count of ignored updates

### Account Updater Log File

**Tags:** `account-updater` `logging` `csv` `data-format`

CSV file with columns:

- Original AU report data
- **Status column:** Not Processed, Error Occurred, Processed Successfully
- **Details column:** Specific error or success information

### Token Update Examples

**Tags:** `account-updater` `examples` `reference`

**Scenario 1: New Expiry Date**

- Before: Card expires 12/2024
- After: Card expires 12/2026
- Action: Token updated with new date; token remains valid

**Scenario 2: New Account Number**

- Before: Card 4111111111111111
- After: Card 5555555555554444 (issued new card)
- Action: Old token marked invalid; memo appended "Inactivated by Account Updater"; customer must use new token

---

## Reauthorization

**Tags:** `reauthorization` `authorization-expiry` `admin` `advanced` `sales-order` `recurring`

**Purpose:** Renew authorization on Sales Orders when original authorization is expiring.

### Requirements

**Tags:** `reauthorization` `prerequisites` `admin`

- Setup Braintree Config Extension
- Monitor authorization expiry dates
- Enable reauthorization button on specific profiles

### Setup Steps

**Tags:** `reauthorization` `admin` `procedure` `step-by-step`

1. **Create Braintree Config Extension**

   - Navigate to: Braintree > [BT] Braintree Config extension List
   - Click: New [BT] Braintree Config Extension

2. **Configure Fields**

   | Field                                      | Description                                                    | Tags                                        |
   | ------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------- |
   | **Payment Processing Profile Internal ID** | Internal ID from your profile                                  | `reauthorization` `profile` `config`        |
   | **Display ReAuth Button Preference**       | Options: No, Based on days before expiry, Always               | `reauthorization` `ui` `config`             |
   | **Days Prior to expiry for ReAuth button** | If above = "Based on days before expiry", enter days (e.g., 5) | `reauthorization` `days-threshold` `config` |

3. **Save**

### Monitoring Authorizations

**Tags:** `reauthorization` `monitoring` `saved-searches` `reference`

**Saved Searches Available:**

- **Authorization Events List** - All authorizations with status, expiry dates
- **Sales Orders with Latest Authorization Events** - Most recent authorization per order
- **Sales Orders with Expired Authorization** - Orders with expired authorizations
  - Can be used for mass reauthorization

### Authorization Fields on Sales Order

**Tags:** `reauthorization` `sales-order-fields` `reference`

| Field                          | Description                                     | Tags                                  |
| ------------------------------ | ----------------------------------------------- | ------------------------------------- |
| **Authorization Status**       | Current status (Pending, Active, Expired, etc.) | `reauthorization` `status` `field`    |
| **Authorization Amount**       | Amount of authorization                         | `reauthorization` `amount` `field`    |
| **Last Authorization Attempt** | Date/time of last attempt                       | `reauthorization` `timestamp` `field` |
| **Expiry Date**                | When authorization expires                      | `reauthorization` `expiry` `field`    |
| **Days to Expiry**             | Auto-calculated countdown                       | `reauthorization` `expiry` `field`    |

### Update Authorization Status Scheduler

**Tags:** `reauthorization` `scheduler` `scripting` `automation` `admin`

**Script:** [BT] Braintree Mark Expired in Auth Info

**Setup:**

1. Navigate to: Customization > Scripting > Scripts
2. Find: [BT] Braintree Mark Expired in Auth Info
3. Click: View
4. Click: Deploy Script
5. Set Status = Scheduled
6. Select Schedule: Daily Event
7. Set repeat frequency
8. Click Save

### Mass Reauthorization

**Tags:** `reauthorization` `mass-operations` `mapreduce` `automation`

Use "[BT] MR Reauthorization" MapReduce script with "Sales Orders with Expired Authorization" saved search for bulk reauthorization.

---

## Over Capture & Partial Capture

**Tags:** `capture` `overcapture` `partial-capture` `admin` `advanced`

### Over Capture

**Tags:** `overcapture` `definition` `use-case`

**Purpose:** Capture more than originally authorized amount (e.g., additional charges, tips).

### Partial Capture

**Tags:** `partial-capture` `definition` `use-case`

**Purpose:** Capture less than full authorized amount (e.g., partial order fulfillment).

### Prerequisites

**Tags:** `capture` `prerequisites` `admin`

- Contact PayPal to verify merchant qualification
- Enable on Payment Processing Profile

### Setup

**Tags:** `capture` `admin` `procedure` `profile-config`

**Location:** Payment Processing Profile > [BT] Braintree Config Section

| Field                      | Action         | Tags                               |
| -------------------------- | -------------- | ---------------------------------- |
| **Enable Overcapture**     | Check and save | `overcapture` `admin` `enable`     |
| **Enable Partial Capture** | Check and save | `partial-capture` `admin` `enable` |

### Payment Processing Profile Option

**Tags:** `capture` `profile-config` `optimization`

**Enable Capture Authorization Defaulting:**

- Automatically default to "Capture Authorization" as payment operation
- Speeds up fulfillment workflow

---

## Payment Link Configuration

**Tags:** `payment-link` `invoice-payment` `admin` `configuration` `customer-ui`

**Purpose:** Allow customers to pay invoices online via email link.

### Setup Steps

**Tags:** `payment-link` `admin` `procedure` `step-by-step`

1. **Enable Feature**

   - Navigate to: Setup > Company > Enable Features > Transactions > Payment Processing
   - Check: "Payment Link"

2. **Configure Payment Link**
   - Navigate to: Commerce > Payment Link
   - Complete setup form

### Payment Link Form Fields

**Tags:** `payment-link` `configuration` `reference`

| Field                                  | Description                               | Tags                                             |
| -------------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| **Domain Prefix**                      | Unique URL prefix for payment page        | `payment-link` `domain` `configuration`          |
| **Payment Methods**                    | Select methods to display on payment page | `payment-link` `payment-methods` `configuration` |
| **Accept Partial Payments**            | Checkbox for partial payment option       | `payment-link` `partial-payment` `configuration` |
| **Company Logo**                       | Upload company logo (optional)            | `payment-link` `branding` `optional`             |
| **Company Name**                       | Display name on payment page              | `payment-link` `branding` `configuration`        |
| **Company Info**                       | Additional information to display         | `payment-link` `branding` `optional`             |
| **Email Templates - Payment Accepted** | Select confirmation email template        | `payment-link` `email` `configuration`           |
| **Email Templates - Payment Rejected** | Select rejection email template           | `payment-link` `email` `configuration`           |
| **Preview**                            | Test payment page appearance              | `payment-link` `testing` `ui`                    |

### Payment Methods Display Requirements

**Tags:** `payment-link` `payment-methods` `requirements` `reference`

Payment methods will only appear if configured with:

- Card Brand (for cards)
- Payment Visuals
- Display in Website checkbox

### Advanced PDF/HTML Template Setup

**Tags:** `payment-link` `template` `advanced` `customization` `technical`

For custom invoice PDF templates:

1. Navigate to: Customization > Forms > Advanced PDF/HTML Templates
2. Find: Standard Payment Link Invoice PDF/HTML Template
3. Add payment link markup:
   ```
   <a href="${paymentlink}" target="_blank">Pay Invoice Online</a>
   ```

---

## Payment Request Link

**Tags:** `payment-request-link` `prl` `sales-order` `customer-payment` `admin` `configuration`

**Purpose:** Generate secure payment links for Sales Orders and Customer Payments that can be shared with customers.

### Supported Payment Methods

**Tags:** `prl` `payment-methods` `reference`

- Payment Cards
- PayPal (Checkout & BNPL)
- Venmo
- Digital Wallets (Google Pay, Apple Pay)
- Can be vaulted if enabled

### Setup Steps

**Tags:** `prl` `admin` `procedure` `step-by-step`

1. **Create Payment Method for PRL**

   - Navigate to: Braintree > Configuration > Payment Methods > New
   - Set:
     - **Name:** "Braintree Payment Request Link"
     - **Type:** "External Checkout"
     - **Associated Processing Profile:** Select Braintree profile
     - **Requires Line-Level Data:** Check if L2/L3 needed
     - **Inactive:** Unchecked
     - **Display in Website:** Unchecked

2. **Configure on Payment Processing Profile**

   - Navigate to: Payment Processing Profile > Braintree Payment Request Link Configuration
   - Set:
     - **Braintree Payment Request Link Method:** Created method above
     - **Braintree Payment Request Link Expiration (in Days):** Default 3 days

3. **Optional: Disable Specific Methods on PRL**
   - Check: "Disable Payment Card For PRL" to hide card option
   - Check: "Disable PayPal For PRL" to hide PayPal option

### Supported Transaction Types

**Tags:** `prl` `transaction-types` `reference`

- Sales Order (Authorization or Sale)
- Cash Sale
- Customer Deposit
- Customer Payment (Sale operation)
- Invoice (with partial payment option)
- Quote/Estimate (with additional setup)

### Quote/Estimate PRL Setup

**Tags:** `prl` `quote` `estimate` `advanced` `configuration`

Requires additional configuration:

1. On Payment Processing Profile, set:

   - **Default Transformation for Quotes:** Select Sales Order or Cash Sale

2. When Sale operation performed on quote:

   - If Sales Order selected: Creates Sales Order + Customer Deposit
   - If Cash Sale selected: Creates Cash Sale

3. Link expiration: Uses "Braintree Payment Request Link Expiration (in Days)"

### Invoice PRL Setup

**Tags:** `prl` `invoice` `configuration` `simple-setup`

No additional configuration needed beyond initial PRL setup.

**Optional:** For partial payments:

- On Payment Processing Profile, check: "Allow Partial Payments for Invoices"

### PDF/HTML Template Integration

**Tags:** `prl` `template` `customization` `technical`

For Sales Orders:

```html
<#global
braintree_prl=record.custbody_es_bt_payreqlink_link?keep_after('href=\"')?keep_before('\"')>
<a href="${braintree_prl}" target="_blank">Pay Now</a>
```

For Customer Payments:

```html
<#global
braintree_prl=record.custbody_es_bt_payreqlink_link?keep_after('href=\"')?keep_before('\"')>
<a href="${braintree_prl}" target="_blank">Pay Now</a>
```

### PayPal Quantity Limitation

**Tags:** `prl` `paypal` `limitation` `important` `decimal-quantities` `l2l3-data`

**Important:** Whole numbers only. For decimal quantities, uncheck "Requires Line-Level Data" on payment method.

---

## SuiteCommerce Advanced Embedded Buttons

**Tags:** `suitecommerce` `embedded-buttons` `sca` `admin` `configuration`

**Purpose:** Native payment buttons embedded directly in SuiteCommerce checkout without external redirect.

### Supported Payment Methods

**Tags:** `sca` `payment-methods` `reference`

- PayPal (Checkout & Returning Payer)
- Venmo
- Google Pay
- Apple Pay
- PayPal Buy Now Pay Later

### Platforms Supported

**Tags:** `sca` `platforms` `reference`

- Product Detail Page
- Shopping Cart Page
- Checkout Payment Page

### Prerequisites

**Tags:** `sca` `prerequisites` `bundles` `admin`

Must install before configuration:

- Bundle ID: 520497 - SuiteCommerce / 519481 - SuiteCommerce Advanced 2019.2.0+
- Bundle ID: 3801166 - SuiteCommerce Configuration
- Bundle ID: 521562 - SuiteCommerce Extension Management
- Bundle ID: 522267 - SuiteCommerce Base Theme
- Bundle ID: 190323 - SMT Core Content Types (Optional)

### Installation Steps

**Tags:** `sca` `admin` `procedure` `step-by-step` `installation`

1. **Install Braintree Commerce Extension**

   - Navigate to: Braintree > Configuration > Braintree Commerce Extension installation
   - Select version (e.g., version 1.0)
   - Click: Install

2. **Activate from Extension Manager**

   - Navigate to: Commerce > Extension > Extension Manager
   - Click: New Activation
   - Fill:
     - **Select a Website:** Your SuiteCommerce website
     - **Select a Domain:** Your domain
     - **Select Subsidiary:** Optional
     - **Select Location:** Optional
   - Click: Next

3. **Verify Themes and Extensions**
   - Ensure active:
     - **Theme:** SuiteCommerce Base Theme
     - **Extension:** Braintree SuiteCommerce Extension
   - Check: "Update Status" checkbox for latest version
   - Click: Activate

### Create Payment Method for SCA

**Tags:** `sca` `payment-method-setup` `admin`

**Location:** Braintree > Configuration > Payment Methods > New

| Field                              | Value                          | Tags                               |
| ---------------------------------- | ------------------------------ | ---------------------------------- |
| **Name**                           | "Braintree SCA Extension"      | `sca` `payment-method` `naming`    |
| **Type**                           | "External Checkout"            | `sca` `payment-method` `type`      |
| **Requires Line-Level Data**       | Check if needed                | `sca` `l2l3-data` `optional`       |
| **Associated Processing Profiles** | Braintree profile              | `sca` `payment-method` `config`    |
| **Countries**                      | Where payment method available | `sca` `payment-method` `config`    |
| **Display in Website**             | CHECK THIS                     | `sca` `payment-method` `important` |

### SCA Configuration

**Tags:** `sca` `configuration` `admin` `customization`

**Location:** Commerce > Website > Configuration > Configure > Braintree Tab

#### Checkout Subtab

| Field                               | Description                                 | Tags                                 |
| ----------------------------------- | ------------------------------------------- | ------------------------------------ |
| **Embedded Buttons HTML Container** | Optional: CSS selector for custom placement | `sca` `theme` `technical` `optional` |
| **Customized Height for Venmo**     | Optional: Pixel height adjustment           | `sca` `theme` `technical` `optional` |
| **Customized Height for Google**    | Optional: Pixel height adjustment           | `sca` `theme` `technical` `optional` |
| **Terms and Condition**             | Optional: Legal text for customers          | `sca` `theme` `legal` `optional`     |

#### General Subtab

| Field                                | Description                            | Tags                                           |
| ------------------------------------ | -------------------------------------- | ---------------------------------------------- |
| **Skip Review for Login User**       | Skip review page for logged-in users   | `sca` `ux-optimization` `configuration`        |
| **Default Embedded Payment Methods** | Multi-select default methods           | `sca` `payment-methods` `configuration`        |
| **Embedded Button Payment Method**   | Primary payment method for buttons     | `sca` `payment-methods` `configuration`        |
| **Display Vault Checkbox**           | Show save payment checkbox             | `sca` `vaulting` `configuration`               |
| **Digital Wallet Button Preference** | Color (Black on White / White on Dark) | `sca` `theme` `digital-wallet` `configuration` |

#### Shopping Cart Page Subtab

| Field                                | Description                        | Tags                                                |
| ------------------------------------ | ---------------------------------- | --------------------------------------------------- |
| **Show Embedded Buttons**            | Display buttons on cart page       | `sca` `shopping-cart` `configuration`               |
| **Embedded Buttons HTML Container**  | CSS selector for placement         | `sca` `shopping-cart` `technical` `optional`        |
| **Customized Height for Venmo**      | Pixel height (if custom container) | `sca` `shopping-cart` `technical` `optional`        |
| **Show Pay Later Message**           | Display BNPL messaging             | `sca` `shopping-cart` `bnpl` `configuration`        |
| **Pay Later Message HTML Container** | CSS selector for message placement | `sca` `shopping-cart` `bnpl` `technical` `optional` |

#### Product Page Subtab

| Field                                | Description                        | Tags                                               |
| ------------------------------------ | ---------------------------------- | -------------------------------------------------- |
| **Show Embedded Buttons**            | Display buttons on product page    | `sca` `product-page` `configuration`               |
| **Embedded Buttons HTML Container**  | CSS selector for placement         | `sca` `product-page` `technical` `optional`        |
| **Customized Height for Venmo**      | Pixel height (if custom container) | `sca` `product-page` `technical` `optional`        |
| **Show Pay Later Message**           | Display BNPL messaging             | `sca` `product-page` `bnpl` `configuration`        |
| **Pay Later Message HTML Container** | CSS selector for message placement | `sca` `product-page` `bnpl` `technical` `optional` |

### Payment Processing Profile Configuration

**Tags:** `sca` `profile-config` `admin` `alternate-payments`

**Location:** Payment Processing Profile > Allowed Alternate Payments

| Field                          | Action                            | Tags                                            |
| ------------------------------ | --------------------------------- | ----------------------------------------------- |
| **Allowed Alternate Payments** | Select applicable payment methods | `sca` `payment-methods` `admin` `configuration` |

### Apple Pay on SCA

**Tags:** `sca` `apple-pay` `advanced` `configuration`

Additional setup required:

- Follow Apple Pay setup (see Digital Wallet - Apple Pay section)
- Ensure Apple Pay enabled in SCA Extension Settings
- Certificate and domain verification completed

### Vaulting on SCA

**Tags:** `sca` `vaulting` `configuration` `customer-ui`

To enable customers to save payment methods:

1. Ensure "Vault Alternate Payment" checkbox is checked on Payment Processing Profile
2. On SCA Configuration, enable "Display Vault Checkbox"
3. Customers see checkbox and can opt to vault for future use

### Uninstalling Braintree Commerce Extension

**Tags:** `sca` `uninstall` `admin` `procedure`

**Location:** Braintree > Configuration > Braintree Commerce Extension installation

1. Select version
2. Click: Uninstall

**Note:** Only affects SuiteCommerce Advanced; does not impact other implementations.

### Quantity Limitations

**Tags:** `sca` `paypal` `limitation` `decimal-quantities` `important`

**PayPal transactions:** Whole numbers only. For decimals, uncheck "Requires Line-Level Data" on payment method.

---

## External Ecommerce Integration

**Tags:** `external-ecommerce` `external-platform` `integration` `admin` `configuration` `api-connector`

**Purpose:** Integrate Braintree payments from third-party ecommerce platforms (Shopify, BigCommerce, Magento, etc.) with NetSuite.

### Overview

**Tags:** `external-ecommerce` `reference` `overview`

When using an external ecommerce platform, transactions are processed on that platform using Braintree's payment gateway. NetSuite receives transaction data through integration connectors.

**Key Differences from SuiteCommerce:**

- Payment processing happens on external platform (not NetSuite)
- Requires API connector or middleware for data sync
- Uses "Record External Event" handling mode in NetSuite
- Token retrieval requires additional setup

### Integration Architecture

**Tags:** `external-ecommerce` `architecture` `reference`

```
Customer → External Platform → Braintree Gateway → External Platform
                                       ↓
                                  Token Storage
                                       ↓
                    API Connector / Middleware
                                       ↓
                    NetSuite (Record External Event)
```

### Prerequisites

**Tags:** `external-ecommerce` `prerequisites` `admin`

- External ecommerce platform configured with Braintree
- Same Braintree merchant account used for both platforms
- API connector or middleware solution (Celigo, Jitterbit, custom, etc.)
- Braintree credentials accessible from both systems

### Required Payment Methods Setup

**Tags:** `external-ecommerce` `payment-method-setup` `admin` `procedure`

1. **Create External Platform Payment Method**

   - Navigate to: Braintree > Configuration > Payment Methods > New
   - Set:
     - **Name:** Your platform name (e.g., "Shopify", "BigCommerce", "Magento")
     - **Type:** "External Checkout"
     - **Associated Processing Profiles:** Select Braintree profile
     - **Account:** GL account to debit
     - **Countries:** Where platform processes payments
   - Save

2. **Verify Payment Processing Profile**
   - Navigate to: Braintree > Configuration > Payment Processing Profile
   - Ensure external platform payment method appears in supported methods
   - Verify same Braintree credentials as external platform

### Order Sync Workflow (When Needed)

**Tags:** `external-ecommerce` `order-sync` `record-external-event` `integration` `workflow`

**When to Use:** Customer purchases on external platform, order needs to appear in NetSuite for fulfillment/accounting.

#### Scenario 1: Payment Only (No Order Sync)

**Tags:** `external-ecommerce` `payment-only` `simple`

Payment processed and settled on external platform. NetSuite only tracks payment for accounting.

**Setup:** Minimal - just payment method configuration needed.

#### Scenario 2: Full Order Sync

**Tags:** `external-ecommerce` `order-sync` `record-external-event` `api-connector` `complex`

External orders synced to NetSuite as Sales Orders with payment details.

**Setup Steps:**

1. **Configure API Connector**

   - Set up integration platform (Celigo, Jitterbit, custom API)
   - Map external order fields to NetSuite Sales Order fields
   - **Critical Fields to Map:**
     - PN Ref (Braintree Transaction ID)
     - Authorization Code
     - Payment Amount
     - Payment Method
     - Customer Information
     - Line Items
     - Tax & Shipping

2. **Record External Event Configuration**

   - On Sales Order form in NetSuite:
     - **Payment Option:** Select external platform payment method
     - **Handling Mode:** "Record External Event"
     - **PN Ref:** Braintree transaction ID from external platform
     - **Authorization Code:** Auth code from Braintree
     - **Payment Operation:** "Authorization" or "Sale" (depending on external platform)
   - System creates Payment Event record (marked as "Recorded" not "Processed")

3. **Field Mapping Requirements**

| External Platform Field  | NetSuite Field   | Critical?   | Notes                           |
| ------------------------ | ---------------- | ----------- | ------------------------------- |
| Braintree Transaction ID | PN Ref           | **YES**     | Must match exactly              |
| Authorization Code       | Auth Code        | **YES**     | Required for auth operations    |
| Payment Amount           | Amount           | **YES**     | Must match transaction          |
| Customer Email           | Customer Email   | Recommended | For matching/creating customers |
| Order Number             | External Order # | Recommended | For tracking                    |
| Payment Method Type      | Payment Method   | **YES**     | Must match configured method    |
| Transaction Status       | Payment Status   | **YES**     | Authorized/Captured/Settled     |

### Common Integration Patterns

**Tags:** `external-ecommerce` `integration` `patterns` `reference`

#### Pattern 1: Real-Time Order Sync

**Tags:** `real-time` `webhook` `integration`

- External platform sends webhook on order completion
- Middleware receives webhook, creates NetSuite Sales Order immediately
- Payment Event recorded with "Record External Event"
- **Pros:** Immediate visibility in NetSuite
- **Cons:** More complex setup, requires webhook handling

#### Pattern 2: Batch Order Sync

**Tags:** `batch` `scheduled` `integration`

- Scheduled job pulls orders from external platform API
- Creates/updates NetSuite Sales Orders in batch
- Payment Events recorded for each order
- **Pros:** Simpler setup, more forgiving of errors
- **Cons:** Delay in NetSuite visibility (typically 15-60 minutes)

#### Pattern 3: Payment-Only Sync

**Tags:** `payment-only` `simple` `integration`

- Orders stay on external platform for fulfillment
- Only payment transactions synced to NetSuite
- Creates Customer Payment records directly
- **Pros:** Minimal integration complexity
- **Cons:** No order details in NetSuite

### Token Retrieval for External Transactions

**Tags:** `external-ecommerce` `token-retrieval` `vaulting` `advanced`

See **External Token Retrieval** section below for detailed steps on retrieving vaulted tokens from external platform transactions.

### Troubleshooting External Integrations

**Tags:** `external-ecommerce` `troubleshooting` `errors`

| Issue                                            | Cause                                                      | Resolution                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **PN Ref not found**                             | Transaction ID incorrect or not synced                     | Verify transaction exists in Braintree Control Panel; check ID format                  |
| **Payment method not found**                     | External platform method not configured in NetSuite        | Create external platform payment method first                                          |
| **Amount mismatch**                              | Currency conversion or calculation error                   | Verify amounts match exactly including currency; check for rounding                    |
| **Duplicate orders**                             | Integration ran multiple times                             | Implement deduplication logic using external order ID                                  |
| **Authorization expired**                        | Too much time between external auth and NetSuite recording | Record within 7 days of authorization; use token retrieval for older auths             |
| **Customer not found**                           | Customer matching logic failed                             | Verify customer email or external ID mapping; create customer first                    |
| **Payment Event shows "Recorded" not "Settled"** | Normal behavior                                            | External Event creates recorded status; actual settlement tracked in external platform |

### Testing External Integration

**Tags:** `external-ecommerce` `testing` `procedure`

1. **Sandbox Testing**

   - Use Braintree Sandbox credentials on both platforms
   - Process test transaction on external platform
   - Verify transaction appears in Braintree Control Panel
   - Trigger integration sync
   - Verify Sales Order created in NetSuite with correct PN Ref
   - Check Payment Event record shows "Recorded" status

2. **Production Cutover**
   - Switch external platform to Production Braintree credentials
   - Switch NetSuite to Production Payment Processing Profile
   - Process test transaction with real card (then refund)
   - Verify full flow before enabling for customers

### Platform-Specific Considerations

**Tags:** `external-ecommerce` `platform-specific` `reference`

#### Shopify

**Tags:** `shopify` `external-ecommerce`

- Shopify Payments vs. Braintree: Ensure using Braintree (not Shopify Payments)
- Transaction ID format: `braintree_<transaction_id>`
- Webhook: Order creation webhook triggers sync

#### BigCommerce

**Tags:** `bigcommerce` `external-ecommerce`

- Braintree transaction ID available in order payment details
- API: Use BigCommerce Orders API v2 or v3
- Webhook: Store/order/statusUpdated

#### Magento / Adobe Commerce

**Tags:** `magento` `external-ecommerce`

- Braintree module: Official Braintree_Payments extension
- Transaction ID: Available in order payment additional_information
- Real-time sync preferred due to inventory management

#### WooCommerce

**Tags:** `woocommerce` `external-ecommerce`

- Plugin: WooCommerce Braintree Payment Gateway
- Transaction metadata: Stored in post_meta table
- Webhook: woocommerce_order_status_changed

---

## External Token Retrieval

**Tags:** `token-retrieval` `tokenization` `external-platform` `admin` `advanced` `integration`

**Purpose:** Retrieve payment tokens created outside NetSuite (e.g., on third-party e-commerce platforms) and import them into NetSuite.

### Use Cases

**Tags:** `token-retrieval` `use-cases` `reference`

- Customer paid on BigCommerce/Shopify with tokenization
- Want to reprocess or perform additional operations in NetSuite
- Retrieve vaulted token for future transactions

### Prerequisites

**Tags:** `token-retrieval` `prerequisites` `admin`

- Tokenization feature enabled
- Payment Method for Payment Card Tokens created
- Payment Method for General Tokens created
- Payment Method for external platform created
- External transaction authorized/captured on third-party platform

### Setup Steps

**Tags:** `token-retrieval` `admin` `procedure` `step-by-step`

1. **Create External Platform Payment Method**

   - Navigate to: Braintree > Configuration > Payment Methods > New
   - Set:
     - **Name:** External platform name (e.g., "BigCommerce", "Shopify")
     - **Type:** "External Checkout"
     - **Associated Processing Profiles:** Braintree profile
     - **Account:** GL account to debit

2. **Enable Token Retrieval on Sales Order**

   - Sales Order > Click checkbox: "Retrieve Vaulted Token"
   - Apply to transaction with "Authorization" or "Sale" operation

3. **Record External Event**
   - Use "Record External Event" feature to retrieve token
   - Provide Braintree transaction ID
   - Confirms vaulted token exists in Braintree
   - Creates Payment Card Token or General Token record in NetSuite

### Token Retrieval Process

**Tags:** `token-retrieval` `workflow` `process` `reference`

1. **External Authorization/Capture** on third-party platform
2. **Token Vaulted** in Braintree
3. **Create Sales Order** in NetSuite for same order
4. **Record External Event** with transaction ID
5. **Token Retrieved** and stored in NetSuite
6. **Future Operations:** Reauthorization, Capture, Refund possible in NetSuite

### Mapping Information

**Tags:** `token-retrieval` `mapping` `integration` `reference`

Mapping requirements for importing tokens from external platforms:

- See Appendix section: "Mapping Information for importing Payment Card Token"
- See Appendix section: "Mapping Information for importing General Token"

---

## Payment Processing and Statuses

**Tags:** `payment-operations` `statuses` `workflow` `reference`

### Payment Status Lifecycle

**Tags:** `payment-status` `lifecycle` `reference`

| Status       | Description                           | Next Status                 | Tags                                                |
| ------------ | ------------------------------------- | --------------------------- | --------------------------------------------------- |
| **Pending**  | Awaiting authorization/capture        | Active, Declined, Failed    | `status` `payment-lifecycle`                        |
| **Active**   | Successfully authorized               | Captured, Voided, Expired   | `status` `payment-lifecycle` `authorization`        |
| **Captured** | Successfully captured/charged         | Settled, Declined, Refunded | `status` `payment-lifecycle` `capture`              |
| **Settled**  | Funds deposited in merchant account   | Refunded, Disputed          | `status` `payment-lifecycle` `settlement`           |
| **Voided**   | Authorization canceled before capture | Terminal                    | `status` `payment-lifecycle` `void`                 |
| **Declined** | Processor rejected transaction        | Terminal (attempt new)      | `status` `payment-lifecycle` `decline`              |
| **Failed**   | System error or invalid data          | Terminal (attempt new)      | `status` `payment-lifecycle` `failure`              |
| **Refunded** | Customer refund issued                | Terminal                    | `status` `payment-lifecycle` `refund`               |
| **Disputed** | Customer dispute/chargeback           | Terminal                    | `status` `payment-lifecycle` `dispute` `chargeback` |

### Payment Events

**Tags:** `payment-events` `tracking` `reference`

**Payment Event:** Record of each transaction attempt in NetSuite

**Available Fields:**

- Transaction ID
- Event Type (Authorization, Capture, Sale, etc.)
- Status
- Amount
- Timestamp
- Payment Method
- Braintree Reference ID

### Gateway Request Types

**Tags:** `gateway-requests` `payment-operations` `reference`

Supported payment operations:

- **Authorization:** Hold funds without capture
- **Capture Authorization:** Capture previously authorized amount
- **Sale:** Authorization + Capture in one operation
- **Void Authorization:** Cancel pending authorization
- **Credit:** Refund without original transaction reference
- **Refund:** Refund with original transaction reference

---

## L2/L3 Data Processing

**Tags:** `l2l3-data` `level-2-data` `level-3-data` `advanced` `fraud-reduction`

**Purpose:** Enhanced transaction data for fraud reduction and reporting.

### L2 Data (Level 2)

**Tags:** `l2l3-data` `level-2` `reference`

- Customer information (name, email, address)
- Order totals (subtotal, tax, shipping, discount)
- Invoice/PO number

### L3 Data (Level 3)

**Tags:** `l2l3-data` `level-3` `reference`

- Line item details
- Product codes
- Quantities
- Unit prices
- Tax amounts per line item

### Enable on Payment Method

**Tags:** `l2l3-data` `admin` `payment-method-setup`

Check "Requires Line-Level Data" on payment method form to enable L2/L3.

**Important:** Disable for transactions with decimal quantities (PayPal limitation).

---

## Payment Initiator

**Tags:** `payment-initiator` `moto` `recurring` `unscheduled` `reference`

**Purpose:** Identify whether payment is merchant-initiated or customer-initiated.

### Types Sent to Braintree

**Tags:** `payment-initiator` `types` `reference`

| Type               | Description                | Context                                                     | Tags                                           |
| ------------------ | -------------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| **MOTO**           | Mail Order/Telephone Order | Back-office customer-initiated transactions                 | `payment-initiator` `moto` `back-office`       |
| **RECURRING**      | Recurring payment          | Merchant-initiated subscriptions with fixed amount/schedule | `payment-initiator` `recurring` `subscription` |
| **UNSCHEDULED**    | Unscheduled payment        | Merchant-initiated non-recurring (e.g., balance top-up)     | `payment-initiator` `unscheduled`              |
| **(No Initiator)** | E-commerce                 | Customer-initiated web transactions                         | `payment-initiator` `ecommerce` `web`          |

---

## ACH Additional Information

**Tags:** `ach` `settlement` `additional-info` `advanced` `reference`

### How ACH Transactions Work

**Tags:** `ach` `workflow` `process` `reference`

1. **Customer Authorization:** Customer provides bank account details
2. **Transaction Processing:** Merchant submits transaction to Braintree
3. **Settlement Status:**
   - Initially: "Processing"
   - Webhook notifications: Settlement Settled or Settlement Declined
   - Real-time status (if enabled) placed in Pending until notification

### Settlement Declined Handling

**Tags:** `ach` `settlement-declined` `error-handling` `refund` `automatic`

When ACH transaction receives "Settlement Declined" webhook:

- If previously marked "Accepted" in NetSuite
- Automatic refund transaction created
- GL impact corrected (debit reversed)
- Ensures GL accuracy between systems

### Real-Time ACH Status

**Tags:** `ach` `real-time-status` `webhook` `admin` `advanced`

**Enable:** Payment Processing Profile > Check "Enable Real time ACH status"

**Behavior:**

- Transactions remain in Pending status until settlement confirmed
- Prevents premature order fulfillment
- Webhook notifications required: Settlement Settled, Settlement Declined

**Limitations:**

- NOT supported for native NetSuite Invoice Payment Link
- Transactions processed without waiting for settlement in that context

---

## Appendix

**Tags:** `appendix` `reference` `technical-details`

### Custom Fields in NetSuite

**Tags:** `custom-fields` `netsuite` `reference` `technical`

Braintree adds custom fields to NetSuite transactions for payment tracking:

| Field Name                         | Description                    | Tags                                        |
| ---------------------------------- | ------------------------------ | ------------------------------------------- |
| **custbody_es_bt_payreqlink_link** | Payment Request Link URL       | `custom-field` `prl` `url`                  |
| **custbody_es_bt_pn_ref**          | Legacy ID of transaction       | `custom-field` `legacy` `transaction-id`    |
| **custbody_es_bt_retrieve_token**  | Flag to retrieve vaulted token | `custom-field` `token-retrieval` `vaulting` |
| **custbody_es_bt_auth_info**       | Authorization event details    | `custom-field` `authorization` `events`     |

### Bundle Components

**Tags:** `bundle` `components` `reference` `technical`

Braintree SuiteApp includes:

- Payment processing plug-in
- Customization records (custom fields, forms, scripts)
- Workflow bundles (chargeback handling)
- Commerce extension (SCA integration)
- Theme records
- Payment method definitions

### Supported Currencies

**Tags:** `currency` `multi-currency` `reference` `technical`

Transactions supported in any currency where you have Merchant Account ID setup in Braintree.

### Braintree Support

**Tags:** `support` `contact` `reference`

- **Support Portal:** https://www.braintreepayments.com/get-help
- **Refund Questions:** Braintree Help
- **Verify Identity:** May be required for account changes

### SCA Extension Versions

**Tags:** `sca` `versions` `release-notes` `reference`

- **1.0.0:** Initial release
- **1.0.1+:** Apple Pay support added
- **1.1.0+:** Product page & shopping cart embedded buttons

### NetSuite 2025.1 Updates

**Tags:** `netsuite-2025-1` `updates` `external-roles` `admin`

- External role access must be manually enabled
- See: "Enabling External Role Access for PayPal Braintree Scripts"

---

## Quick Reference: Configuration Checklist

**Tags:** `checklist` `quick-reference` `admin` `complete-setup`

### Pre-Implementation

- [ ] Braintree sandbox account created
- [ ] Braintree credentials gathered
- [ ] PayPal developer account created
- [ ] PayPal-Braintree connection configured

### NetSuite Setup

- [ ] Payment Processing feature enabled
- [ ] Accounting Preferences configured
- [ ] Chargeback Workflow Bundle installed
- [ ] Braintree SuiteApp installed
- [ ] Payment plug-in activated
- [ ] Bank account selected for settlement

### Payment Processing Profile

- [ ] Name and subsidiary defined
- [ ] Braintree credentials entered
- [ ] Payment methods selected
- [ ] Webhooks configured
- [ ] Fraud settings configured
- [ ] Descriptors configured
- [ ] Tokenization enabled (if needed)

### Payment Methods

- [ ] Credit card methods created
- [ ] ACH method created (if applicable)
- [ ] PayPal method created (if applicable)
- [ ] Digital wallet methods created (if applicable)
- [ ] Venmo method created (if applicable)
- [ ] Token methods created (if applicable)

### Advanced Features (As Needed)

- [ ] 3DS 2.0 enabled
- [ ] Fraud Protection Advanced configured
- [ ] Reauthorization enabled
- [ ] Over/Partial Capture enabled
- [ ] Account Updater enabled
- [ ] Theme Record created
- [ ] SCA Extension installed (if using SCA)
- [ ] Payment Link configured
- [ ] Payment Request Link configured

### Testing

- [ ] Test authorization transaction
- [ ] Test capture transaction
- [ ] Test refund transaction
- [ ] Test each payment method
- [ ] Test fraud decline scenario
- [ ] Verify GL postings
- [ ] Test Payment Link email
- [ ] Verify webhook notifications

---

## Tag Index

**Tags:** `tag-index` `reference` `search-guide`

### By Payment Method

- `credit-card` - Credit/debit card configuration and processing
- `ach` - Automated Clearing House transactions
- `paypal` - PayPal checkout and integration
- `bnpl` - PayPal Buy Now Pay Later
- `venmo` - Venmo payment processing
- `google-pay` - Google Pay digital wallet
- `apple-pay` - Apple Pay digital wallet
- `digital-wallet` - General digital wallet setup

### By Component

- `back-office` - NetSuite back-office processing
- `suitecommerce` - SuiteCommerce / My Account
- `sca` - SuiteCommerce Advanced embedded buttons
- `payment-link` - Invoice payment links
- `payment-request-link` - Sales order payment request links
- `prl` - Payment Request Link (alias)
- `external-checkout` - External checkout flows

### By Feature

- `tokenization` - Payment method tokenization
- `vaulting` - Storing payment methods for reuse
- `fraud` - Fraud detection and prevention
- `3ds` - 3D Secure 2.0 authentication
- `reauthorization` - Authorization renewal
- `capture` - Payment capture operations
- `overcapture` - Capture above authorized amount
- `partial-capture` - Capture below authorized amount
- `descriptors` - Bank statement descriptors
- `account-updater` - Automatic card update service
- `webhook` - Real-time notifications
- `theme` - UI customization

### By Access Level

- `admin` - Administrator configuration
- `user` - End-user operations
- `customer-ui` - Customer-facing interface
- `backend-config` - Backend system configuration

### By Configuration Complexity

- `core` - Essential baseline setup
- `advanced` - Advanced optional features
- `prerequisites` - Required before other setup
- `optional` - Optional configuration

### By Workflow Type

- `ecommerce` - E-commerce transactions
- `moto` - Mail order/telephone order
- `recurring` - Recurring/subscription payments
- `authorization` - Authorization only
- `sale` - Immediate payment
- `refund` - Refund operations
- `workflow` - Business process flows

### By Transaction Type

- `sales-order` - Sales order transactions
- `cash-sale` - Cash sale transactions
- `invoice` - Invoice payment
- `customer-payment` - Customer payment
- `customer-deposit` - Customer deposit
- `quote` - Quote/estimate

### Cross-Cutting Tags

- `reference` - Reference material
- `procedure` - Step-by-step procedures
- `step-by-step` - Detailed setup instructions
- `configuration` - Configuration options
- `technical` - Technical implementation details
- `limitation` - Important limitations
- `important` - Critical information
- `integration` - Integration requirements
- `all-payment-methods` - Applies to all payment methods
- `all-components` - Applies to all components

---

**Document Version:** V.43  
**Last Updated:** November 28, 2025  
**Plugin Release:** 2025.1.3.52

This reference guide with comprehensive tag support is designed to enable intelligent filtering and selective content delivery for integration engineers implementing Braintree Payments for NetSuite. For detailed end-user instructions and transaction processing workflows, refer to the complete user guide sections not included in this technical reference.
