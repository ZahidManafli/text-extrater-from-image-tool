import { createWorker } from 'tesseract.js'

/**
 * Perform OCR on an image using Tesseract.js
 * Note: Progress callbacks cannot be used due to Web Worker serialization limitations.
 * The logger function cannot be cloned for the worker thread.
 * @param {File|string} image - Image file or image URL
 * @param {Function} onProgress - Progress callback (currently not supported due to worker limitations)
 * @returns {Promise<{text: string, words: Array, lines: Array}>}
 */
export async function performOCR(image, onProgress = null) {
  const worker = await createWorker('eng')
  
  try {
    // Note: We cannot pass a logger function to recognize() because functions
    // cannot be serialized for Web Workers. Progress tracking would require
    // a different approach (e.g., polling or using worker message events).
    // For now, we'll proceed without progress tracking.
    
    // If progress callback is provided, show initial progress
    if (onProgress) {
      onProgress(10) // Indicate processing started
    }
    
    const { data } = await worker.recognize(image)
    
    // Show completion if callback provided
    if (onProgress) {
      onProgress(100)
    }
    
    await worker.terminate()
    
    return {
      text: data.text,
      words: data.words || [],
      lines: data.lines || [],
      paragraphs: data.paragraphs || []
    }
  } catch (error) {
    await worker.terminate()
    throw error
  }
}
