import React from 'react'
import { Link } from 'react-router-dom'

export default function NoteCard({ note }) {
  // Handle both old sample data format and new API format
  const thumbnail = note.thumbnail_url || note.thumbnail || 'https://via.placeholder.com/400x300?text=No+Image'
  const creatorName = note.creator_name || note.creator || 'Unknown'
  const isFree = note.free !== undefined ? note.free : (parseFloat(note.price) === 0)
  
  return (
    <article className="card-hover bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-hidden">
        <img
          src={thumbnail}
          alt="thumbnail"
          className="w-full h-40 object-cover image-hover-zoom"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
          }}
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold truncate">
          <Link
            to={`/note/${note.id}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {note.title}
          </Link>
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          by{' '}
          <Link
            to={`/channel/${encodeURIComponent(creatorName)}`}
            className="text-blue-600 dark:text-blue-400 hover:underline transition-all"
          >
            {creatorName}
          </Link>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded transition-all ${
              isFree
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
            }`}
          >
            {isFree ? 'Free' : `$${note.price}`}
          </span>
          <Link
            to={`/note/${note.id}`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium transition-all"
          >
            Preview →
          </Link>
        </div>
      </div>
    </article>
  )
}
