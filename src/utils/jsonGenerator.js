/**
 * Generate and download JSON file
 * @param {Object} data - Data to export
 * @param {string} filename - Output filename (without extension)
 */
export function generateJSON(data, filename = 'extracted_data') {
  const jsonContent = JSON.stringify(data, null, 2)
  
  // Create blob and download
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
