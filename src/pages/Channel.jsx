import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { notesAPI } from '../services/api'
import CreatorProfile from '../components/CreatorProfile'
import ChannelNav from '../components/ChannelNav'
import ChannelNoteCard from '../components/ChannelNoteCard'
import { creators } from '../data/creators'

export default function Channel() {
  const { creator, section } = useParams()
  const navigate = useNavigate()
  const name = decodeURIComponent(creator || '')
  const creatorObj = creators.find(c => c.name === name) || { name }
  const [active, setActive] = useState(section ? decodeURIComponent(section) : 'Home')
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const s = section ? decodeURIComponent(section) : 'Home'
    setActive(s)
  }, [section])

  useEffect(() => {
    fetchCreatorNotes()
  }, [name])

  const fetchCreatorNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch notes by creator name
      const response = await notesAPI.getAllNotes({ search: name, limit: 50 })
      
      if (response.success) {
        // Filter notes by creator name (since we search by name)
        const creatorNotes = response.data.notes.filter(n =>
          n.creator_name?.toLowerCase() === name.toLowerCase()
        )
        setNotes(creatorNotes)
      }
    } catch (err) {
      console.error('Error fetching creator notes:', err)
      setError('Failed to load creator notes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <CreatorProfile creator={creatorObj} />

      <div>
        <ChannelNav
          active={active}
          onChange={t => {
            setActive(t)
            const encoded = encodeURIComponent(t === 'Home' ? '' : t)
            const path = t === 'Home' ? `/channel/${encodeURIComponent(name)}` : `/channel/${encodeURIComponent(name)}/${encoded}`
            navigate(path)
          }}
        />

        <section className="mt-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notes...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          ) : (
            <>
              {active === 'Home' && (
                <>
                  {notes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {notes.map(n => <ChannelNoteCard key={n.id} note={n} />)}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-400">No notes found for this creator</p>
                    </div>
                  )}
                </>
              )}

              {active !== 'Home' && (
                <div className="bg-white dark:bg-gray-800 rounded p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold">{active}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Content for the <strong>{active}</strong> section.</p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {notes.length > 0 ? (
                      notes.map(n => <ChannelNoteCard key={n.id} note={n} />)
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">No notes available</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
