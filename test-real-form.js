// Test with actual form data format (boolean checkboxes)

const checklistService = require('./services/checklistService');

console.log('=== Testing with Actual Form Data Format ===\n');

// Sample form data matching actual form submission format
const realFormData = {
  merchantName: 'Real Form Test Inc.',
  merchantEmail: 'test@realform.com',
  businessModel: 'b2c',
  processingChannels: ['ecommerce', 'payment-link'],
  acceptACH: 'yes',
  achNetworkCheck: true, // Checkbox - comes as boolean
  achRecurring: false, // Not checked
  paymentMethods: ['paypal', 'google-pay'],
  processingTimeline: 'same-day',
  needsReauth: false, // Checkbox - not checked
  partialCapture: false, // Checkbox - not checked
  overCapture: false, // Checkbox - not checked
  neitherCapture: true, // Checkbox - checked
  l2l3Processing: 'no', // Radio/select
  needs3ds: 'yes', // Radio/select
  fraudProtectionAdvanced: 'no',
  hasExistingVault: 'no',
  wantsMigration: 'no',
};

console.log('Form Data Configuration:');
console.log('- Processing Timeline:', realFormData.processingTimeline);
console.log('- Needs Reauth:', realFormData.needsReauth, '(boolean)');
console.log('- Partial Capture:', realFormData.partialCapture, '(boolean)');
console.log('- Over Capture:', realFormData.overCapture, '(boolean)');
console.log('- L2/L3 Processing:', realFormData.l2l3Processing, '(string)');
console.log('- 3DS:', realFormData.needs3ds, '(string)');
console.log('- ACH Enabled:', realFormData.acceptACH, '(string)');
console.log('- ACH Network Check:', realFormData.achNetworkCheck, '(boolean)');

console.log('\n--- Generating Checklist ---\n');

try {
  const checklist = checklistService.generateFilteredChecklist(realFormData);

  console.log('✓ Checklist generated successfully');
  console.log(`  Length: ${checklist.length} characters`);

  // Check configuration review
  const hasReauthMention = checklist.includes('Reauthorization');
  const hasPartialCaptureMention = checklist.includes('Partial Capture');
  const hasOverCaptureMention = checklist.includes('Over-Capture');
  const hasL2L3Mention = checklist.includes('Level 2/3');
  const has3DSMention = checklist.includes('3D Secure');
  const hasACHMention = checklist.includes('ACH Processing');
  const hasNetworkCheckMention = checklist.includes('Network Check');

  console.log('\n✓ Configuration Review Validation:');
  console.log(
    `  - Reauthorization: ${
      hasReauthMention ? '✗ SHOULD NOT APPEAR' : '✓ Correctly excluded'
    }`
  );
  console.log(
    `  - Partial Capture: ${
      hasPartialCaptureMention ? '✗ SHOULD NOT APPEAR' : '✓ Correctly excluded'
    }`
  );
  console.log(
    `  - Over-Capture: ${
      hasOverCaptureMention ? '✗ SHOULD NOT APPEAR' : '✓ Correctly excluded'
    }`
  );
  console.log(
    `  - L2/L3 Processing: ${
      hasL2L3Mention ? '✗ SHOULD NOT APPEAR' : '✓ Correctly excluded'
    }`
  );
  console.log(
    `  - 3D Secure: ${
      has3DSMention ? '✓ Correctly included' : '✗ SHOULD APPEAR'
    }`
  );
  console.log(
    `  - ACH Processing: ${
      hasACHMention ? '✓ Correctly included' : '✗ SHOULD APPEAR'
    }`
  );
  console.log(
    `  - Network Check: ${
      hasNetworkCheckMention ? '✓ Correctly included' : '✗ SHOULD APPEAR'
    }`
  );

  // Extract tags
  const tagsMatch = checklist.match(/Your Configuration Tags:\*\*\s*(.+)/);
  if (tagsMatch) {
    const tagsList = tagsMatch[1].trim();
    console.log(`\n✓ Generated Tags:`);
    console.log(`  ${tagsList}`);

    // Check for incorrect tags
    const hasPartialCaptureTag = tagsList.includes('partial_capture');
    const hasOverCaptureTag = tagsList.includes('over_capture');
    const hasL2L3Tag = tagsList.includes('l2_l3_data');
    const hasReauthTag = tagsList.includes('reauthorization');

    console.log(`\n✓ Tag Validation:`);
    console.log(
      `  - partial_capture tag: ${
        hasPartialCaptureTag
          ? '✗ SHOULD NOT BE PRESENT'
          : '✓ Correctly excluded'
      }`
    );
    console.log(
      `  - over_capture tag: ${
        hasOverCaptureTag ? '✗ SHOULD NOT BE PRESENT' : '✓ Correctly excluded'
      }`
    );
    console.log(
      `  - l2_l3_data tag: ${
        hasL2L3Tag ? '✗ SHOULD NOT BE PRESENT' : '✓ Correctly excluded'
      }`
    );
    console.log(
      `  - reauthorization tag: ${
        hasReauthTag ? '✗ SHOULD NOT BE PRESENT' : '✓ Correctly excluded'
      }`
    );
  }

  // Count sections mentioning partial capture or L2/L3
  const partialCaptureMatches = (
    checklist.match(/PARTIAL SETTLEMENT|partial capture/gi) || []
  ).length;
  const l2l3Matches = (checklist.match(/L2\/L3 DATA|Level 2\/3/gi) || [])
    .length;

  console.log(`\n✓ Content Mentions:`);
  console.log(
    `  - "Partial Capture/Settlement" appears ${partialCaptureMatches} times`
  );
  console.log(`  - "L2/L3 Data" appears ${l2l3Matches} times`);

  if (partialCaptureMatches > 2) {
    console.log(
      `  ⚠️  Warning: Partial capture mentioned too many times (may be in wrong sections)`
    );
  }
  if (l2l3Matches > 2) {
    console.log(
      `  ⚠️  Warning: L2/L3 mentioned too many times (may be in wrong sections)`
    );
  }

  // Write output
  const fs = require('fs');
  fs.writeFileSync('./test-real-form-output.md', checklist, 'utf8');
  console.log(`\n✓ Full checklist written to: test-real-form-output.md`);

  console.log('\n=== Test Complete ===');
} catch (error) {
  console.error('✗ FAILED: Error generating checklist');
  console.error(error);
  process.exit(1);
}
