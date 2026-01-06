// Integration test - Test the full flow from form data to generated checklist

const checklistService = require('./services/checklistService');

console.log('=== Integration Test: Full Checklist Generation ===\n');

// Sample form data (moderate complexity)
const sampleFormData = {
  merchantName: 'Test Merchant Inc.',
  merchantEmail: 'test@merchant.com',
  businessModel: 'b2c',
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
  hasExistingVault: 'no',
  wantsMigration: 'no',
};

console.log('Test Form Data:');
console.log('- Merchant:', sampleFormData.merchantName);
console.log(
  '- Processing Channels:',
  sampleFormData.processingChannels.join(', ')
);
console.log('- Payment Methods:', sampleFormData.paymentMethods.join(', '));
console.log('- ACH Enabled:', sampleFormData.acceptACH);
console.log('- 3DS Enabled:', sampleFormData.needs3ds);
console.log('- Processing Timeline:', sampleFormData.processingTimeline);

console.log('\n--- Generating Checklist ---\n');

try {
  const checklist = checklistService.generateFilteredChecklist(sampleFormData);

  // Verify output
  if (!checklist || checklist.length === 0) {
    console.error('✗ FAILED: Empty checklist generated');
    process.exit(1);
  }

  console.log('✓ Checklist generated successfully');
  console.log(`  Length: ${checklist.length} characters`);

  // Count sections
  const sectionMatches = checklist.match(/^## SECTION \d+:/gm);
  const sectionCount = sectionMatches ? sectionMatches.length : 0;
  console.log(`  Sections included: ${sectionCount}`);

  // Check for key indicators
  const hasConfigReview = checklist.includes('Configuration Review');
  const hasImplementationGuide = checklist.includes('Implementation Guide');
  const hasComplexity = checklist.includes('Integration Complexity:');
  const hasTags = checklist.includes('Your Configuration Tags:');
  const hasNextSteps = checklist.includes('Next Steps');

  console.log('\n✓ Content validation:');
  console.log(`  - Configuration Review: ${hasConfigReview ? '✓' : '✗'}`);
  console.log(
    `  - Implementation Guide: ${hasImplementationGuide ? '✓' : '✗'}`
  );
  console.log(`  - Complexity Indicator: ${hasComplexity ? '✓' : '✗'}`);
  console.log(`  - Tag List: ${hasTags ? '✓' : '✗'}`);
  console.log(`  - Next Steps: ${hasNextSteps ? '✓' : '✗'}`);

  // Extract complexity level
  const complexityMatch = checklist.match(
    /Integration Complexity:.*?(SIMPLE|MODERATE|COMPLEX)/
  );
  if (complexityMatch) {
    console.log(`  - Detected Complexity: ${complexityMatch[1]}`);
  }

  // Extract tag list
  const tagsMatch = checklist.match(/Your Configuration Tags:\*\*\s*(.+)/);
  if (tagsMatch) {
    const tags = tagsMatch[1].trim().split(',').length;
    console.log(`  - Number of tags: ${tags}`);
  }

  // Check for specific expected sections
  console.log('\n✓ Expected sections present:');
  const expectedSections = [
    'OVERVIEW OF THE BRAINTREE ECOSYSTEM',
    'CREDIT CARD PROCESSING',
    'ACH (AUTOMATED CLEARING HOUSE)',
    'PAYPAL AND EXTERNAL CHECKOUT',
    'DIGITAL WALLETS',
    '3D SECURE 2.0',
    'RECONCILIATION AND REPORTING',
  ];

  expectedSections.forEach(section => {
    const present = checklist.includes(section);
    console.log(`  - ${section}: ${present ? '✓' : '✗'}`);
  });

  // Check that irrelevant sections are NOT included
  console.log('\n✓ Irrelevant sections excluded:');
  const unexpectedSections = [
    'MULTIPLE PARTIAL SETTLEMENT', // Should not appear (no partial capture)
    'L2/L3 DATA PROCESSING', // Should not appear (no L2/L3)
  ];

  unexpectedSections.forEach(section => {
    const absent = !checklist.includes(section);
    console.log(
      `  - ${section}: ${
        absent ? '✓ (correctly excluded)' : '✗ (should be excluded)'
      }`
    );
  });

  // Write to file for manual review
  const fs = require('fs');
  const outputPath = './test-output-checklist.md';
  fs.writeFileSync(outputPath, checklist, 'utf8');
  console.log(`\n✓ Full checklist written to: ${outputPath}`);

  console.log('\n=== Integration Test PASSED ===');
} catch (error) {
  console.error('✗ FAILED: Error generating checklist');
  console.error(error);
  process.exit(1);
}

// Test DOCX generation
console.log('\n--- Testing DOCX Generation ---\n');

checklistService.generateFilteredChecklist(sampleFormData);

checklistService
  .generateDocx(
    sampleFormData.merchantName,
    checklistService.generateFilteredChecklist(sampleFormData)
  )
  .then(buffer => {
    if (!buffer || buffer.length === 0) {
      console.error('✗ FAILED: Empty DOCX buffer');
      process.exit(1);
    }

    console.log('✓ DOCX generated successfully');
    console.log(`  Buffer size: ${buffer.length} bytes`);

    // Write to file
    const fs = require('fs');
    const docxPath = './test-output-checklist.docx';
    fs.writeFileSync(docxPath, buffer);
    console.log(`✓ DOCX written to: ${docxPath}`);

    console.log('\n=== DOCX Test PASSED ===');
  })
  .catch(error => {
    console.error('✗ FAILED: Error generating DOCX');
    console.error(error);
    process.exit(1);
  });
