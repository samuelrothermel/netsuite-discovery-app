module.exports = {
  sections: [
    // PART 1: DISCOVERY
    {
      title: 'Part 1: Pre-Integration Discovery',
      description: 'Business Model & Volume Assessment',
      items: [
        { text: 'Confirm business model: B2C, B2B, B2B2C, or hybrid' },
        {
          text: 'Estimated monthly transaction volume: __________ transactions',
        },
        { text: 'Average transaction value: $__________ USD' },
        {
          text: 'Peak processing times identified (e.g., daily, seasonal spikes): __________',
        },
        {
          text: 'Geographic markets served: Which countries/regions will you process from? __________',
        },
        { text: 'Current payment processor: __________' },
        {
          text: 'Processing duration: Average time between authorization and capture: __________ hours/days',
        },
        {
          text: 'Current customer bases to migrate: Card holders? PayPal agreements? Other methods?',
        },
        { text: 'Historical chargeback/fraud rates: ___________%' },
        {
          text: 'Existing tokenization/vaulting with previous processor: Yes / No',
        },
      ],
    },

    // PART 2A: AUTH & CAPTURE
    {
      title: 'Part 2A: Authorization & Capture Strategy',
      description:
        'Key Decision: How long is the typical gap between order authorization and fulfillment?',
      items: [
        {
          text: 'Same-day capture (e-commerce typical): Authorization and capture happen immediately or same business day',
          visibleIf: data => data.processingTimeline === 'same-day',
          reference:
            'Admin Guide, Section 3.2 "Credit Card Processing" (p. 151) – Sale operation',
          link: 'https://developer.paypal.com/braintree/docs/guides/credit-cards/overview',
        },
        {
          text: 'Multi-day capture (MOTO, B2B typical): Authorization on Day 1, capture on Day 3–7',
          visibleIf: data => data.processingTimeline === 'multi-day',
          reference:
            'Admin Guide, Section 3.2 "Credit Card Processing" (p. 151) – Authorization/Capture workflow',
        },
        {
          text: 'Implication: Vault/tokenize payment methods to avoid re-entering card data',
          visibleIf: data => data.processingTimeline === 'multi-day',
        },
        {
          text: 'Reauthorization setup required for expired auths (>7 days)',
          visibleIf: data =>
            data.processingTimeline === 'multi-day' && data.needsReauth,
          reference:
            'Admin Guide, Section 2.18 "Setup for Reauthorization" (p. 111)',
          link: 'https://developer.paypal.com/braintree/docs/guides/authorization/overview',
        },
        {
          text: 'Tokenization/vaulting needed for extended auth-to-capture gap',
          visibleIf: data => data.processingTimeline === 'multi-day',
        },
      ],
    },

    // PART 2B: PARTIAL & OVER-CAPTURE
    {
      title: 'Part 2B: Partial & Over-Capture',
      description:
        'Key Decision: Do you need to adjust capture amounts after authorization?',
      visibleIf: data => data.partialCapture || data.overCapture,
      items: [
        {
          text: 'Partial Capture (e.g., split shipments, drop-shipping scenarios)',
          visibleIf: data => data.partialCapture,
        },
        {
          text: 'Allows capturing LESS than authorized amount on multiple transactions',
          visibleIf: data => data.partialCapture,
          reference:
            'Admin Guide, Section 2.19 "Setup for Over Capture Partial Capture" (p. 116)',
        },
        {
          text: 'Use Case: Item Fulfillment → Bill → Capture Authorization',
          visibleIf: data => data.partialCapture,
          reference: 'Section 3.2 (p. 154)',
        },
        {
          text: 'Setup Required: Contact PayPal team for merchant eligibility',
          visibleIf: data => data.partialCapture,
          link: 'https://developer.paypal.com/braintree/docs/guides/credit-cards/overview#partial-settlements',
        },
        {
          text: 'Over-Capture (e.g., added shipping, taxes, processing fees discovered post-authorization)',
          visibleIf: data => data.overCapture,
        },
        {
          text: 'Allows capturing MORE than original authorization amount',
          visibleIf: data => data.overCapture,
          reference: 'Admin Guide, Section 2.19 (p. 116)',
        },
        {
          text: 'Use Case examples: Discount items, additional items, shipping charges added',
          visibleIf: data => data.overCapture,
          reference: 'Section 3.2 (p. 155)',
        },
        {
          text: 'Setup Required: Must be enabled by PayPal team (PSD2/regulatory compliance)',
          visibleIf: data => data.overCapture,
        },
        {
          text: 'Limitation: PayPal General Tokens capped at 115% of original auth',
          visibleIf: data => data.overCapture,
          link: 'https://developer.paypal.com/braintree/docs/guides/credit-cards/overview#overcapture',
        },
      ],
    },

    // PART 2C: L2/L3
    {
      title: 'Part 2C: Level 2/3 Data Processing',
      description:
        'Key Decision: Do you sell to businesses (B2B) or need to reduce interchange rates?',
      visibleIf: data =>
        data.l2l3Processing === 'yes' || data.l2l3Processing === 'partial',
      items: [
        {
          text: 'L2/L3 Processing captures purchase order numbers, tax amounts, shipping, line items',
        },
        {
          text: 'Can reduce interchange rates by 0.25%–1.5% on qualified transactions',
        },
        {
          text: 'L2/L3 Processing enabled on payment methods',
        },
        {
          text: 'All Payment Methods must have "Requires Line-Level Data" checkbox enabled',
          reference: 'Admin Guide, Section 5.8 "L2L3 Data processing" (p. 312)',
          link: 'https://developer.paypal.com/braintree/docs/reference/general/level-2-and-3-processing/required-fields/php/',
        },
        { text: 'Order/PO Number data available for all transactions' },
        {
          text: 'Line-item details (description, quantity, unit price) available',
        },
        { text: 'Tax amount data available' },
        { text: 'Shipping amount data available' },
        {
          text: 'Discount amounts data available (if applicable)',
          reference: 'Admin Guide, Section 5.8 (p. 312)',
        },
      ],
    },

    // PART 2D: ACH
    {
      title: 'Part 2D: ACH (Bank Transfer) Processing',
      description: 'Key Decision: Do you accept direct bank payments?',
      visibleIf: data => data.acceptACH === 'yes',
      items: [
        {
          text: 'ACH Processing Overview',
          reference:
            'Admin Guide, Section 2.7 "Setup Automated Clearing House ACH Payment Processing" (p. 43)',
          link: 'https://developer.paypal.com/braintree/docs/guides/ach/overview',
        },
        {
          text: 'Additional ACH Information',
          reference:
            'Section 5.19 "Additional Information on ACH Processing" (p. 334)',
        },
        { text: 'ACH Payment Method created and configured' },
        { text: 'ACH processing enabled on Payment Processing Profile' },
        {
          text: 'Network Check configured (verify account ownership upfront)',
          visibleIf: data => data.achNetworkCheck,
          reference: 'Admin Guide, Section 5.19 (p. 334)',
        },
        {
          text: 'Recurring ACH configured for subscription/recurring billing',
          visibleIf: data => data.achRecurring,
        },
        {
          text: 'Real-time ACH status webhooks configured',
          visibleIf: data => data.achRealtimeStatus,
          reference:
            'Admin Guide, Section 2.3, "Enable Real time ACH status" checkbox (p. 23)',
        },
        {
          text: 'ACH settlement timeline communicated to merchant (typically 1–2 business days vs. card next business day)',
        },
        {
          text: 'ACH routing numbers tested in sandbox',
          link: 'https://developer.paypal.com/braintree/docs/guides/ach/testing-go-live#routing-numbers',
        },
      ],
    },

    // PART 3: TOKENIZATION
    {
      title: 'Part 3: Tokenization & Vaulting Strategy',
      description: 'Key Decision: How will you handle payment method reuse?',
      items: [
        {
          text: 'Tokenization Overview',
          reference:
            'Admin Guide, Section 2.14 "Setup Tokenization" (p. 97) and Section 5.10 "Tokenization" (p. 319)',
        },
        {
          text: 'Enable Payment Card Tokenization - Securely stores card details in Braintree vault after first transaction',
          link: 'https://developer.paypal.com/braintree/docs/guides/payment-card-processing/vaulting',
        },
        { text: "Customers don't re-enter card info for future purchases" },
        {
          text: 'Setup: Check "Replace Payment Card by Token" on Payment Processing Profile',
          reference: 'Section 2.3 (p. 22)',
        },
        {
          text: 'Payment Card Token payment method created',
          reference:
            'End User: Section 3.5 "Payment Card Tokenization" (p. 238)',
        },
        {
          text: 'Token Retrieval method created (if external e-commerce)',
          reference:
            'Admin Guide, Section 2.15 "Setup Token Retrieval" (p. 99)',
        },
        {
          text: 'Use Case: Customer pays on Shopify/BigCommerce, NetSuite pulls token for later MOTO processing',
        },
        {
          text: 'Enable PayPal/Alternate Payment Vaulting - Store PayPal, Venmo, digital wallet tokens for repeat customers',
          visibleIf: data =>
            data.paymentMethods &&
            (data.paymentMethods.includes('paypal') ||
              data.paymentMethods.includes('venmo') ||
              data.paymentMethods.includes('apple-pay') ||
              data.paymentMethods.includes('google-pay')),
          reference:
            'Admin Guide, Section 2.25 "Vaulting of Alternate Payment method" (p. 130)',
        },
        {
          text: 'General Token payment method created',
        },
        {
          text: 'Decide if customer sees "Save for Later" checkbox or merchant vaults automatically',
          visibleIf: data =>
            data.paymentMethods &&
            (data.paymentMethods.includes('paypal') ||
              data.paymentMethods.includes('venmo')),
        },
      ],
    },

    // PART 4: FRAUD
    {
      title: 'Part 4: Fraud Management & Security',
      description: 'Fraud Protection Assessment',
      items: [
        {
          text: 'Basic Fraud Management (AVS/CVV checks only)',
          reference:
            'Admin Guide, Section 2.16 "Setup Basic Fraud Management" (p. 103)',
          link: 'https://developer.paypal.com/braintree/docs/guides/fraud-tools/overview',
        },
        {
          text: 'AVS: Address Verification System – checks billing address',
        },
        {
          text: 'CVV: Card security code verification',
        },
        {
          text: 'Fraud Protection Advanced (Machine learning risk scoring) - Recommended if chargeback rate >0.5% or high-risk vertical',
          visibleIf: data =>
            data.fraudProtectionAdvanced === 'yes' ||
            data.fraudProtectionAdvanced === 'unsure',
          reference:
            'Admin Guide, Section 2.17 "Setup Fraud Protection Advanced" (p. 105)',
          link: 'https://developer.paypal.com/braintree/docs/guides/fraud-tools/advanced-fraud-tools',
        },
        {
          text: 'Provides risk scores and auto-decline thresholds (additional fees apply)',
          visibleIf: data =>
            data.fraudProtectionAdvanced === 'yes' ||
            data.fraudProtectionAdvanced === 'unsure',
        },
        {
          text: 'Dashboard review required for flagged transactions',
          visibleIf: data =>
            data.fraudProtectionAdvanced === 'yes' ||
            data.fraudProtectionAdvanced === 'unsure',
          reference: 'Section 2.17 (p. 109)',
        },
        {
          text: '3D Secure 2.0 (SCA/Strong Customer Authentication) - For EU/UK transactions or high-value card-not-present sales',
          visibleIf: data => data.needs3ds === 'yes',
          reference: 'Admin Guide, Section 2.6 "3D Secure 2.0" (p. 39)',
          link: 'https://developer.paypal.com/braintree/docs/guides/3d-secure-2/overview',
        },
        {
          text: 'Requires additional setup in Braintree Control Panel + NetSuite',
          visibleIf: data => data.needs3ds === 'yes',
        },
        {
          text: 'AVS/CVV rules configured appropriately',
        },
        {
          text: 'Manual override capability configured for business exceptions',
          reference:
            'Section 2.3, "Skip Basic Fraud for Back Office Transaction" dropdown (p. 23)',
        },
        {
          text: 'End User: Skip CVV/AVS checks when needed',
          reference: 'Section 3.10 "Skip AVSCVV Checks" (p. 262)',
        },
      ],
    },

    // PART 5: PROCESSING CHANNELS
    {
      title: 'Part 5: Processing Location & Channel Strategy',
      description: 'Where will payments be authorized and captured?',
      items: [
        {
          text: 'eCommerce/SuiteCommerce Advanced configured - Auto-capture on checkout (Sale operation) typical',
          visibleIf: data =>
            data.processingChannels &&
            data.processingChannels.includes('ecommerce'),
          reference:
            'Admin Guide, Section 2.9 "Setup Alternate Payment Method for Embedded Buttons SuiteCommerce Advanced" (p. 47)',
        },
        {
          text: 'NetSuite Back Office MOTO configured - Separate Payment Processing Profile recommended for back office',
          visibleIf: data =>
            data.processingChannels && data.processingChannels.includes('moto'),
          reference:
            'Admin Guide, Section 3.2 "Credit Card Processing" (p. 151)',
        },
        {
          text: 'Consider separate Payment Processing Profiles for reporting/security if using both online and MOTO',
          visibleIf: data =>
            data.processingChannels &&
            data.processingChannels.includes('ecommerce') &&
            data.processingChannels.includes('moto'),
          reference:
            'Admin Guide, Section 2.3 "Setup a Payment Processing Profile" (p. 21)',
        },
        {
          text: 'Payment Link configured - Email invoices with pay-now button',
          visibleIf: data =>
            data.processingChannels &&
            data.processingChannels.includes('payment-link'),
          reference: 'Admin Guide, Section 2.12 "Setup Payment Link" (p. 89)',
        },
        {
          text: 'Customers click link → fill payment form → auto-applied to invoice',
          visibleIf: data =>
            data.processingChannels &&
            data.processingChannels.includes('payment-link'),
        },
        {
          text: 'Supports partial payments if enabled',
          visibleIf: data =>
            data.processingChannels &&
            data.processingChannels.includes('payment-link'),
          reference: 'Section 2.12 (p. 96)',
        },
        {
          text: 'Braintree Payment Request Link configured - Generate link on Sales Order → email to customer',
          visibleIf: data =>
            data.processingChannels && data.processingChannels.includes('prl'),
          reference:
            'Admin Guide, Section 2.13 "Braintree Payment Request Link" (p. 91)',
        },
        {
          text: 'Supports multiple payment methods + vaulting',
          visibleIf: data =>
            data.processingChannels && data.processingChannels.includes('prl'),
        },
      ],
    },

    // PART 6: NETSUITE TRANSACTIONS
    {
      title: 'Part 6: NetSuite Transaction Support Verification',
      description: 'Verify your transaction types are supported',
      reference: 'Admin Guide, Section 1.3 "Common Workflows Supported" (p. 4)',
      items: [
        {
          text: 'Sales Order – Authorization, Capture, Void, Refund, Reauthorization',
        },
        { text: 'Cash Sale – Capture, Refund, Partial Capture, Over-Capture' },
        { text: 'Customer Payment – Sale, Refund' },
        {
          text: 'Customer Deposit – Sale, Refund (auto-created from Sales Order Sale operation)',
        },
        { text: 'Cash Refund – Refund operation' },
        {
          text: 'Invoice (via Payment Link) – Sale operation, Partial payments',
        },
        { text: 'Quote/Estimate (via Braintree PRL) – Sale or Authorization' },
        { text: 'Customer Refund – Refund operation' },
      ],
    },

    // PART 7: SETUP & CONFIG
    {
      title: 'Part 7: Account Setup & Configuration',
      description:
        'Pre-Setup: Braintree Control Panel & NetSuite Configuration',
      items: [
        {
          text: 'BRAINTREE CONTROL PANEL SETUP:',
        },
        {
          text: 'Braintree Sandbox Account created - Sandbox ID: __________',
          reference:
            'Admin Guide, Section 2.2 "Setup Braintree Control Panel" (p. 9)',
        },
        {
          text: 'Braintree Production Account created - Production ID: __________',
          reference: 'Admin Guide, Section 2.2 (p. 10)',
        },
        {
          text: 'Merchant Account IDs created for each subsidiary + currency combination - Sandbox MAID: __________ / Prod MAID: __________',
          reference: 'Admin Guide, Section 2.2 (p. 10)',
        },
        {
          text: 'API Keys (Public/Private) generated',
          reference: 'Admin Guide, Section 2.2 (p. 11)',
        },
        {
          text: 'Tokenization Key generated',
          reference: 'Admin Guide, Section 2.2 (p. 12)',
        },
        {
          text: 'PayPal Developer Account linked - Client ID: __________ / Secret: __________',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('paypal'),
          reference: 'Admin Guide, Section 2.2 (p. 13)',
        },
        {
          text: 'Payment methods enabled in Braintree Control Panel: Credit/Debit Cards',
        },
        {
          text: 'Payment methods enabled: ACH',
          visibleIf: data => data.acceptACH === 'yes',
        },
        {
          text: 'Payment methods enabled: PayPal',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('paypal'),
        },
        {
          text: 'Payment methods enabled: Digital Wallets (Apple Pay / Google Pay)',
          visibleIf: data =>
            data.paymentMethods &&
            (data.paymentMethods.includes('apple-pay') ||
              data.paymentMethods.includes('google-pay')),
        },
        {
          text: 'Payment methods enabled: Venmo',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('venmo'),
        },
        {
          text: 'Fraud settings configured: AVS/CVV rules set',
        },
        {
          text: 'Fraud Protection Advanced enabled',
          visibleIf: data => data.fraudProtectionAdvanced === 'yes',
        },
        {
          text: '3D Secure 2.0 enabled',
          visibleIf: data => data.needs3ds === 'yes',
        },
        {
          text: 'Over-Capture/Partial Capture eligibility confirmed - PayPal team approval obtained',
          visibleIf: data => data.partialCapture || data.overCapture,
        },
        {
          text: 'ACH network check configuration',
          visibleIf: data => data.acceptACH === 'yes' && data.achNetworkCheck,
          link: 'https://developer.paypal.com/braintree/docs/guides/ach/testing-go-live#routing-numbers',
        },
        {
          text: '',
        },
        {
          text: 'NETSUITE SETUP:',
        },
        {
          text: 'Braintree SuiteApp installed',
          reference:
            'Admin Guide, Section 2.3 "Install the Braintree Payments SuiteApp" (p. 19)',
        },
        {
          text: 'Chargeback Workflow Bundle installed (prerequisite)',
          reference: 'Admin Guide, Section 2.3 (p. 18)',
        },
        {
          text: 'Features enabled: Credit Card Payments',
          reference: 'Admin Guide, Section 2.3 (p. 16)',
        },
        {
          text: 'Features enabled: Payment Link',
          visibleIf: data =>
            data.processingChannels &&
            data.processingChannels.includes('payment-link'),
        },
        {
          text: 'Braintree plug-in activated',
          reference: 'Admin Guide, Section 2.3 (p. 20)',
        },
        {
          text: 'Payment Processing Profile(s) created & configured - Profile Name: __________ / Subsidiary: __________',
          reference:
            'Admin Guide, Section 2.3 "Setup a Payment Processing Profile" (p. 21)',
        },
        {
          text: 'PPP Settings: API Keys (Public/Private) entered',
        },
        {
          text: 'PPP Settings: Merchant ID & Merchant Account ID entered',
        },
        {
          text: 'PPP Settings: Tokenization Key entered',
        },
        {
          text: 'PPP Settings: Settlement Bank Account assigned',
        },
        {
          text: 'PPP Settings: "Support Line Level Data" checkbox enabled',
          visibleIf: data =>
            data.l2l3Processing === 'yes' || data.l2l3Processing === 'partial',
        },
        {
          text: 'PPP Settings: "Test Mode" checkbox checked (for Sandbox profiles)',
        },
        {
          text: 'PPP Settings: "Over Capture" enabled',
          visibleIf: data => data.overCapture,
        },
        {
          text: 'PPP Settings: "Partial Capture" enabled',
          visibleIf: data => data.partialCapture,
        },
        {
          text: 'PPP Settings: "Enable Real time ACH status" checked',
          visibleIf: data => data.acceptACH === 'yes' && data.achRealtimeStatus,
        },
        {
          text: 'PPP Settings: Tokenization settings - "Replace Card by Token": Yes/No',
        },
        {
          text: 'Payment Methods created & linked',
          reference: 'Admin Guide, Section 2.3 (p. 27)',
        },
        {
          text: 'Payment Method: Credit/Debit Card Payment Method',
        },
        {
          text: 'Payment Method: Payment Card Token Method',
        },
        {
          text: 'Payment Method: General Token Method (for PayPal/Venmo tokens)',
          visibleIf: data =>
            data.paymentMethods &&
            (data.paymentMethods.includes('paypal') ||
              data.paymentMethods.includes('venmo')),
        },
        {
          text: 'Payment Method: External Checkout Method (if external e-commerce)',
        },
        {
          text: 'Payment Method: ACH Payment Method',
          visibleIf: data => data.acceptACH === 'yes',
        },
        {
          text: 'Payment Method: PayPal Payment Method',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('paypal'),
        },
        {
          text: 'Payment Method: Digital Wallet Method (Google Pay / Apple Pay)',
          visibleIf: data =>
            data.paymentMethods &&
            (data.paymentMethods.includes('apple-pay') ||
              data.paymentMethods.includes('google-pay')),
        },
        {
          text: 'Payment Method: Braintree PRL Method',
          visibleIf: data =>
            data.processingChannels && data.processingChannels.includes('prl'),
        },
        {
          text: 'Payment Method: Payment Link Method',
          visibleIf: data =>
            data.processingChannels &&
            data.processingChannels.includes('payment-link'),
        },
        {
          text: 'Webhooks configured - Postback URL copied from PPP → entered in Braintree Control Panel',
          reference:
            'Admin Guide, Section 2.3 "Configure Supported Webhooks" (p. 30)',
        },
        {
          text: 'Webhook notifications enabled: Dispute → Disputed',
        },
        {
          text: 'Webhook notifications enabled: Disbursement → Disbursement',
        },
        {
          text: 'Webhook notifications enabled: Transaction → Transaction Settlement Declined',
        },
        {
          text: 'Webhook notifications enabled: Transaction → Transaction Settlement Settled',
        },
      ],
    },

    // PART 8: SANDBOX TESTING
    {
      title: 'Part 8: Sandbox Testing Checklist',
      description: 'Core Payment Operations - Test all applicable scenarios',
      reference:
        'Admin Guide, Appendix, Section 5.2 "Processing Payments" (p. 299)',
      items: [
        {
          text: 'CREDIT CARDS:',
        },
        {
          text: 'Authorization tested (check balance holds for 24 hours) - Braintree test card: 4111111111111111 (Visa)',
          link: 'https://developer.paypal.com/braintree/docs/guides/credit-cards/testing',
        },
        { text: 'Capture after Authorization tested' },
        { text: 'Sale (Auth + Capture in one step) tested' },
        { text: 'Void Authorization tested' },
        { text: 'Refund tested' },
        { text: 'Payment Card Tokenization tested (save card for later)' },
        {
          text: '',
        },
        {
          text: 'ACH (if enabled):',
          visibleIf: data => data.acceptACH === 'yes',
        },
        {
          text: 'ACH Authorization tested',
          visibleIf: data => data.acceptACH === 'yes',
          link: 'https://developer.paypal.com/braintree/docs/guides/ach/testing-go-live',
        },
        {
          text: 'ACH Capture tested',
          visibleIf: data => data.acceptACH === 'yes',
        },
        {
          text: 'ACH Refund tested',
          visibleIf: data => data.acceptACH === 'yes',
        },
        {
          text: '',
          visibleIf: data => data.acceptACH === 'yes',
        },
        {
          text: 'PAYPAL:',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('paypal'),
        },
        {
          text: 'PayPal Authorization tested',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('paypal'),
          link: 'https://developer.paypal.com/braintree/docs/guides/paypal/testing',
        },
        {
          text: 'PayPal Sale tested',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('paypal'),
        },
        {
          text: 'PayPal Refund tested',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('paypal'),
        },
        {
          text: 'PayPal Void tested',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('paypal'),
        },
        {
          text: 'PayPal Token Vaulting tested',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('paypal'),
        },
        {
          text: '',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('paypal'),
        },
        {
          text: 'DIGITAL WALLETS (if enabled):',
          visibleIf: data =>
            data.paymentMethods &&
            (data.paymentMethods.includes('apple-pay') ||
              data.paymentMethods.includes('google-pay')),
        },
        {
          text: 'Apple Pay: Auth, Capture, Refund, Void tested',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('apple-pay'),
          link: 'https://developer.paypal.com/braintree/docs/guides/digital-wallets/apple-pay/overview#testing',
        },
        {
          text: 'Google Pay: Auth, Capture, Refund, Void tested',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('google-pay'),
        },
        {
          text: '',
          visibleIf: data =>
            data.paymentMethods &&
            (data.paymentMethods.includes('apple-pay') ||
              data.paymentMethods.includes('google-pay')),
        },
        {
          text: 'ADVANCED FEATURES:',
          visibleIf: data =>
            data.partialCapture || data.overCapture || data.l2l3Processing,
        },
        {
          text: 'Partial Capture tested: Create Sales Order with multiple items → Fulfill partial shipment → Bill → Capture partial amount',
          visibleIf: data => data.partialCapture,
          reference:
            'Admin Guide, Section 3.2 "Cash Sale – Partial Capture" (p. 154)',
        },
        {
          text: 'Over-Capture tested: Create Sales Order with initial authorization → Add discount/fee item → Bill → Capture over-authorized amount',
          visibleIf: data => data.overCapture,
          reference:
            'Admin Guide, Section 3.2 "Cash Sale – Over Capture" (p. 155)',
        },
        {
          text: 'Verify Braintree Control Panel shows over-capture transaction',
          visibleIf: data => data.overCapture,
        },
        {
          text: 'Reauthorization tested: Create Sales Order with authorization expiring in <7 days → Deploy BT Map Reauthorization script → Verify authorization renewed',
          visibleIf: data => data.needsReauth,
          reference:
            'Admin Guide, Section 2.18 "Setup for Reauthorization" (p. 111)',
        },
        {
          text: 'L2/L3 Data tested: Enable "Requires Line-Level Data" → Create transaction with PO#, tax, shipping, line-items → Verify in Braintree Control Panel',
          visibleIf: data =>
            data.l2l3Processing === 'yes' || data.l2l3Processing === 'partial',
          reference: 'Admin Guide, Section 5.8 "L2L3 Data processing" (p. 312)',
        },
        {
          text: '',
          visibleIf: data =>
            data.partialCapture || data.overCapture || data.l2l3Processing,
        },
        {
          text: 'FRAUD MANAGEMENT:',
          visibleIf: data =>
            data.fraudProtectionAdvanced === 'yes' ||
            data.fraudProtectionAdvanced === 'unsure',
        },
        {
          text: 'AVS/CVV rule enforcement tested',
        },
        {
          text: 'Fraud Protection Advanced scoring/decisions tested',
          visibleIf: data =>
            data.fraudProtectionAdvanced === 'yes' ||
            data.fraudProtectionAdvanced === 'unsure',
          reference:
            'Admin Guide, Section 3.13 "Fraud Protection Advanced" (p. 268)',
        },
        {
          text: 'Transaction hold logic tested',
          visibleIf: data =>
            data.fraudProtectionAdvanced === 'yes' ||
            data.fraudProtectionAdvanced === 'unsure',
        },
        {
          text: '',
        },
        {
          text: 'PAYMENT EVENTS & TROUBLESHOOTING:',
        },
        {
          text: 'Payment Event records created for each transaction - Check Raw Request & Raw Response for data accuracy',
          reference:
            'Admin Guide, Section 2.3 "Viewing Payment Events" (p. 137)',
        },
        {
          text: 'Expected Payment Statuses verified: Authorized, Captured, Settled, Refunded',
          reference: 'Admin Guide, Section 5.4 "Payment Statuses" (p. 305)',
        },
        {
          text: 'Transaction failure scenarios tested: Gateway Rejection (e.g., address mismatch, fraud score)',
          link: 'https://developer.paypal.com/braintree/articles/control-panel/transactions/gateway-rejections',
        },
        {
          text: 'Authorization Decline tested (e.g., insufficient funds)',
          link: 'https://developer.paypal.com/braintree/articles/control-panel/transactions/declines#authorization-decline-codes',
        },
        {
          text: 'Settlement Decline tested (post-authorization failure)',
          link: 'https://developer.paypal.com/braintree/articles/control-panel/transactions/declines#settlement-decline-codes',
        },
      ],
    },

    // PART 9: GO-LIVE
    {
      title: 'Part 9: Go-Live & Production Readiness',
      description: 'Pre-Production Approval & Operations Handoff',
      items: [
        {
          text: 'PRE-PRODUCTION APPROVAL:',
        },
        {
          text: 'Braintree Production Account approved by PayPal underwriting (1–5 business days depending on risk profile)',
        },
        {
          text: 'Production Merchant ID: __________',
        },
        {
          text: 'Production MAID: __________',
        },
        {
          text: 'NetSuite Production Payment Processing Profile created (copy from Sandbox, update credentials)',
          reference: 'Admin Guide, Section 2.3 (p. 21)',
        },
        {
          text: 'CRITICAL: Uncheck "Test Mode" checkbox on Production PPP',
        },
        {
          text: 'Test Mode OFF verified: __________',
        },
        {
          text: 'Webhooks re-configured in Production - New Postback URL from Production PPP',
          reference: 'Admin Guide, Section 2.3 (p. 30)',
        },
        {
          text: 'Verify webhook test: "Success! Server responded with 202"',
        },
        {
          text: '',
        },
        {
          text: 'OPERATIONS HANDOFF:',
        },
        {
          text: 'User training completed: Credit Card Processing',
          reference: 'End User Guide, Section 3.2 (p. 151)',
        },
        {
          text: 'User training completed: ACH Processing',
          visibleIf: data => data.acceptACH === 'yes',
          reference: 'End User Guide, Section 3.3 (p. 187)',
        },
        {
          text: 'User training completed: Tokenization',
          reference: 'End User Guide, Section 3.5 (p. 238)',
        },
        {
          text: 'User training completed: Reauthorization',
          visibleIf: data => data.needsReauth,
          reference: 'End User Guide, Section 3.8 (p. 258)',
        },
        {
          text: 'Runbooks created: Payment failures & troubleshooting',
        },
        {
          text: 'Runbooks created: Refund procedures',
        },
        {
          text: 'Runbooks created: Token management',
        },
        {
          text: 'Runbooks created: ACH network check process',
          visibleIf: data => data.acceptACH === 'yes' && data.achNetworkCheck,
        },
        {
          text: 'Support escalation path defined: Level 1 (NetSuite Admin) → Level 2 (Braintree Support)',
          reference:
            'Admin Guide, Section 5.17 "Braintree Support Contact Links" (p. 332)',
        },
        {
          text: '',
        },
        {
          text: 'POST-GO-LIVE MONITORING (First 30 Days):',
        },
        {
          text: 'Daily transaction review: Payment Event status (Captured, Settled)',
          reference:
            'Admin Guide, Section 2.3 "Viewing the Payment Event for a Transaction" (p. 137)',
        },
        {
          text: 'Failed transactions reviewed → troubleshooting via Raw Request/Response',
        },
        {
          text: 'Weekly reconciliation: Compare NetSuite captured amounts vs. Braintree deposits',
        },
        {
          text: 'Verify settlement bank account deposits match expectations',
        },
        {
          text: 'ACH validation: Confirm real-time status webhook delivery',
          visibleIf: data => data.acceptACH === 'yes' && data.achRealtimeStatus,
        },
        {
          text: 'Test ACH network check process with sample transactions',
          visibleIf: data => data.acceptACH === 'yes' && data.achNetworkCheck,
        },
        {
          text: 'Fraud management tuning: Monitor auto-decline rate (should be <2% of transactions)',
        },
        {
          text: 'Adjust AVS/CVV rules if excessive false positives',
        },
      ],
    },
  ],
};
