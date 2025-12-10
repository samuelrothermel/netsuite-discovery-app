# NetSuite-Braintree Integration Discovery & Checklist Generator

A Node.js Express app that:

1. Captures merchant discovery info + email addresses
2. Generates dynamically-filtered checklists based on selected features
3. Exports as DOCX files
4. Email documents to merchant + team members

---

## Installation & Setup

### 1. Prerequisites

- Node.js 16+
- npm

### 2. Clone/Create Project

```bash
mkdir braintree-discovery-app
cd braintree-discovery-app
npm init -y
```

### 3. Install Dependencies

```bash
npm install express body-parser cors dotenv nodemailer docx file-saver axios
npm install --save-dev nodemon
```

### 4. Create `.env` File

```
PORT=3000
NODE_ENV=development

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Optional: SendGrid
# SENDGRID_API_KEY=your-sendgrid-key
```

### 5. Update `package.json` scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## File Structure

```
braintree-discovery-app/
├── server.js                 # Express server + API routes
├── public/
│   ├── index.html           # Discovery form frontend
│   └── style.css            # Form styling
├── services/
│   ├── checklistService.js  # Checklist generation logic
│   ├── docxService.js       # DOCX document generation
│   └── emailService.js      # Email delivery
├── data/
│   └── checklistData.js     # Full checklist content + conditional logic
├── .env                     # Environment variables
└── package.json
```

---

## Code Files

### File 1: `server.js`

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const checklistService = require('./services/checklistService');
const emailService = require('./services/emailService');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Routes

// GET: Serve discovery form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// POST: Generate and email checklist
app.post('/api/generate-checklist', async (req, res) => {
  try {
    const formData = req.body;

    // Validate required fields
    if (!formData.merchantName || !formData.merchantEmail) {
      return res.status(400).json({
        error: 'Merchant name and email required',
      });
    }

    // Generate checklist data (filtered)
    const checklistHtml = checklistService.generateFilteredChecklist(formData);

    // Generate DOCX
    const docxBuffer = await checklistService.generateDocx(
      formData.merchantName,
      checklistHtml
    );

    // Prepare email recipients
    const recipients = [formData.merchantEmail];
    if (formData.teamEmails && formData.teamEmails.length > 0) {
      recipients.push(...formData.teamEmails);
    }

    // Send emails
    const emailResult = await emailService.sendChecklistEmail(
      recipients,
      formData.merchantName,
      docxBuffer
    );

    res.json({
      success: true,
      message: `Checklist generated and sent to ${recipients.length} recipient(s)`,
      recipients: recipients,
      filename: `Checklist-${formData.merchantName.replace(/\s+/g, '-')}.docx`,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate checklist',
    });
  }
});

// POST: Download checklist (no email)
app.post('/api/download-checklist', async (req, res) => {
  try {
    const formData = req.body;

    if (!formData.merchantName) {
      return res.status(400).json({ error: 'Merchant name required' });
    }

    // Generate checklist
    const checklistHtml = checklistService.generateFilteredChecklist(formData);

    // Generate DOCX
    const docxBuffer = await checklistService.generateDocx(
      formData.merchantName,
      checklistHtml
    );

    // Send file
    const filename = `Checklist-${formData.merchantName.replace(
      /\s+/g,
      '-'
    )}.docx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Open http://localhost:${PORT} in your browser`);
});
```

---

### File 2: `services/checklistService.js`

```javascript
const checklistData = require('../data/checklistData');
const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} = require('docx');

class ChecklistService {
  generateFilteredChecklist(formData) {
    let html = `
      <h1>NetSuite-Braintree Integration Checklist</h1>
      <p><strong>Merchant:</strong> ${formData.merchantName}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      <hr>
    `;

    // Filter sections based on form data
    const sections = this.filterSections(checklistData.sections, formData);

    sections.forEach(section => {
      html += `<h2>${section.title}</h2>`;

      if (section.items) {
        section.items.forEach(item => {
          html += `
            <div style="margin: 10px 0; padding-left: 20px;">
              ☐ ${item.text}
              ${
                item.reference
                  ? `<br><em>Reference: ${item.reference}</em>`
                  : ''
              }
            </div>
          `;
        });
      }

      html += '<br>';
    });

    return html;
  }

  filterSections(sections, formData) {
    const filtered = [];

    sections.forEach(section => {
      // Skip entire section if not applicable
      if (
        section.visibleIf &&
        !this.evaluateCondition(section.visibleIf, formData)
      ) {
        return;
      }

      const filteredSection = { ...section };

      // Filter items within section
      if (section.items) {
        filteredSection.items = section.items.filter(item => {
          if (!item.visibleIf) return true;
          return this.evaluateCondition(item.visibleIf, formData);
        });
      }

      filtered.push(filteredSection);
    });

    return filtered;
  }

  evaluateCondition(condition, formData) {
    if (typeof condition === 'function') {
      return condition(formData);
    }
    return true;
  }

  async generateDocx(merchantName, checklistHtml) {
    // Parse HTML and convert to DOCX structure
    const sections = this.parseHtmlToDocxSections(checklistHtml, merchantName);

    const doc = new Document({
      sections: [
        {
          children: sections,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

  parseHtmlToDocxSections(html, merchantName) {
    const children = [];

    // Title
    children.push(
      new Paragraph({
        text: 'NetSuite-Braintree Integration Checklist',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      })
    );

    // Metadata
    children.push(
      new Paragraph({
        text: `Merchant: ${merchantName}`,
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        text: `Generated: ${new Date().toLocaleDateString()}`,
        spacing: { after: 400 },
      })
    );

    // Parse sections from HTML
    const sectionRegex = /<h2>(.*?)<\/h2>([\s\S]*?)(?=<h2>|$)/g;
    let match;

    while ((match = sectionRegex.exec(html)) !== null) {
      const sectionTitle = match[1];
      const sectionContent = match[2];

      // Section heading
      children.push(
        new Paragraph({
          text: sectionTitle,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      // Parse items
      const itemRegex = /☐\s+(.*?)(?=<\/div>)/g;
      let itemMatch;

      while ((itemMatch = itemRegex.exec(sectionContent)) !== null) {
        const itemText = itemMatch[1]
          .replace(/<br>/g, '\n')
          .replace(/<.*?>/g, '');

        children.push(
          new Paragraph({
            text: `☐ ${itemText}`,
            spacing: { after: 100 },
            indent: { left: 400 },
          })
        );
      }
    }

    // Add reference section
    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 200 },
      })
    );

    children.push(
      new Paragraph({
        text: 'Documentation References',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );

    children.push(
      new Paragraph({
        text: 'Braintree SuitePayments SuiteApp Admin and End User Guide - Version V.42, Release 1.3.51 (October 24, 2025)',
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        text: 'Braintree Developer Portal: https://developer.paypal.com/braintree/',
        spacing: { after: 100 },
      })
    );

    return children;
  }
}

module.exports = new ChecklistService();
```

---

### File 3: `services/emailService.js`

```javascript
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendChecklistEmail(recipients, merchantName, docxBuffer) {
    const filename = `Checklist-${merchantName.replace(/\s+/g, '-')}.docx`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipients.join(','),
      subject: `NetSuite-Braintree Integration Checklist - ${merchantName}`,
      html: `
        <h2>Integration Discovery Checklist</h2>
        <p>Hi,</p>
        <p>Please find attached the customized NetSuite-Braintree Integration Checklist for <strong>${merchantName}</strong>.</p>
        <p>This checklist has been tailored based on the merchant's specific processing requirements and payment methods.</p>
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Review all checked items with the merchant</li>
          <li>Reference the Admin Guide sections for detailed configuration instructions</li>
          <li>Use Braintree Developer links for implementation guidance</li>
          <li>Complete sandbox testing before production go-live</li>
        </ul>
        <p>Questions? Contact Braintree Support at https://developer.paypal.com/braintree/</p>
        <p>Best regards,<br>Integration Team</p>
      `,
      attachments: [
        {
          filename: filename,
          content: docxBuffer,
          contentType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ],
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✉️  Email sent to ${recipients.join(', ')}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
```

---

### File 4: `data/checklistData.js`

```javascript
module.exports = {
  sections: [
    // PART 1: DISCOVERY
    {
      title: 'Part 1: Pre-Integration Discovery',
      items: [
        { text: 'Confirm business model: B2C, B2B, B2B2C, or hybrid' },
        { text: 'Estimated monthly transaction volume captured' },
        { text: 'Average transaction value documented' },
        { text: 'Peak processing times identified' },
        { text: 'Geographic markets served documented' },
        { text: 'Current payment processor documented' },
        { text: 'Processing duration between auth and capture identified' },
        { text: 'Customer bases to migrate identified' },
        { text: 'Historical chargeback/fraud rates documented' },
        { text: 'Existing tokenization/vaulting assessed' },
      ],
    },

    // PART 2A: AUTH & CAPTURE
    {
      title: 'Part 2A: Authorization & Capture Strategy',
      items: [
        {
          text: 'Same-day capture (e-commerce typical)',
          visibleIf: data => data.processingTimeline === 'same-day',
        },
        {
          text: 'Multi-day capture workflow identified',
          visibleIf: data => data.processingTimeline === 'multi-day',
        },
        {
          text: 'Reauthorization setup evaluated',
          visibleIf: data => data.processingTimeline === 'multi-day',
          reference: 'Admin Guide, Section 2.18 (p. 111)',
        },
        {
          text: 'Tokenization/vaulting needed for extended auth-to-capture gap',
          visibleIf: data => data.processingTimeline === 'multi-day',
        },
      ],
    },

    // PART 2B: PARTIAL & OVER-CAPTURE
    {
      title: 'Part 2B: Partial & Over-Capture',
      visibleIf: data => data.partialCapture || data.overCapture,
      items: [
        {
          text: 'Partial Capture enabled and PayPal team approval obtained',
          visibleIf: data => data.partialCapture,
          reference: 'Admin Guide, Section 2.19 (p. 116)',
        },
        {
          text: 'Over-Capture enabled and PayPal team approval obtained',
          visibleIf: data => data.overCapture,
          reference: 'Admin Guide, Section 2.19 (p. 116)',
        },
      ],
    },

    // PART 2C: L2/L3
    {
      title: 'Part 2C: Level 2/3 Data Processing',
      visibleIf: data => data.l2l3Processing,
      items: [
        { text: 'L2/L3 Processing enabled on payment methods' },
        {
          text: '"Requires Line-Level Data" checkbox enabled on payment methods',
        },
        { text: 'Order/PO Number data available for all transactions' },
        {
          text: 'Line-item details (description, quantity, unit price) available',
        },
        { text: 'Tax amount data available' },
        { text: 'Shipping amount data available' },
        {
          text: 'Discount amounts data available',
          reference: 'Admin Guide, Section 5.8 (p. 312)',
        },
      ],
    },

    // PART 2D: ACH
    {
      title: 'Part 2D: ACH (Bank Transfer) Processing',
      visibleIf: data => data.acceptACH,
      items: [
        { text: 'ACH Payment Method created and configured' },
        { text: 'ACH processing enabled on Payment Processing Profile' },
        {
          text: 'Network Check configured (verify account ownership upfront)',
          visibleIf: data => data.achNetworkCheck,
        },
        {
          text: 'Recurring ACH configured',
          visibleIf: data => data.achRecurring,
        },
        {
          text: 'Real-time ACH status webhooks configured',
          visibleIf: data => data.achRealtimeStatus,
          reference: 'Admin Guide, Section 2.3 (p. 23)',
        },
        { text: 'ACH settlement timeline communicated to merchant (1-2 days)' },
      ],
    },

    // PART 3: TOKENIZATION
    {
      title: 'Part 3: Tokenization & Vaulting Strategy',
      items: [
        { text: 'Payment Card Tokenization enabled' },
        { text: '"Replace Payment Card by Token" checkbox enabled on PPP' },
        { text: 'Payment Card Token payment method created' },
        { text: 'Token Retrieval method created (if external e-commerce)' },
        {
          text: 'PayPal/Alternate Payment Vaulting enabled',
          visibleIf: data =>
            data.paymentMethods &&
            (data.paymentMethods.includes('paypal') ||
              data.paymentMethods.includes('venmo')),
        },
        { text: 'General Token payment method created' },
      ],
    },

    // PART 4: FRAUD
    {
      title: 'Part 4: Fraud Management & Security',
      items: [
        { text: 'Basic Fraud Management (AVS/CVV) enabled' },
        {
          text: 'Fraud Protection Advanced enabled and configured',
          visibleIf: data => data.fraudProtectionAdvanced,
          reference: 'Admin Guide, Section 2.17 (p. 105)',
        },
        {
          text: '3D Secure 2.0 enabled',
          visibleIf: data => data.needs3ds,
          reference: 'Admin Guide, Section 2.6 (p. 39)',
        },
        { text: 'AVS/CVV rules configured appropriately' },
        { text: 'Manual override capability configured for exceptions' },
      ],
    },

    // PART 5: PROCESSING CHANNELS
    {
      title: 'Part 5: Processing Location & Channels',
      items: [
        {
          text: 'eCommerce/SuiteCommerce Advanced configured',
          visibleIf: data =>
            data.processingChannels &&
            data.processingChannels.includes('ecommerce'),
        },
        {
          text: 'NetSuite Back Office MOTO configured',
          visibleIf: data =>
            data.processingChannels && data.processingChannels.includes('moto'),
        },
        {
          text: 'Payment Link configured',
          visibleIf: data =>
            data.processingChannels &&
            data.processingChannels.includes('payment-link'),
        },
        {
          text: 'Braintree Payment Request Link configured',
          visibleIf: data =>
            data.processingChannels && data.processingChannels.includes('prl'),
        },
      ],
    },

    // PART 6: NETSUITE TRANSACTIONS
    {
      title: 'Part 6: NetSuite Transaction Support Verification',
      items: [
        { text: 'Sales Order payment workflows tested' },
        { text: 'Cash Sale workflows tested' },
        { text: 'Customer Payment workflows tested' },
        { text: 'Invoice Payment Link workflows tested' },
        { text: 'Customer Deposit workflows tested' },
      ],
    },

    // PART 7: SETUP & CONFIG
    {
      title: 'Part 7: Account Setup & Configuration',
      items: [
        {
          text: 'Braintree Sandbox Account created',
          reference: 'Admin Guide, Section 2.2 (p. 9)',
        },
        {
          text: 'Merchant Account IDs created for each subsidiary/currency combination',
        },
        { text: 'API Keys (Public/Private) generated' },
        { text: 'Tokenization Key generated' },
        { text: 'PayPal Developer Account linked' },
        {
          text: 'Braintree SuiteApp installed',
          reference: 'Admin Guide, Section 2.3 (p. 19)',
        },
        {
          text: 'Chargeback Workflow Bundle installed',
          reference: 'Admin Guide, Section 2.3 (p. 18)',
        },
        { text: 'Credit Card Payments feature enabled' },
        { text: 'Braintree plug-in activated' },
        {
          text: 'Payment Processing Profile created and configured',
          reference: 'Admin Guide, Section 2.3 (p. 21)',
        },
        { text: 'Payment Methods created and linked' },
        {
          text: 'Webhooks configured',
          reference: 'Admin Guide, Section 2.3 (p. 30)',
        },
      ],
    },

    // PART 8: SANDBOX TESTING
    {
      title: 'Part 8: Sandbox Testing',
      items: [
        { text: 'Credit Card Authorization tested' },
        { text: 'Credit Card Capture tested' },
        { text: 'Credit Card Sale (Auth+Capture) tested' },
        { text: 'Credit Card Void Authorization tested' },
        { text: 'Credit Card Refund tested' },
        { text: 'Payment Card Tokenization tested' },
        {
          text: 'ACH Authorization tested',
          visibleIf: data => data.acceptACH,
        },
        {
          text: 'ACH Capture tested',
          visibleIf: data => data.acceptACH,
        },
        {
          text: 'PayPal Authorization tested',
          visibleIf: data =>
            data.paymentMethods && data.paymentMethods.includes('paypal'),
        },
        {
          text: 'Partial Capture tested',
          visibleIf: data => data.partialCapture,
        },
        {
          text: 'Over-Capture tested',
          visibleIf: data => data.overCapture,
        },
        {
          text: 'L2/L3 Data tested',
          visibleIf: data => data.l2l3Processing,
        },
        { text: 'Payment Event records verified' },
        {
          text: 'Transaction failure scenarios tested (Gateway Rejection, Declines)',
        },
      ],
    },

    // PART 9: GO-LIVE
    {
      title: 'Part 9: Go-Live & Production Readiness',
      items: [
        { text: 'Braintree Production Account approved by PayPal' },
        { text: 'Production Merchant ID and MAIDs obtained' },
        { text: 'Production Payment Processing Profile created' },
        { text: 'Test Mode checkbox disabled on Production PPP' },
        { text: 'Webhooks re-configured for Production' },
        { text: 'User training completed' },
        { text: 'Runbooks created for common scenarios' },
        { text: 'Support escalation path defined' },
        { text: 'Daily transaction review process established' },
        { text: 'Weekly reconciliation process established' },
        { text: 'Fraud management tuning plan created' },
      ],
    },
  ],
};
```

---

### File 5: `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NetSuite-Braintree Integration Discovery</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="container">
      <div id="form-container" class="form-wrapper">
        <div class="header">
          <h1>NetSuite-Braintree Integration</h1>
          <h2>Discovery & Checklist Generator</h2>
          <p>
            Complete this form to generate a customized integration checklist
          </p>
        </div>

        <form id="discoveryForm">
          <!-- Progress Bar -->
          <div class="progress-container">
            <div class="progress-bar">
              <div id="progressFill" class="progress-fill"></div>
            </div>
            <p id="progressText" class="progress-text">Step 1 of 7</p>
          </div>

          <!-- SECTION 1: Merchant Info & Emails -->
          <div class="section active" data-section="1">
            <h3>1. Merchant & Team Information</h3>

            <div class="form-group">
              <label for="merchantName">Merchant/Company Name *</label>
              <input
                type="text"
                id="merchantName"
                name="merchantName"
                required
                placeholder="e.g., Acme Corp"
              />
            </div>

            <div class="form-group">
              <label for="merchantEmail">Merchant Email *</label>
              <input
                type="email"
                id="merchantEmail"
                name="merchantEmail"
                required
                placeholder="merchant@company.com"
              />
            </div>

            <div class="form-group">
              <label for="teamEmails"
                >Team Member Emails (comma-separated)</label
              >
              <textarea
                id="teamEmails"
                name="teamEmails"
                placeholder="john@company.com, jane@company.com"
                rows="3"
              ></textarea>
              <small>Leave blank if no additional recipients</small>
            </div>

            <div class="form-group">
              <label for="businessModel">Business Model *</label>
              <select id="businessModel" name="businessModel" required>
                <option value="">Select...</option>
                <option value="b2c">B2C (Direct to consumers)</option>
                <option value="b2b">B2B (Business to business)</option>
                <option value="hybrid">Hybrid (Multiple models)</option>
              </select>
            </div>
          </div>

          <!-- SECTION 2: Processing Timeline -->
          <div class="section" data-section="2">
            <h3>2. Processing Timeline</h3>

            <div class="form-group">
              <label>Typical Time Between Authorization & Capture *</label>
              <div class="radio-group">
                <label>
                  <input
                    type="radio"
                    name="processingTimeline"
                    value="same-day"
                    required
                  />
                  Same-day (e-commerce typical)
                </label>
                <label>
                  <input
                    type="radio"
                    name="processingTimeline"
                    value="multi-day"
                  />
                  Multi-day (MOTO, B2B typical)
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" id="needsReauth" name="needsReauth" />
                Will you need reauthorization for expired auths?
              </label>
              <small>Check if authorization-to-capture gap >7 days</small>
            </div>
          </div>

          <!-- SECTION 3: Advanced Capture -->
          <div class="section" data-section="3">
            <h3>3. Partial & Over-Capture</h3>

            <div class="form-group">
              <label>
                <input
                  type="checkbox"
                  id="partialCapture"
                  name="partialCapture"
                />
                Need Partial Capture? (Capture LESS than authorized)
              </label>
              <small
                >Split shipments, drop-shipping. Requires PayPal
                approval.</small
              >
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" id="overCapture" name="overCapture" />
                Need Over-Capture? (Capture MORE than authorized)
              </label>
              <small
                >Added shipping, taxes, fees. Requires PayPal approval.
                <strong>Note:</strong> Over-Capture only applies to Visa and
                Mastercard brands, and your MCC (Merchant Category Code) must be
                eligible.</small
              >
              <small style="display: block; margin-top: 5px;"
                ><strong>How to perform in NetSuite:</strong> Create Sales Order
                with initial authorization → Add discount/fee item
                post-authorization → Bill → Capture over-authorized
                amount</small
              >
            </div>
          </div>

          <!-- SECTION 4: L2/L3 -->
          <div class="section" data-section="4">
            <h3>4. Level 2/3 Data Processing</h3>

            <div class="form-group">
              <label>Do you sell to businesses (B2B)? *</label>
              <div class="radio-group">
                <label>
                  <input
                    type="radio"
                    name="l2l3Processing"
                    value="yes"
                    required
                  />
                  Yes - primarily B2B
                </label>
                <label>
                  <input type="radio" name="l2l3Processing" value="partial" />
                  Partial - some B2B, some B2C
                </label>
                <label>
                  <input type="radio" name="l2l3Processing" value="no" />
                  No - B2C only
                </label>
              </div>
              <small>L2/L3 can reduce interchange rates by 0.25%-1.5%</small>
            </div>

            <div id="l2l3DataGroup" class="form-group" style="display: none;">
              <label>If Yes: Do you have this data available?</label>
              <div class="checkbox-group">
                <label
                  ><input type="checkbox" name="l2l3Data" value="po" /> Purchase
                  Order / PO numbers</label
                >
                <label
                  ><input type="checkbox" name="l2l3Data" value="lineItems" />
                  Line-item details (description, qty, unit price)</label
                >
                <label
                  ><input type="checkbox" name="l2l3Data" value="tax" /> Tax
                  amount</label
                >
                <label
                  ><input type="checkbox" name="l2l3Data" value="shipping" />
                  Shipping amount</label
                >
                <label
                  ><input type="checkbox" name="l2l3Data" value="discount" />
                  Discount amounts</label
                >
              </div>
            </div>
          </div>

          <!-- SECTION 5: ACH & Payment Methods -->
          <div class="section" data-section="5">
            <h3>5. ACH & Alternative Payments</h3>

            <div class="form-group">
              <label>Accept ACH (Bank Transfer) Payments? *</label>
              <div class="radio-group">
                <label>
                  <input type="radio" name="acceptACH" value="yes" required />
                  Yes
                </label>
                <label>
                  <input type="radio" name="acceptACH" value="no" />
                  No
                </label>
              </div>
            </div>

            <div id="achConfigGroup" style="display: none;">
              <div class="form-group">
                <label>
                  <input type="checkbox" name="achNetworkCheck" />
                  Network Check (verify account ownership upfront)
                </label>
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" name="achRecurring" />
                  Recurring ACH payments (subscriptions)
                </label>
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" name="achRealtimeStatus" />
                  Real-time ACH status updates (webhooks)
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Which Payment Methods Do You Need? *</label>
              <div class="checkbox-group">
                <label
                  ><input
                    type="checkbox"
                    name="paymentMethods"
                    value="cards"
                    checked
                    disabled
                  />
                  Credit/Debit Cards (always included)</label
                >
                <label
                  ><input
                    type="checkbox"
                    name="paymentMethods"
                    value="paypal"
                  />
                  PayPal</label
                >
                <label
                  ><input type="checkbox" name="paymentMethods" value="bnpl" />
                  PayPal Buy Now Pay Later</label
                >
                <label
                  ><input
                    type="checkbox"
                    name="paymentMethods"
                    value="apple-pay"
                  />
                  Apple Pay</label
                >
                <label
                  ><input
                    type="checkbox"
                    name="paymentMethods"
                    value="google-pay"
                  />
                  Google Pay</label
                >
                <label
                  ><input type="checkbox" name="paymentMethods" value="venmo" />
                  Venmo (US only)</label
                >
              </div>
            </div>
          </div>

          <!-- SECTION 6: Processing Channels -->
          <div class="section" data-section="6">
            <h3>6. Payment Processing Channels</h3>

            <div class="form-group">
              <label>Where Will You Process Payments? *</label>
              <div class="checkbox-group">
                <label
                  ><input
                    type="checkbox"
                    name="processingChannels"
                    value="ecommerce"
                    required
                  />
                  eCommerce/SuiteCommerce Advanced</label
                >
                <label
                  ><input
                    type="checkbox"
                    name="processingChannels"
                    value="moto"
                  />
                  NetSuite Back Office MOTO</label
                >
                <label
                  ><input
                    type="checkbox"
                    name="processingChannels"
                    value="payment-link"
                  />
                  Payment Link (email invoices)</label
                >
                <label
                  ><input
                    type="checkbox"
                    name="processingChannels"
                    value="prl"
                  />
                  Braintree Payment Request Link</label
                >
              </div>
            </div>
          </div>

          <!-- SECTION 7: Fraud & Security -->
          <div class="section" data-section="7">
            <h3>7. Fraud Management & Security</h3>

            <div class="form-group">
              <label for="fraudRate"
                >Typical Chargeback/Fraud Rate (optional)</label
              >
              <input
                type="text"
                id="fraudRate"
                name="fraudRate"
                placeholder="e.g., 0.2%, Unknown"
              />
              <small>If >0.5%, Fraud Protection Advanced is recommended</small>
            </div>

            <div class="form-group">
              <label>Fraud Protection Advanced? *</label>
              <div class="radio-group">
                <label>
                  <input
                    type="radio"
                    name="fraudProtectionAdvanced"
                    value="yes"
                    required
                  />
                  Yes - higher risk or high volume
                </label>
                <label>
                  <input
                    type="radio"
                    name="fraudProtectionAdvanced"
                    value="no"
                  />
                  No - basic AVS/CVV sufficient
                </label>
                <label>
                  <input
                    type="radio"
                    name="fraudProtectionAdvanced"
                    value="unsure"
                  />
                  Not sure
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Need 3D Secure 2.0 (SCA)? *</label>
              <div class="radio-group">
                <label>
                  <input type="radio" name="needs3ds" value="yes" required />
                  Yes - EU/UK or high-value CNPS
                </label>
                <label>
                  <input type="radio" name="needs3ds" value="no" />
                  No - US/low-risk only
                </label>
              </div>
            </div>
          </div>

          <!-- Navigation & Actions -->
          <div class="form-actions">
            <button
              type="button"
              id="backBtn"
              class="btn btn-secondary"
              style="display: none;"
            >
              ← Back
            </button>
            <button type="button" id="nextBtn" class="btn btn-primary">
              Next →
            </button>
            <button
              type="button"
              id="downloadBtn"
              class="btn btn-success"
              style="display: none;"
            >
              ⬇️ Download Checklist
            </button>
            <button
              type="button"
              id="emailBtn"
              class="btn btn-success"
              style="display: none;"
            >
              ✉️ Email Checklist
            </button>
            <button
              type="button"
              id="resetBtn"
              class="btn btn-secondary"
              style="display: none;"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <!-- Loading Indicator -->
      <div id="loadingIndicator" class="loading" style="display: none;">
        <div class="spinner"></div>
        <p>Generating checklist...</p>
      </div>

      <!-- Success Message -->
      <div id="successMessage" class="success-message" style="display: none;">
        <h3>✅ Success!</h3>
        <p id="successText"></p>
        <button
          type="button"
          class="btn btn-primary"
          onclick="location.reload()"
        >
          Start Over
        </button>
      </div>
    </div>

    <script src="app.js"></script>
  </body>
</html>
```

---

### File 6: `public/style.css`

```css
:root {
  --color-primary: #32b8c6;
  --color-primary-hover: #1d7480;
  --color-secondary: #5e5240;
  --color-success: #22c55e;
  --color-error: #ef4444;
  --color-bg: #fcfcf9;
  --color-surface: #ffffff;
  --color-text: #134252;
  --color-text-secondary: #626c7c;
  --color-border: rgba(94, 82, 64, 0.2);
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --spacing-8: 8px;
  --spacing-16: 16px;
  --spacing-24: 24px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: var(--spacing-16);
  font-family: var(--font-family);
  background: linear-gradient(135deg, var(--color-bg) 0%, #f0f0f0 100%);
  color: var(--color-text);
  line-height: 1.6;
}

.container {
  max-width: 700px;
  margin: 0 auto;
}

.form-wrapper {
  background: var(--color-surface);
  border-radius: 12px;
  padding: var(--spacing-24);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: var(--spacing-24);
}

.header h1 {
  margin: 0 0 var(--spacing-8);
  font-size: 28px;
  color: var(--color-primary);
}

.header h2 {
  margin: 0 0 var(--spacing-8);
  font-size: 18px;
  color: var(--color-secondary);
  font-weight: 500;
}

.header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* Progress Bar */
.progress-container {
  margin-bottom: var(--spacing-24);
}

.progress-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--spacing-8);
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
  width: 14%;
}

.progress-text {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* Sections */
.section {
  display: none;
  animation: fadeIn 0.3s ease;
}

.section.active {
  display: block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section h3 {
  margin: 0 0 var(--spacing-16);
  font-size: 18px;
  color: var(--color-text);
}

/* Form Groups */
.form-group {
  margin-bottom: var(--spacing-16);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-8);
  font-weight: 500;
  font-size: 14px;
  color: var(--color-text);
}

.form-group input[type='text'],
.form-group input[type='email'],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px var(--spacing-8);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--color-text);
  background: var(--color-bg);
  transition: border-color 0.2s;
}

.form-group input[type='text']:focus,
.form-group input[type='email']:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(50, 184, 198, 0.1);
}

.form-group small {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* Radio & Checkbox Groups */
.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.radio-group label,
.checkbox-group label {
  display: flex;
  align-items: center;
  margin-bottom: 0;
  font-weight: 400;
  cursor: pointer;
}

.radio-group input[type='radio'],
.checkbox-group input[type='checkbox'] {
  margin-right: var(--spacing-8);
  cursor: pointer;
  accent-color: var(--color-primary);
}

/* Buttons */
.form-actions {
  display: flex;
  gap: var(--spacing-8);
  margin-top: var(--spacing-24);
  justify-content: space-between;
  flex-wrap: wrap;
}

.btn {
  padding: 10px var(--spacing-16);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 120px;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e5e5;
  color: var(--color-text);
}

.btn-secondary:hover {
  background: #d5d5d5;
}

.btn-success {
  background: var(--color-success);
  color: white;
}

.btn-success:hover {
  background: #16a34a;
}

/* Loading Indicator */
.loading {
  text-align: center;
  padding: var(--spacing-24);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-16);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Success Message */
.success-message {
  background: var(--color-success);
  color: white;
  padding: var(--spacing-24);
  border-radius: 12px;
  text-align: center;
}

.success-message h3 {
  margin: 0 0 var(--spacing-8);
  font-size: 18px;
}

.success-message p {
  margin: 0 0 var(--spacing-16);
}

/* Responsive */
@media (max-width: 600px) {
  .container {
    padding: var(--spacing-8);
  }

  .form-wrapper {
    padding: var(--spacing-16);
  }

  .header h1 {
    font-size: 22px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    min-width: unset;
  }
}
```

---

### File 7: `public/app.js`

```javascript
// State Management
const state = {
  currentSection: 1,
  totalSections: 7,
  formData: {},
};

// DOM Elements
const form = document.getElementById('discoveryForm');
const sections = document.querySelectorAll('.section');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const downloadBtn = document.getElementById('downloadBtn');
const emailBtn = document.getElementById('emailBtn');
const resetBtn = document.getElementById('resetBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const successMessage = document.getElementById('successMessage');
const formContainer = document.getElementById('form-container');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  attachEventListeners();
  setupConditionalFields();
  updateProgress();
});

// Event Listeners
function attachEventListeners() {
  backBtn.addEventListener('click', goBack);
  nextBtn.addEventListener('click', goNext);
  downloadBtn.addEventListener('click', downloadChecklist);
  emailBtn.addEventListener('click', emailChecklist);
  resetBtn.addEventListener('click', resetForm);

  // Listen for field changes to update conditional visibility
  document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('change', setupConditionalFields);
  });
}

// Conditional Field Visibility
function setupConditionalFields() {
  const formData = getFormData();

  // L2/L3 Data Group
  const l2l3Group = document.getElementById('l2l3DataGroup');
  if (
    formData.l2l3Processing === 'yes' ||
    formData.l2l3Processing === 'partial'
  ) {
    l2l3Group.style.display = 'block';
  } else {
    l2l3Group.style.display = 'none';
  }

  // ACH Config Group
  const achGroup = document.getElementById('achConfigGroup');
  if (formData.acceptACH === 'yes') {
    achGroup.style.display = 'block';
  } else {
    achGroup.style.display = 'none';
  }
}

// Get Form Data
function getFormData() {
  const formData = new FormData(form);
  const data = {
    merchantName: formData.get('merchantName'),
    merchantEmail: formData.get('merchantEmail'),
    teamEmails: formData.get('teamEmails')
      ? formData
          .get('teamEmails')
          .split(',')
          .map(e => e.trim())
          .filter(e => e)
      : [],
    businessModel: formData.get('businessModel'),
    processingTimeline: formData.get('processingTimeline'),
    needsReauth: formData.get('needsReauth') === 'on',
    partialCapture: formData.get('partialCapture') === 'on',
    overCapture: formData.get('overCapture') === 'on',
    l2l3Processing: formData.get('l2l3Processing'),
    l2l3Data: formData.getAll('l2l3Data'),
    acceptACH: formData.get('acceptACH'),
    achNetworkCheck: formData.get('achNetworkCheck') === 'on',
    achRecurring: formData.get('achRecurring') === 'on',
    achRealtimeStatus: formData.get('achRealtimeStatus') === 'on',
    paymentMethods: formData.getAll('paymentMethods'),
    processingChannels: formData.getAll('processingChannels'),
    fraudRate: formData.get('fraudRate'),
    fraudProtectionAdvanced: formData.get('fraudProtectionAdvanced'),
    needs3ds: formData.get('needs3ds'),
  };

  state.formData = data;
  return data;
}

// Validation
function validateSection(sectionNumber) {
  const section = document.querySelector(
    `.section[data-section="${sectionNumber}"]`
  );
  const requiredFields = section.querySelectorAll('[required]');

  let isValid = true;
  requiredFields.forEach(field => {
    if (field.type === 'radio') {
      const radioGroup = document.querySelectorAll(
        `input[name="${field.name}"]`
      );
      const isChecked = Array.from(radioGroup).some(r => r.checked);
      if (!isChecked) {
        field.classList.add('error');
        isValid = false;
      } else {
        field.classList.remove('error');
      }
    } else if (
      field.type === 'checkbox' &&
      field.name === 'processingChannels'
    ) {
      const checkboxes = document.querySelectorAll(
        `input[name="${field.name}"]:not(:disabled)`
      );
      const isChecked = Array.from(checkboxes).some(c => c.checked);
      if (!isChecked) {
        field.classList.add('error');
        isValid = false;
      } else {
        field.classList.remove('error');
      }
    } else if (field.value.trim() === '') {
      field.classList.add('error');
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });

  return isValid;
}

// Navigation
function updateProgress() {
  const progress = (state.currentSection / state.totalSections) * 100;
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Step ${state.currentSection} of ${state.totalSections}`;

  backBtn.style.display = state.currentSection === 1 ? 'none' : 'block';

  if (state.currentSection === state.totalSections) {
    nextBtn.style.display = 'none';
    downloadBtn.style.display = 'inline-block';
    emailBtn.style.display = 'inline-block';
    resetBtn.style.display = 'inline-block';
  } else {
    nextBtn.style.display = 'inline-block';
    downloadBtn.style.display = 'none';
    emailBtn.style.display = 'none';
    resetBtn.style.display = 'none';
  }
}

function showSection(sectionNumber) {
  sections.forEach(section => {
    section.classList.remove('active');
  });

  const targetSection = document.querySelector(
    `.section[data-section="${sectionNumber}"]`
  );
  if (targetSection) {
    targetSection.classList.add('active');
  }

  state.currentSection = sectionNumber;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goNext() {
  if (validateSection(state.currentSection)) {
    getFormData(); // Update form data
    if (state.currentSection < state.totalSections) {
      showSection(state.currentSection + 1);
    }
  } else {
    alert('Please fill in all required fields');
  }
}

function goBack() {
  getFormData();
  if (state.currentSection > 1) {
    showSection(state.currentSection - 1);
  }
}

function resetForm() {
  if (confirm('Reset form and start over?')) {
    form.reset();
    state.currentSection = 1;
    state.formData = {};
    showSection(1);
    location.reload();
  }
}

// Download Checklist
async function downloadChecklist() {
  getFormData();

  if (!state.formData.merchantName) {
    alert('Please enter merchant name');
    return;
  }

  loadingIndicator.style.display = 'block';
  formContainer.style.display = 'none';

  try {
    const response = await fetch('/api/download-checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.formData),
    });

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Checklist-${state.formData.merchantName.replace(
      /\s+/g,
      '-'
    )}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    showSuccess('Checklist downloaded successfully!');
  } catch (error) {
    alert('Error downloading checklist: ' + error.message);
    loadingIndicator.style.display = 'none';
    formContainer.style.display = 'block';
  }
}

// Email Checklist
async function emailChecklist() {
  getFormData();

  if (!state.formData.merchantName || !state.formData.merchantEmail) {
    alert('Please enter merchant name and email');
    return;
  }

  loadingIndicator.style.display = 'block';
  formContainer.style.display = 'none';

  try {
    const response = await fetch('/api/generate-checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.formData),
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || 'Email failed');

    const recipientList = result.recipients.join(', ');
    showSuccess(`✅ Checklist emailed successfully to:<br>${recipientList}`);
  } catch (error) {
    alert('Error emailing checklist: ' + error.message);
    loadingIndicator.style.display = 'none';
    formContainer.style.display = 'block';
  }
}

// UI Helpers
function showSuccess(message) {
  loadingIndicator.style.display = 'none';
  document.getElementById('successText').innerHTML = message;
  successMessage.style.display = 'block';
  formContainer.style.display = 'none';
}
```

---

## Running the App

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with email credentials
# (See ".env File" section above)

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000 in browser
```

---

## Deployment (Render, Railway, Fly.io)

All are one `git push` away. Each has free tier support for small Node apps.

---

## Key Features

✅ Multi-step discovery form  
✅ Conditional field visibility based on selections  
✅ Dynamic checklist filtering  
✅ DOCX generation with proper formatting  
✅ Email delivery to merchant + team  
✅ Responsive design  
✅ Progress tracking  
✅ Form validation  
✅ Download OR email workflows
