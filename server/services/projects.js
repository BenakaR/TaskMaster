import { pool } from './db.js';

class ProjectService {
    async getProjects(userId) {
        const query = `
        SELECT * FROM projects 
        WHERE id IN (
            SELECT unnest(project_ids) FROM organization WHERE $1 = ANY(user_ids)
        )
        ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        console.log('Projects retrieved:', result.rows);
        return result.rows;
    }

    async createProject(projectData) {
        const { name, description, owner_id } = projectData;
        const query = `
            INSERT INTO projects (name, description, owner_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [name, description, owner_id];
        const result = await pool.query(query, values);
        console.log('Project created:', result.rows[0]);
        const projectId = result.rows[0].id;
        
        const organization = await pool.query(`SELECT organization_id FROM users WHERE id = $1`, [owner_id]);
        console.log('Organization retrieved:', organization.rows[0]);
        const org_id = organization.rows[0].organization_id;
        const query2 = `
            UPDATE organization
            SET project_ids = array_append(project_ids, $1)
            WHERE id = $2
            RETURNING id, name, user_ids, created_at, updated_at
        `;
        const values2 = [projectId, org_id];
        const result2 = await pool.query(query2, values2);
        console.log('Organization created:', result2.rows[0]);
        
        return result.rows[0];
    }

    async getProjectById(projectId) {
        const query = 'SELECT * FROM projects WHERE id = $1';
        const result = await pool.query(query, [projectId]);
        return result.rows[0] || null;
    }

    async updateProject(projectId, updates, userId) {
        const allowedUpdates = ['name', 'description'];
        const updateEntries = Object.entries(updates)
            .filter(([key]) => allowedUpdates.includes(key));
        
        if (updateEntries.length === 0) {
            throw new Error('No valid updates provided');
        }

        const setClause = updateEntries
            .map(([key], index) => `${key} = $${index + 2}`)
            .join(', ');
        
        const values = [projectId, ...updateEntries.map(([, value]) => value)];
        
        const query = `
            UPDATE projects 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND owner_id = $${values.length + 1}
            RETURNING *
        `;
        
        values.push(userId);
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    async deleteProject(projectId, userId) {
        const query = `
            DELETE FROM projects 
            WHERE id = $1 AND owner_id = $2
        `;
        const result = await pool.query(query, [projectId, userId]);
        return result.rowCount > 0;
    }
}

export default new ProjectService();