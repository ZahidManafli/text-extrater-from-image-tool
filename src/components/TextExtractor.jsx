import { parseText } from '../utils/textParser'

export default function TextExtractor({ ocrResult }) {
  if (!ocrResult || !ocrResult.text) {
    return null
  }

  const parsedData = parseText(ocrResult.text)

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Extracted Text
      </h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Text:
        </label>
        <div className="bg-gray-50 border rounded p-4 max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
            {parsedData.text || 'No text extracted'}
          </pre>
        </div>
      </div>

      {(parsedData.emails.length > 0 || 
        parsedData.phones.length > 0 || 
        parsedData.urls.length > 0) && (
        <div className="space-y-4">
          {parsedData.emails.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Addresses ({parsedData.emails.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {parsedData.emails.map((email, index) => (
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

          {parsedData.phones.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Numbers ({parsedData.phones.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {parsedData.phones.map((phone, index) => (
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

          {parsedData.urls.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URLs ({parsedData.urls.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {parsedData.urls.map((url, index) => (
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
      )}

      {/* Hidden data for export */}
      <div className="hidden" data-export={JSON.stringify(parsedData)} />
    </div>
  )
}
