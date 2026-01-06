// Debug test to see what's happening with section filtering

const MarkdownParserService = require('./services/markdownParserService');
const path = require('path');

const parser = new MarkdownParserService();
const markdownPath = path.join(
  __dirname,
  'braintree-integration-reference-v2.md'
);
parser.parseMarkdownFile(markdownPath);

// Test form data (no partial capture, no L2/L3)
const formData = {
  processingChannels: ['ecommerce', 'payment-link'],
  acceptACH: 'yes',
  achNetworkCheck: true,
  paymentMethods: ['paypal', 'google-pay'],
  processingTimeline: 'same-day',
  needsReauth: 'no',
  partialCapture: 'no',
  overCapture: 'no',
  l2l3Processing: 'no',
  needs3ds: 'yes',
  fraudProtectionAdvanced: 'no',
};

const tags = parser.mapFormDataToTags(formData);
console.log('User Tags:', tags);
console.log('');

const relevantSections = parser.filterSectionsByTags(tags);
console.log(`Relevant Sections (${relevantSections.length}):`);
relevantSections.forEach(s => {
  console.log(`  ${s.id}. ${s.title}`);
  console.log(`     Tags: ${s.tags.join(', ')}`);
  console.log('');
});

// Check sections 5 and 6 specifically
const section5 = parser.sections.find(s => s.id === 5);
const section6 = parser.sections.find(s => s.id === 6);

console.log('Section 5 (Partial Capture) tags:', section5.tags);
console.log(
  'Section 5 should match?',
  tags.some(userTag =>
    section5.tags.some(
      sectionTag => sectionTag.toLowerCase() === userTag.toLowerCase()
    )
  )
);

console.log('');
console.log('Section 6 (L2/L3) tags:', section6.tags);
console.log(
  'Section 6 should match?',
  tags.some(userTag =>
    section6.tags.some(
      sectionTag => sectionTag.toLowerCase() === userTag.toLowerCase()
    )
  )
);
