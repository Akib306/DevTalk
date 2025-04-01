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

export default router;
