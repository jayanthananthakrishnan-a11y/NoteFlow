import React from 'react'

export default function ChannelNav({ active, onChange }) {
  const tabs = ['Home', 'Notes', 'Cheat Sheets', 'Question Papers', 'Flashcards', 'Posts']
  return (
    <nav className="flex gap-2 overflow-auto py-2" role="tablist" aria-label="Channel sections">
      {tabs.map(t => {
        const isActive = active === t
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
            className={`px-3 py-1 rounded whitespace-nowrap ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
          >
            {t}
          </button>
        )
      })}
    </nav>
  )
}
