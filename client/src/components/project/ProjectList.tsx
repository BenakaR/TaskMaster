import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Project } from '../../types/project';
import { Link } from 'react-router-dom';

export const ProjectList = () => {
    const { data: projects, isLoading, error } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await api.get<Project[]>('/projects');
            return response.data;
        }
    });

    if (isLoading) return <div>Loading projects...</div>;
    if (error) return <div>Error loading projects</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects?.map(project => (
                <div 
                    key={project.id} 
                    className="p-4 border rounded-lg shadow hover:shadow-md"
                >
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <p className="text-gray-600">{project.description}</p>
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