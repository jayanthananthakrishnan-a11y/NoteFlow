import React, { useState } from 'react'

export default function UploadModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    price: '',
    free: true,
    contentType: 'pdf',
    tags: ''
  })
  const [file, setFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [uploading, setUploading] = useState(false)

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleThumbnailChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setThumbnail(selectedFile)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setUploading(true)

    // Mock upload process
    setTimeout(() => {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      alert(
        `✅ Note uploaded successfully!\n\n` +
        `Title: ${formData.title}\n` +
        `Subject: ${formData.subject}\n` +
        `Type: ${formData.free ? 'Free' : 'Paid ($' + formData.price + ')'}\n` +
        `Content Type: ${formData.contentType}\n` +
        `File: ${file?.name || 'N/A'}\n` +
        `Tags: ${tagsArray.join(', ') || 'None'}\n\n` +
        `Your note will be reviewed and published shortly.`
      )
      setUploading(false)
      // Reset form
      setFormData({
        title: '',
        subject: '',
        description: '',
        price: '',
        free: true,
        contentType: 'pdf',
        tags: ''
      })
      setFile(null)
      setThumbnail(null)
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold">Upload Note</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Share your study materials with the community
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="title">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              placeholder="e.g., Calculus I - Derivatives Complete Guide"
              required
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="subject">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              required
            >
              <option value="">Select a subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="History">History</option>
              <option value="Literature">Literature</option>
              <option value="Economics">Economics</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="description">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              placeholder="Describe what your notes cover..."
              required
            />
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="contentType">
              Content Type
            </label>
            <select
              id="contentType"
              name="contentType"
              value={formData.contentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="file">
              Upload File <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="flex-1 text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4"
                required
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="thumbnail">
              Thumbnail (Optional)
            </label>
            <input
              id="thumbnail"
              type="file"
              onChange={handleThumbnailChange}
              className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-600 hover:file:bg-gray-100 dark:file:bg-gray-700 dark:file:text-gray-400"
              accept=".jpg,.jpeg,.png"
            />
            {thumbnail && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {thumbnail.name}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="tags">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              placeholder="e.g., calculus, derivatives, chapter3"
            />
          </div>

          {/* Pricing */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                id="free"
                name="free"
                type="checkbox"
                checked={formData.free}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="free" className="text-sm font-medium">
                Make this note free
              </label>
            </div>

            {!formData.free && (
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="price">
                  Price (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.99"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="9.99"
                  required={!formData.free}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
