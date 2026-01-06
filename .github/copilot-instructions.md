# NetSuite-Braintree Discovery App - AI Agent Instructions

## Project Overview

This is a **personalized implementation guide generator** for NetSuite-Braintree payment integrations. Users complete a multi-section discovery form, and the app generates a custom implementation guide containing only the relevant sections from a tagged reference document.

**Core Flow**: User Form → Tag Mapping → Section Filtering → Custom Guide Generation

## Architecture

### Service Layers

- **[services/guideGenerator.js](../services/guideGenerator.js)** - Main orchestrator: generates personalized implementation guides by mapping form data to tags, filtering sections, and building markdown output
- **[services/markdownParserService.js](../services/markdownParserService.js)** - Parses [Braintree-Ref-Tagged.md](../Braintree-Ref-Tagged.md) to extract sections with `**Tags:**` annotations (backtick-delimited format: `tag1` `tag2`)
- **[services/checklistService.js](../services/checklistService.js)** - Legacy service for older checklist generation (still referenced but being phased out)

### Tag-Based Content System

The app uses a **tag-based filtering system**:

1. Form responses map to tags via `mapFormDataToTags()` in [markdownParserService.js](../services/markdownParserService.js#L150-L250)
2. Reference document [Braintree-Ref-Tagged.md](../Braintree-Ref-Tagged.md) has sections annotated with `**Tags:**` lines
3. Tags match patterns like: `payment-method:paypal`, `channel:ecommerce`, `auth-timeline:multi-day`, `feature:3ds`
4. Only sections matching user-selected tags are included in the final guide

### Data Flow

```
User Input (public/app.js)
  → POST /api/generate-guide (server.js)
  → guideGenerator.generateGuide()
  → markdownParser.mapFormDataToTags()
  → markdownParser.filterSectionsByTags()
  → buildGuideMarkdown()
  → JSON response to frontend
  → results.js renders HTML
```

## Key Patterns

### Conditional Field Visibility

Frontend uses `setupConditionalFields()` in [public/app.js](../public/app.js#L48-L90) to show/hide form sections based on selections:

- ACH config appears when `acceptACH === 'yes'`
- Migration options appear when `hasExistingVault === 'yes'`
- Order sync details appear when `needsOrderSync === 'yes'`

### Form Data Format

Form data uses **multiple formats** (historical inconsistency):

- Boolean fields: `true` or `false` (checkboxes)
- String flags: `'yes'` or `'no'` (radio buttons)
- Arrays: `['ecommerce', 'moto']` (multi-select checkboxes)

**Always check both**: `data.field === true || data.field === 'yes'` (see [services/checklistService.js](../services/checklistService.js#L53-L58))

### Section Filtering Logic

In [markdownParserService.js](../services/markdownParserService.js#L110-L160):

- `mapFormDataToTags()`: Converts form selections to tag array
- `filterSectionsByTags()`: **Uses exclusionary logic** to prevent cross-contamination between channels:
  - If user selects ONLY `external-ecommerce`, excludes sections tagged with `suitecommerce` or `sca`
  - If user selects ONLY `suitecommerce`, excludes sections tagged with `external-platform`
  - This ensures merchants only see relevant implementation steps for their selected channel
- `determineComplexity()`: Calculates 'simple', 'moderate', or 'complex' based on tag count and feature combinations

**Critical**: Generic tags like `ecommerce` were intentionally REMOVED from tag mapping to prevent sections from appearing across incompatible channels

## Development Workflows

### Running Locally

```powershell
npm install
npm run dev  # Uses nodemon for auto-reload
```

Access at `http://localhost:3000`

### Testing

**No formal test framework** - uses standalone test scripts:

- `node test-guide-generator.js` - Test guide generation with sample data
- `node test-markdown-parser.js` - Test section extraction from reference doc
- `node test-integration.js` - Test full form-to-guide flow

Output files: `test-guide-output.md`, `test-guide-output.json`

### Deployment

Configured for **Render.com** via [render.yaml](../render.yaml):

- Deployment: `git push` to main branch triggers auto-deploy
- Build: `npm install`
- Start: `npm start` (production mode)

## Critical Implementation Details

### Adding New Payment Methods

1. Add checkbox to [public/index.html](../public/index.html) in payment methods section
2. Update tag mapping in `mapFormDataToTags()` to add corresponding tag (e.g., `payment-method:new-method`)
3. Tag relevant sections in [Braintree-Ref-Tagged.md](../Braintree-Ref-Tagged.md) with the new tag
4. Update complexity calculation if needed in `determineComplexity()`

### Adding New Form Sections

1. Add HTML section in [index.html](../public/index.html) with class `section`
2. Increment `totalSections` in [app.js](../public/app.js#L3)
3. Add conditional visibility logic if needed in `setupConditionalFields()`
4. Map new fields to tags in `mapFormDataToTags()`

### Modifying Guide Output

Edit [services/guideGenerator.js](../services/guideGenerator.js):

- `buildGuideMarkdown()`: Controls overall structure
- `buildConfigurationSummary()`: Formats the "Your Configuration" section
- `buildTableOfContents()`: Generates TOC with anchor links
- Header/footer templates are inline string concatenation

## Common Issues

### Section Numbering

Sections are **renumbered sequentially** (1, 2, 3...) in the final guide, even if the reference doc has gaps. This is intentional to prevent confusion when sections are filtered out.

### Tag Parsing

Tags MUST be in backtick format: `**Tags:** `tag1` `tag2` `tag3``

- Spaces between backticks are OK
- Tags without backticks are ignored
- See [markdownParserService.js](../services/markdownParserService.js#L95-L110)

### Boolean vs String Checks

Always check both boolean and string values for form fields due to historical inconsistencies:

```javascript
if (formData.field === true || formData.field === 'yes') {
  // handle enabled state
}
```

## File References

- **Frontend**: [public/index.html](../public/index.html), [public/app.js](../public/app.js), [public/results.js](../public/results.js)
- **Backend**: [server.js](../server.js), [services/guideGenerator.js](../services/guideGenerator.js)
- **Reference Doc**: [Braintree-Ref-Tagged.md](../Braintree-Ref-Tagged.md) (tagged markdown source)
- **Data**: [data/checklistData.js](../data/checklistData.js) (legacy checklist structure)
