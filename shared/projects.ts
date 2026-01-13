// Project Management Types - Phase 3

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  team_id?: string;
  client_id?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: ProjectBudget;
  timeline: ProjectTimeline;
  tags: string[];
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectBudget {
  amount: number;
  currency: string;
  type: 'fixed' | 'hourly' | 'milestone';
  spent?: number;
  remaining?: number;
}

export interface ProjectTimeline {
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  milestones: ProjectMilestone[];
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  deliverables?: string[];
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: Project['priority'];
  assigned_to?: string;
  assigned_to_name?: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  tags?: string[];
  dependencies?: string[];
  attachments?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  team_id?: string;
  client_id?: string;
  status?: Project['status'];
  priority?: Project['priority'];
  budget?: ProjectBudget;
  timeline?: Partial<ProjectTimeline>;
  tags?: string[];
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  status?: Project['status'];
  priority?: Project['priority'];
  budget?: ProjectBudget;
  timeline?: Partial<ProjectTimeline>;
  tags?: string[];
}

export interface TaskCreate {
  project_id: string;
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assigned_to?: string;
  estimated_hours?: number;
  due_date?: string;
  tags?: string[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  tags?: string[];
}

export interface ProjectSearchRequest {
  status?: Project['status'];
  priority?: Project['priority'];
  team_id?: string;
  client_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ProjectSearchResponse {
  projects: Project[];
  total: number;
  stats: {
    active_count: number;
    completed_count: number;
    total_budget: number;
    total_spent: number;
  };
}

export interface ProjectAnalytics {
  project_id: string;
  completion_percentage: number;
  budget_utilization: number;
  time_utilization: number;
  tasks_completed: number;
  tasks_total: number;
  overdue_tasks: number;
  team_productivity: Array<{
    user_id: string;
    user_name: string;
    tasks_completed: number;
    hours_logged: number;
  }>;
}
