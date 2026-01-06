const path = require('path');
const MarkdownParserService = require('./markdownParserService');

class GuideGenerator {
  constructor() {
    this.markdownParser = new MarkdownParserService();
    this.markdownPath = path.join(__dirname, '..', 'Braintree-Ref-Tagged.md');

    // Parse markdown file on initialization
    try {
      this.markdownParser.parseMarkdownFile(this.markdownPath);
      console.log(
        '✓ Loaded Braintree integration reference guide (Tagged Version)'
      );
    } catch (error) {
      console.error('Failed to load reference guide:', error.message);
      throw error;
    }
  }

  /**
   * Generate personalized implementation guide based on user's form data
   */
  generateGuide(formData) {
    // Generate tags from form data
    const userTags = this.markdownParser.mapFormDataToTags(formData);
    const complexity = this.markdownParser.determineComplexity(
      userTags,
      formData
    );

    // Get relevant sections based on tags
    const relevantSections = this.markdownParser.filterSectionsByTags(userTags);

    // Build the guide
    const markdown = this.buildGuideMarkdown(
      formData,
      userTags,
      complexity,
      relevantSections
    );

    return {
      markdown,
      sections: relevantSections.map(s => ({
        id: s.id,
        title: s.title,
        tags: s.tags,
      })),
      complexity,
      tags: userTags,
    };
  }

  /**
   * Build the complete markdown guide
   */
  buildGuideMarkdown(formData, tags, complexity, sections) {
    let guide = '';

    // Header
    guide += `# Braintree-NetSuite Implementation Guide\n\n`;
    guide += `**Prepared for:** ${formData.merchantName}\n`;
    guide += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    guide += `---\n\n`;

    // Introduction
    guide += `## Welcome\n\n`;
    guide += `This personalized implementation guide has been created based on your specific Braintree integration requirements. `;
    guide += `It contains only the sections relevant to your configuration, helping you focus on what matters most for your implementation.\n\n`;

    // Complexity Indicator
    const complexityInfo = {
      simple: {
        emoji: '✅',
        desc: 'Straightforward configuration with minimal dependencies',
      },
      moderate: {
        emoji: '⚠️',
        desc: 'Standard configuration with some additional features',
      },
      complex: {
        emoji: '🔧',
        desc: 'Advanced setup requiring multiple integrations and features',
      },
    };

    const info = complexityInfo[complexity];
    guide += `### Implementation Complexity: ${
      info.emoji
    } ${complexity.toUpperCase()}\n\n`;
    guide += `${info.desc}\n\n`;

    // Configuration Summary
    guide += `---\n\n`;
    guide += `## Your Configuration\n\n`;
    guide += this.buildConfigurationSummary(formData);

    // Implementation Sections
    guide += `\n---\n\n`;
    guide += `## Implementation Guide\n\n`;

    let sectionNumber = 1;
    sections.forEach(section => {
      // Format section content
      const content = this.markdownParser.formatSectionContent(section);

      // Add section with renumbered heading
      guide += `<a id="section-${section.id}"></a>\n\n`;
      guide += `## ${sectionNumber}. ${section.title}\n\n`;

      // Show tags for transparency (except for general sections)
      const relevantTags = section.tags?.filter(
        t => t !== 'general reference' && t !== 'general'
      );
      if (relevantTags?.length > 0) {
        guide += `*Relevant to: ${relevantTags.join(', ')}*\n\n`;
      }

      guide += content;
      guide += `\n\n`;

      sectionNumber++;
    });

    // Next Steps
    guide += `---\n\n`;
    guide += `## Next Steps\n\n`;
    guide += this.buildNextSteps(formData, complexity);

    // Footer
    guide += `\n---\n\n`;
    guide += `*This implementation guide was generated on ${new Date().toLocaleDateString()} based on your discovery form responses. `;
    guide += `For additional support, contact your Braintree account representative.*\n`;

    return guide;
  }

  /**
   * Build configuration summary based on form data
   */
  buildConfigurationSummary(formData) {
    let summary = '';

    summary += `Below is a detailed breakdown of your selected features and the required configuration steps for each.\n\n`;

    // Processing Timeline
    if (formData.processingTimeline === 'same-day') {
      summary += `### ✓ Same-Day Capture\n\n`;
      summary += `**Description:** Transactions authorized and captured immediately on the same business day.\n\n`;
      summary += `**Required Configuration:**\n`;
      summary += `- **NetSuite:** Set Payment Operation to "Sale" on transactions (Cash Sale, Customer Payment)\n`;
      summary += `- **Braintree Control Panel:** No additional configuration required\n\n`;
    } else if (formData.processingTimeline === 'multi-day') {
      summary += `### ✓ Multi-Day Capture\n\n`;
      summary += `**Description:** Authorization on Day 1, capture on Day 3-7 (typical for MOTO, B2B).\n\n`;
      summary += `**Required Configuration:**\n`;
      summary += `- **NetSuite:** Set Payment Operation to "Authorization" on Sales Order, then "Capture Authorization" when fulfilling\n`;
      summary += `- **Braintree Control Panel:** No additional configuration required\n`;
      summary += `- **Important:** Authorizations typically expire after 7 days\n\n`;

      if (formData.needsReauth === true || formData.needsReauth === 'yes') {
        summary += `### ✓ Reauthorization\n\n`;
        summary += `**Description:** Renew expired authorizations when auth-to-capture gap exceeds 7 days.\n\n`;
        summary += `**Required Configuration:**\n`;
        summary += `- **NetSuite:** Create Braintree Config Extension record with Payment Processing Profile Internal ID\n`;
        summary += `- **NetSuite:** Configure "Display ReAuth Button Preference" and days threshold\n`;
        summary += `- **NetSuite:** Deploy "[BT] Braintree Mark Expired in Auth Info" scheduled script\n`;
        summary += `- **Braintree Control Panel:** No additional configuration required\n`;
        summary += `- **Prerequisite:** Tokenization must be enabled to reauthorize payment methods\n\n`;
      }
    }

    // Special Capture Features
    if (formData.partialCapture === true || formData.partialCapture === 'yes') {
      summary += `### ✓ Partial Capture\n\n`;
      summary += `**Description:** Capture less than the full authorized amount across multiple captures (split shipments, drop-shipping).\n\n`;
      summary += `**Required Configuration:**\n`;
      summary += `- **Braintree Control Panel:** Contact PayPal to enable partial capture for your merchant account (approval required)\n`;
      summary += `- **NetSuite:** Check "Enable Partial Capture" on Payment Processing Profile\n`;
      summary += `- **NetSuite:** Use Item Fulfillment → Bill → Capture Authorization workflow\n\n`;
    }

    if (formData.overCapture === true || formData.overCapture === 'yes') {
      summary += `### ✓ Over-Capture\n\n`;
      summary += `**Description:** Capture MORE than the original authorization amount (up to 115% for qualified merchants).\n\n`;
      summary += `**Required Configuration:**\n`;
      summary += `- **Braintree Control Panel:** Contact PayPal to verify MCC eligibility and enable over-capture (approval required)\n`;
      summary += `- **NetSuite:** Check "Enable Overcapture" on Payment Processing Profile\n`;
      summary += `- **NetSuite:** Enable tokenization/vaulting (CRITICAL - required for over-capture)\n`;
      summary += `- **Important:** Only Visa/MasterCard support over-capture; limited MCCs qualify\n\n`;
    }

    // L2/L3 Processing
    if (formData.l2l3Processing === 'yes') {
      summary += `### ✓ Level 2/3 Data Processing\n\n`;
      summary += `**Description:** Enhanced transaction data for B2B transactions to reduce interchange rates.\n\n`;
      summary += `**Required Configuration:**\n`;
      summary += `- **NetSuite:** Check "Support Line Level Data" on Payment Processing Profile\n`;
      summary += `- **NetSuite:** Check "Requires Line-Level Data" on each payment method\n`;
      summary += `- **NetSuite:** Ensure transaction records include: PO#, line items, tax, shipping amounts\n`;
      summary += `- **Braintree Control Panel:** No additional configuration required\n\n`;
    }

    // ACH
    if (formData.acceptACH === 'yes') {
      summary += `### ✓ ACH Processing\n\n`;
      summary += `**Description:** Direct bank-to-bank transfers (settles in 1-2 business days).\n\n`;
      summary += `**Required Configuration:**\n`;
      summary += `- **Braintree Control Panel:** Contact PayPal to enable ACH processing (approval required)\n`;
      summary += `- **NetSuite:** Create ACH payment method (Type: "ACH")\n`;
      summary += `- **NetSuite:** Add ACH method to Payment Processing Profile\n`;

      const achFeatures = [];
      if (formData.achNetworkCheck) {
        achFeatures.push('Network Check');
        summary += `- **Braintree Control Panel:** Enable Network Check for account verification\n`;
      }
      if (formData.achRecurring) {
        achFeatures.push('Recurring');
        summary += `- **NetSuite:** Configure recurring billing schedules for subscription payments\n`;
      }
      if (formData.achRealtimeStatus) {
        achFeatures.push('Real-time Status');
        summary += `- **NetSuite:** Check "Enable Real time ACH status" on Payment Processing Profile\n`;
        summary += `- **NetSuite:** Configure webhooks for settlement notifications\n`;
      }
      summary += `\n`;
    }

    // Payment Methods
    if (formData.paymentMethods && formData.paymentMethods.length > 0) {
      summary += `### ✓ Payment Methods\n\n`;

      // Credit/Debit Cards (always included)
      summary += `**Credit/Debit Cards** (Visa, MasterCard, Amex, Discover)\n`;
      summary += `- **NetSuite:** Create payment methods for each card brand (Type: "Payment Card")\n`;
      summary += `- **NetSuite:** Set Card Brands field for each method (required for Payment Link/SCA)\n`;
      summary += `- **Braintree Control Panel:** Credit card processing enabled by default\n\n`;

      if (formData.paymentMethods.includes('paypal')) {
        summary += `**PayPal**\n`;
        summary += `- **Braintree Control Panel:** Link PayPal account to Braintree (Account > PayPal)\n`;
        summary += `- **NetSuite:** Create External Checkout payment method for PayPal\n`;
        summary += `- **NetSuite:** Create Tokenization Key in Braintree Control Panel (API > Keys > Tokenization Keys)\n`;
        summary += `- **NetSuite:** Enter Tokenization Key in Payment Processing Profile\n\n`;
      }

      if (formData.paymentMethods.includes('bnpl')) {
        summary += `**PayPal Buy Now Pay Later**\n`;
        summary += `- **Braintree Control Panel:** Ensure BNPL enabled (limited countries)\n`;
        summary += `- **NetSuite:** Configure via Digital Wallet section in Payment Processing Profile\n`;
        summary += `- **NetSuite:** Check "Buy Now Pay Later" in Allowed Alternate Payments\n\n`;
      }

      if (formData.paymentMethods.includes('apple-pay')) {
        summary += `**Apple Pay**\n`;
        summary += `- **Braintree Control Panel:** Enable Apple Pay (Account Settings > Payment Methods)\n`;
        summary += `- **Apple Developer Account:** Create Merchant ID and certificates (requires Mac OS)\n`;
        summary += `- **NetSuite:** Upload domain association file to Website Hosting Files\n`;
        summary += `- **NetSuite:** Configure Digital Wallet section in Payment Processing Profile\n`;
        summary += `- **NetSuite:** Check "Apple Pay" in Allowed Alternate Payments\n\n`;
      }

      if (formData.paymentMethods.includes('google-pay')) {
        summary += `**Google Pay**\n`;
        summary += `- **Braintree Control Panel:** Enable Google Pay (Account Settings > Payment Methods)\n`;
        summary += `- **Google Merchant Center:** Obtain Google Merchant ID\n`;
        summary += `- **NetSuite:** Enter Google Merchant ID in Payment Processing Profile\n`;
        summary += `- **NetSuite:** Check "Google Pay" in Allowed Alternate Payments\n\n`;
      }

      if (formData.paymentMethods.includes('venmo')) {
        summary += `**Venmo** (US only)\n`;
        summary += `- **Braintree Control Panel:** Contact PayPal to enable Venmo\n`;
        summary += `- **Braintree Control Panel:** Create Business Profile (Account Settings > Payment Methods > Venmo)\n`;
        summary += `- **NetSuite:** Create External Checkout payment method for Venmo\n`;
        summary += `- **NetSuite:** Check "Venmo" in Allowed Alternate Payments\n\n`;
      }
    }

    // Processing Channels
    if (formData.processingChannels && formData.processingChannels.length > 0) {
      summary += `### ✓ Processing Channels\n\n`;

      if (formData.processingChannels.includes('suitecommerce')) {
        summary += `**SuiteCommerce**\n`;
        summary += `- **NetSuite:** Install SuiteCommerce bundle (Bundle ID: 520497)\n`;
        summary += `- **NetSuite:** Install Braintree SuiteCommerce Extension (Braintree > Configuration > Commerce Extension)\n`;
        summary += `- **NetSuite:** Activate extension via Extension Manager for your website/domain\n`;
        summary += `- **NetSuite:** Create External Checkout payment method for embedded buttons\n`;
        summary += `- **NetSuite:** Configure payment methods in Commerce > Website > Configuration > Braintree tab\n\n`;
      }

      if (formData.processingChannels.includes('external-ecommerce')) {
        let channel = 'External eCommerce';
        if (
          formData.ecommercePlatform &&
          formData.ecommercePlatform !== 'other'
        ) {
          const platformNames = {
            shopify: 'Shopify',
            magento: 'Magento',
            bigcommerce: 'BigCommerce',
            woocommerce: 'WooCommerce',
            'salesforce-commerce': 'Salesforce Commerce Cloud',
            custom: 'Custom Platform',
          };
          channel =
            platformNames[formData.ecommercePlatform] ||
            formData.ecommercePlatform;
        }

        summary += `**${channel}**\n`;
        summary += `- **External Platform:** Install and configure Braintree payment gateway on your ${channel} site\n`;
        summary += `- **External Platform:** Use same Braintree merchant account credentials\n`;
        summary += `- **NetSuite:** Create External Checkout payment method (name it "${channel}")\n`;
        summary += `- **NetSuite:** Add external platform payment method to Payment Processing Profile\n`;

        if (formData.needsOrderSync === 'yes') {
          summary += `- **Integration:** Set up API connector/middleware (Celigo, Jitterbit, custom) to sync orders\n`;
          summary += `- **Integration:** Map critical fields: PN Ref (transaction ID), auth code, amount, customer info\n`;
          summary += `- **NetSuite:** Use "Record External Event" handling mode on Sales Orders\n`;
          summary += `- **NetSuite:** Configure webhooks for real-time transaction updates\n`;
        }
        summary += `\n`;
      }

      if (formData.processingChannels.includes('moto')) {
        summary += `**Back Office MOTO** (Mail Order / Telephone Order)\n`;
        summary += `- **NetSuite:** No additional configuration required beyond standard payment methods\n`;
        summary += `- **NetSuite:** Process transactions manually via Sales Order or Cash Sale forms\n`;
        summary += `- **Best Practice:** Consider separate Payment Processing Profile for reporting/security\n\n`;
      }

      if (formData.processingChannels.includes('payment-link')) {
        summary += `**Payment Link** (NetSuite Invoice Payment)\n`;
        summary += `- **NetSuite:** Enable Feature (Setup > Company > Enable Features > Transactions > Payment Link)\n`;
        summary += `- **NetSuite:** Configure Payment Link (Commerce > Payment Link)\n`;
        summary += `- **NetSuite:** Set domain prefix, payment methods, company logo, email templates\n`;
        summary += `- **NetSuite:** Add payment link markup to invoice PDF templates (optional)\n`;
        summary += `- **Braintree Control Panel:** No additional configuration required\n\n`;
      }

      if (formData.processingChannels.includes('prl')) {
        summary += `**Braintree Payment Request Link** (Sales Order Payment)\n`;
        summary += `- **NetSuite:** Create External Checkout payment method named "Braintree Payment Request Link"\n`;
        summary += `- **NetSuite:** Configure "Braintree Payment Request Link Method" on Payment Processing Profile\n`;
        summary += `- **NetSuite:** Set expiration days (default: 3 days)\n`;
        summary += `- **NetSuite:** Optionally disable specific payment types (card, PayPal)\n`;
        summary += `- **NetSuite:** Add PRL markup to Sales Order PDF templates to display link\n\n`;
      }
    }

    // Fraud Protection
    summary += `### ✓ Fraud Protection\n\n`;
    if (formData.fraudProtectionAdvanced === 'yes') {
      summary += `**Fraud Protection Advanced** (AI-driven risk scoring)\n`;
      summary += `- **Braintree Control Panel:** Contact PayPal to enable Fraud Protection Advanced (additional fees)\n`;
      summary += `- **Braintree Control Panel:** Configure risk thresholds and auto-decline rules\n`;
      summary += `- **NetSuite:** Check "Enable Fraud Protection Advanced" on Payment Processing Profile\n`;
      summary += `- **NetSuite:** Configure webhooks for "Transaction Reviewed" notifications\n`;
      summary += `- **NetSuite:** Deploy "[BT] Generate Refund for Fraud Review" scheduled script\n`;
      summary += `- **Important:** Transactions placed on HOLD pending risk review; fulfillment cannot proceed until approved\n\n`;
    } else if (formData.fraudProtectionAdvanced === 'premium') {
      summary += `**Fraud Protection Premium**\n`;
      summary += `- **Braintree Control Panel:** Configure AVS and CVV rules (Fraud Management section)\n`;
      summary += `- **Braintree Control Panel:** Set up enhanced fraud filters\n`;
      summary += `- **NetSuite:** Configure "Skip Basic Fraud" dropdowns on Payment Processing Profile (optional)\n`;
      summary += `- **NetSuite:** No additional configuration beyond basic setup\n\n`;
    } else {
      summary += `**Basic Fraud Management** (AVS/CVV only)\n`;
      summary += `- **Braintree Control Panel:** Configure AVS rules (Fraud Management > AVS Options)\n`;
      summary += `- **Braintree Control Panel:** Configure CVV rules (Fraud Management > CVV Options)\n`;
      summary += `- **NetSuite:** Configure "Skip Basic Fraud" dropdowns on Payment Processing Profile (optional)\n`;
      summary += `- **NetSuite:** No additional configuration required\n\n`;
    }

    // 3D Secure
    if (formData.needs3ds === 'yes') {
      summary += `### ✓ 3D Secure 2.0 (SCA Compliance)\n\n`;
      summary += `**Description:** Strong Customer Authentication required for EU/UK/regulated regions.\n\n`;
      summary += `**Required Configuration:**\n`;
      summary += `- **Braintree Control Panel:** Enable 3D Secure 2.0 (Account Settings > Processing)\n`;
      summary += `- **NetSuite:** Check "Payer Authentication" on Payment Processing Profile\n`;
      summary += `- **NetSuite:** Ensure "Authentication" is in Gateway Request Types list\n`;
      summary += `- **NetSuite (if using SCA):** Enable "Enable 3D Secure Payments" in Commerce > Website > Configuration\n`;
      summary += `- **Important:** Verify billing address configuration to prevent authentication failures\n\n`;
    }

    return summary;
  }

  /**
   * Build next steps based on configuration
   */
  buildNextSteps(formData, complexity) {
    let steps = '';

    steps += `Based on your **${complexity}** configuration, here are your recommended next steps:\n\n`;

    steps += `1. **Review this guide** with your implementation team\n`;
    steps += `2. **Access Braintree Control Panel** to configure your merchant account\n`;
    steps += `3. **Install NetSuite SuiteApp** (Bundle ID: 283423)\n`;
    steps += `4. **Configure Payment Processing Profile** in NetSuite\n`;

    if (formData.acceptACH === 'yes') {
      steps += `5. **Set up ACH** in Braintree Control Panel\n`;
    }

    if (formData.needs3ds === 'yes') {
      steps += `5. **Enable 3D Secure 2.0** for compliance\n`;
    }

    if (complexity === 'complex') {
      steps += `5. **Schedule implementation call** with Braintree technical team\n`;
    }

    steps += `6. **Test in Sandbox environment** before going live\n`;
    steps += `7. **Complete Go-Live checklist** and validation\n\n`;

    steps += `### Key Resources\n\n`;
    steps += `- [Braintree Developer Portal](https://developer.paypal.com/braintree/)\n`;
    steps += `- [NetSuite SuitePayments Documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N2988163.html)\n`;
    steps += `- [Testing & Go-Live Checklist](https://developer.paypal.com/braintree/docs/guides/credit-cards/testing-go-live/)\n`;

    return steps;
  }
}

module.exports = new GuideGenerator();
