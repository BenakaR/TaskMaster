import express from 'express';
import { auth } from '../middleware/auth.js';
import projectService from '../services/projects.js';

const router = express.Router();

// Get all projects for user
router.get('/', auth, async (req, res) => {
    try {
        if (!req.user) {
            throw new Error('User not found');
        }
        const projects = await projectService.getProjects(req.user.userId);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new project
router.post('/', auth, async (req, res) => {
    try {
        const project = await projectService.createProject({
            ...req.body,
            owner_id: req.user?.userId
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await projectService.getProjectById(parseInt(req.params.id));
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update project
router.patch('/:id', auth, async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        if (!req.user) {
            throw new Error('User not found');
        }
        const project = await projectService.updateProject(projectId, req.body, req.user.userId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        if (!req.user) {
            throw new Error('User not found');
        }
        const success = await projectService.deleteProject(projectId, req.user.userId);
        if (!success) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;