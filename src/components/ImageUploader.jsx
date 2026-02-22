import { useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'

export default function ImageUploader({ onImageSelect, imageFile }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.type.startsWith('image/')) {
        onImageSelect(file)
      }
    }
  }, [onImageSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  })

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile()
          const file = new File([blob], 'pasted-image.png', { type: blob.type })
          onImageSelect(file)
          e.preventDefault()
          break
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [onImageSelect])

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Drop the image here...</p>
          ) : (
            <>
              <p className="text-gray-700 font-medium mb-2">
                Drag & drop an image here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Or press Ctrl+V (Cmd+V on Mac) to paste from clipboard
              </p>
            </>
          )}
        </div>
      </div>
      {imageFile && (
        <p className="mt-2 text-sm text-gray-600 text-center">
          Selected: {imageFile.name}
        </p>
      )}
    </div>
  )
}
