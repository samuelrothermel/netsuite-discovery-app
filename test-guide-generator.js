// Test the new simplified guide generator

const guideGenerator = require('./services/guideGenerator');

console.log('=== Testing Simplified Guide Generator ===\n');

// Sample form data
const testFormData = {
  merchantName: 'Acme Corporation',
  merchantEmail: 'admin@acme.com',
  businessModel: 'b2c',
  processingChannels: ['ecommerce', 'payment-link'],
  acceptACH: 'yes',
  achNetworkCheck: true,
  achRecurring: false,
  paymentMethods: ['paypal', 'google-pay'],
  processingTimeline: 'same-day',
  needsReauth: false,
  partialCapture: false,
  overCapture: false,
  l2l3Processing: 'no',
  needs3ds: 'yes',
  fraudProtectionAdvanced: 'no',
};

console.log('Test Configuration:');
console.log('- Merchant:', testFormData.merchantName);
console.log('- Channels:', testFormData.processingChannels.join(', '));
console.log('- Payment Methods:', testFormData.paymentMethods.join(', '));
console.log('- ACH:', testFormData.acceptACH);
console.log('- 3DS:', testFormData.needs3ds);
console.log('- Timeline:', testFormData.processingTimeline);

console.log('\n--- Generating Guide ---\n');

try {
  const result = guideGenerator.generateGuide(testFormData);

  console.log('✓ Guide generated successfully');
  console.log(`  Complexity: ${result.complexity.toUpperCase()}`);
  console.log(`  Sections: ${result.sections.length}`);
  console.log(`  Tags: ${result.tags.length}`);
  console.log(`  Content length: ${result.markdown.length} characters`);

  console.log('\n✓ Included Sections:');
  result.sections.forEach((section, index) => {
    console.log(`  ${index + 1}. ${section.title}`);
  });

  console.log('\n✓ Generated Tags:');
  console.log(`  ${result.tags.join(', ')}`);

  // Check for unwanted sections
  const hasPartialCapture =
    result.markdown.includes('SECTION 5') ||
    result.markdown.includes('MULTIPLE PARTIAL SETTLEMENT');
  const hasL2L3 =
    result.markdown.includes('SECTION 6') ||
    result.markdown.includes('L2/L3 DATA PROCESSING');

  console.log('\n✓ Section Validation:');
  console.log(
    `  - Partial Capture section: ${
      hasPartialCapture ? '✗ INCORRECTLY INCLUDED' : '✓ Correctly excluded'
    }`
  );
  console.log(
    `  - L2/L3 section: ${
      hasL2L3 ? '✗ INCORRECTLY INCLUDED' : '✓ Correctly excluded'
    }`
  );

  // Save output for review
  const fs = require('fs');
  fs.writeFileSync('./test-guide-output.md', result.markdown, 'utf8');
  console.log('\n✓ Full guide saved to: test-guide-output.md');

  // Save JSON for inspection
  fs.writeFileSync(
    './test-guide-output.json',
    JSON.stringify(result, null, 2),
    'utf8'
  );
  console.log('✓ JSON output saved to: test-guide-output.json');

  console.log('\n=== Test Complete ===');
} catch (error) {
  console.error('✗ Error generating guide:', error);
  process.exit(1);
}
