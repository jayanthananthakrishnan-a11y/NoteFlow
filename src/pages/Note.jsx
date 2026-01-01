import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { notesAPI } from '../services/api'
import { getUser, isCreator } from '../utils/auth'
import BookmarkButton from '../components/BookmarkButton'
import LikeButton from '../components/LikeButton'
import Comments from '../components/Comments'
import PurchaseModal from '../components/PurchaseModal'

export default function Note() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const user = getUser()
  const userIsCreator = isCreator()

  useEffect(() => {
    fetchNote()
  }, [id])

  const fetchNote = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await notesAPI.getNoteById(id)
      
      if (response.success) {
        setNote(response.data.note)
      } else {
        setError('Failed to load note')
      }
    } catch (err) {
      console.error('Error fetching note:', err)
      setError(err.message || 'Failed to load note')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await notesAPI.deleteNote(id)
      
      if (response.success) {
        alert('Note deleted successfully')
        navigate('/creator-dashboard')
      } else {
        alert('Failed to delete note')
      }
    } catch (err) {
      console.error('Error deleting note:', err)
      alert(err.message || 'Failed to delete note')
    } finally {
      setIsDeleting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading note...</p>
      </div>
    )
  }

  // Error state
  if (error || !note) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-red-600 dark:text-red-400">
          {error || 'Note not found'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Go Back
        </button>
      </div>
    )
  }

  const isFree = parseFloat(note.price) === 0
  const isOwner = note.is_owner
  const isPurchased = note.is_purchased
  const canViewFull = note.content_access?.can_view_full || false
  const availableContent = note.content_access?.available_content || []
  const lockedCount = note.content_access?.locked_content_count || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Back
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{note.title}</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              by{' '}
              <Link
                to={`/channel/${encodeURIComponent(note.creator_name)}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {note.creator_name}
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {isFree ? (
              <span className="px-3 py-1 bg-green-500 text-white rounded font-medium">Free</span>
            ) : (
              <span className="px-3 py-1 bg-yellow-500 text-gray-900 rounded font-medium">${note.price}</span>
            )}
          </div>
          <LikeButton noteId={note.id} />
          <BookmarkButton noteId={note.id} />
        </div>
      </div>

      {/* Owner Actions */}
      {isOwner && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                You are the owner of this note
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Manage your note settings below
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/creator-dashboard?edit=${note.id}`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                Edit Note
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
            {canViewFull ? (
              // Full content access
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Note Content</h2>
                
                {/* Display free topics */}
                {note.free_topics && note.free_topics.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
                      Free Topics
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {note.free_topics.map((topic, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300">{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Display all topics for owners/purchasers */}
                {note.topics && note.topics.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">All Topics Covered</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {note.topics.map((topic, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300">{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Content URLs */}
                {availableContent.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Available Content</h3>
                    {availableContent.map((url, idx) => (
                      <div key={idx} className="border border-gray-300 dark:border-gray-600 rounded">
                        {note.content_type === 'pdf' ? (
                          <iframe src={url} title={`${note.title} - Content ${idx + 1}`} className="w-full h-[70vh]" />
                        ) : (
                          <img src={url} alt={`${note.title} - Content ${idx + 1}`} className="w-full h-auto object-contain" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Locked content preview
              <div className="relative">
                {note.thumbnail_url ? (
                  <img
                    src={note.thumbnail_url}
                    alt={note.title}
                    className="w-full h-auto object-cover filter blur-sm"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 filter blur-sm flex items-center justify-center">
                    <div className="text-6xl">📄</div>
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="bg-white/95 dark:bg-gray-900/90 p-8 rounded-lg text-center max-w-md">
                    <div className="text-3xl mb-4">🔒</div>
                    <h3 className="text-xl font-semibold mb-2">Locked Content</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      This is paid content. Purchase to unlock full access to all notes and materials.
                    </p>
                    
                    {/* Show free preview if available */}
                    {note.free_topics && note.free_topics.length > 0 && (
                      <div className="mb-4 text-left bg-green-50 dark:bg-green-900/20 p-4 rounded">
                        <p className="font-semibold text-green-800 dark:text-green-300 mb-2">
                          Free Preview Topics:
                        </p>
                        <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-400">
                          {note.free_topics.map((topic, idx) => (
                            <li key={idx}>{topic}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {lockedCount} content item{lockedCount !== 1 ? 's' : ''} locked
                    </p>

                    {!isOwner && (
                      <button
                        onClick={() => setIsPurchaseModalOpen(true)}
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-medium"
                      >
                        Purchase for ${note.price}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3">About this note</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                <span className="ml-2 font-medium">{note.subject}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="ml-2 font-medium capitalize">{note.content_type}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>
                <span className="ml-2">{new Date(note.date_uploaded).toLocaleDateString()}</span>
              </div>
              {note.date_modified && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                  <span className="ml-2">{new Date(note.date_modified).toLocaleDateString()}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500 dark:text-gray-400">Access:</span>
                <span className={`ml-2 font-medium ${isFree ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {isFree ? 'Free' : `$${note.price}`}
                </span>
              </div>
            </div>

            {note.description && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">{note.description}</p>
              </div>
            )}
          </div>

          {note.topics && note.topics.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {note.topics.slice(0, 10).map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3">Actions</h3>
            <div className="flex flex-col gap-2">
              <BookmarkButton noteId={note.id} />
              <button className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                Share
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Comments Section */}
      <Comments noteId={note.id} />

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        note={{ ...note, price: note.price }}
        onPurchaseSuccess={fetchNote}
      />
    </div>
  )
}
