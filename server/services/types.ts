export interface User {
    id: number;
    username: string;
    email: string;
    created_at: Date;
    updated_at?: Date;
}

export interface Project {
    id: number;
    name: string;
    description?: string;
    owner_id: number;
    created_at: Date;
    updated_at?: Date;
}

export interface Task {
    id: number;
    name: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    project_id: number;
    assigned_user_id?: number;
    created_by: number;
    created_at: Date;
    updated_at?: Date;
    due_date?: Date;
}