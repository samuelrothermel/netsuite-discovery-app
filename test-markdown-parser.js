// Test script to verify markdown parsing and tag mapping

const MarkdownParserService = require('./services/markdownParserService');
const path = require('path');

// Test 1: Parse markdown file
console.log('=== TEST 1: Parse Markdown File (v2) ===');
const parser = new MarkdownParserService();
const markdownPath = path.join(
  __dirname,
  'braintree-integration-reference-v2.md'
);

try {
  const sections = parser.parseMarkdownFile(markdownPath);
  console.log(`✓ Successfully parsed ${sections.length} sections`);

  // Show first few sections
  console.log('\nFirst 5 sections:');
  sections.slice(0, 5).forEach(section => {
    console.log(`  - Section ${section.id}: ${section.title}`);
    console.log(`    Tags: ${section.tags.join(', ')}`);
  });
} catch (error) {
  console.error('✗ Error parsing markdown:', error.message);
}

// Test 2: Map form data to tags
console.log('\n=== TEST 2: Map Form Data to Tags ===');
const testFormData = {
  processingChannels: ['ecommerce', 'payment-link'],
  acceptACH: 'yes',
  paymentMethods: ['paypal', 'apple-pay', 'google-pay'],
  processingTimeline: 'multi-day',
  needsReauth: 'yes',
  partialCapture: 'yes',
  l2l3Processing: 'yes',
  needs3ds: 'yes',
  fraudProtectionAdvanced: 'yes',
  businessModel: 'b2c',
};

try {
  const tags = parser.mapFormDataToTags(testFormData);
  console.log(`✓ Generated ${tags.length} tags from form data:`);
  console.log(`  Tags: ${tags.join(', ')}`);

  const complexity = parser.determineComplexity(tags, testFormData);
  console.log(`  Complexity: ${complexity.toUpperCase()}`);
} catch (error) {
  console.error('✗ Error mapping form data:', error.message);
}

// Test 3: Filter sections by tags
console.log('\n=== TEST 3: Filter Sections by Tags ===');
try {
  const tags = parser.mapFormDataToTags(testFormData);
  const relevantSections = parser.filterSectionsByTags(tags);
  console.log(`✓ Filtered to ${relevantSections.length} relevant sections:`);

  relevantSections.forEach(section => {
    console.log(`  - Section ${section.id}: ${section.title}`);
  });
} catch (error) {
  console.error('✗ Error filtering sections:', error.message);
}

// Test 4: Simple configuration
console.log('\n=== TEST 4: Simple Configuration (Minimal Features) ===');
const simpleFormData = {
  processingChannels: ['payment-link'],
  paymentMethods: [],
  acceptACH: 'no',
  processingTimeline: 'same-day',
  partialCapture: 'no',
  l2l3Processing: 'no',
  needs3ds: 'no',
  fraudProtectionAdvanced: 'no',
  businessModel: 'b2c',
};

try {
  const tags = parser.mapFormDataToTags(simpleFormData);
  const complexity = parser.determineComplexity(tags, simpleFormData);
  const relevantSections = parser.filterSectionsByTags(tags);

  console.log(`✓ Simple configuration:`);
  console.log(`  Tags: ${tags.join(', ')}`);
  console.log(`  Complexity: ${complexity.toUpperCase()}`);
  console.log(`  Relevant sections: ${relevantSections.length}`);
} catch (error) {
  console.error('✗ Error with simple configuration:', error.message);
}

// Test 5: Complex configuration
console.log('\n=== TEST 5: Complex Configuration (All Features) ===');
const complexFormData = {
  processingChannels: ['ecommerce', 'moto', 'payment-link', 'prl'],
  acceptACH: 'yes',
  achNetworkCheck: true,
  achRecurring: true,
  paymentMethods: ['paypal', 'apple-pay', 'google-pay', 'venmo', 'bnpl'],
  processingTimeline: 'multi-day',
  needsReauth: 'yes',
  partialCapture: 'yes',
  overCapture: 'yes',
  l2l3Processing: 'yes',
  needs3ds: 'yes',
  fraudProtectionAdvanced: 'yes',
  subscriptionBased: 'yes',
  businessModel: 'saas',
  realtimeUpdates: 'yes',
};

try {
  const tags = parser.mapFormDataToTags(complexFormData);
  const complexity = parser.determineComplexity(tags, complexFormData);
  const relevantSections = parser.filterSectionsByTags(tags);

  console.log(`✓ Complex configuration:`);
  console.log(`  Tags (${tags.length}): ${tags.join(', ')}`);
  console.log(`  Complexity: ${complexity.toUpperCase()}`);
  console.log(`  Relevant sections: ${relevantSections.length}`);

  console.log('\n  Section list:');
  relevantSections.forEach(section => {
    console.log(`    ${section.id}. ${section.title}`);
  });
} catch (error) {
  console.error('✗ Error with complex configuration:', error.message);
}

console.log('\n=== All Tests Complete ===');
