import express from 'express';
import { auth } from '../middleware/auth.js';
import taskService from '../services/tasks.js';

const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
    try {
        if (!req.user) {
            throw new Error('User not found');
        }
        const tasks = await taskService.getTasks(req.user?.userId);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new task
router.post(
    '/',
    auth,
    async (req, res) => {
        try {
            const task = await taskService.createTask({
                ...req.body,
                created_by: req.user?.userId
            });
            res.status(201).json(task);
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(400).json({ error: error.message });
        }
    }
);

// Get task by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await taskService.getTaskById(parseInt(req.params.id));
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update task
router.patch(
    '/:id',
    auth,
    async (req, res) => {
        try {
            const taskId = parseInt(req.params.id);
            const updates = req.body;
            if (!req.user) {
                throw new Error('User not found');
            }
            const task = await taskService.updateTask(taskId, updates, req.user?.userId);
            if (!task) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }
            res.json(task);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

// Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        if (!req.user) {
            throw new Error('User not found');
        }
        const success = await taskService.deleteTask(taskId, req.user?.userId);
        if (!success) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;