import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Project } from '../../types/project';
import { Link } from 'react-router-dom';

export const ProjectList = () => {
    const queryClient = useQueryClient();
    const { data: projects, isLoading, error } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await api.get<Project[]>('/projects');
            return response.data;
        }
    });

    const deleteProject = useMutation({
        mutationFn: async (projectId: number) => {
            await api.delete(`/projects/${projectId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });

    const handleDelete = async (projectId: number) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteProject.mutateAsync(projectId);
            } catch (error) {
                console.error('Failed to delete project:', error);
            }
        }
    };

    if (isLoading) return <div className="text-center py-4">Loading projects...</div>;
    if (error) return <div className="text-center py-4 text-red-500">Error loading projects</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects?.map(project => (
                <div 
                    key={project.id} 
                    className="p-4 border rounded-lg shadow hover:shadow-md"
                >
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        <button
                            onClick={() => handleDelete(project.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            Delete
                        </button>
                    </div>
                    <p className="text-gray-600 mt-2">{project.description}</p>
                    <div className="mt-4">
                        <Link 
                            to={`/projects/${project.id}`}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            View Details
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
};