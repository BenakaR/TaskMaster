import { pool } from './db.js';

class UserService {
    async createUser(username, email, passwordHash, organization_name) {
        // Check if the user already exists
        const existingUser = await this.getUserByEmail(email);
        if (existingUser) {
            throw new Error('User already exists with this email');
        }
        const organization = await pool.query(`SELECT * FROM organization WHERE name = $1`, [organization_name]);
        let org_id;
        if (organization.rows.length > 0) {
            org_id = organization.rows[0].id;
        } else {
            const query2 = `
                INSERT INTO organization (name)
                VALUES ($1)
                RETURNING id, name, user_ids, created_at, updated_at
            `;
            const values2 = [organization_name];
            const result2 = await pool.query(query2, values2);
            console.log('Organization created:', result2.rows[0]);
            org_id = result2.rows[0].id;
        }
        const query = `
            INSERT INTO users (username, email, password_hash, organization_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, created_at, updated_at
        `;
        const values = [username, email, passwordHash, org_id];
        const result = await pool.query(query, values);
        const userId = result.rows[0].id;
        console.log('User created:', result.rows[0]);

        const query2 = `
            UPDATE organization
            SET user_ids = array_append(user_ids, $1)
            WHERE id = $2
            RETURNING id, name, user_ids, created_at, updated_at
        `;
        const values2 = [userId, org_id];
        const result2 = await pool.query(query2, values2);
        console.log('Organization updated:', result2.rows[0]);
        
        return result.rows[0];
    }

    async getUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    async getUserById(userId) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [userId]);
        return result.rows[0] || null;
    }

    async updateUser(userId, updates) {
        const allowedUpdates = ['username', 'email'];
        const updateEntries = Object.entries(updates)
            .filter(([key]) => allowedUpdates.includes(key));
        
        if (updateEntries.length === 0) {
            throw new Error('No valid updates provided');
        }

        const setClause = updateEntries
            .map(([key], index) => `${key} = $${index + 2}`)
            .join(', ');
        
        const values = [userId, ...updateEntries.map(([, value]) => value)];
        
        const query = `
            UPDATE users 
            SET ${setClause} 
            WHERE id = $1 
            RETURNING *
        `;
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async getUsersByOrganization(userId) {
        const query = `
            SELECT u.id, u.username, u.email, u.created_at
            FROM users u
            WHERE u.organization_id = (
                SELECT organization_id 
                FROM users 
                WHERE id = $1
            )
            ORDER BY u.username
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    }
}

export default new UserService();