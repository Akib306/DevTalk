import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

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

// GET /api/posts/withReplies?channel_id=... - Retrieve posts with user info and all replies for a channel
router.get('/withReplies', async (req, res) => {
    try {
        const { channel_id } = req.query;
        if (!channel_id) {
            return res.status(400).json({ message: 'channel_id query parameter is required.' });
        }

        // Get all posts with user information and vote counts
        const [posts] = await db.query(`
            SELECT 
                p.*,
                u.username as author_name,
                (SELECT COUNT(*) FROM post_ratings pr WHERE pr.post_id = p.id AND pr.rating = 'up') as upvotes,
                (SELECT COUNT(*) FROM post_ratings pr WHERE pr.post_id = p.id AND pr.rating = 'down') as downvotes
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.channel_id = ?
            ORDER BY p.created_at DESC
        `, [channel_id]);

        // Get all replies with user information and vote counts
        const [replies] = await db.query(`
            SELECT 
                r.*,
                u.username as author_name,
                (SELECT COUNT(*) FROM reply_ratings rr WHERE rr.reply_id = r.id AND rr.rating = 'up') as upvotes,
                (SELECT COUNT(*) FROM reply_ratings rr WHERE rr.reply_id = r.id AND rr.rating = 'down') as downvotes
            FROM replies r
            JOIN posts p ON r.post_id = p.id
            JOIN users u ON r.user_id = u.id
            WHERE p.channel_id = ?
            ORDER BY r.created_at ASC
        `, [channel_id]);

        // Get user's ratings if authenticated
        let userPostRatings = {};
        let userReplyRatings = {};
        
        // Get user's ID from token if available
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const user = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
                const userId = user.userId;
                
                // Get user's post ratings
                const [postRatings] = await db.query(`
                    SELECT post_id, rating FROM post_ratings
                    WHERE user_id = ?
                `, [userId]);
                
                postRatings.forEach(rating => {
                    userPostRatings[rating.post_id] = rating.rating;
                });
                
                // Get user's reply ratings
                const [replyRatings] = await db.query(`
                    SELECT reply_id, rating FROM reply_ratings
                    WHERE user_id = ?
                `, [userId]);
                
                replyRatings.forEach(rating => {
                    userReplyRatings[rating.reply_id] = rating.rating;
                });
            } catch (error) {
                // Token invalid or expired, continue without user ratings
                console.log('Error getting user ratings:', error.message);
            }
        }

        // Attach user's rating to posts and replies
        posts.forEach(post => {
            post.userRating = userPostRatings[post.id] || null;
        });
        
        replies.forEach(reply => {
            reply.userRating = userReplyRatings[reply.id] || null;
        });

        // Organize replies by post_id and parent_reply_id
        const replyMap = {};
        
        // First, group replies by post_id
        replies.forEach(reply => {
            if (!replyMap[reply.post_id]) {
                replyMap[reply.post_id] = [];
            }
            reply.replies = []; // Initialize nested replies array
            replyMap[reply.post_id].push(reply);
        });
        
        // Build nested reply structure
        for (const postId in replyMap) {
            const postReplies = replyMap[postId];
            const replyById = {};
            
            // Create a lookup map of replies by id
            postReplies.forEach(reply => {
                replyById[reply.id] = reply;
            });
            
            // Create the nested structure
            postReplies.forEach(reply => {
                if (reply.parent_reply_id) {
                    const parent = replyById[reply.parent_reply_id];
                    if (parent) {
                        parent.replies.push(reply);
                    }
                }
            });
            
            // Filter to only top-level replies (replies directly to the post)
            replyMap[postId] = postReplies.filter(reply => !reply.parent_reply_id);
        }
        
        // Attach replies to their posts
        posts.forEach(post => {
            post.replies = replyMap[post.id] || [];
        });
        
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts with replies:', error);
        res.status(500).json({ message: 'Error fetching posts with replies.' });
    }
});

// GET /api/posts/search - Search for posts and replies by content or author
router.get('/search', async (req, res) => {
    try {
        const { query, author } = req.query;
        
        if (!query && !author) {
            return res.status(400).json({ message: 'At least one search parameter (query or author) is required.' });
        }
        
        let matchedPostIds = new Set();
        let matchedPosts = [];
        
        // First, find all post IDs that match the search criteria either directly or through their replies
        
        // Check for direct post matches
        if (query) {
            const [postMatches] = await db.query(`
                SELECT DISTINCT p.id
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.content LIKE ?
            `, [`%${query}%`]);
            
            postMatches.forEach(post => matchedPostIds.add(post.id));
            
            // Check for posts with matching replies
            const [replyMatches] = await db.query(`
                SELECT DISTINCT r.post_id
                FROM replies r
                JOIN users u ON r.user_id = u.id
                WHERE r.content LIKE ?
            `, [`%${query}%`]);
            
            replyMatches.forEach(reply => matchedPostIds.add(reply.post_id));
        }
        
        // Check author matches if specified
        if (author) {
            const [authorPostMatches] = await db.query(`
                SELECT DISTINCT p.id
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE u.username LIKE ?
            `, [`%${author}%`]);
            
            authorPostMatches.forEach(post => matchedPostIds.add(post.id));
            
            const [authorReplyMatches] = await db.query(`
                SELECT DISTINCT r.post_id
                FROM replies r
                JOIN users u ON r.user_id = u.id
                WHERE u.username LIKE ?
            `, [`%${author}%`]);
            
            authorReplyMatches.forEach(reply => matchedPostIds.add(reply.post_id));
        }
        
        // Convert Set to Array for query
        const postIdsArray = Array.from(matchedPostIds);
        
        if (postIdsArray.length === 0) {
            return res.json([]);
        }
        
        // Get complete posts with user info and vote counts
        const [posts] = await db.query(`
            SELECT 
                p.*,
                u.username as author_name,
                c.name as channel_name,
                (SELECT COUNT(*) FROM post_ratings pr WHERE pr.post_id = p.id AND pr.rating = 'up') as upvotes,
                (SELECT COUNT(*) FROM post_ratings pr WHERE pr.post_id = p.id AND pr.rating = 'down') as downvotes
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN channels c ON p.channel_id = c.id
            WHERE p.id IN (${postIdsArray.map(() => '?').join(',')})
            ORDER BY p.created_at DESC
        `, [...postIdsArray]);
        
        // Get all replies for these posts with user info and vote counts
        const [replies] = await db.query(`
            SELECT 
                r.*,
                u.username as author_name,
                (SELECT COUNT(*) FROM reply_ratings rr WHERE rr.reply_id = r.id AND rr.rating = 'up') as upvotes,
                (SELECT COUNT(*) FROM reply_ratings rr WHERE rr.reply_id = r.id AND rr.rating = 'down') as downvotes
            FROM replies r
            JOIN users u ON r.user_id = u.id
            WHERE r.post_id IN (${postIdsArray.map(() => '?').join(',')})
            ORDER BY r.created_at ASC
        `, [...postIdsArray]);
        
        // Organize replies by post_id and parent_reply_id similar to the withReplies endpoint
        const replyMap = {};
        
        // First, group replies by post_id
        replies.forEach(reply => {
            if (!replyMap[reply.post_id]) {
                replyMap[reply.post_id] = [];
            }
            reply.replies = []; // Initialize nested replies array
            
            // Highlight matching content if query is provided
            if (query && reply.content.toLowerCase().includes(query.toLowerCase())) {
                reply.matches = true;
            } else {
                reply.matches = false;
            }
            
            replyMap[reply.post_id].push(reply);
        });
        
        // Build nested reply structure
        for (const postId in replyMap) {
            const postReplies = replyMap[postId];
            const replyById = {};
            
            // Create a lookup map of replies by id
            postReplies.forEach(reply => {
                replyById[reply.id] = reply;
            });
            
            // Create the nested structure
            postReplies.forEach(reply => {
                if (reply.parent_reply_id) {
                    const parent = replyById[reply.parent_reply_id];
                    if (parent) {
                        parent.replies.push(reply);
                    }
                }
            });
            
            // Filter to only top-level replies (replies directly to the post)
            replyMap[postId] = postReplies.filter(reply => !reply.parent_reply_id);
        }
        
        // Attach replies to their posts and mark if post content matches
        posts.forEach(post => {
            post.replies = replyMap[post.id] || [];
            
            // Highlight matching content if query is provided
            if (query && post.content.toLowerCase().includes(query.toLowerCase())) {
                post.matches = true;
            } else {
                post.matches = false;
            }
        });
        
        res.json(posts);
    } catch (error) {
        console.error('Error searching posts and replies:', error);
        res.status(500).json({ message: 'Error searching posts and replies.' });
    }
});

// Protected: POST /api/posts - Create a new top-level post
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { channel_id, content, image_url } = req.body;
        const user_id = req.user.userId;
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

// Protected: POST /api/posts/reply - Create a reply to a post or another reply
router.post('/reply', authenticateToken, async (req, res) => {
    try {
        const { post_id, parent_reply_id, content, image_url } = req.body;
        const user_id = req.user.userId;
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

// Protected: POST /api/posts/rate - Rate a post
router.post('/rate', authenticateToken, async (req, res) => {
    try {
        const { post_id, rating } = req.body;
        const user_id = req.user.userId;
        
        if (!post_id) {
            return res.status(400).json({ message: 'post_id is required.' });
        }
        
        // Check if rating is null (user is removing their vote)
        if (rating === null) {
            // Delete the rating record
            await db.query(
                'DELETE FROM post_ratings WHERE user_id = ? AND post_id = ?',
                [user_id, post_id]
            );
            return res.status(200).json({ message: 'Rating removed successfully.' });
        }
        
        // Otherwise validate and update/insert the rating
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

// Protected: POST /api/posts/reply/rate - Rate a reply
router.post('/reply/rate', authenticateToken, async (req, res) => {
    try {
        const { reply_id, rating } = req.body;
        const user_id = req.user.userId;
        
        if (!reply_id) {
            return res.status(400).json({ message: 'reply_id is required.' });
        }
        
        // Check if rating is null (user is removing their vote)
        if (rating === null) {
            // Delete the rating record
            await db.query(
                'DELETE FROM reply_ratings WHERE user_id = ? AND reply_id = ?',
                [user_id, reply_id]
            );
            return res.status(200).json({ message: 'Rating removed successfully.' });
        }
        
        // Otherwise validate and update/insert the rating
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
