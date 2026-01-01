import React from 'react'

export default function QuestionPapers() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Question Papers
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Past exam papers, practice questions, and test materials for exam preparation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Placeholder cards */}
          {[
            { subject: 'Mathematics', papers: 12, year: '2023-2024' },
            { subject: 'Physics', papers: 8, year: '2023-2024' },
            { subject: 'Chemistry', papers: 10, year: '2023-2024' },
            { subject: 'Biology', papers: 9, year: '2023-2024' },
            { subject: 'Computer Science', papers: 15, year: '2023-2024' },
            { subject: 'English', papers: 7, year: '2023-2024' },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {item.subject.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.subject}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Academic Year {item.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      <strong className="text-green-600 dark:text-green-400">{item.papers}</strong> papers available
                    </span>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Filter section */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Filter by Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {['All', 'Midterm', 'Final', 'Practice', 'Mock Test'].map((filter) => (
              <button
                key={filter}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm font-medium"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-1">
                This page is under development
              </h3>
              <p className="text-sm text-green-800 dark:text-green-400">
                Question papers and practice materials will be available soon. Check out our notes, 
                flashcards, and quiz features to help with your exam preparation!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
