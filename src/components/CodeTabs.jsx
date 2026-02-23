import { useState } from 'react'
import { generateCompleteSQL, generateCreateTableSQL, generateInsertStatements, downloadSQL } from '../utils/sqlGenerator'
import { generateTextHTML, generateTableHTML, generateBothHTML, downloadHTML } from '../utils/htmlGenerator'

export default function CodeTabs({ contentType, extractedData, tableData, tableName = 'extracted_table' }) {
  const [activeTab, setActiveTab] = useState('sql') // 'sql' or 'html'
  const [sqlType, setSqlType] = useState('complete') // 'complete', 'create', 'insert'
  const [copied, setCopied] = useState(false)

  // Check if we have table data for SQL
  const hasTableData = tableData && tableData.headers && tableData.headers.length > 0
  const hasContent = extractedData && (
    (contentType === 'text' && extractedData.text) ||
    (contentType === 'table' && hasTableData) ||
    (contentType === 'both' && (extractedData.text || hasTableData))
  )

  if (!hasContent) {
    return null
  }

  // Get SQL code
  const getSQL = () => {
    if (!hasTableData) return '-- No table data available for SQL generation'
    
    switch (sqlType) {
      case 'create':
        return generateCreateTableSQL(tableData, tableName)
      case 'insert':
        return generateInsertStatements(tableData, tableName)
      default:
        return generateCompleteSQL(tableData, tableName)
    }
  }

  // Get HTML code
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

  const sqlCode = getSQL()
  const htmlCode = getHTML()

  const handleCopy = () => {
    const codeToCopy = activeTab === 'sql' ? sqlCode : htmlCode
    navigator.clipboard.writeText(codeToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (activeTab === 'sql') {
      downloadSQL(sqlCode, tableName)
    } else {
      downloadHTML(htmlCode, 'extracted_content')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'sql'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            SQL
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'html'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            HTML
          </button>
        </div>
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
            Download {activeTab === 'sql' ? 'SQL' : 'HTML'}
          </button>
        </div>
      </div>

      {/* SQL Tab Content */}
      {activeTab === 'sql' && (
        <div>
          {hasTableData ? (
            <>
              <div className="mb-4">
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sqlType"
                      value="complete"
                      checked={sqlType === 'complete'}
                      onChange={(e) => setSqlType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Complete (CREATE + INSERT)</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sqlType"
                      value="create"
                      checked={sqlType === 'create'}
                      onChange={(e) => setSqlType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">CREATE TABLE only</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sqlType"
                      value="insert"
                      checked={sqlType === 'insert'}
                      onChange={(e) => setSqlType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">INSERT only</span>
                  </label>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono">
                  <code>{sqlCode}</code>
                </pre>
              </div>
            </>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
              SQL code is only available for table data. Please extract a table to see SQL code.
            </div>
          )}
        </div>
      )}

      {/* HTML Tab Content */}
      {activeTab === 'html' && (
        <div>
          {htmlCode && !htmlCode.includes('<!-- No') ? (
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
              <pre className="text-sm text-green-400 font-mono">
                <code>{htmlCode}</code>
              </pre>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
              No HTML content available.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
