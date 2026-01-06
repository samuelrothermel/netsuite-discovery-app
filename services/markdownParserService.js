const fs = require('fs');
const path = require('path');

class MarkdownParserService {
  constructor() {
    this.sections = [];
    this.parsedContent = null;
  }

  /**
   * Parse the markdown file and extract sections with their tags
   */
  parseMarkdownFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.parsedContent = content;
      this.sections = this.extractSections(content);
      return this.sections;
    } catch (error) {
      console.error('Error parsing markdown file:', error);
      throw error;
    }
  }

  /**
   * Extract sections from the markdown content
   * Supports standard ## headers with **Tags:** annotations
   */
  extractSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];
    let sectionId = 0;
    let currentTags = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for **Tags:** line (collect tags for next section or current section)
      if (line.match(/^\*\*Tags:\*\*\s/)) {
        const tagsMatch = line.match(/^\*\*Tags:\*\*\s*(.+)$/);
        if (tagsMatch) {
          const tagString = tagsMatch[1];
          const tags = this.extractTags(tagString);

          // If we have a current section, add tags to it
          if (currentSection) {
            currentSection.tags = [...currentSection.tags, ...tags];
          } else {
            // Otherwise, store for next section
            currentTags = tags;
          }
        }
        continue; // Don't add tags line to content
      }

      // Detect section start (standard ## header, but not ### or deeper)
      const headerMatch = line.match(/^##\s+([^#].*)$/);
      if (headerMatch) {
        // Save previous section if exists
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          sections.push(currentSection);
        }

        // Start new section
        sectionId++;
        currentSection = {
          id: sectionId,
          title: headerMatch[1].trim(),
          tags: [...currentTags], // Use collected tags
          content: '',
          rawContent: [],
        };
        currentContent = [];
        currentTags = []; // Reset tags for next section
        continue; // Don't include header in content
      }

      // Add line to current section content
      if (currentSection) {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Extract tags from a tag string - supports backticks: `tag1` `tag2`
   */
  extractTags(tagString) {
    const backtickMatches = tagString.match(/`([^`]+)`/g);
    if (!backtickMatches) return [];

    return backtickMatches
      .map(match => match.replace(/`/g, '').trim())
      .filter(Boolean);
  }

  /**
   * Filter sections based on user tags
   */
  filterSectionsByTags(userTags) {
    if (!this.sections?.length) {
      throw new Error('No sections loaded. Call parseMarkdownFile() first.');
    }

    const coreTagSet = new Set([
      'general',
      'prerequisites',
      'admin',
      'core-setup',
      'reference',
    ]);
    const userTagsLower = new Set(userTags.map(t => t.toLowerCase()));

    // Exclusionary logic for channel-specific content
    const hasExternalEcommerce = userTagsLower.has('external-ecommerce');
    const hasSuiteCommerce = userTagsLower.has('suitecommerce');

    const isRelevant = section => {
      // Include if it's a core section
      if (section.tags.some(tag => coreTagSet.has(tag))) return true;

      const sectionTagsLower = section.tags.map(t => t.toLowerCase());

      // EXCLUSIONARY LOGIC: Prevent cross-contamination between channels
      // If user selected ONLY external-ecommerce (not suitecommerce)
      if (hasExternalEcommerce && !hasSuiteCommerce) {
        // Exclude sections that are ONLY for suitecommerce/sca
        if (
          sectionTagsLower.includes('suitecommerce') ||
          (sectionTagsLower.includes('sca') &&
            !sectionTagsLower.includes('external-platform'))
        ) {
          return false;
        }
      }

      // If user selected ONLY suitecommerce (not external-ecommerce)
      if (hasSuiteCommerce && !hasExternalEcommerce) {
        // Exclude sections that are ONLY for external platforms
        if (
          sectionTagsLower.includes('external-platform') &&
          !sectionTagsLower.includes('suitecommerce')
        ) {
          return false;
        }
      }

      // Include if any tag matches (with normalization for hyphens/underscores)
      return section.tags.some(
        tag =>
          userTagsLower.has(tag.toLowerCase()) ||
          userTagsLower.has(tag.toLowerCase().replace(/-/g, '_'))
      );
    };

    return this.sections.filter(isRelevant).sort((a, b) => a.id - b.id);
  }

  /**
   * Convert form data to relevant tags matching the new tagged reference format
   */
  mapFormDataToTags(formData) {
    const tags = new Set();

    // Merchant Type / Processing Channels
    if (formData.processingChannels) {
      if (formData.processingChannels.includes('suitecommerce')) {
        tags.add('suitecommerce');
        tags.add('sca');
        tags.add('workflow');
      }
      if (formData.processingChannels.includes('external-ecommerce')) {
        tags.add('external-ecommerce');
        tags.add('external-platform');
        tags.add('workflow');
        tags.add('api-connector');

        // If they need order sync, add record external event tags
        if (formData.needsOrderSync === 'yes') {
          tags.add('record-external-event');
          tags.add('order-sync');
          tags.add('integration');
        }

        // Add platform-specific tags
        if (formData.ecommercePlatform) {
          tags.add(formData.ecommercePlatform);
        }
      }
      if (formData.processingChannels.includes('moto')) {
        tags.add('moto');
        tags.add('back-office');
      }
      if (formData.processingChannels.includes('payment-link')) {
        tags.add('payment-link');
      }
      if (formData.processingChannels.includes('prl')) {
        tags.add('payment-request-link');
        tags.add('prl');
      }
    }

    // Check if SaaS/subscription model
    if (
      formData.businessModel === 'saas' ||
      formData.subscriptionBased === 'yes'
    ) {
      tags.add('recurring');
    }

    // Payment Methods
    tags.add('credit-card'); // Most merchants use credit cards
    tags.add('payment-method-setup');

    if (formData.acceptACH === 'yes') {
      tags.add('ach');
      tags.add('payment-method-setup');
    }
    if (formData.paymentMethods) {
      if (formData.paymentMethods.includes('paypal')) {
        tags.add('paypal');
        tags.add('external-checkout');
      }
      if (formData.paymentMethods.includes('apple-pay')) {
        tags.add('apple-pay');
        tags.add('digital-wallet');
      }
      if (formData.paymentMethods.includes('google-pay')) {
        tags.add('google-pay');
        tags.add('digital-wallet');
      }
      if (formData.paymentMethods.includes('venmo')) {
        tags.add('venmo');
        tags.add('digital-wallet');
      }
      if (formData.paymentMethods.includes('bnpl')) {
        tags.add('bnpl');
      }
    }

    // Operations
    tags.add('payment-operations');
    tags.add('sale');
    tags.add('capture');

    if (formData.processingTimeline === 'same-day') {
      tags.add('authorization');
      tags.add('capture');
    } else if (formData.processingTimeline === 'multi-day') {
      tags.add('authorization');
      tags.add('capture');
      if (formData.needsReauth === true || formData.needsReauth === 'yes') {
        tags.add('reauthorization');
      }
    }

    tags.add('refund');

    // Always include tokenization for card storage
    tags.add('tokenization');
    tags.add('vaulting');

    // Features
    if (formData.partialCapture === true || formData.partialCapture === 'yes') {
      tags.add('partial-capture');
      tags.add('advanced');
    }
    if (formData.overCapture === true || formData.overCapture === 'yes') {
      tags.add('overcapture');
      tags.add('advanced');
    }
    if (formData.l2l3Processing === 'yes') {
      tags.add('l2-l3');
    }
    if (formData.needs3ds === 'yes') {
      tags.add('3ds');
      tags.add('3d-secure');
    }
    if (formData.fraudProtectionAdvanced === 'yes') {
      tags.add('fraud');
      tags.add('advanced');
    } else {
      tags.add('fraud');
      tags.add('avs');
      tags.add('cvv');
    }

    // ACH-specific features
    if (formData.acceptACH === 'yes') {
      tags.add('webhook');
      tags.add('real-time-status');
      if (formData.achRecurring) {
        tags.add('recurring');
      }
    }

    // Webhooks
    if (formData.realtimeUpdates === 'yes' || formData.acceptACH === 'yes') {
      tags.add('webhook');
      tags.add('notifications');
    }

    // Account Updater for recurring/subscription
    if (
      formData.businessModel === 'saas' ||
      formData.subscriptionBased === 'yes'
    ) {
      tags.add('account-updater');
    }

    // Dynamic descriptors if specified
    if (formData.customDescriptors === 'yes') {
      tags.add('descriptors');
    }

    return Array.from(tags);
  }

  /**
   * Determine integration complexity based on tags and form data
   */
  determineComplexity(tags, formData) {
    const featureTags = [
      'partial-capture',
      'overcapture',
      'l2-l3',
      '3ds',
      '3d-secure',
      'fraud',
      'account-updater',
      'webhook',
      'reauthorization',
    ];

    let score = tags.filter(tag => featureTags.includes(tag)).length;

    const paymentMethodCount = (formData.paymentMethods || []).length;
    const channelCount = (formData.processingChannels || []).length;

    score += paymentMethodCount > 2 ? 2 : paymentMethodCount > 1 ? 1 : 0;
    score += channelCount > 2 ? 2 : channelCount > 1 ? 1 : 0;
    score +=
      formData.processingTimeline === 'multi-day' && formData.needsReauth
        ? 2
        : 0;
    score += formData.acceptACH === 'yes' ? 1 : 0;
    score += formData.needs3ds === 'yes' ? 1 : 0;

    return score <= 3 ? 'simple' : score <= 7 ? 'moderate' : 'complex';
  }

  /**
   * Format section content for display
   */
  formatSectionContent(section) {
    return section.content
      .replace(/^\*\*Tags:\*\*.*$/gm, '') // Remove tag lines
      .replace(/\n{3,}/g, '\n\n') // Clean up blank lines
      .trim();
  }
}

module.exports = MarkdownParserService;
