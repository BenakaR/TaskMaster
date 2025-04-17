import { pool } from './db.js';

class UserService {
    async createUser(username, email, passwordHash, fullName) {
        const query = `
            INSERT INTO users (username, email, password_hash, full_name)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, username, email, full_name
        `;
        const values = [username, email, passwordHash, fullName];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async getUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }
}

export default new UserService();