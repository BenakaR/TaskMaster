import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useTasks } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { Task } from '../../types/task';
import { useOrganizationUsers } from '../../hooks/useUsers';

interface TaskListProps {
    onEditTask?: (task: Task) => void;
    onDeleteTask?: (taskId: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onEditTask, onDeleteTask }) => {
    const { tasks, isLoading, error, updateTask } = useTasks();
    const { data: projects, isLoading: isLoadingProjects } = useProjects();
    const { data: orgUsers } = useOrganizationUsers();
    const [sortByPriority, setSortByPriority] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

    if (isLoading) return <div className="text-center py-4">Loading tasks...</div>;
    if (error) return <div className="text-red-500 text-center py-4">Error loading tasks</div>;

    const sortTasks = (tasksToSort: Task[]) => {
        if (!sortByPriority) return tasksToSort;
        return [...tasksToSort].sort((a, b) => {
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    };

    const groupedTasks = {
        pending: sortTasks(tasks.filter(task => task.status === 'pending')),
        in_progress: sortTasks(tasks.filter(task => task.status === 'in_progress')),
        completed: sortTasks(tasks.filter(task => task.status === 'completed'))
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId) return;

        const taskId = parseInt(draggableId);
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        try {
            await updateTask({
                id: task.id,
                updates: { status: destination.droppableId as 'pending' | 'in_progress' | 'completed' }
            });
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const TaskCard = ({ task, index }: { task: Task; index: number }) => {
        const assignedUser = orgUsers?.find(user => user.id === task.assigned_user_id);

        return (
            <Draggable draggableId={task.id.toString()} index={index}>
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => onEditTask?.(task)}
                        className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow cursor-pointer group"
                    >
                        <div className="flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-md font-semibold text-gray-800 group-hover:text-blue-600">
                                    {task.name}
                                </h3>
                                {onDeleteTask && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteTask(task.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                            <div className="flex gap-2 items-center text-sm">
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                    {projects?.find(p => p.id === task.project_id)?.name || 'No Project'}
                                </span>
                                {assignedUser && (
                                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                        {assignedUser.username}
                                    </span>
                                )}
                                <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Draggable>
        );
    };

    const TaskColumn = ({ title, tasks, status, bgColor }: {
        title: string;
        tasks: Task[];
        status: 'pending' | 'in_progress' | 'completed';
        bgColor: string;
    }) => (
        <div className={`${bgColor} p-4 rounded-lg flex flex-col h-full min-h-[500px]`}>
            <h2 className="text-lg font-bold mb-4">{title} ({tasks.length})</h2>
            <Droppable droppableId={status}>
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-3 flex-1"
                    >
                        {tasks.map((task, index) => (
                            <TaskCard key={task.id} task={task} index={index} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );

    const filteredAndGroupedTasks = {
        pending: sortTasks(tasks.filter(task => 
            task.status === 'pending' && 
            (!selectedProjectId || task.project_id === selectedProjectId)
        )),
        in_progress: sortTasks(tasks.filter(task => 
            task.status === 'in_progress' && 
            (!selectedProjectId || task.project_id === selectedProjectId)
        )),
        completed: sortTasks(tasks.filter(task => 
            task.status === 'completed' && 
            (!selectedProjectId || task.project_id === selectedProjectId)
        ))
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <select
                        value={selectedProjectId || ''}
                        onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
                        className="px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All Projects</option>
                        {projects?.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                    {selectedProjectId && (
                        <button
                            onClick={() => setSelectedProjectId(null)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            Clear Filter
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setSortByPriority(!sortByPriority)}
                    className={`
                        px-4 py-2 rounded text-sm font-medium transition-colors
                        ${sortByPriority 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                    `}
                >
                    {sortByPriority ? 'Sorted by Priority' : 'Sort by Priority'}
                </button>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-3 gap-4">
                    <TaskColumn 
                        title="To Do" 
                        tasks={filteredAndGroupedTasks.pending} 
                        status="pending"
                        bgColor="bg-gray-100" 
                    />
                    <TaskColumn 
                        title="In Progress" 
                        tasks={filteredAndGroupedTasks.in_progress} 
                        status="in_progress"
                        bgColor="bg-blue-50" 
                    />
                    <TaskColumn 
                        title="Completed" 
                        tasks={filteredAndGroupedTasks.completed} 
                        status="completed"
                        bgColor="bg-green-50" 
                    />
                </div>
            </DragDropContext>
        </div>
    );
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'urgent':
            return 'bg-red-100 text-red-800';
        case 'high':
            return 'bg-orange-100 text-orange-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-green-100 text-green-800';
    }
};

export default TaskList;