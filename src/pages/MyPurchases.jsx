import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { paymentsAPI } from '../services/api'

export default function MyPurchases() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 })

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async (offset = 0) => {
    try {
      setLoading(true)
      setError(null)
      const response = await paymentsAPI.getMyPurchases({ limit: 20, offset })
      
      if (response.success) {
        setPurchases(response.data.purchases)
        setPagination(response.data.pagination)
      } else {
        setError('Failed to load purchases')
      }
    } catch (err) {
      console.error('Error fetching purchases:', err)
      setError(err.message || 'Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    fetchPurchases(pagination.offset + pagination.limit)
  }

  // Loading state
  if (loading && purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your purchases...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Purchases</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and access all your purchased notes
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {pagination.total} {pagination.total === 1 ? 'purchase' : 'purchases'}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => fetchPurchases()}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && purchases.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold mb-2">No purchases yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start exploring and purchase notes to build your learning library
          </p>
          <Link
            to="/notes"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Browse Notes
          </Link>
        </div>
      )}

      {/* Purchases Grid */}
      {purchases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                {purchase.note_thumbnail ? (
                  <img
                    src={purchase.note_thumbnail}
                    alt={purchase.note_title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    📄
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded font-medium">
                    Purchased
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                  {purchase.note_title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {purchase.note_subject}
                </p>

                {/* Creator */}
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>👤</span>
                  <Link
                    to={`/channel/${encodeURIComponent(purchase.creator_name)}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                  >
                    {purchase.creator_name}
                  </Link>
                </div>

                {/* Purchase Info */}
                <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Paid:</span>
                    <span className="ml-1 font-semibold text-green-600 dark:text-green-400">
                      ${purchase.amount}
                    </span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {new Date(purchase.date).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/note/${purchase.note_id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    View Note
                  </Link>
                  <button
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Download"
                  >
                    ⬇️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {purchases.length > 0 && purchases.length < pagination.total && (
        <div className="text-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
