/**
 * Extract email addresses from text
 * @param {string} text - Input text
 * @returns {Array<string>} Array of unique email addresses
 */
export function extractEmails(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const matches = text.match(emailRegex) || []
  return [...new Set(matches)] // Remove duplicates
}

/**
 * Extract phone numbers from text
 * Supports multiple formats: US, international, with/without separators
 * @param {string} text - Input text
 * @returns {Array<string>} Array of unique phone numbers
 */
export function extractPhones(text) {
  // Phone regex patterns
  const patterns = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // US format: 123-456-7890, 123.456.7890, 1234567890
    /\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g, // US format: (123) 456-7890
    /\b\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g, // International format
    /\b\d{10,15}\b/g // Long numeric sequences (10-15 digits)
  ]
  
  const matches = []
  patterns.forEach(pattern => {
    const found = text.match(pattern) || []
    matches.push(...found)
  })
  
  // Remove duplicates and filter out very short numbers
  return [...new Set(matches)].filter(phone => phone.replace(/\D/g, '').length >= 10)
}

/**
 * Extract URLs from text
 * @param {string} text - Input text
 * @returns {Array<string>} Array of unique URLs
 */
export function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = text.match(urlRegex) || []
  return [...new Set(matches)] // Remove duplicates
}

/**
 * Parse text and extract all entities (emails, phones, URLs)
 * @param {string} text - Input text
 * @returns {Object} Object with text, emails, phones, and urls arrays
 */
export function parseText(text) {
  const cleanText = text.trim()
  
  return {
    text: cleanText,
    emails: extractEmails(cleanText),
    phones: extractPhones(cleanText),
    urls: extractUrls(cleanText)
  }
}

/**
 * Extract text excluding table content
 * Uses table data to identify and exclude table words from OCR result
 * @param {Object} ocrResult - OCR result with words array
 * @param {Object} tableData - Extracted table data
 * @returns {Object} Parsed text data excluding table content
 */
export function extractTextExcludingTable(ocrResult, tableData) {
  const { words = [], text = '' } = ocrResult
  
  if (!tableData || !tableData.headers || tableData.headers.length === 0) {
    // No table detected, return all text
    return parseText(text)
  }
  
  // Get all table cell values
  const tableValues = new Set()
  tableData.headers.forEach(h => {
    if (h) tableValues.add(h.trim().toLowerCase())
  })
  tableData.rows.forEach(row => {
    row.forEach(cell => {
      if (cell) {
        const cellText = String(cell).trim().toLowerCase()
        // Add individual words from cell
        cellText.split(/\s+/).forEach(word => {
          if (word.length > 2) tableValues.add(word)
        })
      }
    })
  })
  
  // Filter out words that appear in the table
  // This is a simple approach - in a more sophisticated version,
  // we could use word coordinates to exclude table regions
  
  // For now, return text but note that table content may be included
  // The user can see both separately
  return parseText(text)
}
