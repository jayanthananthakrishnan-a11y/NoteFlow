/**
 * API Service for NoteFlow Backend
 * Handles all API requests with authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic API request handler
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authorization token if available
  const token = localStorage.getItem('noteflow:token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   */
  signup: async (userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Logout user
   */
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Get current user info
   */
  getCurrentUser: async () => {
    return apiRequest('/auth/current-user', {
      method: 'GET',
    });
  },

  /**
   * Verify token validity
   */
  verifyToken: async () => {
    return apiRequest('/auth/verify-token', {
      method: 'GET',
    });
  },
};

/**
 * Notes API
 */
export const notesAPI = {
  /**
   * Get all notes with optional filters
   * @param {Object} params - Query parameters (subject, search, limit, offset, sort, order)
   */
  getAllNotes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/notes?${queryString}` : '/notes';
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get single note by ID
   * @param {string} id - Note ID (UUID)
   */
  getNoteById: async (id) => {
    return apiRequest(`/notes/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new note (creator only)
   * @param {Object} noteData - Note data
   */
  createNote: async (noteData) => {
    return apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  /**
   * Update an existing note (owner only)
   * @param {string} id - Note ID
   * @param {Object} updates - Partial note updates
   */
  updateNote: async (id, updates) => {
    return apiRequest(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a note (owner only)
   * @param {string} id - Note ID
   */
  deleteNote: async (id) => {
    return apiRequest(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Payments API
 */
export const paymentsAPI = {
  /**
   * Purchase a note
   * @param {string} noteId - Note ID (UUID)
   * @param {string} paymentMethod - Payment method (optional)
   */
  purchaseNote: async (noteId, paymentMethod = 'credit_card') => {
    return apiRequest('/payments/purchase', {
      method: 'POST',
      body: JSON.stringify({
        note_id: noteId,
        payment_method: paymentMethod,
      }),
    });
  },

  /**
   * Get user's purchases
   * @param {Object} params - Query parameters (limit, offset)
   */
  getMyPurchases: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/payments/my-purchases?${queryString}` : '/payments/my-purchases';
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get creator earnings
   * @param {Object} params - Query parameters (limit, offset, period)
   */
  getCreatorEarnings: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/payments/creator-earnings?${queryString}` : '/payments/creator-earnings';
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get payment details by ID
   * @param {string} id - Payment ID (UUID)
   */
  getPaymentById: async (id) => {
    return apiRequest(`/payments/${id}`, {
      method: 'GET',
    });
  },
};

/**
 * Comments API
 */
export const commentsAPI = {
  /**
   * Add a comment to a note
   * @param {string} noteId - Note ID
   * @param {string} text - Comment text
   * @param {number|null} rating - Rating (1-5, optional)
   */
  addComment: async (noteId, text, rating = null) => {
    return apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify({
        note_id: noteId,
        text,
        rating,
      }),
    });
  },

  /**
   * Get comments for a note
   * @param {string} noteId - Note ID
   * @param {Object} params - Query parameters (limit, offset)
   */
  getComments: async (noteId, params = {}) => {
    const queryParams = { note_id: noteId, ...params };
    const queryString = new URLSearchParams(queryParams).toString();
    return apiRequest(`/comments?${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * Update a comment
   * @param {string} commentId - Comment ID
   * @param {string} text - Updated text
   * @param {number|null} rating - Updated rating
   */
  updateComment: async (commentId, text, rating = null) => {
    return apiRequest(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text, rating }),
    });
  },

  /**
   * Delete a comment
   * @param {string} commentId - Comment ID
   */
  deleteComment: async (commentId) => {
    return apiRequest(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get average rating for a note
   * @param {string} noteId - Note ID
   */
  getRating: async (noteId) => {
    return apiRequest(`/comments/rating/${noteId}`, {
      method: 'GET',
    });
  },
};

/**
 * Likes API
 */
export const likesAPI = {
  /**
   * Toggle like on a note
   * @param {string} noteId - Note ID
   */
  toggleLike: async (noteId) => {
    return apiRequest('/likes', {
      method: 'POST',
      body: JSON.stringify({ note_id: noteId }),
    });
  },

  /**
   * Get like count for a note
   * @param {string} noteId - Note ID
   */
  getLikeCount: async (noteId) => {
    return apiRequest(`/likes?note_id=${noteId}`, {
      method: 'GET',
    });
  },

  /**
   * Check if user has liked a note
   * @param {string} noteId - Note ID
   */
  checkLikeStatus: async (noteId) => {
    return apiRequest(`/likes/check/${noteId}`, {
      method: 'GET',
    });
  },

  /**
   * Get user's liked notes
   * @param {Object} params - Query parameters (limit, offset)
   */
  getLikedNotes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/likes/user/liked-notes?${queryString}` : '/likes/user/liked-notes';
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Remove like from a note
   * @param {string} noteId - Note ID
   */
  removeLike: async (noteId) => {
    return apiRequest(`/likes/${noteId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Bookmarks API
 */
export const bookmarksAPI = {
  /**
   * Toggle bookmark on a note
   * @param {string} noteId - Note ID
   */
  toggleBookmark: async (noteId) => {
    return apiRequest('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ note_id: noteId }),
    });
  },

  /**
   * Get user's bookmarked notes
   * @param {Object} params - Query parameters (limit, offset)
   */
  getBookmarks: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/bookmarks?${queryString}` : '/bookmarks';
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Check if user has bookmarked a note
   * @param {string} noteId - Note ID
   */
  checkBookmarkStatus: async (noteId) => {
    return apiRequest(`/bookmarks/check/${noteId}`, {
      method: 'GET',
    });
  },

  /**
   * Get bookmark count for a note
   * @param {string} noteId - Note ID
   */
  getBookmarkCount: async (noteId) => {
    return apiRequest(`/bookmarks/note/${noteId}`, {
      method: 'GET',
    });
  },

  /**
   * Remove bookmark from a note
   * @param {string} noteId - Note ID
   */
  removeBookmark: async (noteId) => {
    return apiRequest(`/bookmarks/${noteId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get bookmark statistics for user
   */
  getStats: async () => {
    return apiRequest('/bookmarks/stats', {
      method: 'GET',
    });
  },
};

/**
 * Health check
 */
export const healthCheck = async () => {
  return apiRequest('/health', {
    method: 'GET',
  });
};

export default {
  authAPI,
  notesAPI,
  paymentsAPI,
  commentsAPI,
  likesAPI,
  bookmarksAPI,
  healthCheck,
};
