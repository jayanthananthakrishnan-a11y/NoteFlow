import React, { useState, useEffect } from 'react';
import { bookmarksAPI } from '../services/api';
import { getToken } from '../utils/auth';

export default function BookmarkButton({ noteId, onBookmarkChange }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLoggedIn = !!getToken();

  useEffect(() => {
    if (noteId && isLoggedIn) {
      fetchBookmarkStatus();
    }
  }, [noteId, isLoggedIn]);

  const fetchBookmarkStatus = async () => {
    try {
      const response = await bookmarksAPI.checkBookmarkStatus(noteId);
      if (response.success) {
        setIsBookmarked(response.data.isBookmarked);
      }
    } catch (err) {
      console.error('Error fetching bookmark status:', err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isLoggedIn) {
      setError('Please log in to bookmark this note');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await bookmarksAPI.toggleBookmark(noteId);
      
      if (response.success) {
        setIsBookmarked(response.data.isBookmarked);
        
        // Notify parent component if callback provided
        if (onBookmarkChange) {
          onBookmarkChange(response.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to update bookmark');
      console.error('Error toggling bookmark:', err);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center relative">
      <button
        onClick={handleToggleBookmark}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          isBookmarked
            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={isLoggedIn ? (isBookmarked ? 'Remove bookmark' : 'Bookmark') : 'Log in to bookmark'}
      >
        <svg
          className={`w-5 h-5 transition-transform ${loading ? 'animate-pulse' : ''}`}
          fill={isBookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <span className="text-sm font-medium hidden sm:inline">
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      </button>
      
      {error && (
        <div className="absolute mt-12 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-400 text-sm whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}
