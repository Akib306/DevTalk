import { useEffect } from 'react';
import { checkTokenValidity } from '../utils/apiUtils';

/**
 * Component that periodically checks if the authentication token is still valid
 * Shows an alert and redirects to login page when token expires
 */
const TokenExpirationChecker = () => {
  useEffect(() => {
    // Check token validity every 30 seconds
    const intervalId = setInterval(() => {
      // If user is logged in (has a token), check its validity
      if (localStorage.getItem('token')) {
        checkTokenValidity();
      }
    }, 30000); // 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default TokenExpirationChecker; 