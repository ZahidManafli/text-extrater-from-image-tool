export default function ContentTypeSelector({ 
  detectedType, 
  userChoice, 
  onChoiceChange 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        What would you like to extract?
      </h3>
      
      {detectedType && (
        <p className="text-sm text-gray-600 mb-4">
          Detected: <span className="font-medium capitalize">{detectedType}</span>
        </p>
      )}
      
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="contentType"
            value="text"
            checked={userChoice === 'text'}
            onChange={(e) => onChoiceChange(e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700 font-medium">Plain Text</span>
        </label>
        
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="contentType"
            value="table"
            checked={userChoice === 'table'}
            onChange={(e) => onChoiceChange(e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700 font-medium">Table</span>
        </label>
        
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="contentType"
            value="both"
            checked={userChoice === 'both'}
            onChange={(e) => onChoiceChange(e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700 font-medium">Both Text & Table</span>
        </label>
      </div>
    </div>
  )
}
