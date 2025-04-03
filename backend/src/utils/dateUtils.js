/**
 * Utility functions for handling dates and timestamps with proper time zone.
 */

/**
 * Generates the current timestamp in Central Standard Time (Saskatchewan timezone, GMT-6) 
 * and formats it as "YYYY-MM-DD HH:MM:SS".
 *
 * @returns {string} The formatted timestamp in the format "YYYY-MM-DD HH:MM:SS"
 */
export const getCurrentTimestamp = () => {
    const now = new Date();
    const options = {
        timeZone: 'America/Regina', // Saskatchewan timezone (CST, GMT-6)
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Use 24-hour format
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);

    // Convert formatted parts into an object
    const dateTime = {};
    parts.forEach(({ type, value }) => {
        dateTime[type] = value;
    });

    return `${dateTime.year}-${dateTime.month}-${dateTime.day} ${dateTime.hour}:${dateTime.minute}:${dateTime.second}`;
};

/**
 * Formats a date string to the Central Standard Time (Saskatchewan timezone, GMT-6)
 * 
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date string in local timezone
 */
export const formatToLocalTimezone = (dateString) => {
    const date = new Date(dateString);
    const options = {
        timeZone: 'America/Regina', // Saskatchewan timezone (CST, GMT-6)
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
}; 