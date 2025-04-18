import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { CreateTaskDTO, Task } from '../types/task';

export const useTasks = () => {
    const queryClient = useQueryClient();

    const tasks = useQuery({
        queryKey: ['tasks'],
        queryFn: taskService.getTasks
    });

    const createTask = useMutation({
        mutationFn: (newTask: CreateTaskDTO) => taskService.createTask(newTask),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    const updateTask = useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: Partial<Task> }) => 
            taskService.updateTask(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    const deleteTask = useMutation({
        mutationFn: taskService.deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    return {
        tasks: tasks.data ?? [],
        isLoading: tasks.isLoading,
        error: tasks.error,
        createTask: createTask.mutate,
        updateTask: updateTask.mutate,
        deleteTask: deleteTask.mutate
    };
};