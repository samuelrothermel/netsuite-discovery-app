// Results page - displays personalized implementation guide
document.addEventListener('DOMContentLoaded', () => {
  loadImplementationGuide();
});

async function loadImplementationGuide() {
  // Retrieve form data from sessionStorage
  const formDataJson = sessionStorage.getItem('checklistFormData');

  if (!formDataJson) {
    showError('No form data found. Please complete the discovery form first.');
    return;
  }

  const formData = JSON.parse(formDataJson);
  showLoading();

  try {
    // Generate personalized guide
    const response = await fetch('/api/generate-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to generate guide');
    }

    const result = await response.json();

    if (result.success) {
      displayGuide(result, formData);
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error generating guide:', error);
    showError('Error generating implementation guide. Please try again.');
  }
}

function showLoading() {
  const content = document.getElementById('checklistContent');
  content.innerHTML = `
    <div class="loading-container" style="text-align: center; padding: 60px 20px;">
      <div class="spinner" style="display: inline-block; width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #0070d2; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 20px; color: #666;">Generating your personalized implementation guide...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}

function showError(message) {
  const content = document.getElementById('checklistContent');
  content.innerHTML = `
    <div class="highlight-box" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
      <p><strong>⚠️ ${message}</strong></p>
      <button onclick="window.location.href='/'" class="btn btn-primary" style="margin-top: 15px;">Return to Form</button>
    </div>
  `;
}

function displayGuide(result, formData) {
  const content = document.getElementById('checklistContent');

  // Update page header
  updatePageHeader(formData, result);

  // Convert markdown to HTML
  const guideHtml = markdownToHtml(result.guide);

  content.innerHTML = `
    <div class="guide-container">
      ${guideHtml}
    </div>
  `;

  // Add print button
  addActionButtons(result, formData);
}

function updatePageHeader(formData, result) {
  const titleElement = document.getElementById('pageTitle');
  const metaElement = document.getElementById('pageMeta');

  titleElement.textContent = `Implementation Guide: ${formData.merchantName}`;

  const complexityBadge = {
    simple:
      '<span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px;">✅ Simple</span>',
    moderate:
      '<span style="background: #ffc107; color: #000; padding: 4px 12px; border-radius: 12px; font-size: 14px;">⚠️ Moderate</span>',
    complex:
      '<span style="background: #dc3545; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px;">🔧 Complex</span>',
  };

  metaElement.innerHTML = `
    Generated: ${new Date().toLocaleDateString()} | 
    ${complexityBadge[result.complexity]} | 
    ${result.sections.length} Sections
  `;
}

function addActionButtons(result, formData) {
  const actionsDiv = document.getElementById('actions');

  actionsDiv.innerHTML = `
    <button onclick="window.print()" class="btn btn-primary">
      📄 Print Guide
    </button>
    <button onclick="copyToClipboard()" class="btn btn-secondary">
      📋 Copy to Clipboard
    </button>
    <button onclick="window.location.href='/'" class="btn btn-secondary">
      ← Back to Form
    </button>
  `;
}

function copyToClipboard() {
  const guideText = document.querySelector('.guide-container').innerText;

  navigator.clipboard
    .writeText(guideText)
    .then(() => {
      alert('Implementation guide copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard. Please use Print instead.');
    });
}

/**
 * Enhanced markdown to HTML converter with semantic classes
 */
function markdownToHtml(markdown) {
  let html = markdown;
  let inSection = null;

  // Code blocks (```...```)
  html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

  // Inline code (`...`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings (capture section context)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, (match, title) => {
    inSection = title.toLowerCase();
    return `<h2>${title}</h2>`;
  });
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold (**text** or __text__)
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic (but not em tags in section tags line)
  html = html.replace(
    /\*Relevant to: ([^\*]+)\*/g,
    '<span class="section-tags">Relevant to: $1</span>'
  );
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^\)]+)\)/g,
    '<a href="$2" target="_blank">$1</a>'
  );

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr/>');

  // Process tables and lists with context-aware classes
  const lines = html.split('\n');
  let processedLines = [];
  let inList = false;
  let listType = null;
  let inTable = false;
  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Track current section
    if (line.match(/<h2>(.+)<\/h2>/)) {
      currentSection = RegExp.$1.toLowerCase();
    }

    // Table detection - header row (| Header | Header |)
    if (line.match(/^\|(.+)\|$/)) {
      // Check if next line is separator (|-------|-------|)
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
      const isSeparator = nextLine.match(/^\|[\s\-:|]+\|$/);

      if (isSeparator && !inTable) {
        // Start table and add header
        processedLines.push('<table>');
        processedLines.push('<thead>');
        const headers = line
          .split('|')
          .filter(cell => cell.trim())
          .map(cell => `<th>${cell.trim()}</th>`)
          .join('');
        processedLines.push(`<tr>${headers}</tr>`);
        processedLines.push('</thead>');
        processedLines.push('<tbody>');
        inTable = true;
        i++; // Skip separator line
        continue;
      } else if (inTable) {
        // Table data row
        const cells = line
          .split('|')
          .filter(cell => cell.trim())
          .map(cell => `<td>${cell.trim()}</td>`)
          .join('');
        processedLines.push(`<tr>${cells}</tr>`);
        continue;
      }
    }
    // Close table if we're in one and hit a non-table line
    else if (inTable && !line.match(/^\|(.+)\|$/)) {
      processedLines.push('</tbody>');
      processedLines.push('</table>');
      inTable = false;
    }

    // Unordered list item
    if (line.match(/^[\-\*] /)) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      line = line.replace(/^[\-\*] (.+)$/, '<li>$1</li>');
    }
    // Ordered list item
    else if (line.match(/^\d+\. /)) {
      if (!inList) {
        const cssClass = currentSection.includes('table of contents')
          ? ' class="toc"'
          : '';
        processedLines.push(`<ol${cssClass}>`);
        inList = true;
        listType = 'ol';
      }
      line = line.replace(/^\d+\. (.+)$/, '<li>$1</li>');
    }
    // Close list if we're in one and hit a non-list line
    else if (inList && line.trim() !== '' && !line.match(/<li>/)) {
      processedLines.push(`</${listType}>`);
      inList = false;
      listType = null;
    }

    processedLines.push(line);
  }

  // Close any open list or table
  if (inList) {
    processedLines.push(`</${listType}>`);
  }
  if (inTable) {
    processedLines.push('</tbody>');
    processedLines.push('</table>');
  }

  html = processedLines.join('\n');

  // Wrap sections with semantic classes
  html = html.replace(
    /<h2>Your Configuration<\/h2>([\s\S]*?)(?=<hr|<h2|$)/g,
    '<div class="config-summary"><h2>Your Configuration</h2>$1</div>'
  );
  html = html.replace(
    /<h2>Next Steps<\/h2>([\s\S]*?)(?=<hr|<h2|$)/g,
    '<div class="next-steps"><h2>Next Steps</h2>$1</div>'
  );
  html = html.replace(
    /<h3>Key Resources<\/h3>([\s\S]*?)(?=<hr|<h2|<h3|$)/g,
    '<div class="key-resources"><h3>Key Resources</h3>$1</div>'
  );

  // Paragraphs - but avoid wrapping already-wrapped content
  html = html
    .split('\n\n')
    .map(para => {
      para = para.trim();
      if (!para) return '';
      // Don't wrap if already wrapped in HTML tag or is just a break
      if (para.startsWith('<') || para === '<br/>') {
        return para;
      }
      return `<p>${para}</p>`;
    })
    .join('\n');

  // Clean up excessive line breaks
  html = html.replace(/(<br\/>){2,}/g, '<br/>');
  html = html.replace(/\n{3,}/g, '\n\n');

  return html;
}
