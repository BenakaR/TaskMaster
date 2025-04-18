import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userService from '../services/user.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/register',
  async (req, res) => {
    try {
      const { username, email, password, organization_name } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await userService.createUser(username, email, passwordHash, organization_name);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.post(
  '/login',
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await userService.getUserByEmail(email);
      
      if (!user) {
        throw new Error('Invalid login credentials');
      }
      
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        throw new Error('Invalid login credentials');
      }
      
      const token = jwt.sign(
        { userId: user.id }, 
        process.env.JWT_SECRET
      );
      
      res.json({ user, token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.get(
  '/profile',
  auth,
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error('User ID not found');
      }
      const user = await userService.getUserById(req.user.userId);
      if (!user) {
        throw new Error('User not found');
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.patch(
  '/profile',
  auth,
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error('User ID not found');
      }
      const updates = req.body;
      const user = await userService.updateUser(req.user.userId, updates);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.get(
  '/organization-users',
  auth,
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error('User ID not found');
      }
      
      const users = await userService.getUsersByOrganization(req.user.userId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;