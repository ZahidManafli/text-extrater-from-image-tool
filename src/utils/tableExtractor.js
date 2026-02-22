/**
 * Extract table structure from OCR results
 * Groups words by rows and columns to create a structured table
 * @param {Object} ocrResult - OCR result with words array
 * @returns {Object} { headers: Array, rows: Array<Array> }
 */
export function extractTable(ocrResult) {
  const { words = [] } = ocrResult
  
  if (words.length === 0) {
    return { headers: [], rows: [] }
  }
  
  // Group words by rows (similar y-coordinates)
  const rows = groupWordsByRows(words)
  
  if (rows.length === 0) {
    return { headers: [], rows: [] }
  }
  
  // First, detect column positions from all rows (especially header row)
  const columnPositions = detectColumnPositions(rows)
  
  // For each row, assign words to columns based on detected positions
  const tableRows = rows.map(rowWords => {
    return assignWordsToColumns(rowWords, columnPositions)
  })
  
  // Determine headers (usually first row)
  const headers = determineHeaders(tableRows)
  
  // Extract data rows
  const dataRows = tableRows.slice(headers.length > 0 ? 1 : 0)
  
  // Clean and normalize cells
  const cleanHeaders = headers.map(cell => cleanCell(cell))
  const cleanRows = dataRows.map(row => row.map(cell => cleanCell(cell)))
  
  return {
    headers: cleanHeaders,
    rows: cleanRows
  }
}

/**
 * Group words by rows based on y-coordinates
 */
function groupWordsByRows(words, tolerance = 15) {
  // Sort words by y-coordinate
  const sortedWords = [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0)
  
  const rows = []
  let currentRow = [sortedWords[0]]
  
  for (let i = 1; i < sortedWords.length; i++) {
    const prevWord = sortedWords[i - 1]
    const currentWord = sortedWords[i]
    
    // If y-coordinate difference is small, same row
    const yDiff = Math.abs(currentWord.bbox.y0 - prevWord.bbox.y0)
    
    if (yDiff <= tolerance) {
      currentRow.push(currentWord)
    } else {
      // Sort row by x-coordinate (left to right)
      currentRow.sort((a, b) => a.bbox.x0 - b.bbox.x0)
      rows.push(currentRow)
      currentRow = [currentWord]
    }
  }
  
  // Add last row
  if (currentRow.length > 0) {
    currentRow.sort((a, b) => a.bbox.x0 - b.bbox.x0)
    rows.push(currentRow)
  }
  
  return rows
}

/**
 * Detect column positions by analyzing all rows
 * Primarily uses the header row to establish column boundaries
 */
function detectColumnPositions(rows, tolerance = 40) {
  if (rows.length === 0) return []
  
  // Primary approach: Use header row (first row) to detect columns
  if (rows.length > 0 && rows[0].length > 0) {
    const headerRow = rows[0]
    const headerXPositions = headerRow.map(w => w.bbox.x0).sort((a, b) => a - b)
    
    // If header has clear column structure, use it
    if (headerXPositions.length >= 2) {
      // Check if positions are well-separated (likely columns)
      const gaps = []
      for (let i = 1; i < headerXPositions.length; i++) {
        gaps.push(headerXPositions[i] - headerXPositions[i - 1])
      }
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
      
      // If average gap is significant, use header positions as column starts
      if (avgGap > tolerance) {
        // Group header positions into columns
        const columnStarts = [headerXPositions[0]]
        for (let i = 1; i < headerXPositions.length; i++) {
          const gap = headerXPositions[i] - headerXPositions[i - 1]
          if (gap > tolerance) {
            columnStarts.push(headerXPositions[i])
          }
        }
        return columnStarts
      }
    }
  }
  
  // Fallback: Analyze all rows to find column clusters
  const allXPositions = []
  rows.forEach(rowWords => {
    rowWords.forEach(word => {
      allXPositions.push(word.bbox.x0)
    })
  })
  
  const sortedX = [...new Set(allXPositions)].sort((a, b) => a - b)
  
  // Find significant gaps that indicate column boundaries
  const columnStarts = [sortedX[0]]
  for (let i = 1; i < sortedX.length; i++) {
    const gap = sortedX[i] - sortedX[i - 1]
    if (gap > tolerance) {
      columnStarts.push(sortedX[i])
    }
  }
  
  return columnStarts
}

/**
 * Assign words in a row to columns based on detected column positions
 */
function assignWordsToColumns(rowWords, columnPositions, tolerance = 50) {
  if (rowWords.length === 0 || columnPositions.length === 0) {
    return columnPositions.map(() => '')
  }
  
  // Sort words by x-coordinate
  const sortedWords = [...rowWords].sort((a, b) => a.bbox.x0 - b.bbox.x0)
  
  // Initialize columns with empty arrays of words
  const columnWords = columnPositions.map(() => [])
  
  // Calculate column boundaries (midpoints between column starts)
  const columnBoundaries = []
  for (let i = 0; i < columnPositions.length; i++) {
    if (i === columnPositions.length - 1) {
      // Last column: use a large boundary
      columnBoundaries.push(columnPositions[i] + tolerance * 2)
    } else {
      // Midpoint between this column and next
      const midpoint = (columnPositions[i] + columnPositions[i + 1]) / 2
      columnBoundaries.push(midpoint)
    }
  }
  
  // Assign each word to the appropriate column
  sortedWords.forEach(word => {
    const wordX = word.bbox.x0
    
    // Find which column this word belongs to
    for (let i = 0; i < columnBoundaries.length; i++) {
      if (wordX < columnBoundaries[i]) {
        columnWords[i].push(word)
        break
      }
    }
  })
  
  // Convert word arrays to text strings
  const columns = columnWords.map(words => {
    // Sort words in column by x-coordinate and join
    return words
      .sort((a, b) => a.bbox.x0 - b.bbox.x0)
      .map(w => w.text)
      .join(' ')
      .trim()
  })
  
  return columns
}

/**
 * Determine if first row(s) are headers
 */
function determineHeaders(tableRows) {
  if (tableRows.length === 0) return []
  
  // Use first row as headers by default
  // Could be enhanced with heuristics (e.g., all caps, different formatting)
  return tableRows[0] || []
}

/**
 * Clean and normalize cell content
 */
function cleanCell(cell) {
  if (!cell) return ''
  
  // Remove extra whitespace
  let cleaned = String(cell).trim().replace(/\s+/g, ' ')
  
  // Try to detect if it's a number
  const numValue = parseFloat(cleaned.replace(/[^\d.-]/g, ''))
  if (!isNaN(numValue) && cleaned.replace(/[^\d.-]/g, '') === String(numValue)) {
    return numValue
  }
  
  return cleaned
}
