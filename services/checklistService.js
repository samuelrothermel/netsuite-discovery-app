const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, HeadingLevel } = require('docx');
const checklistData = require('../data/checklistData');

class ChecklistService {
  generateFilteredChecklist(formData) {
    // Generate a dynamic checklist based on user selections
    return this.generateDynamicChecklist(formData);
  }

  generateDynamicChecklist(formData) {
    let checklist = `# NetSuite-Braintree Integration Summary\n\n`;
    checklist += `**Merchant:** ${formData.merchantName}\n`;
    checklist += `**Email:** ${formData.merchantEmail}\n`;
    checklist += `**Generated:** ${new Date().toLocaleDateString()}\n`;
    checklist += `**Business Model:** ${this.getBusinessModelLabel(
      formData.businessModel
    )}\n\n`;
    checklist += `---\n\n`;

    checklist += `## Your Selected Configuration\n\n`;
    checklist += `This integration summary has been customized for **${formData.merchantName}** based on your specific requirements. Below is a review of your selections followed by implementation guidance and resources.\n\n`;

    // Add configuration review
    checklist += `### Configuration Review\n\n`;

    if (formData.processingTimeline === 'same-day') {
      checklist += `- **Same-Day Capture** - Transactions will be authorized and captured immediately\n`;
    } else if (formData.processingTimeline === 'multi-day') {
      checklist += `- **Multi-Day Capture** - Authorization and capture will happen on different days\n`;
      if (formData.needsReauth) {
        checklist += `- **Reauthorization** required for expired authorizations\n`;
      }
    }

    if (formData.partialCapture) {
      checklist += `- **Partial Capture** enabled - Can capture less than authorized amount\n`;
    }
    if (formData.overCapture) {
      checklist += `- **Over-Capture** enabled - Can capture up to 115% of authorized amount\n`;
    }

    if (formData.l2l3Processing === 'yes') {
      checklist += `- **Level 2/3 Data Processing** enabled for reduced interchange rates\n`;
    }

    if (formData.acceptACH === 'yes') {
      const achFeatures = [];
      if (formData.achNetworkCheck) achFeatures.push('Network Check');
      if (formData.achRecurring) achFeatures.push('Recurring Payments');
      if (formData.achRealtimeStatus) achFeatures.push('Real-time Status');
      checklist += `- **ACH Processing** enabled for bank transfers`;
      if (achFeatures.length > 0) {
        checklist += ` (${achFeatures.join(', ')})`;
      }
      checklist += `\n`;
    }

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
      checklist += `- **Payment Methods:** ${methods.join(', ')}\n`;
    }

    if (formData.processingChannels && formData.processingChannels.length > 0) {
      const channels = [];
      if (formData.processingChannels.includes('ecommerce'))
        channels.push('eCommerce/SCA');
      if (formData.processingChannels.includes('moto'))
        channels.push('Back Office MOTO');
      if (formData.processingChannels.includes('payment-link'))
        channels.push('Payment Link');
      if (formData.processingChannels.includes('prl'))
        channels.push('Braintree PRL');
      checklist += `- **Processing Channels:** ${channels.join(', ')}\n`;
    }

    if (formData.fraudProtectionAdvanced === 'yes') {
      checklist += `- **Fraud Protection Advanced** enabled\n`;
    }
    if (formData.needs3ds === 'yes') {
      checklist += `- **3D Secure 2.0** enabled for SCA compliance\n`;
    }

    if (
      formData.hasExistingVault === 'yes' &&
      formData.wantsMigration === 'yes'
    ) {
      checklist += `- **Data Migration** required from existing processor`;
      if (formData.migrateData && formData.migrateData.length > 0) {
        checklist += ` (${formData.migrateData.join(', ')})`;
      }
      checklist += `\n`;
    }

    checklist += `\n---\n\n`;
    checklist += `## Implementation Guide\n\n`;
    checklist += `The following sections provide specific implementation guidance for your selected features, including references to the Braintree Developer Documentation and NetSuite SuitePayments Admin Guide.\n\n`;

    // Process dynamic sections from checklistData - skip Part 1 (Discovery)
    checklistData.sections.forEach((section, index) => {
      // Skip Part 1: Pre-Integration Discovery
      if (
        section.title &&
        section.title.includes('Part 1: Pre-Integration Discovery')
      ) {
        return;
      }

      // Check if section should be visible
      if (section.visibleIf && !section.visibleIf(formData)) {
        return; // Skip this section
      }

      // Filter items within the section
      const visibleItems = section.items.filter(item => {
        if (!item.visibleIf) return true;
        return item.visibleIf(formData);
      });

      // Only include section if it has visible items
      if (visibleItems.length > 0) {
        checklist += `## ${section.title}\n\n`;
        if (section.description) {
          checklist += `**Overview:** ${section.description}\n\n`;
        }
        if (section.reference) {
          checklist += `📖 **Reference:** ${section.reference}\n\n`;
        }

        visibleItems.forEach(item => {
          const itemText = typeof item === 'string' ? item : item.text;
          checklist += `- ${itemText}`;

          if (item.reference) {
            checklist += `\n  - 📖 Admin Guide: ${item.reference}`;
          }
          if (item.link) {
            checklist += `\n  - 🔗 Developer Docs: ${item.link}`;
          }

          checklist += `\n`;
        });

        checklist += `\n`;
      }
    });

    // Add footer
    checklist += `---\n\n`;
    checklist += `## Next Steps\n\n`;
    checklist += `1. **Review this summary** with your implementation team\n`;
    checklist += `2. **Access the Braintree Control Panel** to configure your payment methods\n`;
    checklist += `3. **Install the NetSuite SuiteApp** (Bundle ID: 283423)\n`;
    checklist += `4. **Follow the implementation guides** referenced in each section above\n`;
    checklist += `5. **Test thoroughly** in the Braintree Sandbox environment\n`;
    checklist += `6. **Schedule a review** with your Braintree account representative\n\n`;

    checklist += `## Key Resources\n\n`;
    checklist += `- **[Braintree Developer Portal](https://developer.paypal.com/braintree/)** - Complete API documentation\n`;
    checklist += `- **[NetSuite SuitePayments Documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N2988163.html)** - NetSuite integration guides\n`;
    checklist += `- **[Testing & Go-Live Checklist](https://developer.paypal.com/braintree/docs/guides/credit-cards/testing-go-live/)** - Pre-production validation\n`;
    checklist += `- **Braintree SuitePayments Admin Guide** - Version V.42, Release 1.3.51 (contact your Braintree representative)\n\n`;
    checklist += `---\n\n`;
    checklist += `*This implementation summary was generated on ${new Date().toLocaleDateString()} based on your discovery form responses. Please review with your implementation team and Braintree account representative for the most current guidance.*\n`;

    return checklist;
  }

  getBusinessModelLabel(model) {
    const labels = {
      b2c: 'Business to Consumer (B2C)',
      b2b: 'Business to Business (B2B)',
      hybrid: 'Hybrid (B2B + B2C)',
    };
    return labels[model] || model;
  }

  async generateDocx(merchantName, markdownContent) {
    const children = [];
    const lines = markdownContent.split('\n');

    for (let line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        children.push(new Paragraph({ text: '', spacing: { after: 50 } }));
        continue;
      }

      // H1
      if (trimmed.startsWith('# ')) {
        children.push(
          new Paragraph({
            text: trimmed.replace(/^# /, ''),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          })
        );
      }
      // H2
      else if (trimmed.startsWith('## ')) {
        children.push(
          new Paragraph({
            text: trimmed.replace(/^## /, ''),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      }
      // H3
      else if (trimmed.startsWith('### ')) {
        children.push(
          new Paragraph({
            text: trimmed.replace(/^### /, ''),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 150, after: 100 },
          })
        );
      }
      // Checkboxes
      else if (trimmed.startsWith('- [ ]')) {
        children.push(
          new Paragraph({
            text: '☐ ' + trimmed.replace(/^- \[ \] /, '').replace(/\*\*/g, ''),
            spacing: { after: 80 },
            indent: { left: 400 },
          })
        );
      }
      // Regular bullets
      else if (trimmed.startsWith('- ')) {
        children.push(
          new Paragraph({
            text: '• ' + trimmed.replace(/^- /, '').replace(/\*\*/g, ''),
            spacing: { after: 80 },
            indent: { left: 400 },
          })
        );
      }
      // Horizontal rules
      else if (trimmed.startsWith('---')) {
        children.push(
          new Paragraph({
            text: '________________________________________',
            spacing: { before: 100, after: 100 },
          })
        );
      }
      // Tables - skip table separator lines
      else if (trimmed.startsWith('|') && !trimmed.includes('---')) {
        const cellText = trimmed
          .split('|')
          .filter(c => c.trim())
          .join(' | ');
        children.push(
          new Paragraph({
            text: cellText,
            spacing: { after: 50 },
          })
        );
      }
      // Regular text
      else if (!trimmed.startsWith('|')) {
        children.push(
          new Paragraph({
            text: trimmed.replace(/\*\*/g, ''),
            spacing: { after: 80 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          children: children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
}

module.exports = new ChecklistService();
