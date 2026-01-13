import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectSearchRequest,
  ProjectSearchResponse,
  Task,
  TaskCreate,
  TaskUpdate,
  ProjectAnalytics,
} from "@shared/projects";

// GET /api/projects - Search projects
export const searchProjects: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    status,
    priority,
    team_id,
    client_id,
    search,
    limit = 50,
    offset = 0,
  } = req.query as Partial<ProjectSearchRequest>;

  const supabase = getSupabase();
  let query = supabase
    .from("projects")
    .select("*", { count: "exact" })
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (team_id) query = query.eq("team_id", team_id);
  if (client_id) query = query.eq("client_id", client_id);
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: projects, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Calculate stats
  const { data: allProjects } = await supabase
    .from("projects")
    .select("status, budget")
    .eq("owner_id", userId);

  const stats = {
    active_count: allProjects?.filter((p) => p.status === "active").length || 0,
    completed_count: allProjects?.filter((p) => p.status === "completed").length || 0,
    total_budget: allProjects?.reduce((sum, p) => sum + (p.budget?.amount || 0), 0) || 0,
    total_spent: allProjects?.reduce((sum, p) => sum + (p.budget?.spent || 0), 0) || 0,
  };

  const response: ProjectSearchResponse = {
    projects: (projects || []) as Project[],
    total: count || 0,
    stats,
  };

  res.json(response);
};

// GET /api/projects/:id - Get project details
export const getProject: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Check permission
  if (data.owner_id !== userId) {
    // Check if user is team member
    if (data.team_id) {
      const { data: member } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", data.team_id)
        .eq("user_id", userId)
        .single();

      if (!member) {
        return res.status(403).json({ error: "Not authorized" });
      }
    } else {
      return res.status(403).json({ error: "Not authorized" });
    }
  }

  res.json(data as Project);
};

// POST /api/projects - Create project
export const createProject: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const project: ProjectCreate = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: project.name,
      description: project.description,
      owner_id: userId,
      team_id: project.team_id,
      client_id: project.client_id,
      status: project.status || "planning",
      priority: project.priority || "medium",
      budget: project.budget,
      timeline: project.timeline || { milestones: [] },
      tags: project.tags || [],
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data as Project);
};

// PUT /api/projects/:id - Update project
export const updateProject: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const updates: ProjectUpdate = req.body;
  const supabase = getSupabase();

  // Verify ownership
  const { data: existing } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!existing || existing.owner_id !== userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as Project);
};

// DELETE /api/projects/:id - Delete project
export const deleteProject: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  // Verify ownership
  const { data: existing } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!existing || existing.owner_id !== userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
};

// GET /api/projects/:id/tasks - Get project tasks
export const getProjectTasks: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { status, assigned_to } = req.query;
  const supabase = getSupabase();

  // Verify project access
  const { data: project } = await supabase
    .from("projects")
    .select("owner_id, team_id")
    .eq("id", id)
    .single();

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (assigned_to) query = query.eq("assigned_to", assigned_to);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ tasks: (data || []) as Task[] });
};

// POST /api/projects/:id/tasks - Create task
export const createTask: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const task: TaskCreate = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: id,
      title: task.title,
      description: task.description,
      status: task.status || "todo",
      priority: task.priority || "medium",
      assigned_to: task.assigned_to,
      estimated_hours: task.estimated_hours,
      due_date: task.due_date,
      tags: task.tags || [],
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data as Task);
};

// PUT /api/tasks/:id - Update task
export const updateTask: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const updates: TaskUpdate = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as Task);
};

// DELETE /api/tasks/:id - Delete task
export const deleteTask: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
};

// GET /api/projects/:id/analytics - Get project analytics
export const getProjectAnalytics: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params as { id: string };
  const supabase = getSupabase();

  // Get project and tasks
  const [{ data: project }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single(),
    supabase.from("tasks").select("*").eq("project_id", id),
  ]);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const tasks_total = tasks?.length || 0;
  const tasks_completed = tasks?.filter((t) => t.status === "done").length || 0;
  const overdue_tasks = tasks?.filter((t) => {
    return t.due_date && new Date(t.due_date) < new Date() && t.status !== "done";
  }).length || 0;

  const completion_percentage = tasks_total > 0 ? (tasks_completed / tasks_total) * 100 : 0;
  
  const budget_utilization = project.budget?.amount
    ? ((project.budget?.spent || 0) / project.budget.amount) * 100
    : 0;

  const time_utilization = project.timeline?.estimated_hours
    ? ((project.timeline?.actual_hours || 0) / project.timeline.estimated_hours) * 100
    : 0;

  // Get team productivity
  const teamProductivity = new Map<string, { tasks: number; hours: number }>();
  tasks?.forEach((task) => {
    if (task.assigned_to) {
      const existing = teamProductivity.get(task.assigned_to) || { tasks: 0, hours: 0 };
      if (task.status === "done") existing.tasks += 1;
      existing.hours += task.actual_hours || 0;
      teamProductivity.set(task.assigned_to, existing);
    }
  });

  const analytics: ProjectAnalytics = {
    project_id: id,
    completion_percentage,
    budget_utilization,
    time_utilization,
    tasks_completed,
    tasks_total,
    overdue_tasks,
    team_productivity: Array.from(teamProductivity.entries()).map(([user_id, data]) => ({
      user_id,
      user_name: user_id,
      tasks_completed: data.tasks,
      hours_logged: data.hours,
    })),
  };

  res.json(analytics);
};
