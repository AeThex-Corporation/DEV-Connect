import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import type {
  PortfolioProject,
  PortfolioCreate,
  PortfolioUpdate,
  PortfolioSearchRequest,
  PortfolioSearchResponse,
} from "@shared/portfolio";

// GET /api/portfolio - Search portfolio projects
export const searchPortfolio: RequestHandler = async (req, res) => {
  const {
    user_id,
    category,
    technologies,
    status,
    featured_only,
    search,
    limit = 50,
    offset = 0,
  } = req.query as Partial<PortfolioSearchRequest>;

  const supabase = getSupabase();
  let query = supabase
    .from("portfolio_projects")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (user_id) query = query.eq("user_id", user_id);
  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);
  if (featured_only === "true") query = query.eq("featured", true);
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (technologies) {
    const techArray = Array.isArray(technologies) ? technologies : [technologies];
    query = query.contains("technologies", techArray);
  }

  const { data: projects, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Get categories and popular technologies
  const { data: allProjects } = await supabase
    .from("portfolio_projects")
    .select("category, technologies");

  const categories = Array.from(
    new Set(allProjects?.map((p) => p.category).filter(Boolean))
  );
  const techMap = new Map<string, number>();
  allProjects?.forEach((p) => {
    p.technologies?.forEach((tech: string) => {
      techMap.set(tech, (techMap.get(tech) || 0) + 1);
    });
  });
  const popular_technologies = Array.from(techMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tech]) => tech);

  const response: PortfolioSearchResponse = {
    projects: (projects || []) as PortfolioProject[],
    total: count || 0,
    categories,
    popular_technologies,
  };

  res.json(response);
};

// GET /api/portfolio/:id - Get single portfolio project
export const getPortfolioProject: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Increment view count
  await supabase
    .from("portfolio_projects")
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq("id", id);

  res.json(data as PortfolioProject);
};

// POST /api/portfolio - Create portfolio project
export const createPortfolioProject: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const project: PortfolioCreate = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert({
      user_id: userId,
      title: project.title,
      description: project.description,
      thumbnail_url: project.thumbnail_url,
      images: project.images || [],
      videos: project.videos || [],
      demo_url: project.demo_url,
      github_url: project.github_url,
      technologies: project.technologies,
      category: project.category,
      status: project.status || "completed",
      featured: project.featured || false,
      likes_count: 0,
      views_count: 0,
      date_completed: project.date_completed,
      client_name: project.client_name,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data as PortfolioProject);
};

// PUT /api/portfolio/:id - Update portfolio project
export const updatePortfolioProject: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const updates: PortfolioUpdate = req.body;
  const supabase = getSupabase();

  // Verify ownership
  const { data: existing } = await supabase
    .from("portfolio_projects")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const { data, error } = await supabase
    .from("portfolio_projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as PortfolioProject);
};

// DELETE /api/portfolio/:id - Delete portfolio project
export const deletePortfolioProject: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  // Verify ownership
  const { data: existing } = await supabase
    .from("portfolio_projects")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
};

// POST /api/portfolio/:id/like - Like/unlike portfolio project
export const togglePortfolioLike: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("portfolio_likes")
    .select("id")
    .eq("project_id", id)
    .eq("user_id", userId)
    .single();

  if (existingLike) {
    // Unlike
    await supabase
      .from("portfolio_likes")
      .delete()
      .eq("project_id", id)
      .eq("user_id", userId);

    await supabase.rpc("decrement_portfolio_likes", { project_id: id });

    return res.json({ liked: false });
  } else {
    // Like
    await supabase
      .from("portfolio_likes")
      .insert({ project_id: id, user_id: userId });

    await supabase.rpc("increment_portfolio_likes", { project_id: id });

    return res.json({ liked: true });
  }
};
