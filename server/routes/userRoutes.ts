import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userService from '../services/user';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { userSchema } from '../utils/validation';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
}

const router: Router = express.Router();

router.post(
  '/register',
  validateRequest(userSchema),
  async (req: Request, res: Response) => {
    try {
      const { username, email, password, fullName } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await userService.createUser(username, email, passwordHash, fullName);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

router.post(
  '/login',
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
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
        { userId: user.user_id }, 
        process.env.JWT_SECRET as string
      );
      
      res.json({ user, token });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

router.get(
  '/profile',
  auth,
  async (req: Request, res: Response) => {
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
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

router.patch(
  '/profile',
  auth,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        throw new Error('User ID not found');
      }
      const updates = req.body;
      const user = await userService.updateUser(req.user.userId, updates);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

export default router;