/**
 * Generate HTML code from text data
 * @param {Object} textData - Text data with text, emails, phones, urls
 * @returns {string} HTML code
 */
export function generateTextHTML(textData) {
  if (!textData || !textData.text) {
    return '<!-- No text data to generate HTML from -->'
  }

  let html = '<div class="extracted-content">\n'
  
  // Add main text as paragraphs
  const paragraphs = textData.text.split(/\n\s*\n/).filter(p => p.trim())
  paragraphs.forEach(paragraph => {
    html += `  <p>${escapeHTML(paragraph.trim())}</p>\n`
  })

  // Add emails if present
  if (textData.emails && textData.emails.length > 0) {
    html += '  <div class="emails">\n'
    html += '    <h3>Email Addresses</h3>\n'
    html += '    <ul>\n'
    textData.emails.forEach(email => {
      html += `      <li><a href="mailto:${escapeHTML(email)}">${escapeHTML(email)}</a></li>\n`
    })
    html += '    </ul>\n'
    html += '  </div>\n'
  }

  // Add phone numbers if present
  if (textData.phones && textData.phones.length > 0) {
    html += '  <div class="phones">\n'
    html += '    <h3>Phone Numbers</h3>\n'
    html += '    <ul>\n'
    textData.phones.forEach(phone => {
      html += `      <li><a href="tel:${escapeHTML(phone)}">${escapeHTML(phone)}</a></li>\n`
    })
    html += '    </ul>\n'
    html += '  </div>\n'
  }

  // Add URLs if present
  if (textData.urls && textData.urls.length > 0) {
    html += '  <div class="urls">\n'
    html += '    <h3>URLs</h3>\n'
    html += '    <ul>\n'
    textData.urls.forEach(url => {
      html += `      <li><a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(url)}</a></li>\n`
    })
    html += '    </ul>\n'
    html += '  </div>\n'
  }

  html += '</div>'

  return wrapInHTMLDocument(html)
}

/**
 * Generate HTML code from table data
 * @param {Object} tableData - Table data with headers and rows
 * @returns {string} HTML code
 */
export function generateTableHTML(tableData) {
  if (!tableData || !tableData.headers || tableData.headers.length === 0) {
    return '<!-- No table data to generate HTML from -->'
  }

  let html = '<div class="extracted-table">\n'
  html += '  <table>\n'
  
  // Add header row
  html += '    <thead>\n'
  html += '      <tr>\n'
  tableData.headers.forEach(header => {
    html += `        <th>${escapeHTML(String(header || ''))}</th>\n`
  })
  html += '      </tr>\n'
  html += '    </thead>\n'
  
  // Add body rows
  html += '    <tbody>\n'
  if (tableData.rows && tableData.rows.length > 0) {
    tableData.rows.forEach(row => {
      html += '      <tr>\n'
      row.forEach(cell => {
        html += `        <td>${escapeHTML(String(cell || ''))}</td>\n`
      })
      html += '      </tr>\n'
    })
  }
  html += '    </tbody>\n'
  
  html += '  </table>\n'
  html += '</div>'

  return wrapInHTMLDocument(html)
}

/**
 * Filter out table content from text
 * @param {string} text - Original text
 * @param {Object} tableData - Table data to exclude
 * @returns {string} Filtered text
 */
function filterTableContentFromText(text, tableData) {
  if (!text || !tableData || !tableData.headers) {
    return text
  }

  // Get table headers as a string to identify header rows
  const headerString = tableData.headers
    .map(h => String(h || '').trim())
    .filter(h => h)
    .join(' ')
    .toLowerCase()

  // Get all table cell values (for checking data rows)
  const tableCellValues = new Set()
  if (tableData.rows) {
    tableData.rows.forEach(row => {
      row.forEach(cell => {
        if (cell) {
          const cellStr = String(cell).trim().toLowerCase()
          if (cellStr.length > 0) {
            tableCellValues.add(cellStr)
          }
        }
      })
    })
  }

  // Split text into lines and filter
  const lines = text.split('\n')
  const filteredLines = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip empty lines
    if (!line) {
      continue
    }
    
    const lineLower = line.toLowerCase()
    
    // Skip if line contains the header string (table header row)
    if (headerString && lineLower.includes(headerString)) {
      continue
    }
    
    // Skip if line contains 2+ table cell values (likely a data row)
    let cellMatchCount = 0
    tableCellValues.forEach(cellValue => {
      if (cellValue && lineLower.includes(cellValue)) {
        cellMatchCount++
      }
    })
    
    // If line contains 2 or more table cell values, it's likely a table row
    if (cellMatchCount >= 2) {
      continue
    }
    
    // Keep the line (it's not table content)
    filteredLines.push(line)
  }
  
  return filteredLines.join('\n').trim()
}

/**
 * Generate HTML code from both text and table data
 * @param {Object} textData - Text data
 * @param {Object} tableData - Table data
 * @returns {string} HTML code
 */
export function generateBothHTML(textData, tableData) {
  let html = '<div class="extracted-content">\n'
  
  // Add text section
  if (textData && textData.text) {
    html += '  <section class="text-section">\n'
    
    // Filter out table content from text
    const filteredText = filterTableContentFromText(textData.text, tableData)
    
    if (filteredText) {
      // Split into paragraphs and process each
      const paragraphs = filteredText.split(/\n\s*\n/).filter(p => p.trim())
      paragraphs.forEach(paragraph => {
        const trimmed = paragraph.trim()
        // Only add if paragraph doesn't look like table data
        if (trimmed && !isTableRow(trimmed, tableData)) {
          html += `    <p>${escapeHTML(trimmed)}</p>\n`
        }
      })
    }

    // Add emails if present
    if (textData.emails && textData.emails.length > 0) {
      html += '    <div class="emails">\n'
      html += '      <h3>Email Addresses</h3>\n'
      html += '      <ul>\n'
      textData.emails.forEach(email => {
        html += `        <li><a href="mailto:${escapeHTML(email)}">${escapeHTML(email)}</a></li>\n`
      })
      html += '      </ul>\n'
      html += '    </div>\n'
    }

    // Add phone numbers if present
    if (textData.phones && textData.phones.length > 0) {
      html += '    <div class="phones">\n'
      html += '      <h3>Phone Numbers</h3>\n'
      html += '      <ul>\n'
      textData.phones.forEach(phone => {
        html += `        <li><a href="tel:${escapeHTML(phone)}">${escapeHTML(phone)}</a></li>\n`
      })
      html += '      </ul>\n'
      html += '    </div>\n'
    }

    // Add URLs if present
    if (textData.urls && textData.urls.length > 0) {
      html += '    <div class="urls">\n'
      html += '      <h3>URLs</h3>\n'
      html += '      <ul>\n'
      textData.urls.forEach(url => {
        html += `        <li><a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(url)}</a></li>\n`
      })
      html += '      </ul>\n'
      html += '    </div>\n'
    }
    
    html += '  </section>\n'
  }

  // Add table section
  if (tableData && tableData.headers && tableData.headers.length > 0) {
    html += '  <section class="table-section">\n'
    html += '    <table>\n'
    
    // Add header row
    html += '      <thead>\n'
    html += '        <tr>\n'
    tableData.headers.forEach(header => {
      html += `          <th>${escapeHTML(String(header || ''))}</th>\n`
    })
    html += '        </tr>\n'
    html += '      </thead>\n'
    
    // Add body rows
    html += '      <tbody>\n'
    if (tableData.rows && tableData.rows.length > 0) {
      tableData.rows.forEach(row => {
        html += '        <tr>\n'
        row.forEach(cell => {
          html += `          <td>${escapeHTML(String(cell || ''))}</td>\n`
        })
        html += '        </tr>\n'
      })
    }
    html += '      </tbody>\n'
    
    html += '    </table>\n'
    html += '  </section>\n'
  }

  html += '</div>'

  return wrapInHTMLDocument(html)
}

/**
 * Wrap HTML content in a complete HTML document with basic styling
 * @param {string} content - HTML content
 * @returns {string} Complete HTML document
 */
function wrapInHTMLDocument(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Extracted Content</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .extracted-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .text-section {
      margin-bottom: 30px;
    }
    .text-section p {
      margin-bottom: 15px;
      font-size: 16px;
    }
    .table-section {
      margin-top: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      background: white;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #333;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .emails, .phones, .urls {
      margin-top: 20px;
    }
    .emails h3, .phones h3, .urls h3 {
      font-size: 18px;
      margin-bottom: 10px;
      color: #555;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      margin-bottom: 8px;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
${content}
</body>
</html>`
}

/**
 * Check if a line looks like a table row
 * @param {string} line - Line to check
 * @param {Object} tableData - Table data
 * @returns {boolean} True if line appears to be table content
 */
function isTableRow(line, tableData) {
  if (!tableData || !tableData.headers || !tableData.rows) {
    return false
  }
  
  // Get all table cell values
  const tableCells = new Set()
  tableData.headers.forEach(h => {
    if (h) tableCells.add(String(h).trim().toLowerCase())
  })
  tableData.rows.forEach(row => {
    row.forEach(cell => {
      if (cell) tableCells.add(String(cell).trim().toLowerCase())
    })
  })
  
  // Check if line contains multiple table cell values
  const lineLower = line.toLowerCase()
  let matchCount = 0
  tableCells.forEach(cell => {
    if (cell && lineLower.includes(cell)) {
      matchCount++
    }
  })
  
  // If line contains 2+ table cell values, it's likely a table row
  return matchCount >= 2
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHTML(text) {
  if (!text) return ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return String(text).replace(/[&<>"']/g, m => map[m])
}

/**
 * Download HTML file
 * @param {string} htmlContent - HTML content to download
 * @param {string} filename - Output filename (without extension)
 */
export function downloadHTML(htmlContent, filename = 'extracted_content') {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.html`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
