import api from './api';
import { Task, CreateTaskDTO } from '../types/task';

export const taskService = {
    getTasks: async () => {
        const { data } = await api.get<Task[]>('/tasks');
        return data;
    },

    getTask: async (id: number) => {
        const { data } = await api.get<Task>(`/tasks/${id}`);
        return data;
    },

    createTask: async (task: CreateTaskDTO) => {
        const { data } = await api.post<Task>('/tasks', task);
        return data;
    },

    updateTask: async (id: number, updates: Partial<Task>) => {
        const { data } = await api.patch<Task>(`/tasks/${id}`, updates);
        return data;
    },

    deleteTask: async (id: number) => {
        await api.delete(`/tasks/${id}`);
    }
};