# TaskMaster

A modern task management system with real-time search, AI assistance, and collaborative features.

## Features

- 🔐 User authentication and organization management
- 📋 Project and task management
- 🤖 AI-powered chat assistant
- 🔍 Vector-based semantic search
- 🎯 Kanban board with drag-and-drop
- 👥 User assignments and collaboration
- 🏷️ Priority and status management

## Tech Stack

### Frontend
- React 18 with TypeScript
- TanStack Query for data fetching
- React Router for navigation
- React Hook Form + Zod for form handling
- Tailwind CSS for styling
- React Beautiful DnD for drag-and-drop
- React Markdown for rich text display
- Axios for API communication

### Backend
- Node.js with Express
- PostgreSQL with pgvector for vector search
- Google's Generative AI (Gemini) for chat
- JWT for authentication
- bcrypt for password hashing
- CORS for security

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v14 or higher) with pgvector extension
- Google Cloud API key with Gemini access

### Server Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```env
PORT=8080
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmaster
GOOGLE_API_KEY=your_google_api_key
JWT_SECRET=your_jwt_secret
```

4. Initialize the database:
```bash
psql -U your_db_user -d your_db_name -f init.sql
```

5. Start the server:
```bash
npm run dev
```

### Client Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Project Structure

### Client
```
client/
├── src/
│   ├── components/    # React components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom hooks
│   ├── services/      # API services
│   ├── types/         # TypeScript definitions
│   └── App.tsx        # Root component
```

### Server
```
server/
├── routes/           # API route handlers
├── services/         # Business logic
├── middleware/       # Express middleware
└── index.js         # Entry point
```

## API Endpoints

### Authentication
- POST `/api/users/register` - Register new user
- POST `/api/users/login` - User login

### Tasks
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create task
- PATCH `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task

### Projects
- GET `/api/projects` - Get all projects
- POST `/api/projects` - Create project
- PATCH `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

### Search & Chat
- GET `/api/search/tasks` - Search tasks
- POST `/api/chat` - Interact with AI assistant

## Environment Setup

### Database Schema
The application uses PostgreSQL with the following main tables:
- organizations
- users
- projects
- tasks
- task_embeddings

### Vector Search
Uses pgvector for semantic search capabilities with task embeddings.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## License
This project is licensed under the MIT License.
