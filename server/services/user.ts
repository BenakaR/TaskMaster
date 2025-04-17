import { pool } from './db';
import { QueryResult } from 'pg';

interface User {
    user_id: number;
    username: string;
    email: string;
    password_hash: string;
    full_name?: string;
    created_at: Date;
    updated_at: Date;
}

class UserService {
    async createUser(
        username: string,
        email: string,
        passwordHash: string,
        fullName?: string
    ): Promise<User> {
        const query = `
            INSERT INTO users (username, email, password_hash, full_name)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, username, email, full_name, created_at, updated_at
        `;
        const values = [username, email, passwordHash, fullName];
        const result: QueryResult<User> = await pool.query(query, values);
        return result.rows[0];
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result: QueryResult<User> = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    async getUserById(userId: number): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE user_id = $1';
        const result: QueryResult<User> = await pool.query(query, [userId]);
        return result.rows[0] || null;
    }

    async updateUser(userId: number, updates: Partial<User>): Promise<User> {
        const allowedUpdates = ['username', 'email', 'full_name'];
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
            WHERE user_id = $1 
            RETURNING *
        `;
        
        const result: QueryResult<User> = await pool.query(query, values);
        return result.rows[0];
    }
}

export default new UserService();