import React, { useState, useEffect } from 'react'
import NoteCard from '../components/NoteCard'
import { notesAPI } from '../services/api'

export default function Home() {
  const [trendingNotes, setTrendingNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingNotes()
  }, [])

  const fetchTrendingNotes = async () => {
    try {
      setLoading(true)
      const response = await notesAPI.getAllNotes({ limit: 8, sort_by: 'date_uploaded', sort_order: 'desc' })
      if (response.success) {
        setTrendingNotes(response.data.notes)
      }
    } catch (error) {
      console.error('Error fetching trending notes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Section */}
      <section className="text-center py-8 md:py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to NoteFlow
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
          Discover, share, and learn with high-quality educational content from creators around the world.
        </p>
      </section>

      {/* Trending Notes */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 md:mb-6 text-gray-900 dark:text-white">
          Trending Notes
        </h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : trendingNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {trendingNotes.map(n => (
              <NoteCard key={n.id} note={n} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">No notes available yet</p>
        )}
      </section>

      {/* Channels Section */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 md:mb-6 text-gray-900 dark:text-white">
          Popular Channels
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="card-hover p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">📐</div>
            <h3 className="font-semibold text-lg mb-2">Math Channel</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore mathematics from basics to advanced topics
            </p>
          </div>
          <div className="card-hover p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">🔬</div>
            <h3 className="font-semibold text-lg mb-2">Science Channel</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Discover the wonders of physics, chemistry, and biology
            </p>
          </div>
          <div className="card-hover p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-semibold text-lg mb-2">Humanities Channel</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dive into history, literature, and social sciences
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
