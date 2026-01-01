import React from 'react'

export default function Posts() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 md:p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 md:mb-3">
            Posts
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Community discussions, updates, and educational content from creators
          </p>
        </div>

        <div className="space-y-4 md:space-y-6 mt-6 md:mt-8">
          {/* Placeholder post cards */}
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 md:p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 card-hover"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                    {String.fromCharCode(64 + item)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100">
                      Sample Post Title {item}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {item}h ago
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    This is a placeholder for post content. Posts will include educational discussions,
                    tips, announcements, and community interactions from content creators.
                  </p>
                  <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    <button className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors active:scale-95">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>0 likes</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors active:scale-95">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>0 comments</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-sm md:text-base text-purple-900 dark:text-purple-300 mb-1">
                This page is under development
              </h3>
              <p className="text-xs md:text-sm text-purple-800 dark:text-purple-400">
                The posts feature will be available soon. You'll be able to engage with educational content
                and community discussions from your favorite creators!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
