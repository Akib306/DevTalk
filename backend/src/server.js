import express from 'express';
import { connectAndPing } from './db.js';
import { initializeSchema, createAdminAccount } from './initDb.js';
import authRoutes from './routes/auth.js';
import channelsRoutes from './routes/channels.js';
import postsRoutes from './routes/posts.js';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from the frontend
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express.json());

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
