# Integration Engineer Hub - Setup & Usage Guide

## Overview

The NetSuite-Braintree Discovery App has been transformed into a comprehensive **Integration Engineer Hub** - a one-stop shop for PayPal/Braintree integration engineers to access multiple tools and resources.

## Features

The hub now provides three main tools:

### 1. 📋 Discovery App

The original personalized implementation guide generator. Users complete a discovery form and receive a customized implementation guide with only relevant sections based on their configuration.

**Access:** `/discovery`

### 2. 📚 NetSuite Training Guide

Browse an HTML-rendered version of the NetSuite Training Guide markdown file. Features include:

- Interactive table of contents with scroll spy
- Search functionality within the guide
- Clean, responsive design
- Automatic heading navigation

**Access:** `/training-guide`
**Content File:** `docs/training-guide.md`

### 3. 📖 Official User Guide

Access the stripped markdown version of the official NetSuite-Braintree User Guide. Features include:

- HTML rendering with markdown styling
- Table of contents navigation
- Search within guide
- Download original markdown file option

**Access:** `/user-guide`
**Content File:** `docs/user-guide.md`

## Quick Start

### Installation

1. Install dependencies (including the new markdown renderer):

```bash
npm install
```

### Adding Content

The hub is ready for your documentation files. Simply add your content to the placeholder files:

1. **Training Guide**: Replace content in `docs/training-guide.md`
2. **User Guide**: Replace content in `docs/user-guide.md`

No code changes needed - the files are automatically served through the web interface!

### Running Locally

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Access the hub at `http://localhost:3000`

## File Structure

```
netsuite-discovery-app/
├── docs/                          # Documentation markdown files
│   ├── README.md                  # Docs directory guide
│   ├── training-guide.md          # NetSuite Training Guide (add your content)
│   └── user-guide.md              # Official User Guide (add your content)
├── public/                        # Frontend files
│   ├── index.html                 # Hub landing page (NEW)
│   ├── discovery.html             # Discovery form (renamed from index.html)
│   ├── training-guide.html        # Training guide viewer (NEW)
│   ├── user-guide.html            # User guide viewer (NEW)
│   ├── results.html               # Discovery results page
│   ├── app.js                     # Discovery form logic
│   ├── results.js                 # Results page logic
│   └── style.css                  # Global styles
├── services/                      # Backend services
│   ├── guideGenerator.js          # Implementation guide generator
│   ├── markdownParserService.js   # Discovery form tag mapping
│   ├── markdownRenderService.js   # Markdown to HTML converter (NEW)
│   └── checklistService.js        # Legacy checklist service
├── server.js                      # Main server with all routes
└── package.json                   # Dependencies (now includes 'marked')
```

## Routes

### Page Routes

- `/` - Hub landing page
- `/discovery` - Discovery app form
- `/training-guide` - Training guide viewer
- `/user-guide` - User guide viewer

### API Routes

- `POST /api/generate-guide` - Generate personalized implementation guide
- `GET /api/training-guide` - Fetch training guide content (JSON with HTML)
- `GET /api/user-guide` - Fetch user guide content (JSON with HTML)
- `GET /api/user-guide/download` - Download user guide markdown file
- `GET /api/health` - Health check endpoint

## Navigation

All pages include navigation back to the hub:

- Hub landing page features cards linking to all three tools
- Discovery app, Training Guide, and User Guide all have "← Back to Hub" buttons
- Results page also includes hub navigation

## Deployment

The app is configured for **Render.com** deployment:

1. Push changes to your repository
2. Render automatically builds and deploys
3. All new routes are immediately available

**Build Command:** `npm install`  
**Start Command:** `npm start`

## Customization

### Styling

All pages share `public/style.css` for base styling, with additional inline styles for page-specific layouts.

### Markdown Rendering

The app uses [marked](https://marked.js.org/) for markdown-to-HTML conversion with these settings:

- GitHub Flavored Markdown (GFM)
- Automatic heading IDs
- Line breaks converted to `<br>`
- Code syntax highlighting-ready

### Adding More Documentation

To add additional documentation files:

1. Add markdown file to `docs/` directory
2. Create HTML viewer page in `public/`
3. Add route in `server.js`
4. Add card to hub landing page (`public/index.html`)
5. Create API endpoint using `markdownRenderService`

## Testing

Test the new functionality:

```bash
# Start server
npm run dev

# Visit each route to verify:
# http://localhost:3000/              (Hub)
# http://localhost:3000/discovery     (Discovery App)
# http://localhost:3000/training-guide (Training Guide)
# http://localhost:3000/user-guide    (User Guide)
```

## Next Steps

1. **Add Training Guide Content**: Replace placeholder in `docs/training-guide.md`
2. **Add User Guide Content**: Replace placeholder in `docs/user-guide.md`
3. **Customize Branding**: Update colors, logos, or styling in the hub pages
4. **Add More Tools**: Extend the hub with additional integrator resources

## Support

For questions or issues with the hub, contact the integration engineering team.

---

**Last Updated:** March 2026  
**Version:** 2.0 (Hub Edition)
