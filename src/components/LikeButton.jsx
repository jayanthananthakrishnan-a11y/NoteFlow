import React, { useState, useEffect } from 'react';
import { likesAPI } from '../services/api';
import { getToken } from '../utils/auth';

export default function LikeButton({ noteId, onLikeChange }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLoggedIn = !!getToken();

  useEffect(() => {
    if (noteId) {
      fetchLikeData();
    }
  }, [noteId]);

  const fetchLikeData = async () => {
    try {
      // Get like count
      const countResponse = await likesAPI.getLikeCount(noteId);
      if (countResponse.success) {
        setLikeCount(countResponse.data.likeCount);
      }

      // Check if user has liked (only if logged in)
      if (isLoggedIn) {
        const statusResponse = await likesAPI.checkLikeStatus(noteId);
        if (statusResponse.success) {
          setIsLiked(statusResponse.data.isLiked);
        }
      }
    } catch (err) {
      console.error('Error fetching like data:', err);
    }
  };

  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      setError('Please log in to like this note');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await likesAPI.toggleLike(noteId);
      
      if (response.success) {
        setIsLiked(response.data.isLiked);
        setLikeCount(response.data.likeCount);
        
        // Notify parent component if callback provided
        if (onLikeChange) {
          onLikeChange(response.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to update like');
      console.error('Error toggling like:', err);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleToggleLike}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          isLiked
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={isLoggedIn ? (isLiked ? 'Unlike' : 'Like') : 'Log in to like'}
      >
        <svg
          className={`w-5 h-5 transition-transform ${loading ? 'animate-pulse' : ''}`}
          fill={isLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="font-medium">{likeCount}</span>
        <span className="text-sm hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
      </button>
      
      {error && (
        <div className="absolute mt-12 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-400 text-sm whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}
