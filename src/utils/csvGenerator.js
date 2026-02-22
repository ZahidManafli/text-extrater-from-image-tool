import * as XLSX from 'xlsx'

/**
 * Generate CSV/Excel file from table data
 * @param {Object} tableData - Table data with headers and rows
 * @param {string} filename - Output filename (without extension)
 */
export function generateExcel(tableData, filename = 'extracted_table') {
  const { headers, rows } = tableData
  
  // Create worksheet data
  const worksheetData = [headers, ...rows]
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  
  // Generate Excel file and download
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

/**
 * Generate CSV file from table data
 * @param {Object} tableData - Table data with headers and rows
 * @param {string} filename - Output filename (without extension)
 */
export function generateCSV(tableData, filename = 'extracted_table') {
  const { headers, rows } = tableData
  
  // Convert to CSV format
  const csvRows = []
  
  // Add headers
  csvRows.push(headers.map(h => escapeCSVValue(h)).join(','))
  
  // Add rows
  rows.forEach(row => {
    csvRows.push(row.map(cell => escapeCSVValue(cell)).join(','))
  })
  
  const csvContent = csvRows.join('\n')
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) return ''
  
  const stringValue = String(value)
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}
