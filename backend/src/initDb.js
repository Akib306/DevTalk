import db from './db.js';
import bcrypt from 'bcrypt';

export async function initializeSchema() {
    try {
        // Users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user'
            )
        `);

        // Channels table
        await db.query(`
            CREATE TABLE IF NOT EXISTS channels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_by INT,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);

        // Posts table (top-level messages in a channel)
        await db.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                channel_id INT,
                user_id INT,
                content TEXT,
                image_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (channel_id) REFERENCES channels(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Post ratings table (each user can rate a post once)
        await db.query(`
            CREATE TABLE IF NOT EXISTS post_ratings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                post_id INT,
                rating ENUM('up', 'down'),
                UNIQUE(user_id, post_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (post_id) REFERENCES posts(id)
            )
        `);

        // Replies table (for replies to posts or other replies)
        await db.query(`
            CREATE TABLE IF NOT EXISTS replies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT, -- the post this reply belongs to
                parent_reply_id INT DEFAULT NULL, -- if not null, indicates a nested reply
                user_id INT,
                content TEXT,
                image_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id),
                FOREIGN KEY (parent_reply_id) REFERENCES replies(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Reply ratings table (each user can rate a reply once)
        await db.query(`
            CREATE TABLE IF NOT EXISTS reply_ratings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                reply_id INT,
                rating ENUM('up', 'down'),
                UNIQUE(user_id, reply_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (reply_id) REFERENCES replies(id)
            )
        `);

        console.log('Database schema initialized.');
    } catch (error) {
        console.error('Error initializing schema: ', error.message);
        process.exit(1);
    }
}

export async function createAdminAccount() {
    try {
        const adminUsername = 'Admin';
        const adminPassword = 'pass';
        
        // Check if admin account already exists
        const [existingAdmin] = await db.query('SELECT id FROM users WHERE username = ?', [adminUsername]);
        
        if (existingAdmin.length === 0) {
            // Hash the password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            // Create admin account
            await db.query(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                [adminUsername, hashedPassword, 'admin']
            );
            
            console.log('Admin account created successfully');
        } else {
            console.log('Admin account already exists');
        }
    } catch (error) {
        console.error('Error creating admin account:', error.message);
    }
}
