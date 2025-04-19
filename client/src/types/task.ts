export interface Task {
    id: number;
    name: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    project_id: number;
    assigned_user_id?: number | null;
    due_date?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateTaskDTO {
    name: string;
    description?: string;
    status: Task['status'];
    priority: Task['priority'];
    project_id: number;
    assigned_user_id?: number | null;
    due_date?: string;
}