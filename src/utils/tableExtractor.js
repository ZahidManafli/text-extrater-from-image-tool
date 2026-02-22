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
  const allRows = groupWordsByRows(words)
  
  if (allRows.length === 0) {
    return { headers: [], rows: [] }
  }
  
  // Identify the actual table section (skip descriptive text at top)
  const { tableStartIndex, headerRowIndex } = findTableSection(allRows)
  
  if (tableStartIndex === -1) {
    return { headers: [], rows: [] }
  }
  
  // Extract only the table rows (skip text rows above)
  const tableRows = allRows.slice(tableStartIndex)
  
  // Calculate header row index within the table rows
  const headerRowIndexInTable = headerRowIndex >= tableStartIndex ? headerRowIndex - tableStartIndex : 0
  
  // Detect column positions from the actual table rows (especially header row)
  // Use the header row to establish column positions
  const headerRowForColumns = tableRows[headerRowIndexInTable] || tableRows[0] || []
  const columnPositions = detectColumnPositionsFromHeader(headerRowForColumns, tableRows)
  
  if (columnPositions.length === 0) {
    return { headers: [], rows: [] }
  }
  
  // For each table row, assign words to columns based on detected positions
  const processedRows = tableRows.map(rowWords => {
    return assignWordsToColumns(rowWords, columnPositions)
  })
  
  // Determine headers - use the identified header row
  const headers = processedRows[headerRowIndexInTable] || processedRows[0] || []
  
  // Extract data rows (skip header row)
  const dataRows = processedRows.slice(headerRowIndexInTable + 1)
  
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
 * Detect column positions from header row and validate with data rows
 */
function detectColumnPositionsFromHeader(headerRow, allTableRows, tolerance = 50) {
  if (headerRow.length === 0) {
    return detectColumnPositions(allTableRows, tolerance)
  }
  
  // Sort header words by x-coordinate
  const headerSorted = [...headerRow].sort((a, b) => a.bbox.x0 - b.bbox.x0)
  
  // Group header words into columns based on proximity
  const columnGroups = []
  let currentGroup = [headerSorted[0]]
  
  for (let i = 1; i < headerSorted.length; i++) {
    const prevWord = headerSorted[i - 1]
    const currentWord = headerSorted[i]
    
    // Calculate gap between words
    const prevWordEnd = prevWord.bbox.x1
    const currentWordStart = currentWord.bbox.x0
    const gap = currentWordStart - prevWordEnd
    
    // If gap is small, words are in same column
    if (gap < tolerance) {
      currentGroup.push(currentWord)
    } else {
      // New column - save previous column's leftmost position
      const columnStart = Math.min(...currentGroup.map(w => w.bbox.x0))
      columnGroups.push(columnStart)
      currentGroup = [currentWord]
    }
  }
  
  // Add last column
  if (currentGroup.length > 0) {
    const columnStart = Math.min(...currentGroup.map(w => w.bbox.x0))
    columnGroups.push(columnStart)
  }
  
  // If we found a reasonable number of columns (2-15), use them
  if (columnGroups.length >= 2 && columnGroups.length <= 15) {
    return columnGroups.sort((a, b) => a - b)
  }
  
  // Fallback to analyzing all rows
  return detectColumnPositions(allTableRows, tolerance)
}

/**
 * Detect column positions by analyzing all rows
 * Groups words that are close together into columns, then finds column boundaries
 */
function detectColumnPositions(rows, tolerance = 50) {
  if (rows.length === 0) return []
  
  // Strategy: Analyze header row first, then validate with other rows
  // Group words in header row that are close together (same column)
  
  if (rows.length > 0 && rows[0].length > 0) {
    const headerRow = rows[0]
    const headerSorted = [...headerRow].sort((a, b) => a.bbox.x0 - b.bbox.x0)
    
    // Group header words into columns based on proximity
    const headerColumns = []
    let currentColumn = [headerSorted[0]]
    
    for (let i = 1; i < headerSorted.length; i++) {
      const prevWord = headerSorted[i - 1]
      const currentWord = headerSorted[i]
      
      // Calculate gap between words (end of prev to start of current)
      const prevWordEnd = prevWord.bbox.x1
      const currentWordStart = currentWord.bbox.x0
      const gap = currentWordStart - prevWordEnd
      
      // If gap is small, words are in same column
      if (gap < tolerance) {
        currentColumn.push(currentWord)
      } else {
        // New column - save previous column's leftmost position
        const columnStart = Math.min(...currentColumn.map(w => w.bbox.x0))
        headerColumns.push(columnStart)
        currentColumn = [currentWord]
      }
    }
    
    // Add last column
    if (currentColumn.length > 0) {
      const columnStart = Math.min(...currentColumn.map(w => w.bbox.x0))
      headerColumns.push(columnStart)
    }
    
    // If we found a reasonable number of columns (2-15), use them
    if (headerColumns.length >= 2 && headerColumns.length <= 15) {
      return headerColumns.sort((a, b) => a - b)
    }
  }
  
  // Fallback: Analyze all rows to find column clusters
  // Collect leftmost positions of word groups from each row
  const columnCandidates = []
  
  rows.forEach(rowWords => {
    if (rowWords.length === 0) return
    
    const sorted = [...rowWords].sort((a, b) => a.bbox.x0 - b.bbox.x0)
    let currentGroup = [sorted[0]]
    
    for (let i = 1; i < sorted.length; i++) {
      const prevWord = sorted[i - 1]
      const currentWord = sorted[i]
      const gap = currentWord.bbox.x0 - prevWord.bbox.x1
      
      if (gap < tolerance) {
        currentGroup.push(currentWord)
      } else {
        const groupStart = Math.min(...currentGroup.map(w => w.bbox.x0))
        columnCandidates.push(groupStart)
        currentGroup = [currentWord]
      }
    }
    
    if (currentGroup.length > 0) {
      const groupStart = Math.min(...currentGroup.map(w => w.bbox.x0))
      columnCandidates.push(groupStart)
    }
  })
  
  // Cluster candidates that are close together
  const sortedCandidates = [...new Set(columnCandidates)].sort((a, b) => a - b)
  const clusters = []
  let currentCluster = [sortedCandidates[0]]
  
  for (let i = 1; i < sortedCandidates.length; i++) {
    const gap = sortedCandidates[i] - sortedCandidates[i - 1]
    if (gap < tolerance * 1.5) {
      currentCluster.push(sortedCandidates[i])
    } else {
      const clusterCenter = currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length
      clusters.push(clusterCenter)
      currentCluster = [sortedCandidates[i]]
    }
  }
  
  if (currentCluster.length > 0) {
    const clusterCenter = currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length
    clusters.push(clusterCenter)
  }
  
  return clusters.sort((a, b) => a - b)
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
 * Find where the actual table starts and identify the header row
 * Skips descriptive text rows at the top
 */
function findTableSection(rows) {
  if (rows.length === 0) {
    return { tableStartIndex: -1, headerRowIndex: -1 }
  }
  
  // Analyze rows to find the table section
  // A table typically has:
  // 1. A header row with short, capitalized words (like "Company", "Contact", "Country")
  // 2. Multiple data rows with similar column alignment
  
  let bestTableStart = 0
  let bestHeaderRow = 0
  let bestScore = 0
  
  // Try different starting points
  for (let startIdx = 0; startIdx < Math.min(rows.length, 10); startIdx++) {
    const candidateRows = rows.slice(startIdx)
    
    // Find the most likely header row in this section
    for (let headerIdx = 0; headerIdx < Math.min(candidateRows.length, 5); headerIdx++) {
      const headerRow = candidateRows[headerIdx]
      const dataRows = candidateRows.slice(headerIdx + 1, headerIdx + 4) // Check next 3 rows
      
      if (headerRow.length === 0 || dataRows.length === 0) continue
      
      // Score this candidate:
      // 1. Header row should have 2-10 words (reasonable column count)
      // 2. Header words should be short (typical header words)
      // 3. Data rows should align with header columns
      
      let score = 0
      
      // Check header row characteristics
      const headerWords = headerRow.map(w => w.text.trim()).filter(w => w.length > 0)
      if (headerWords.length >= 2 && headerWords.length <= 10) {
        score += 20
        
        // Check if header words are short (typical headers)
        const avgHeaderLength = headerWords.reduce((sum, w) => sum + w.length, 0) / headerWords.length
        if (avgHeaderLength < 10) {
          score += 15
        }
        
        // Check if header words start with capital letters
        const capitalizedCount = headerWords.filter(w => /^[A-Z]/.test(w)).length
        if (capitalizedCount === headerWords.length) {
          score += 10
        }
      }
      
      // Check if data rows align with header
      if (dataRows.length > 0) {
        // Calculate column positions from header
        const headerSorted = [...headerRow].sort((a, b) => a.bbox.x0 - b.bbox.x0)
        const headerColumnPositions = []
        let currentCol = [headerSorted[0]]
        
        for (let i = 1; i < headerSorted.length; i++) {
          const gap = headerSorted[i].bbox.x0 - headerSorted[i - 1].bbox.x1
          if (gap < 50) {
            currentCol.push(headerSorted[i])
          } else {
            headerColumnPositions.push(Math.min(...currentCol.map(w => w.bbox.x0)))
            currentCol = [headerSorted[i]]
          }
        }
        if (currentCol.length > 0) {
          headerColumnPositions.push(Math.min(...currentCol.map(w => w.bbox.x0)))
        }
        
        // Check if data rows have similar column structure
        let alignmentScore = 0
        dataRows.forEach(dataRow => {
          if (dataRow.length === 0) return
          const dataSorted = [...dataRow].sort((a, b) => a.bbox.x0 - b.bbox.x0)
          
          // Count how many data words align with header columns
          dataSorted.forEach(word => {
            const wordX = word.bbox.x0
            const aligned = headerColumnPositions.some(colX => Math.abs(wordX - colX) < 100)
            if (aligned) alignmentScore++
          })
        })
        
        if (alignmentScore > 0) {
          score += Math.min(alignmentScore * 2, 30)
        }
      }
      
      if (score > bestScore) {
        bestScore = score
        bestTableStart = startIdx
        bestHeaderRow = startIdx + headerIdx
      }
    }
  }
  
  // If we found a good table section, return it
  if (bestScore >= 30) {
    return { tableStartIndex: bestTableStart, headerRowIndex: bestHeaderRow }
  }
  
  // Fallback: use first row as header if no good match found
  return { tableStartIndex: 0, headerRowIndex: 0 }
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
