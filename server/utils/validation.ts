import { z } from 'zod';

export const userSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2).optional()
});

export const taskSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  projectId: z.number(),
  assignedUserId: z.number().optional(),
  dueDate: z.string().datetime().optional()
});