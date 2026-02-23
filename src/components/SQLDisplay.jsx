import { useState } from 'react'
import { generateCompleteSQL, generateCreateTableSQL, generateInsertStatements, downloadSQL } from '../utils/sqlGenerator'

export default function SQLDisplay({ tableData, tableName = 'extracted_table' }) {
  const [sqlType, setSqlType] = useState('complete') // 'complete', 'create', 'insert'
  const [copied, setCopied] = useState(false)

  if (!tableData || !tableData.headers || tableData.headers.length === 0) {
    return null
  }

  const getSQL = () => {
    switch (sqlType) {
      case 'create':
        return generateCreateTableSQL(tableData, tableName)
      case 'insert':
        return generateInsertStatements(tableData, tableName)
      default:
        return generateCompleteSQL(tableData, tableName)
    }
  }

  const sqlCode = getSQL()

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    downloadSQL(sqlCode, tableName)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          SQL Code
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
            Download SQL
          </button>
        </div>
      </div>

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
    </div>
  )
}
