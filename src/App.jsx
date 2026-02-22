import { useState, useEffect } from 'react'
import ImageUploader from './components/ImageUploader'
import ImagePreview from './components/ImagePreview'
import ContentTypeSelector from './components/ContentTypeSelector'
import FormatSelector from './components/FormatSelector'
import ResultsDisplay from './components/ResultsDisplay'
import { performOCR } from './utils/ocr'
import { detectTable } from './utils/tableDetector'
import { parseText } from './utils/textParser'
import { extractTable } from './utils/tableExtractor'
import { generateExcel, generateCSV } from './utils/csvGenerator'
import { generateJSON } from './utils/jsonGenerator'

function App() {
  const [imageFile, setImageFile] = useState(null)
  const [ocrResult, setOcrResult] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [detectedType, setDetectedType] = useState(null)
  const [contentType, setContentType] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [format, setFormat] = useState('excel')
  const [error, setError] = useState(null)

  // Handle image selection
  const handleImageSelect = (file) => {
    setImageFile(file)
    setOcrResult(null)
    setDetectedType(null)
    setContentType(null)
    setExtractedData(null)
    setError(null)
    setProgress(0)
  }

  // Perform OCR when image is selected
  useEffect(() => {
    if (!imageFile) return

    const processImage = async () => {
      setProcessing(true)
      setError(null)
      setProgress(0)

      try {
        const result = await performOCR(imageFile, (prog) => {
          setProgress(prog)
        })

        setOcrResult(result)

        // Detect content type
        const detection = detectTable(result)
        setDetectedType(detection.suggestion)
        setContentType(detection.suggestion) // Auto-select detected type
      } catch (err) {
        console.error('OCR Error:', err)
        setError('Failed to process image. Please try again with a clearer image.')
      } finally {
        setProcessing(false)
        setProgress(0)
      }
    }

    processImage()
  }, [imageFile])

  // Extract data based on content type
  useEffect(() => {
    if (!ocrResult || !contentType) return

    try {
      if (contentType === 'text') {
        const parsed = parseText(ocrResult.text)
        setExtractedData(parsed)
      } else if (contentType === 'table') {
        const tableData = extractTable(ocrResult)
        setExtractedData(tableData)
      }
    } catch (err) {
      console.error('Extraction Error:', err)
      setError('Failed to extract data. Please try again.')
    }
  }, [ocrResult, contentType])

  // Handle download
  const handleDownload = () => {
    if (!extractedData) return

    try {
      if (format === 'excel') {
        if (contentType === 'table') {
          generateExcel(extractedData, 'extracted_table')
        } else {
          // For text, create a simple CSV
          const csvData = {
            headers: ['Text', 'Emails', 'Phones', 'URLs'],
            rows: [[
              extractedData.text || '',
              (extractedData.emails || []).join('; '),
              (extractedData.phones || []).join('; '),
              (extractedData.urls || []).join('; ')
            ]]
          }
          generateCSV(csvData, 'extracted_text')
        }
      } else {
        generateJSON(extractedData, 'extracted_data')
      }
    } catch (err) {
      console.error('Download Error:', err)
      setError('Failed to generate download file. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Text & Table Image Extractor
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Upload an image or paste from clipboard to extract text or table data
        </p>

        {/* Image Upload */}
        <div className="mb-8">
          <ImageUploader onImageSelect={handleImageSelect} imageFile={imageFile} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Image Preview */}
        {imageFile && <ImagePreview imageFile={imageFile} />}

        {/* Processing Indicator */}
        {processing && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">Processing image...</span>
              <span className="text-gray-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Type Selector */}
        {ocrResult && !processing && (
          <ContentTypeSelector
            detectedType={detectedType}
            userChoice={contentType}
            onChoiceChange={setContentType}
          />
        )}

        {/* Results Display */}
        {extractedData && !processing && (
          <ResultsDisplay
            contentType={contentType}
            extractedData={extractedData}
          />
        )}

        {/* Format Selector and Download */}
        {extractedData && !processing && (
          <FormatSelector
            format={format}
            onFormatChange={setFormat}
            onDownload={handleDownload}
          />
        )}
      </div>
    </div>
  )
}

export default App
