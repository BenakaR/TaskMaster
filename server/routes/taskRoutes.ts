import express, { Router, Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { taskSchema } from '../utils/validation';
import taskService from '../services/tasks';

interface TaskRequest {
    name: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    projectId: number;
    assignedUserId?: number;
    dueDate?: Date;
}

interface Task extends TaskRequest {
    task_id: number;
    created_at: Date;
    updated_at: Date;
}

const router: Router = express.Router();

// Get all tasks
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new Error('User not found');
        }
        const tasks = await taskService.getTasks(req.user?.userId);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Create new task
router.post(
    '/',
    auth,
    validateRequest(taskSchema),
    async (req: Request<{}, {}, TaskRequest>, res: Response) => {
        try {
            const task = await taskService.createTask({
                ...req.body,
                created_by: req.user?.userId
            });
            res.status(201).json(task);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }
);

// Get task by ID
router.get('/:id', auth, async (req: Request, res: Response) => {
    try {
        const task = await taskService.getTaskById(parseInt(req.params.id));
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Update task
router.patch(
    '/:id',
    auth,
    async (req: Request, res: Response) => {
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
            res.status(400).json({ error: (error as Error).message });
        }
    }
);

// Delete task
router.delete('/:id', auth, async (req: Request, res: Response) => {
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
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;