import type { RequestHandler } from "express";
import {
  Job,
  JobSearchRequest,
  JobSearchResponse,
  CreateJobRequest,
  UpdateJobRequest,
  ApplyToJobRequest,
  JobApplication,
} from "@shared/jobs";
import { getSupabase } from "../supabase";

// GET /api/jobs/search - Advanced job search with filters
export const searchJobs: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const {
      filters = {},
      page = 1,
      limit = 20,
      sortBy = "recent",
      sortOrder = "desc",
    } = req.query as unknown as JobSearchRequest;

    let query = supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("status", "active");

    // Apply filters
    if (filters.skills && filters.skills.length > 0) {
      query = query.contains("skills", filters.skills);
    }

    if (filters.minBudget !== undefined) {
      query = query.gte("budget->min", filters.minBudget);
    }

    if (filters.maxBudget !== undefined) {
      query = query.lte("budget->max", filters.maxBudget);
    }

    if (filters.budgetType) {
      query = query.eq("budget->type", filters.budgetType);
    }

    if (filters.remote !== undefined) {
      query = query.eq("remote", filters.remote);
    }

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters.experience && filters.experience.length > 0) {
      query = query.in("experience", filters.experience);
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
      );
    }

    if (filters.featured !== undefined) {
      query = query.eq("featured", filters.featured);
    }

    // Apply sorting
    const sortColumn =
      sortBy === "budget"
        ? "budget->min"
        : sortBy === "applicants"
          ? "applicants"
          : sortBy === "relevance"
            ? "featured"
            : "posted_at";

    query = query.order(sortColumn, {
      ascending: sortOrder === "asc",
      nullsFirst: false,
    });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error searching jobs:", error);
      return res.status(500).json({ error: "Failed to search jobs" });
    }

    const jobs =
      data?.map((job: any) => ({
        id: job.id,
        title: job.title,
        companyName: job.company_name,
        companyLogo: job.company_logo,
        location: job.location,
        remote: job.remote,
        budget: job.budget,
        skills: job.skills?.map((s: any) => (typeof s === "string" ? s : s.skill)) || [],
        experience: job.experience,
        applicants: job.applicants || 0,
        postedAt: job.posted_at,
        featured: job.featured,
        saved: false, // TODO: Check if user has saved this job
      })) || [];

    // TODO: Get personalized recommendations
    const recommendations: any[] = [];

    const response: JobSearchResponse = {
      jobs,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
      recommendations,
    };

    res.json(response);
  } catch (error) {
    console.error("Unexpected error in searchJobs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/jobs/:id/full - Get full job details
export const getJobDetails: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job: Job = {
      id: data.id,
      title: data.title,
      description: data.description,
      companyName: data.company_name,
      companyLogo: data.company_logo,
      location: data.location,
      remote: data.remote,
      budget: data.budget,
      skills: data.skills || [],
      experience: data.experience,
      duration: data.duration,
      applicants: data.applicants || 0,
      postedBy: data.posted_by,
      postedAt: data.posted_at,
      expiresAt: data.expires_at,
      status: data.status,
      featured: data.featured,
      tags: data.tags || [],
    };

    res.json(job);
  } catch (error) {
    console.error("Unexpected error in getJobDetails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/jobs/create - Create new job
export const createJobPosting: RequestHandler = async (req, res) => {
  try {
    const jobData: CreateJobRequest = req.body;
    const supabase = getSupabase();

    // Verify user is authenticated
    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        title: jobData.title,
        description: jobData.description,
        company_name: jobData.companyName,
        location: jobData.location,
        remote: jobData.remote,
        budget: jobData.budget,
        skills: jobData.skills,
        experience: jobData.experience,
        duration: jobData.duration,
        expires_at: jobData.expiresAt,
        tags: jobData.tags || [],
        posted_by: userId,
        posted_at: new Date().toISOString(),
        status: "draft",
        featured: false,
        applicants: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating job:", error);
      return res.status(500).json({ error: "Failed to create job" });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Unexpected error in createJobPosting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/jobs/:id - Update job
export const updateJobPosting: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateJobRequest = req.body;
    const supabase = getSupabase();

    // Verify ownership
    const userId = req.header("x-user-id");
    const { data: existingJob } = await supabase
      .from("jobs")
      .select("posted_by")
      .eq("id", id)
      .single();

    if (!existingJob || existingJob.posted_by !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.companyName !== undefined)
      updateData.company_name = updates.companyName;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.remote !== undefined) updateData.remote = updates.remote;
    if (updates.budget) updateData.budget = updates.budget;
    if (updates.skills) updateData.skills = updates.skills;
    if (updates.experience) updateData.experience = updates.experience;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.expiresAt !== undefined)
      updateData.expires_at = updates.expiresAt;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.status) updateData.status = updates.status;

    const { data, error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating job:", error);
      return res.status(500).json({ error: "Failed to update job" });
    }

    res.json(data);
  } catch (error) {
    console.error("Unexpected error in updateJobPosting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/jobs/:id/apply - Apply to job
export const applyToJobPosting: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const applicationData: ApplyToJobRequest = req.body;
    const supabase = getSupabase();

    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if already applied
    const { data: existing } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", id)
      .eq("applicant_id", userId)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Already applied to this job" });
    }

    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        job_id: id,
        applicant_id: userId,
        cover_letter: applicationData.coverLetter,
        proposed_rate: applicationData.proposedRate,
        estimated_duration: applicationData.estimatedDuration,
        portfolio_projects: applicationData.portfolioProjects || [],
        status: "pending",
        applied_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error applying to job:", error);
      return res.status(500).json({ error: "Failed to apply" });
    }

    // Increment applicant count
    await supabase.rpc("increment_job_applicants", { job_id: id });

    res.status(201).json(data);
  } catch (error) {
    console.error("Unexpected error in applyToJobPosting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/jobs/:id/applicants - Get job applicants (owner only)
export const getJobApplicants: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    // Verify ownership
    const userId = req.header("x-user-id");
    const { data: job } = await supabase
      .from("jobs")
      .select("posted_by")
      .eq("id", id)
      .single();

    if (!job || job.posted_by !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("job_applications")
      .select(
        `
        id,
        job_id,
        applicant_id,
        cover_letter,
        proposed_rate,
        estimated_duration,
        portfolio_projects,
        status,
        applied_at,
        reviewed_at,
        profiles:applicant_id(username, display_name, avatar)
      `
      )
      .eq("job_id", id)
      .order("applied_at", { ascending: false });

    if (error) {
      console.error("Error fetching applicants:", error);
      return res.status(500).json({ error: "Failed to fetch applicants" });
    }

    const applications: JobApplication[] =
      data?.map((app: any) => ({
        id: app.id,
        jobId: app.job_id,
        applicantId: app.applicant_id,
        applicantName: app.profiles?.display_name || app.profiles?.username || "Unknown",
        applicantAvatar: app.profiles?.avatar,
        coverLetter: app.cover_letter,
        proposedRate: app.proposed_rate,
        estimatedDuration: app.estimated_duration,
        portfolio: app.portfolio_projects || [],
        status: app.status,
        appliedAt: app.applied_at,
        reviewedAt: app.reviewed_at,
      })) || [];

    res.json(applications);
  } catch (error) {
    console.error("Unexpected error in getJobApplicants:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/jobs/recommendations - Get personalized job recommendations
export const getJobRecommendations: RequestHandler = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const supabase = getSupabase();

    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // TODO: Implement ML-based recommendations
    // For now, return recent active jobs
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "active")
      .order("posted_at", { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error("Error fetching recommendations:", error);
      return res.status(500).json({ error: "Failed to fetch recommendations" });
    }

    res.json(data || []);
  } catch (error) {
    console.error("Unexpected error in getJobRecommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
