import { extractTable } from '../utils/tableExtractor'

export default function TableExtractor({ ocrResult }) {
  if (!ocrResult) {
    return null
  }

  const tableData = extractTable(ocrResult)

  if (tableData.headers.length === 0 && tableData.rows.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">No table structure detected.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Extracted Table
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          {tableData.headers.length > 0 && (
            <thead>
              <tr>
                {tableData.headers.map((header, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left text-gray-800"
                  >
                    {header || `Column ${index + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border border-gray-300 px-4 py-2 text-gray-700"
                  >
                    {cell || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hidden data for export */}
      <div className="hidden" data-export={JSON.stringify(tableData)} />
    </div>
  )
}
