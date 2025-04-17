import { pool } from './db';
import { QueryResult } from 'pg';
import { Task } from './types';

class TaskService {
    async getTasks(userId: number): Promise<Task[]> {
        const query = `
            SELECT * FROM tasks 
            WHERE project_id IN (
                SELECT project_id FROM projects WHERE owner_id = $1
            ) OR assigned_user_id = $1
            ORDER BY created_at DESC
        `;
        const result: QueryResult<Task> = await pool.query(query, [userId]);
        return result.rows;
    }

    async createTask(taskData: Partial<Task>): Promise<Task> {
        const {
            name,
            description,
            status,
            priority,
            project_id,
            assigned_user_id,
            due_date,
            created_by
        } = taskData;

        const query = `
            INSERT INTO tasks (
                name, description, status, priority, 
                project_id, assigned_user_id, due_date, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        
        const values = [
            name,
            description,
            status,
            priority,
            project_id,
            assigned_user_id,
            due_date,
            created_by
        ];

        const result: QueryResult<Task> = await pool.query(query, values);
        return result.rows[0];
    }

    async getTaskById(taskId: number): Promise<Task | null> {
        const query = 'SELECT * FROM tasks WHERE task_id = $1';
        const result: QueryResult<Task> = await pool.query(query, [taskId]);
        return result.rows[0] || null;
    }

    async updateTask(
        taskId: number,
        updates: Partial<Task>,
        userId: number
    ): Promise<Task | null> {
        const allowedUpdates = [
            'name',
            'description',
            'status',
            'priority',
            'assigned_user_id',
            'due_date'
        ];

        const updateEntries = Object.entries(updates)
            .filter(([key]) => allowedUpdates.includes(key));

        if (updateEntries.length === 0) {
            throw new Error('No valid updates provided');
        }

        const setClause = updateEntries
            .map(([key], index) => `${key} = $${index + 2}`)
            .join(', ');

        const values = [taskId, ...updateEntries.map(([, value]) => value)];

        const query = `
            UPDATE tasks 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE task_id = $1 
            AND (
                project_id IN (SELECT project_id FROM projects WHERE owner_id = $${values.length + 1})
                OR assigned_user_id = $${values.length + 1}
            )
            RETURNING *
        `;

        values.push(userId);
        const result: QueryResult<Task> = await pool.query(query, values);
        return result.rows[0] || null;
    }

    async deleteTask(taskId: number, userId: number): Promise<boolean> {
        const query = `
            DELETE FROM tasks 
            WHERE task_id = $1 
            AND project_id IN (
                SELECT project_id FROM projects WHERE owner_id = $2
            )
        `;
        const result = await pool.query(query, [taskId, userId]);
        return result.rowCount? result.rowCount > 0 : false;
    }
}

export default new TaskService();