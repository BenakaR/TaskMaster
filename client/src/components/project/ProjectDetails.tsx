import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Project } from '../../types/project';
import { TaskList } from '../tasks/TaskList';

export const ProjectDetails = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const { data: project, isLoading, error } = useQuery({
        queryKey: ['projects', projectId],
        queryFn: async () => {
            const response = await api.get<Project>(`/projects/${projectId}`);
            return response.data;
        }
    });

    if (isLoading) return <div className="text-center py-4">Loading project details...</div>;
    if (error) return <div className="text-center py-4 text-red-500">Error loading project details</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/projects')}
                className="mb-4 text-blue-500 hover:text-blue-700"
            >
                ← Back to Projects
            </button>
            
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h1 className="text-2xl font-bold mb-2">{project?.name}</h1>
                <p className="text-gray-600 mb-4">{project?.description}</p>
                <div className="text-sm text-gray-500">
                    Created: {new Date(project?.created_at!).toLocaleDateString()}
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Project Tasks</h2>
                {/* <TaskList projectId={Number(projectId)} /> */}
            </div>
        </div>
    );
};