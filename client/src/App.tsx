import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/auth/Login';
import { Modal } from './components/common/Modal';
import { TaskList } from './components/tasks/TaskList';
import { TaskForm } from './components/tasks/TaskForm';
import { Register } from './components/auth/Register';
import { Header } from './components/layout/Header';
import { ProjectsPage } from './components/project/ProjectsPage';
import { Task } from './types/task';
import api from './services/api';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppContent() {
    const { isAuthenticated } = useAuth();
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [taskId, setTaskId] = useState<number | null>(null);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setTaskId(task.id);
        setIsEditMode(true);
        setIsTaskModalOpen(true);
    };

    const handleDeleteTask = (taskId: number) => {
        setDeleteTaskId(taskId);
        setIsDeleteMode(true);
    };

    const handleCloseModal = () => {
        setIsTaskModalOpen(false);
        setSelectedTask(null);
        setIsEditMode(false);
        setTaskId(null);
        setIsDeleteMode(false);
        setDeleteTaskId(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {isAuthenticated && <Header />}
            <Routes>
                <Route path="/" element={
                    <PrivateRoute>
                        <div className="container mx-auto p-4">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold">Tasks</h1>
                                <button
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Add Task
                                </button>
                            </div>
                            <TaskList 
                                onEditTask={handleEditTask}
                                onDeleteTask={handleDeleteTask}
                            />
                            
                            <Modal 
                                isOpen={isTaskModalOpen}
                                onClose={handleCloseModal}
                                title={isEditMode ? "Edit Task" : "Create New Task"}
                            >
                                <TaskForm 
                                    onClose={handleCloseModal}
                                    taskToEdit={selectedTask}
                                    isEditMode={isEditMode}
                                />
                            </Modal>

                            <Modal
                                isOpen={isDeleteMode}
                                onClose={() => setIsDeleteMode(false)}
                                title="Delete Task"
                            >
                                <div className="p-4">
                                    <p>Are you sure you want to delete this task?</p>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            onClick={() => setIsDeleteMode(false)}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (deleteTaskId) {
                                                    try {
                                                        await api.delete(`/tasks/${deleteTaskId}`);
                                                        setIsDeleteMode(false);
                                                        // Refresh task list
                                                        queryClient.invalidateQueries({ queryKey: ['tasks'] });
                                                    } catch (error) {
                                                        console.error('Failed to delete task:', error);
                                                    }
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </Modal>
                        </div>
                    </PrivateRoute>
                } />
                <Route path="/login" element={
                    isAuthenticated ? <Navigate to="/" /> : <Login />
                } />
                <Route path="/register" element={
                    isAuthenticated ? <Navigate to="/" /> : <Register />
                } />
                <Route path="/projects" element={
                    <PrivateRoute>
                        <ProjectsPage />
                    </PrivateRoute>
                } />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    <AppContent />
                </QueryClientProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;