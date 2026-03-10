const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const guideGenerator = require('./services/guideGenerator');
const markdownRenderService = require('./services/markdownRenderService');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes

// GET: Serve hub homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// GET: Serve discovery form
app.get('/discovery', (req, res) => {
  res.sendFile(__dirname + '/public/discovery.html');
});

// GET: Serve training guide viewer
app.get('/training-guide', (req, res) => {
  res.sendFile(__dirname + '/public/training-guide.html');
});

// API: Get training guide content
app.get('/api/training-guide', async (req, res) => {
  try {
    const result = await markdownRenderService.renderMarkdownFile(
      'Braintree-NetSuite-Integration-Engineer-Training-Guide-v2025.1 (2).md',
    );
    res.json(result);
  } catch (error) {
    console.error('Error loading training guide:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load training guide',
    });
  }
});

// POST: Generate personalized implementation guide
app.post('/api/generate-guide', async (req, res) => {
  try {
    const formData = req.body;

    // Validate required fields
    if (!formData.merchantName) {
      return res.status(400).json({
        error: 'Merchant name is required',
      });
    }

    // Generate personalized implementation guide
    const guide = guideGenerator.generateGuide(formData);

    // Return the guide as HTML/Markdown
    res.json({
      success: true,
      guide: guide.markdown,
      sections: guide.sections,
      complexity: guide.complexity,
      tags: guide.tags,
    });
  } catch (error) {
    console.error('Error generating guide:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate implementation guide',
    });
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
