import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userService from '../services/userService.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate';
import { userSchema } from '../utils/validation';


const router = express.Router();

router.post('/register', 
    validateRequest(userSchema),
    async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await userService.createUser(username, email, passwordHash, fullName);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
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
        const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET);
        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;