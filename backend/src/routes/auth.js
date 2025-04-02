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
            role: user.role, // Include the user's role
            exp: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes in seconds
        }, JWT_SECRET);
        
        res.json({ token, message: 'Login successful.' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// GET /api/auth/users - Get all registered users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        console.log('Users API called with userId:', req.user.userId);
        
        // Check if user is admin - SELECT all fields to see the actual data
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
        
        console.log('User role check result:', users);
        
        // More detailed check - treat null, undefined, or any non-admin value as non-admin
        if (users.length === 0 || !users[0].role || users[0].role !== 'admin') {
            console.log('Access denied - not admin. User data:', JSON.stringify(users[0]));
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        // Fetch all users with more detailed logging
        console.log('Admin access granted, fetching all users');
        const [allUsers] = await db.query('SELECT id, username, role FROM users ORDER BY id');
        
        console.log('Users found in database:', allUsers.length, allUsers);
        
        return res.status(200).json(allUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Server error fetching users.', error: error.message });
    }
});

// GET /api/auth/check-admin - Check if current user is admin (for debugging)
router.get('/check-admin', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, role FROM users WHERE id = ?', [req.user.userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.', userId: req.user.userId });
        }
        
        const isAdmin = users[0].role === 'admin';
        
        return res.status(200).json({ 
            userId: req.user.userId,
            username: users[0].username,
            role: users[0].role,
            isAdmin: isAdmin
        });
    } catch (error) {
        console.error('Error checking admin status:', error);
        return res.status(500).json({ message: 'Server error checking admin status.' });
    }
});

// POST /api/auth/fix-admin - Force update the admin user role (development endpoint)
router.post('/fix-admin', async (req, res) => {
    try {
        // Find user with username 'Admin'
        const [adminUser] = await db.query('SELECT * FROM users WHERE username = ?', ['Admin']);
        
        if (adminUser.length === 0) {
            return res.status(404).json({ message: 'Admin user not found' });
        }
        
        // Update the role to 'admin'
        await db.query('UPDATE users SET role = ? WHERE username = ?', ['admin', 'Admin']);
        
        // Verify the update
        const [updatedUser] = await db.query('SELECT * FROM users WHERE username = ?', ['Admin']);
        
        return res.status(200).json({ 
            message: 'Admin role updated successfully',
            user: updatedUser[0]
        });
    } catch (error) {
        console.error('Error fixing admin role:', error);
        return res.status(500).json({ message: 'Server error fixing admin role', error: error.message });
    }
});

// DELETE /api/auth/users/:id - Delete a user with all their content (admin only)
router.delete('/users/:id', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
        
        if (users.length === 0 || !users[0].role || users[0].role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        const userId = req.params.id;
        
        // Start a transaction to ensure all deletes succeed or fail together
        await db.query('START TRANSACTION');
        
        try {
            // 1. First, get all posts by this user for later reference
            const [userPosts] = await db.query('SELECT id FROM posts WHERE user_id = ?', [userId]);
            const postIds = userPosts.map(post => post.id);
            
            // 2. Delete all ratings of any replies associated with user's posts
            if (postIds.length > 0) {
                // Get all replies associated with user's posts
                const [postReplies] = await db.query(
                    `SELECT id FROM replies WHERE post_id IN (${postIds.map(() => '?').join(',')})`,
                    [...postIds]
                );
                const replyIds = postReplies.map(reply => reply.id);
                
                // Delete ratings for these replies
                if (replyIds.length > 0) {
                    await db.query(
                        `DELETE FROM reply_ratings WHERE reply_id IN (${replyIds.map(() => '?').join(',')})`,
                        [...replyIds]
                    );
                }
            }
            
            // 3. Delete all ratings made by the user
            await db.query('DELETE FROM reply_ratings WHERE user_id = ?', [userId]);
            await db.query('DELETE FROM post_ratings WHERE user_id = ?', [userId]);
            
            // 4. Delete all ratings of posts created by the user
            if (postIds.length > 0) {
                await db.query(
                    `DELETE FROM post_ratings WHERE post_id IN (${postIds.map(() => '?').join(',')})`,
                    [...postIds]
                );
            }
            
            // 5. Delete all replies by the user or to the user's posts (recursive function)
            await deleteRepliesByUser(userId);
            
            // 6. Delete all replies to posts made by the user
            if (postIds.length > 0) {
                await db.query(
                    `DELETE FROM replies WHERE post_id IN (${postIds.map(() => '?').join(',')})`,
                    [...postIds]
                );
            }
            
            // 7. Delete all posts by the user
            await db.query('DELETE FROM posts WHERE user_id = ?', [userId]);
            
            // 8. Delete all channels created by the user
            await db.query('DELETE FROM channels WHERE created_by = ?', [userId]);
            
            // 9. Finally, delete the user
            const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
            
            if (result.affectedRows === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({ message: 'User not found.' });
            }
            
            await db.query('COMMIT');
            
            return res.status(200).json({ message: 'User and all associated content deleted successfully.' });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error; // Re-throw to be caught by outer catch
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Server error deleting user.', error: error.message });
    }
});

// Helper function to recursively delete replies
async function deleteRepliesByUser(userId) {
    // First, identify all replies by this user
    const [userReplies] = await db.query('SELECT id FROM replies WHERE user_id = ?', [userId]);
    
    // For each reply, recursively delete child replies
    for (const reply of userReplies) {
        await deleteChildReplies(reply.id);
    }
    
    // Finally delete all replies by this user
    await db.query('DELETE FROM replies WHERE user_id = ?', [userId]);
}

// Helper function to recursively delete a reply and all its children
async function deleteChildReplies(replyId) {
    // Find all direct child replies
    const [childReplies] = await db.query('SELECT id FROM replies WHERE parent_reply_id = ?', [replyId]);
    
    // Recursively delete each child's children
    for (const child of childReplies) {
        await deleteChildReplies(child.id);
    }
    
    // Delete ratings for this reply
    await db.query('DELETE FROM reply_ratings WHERE reply_id = ?', [replyId]);
    
    // Delete the reply itself
    await db.query('DELETE FROM replies WHERE id = ?', [replyId]);
}

export default router;
