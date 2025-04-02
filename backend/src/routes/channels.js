import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/channels - Retrieve all channels
router.get('/', async (req, res) => {
    try {
        const [channels] = await db.query(`
            SELECT c.id, c.name, c.created_by, u.username as creator_name
            FROM channels c
            LEFT JOIN users u ON c.created_by = u.id
        `);
        res.json(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ message: 'Error fetching channels.' });
    }
});

// POST /api/channels - Create a new channel
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const created_by = req.user.userId;
        if (!name) {
            return res.status(400).json({ message: 'Channel name and created_by are required.' });
        }
        const [result] = await db.query(
            'INSERT INTO channels (name, created_by) VALUES (?, ?)',
            [name, created_by]
        );
        res.status(201).json({ channel_id: result.insertId, message: 'Channel created successfully.' });
    } catch (error) {
        console.error('Error creating channel:', error);
        res.status(500).json({ message: 'Error creating channel.' });
    }
});

// DELETE /api/channels/:id - Delete a channel with all its posts and replies (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const channelId = req.params.id;
        
        // Check if user is admin
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
        
        if (users.length === 0 || !users[0].role || users[0].role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        // Start a transaction to ensure all deletes succeed or fail together
        await db.query('START TRANSACTION');
        
        try {
            // First, get all posts in this channel
            const [posts] = await db.query('SELECT id FROM posts WHERE channel_id = ?', [channelId]);
            const postIds = posts.map(post => post.id);
            
            if (postIds.length > 0) {
                // Get all replies for these posts
                const [replies] = await db.query(
                    `SELECT id FROM replies WHERE post_id IN (${postIds.map(() => '?').join(',')})`,
                    [...postIds]
                );
                const replyIds = replies.map(reply => reply.id);
                
                // Delete all reply ratings
                if (replyIds.length > 0) {
                    await db.query(
                        `DELETE FROM reply_ratings WHERE reply_id IN (${replyIds.map(() => '?').join(',')})`,
                        [...replyIds]
                    );
                }
                
                // Delete all replies
                await db.query(
                    `DELETE FROM replies WHERE post_id IN (${postIds.map(() => '?').join(',')})`,
                    [...postIds]
                );
                
                // Delete all post ratings
                await db.query(
                    `DELETE FROM post_ratings WHERE post_id IN (${postIds.map(() => '?').join(',')})`,
                    [...postIds]
                );
            }
            
            // Delete all posts in this channel
            await db.query('DELETE FROM posts WHERE channel_id = ?', [channelId]);
            
            // Finally, delete the channel
            const [result] = await db.query('DELETE FROM channels WHERE id = ?', [channelId]);
            
            if (result.affectedRows === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({ message: 'Channel not found.' });
            }
            
            await db.query('COMMIT');
            
            return res.status(200).json({ message: 'Channel and all its content deleted successfully.' });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error; // Re-throw to be caught by outer catch
        }
    } catch (error) {
        console.error('Error deleting channel:', error);
        return res.status(500).json({ message: 'Server error deleting channel.', error: error.message });
    }
});

export default router;
