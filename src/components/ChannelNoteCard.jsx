import React from 'react'
import { Link } from 'react-router-dom'

export default function ChannelNoteCard({ note }) {
  return (
    <article className="card-hover bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-hidden">
        <img
          src={note.thumbnail}
          alt="thumb"
          className="w-full h-40 object-cover image-hover-zoom"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold">
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
            to={`/channel/${encodeURIComponent(note.creator)}`}
            className="text-blue-600 dark:text-blue-400 hover:underline transition-all"
          >
            {note.creator}
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-3">
            <span className="transition-transform hover:scale-110">👍 123</span>
            <span className="transition-transform hover:scale-110">👁️ 4.5k</span>
            <span className="transition-transform hover:scale-110">⭐ 4.6</span>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded transition-all ${
              note.free
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
            }`}
          >
            {note.free ? 'Free' : 'Paid'}
          </span>
        </div>
      </div>
    </article>
  )
}
