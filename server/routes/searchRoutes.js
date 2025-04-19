import express from 'express';
import { auth } from '../middleware/auth.js';
import searchService from '../services/search.js';
import pool from '../services/db.js';
import TaskService from '../services/tasks.js';

const router = express.Router();

router.get('/tasks', auth, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const results = await searchService.hybridSearch(query);
        console.log('Search results:', results);

        if (results.length === 0) {
            const orgTasks = await TaskService.getTasks(req.user?.userId);
            console.log('Fallback organization tasks:', orgTasks);
            return res.json(orgTasks);
        }

        console.log('Search results:', results);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;