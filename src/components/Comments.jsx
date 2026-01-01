import React, { useState, useEffect } from 'react';
import { commentsAPI } from '../services/api';
import { getToken } from '../utils/auth';

export default function Comments({ noteId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, hasMore: false });
  const [ratingData, setRatingData] = useState({ averageRating: 0, ratingCount: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(null);

  const isLoggedIn = !!getToken();

  // Fetch comments
  useEffect(() => {
    if (noteId) {
      fetchComments();
    }
  }, [noteId]);

  const fetchComments = async (offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentsAPI.getComments(noteId, { limit: 10, offset });
      
      if (response.success) {
        setComments(response.data.comments);
        setPagination(response.data.pagination);
        setRatingData(response.data.rating);
      }
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim() || !isLoggedIn) return;

    try {
      setSubmitting(true);
      setError(null);
      const response = await commentsAPI.addComment(noteId, text.trim(), rating);
      
      if (response.success) {
        setText('');
        setRating(null);
        // Refresh comments to show new one
        await fetchComments();
      }
    } catch (err) {
      setError(err.message || 'Failed to add comment');
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
    setEditRating(comment.rating);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditRating(null);
  };

  const updateComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const response = await commentsAPI.updateComment(commentId, editText.trim(), editRating);
      
      if (response.success) {
        cancelEdit();
        await fetchComments();
      }
    } catch (err) {
      setError(err.message || 'Failed to update comment');
      console.error('Error updating comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      setError(null);
      const response = await commentsAPI.deleteComment(commentId);
      
      if (response.success) {
        await fetchComments();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
      console.error('Error deleting comment:', err);
    }
  };

  const renderStars = (currentRating, onSelect = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onSelect && onSelect(star === currentRating ? null : star)}
            disabled={!onSelect}
            className={`text-lg ${
              star <= (currentRating || 0)
                ? 'text-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            } ${onSelect ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-xl">Comments ({pagination.total})</h4>
        {ratingData.ratingCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-yellow-500">{ratingData.averageRating}</span>
            {renderStars(Math.round(ratingData.averageRating))}
            <span className="text-sm text-gray-500">({ratingData.ratingCount} rating{ratingData.ratingCount !== 1 ? 's' : ''})</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Add Comment Form */}
      {isLoggedIn ? (
        <form onSubmit={addComment} className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Write a comment..."
            disabled={submitting}
            maxLength={5000}
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Rate this note:</span>
              {renderStars(rating, setRating)}
              {rating && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to add comments</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="border-t border-gray-200 dark:border-gray-700 pt-4 first:border-t-0 first:pt-0"
            >
              {editingId === comment.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    disabled={submitting}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rating:</span>
                      {renderStars(editRating, setEditRating)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => updateComment(comment.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        disabled={submitting || !editText.trim()}
                      >
                        {submitting ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {comment.name || comment.username}
                      </div>
                      {comment.rating && renderStars(comment.rating)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.date)}
                        {comment.edited_date && ' (edited)'}
                      </span>
                      {isLoggedIn && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(comment)}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-2"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.text}</p>
                </>
              )}
            </div>
          ))
        )}

        {pagination.hasMore && (
          <button
            onClick={() => fetchComments(comments.length)}
            className="w-full py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
          >
            Load More Comments
          </button>
        )}
      </div>
    </div>
  );
}
