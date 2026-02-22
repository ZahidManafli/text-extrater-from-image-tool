import { useState, useEffect } from 'react'

export default function ImagePreview({ imageFile }) {
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImageUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setImageUrl(null)
    }
  }, [imageFile])

  if (!imageFile || !imageUrl) return null

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-auto max-h-96 object-contain"
        />
      </div>
    </div>
  )
}
