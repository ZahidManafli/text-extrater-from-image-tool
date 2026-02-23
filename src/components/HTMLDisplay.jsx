import { useState } from 'react'
import { generateTextHTML, generateTableHTML, generateBothHTML, downloadHTML } from '../utils/htmlGenerator'

export default function HTMLDisplay({ contentType, extractedData }) {
  const [copied, setCopied] = useState(false)

  if (!extractedData) {
    return null
  }

  const getHTML = () => {
    if (contentType === 'text') {
      return generateTextHTML(extractedData)
    } else if (contentType === 'table') {
      return generateTableHTML(extractedData)
    } else if (contentType === 'both') {
      return generateBothHTML(extractedData.text || {}, extractedData.table || {})
    }
    return ''
  }

  const htmlCode = getHTML()

  if (!htmlCode || htmlCode.includes('<!-- No')) {
    return null
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    downloadHTML(htmlCode, 'extracted_content')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          HTML Code
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Download HTML
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
        <pre className="text-sm text-green-400 font-mono">
          <code>{htmlCode}</code>
        </pre>
      </div>
    </div>
  )
}
