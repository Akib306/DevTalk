import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/posts?channel_id=... - Retrieve posts for a specific channel
router.get('/', async (req, res) => {
    try {
        const { channel_id } = req.query;
        if (!channel_id) {
            return res.status(400).json({ message: 'channel_id query parameter is required.' });
        }
        // Retrieves top-level posts (posts without a parent)
        const [posts] = await db.query(
            'SELECT * FROM posts WHERE channel_id = ?',
            [channel_id]
        );
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts.' });
    }
});

// POST /api/posts - Create a new top-level post
router.post('/', async (req, res) => {
    try {
        const { channel_id, user_id, content, image_url } = req.body;
        if (!channel_id || !user_id || !content) {
            return res.status(400).json({ message: 'channel_id, user_id, and content are required.' });
        }
        const [result] = await db.query(
            'INSERT INTO posts (channel_id, user_id, content, image_url) VALUES (?, ?, ?, ?)',
            [channel_id, user_id, content, image_url || null]
        );
        res.status(201).json({ post_id: result.insertId, message: 'Post created successfully.' });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post.' });
    }
});

// POST /api/posts/reply - Create a reply to a post or another reply
router.post('/reply', async (req, res) => {
    try {
        const { post_id, parent_reply_id, user_id, content, image_url } = req.body;
        if (!post_id || !user_id || !content) {
            return res.status(400).json({ message: 'post_id, user_id, and content are required.' });
        }
        const [result] = await db.query(
            'INSERT INTO replies (post_id, parent_reply_id, user_id, content, image_url) VALUES (?, ?, ?, ?, ?)',
            [post_id, parent_reply_id || null, user_id, content, image_url || null]
        );
        res.status(201).json({ reply_id: result.insertId, message: 'Reply created successfully.' });
    } catch (error) {
        console.error('Error creating reply:', error);
        res.status(500).json({ message: 'Error creating reply.' });
    }
});

// POST /api/posts/rate - Rate a post
router.post('/rate', async (req, res) => {
    try {
        const { user_id, post_id, rating } = req.body;
        if (!user_id || !post_id || !rating) {
            return res.status(400).json({ message: 'user_id, post_id, and rating are required.' });
        }
        if (rating !== 'up' && rating !== 'down') {
            return res.status(400).json({ message: 'Rating must be either "up" or "down".' });
        }
        const [result] = await db.query(
            `INSERT INTO post_ratings (user_id, post_id, rating)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE rating = ?`,
            [user_id, post_id, rating, rating]
        );
        res.status(201).json({ message: 'Post rating recorded.' });
    } catch (error) {
        console.error('Error rating post:', error);
        res.status(500).json({ message: 'Error rating post.' });
    }
});

// POST /api/posts/reply/rate - Rate a reply
router.post('/reply/rate', async (req, res) => {
    try {
        const { user_id, reply_id, rating } = req.body;
        if (!user_id || !reply_id || !rating) {
            return res.status(400).json({ message: 'user_id, reply_id, and rating are required.' });
        }
        if (rating !== 'up' && rating !== 'down') {
            return res.status(400).json({ message: 'Rating must be either "up" or "down".' });
        }
        const [result] = await db.query(
            `INSERT INTO reply_ratings (user_id, reply_id, rating)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE rating = ?`,
            [user_id, reply_id, rating, rating]
        );
        res.status(201).json({ message: 'Reply rating recorded.' });
    } catch (error) {
        console.error('Error rating reply:', error);
        res.status(500).json({ message: 'Error rating reply.' });
    }
});

export default router;
