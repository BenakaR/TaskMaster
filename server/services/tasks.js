import { pool } from './db.js';
import searchService from './search.js';

class TaskService {
    async getTasks(userId) {
        const query = `
            SELECT 
                t.*,
                p.name as project_name,
                u.username as assigned_username,
                to_char(t.due_date, 'YYYY-MM-DD') as due_date
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN users u ON t.assigned_user_id = u.id
            WHERE t.project_id IN (
                SELECT id FROM projects 
                WHERE id IN (
                    SELECT unnest(project_ids) FROM organization WHERE $1 = ANY(user_ids)
                )
            )
            ORDER BY t.created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    async createTask(taskData) {
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

        const result = await pool.query(query, values);
        const task = result.rows[0];

        // Index the task content
        await searchService.indexTask(
            task.id, 
            `${task.name} ${task.description || ''}`
        );
        
        return task;
    }

    async getTaskById(taskId) {
        const query = 'SELECT * FROM tasks WHERE id = $1';
        const result = await pool.query(query, [taskId]);
        return result.rows[0] || null;
    }

    async updateTask(taskId, updates, userId) {
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
            WHERE id = $1 
            AND (
                project_id IN (SELECT project_id FROM projects WHERE owner_id = $${values.length + 1})
                OR assigned_user_id = $${values.length + 1}
            )
            RETURNING *
        `;

        values.push(userId);
        const result = await pool.query(query, values);
        const task = result.rows[0] || null;

        if (task && (updates.name || updates.description)) {
            await searchService.indexTask(
                task.id,
                `${task.name} ${task.description || ''}`
            );
        }
        
        return task;
    }

    async deleteTask(taskId, userId) {
        const query = `
            DELETE FROM tasks 
            WHERE id = $1 
            AND project_id IN (
                SELECT project_id FROM projects WHERE owner_id = $2
            )
        `;
        const result = await pool.query(query, [taskId, userId]);
        return result.rowCount ? result.rowCount > 0 : false;
    }
}

export default new TaskService();