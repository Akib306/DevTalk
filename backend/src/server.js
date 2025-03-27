import express from 'express';
import { connectAndPing } from './db.js';
import { initializeSchema } from './initDb.js';
import authRoutes from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/posts', postsRoutes);

async function startServer() {
    try {
        await connectAndPing();           // Check DB connection
        await initializeSchema();         // Set up DB tables

        app.listen(port, () => {
            console.log(`Server is live on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Startup failed: ', error.message);
        process.exit(1);
    }
};

startServer();
