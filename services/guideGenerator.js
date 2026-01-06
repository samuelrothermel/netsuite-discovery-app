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

    // Table of Contents
    guide += `\n---\n\n`;
    guide += `## Table of Contents\n\n`;
    guide += `This guide includes ${sections.length} sections:\n\n`;

    sections.forEach((section, index) => {
      guide += `${index + 1}. [${section.title}](#section-${section.id})\n`;
    });

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

    // Processing Timeline
    if (formData.processingTimeline === 'same-day') {
      summary += `✓ **Same-Day Capture** - Transactions authorized and captured immediately\n`;
    } else if (formData.processingTimeline === 'multi-day') {
      summary += `✓ **Multi-Day Capture** - Authorization and capture on different days\n`;
      if (formData.needsReauth === true || formData.needsReauth === 'yes') {
        summary += `✓ **Reauthorization** - Handle expired authorizations\n`;
      }
    }

    // Special Capture Features
    if (formData.partialCapture === true || formData.partialCapture === 'yes') {
      summary += `✓ **Partial Capture** - Multiple captures on single authorization\n`;
    }
    if (formData.overCapture === true || formData.overCapture === 'yes') {
      summary += `✓ **Over-Capture** - Capture up to 115% of authorized amount\n`;
    }

    // L2/L3 Processing
    if (formData.l2l3Processing === 'yes') {
      summary += `✓ **Level 2/3 Data Processing** - Reduced interchange rates for B2B\n`;
    }

    // ACH
    if (formData.acceptACH === 'yes') {
      const achFeatures = [];
      if (formData.achNetworkCheck) achFeatures.push('Network Check');
      if (formData.achRecurring) achFeatures.push('Recurring Payments');
      if (formData.achRealtimeStatus) achFeatures.push('Real-time Status');
      summary += `✓ **ACH Processing** - Bank transfers`;
      if (achFeatures.length > 0) {
        summary += ` (${achFeatures.join(', ')})`;
      }
      summary += `\n`;
    }

    // Payment Methods
    if (formData.paymentMethods && formData.paymentMethods.length > 0) {
      const methods = ['Credit/Debit Cards'];
      if (formData.paymentMethods.includes('paypal')) methods.push('PayPal');
      if (formData.paymentMethods.includes('bnpl'))
        methods.push('Buy Now Pay Later');
      if (formData.paymentMethods.includes('apple-pay'))
        methods.push('Apple Pay');
      if (formData.paymentMethods.includes('google-pay'))
        methods.push('Google Pay');
      if (formData.paymentMethods.includes('venmo')) methods.push('Venmo');
      summary += `✓ **Payment Methods:** ${methods.join(', ')}\n`;
    }

    // Processing Channels
    if (formData.processingChannels && formData.processingChannels.length > 0) {
      const channels = [];
      if (formData.processingChannels.includes('suitecommerce'))
        channels.push('SuiteCommerce Advanced');
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
          channel += ` (${
            platformNames[formData.ecommercePlatform] ||
            formData.ecommercePlatform
          })`;
        }
        channels.push(channel);
      }
      if (formData.processingChannels.includes('moto'))
        channels.push('Back Office MOTO');
      if (formData.processingChannels.includes('payment-link'))
        channels.push('Payment Link');
      if (formData.processingChannels.includes('prl'))
        channels.push('Payment Request Link');
      summary += `✓ **Processing Channels:** ${channels.join(', ')}\n`;
    }

    // External eCommerce Integration
    if (
      formData.processingChannels?.includes('external-ecommerce') &&
      formData.needsOrderSync === 'yes'
    ) {
      summary += `✓ **Order Synchronization** - Sync orders from external platform to NetSuite\n`;
      summary += `  → Requires Record External Event and API connector configuration\n`;
    }

    // Fraud Protection
    if (formData.fraudProtectionAdvanced === 'yes') {
      summary += `✓ **Advanced Fraud Protection** - Advanced scoring and decision logic\n`;
    } else {
      summary += `✓ **Basic Fraud Protection** - AVS and CVV verification\n`;
    }

    // 3D Secure
    if (formData.needs3ds === 'yes') {
      summary += `✓ **3D Secure 2.0** - SCA compliance for regulated regions\n`;
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
