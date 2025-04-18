import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const projectSchema = z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters'),
    description: z.string().optional()
});

type ProjectFormData = z.infer<typeof projectSchema>;

export const ProjectForm = () => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema)
    });

    const createProject = useMutation({
        mutationFn: (data: ProjectFormData) => api.post('/projects', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            reset();
        }
    });

    return (
        <form onSubmit={handleSubmit(data => createProject.mutate(data))} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Project Name
                </label>
                <input
                    {...register('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    {...register('description')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows={3}
                />
            </div>

            <button
                type="submit"
                disabled={createProject.isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                {createProject.isPending ? 'Creating...' : 'Create Project'}
            </button>
        </form>
    );
};