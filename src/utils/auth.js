/**
 * Authentication Utilities
 * Helper functions for managing authentication state
 */

/**
 * Store authentication data in localStorage
 */
export const setAuthData = (token, user) => {
  localStorage.setItem('noteflow:token', token);
  localStorage.setItem('noteflow:user', JSON.stringify(user));
};

/**
 * Get authentication token
 */
export const getAuthToken = () => {
  return localStorage.getItem('noteflow:token');
};

/**
 * Alias for getAuthToken (for backward compatibility)
 */
export const getToken = getAuthToken;

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  const userStr = localStorage.getItem('noteflow:user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Check if user is a creator
 */
export const isCreator = () => {
  const user = getUser();
  return user?.userType === 'creator';
};

/**
 * Check if user is a viewer
 */
export const isViewer = () => {
  const user = getUser();
  return user?.userType === 'viewer';
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('noteflow:token');
  localStorage.removeItem('noteflow:user');
};

/**
 * Get redirect path based on user type
 */
export const getRedirectPath = (userType) => {
  return userType === 'creator' ? '/creator-dashboard' : '/dashboard';
};

/**
 * Format API error messages
 */
export const formatAPIError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
