import { pool } from './db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

class SearchService {
    async createEmbedding(text) {
        const model = genAI.getGenerativeModel({ model: "embedding-001" });
        try {
            const result = await model.embedContent(text);
            if (!result.embedding?.values) {
                throw new Error('No embedding values received from Gemini API');
            }
            return result.embedding.values;
        } catch (error) {
            console.error('Embedding error:', error);
            throw error;
        }
    }

    formatVectorForPostgres(vector) {
        return `[${vector.map(v => parseFloat(v)).join(',')}]`;
    }

    async indexTask(taskId, content) {
        try {
            const embedding = await this.createEmbedding(content);
            const formattedEmbedding = this.formatVectorForPostgres(embedding);

            const query = `
                INSERT INTO task_embeddings (task_id, content_embedding, content_text)
                VALUES ($1, $2::vector, $3)
                ON CONFLICT (task_id) 
                DO UPDATE SET 
                    content_embedding = $2::vector,
                    content_text = $3,
                    created_at = CURRENT_TIMESTAMP
            `;

            await pool.query(query, [taskId, formattedEmbedding, content]);
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                embedding: error.embedding,
                query: error.query
            });
            throw error;
        }
    }

    async hybridSearch(searchQuery, limit = 5) {
        try {
            const embedding = await this.createEmbedding(searchQuery);
            const formattedEmbedding = this.formatVectorForPostgres(embedding);
            
            const query = `
                WITH search_results AS (
                    SELECT 
                        t.*,
                        te.content_text,
                        p.name as project_name,
                        u.username as assigned_username,
                        to_char(t.due_date, 'YYYY-MM-DD') as due_date,
                        1 - (te.content_embedding <=> $1::vector) as similarity,
                        ts_rank_cd(
                            to_tsvector('english', t.name || ' ' || COALESCE(t.description, '')),
                            plainto_tsquery('english', $2)
                        ) as text_rank
                    FROM tasks t
                    JOIN task_embeddings te ON t.id = te.task_id
                    LEFT JOIN projects p ON t.project_id = p.id
                    LEFT JOIN users u ON t.assigned_user_id = u.id
                    WHERE 
                        to_tsvector('english', t.name || ' ' || COALESCE(t.description, '')) @@ 
                        plainto_tsquery('english', $2)
                        OR 1 - (te.content_embedding <=> $1::vector) > 0.7
                )
                SELECT 
                    id,
                    name,
                    description,
                    status,
                    priority,
                    project_id,
                    project_name,
                    assigned_user_id,
                    assigned_username,
                    due_date,
                    created_at,
                    updated_at,
                    content_text,
                    similarity,
                    text_rank
                FROM search_results
                ORDER BY (0.3 * text_rank + 0.7 * similarity) DESC
                LIMIT $3
            `;

            const result = await pool.query(query, [formattedEmbedding, searchQuery, limit]);
            return result.rows;
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }
}

export default new SearchService();