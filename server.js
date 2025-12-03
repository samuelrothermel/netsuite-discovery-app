const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const checklistService = require('./services/checklistService');
const checklistData = require('./data/checklistData');
// Email service disabled
// const emailService = require('./services/emailService');

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

// POST: Generate and email checklist (EMAIL DISABLED - Download only)
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

    // EMAIL FUNCTIONALITY DISABLED
    // Prepare email recipients
    const recipients = [formData.merchantEmail];
    if (formData.teamEmails && formData.teamEmails.length > 0) {
      recipients.push(...formData.teamEmails);
    }

    // Instead of sending email, return success message indicating email is disabled
    res.json({
      success: true,
      message: `Checklist generated. Email functionality is currently disabled. Please use the download option.`,
      recipients: recipients,
      filename: `Checklist-${formData.merchantName.replace(/\s+/g, '-')}.docx`,
      emailDisabled: true,
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

// GET: Serve checklist data structure
app.get('/api/checklist', (req, res) => {
  try {
    res.json(checklistData);
  } catch (error) {
    console.error('Error serving checklist data:', error);
    res.status(500).json({ error: 'Failed to load checklist data' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Open http://localhost:${PORT} in your browser`);
});
