export default function ResultsDisplay({ contentType, extractedData }) {
  if (!extractedData) {
    return null
  }

  // Handle "both" case
  if (contentType === 'both') {
    const textData = extractedData.text || {}
    const tableData = extractedData.table || {}
    
    return (
      <div className="mt-6 space-y-6">
        {/* Text Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Extracted Text Data
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text:
            </label>
            <div className="bg-gray-50 border rounded p-4 max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {textData.text || 'No text extracted'}
              </pre>
            </div>
          </div>

          {textData.emails && textData.emails.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emails ({textData.emails.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {textData.emails.map((email, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {email}
                  </span>
                ))}
              </div>
            </div>
          )}

          {textData.phones && textData.phones.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Numbers ({textData.phones.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {textData.phones.map((phone, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {phone}
                  </span>
                ))}
              </div>
            </div>
          )}

          {textData.urls && textData.urls.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URLs ({textData.urls.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {textData.urls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Extracted Table Data
          </h3>
          
          {tableData.headers && tableData.headers.length > 0 ? (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300">
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
                <tbody>
                  {tableData.rows && tableData.rows.map((row, rowIndex) => (
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
          ) : (
            <p className="text-gray-600">No table structure detected.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {contentType === 'text' ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Extracted Text Data
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text:
            </label>
            <div className="bg-gray-50 border rounded p-4 max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {extractedData.text || 'No text extracted'}
              </pre>
            </div>
          </div>

          {extractedData.emails && extractedData.emails.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emails ({extractedData.emails.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {extractedData.emails.map((email, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {email}
                  </span>
                ))}
              </div>
            </div>
          )}

          {extractedData.phones && extractedData.phones.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Numbers ({extractedData.phones.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {extractedData.phones.map((phone, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {phone}
                  </span>
                ))}
              </div>
            </div>
          )}

          {extractedData.urls && extractedData.urls.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URLs ({extractedData.urls.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {extractedData.urls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Extracted Table Data
          </h3>
          
          {extractedData.headers && extractedData.headers.length > 0 && (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    {extractedData.headers.map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left text-gray-800"
                      >
                        {header || `Column ${index + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {extractedData.rows && extractedData.rows.map((row, rowIndex) => (
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
          )}

          {(!extractedData.headers || extractedData.headers.length === 0) && (
            <p className="text-gray-600">No table structure detected.</p>
          )}
        </div>
      )}
    </div>
  )
}
