// backend/src/routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
// Generate a secure random secret on server start
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
console.log('Using JWT secret:', JWT_SECRET);

// Add a verify token endpoint
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        // If middleware passes, token is valid
        // Check if user still exists in database
        const [users] = await db.query('SELECT id FROM users WHERE id = ?', [req.user.userId]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'User no longer exists.' });
        }
        return res.status(200).json({ valid: true });
    } catch (error) {
        console.error('Error during token verification:', error);
        return res.status(500).json({ message: 'Server error during verification.' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // Check if username already exists
        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Username already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const [result] = await db.query(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully. Please login.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // Retrieve the user from the database
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const user = users[0];

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Create a JWT token for the user with proper expiration
        const expiresIn = '15min'; // Short expiration time
        const token = jwt.sign({ 
            userId: user.id, 
            username: user.username,
            exp: Math.floor(Date.now() / 1000) + (2 * 60), // 2 minutes in seconds
        }, JWT_SECRET);
        
        res.json({ token, message: 'Login successful.' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

export default router;
