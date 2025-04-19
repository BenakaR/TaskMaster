import express from 'express';
import { auth } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.post('/', auth, async (req, res) => {
    try {
        const { message, context, history } = req.body;
        console.log('Received message:', message);
        console.log('Context:', context);

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are a helpful task management assistant. Use the following context about existing tasks to help answer the user's question:
            You have all the necessary details and ways to get them.
            If you don't know the answer, say "I don't know" or ask the user for more details.
            
            ${context}
            
            Previous conversation:
            ${history.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}
            
            User: ${message}
            Assistant:
        `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ response });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Failed to generate response',
            details: error.message 
        });
    }
});

export default router;