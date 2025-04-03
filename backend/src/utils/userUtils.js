import db from '../db.js';

/**
 * Calculate a user's badge based on their post and reply count
 * @param {number} userId - The user's ID
 * @returns {Object} - An object containing the badge name and post count
 */
export async function getUserBadge(userId) {
    try {
        // Count posts created by the user
        const [postResults] = await db.query('SELECT COUNT(*) as postCount FROM posts WHERE user_id = ?', [userId]);
        
        // Count replies created by the user
        const [replyResults] = await db.query('SELECT COUNT(*) as replyCount FROM replies WHERE user_id = ?', [userId]);
        
        // Total contribution count
        const postCount = postResults[0].postCount;
        const replyCount = replyResults[0].replyCount;
        const totalCount = postCount + replyCount;
        
        // Determine badge based on count
        let badge = 'Newbie';
        if (totalCount > 20) {
            badge = 'Expert';
        } else if (totalCount > 10) {
            badge = 'Helper';
        }
        
        return {
            badge,
            postCount: totalCount
        };
    } catch (error) {
        console.error('Error calculating user badge:', error);
        return {
            badge: 'Newbie',
            postCount: 0
        };
    }
} 