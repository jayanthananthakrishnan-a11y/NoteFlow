import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NoteCard from '../components/NoteCard'
import { bookmarksAPI, notesAPI } from '../services/api'
import { getUser, getToken } from '../utils/auth'
import { creators } from '../data/creators'

export default function Dashboard() {
  const [bookmarkedNotes, setBookmarkedNotes] = useState([])
  const [recommendedNotes, setRecommendedNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const user = getUser()
  const isLoggedIn = !!getToken()

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData()
    } else {
      fetchRecommendedNotes()
    }
  }, [isLoggedIn])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch bookmarked notes
      const bookmarksResponse = await bookmarksAPI.getBookmarks({ limit: 4 })
      if (bookmarksResponse.success && bookmarksResponse.data.bookmarks) {
        setBookmarkedNotes(bookmarksResponse.data.bookmarks)
      }
      
      // Fetch recommended notes
      await fetchRecommendedNotes()
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendedNotes = async () => {
    try {
      // Fetch recent notes as recommendations
      const notesResponse = await notesAPI.getAllNotes({ limit: 4, sort_by: 'date_uploaded', sort_order: 'desc' })
      if (notesResponse.success) {
        setRecommendedNotes(notesResponse.data.notes)
      }
    } catch (err) {
      console.error('Error fetching recommended notes:', err)
    } finally {
      if (!isLoggedIn) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-lg p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blue-100 text-sm sm:text-base">Continue your learning journey</p>
      </section>

      {/* Quick Navigation */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Link to="/" className="card-hover bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 text-center group">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🏠</div>
            <h3 className="font-semibold text-sm md:text-base">Home</h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Browse content</p>
          </Link>
          
          <Link to="/search" className="card-hover bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 text-center group">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">📝</div>
            <h3 className="font-semibold text-sm md:text-base">Notes</h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Find notes</p>
          </Link>
          
          <Link to="/flashcards" className="card-hover bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 text-center group">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🎴</div>
            <h3 className="font-semibold text-sm md:text-base">Flashcards</h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Study smart</p>
          </Link>
          
          <Link to="/quiz" className="card-hover bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 text-center group">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">📊</div>
            <h3 className="font-semibold text-sm md:text-base">Quiz</h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Test yourself</p>
          </Link>
        </div>
      </section>

      {/* AI Summary & Progress */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* AI Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl md:text-2xl">🤖</span>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">AI Summary</h2>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 md:p-4 transition-colors">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                You've studied <span className="font-semibold text-blue-600 dark:text-blue-400">4 topics</span> this week across Mathematics and Chemistry.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 md:p-4 transition-colors">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                Your focus areas: <span className="font-semibold">Calculus, Organic Chemistry</span>
              </p>
            </div>
            <button className="w-full mt-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-medium shadow-sm">
              View Detailed Insights
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl md:text-2xl">📈</span>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Your Progress</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300">Study Streak</span>
                <span className="font-semibold">7 days 🔥</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300">Notes Reviewed</span>
                <span className="font-semibold">12/20</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300">Quizzes Completed</span>
                <span className="font-semibold">5/10</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bookmarked Notes */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <span>⭐</span>
            Bookmarked Notes
          </h2>
          <Link to="/notes" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors">
            View All
          </Link>
        </div>
        {loading && isLoggedIn ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Loading bookmarks...</p>
          </div>
        ) : bookmarkedNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {bookmarkedNotes.map(bookmark => (
              <NoteCard
                key={bookmark.note_id || bookmark.id}
                note={{
                  id: bookmark.note_id || bookmark.id,
                  title: bookmark.note_title || bookmark.title,
                  subject: bookmark.note_subject || bookmark.subject,
                  description: bookmark.note_description || bookmark.description,
                  thumbnail_url: bookmark.note_thumbnail || bookmark.thumbnail_url,
                  price: bookmark.note_price || bookmark.price,
                  creator_name: bookmark.creator_name,
                  date_uploaded: bookmark.date_uploaded || bookmark.created_at
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-8 text-center shadow-sm">
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              {isLoggedIn
                ? 'No bookmarked notes yet. Start exploring to save your favorites!'
                : 'Sign in to bookmark your favorite notes'}
            </p>
            <Link to={isLoggedIn ? "/notes" : "/login"} className="inline-block mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
              {isLoggedIn ? 'Browse Notes' : 'Sign In'}
            </Link>
          </div>
        )}
      </section>

      {/* Recommended Notes */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <span>💡</span>
            Recommended for You
          </h2>
          <Link to="/notes" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors">
            View All
          </Link>
        </div>
        {loading && !isLoggedIn ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Loading recommendations...</p>
          </div>
        ) : recommendedNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {recommendedNotes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-8 text-center shadow-sm">
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">No recommendations available</p>
          </div>
        )}
      </section>

      {/* Recommended Channels */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <span>📺</span>
            Recommended Channels
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {creators.map(creator => (
            <Link
              key={creator.name}
              to={`/channel/${encodeURIComponent(creator.name)}`}
              className="card-hover bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 md:p-6 group"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-3 group-hover:scale-105 transition-transform duration-300"
                />
                <h3 className="font-semibold mb-1 text-sm md:text-base">{creator.name}</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Creator</p>
                {creator.youtube && (
                  <div className="mt-2 text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 md:mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
          <span>⏱️</span>
          Recent Activity
        </h2>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 shadow-sm">
          <div className="p-4 md:p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="text-xl md:text-2xl">📖</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm">
                  You reviewed <Link to="/note/1" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Calculus — Handwritten Notes</Link>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="text-xl md:text-2xl">✅</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm">
                  You completed a quiz on <span className="font-semibold">Organic Chemistry</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 hours ago</p>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="text-xl md:text-2xl">⭐</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm">
                  You bookmarked <Link to="/note/3" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Microeconomics Notes</Link>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
