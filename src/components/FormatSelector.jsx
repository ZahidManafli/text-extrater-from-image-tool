export default function FormatSelector({ format, onFormatChange, onDownload }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Download Format
      </h3>
      
      <div className="flex gap-4 mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="format"
            value="excel"
            checked={format === 'excel'}
            onChange={(e) => onFormatChange(e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700 font-medium">Excel (CSV)</span>
        </label>
        
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="format"
            value="json"
            checked={format === 'json'}
            onChange={(e) => onFormatChange(e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700 font-medium">JSON</span>
        </label>
      </div>

      <button
        onClick={onDownload}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Download {format === 'excel' ? 'Excel' : 'JSON'}
      </button>
    </div>
  )
}
