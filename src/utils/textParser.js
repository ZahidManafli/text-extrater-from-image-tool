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
