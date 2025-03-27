import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/channels - Retrieve all channels
router.get('/', async (req, res) => {
    try {
        const [channels] = await db.query('SELECT * FROM channels');
        res.json(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ message: 'Error fetching channels.' });
    }
});

// POST /api/channels - Create a new channel
router.post('/', async (req, res) => {
    try {
        const { name, created_by } = req.body;
        if (!name || !created_by) {
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
