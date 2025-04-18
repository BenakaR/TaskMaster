import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTasks } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useOrganizationUsers } from '../../hooks/useUsers';
import { CreateTaskDTO, Task } from '../../types/task';

interface TaskFormProps {
    onClose: () => void;
    taskToEdit?: Task | null;
    isEditMode?: boolean;
}

const taskSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    project_id: z.number(),
    assigned_user_id: z.union([z.number(), z.null()]).optional(),
    due_date: z.string().optional().nullable()
});

export const TaskForm: React.FC<TaskFormProps> = ({ onClose, taskToEdit, isEditMode }) => {
    const { createTask, updateTask } = useTasks();
    const { data: projects, isLoading: isLoadingProjects } = useProjects();
    const { data: users, isLoading: isLoadingUsers } = useOrganizationUsers();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateTaskDTO>({
        resolver: zodResolver(taskSchema),
        defaultValues: taskToEdit || undefined
    });

    const onSubmit = async (data: CreateTaskDTO) => {
        console.log('Form submitted:', data);
        try {
            if (isEditMode && taskToEdit) {
                console.log('Task updated successfully!');
                await updateTask({ id: taskToEdit.id, updates: data });
            } else {
                await createTask(data);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    {...register('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.name && (
                    <span className="text-sm text-red-500">{errors.name.message}</span>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                <select
                    {...register('project_id', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoadingProjects}
                >
                    <option value="">Select a project</option>
                    {projects?.map((project) => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                    ))}
                </select>
                {errors.project_id && (
                    <span className="text-sm text-red-500">{errors.project_id.message}</span>
                )}
                {isLoadingProjects && (
                    <span className="text-sm text-gray-500">Loading projects...</span>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Assign To
                </label>
                <select
                    {...register('assigned_user_id', { 
                        setValueAs: (value) => {
                            if (value === "" || value === "0") return null;
                            return parseInt(value);
                        }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoadingUsers}
                >
                    <option value="">Unassigned</option>
                    {users?.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.username}
                        </option>
                    ))}
                </select>
                {isLoadingUsers && (
                    <span className="text-sm text-gray-500">Loading users...</span>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    {...register('description')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                    {...register('status')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                    {...register('priority')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
                </button>
            </div>
        </form>
    );
};