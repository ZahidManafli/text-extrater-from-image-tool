/**
 * Detect if OCR result contains a table structure
 * Uses heuristic analysis of word coordinates to identify table patterns
 * @param {Object} ocrResult - OCR result with words and lines
 * @returns {Object} { isTable: boolean, confidence: number, suggestion: 'table' | 'text' }
 */
export function detectTable(ocrResult) {
  const { words = [], lines = [] } = ocrResult
  
  if (words.length === 0) {
    return { isTable: false, confidence: 0, suggestion: 'text' }
  }
  
  // Analyze word positions
  const xPositions = words.map(w => w.bbox.x0).sort((a, b) => a - b)
  const yPositions = words.map(w => w.bbox.y0).sort((a, b) => a - b)
  
  // Calculate column alignment score
  // Group words by similar x-coordinates (columns)
  const columnGroups = groupBySimilarValues(xPositions, 20) // 20px tolerance
  const columnCount = columnGroups.length
  
  // Calculate row alignment score
  // Group words by similar y-coordinates (rows)
  const rowGroups = groupBySimilarValues(yPositions, 15) // 15px tolerance
  const rowCount = rowGroups.length
  
  // Check for consistent spacing (table indicator)
  const hasConsistentSpacing = checkConsistentSpacing(xPositions, yPositions)
  
  // Check for tabular patterns in text (multiple spaces, tabs, or separators)
  const hasTabularPattern = checkTabularPattern(ocrResult.text)
  
  // Scoring system
  let score = 0
  
  // Multiple columns suggest table
  if (columnCount >= 3) score += 30
  else if (columnCount >= 2) score += 15
  
  // Multiple rows suggest table
  if (rowCount >= 3) score += 30
  else if (rowCount >= 2) score += 15
  
  // Consistent spacing is a strong indicator
  if (hasConsistentSpacing) score += 25
  
  // Tabular patterns in text
  if (hasTabularPattern) score += 20
  
  // If we have both multiple rows and columns, it's likely a table
  if (columnCount >= 2 && rowCount >= 2) score += 20
  
  const confidence = Math.min(score, 100)
  const isTable = confidence >= 50
  
  return {
    isTable,
    confidence,
    suggestion: isTable ? 'table' : 'text',
    columnCount,
    rowCount
  }
}

/**
 * Group values that are similar (within tolerance)
 */
function groupBySimilarValues(values, tolerance) {
  if (values.length === 0) return []
  
  const groups = []
  let currentGroup = [values[0]]
  
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1]
    if (diff <= tolerance) {
      currentGroup.push(values[i])
    } else {
      groups.push(currentGroup)
      currentGroup = [values[i]]
    }
  }
  groups.push(currentGroup)
  
  return groups
}

/**
 * Check if spacing between elements is consistent (table indicator)
 */
function checkConsistentSpacing(xPositions, yPositions) {
  if (xPositions.length < 3 || yPositions.length < 3) return false
  
  // Calculate differences between consecutive positions
  const xDiffs = []
  const yDiffs = []
  
  for (let i = 1; i < xPositions.length; i++) {
    xDiffs.push(xPositions[i] - xPositions[i - 1])
  }
  
  for (let i = 1; i < yPositions.length; i++) {
    yDiffs.push(yPositions[i] - yPositions[i - 1])
  }
  
  // Check if there are repeated spacing values (indicating table structure)
  const xRepeats = countRepeats(xDiffs, 5) // 5px tolerance
  const yRepeats = countRepeats(yDiffs, 5)
  
  return xRepeats >= 2 || yRepeats >= 2
}

/**
 * Count how many times a value repeats (within tolerance)
 */
function countRepeats(values, tolerance) {
  const groups = new Map()
  
  values.forEach(val => {
    let found = false
    for (const [key] of groups) {
      if (Math.abs(val - key) <= tolerance) {
        groups.set(key, (groups.get(key) || 0) + 1)
        found = true
        break
      }
    }
    if (!found) {
      groups.set(val, 1)
    }
  })
  
  return Math.max(...Array.from(groups.values()))
}

/**
 * Check for tabular patterns in text (multiple spaces, tabs, separators)
 */
function checkTabularPattern(text) {
  // Check for multiple consecutive spaces (column separator)
  if (/\s{3,}/.test(text)) return true
  
  // Check for tab characters
  if (/\t/.test(text)) return true
  
  // Check for pipe separators
  if (/\|/.test(text) && text.split('|').length >= 3) return true
  
  // Check for consistent separator patterns (e.g., "  |  " or "   ")
  const lines = text.split('\n')
  let consistentSeparators = 0
  
  lines.forEach(line => {
    if (/\s{2,}/.test(line) || /\|/.test(line)) {
      consistentSeparators++
    }
  })
  
  return consistentSeparators >= 3
}
