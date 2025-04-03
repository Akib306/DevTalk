import express from 'express';
import { connectAndPing } from './db.js';
import { initializeSchema, createAdminAccount } from './initDb.js';
import authRoutes from './routes/auth.js';
import channelsRoutes from './routes/channels.js';
import postsRoutes from './routes/posts.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from the frontend
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

// Increase JSON payload limit for base64 encoded images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/posts', postsRoutes);

async function startServer() {
    try {
        await connectAndPing();           // Check DB connection
        await initializeSchema();         // Set up DB tables
        await createAdminAccount();       // Create admin account if it doesn't exist

        app.listen(port, () => {
            console.log(`Server is live on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Startup failed: ', error.message);
        process.exit(1);
    }
};

startServer();
