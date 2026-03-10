/**
 * Markdown Rendering Service
 *
 * Handles reading and converting markdown documentation files to HTML
 */

const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');

// Configure marked options for better rendering
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert line breaks to <br>
  headerIds: true, // Add IDs to headings
  mangle: false, // Don't escape autolinked email addresses
});

/**
 * Read and render a markdown file to HTML
 * @param {string} filename - Name of the markdown file in docs/ directory
 * @returns {Promise<Object>} Object with content (raw markdown) and html (rendered HTML)
 */
async function renderMarkdownFile(filename) {
  try {
    const filePath = path.join(__dirname, '..', 'docs', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return {
        success: false,
        message: `File not found: ${filename}. Please add the markdown content to the docs/ directory.`,
      };
    }

    // Read the markdown file
    const markdownContent = await fs.readFile(filePath, 'utf-8');

    // Convert markdown to HTML
    const htmlContent = marked.parse(markdownContent);

    return {
      success: true,
      content: markdownContent,
      html: htmlContent,
    };
  } catch (error) {
    console.error(`Error rendering markdown file ${filename}:`, error);
    return {
      success: false,
      message: `Error reading file: ${error.message}`,
    };
  }
}

/**
 * Get the raw markdown content for download
 * @param {string} filename - Name of the markdown file in docs/ directory
 * @returns {Promise<string>} Raw markdown content
 */
async function getMarkdownContent(filename) {
  try {
    const filePath = path.join(__dirname, '..', 'docs', filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading markdown file ${filename}:`, error);
    throw new Error(`Failed to read file: ${filename}`);
  }
}

/**
 * Extract table of contents from markdown content
 * @param {string} markdownContent - Raw markdown content
 * @returns {Array} Array of heading objects with level and text
 */
function extractTableOfContents(markdownContent) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc = [];
  let match;

  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    toc.push({ level, text });
  }

  return toc;
}

/**
 * Check if a documentation file exists
 * @param {string} filename - Name of the markdown file
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filename) {
  try {
    const filePath = path.join(__dirname, '..', 'docs', filename);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  renderMarkdownFile,
  getMarkdownContent,
  extractTableOfContents,
  fileExists,
};
