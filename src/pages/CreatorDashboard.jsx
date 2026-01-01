import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sampleNotes } from '../data/sampleNotes'
import { paymentsAPI } from '../services/api'

export default function CreatorDashboard() {
  const [userData] = useState(() => {
    const stored = localStorage.getItem('noteflow:user')
    return stored ? JSON.parse(stored) : { name: 'Creator' }
  })

  // Mock creator's notes (filter first 3 from sample)
  const myNotes = sampleNotes ? sampleNotes.slice(0, 3) : []

  // Earnings state
  const [earnings, setEarnings] = useState(null)
  const [earningsLoading, setEarningsLoading] = useState(true)
  const [earningsError, setEarningsError] = useState(null)

  // Mock stats
  const stats = {
    totalNotes: 12,
    totalViews: 3450,
    totalSales: 89,
    revenue: 445.50,
    followers: 234,
    avgRating: 4.7
  }

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      setEarningsLoading(true)
      setEarningsError(null)
      const response = await paymentsAPI.getCreatorEarnings({ limit: 10 })
      
      if (response.success) {
        setEarnings(response.data)
      }
    } catch (err) {
      console.error('Error fetching earnings:', err)
      // Only show error if it's not a 403 (not a creator)
      if (!err.message?.includes('403')) {
        setEarningsError(err.message)
      }
    } finally {
      setEarningsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {userData.name}! ✍️</h1>
            <p className="text-purple-100">Manage your content and track your success</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/upload"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              + Upload Note
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalNotes}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Notes</div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-3xl mb-2">👁️</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Views</div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">${stats.revenue}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-3xl mb-2">🛒</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalSales}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Sales</div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.followers}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.avgRating}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:shadow-lg transition-shadow group">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📤</div>
            <h3 className="font-semibold">Upload Note</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add new content</p>
          </button>

          <Link to={`/channel/${encodeURIComponent(userData.name)}`} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:shadow-lg transition-shadow group">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📺</div>
            <h3 className="font-semibold">My Channel</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">View public page</p>
          </Link>

          <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:shadow-lg transition-shadow group">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📊</div>
            <h3 className="font-semibold">Analytics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">View insights</p>
          </button>

          <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:shadow-lg transition-shadow group">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
            <h3 className="font-semibold">Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage account</p>
          </button>
        </div>
      </section>

      {/* Performance Chart */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Performance */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📈</span>
            <h2 className="text-xl font-semibold">Recent Performance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">This Week's Views</span>
                <span className="font-semibold text-green-600 dark:text-green-400">+23% ↑</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Sales Growth</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">+15% ↑</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Engagement Rate</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">+8% ↑</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Notes */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-semibold">Top Performing Notes</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="flex-1">
                <div className="font-semibold text-sm">Calculus Notes</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">1,234 views</div>
              </div>
              <div className="text-2xl">🥇</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="flex-1">
                <div className="font-semibold text-sm">Organic Chemistry</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">987 views</div>
              </div>
              <div className="text-2xl">🥈</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="flex-1">
                <div className="font-semibold text-sm">Physics Formula</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">765 views</div>
              </div>
              <div className="text-2xl">🥉</div>
            </div>
          </div>
        </div>
      </section>

      {/* My Notes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span>📚</span>
            My Notes
          </h2>
          <Link to="/search" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myNotes.map(note => (
            <div
              key={note.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{note.title}</h3>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {note.categories.slice(0, 2).map(cat => (
                  <span key={cat} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded">
                    {cat}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>👁️ {Math.floor(Math.random() * 500 + 200)} views</span>
                <span>💰 ${note.price}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  to={`/note/${note.id}`}
                  className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  View
                </Link>
                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span>🔔</span>
          Recent Activity
        </h2>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💰</div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">John Smith</span> purchased your note <span className="font-semibold">Calculus — Handwritten Notes</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 hours ago</p>
              </div>
              <span className="text-green-600 dark:text-green-400 font-semibold text-sm">+$5.00</span>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⭐</div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">Sarah Johnson</span> rated your note 5 stars
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 hours ago</p>
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="text-2xl">👥</div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">Mike Wilson</span> started following you
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💬</div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">Emma Davis</span> commented on <span className="font-semibold">Organic Chemistry</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Earnings Section */}
      {earnings && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span>💰</span>
            Creator Earnings
          </h2>
          
          {/* Earnings Summary */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-lg p-6 text-white mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-green-100 text-sm mb-1">Total Earnings</p>
                <p className="text-3xl font-bold">
                  ${earnings.summary.totalEarnings?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-green-100 text-sm mb-1">Total Sales</p>
                <p className="text-3xl font-bold">{earnings.summary.totalSales || 0}</p>
              </div>
              <div>
                <p className="text-green-100 text-sm mb-1">Average Sale</p>
                <p className="text-3xl font-bold">
                  ${earnings.summary.totalSales > 0
                    ? (earnings.summary.totalEarnings / earnings.summary.totalSales).toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          {earnings.transactions && earnings.transactions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {earnings.transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{transaction.note_title}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Purchased by <span className="font-medium">{transaction.buyer_name}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(transaction.date).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          +${transaction.amount}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.currency || 'USD'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {earnings.transactions && earnings.transactions.length === 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <div className="text-4xl mb-3">💵</div>
              <p className="text-gray-600 dark:text-gray-400">No sales yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Keep creating great content and sales will come!
              </p>
            </div>
          )}
        </section>
      )}

      {/* Earnings Loading State */}
      {earningsLoading && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span>💰</span>
            Creator Earnings
          </h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Loading earnings...</p>
          </div>
        </section>
      )}

      {/* Earnings Error State */}
      {earningsError && !earningsLoading && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span>💰</span>
            Creator Earnings
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{earningsError}</p>
            <button
              onClick={fetchEarnings}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Try again
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
