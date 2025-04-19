import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const Chat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const MessageContent = ({ content, isUser }: { content: string; isUser: boolean }) => (
        <div
            className={`max-w-[80%] rounded-lg p-3 ${
                isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
            }`}
        >
            <ReactMarkdown
                components={{
                    // Customize Markdown components
                    div: ({ children }) => (
                        <div className={`markdown ${isUser ? 'text-white' : 'text-gray-800'}`}>
                            {children}
                        </div>
                    ),
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-md font-bold mb-2">{children}</h3>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children }) => (
                        <code className={`px-1 py-0.5 rounded ${
                            isUser ? 'bg-blue-400' : 'bg-gray-200'
                        }`}>
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => (
                        <pre className={`p-2 rounded mb-2 overflow-x-auto ${
                            isUser ? 'bg-blue-400' : 'bg-gray-200'
                        }`}>
                            {children}
                        </pre>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Search tasks based on input
            const searchResponse = await api.get('/search/tasks', {
                params: { query: input }
            });

            const userContext = `
        Current User:
            ID: ${user?.user_id}
            Username: ${user?.username}
        --------------------

        Related Tasks:`;

            const tasksContext = searchResponse.data
            .map((task: any) => `
        Task: ${task.name}
        Description: ${task.description || 'None'}
        Status: ${task.status}
        Priority: ${task.priority}
        Project: ${task.project_name || 'No Project'}
        Assigned to: ${task.assigned_username || 'Unassigned'}
        Due Date: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
        Created: ${new Date(task.created_at).toLocaleDateString()}
        Updated: ${new Date(task.updated_at).toLocaleDateString()}
        ${task.content_text ? `Additional Context: ${task.content_text}` : ''}
        -------------------`)
            .join('\n');
    
            const fullContext = `${userContext}\n${tasksContext}`;

            // Get AI response
            const aiResponse = await api.post('/chat', {
                message: input,
                context: fullContext,
                history: messages.slice(-5) // Send last 5 messages as context
            });

            const assistantMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: aiResponse.data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to get response:', error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>

            {/* Chat window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-96 h-[32rem] bg-white rounded-lg shadow-xl flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b bg-blue-500 text-white rounded-t-lg">
                        <h3 className="font-semibold">TaskMaster Assistant</h3>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <MessageContent 
                                    content={message.content} 
                                    isUser={message.role === 'user'} 
                                />
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};