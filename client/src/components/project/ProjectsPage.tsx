import { ProjectList } from './ProjectList';
import { ProjectForm } from './ProjectForm';

export const ProjectsPage = () => {
    return (
        <div className="container mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-4">Projects</h1>
                <ProjectForm />
            </div>
            <ProjectList />
        </div>
    );
};