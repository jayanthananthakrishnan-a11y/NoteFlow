import React, { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import NoteCard from '../components/NoteCard'
import { sampleNotes } from '../data/sampleNotes'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function Search() {
  const q = useQuery().get('q') || ''
  const [subject, setSubject] = useState('')
  const [creator, setCreator] = useState('')
  const [onlyFree, setOnlyFree] = useState(false)

  const subjects = Array.from(new Set(sampleNotes.map(n => n.subject)))
  const creators = Array.from(new Set(sampleNotes.map(n => n.creator)))

  const results = useMemo(() => {
    return sampleNotes.filter(n => {
      if (q && !`${n.title} ${n.creator} ${n.subject}`.toLowerCase().includes(q.toLowerCase())) return false
      if (subject && n.subject !== subject) return false
      if (creator && n.creator !== creator) return false
      if (onlyFree && !n.free) return false
      return true
    })
  }, [q, subject, creator, onlyFree])

  return (
    <div className="md:flex gap-6">
      <aside className="w-full md:w-64 mb-6 md:mb-0">
        <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-2">Filters</h3>
          <label className="block mb-2 text-sm">Subject</label>
          <select className="w-full mb-3 p-2 border rounded" value={subject} onChange={e => setSubject(e.target.value)}>
            <option value="">All</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <label className="block mb-2 text-sm">Creator</label>
          <select className="w-full mb-3 p-2 border rounded" value={creator} onChange={e => setCreator(e.target.value)}>
            <option value="">All</option>
            {creators.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyFree} onChange={e => setOnlyFree(e.target.checked)} />
            Only free
          </label>
        </div>
      </aside>

      <section className="flex-1">
        <h2 className="text-xl font-semibold mb-4">Search Results {q ? `for "${q}"` : ''}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {results.length ? results.map(n => <NoteCard key={n.id} note={n} />) : <div className="text-gray-500">No results</div>}
        </div>
      </section>
    </div>
  )
}
