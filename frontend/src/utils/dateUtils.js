/**
 * Utility functions for handling date and time formatting with proper timezone.
 */

/**
 * Formats a date string to local Saskatchewan timezone (CST, GMT-6) 
 * 
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date string
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = {
        timeZone: 'America/Regina', // Saskatchewan timezone (CST, GMT-6)
        year: 'numeric',
        month: 'numeric', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
}; 