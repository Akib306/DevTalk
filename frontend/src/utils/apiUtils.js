/**
 * Checks if the current token is valid/not expired before making API requests
 * @returns {boolean} True if token is valid, false if expired
 */
export const checkTokenValidity = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Decode the token
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token is expired
    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      // Alert user and redirect to login
      alert('Your session has expired. Please log in again.');
      localStorage.removeItem('token');
      window.location.href = '/';
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking token validity:', error);
    localStorage.removeItem('token');
    return false;
  }
};

/**
 * Makes an authenticated API request with token validation
 * @param {string} url - The API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
export const apiRequest = async (url, options = {}) => {
  if (!checkTokenValidity()) {
    throw new Error('Invalid or expired token');
  }

  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  return fetch(url, {
    ...options,
    headers
  });
}; 