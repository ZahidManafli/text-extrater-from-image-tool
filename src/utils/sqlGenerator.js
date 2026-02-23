/**
 * Generate SQL CREATE TABLE statement from table data
 * @param {Object} tableData - Table data with headers and rows
 * @param {string} tableName - Name for the SQL table (default: 'extracted_table')
 * @returns {string} SQL CREATE TABLE statement
 */
export function generateCreateTableSQL(tableData, tableName = 'extracted_table') {
  const { headers = [], rows = [] } = tableData
  
  if (headers.length === 0) {
    return '-- No table structure to generate SQL from'
  }
  
  // Sanitize table name (remove special characters, spaces)
  const sanitizedTableName = sanitizeIdentifier(tableName)
  
  // Analyze data types for each column
  const columnTypes = inferColumnTypes(headers, rows)
  
  // Generate column definitions
  const columnDefinitions = headers.map((header, index) => {
    const sanitizedHeader = sanitizeIdentifier(header || `column_${index + 1}`)
    const dataType = columnTypes[index] || 'VARCHAR(255)'
    return `  ${sanitizedHeader} ${dataType}`
  }).join(',\n')
  
  // Generate CREATE TABLE statement
  const createTableSQL = `CREATE TABLE ${sanitizedTableName} (\n${columnDefinitions}\n);`
  
  return createTableSQL
}

/**
 * Generate INSERT statements from table data
 * @param {Object} tableData - Table data with headers and rows
 * @param {string} tableName - Name for the SQL table (default: 'extracted_table')
 * @returns {string} SQL INSERT statements
 */
export function generateInsertStatements(tableData, tableName = 'extracted_table') {
  const { headers = [], rows = [] } = tableData
  
  if (headers.length === 0 || rows.length === 0) {
    return '-- No data to generate INSERT statements from'
  }
  
  const sanitizedTableName = sanitizeIdentifier(tableName)
  const sanitizedHeaders = headers.map((h, i) => sanitizeIdentifier(h || `column_${i + 1}`))
  const columnList = sanitizedHeaders.join(', ')
  
  const insertStatements = rows.map(row => {
    const values = row.map(value => {
      if (value === null || value === undefined || value === '') {
        return 'NULL'
      }
      // Escape single quotes and wrap in quotes
      const escapedValue = String(value).replace(/'/g, "''")
      return `'${escapedValue}'`
    }).join(', ')
    
    return `INSERT INTO ${sanitizedTableName} (${columnList}) VALUES (${values});`
  }).join('\n')
  
  return insertStatements
}

/**
 * Generate complete SQL script (CREATE TABLE + INSERT statements)
 * @param {Object} tableData - Table data with headers and rows
 * @param {string} tableName - Name for the SQL table (default: 'extracted_table')
 * @returns {string} Complete SQL script
 */
export function generateCompleteSQL(tableData, tableName = 'extracted_table') {
  const createTable = generateCreateTableSQL(tableData, tableName)
  const insertStatements = generateInsertStatements(tableData, tableName)
  
  return `${createTable}\n\n${insertStatements}`
}

/**
 * Infer SQL data types from column data
 * @param {Array} headers - Column headers
 * @param {Array<Array>} rows - Data rows
 * @returns {Array<string>} Array of SQL data types
 */
function inferColumnTypes(headers, rows) {
  const types = headers.map((_, colIndex) => {
    const columnValues = rows.map(row => row[colIndex]).filter(val => val !== null && val !== undefined && val !== '')
    
    if (columnValues.length === 0) {
      return 'VARCHAR(255)'
    }
    
    // Check if all values are numbers
    const allNumbers = columnValues.every(val => {
      const num = typeof val === 'number' ? val : parseFloat(String(val))
      return !isNaN(num) && isFinite(num)
    })
    
    if (allNumbers) {
      // Check if integers or decimals
      const hasDecimals = columnValues.some(val => {
        const num = typeof val === 'number' ? val : parseFloat(String(val))
        return num % 1 !== 0
      })
      
      if (hasDecimals) {
        return 'DECIMAL(10, 2)'
      } else {
        return 'INT'
      }
    }
    
    // Check if all values are dates
    const allDates = columnValues.every(val => {
      const date = new Date(String(val))
      return !isNaN(date.getTime())
    })
    
    if (allDates) {
      return 'DATE'
    }
    
    // Find max length for VARCHAR
    const maxLength = Math.max(...columnValues.map(val => String(val).length))
    const varcharLength = Math.min(Math.max(maxLength, 50), 1000)
    
    return `VARCHAR(${varcharLength})`
  })
  
  return types
}

/**
 * Sanitize identifier for SQL (remove special characters, handle spaces)
 * @param {string} identifier - Identifier to sanitize
 * @returns {string} Sanitized identifier
 */
function sanitizeIdentifier(identifier) {
  if (!identifier) return 'column_1'
  
  // Replace spaces and special characters with underscores
  let sanitized = String(identifier)
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
  
  // Ensure it starts with a letter or underscore
  if (!/^[a-zA-Z_]/.test(sanitized)) {
    sanitized = 'col_' + sanitized
  }
  
  // Ensure it's not empty
  if (!sanitized) {
    sanitized = 'column_1'
  }
  
  return sanitized.toLowerCase()
}

/**
 * Download SQL file
 * @param {string} sqlContent - SQL content to download
 * @param {string} filename - Output filename (without extension)
 */
export function downloadSQL(sqlContent, filename = 'extracted_table') {
  const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.sql`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
