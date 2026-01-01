import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { notesAPI } from '../services/api'
import { isCreator, getUser } from '../utils/auth'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    subject: '',
    search: '',
    limit: 20,
    offset: 0,
  })
  const [pagination, setPagination] = useState(null)
  const user = getUser()
  const userIsCreator = isCreator()

  useEffect(() => {
    fetchNotes()
  }, [filters])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query params, excluding empty values
      const params = {}
      if (filters.subject) params.subject = filters.subject
      if (filters.search) params.search = filters.search
      if (filters.limit) params.limit = filters.limit
      if (filters.offset) params.offset = filters.offset

      const response = await notesAPI.getAllNotes(params)
      
      if (response.success) {
        setNotes(response.data.notes)
        setPagination(response.data.pagination)
      } else {
        setError('Failed to load notes')
      }
    } catch (err) {
      console.error('Error fetching notes:', err)
      setError(err.message || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectFilter = (subject) => {
    setFilters(prev => ({
      ...prev,
      subject: prev.subject === subject ? '' : subject,
      offset: 0
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchNotes()
  }

  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }))
  }

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Engineering']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Browse Notes</h1>
        {userIsCreator && (
          <Link
            to="/creator-dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
          >
            Upload Note
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search notes..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium self-center">Filter by subject:</span>
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => handleSubjectFilter(subject)}
              className={`px-3 py-1 rounded text-sm ${
                filters.subject === subject
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && filters.offset === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && notes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 dark:text-gray-400">No notes found</p>
          <p className="text-gray-500 dark:text-gray-500 mt-2">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}

      {/* Notes Grid */}
      {!loading && !error && notes.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
              <NoteCard key={note.id} note={note} currentUser={user} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.hasMore && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Showing {notes.length} of {pagination.total} notes
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function NoteCard({ note, currentUser }) {
  const isFree = parseFloat(note.price) === 0
  const isOwner = currentUser?.id === note.creator_id

  return (
    <Link
      to={`/note/${note.id}`}
      className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {note.thumbnail_url ? (
          <img
            src={note.thumbnail_url}
            alt={note.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
        {/* Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded ${
            isFree
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-gray-900'
          }`}>
            {isFree ? 'Free' : `$${note.price}`}
          </span>
        </div>
        {isOwner && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-500 text-white">
              Your Note
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{note.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{note.subject}</p>
        
        {note.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {note.description}
          </p>
        )}

        {/* Creator Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
              {note.creator_name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-600 dark:text-gray-400">{note.creator_name}</span>
          </div>
          <span className="text-gray-500 dark:text-gray-500">
            {new Date(note.date_uploaded).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
