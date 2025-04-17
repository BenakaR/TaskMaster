import express, { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import db from './services/db';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '8080', 10);

app.use(express.json());
app.use(express.static('public'));

// Initialize routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Initialize database
db.initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at port ${PORT}`);
        });
    })
    .catch((error: Error) => {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    });