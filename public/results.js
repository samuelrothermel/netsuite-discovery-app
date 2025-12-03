// Results page - displays filtered checklist based on form data
document.addEventListener('DOMContentLoaded', () => {
  loadChecklist();
});

async function loadChecklist() {
  // Retrieve form data from sessionStorage
  const formDataJson = sessionStorage.getItem('checklistFormData');

  if (!formDataJson) {
    document.getElementById('checklistContent').innerHTML = `
      <div class="highlight-box">
        <p><strong>⚠️ No form data found.</strong></p>
        <p>Please complete the discovery form first.</p>
        <button onclick="window.location.href='/'" class="btn btn-primary">Go to Form</button>
      </div>
    `;
    return;
  }

  const formData = JSON.parse(formDataJson);

  // Update page header
  updatePageHeader(formData);

  // Fetch checklist data and render
  try {
    const response = await fetch('/api/checklist');
    const checklistData = await response.json();

    renderFilteredChecklist(checklistData.sections, formData);
  } catch (error) {
    console.error('Error loading checklist:', error);
    document.getElementById('checklistContent').innerHTML = `
      <div class="highlight-box">
        <p><strong>⚠️ Error loading checklist data.</strong></p>
        <p>Please try again or contact support.</p>
      </div>
    `;
  }
}

function updatePageHeader(formData) {
  const titleElement = document.getElementById('pageTitle');
  const metaElement = document.getElementById('pageMeta');

  titleElement.textContent = `Integration Summary: ${formData.merchantName}`;

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  metaElement.innerHTML = `
    <strong>Merchant:</strong> ${formData.merchantName}<br>
    <strong>Email:</strong> ${formData.merchantEmail}<br>
    <strong>Business Model:</strong> ${getBusinessModelLabel(
      formData.businessModel
    )}<br>
    <strong>Generated:</strong> ${formattedDate}
  `;
}

function getBusinessModelLabel(model) {
  const labels = {
    b2c: 'Business to Consumer (B2C)',
    b2b: 'Business to Business (B2B)',
    hybrid: 'Hybrid (B2B + B2C)',
  };
  return labels[model] || model;
}

function renderFilteredChecklist(sections, formData) {
  const contentElement = document.getElementById('checklistContent');
  let html = '';

  // Add configuration review summary
  html += generateConfigurationReview(formData);

  // Add implementation guide header
  html += '<h2>Implementation Guide</h2>';
  html +=
    '<p>The following sections provide specific implementation guidance for your selected features, including references to the Braintree Developer Documentation and NetSuite SuitePayments Admin Guide.</p>';

  // Process each section - skip Part 1 (Discovery)
  sections.forEach(section => {
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

    // Only render section if it has visible items
    if (visibleItems.length > 0) {
      html += `<h2>${section.title}</h2>`;

      if (section.description) {
        html += `<p><strong>Overview:</strong> ${section.description}</p>`;
      }

      if (section.reference) {
        html += `<p style="color: #666;">📖 <strong>Reference:</strong> ${section.reference}</p>`;
      }

      html += '<ul>';

      visibleItems.forEach(item => {
        const itemText = typeof item === 'string' ? item : item.text;
        html += `<li>${itemText}`;

        if (item.reference) {
          html += `<br><small style="color: #666;">📖 Admin Guide: ${item.reference}</small>`;
        }
        if (item.link) {
          html += `<br><small><a href="${item.link}" target="_blank">🔗 Developer Docs: View Documentation</a></small>`;
        }

        html += '</li>';
      });

      html += '</ul>';
    }
  });

  // Add next steps and resources
  html += generateNextSteps();

  contentElement.innerHTML = html;
}

function generateConfigurationReview(formData) {
  let html = '<h2>Your Selected Configuration</h2>';
  html += '<div class="highlight-box">';
  html += `<p>This integration summary has been customized for <strong>${formData.merchantName}</strong> based on your specific requirements. Below is a review of your selections followed by implementation guidance and resources.</p>`;

  // Key selections summary
  html += '<h3>Configuration Review:</h3>';
  html += '<ul style="margin: 10px 0; padding-left: 20px;">';

  // Processing timeline
  if (formData.processingTimeline === 'same-day') {
    html +=
      '<li><strong>Same-Day Capture</strong> - Transactions will be authorized and captured immediately</li>';
  } else if (formData.processingTimeline === 'multi-day') {
    html +=
      '<li><strong>Multi-Day Capture</strong> - Authorization and capture will happen on different days</li>';
    if (formData.needsReauth) {
      html +=
        '<li><strong>Reauthorization</strong> required for expired authorizations</li>';
    }
  }

  // Advanced capture features
  if (formData.partialCapture) {
    html +=
      '<li><strong>Partial Capture</strong> enabled - Can capture less than authorized amount</li>';
  }
  if (formData.overCapture) {
    html +=
      '<li><strong>Over-Capture</strong> enabled - Can capture up to 115% of authorized amount</li>';
  }

  // L2/L3 Processing
  if (formData.l2l3Processing === 'yes') {
    html +=
      '<li><strong>Level 2/3 Data Processing</strong> enabled for reduced interchange rates</li>';
  }

  // ACH
  if (formData.acceptACH === 'yes') {
    html += '<li><strong>ACH Processing</strong> enabled for bank transfers';
    const achFeatures = [];
    if (formData.achNetworkCheck) achFeatures.push('Network Check');
    if (formData.achRecurring) achFeatures.push('Recurring Payments');
    if (formData.achRealtimeStatus) achFeatures.push('Real-time Status');
    if (achFeatures.length > 0) {
      html += ` (${achFeatures.join(', ')})`;
    }
    html += '</li>';
  }

  // Payment methods
  if (formData.paymentMethods && formData.paymentMethods.length > 0) {
    const methods = [];
    if (formData.paymentMethods.includes('cards') || true)
      methods.push('Credit/Debit Cards');
    if (formData.paymentMethods.includes('paypal')) methods.push('PayPal');
    if (formData.paymentMethods.includes('bnpl'))
      methods.push('Buy Now Pay Later');
    if (formData.paymentMethods.includes('apple-pay'))
      methods.push('Apple Pay');
    if (formData.paymentMethods.includes('google-pay'))
      methods.push('Google Pay');
    if (formData.paymentMethods.includes('venmo')) methods.push('Venmo');

    if (methods.length > 0) {
      html += `<li><strong>Payment Methods:</strong> ${methods.join(
        ', '
      )}</li>`;
    }
  }

  // Processing channels
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

    if (channels.length > 0) {
      html += `<li><strong>Processing Channels:</strong> ${channels.join(
        ', '
      )}</li>`;
    }
  }

  // Fraud protection
  if (formData.fraudProtectionAdvanced === 'yes') {
    html += '<li><strong>Fraud Protection Advanced</strong> enabled</li>';
  }
  if (formData.needs3ds === 'yes') {
    html +=
      '<li><strong>3D Secure 2.0</strong> enabled for SCA compliance</li>';
  }

  // Migration
  if (
    formData.hasExistingVault === 'yes' &&
    formData.wantsMigration === 'yes'
  ) {
    html +=
      '<li><strong>Data Migration</strong> required from existing processor';
    if (formData.migrateData && formData.migrateData.length > 0) {
      html += ` (${formData.migrateData.join(', ')})`;
    }
    html += '</li>';
  }

  html += '</ul>';
  html += '</div>';

  return html;
}

function generateNextSteps() {
  let html =
    '<hr style="margin: 40px 0; border: none; border-top: 2px solid #ddd;">';

  html += '<h2>Next Steps</h2>';
  html += '<ol>';
  html +=
    '<li><strong>Review this summary</strong> with your implementation team</li>';
  html +=
    '<li><strong>Access the Braintree Control Panel</strong> to configure your payment methods</li>';
  html +=
    '<li><strong>Install the NetSuite SuiteApp</strong> (Bundle ID: 283423)</li>';
  html +=
    '<li><strong>Follow the implementation guides</strong> referenced in each section above</li>';
  html +=
    '<li><strong>Test thoroughly</strong> in the Braintree Sandbox environment</li>';
  html +=
    '<li><strong>Schedule a review</strong> with your Braintree account representative</li>';
  html += '</ol>';

  html += '<h2>Key Resources</h2>';
  html += '<ul>';
  html +=
    '<li><strong><a href="https://developer.paypal.com/braintree/" target="_blank">Braintree Developer Portal</a></strong> - Complete API documentation</li>';
  html +=
    '<li><strong><a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N2988163.html" target="_blank">NetSuite SuitePayments Documentation</a></strong> - NetSuite integration guides</li>';
  html +=
    '<li><strong><a href="https://developer.paypal.com/braintree/docs/guides/credit-cards/testing-go-live/" target="_blank">Testing & Go-Live Checklist</a></strong> - Pre-production validation</li>';
  html +=
    '<li><strong>Braintree SuitePayments Admin Guide</strong> - Version V.42, Release 1.3.51 (contact your Braintree representative)</li>';
  html += '</ul>';

  html +=
    '<hr style="margin: 40px 0; border: none; border-top: 2px solid #ddd;">';
  html += `<p style="color: #666; font-size: 0.9em; font-style: italic;">This implementation summary was generated on ${new Date().toLocaleDateString()} based on your discovery form responses. Please review with your implementation team and Braintree account representative for the most current guidance.</p>`;

  return html;
}
