import type { RequestHandler } from "express";
import {
  DeveloperProfile,
  DeveloperListItem,
  DeveloperSearchRequest,
  DeveloperSearchResponse,
  UpdateDeveloperProfileRequest,
  DeveloperStatsResponse,
} from "@shared/developers";
import { getSupabase } from "../supabase";

// GET /api/developers - Search/list developers with filters
export const searchDevelopers: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const {
      filters = {},
      page = 1,
      limit = 20,
      sortBy = "recent",
      sortOrder = "desc",
    } = req.query as unknown as DeveloperSearchRequest;

    let query = supabase
      .from("developer_profiles")
      .select(
        `
        id,
        user_id,
        username,
        display_name,
        avatar,
        title,
        location,
        hourly_rate,
        skills,
        availability,
        stats,
        verified,
        created_at
      `,
        { count: "exact" }
      );

    // Apply filters
    if (filters.skills && filters.skills.length > 0) {
      query = query.contains("skills", filters.skills);
    }

    if (filters.minHourlyRate !== undefined) {
      query = query.gte("hourly_rate", filters.minHourlyRate);
    }

    if (filters.maxHourlyRate !== undefined) {
      query = query.lte("hourly_rate", filters.maxHourlyRate);
    }

    if (filters.availability) {
      query = query.eq("availability->status", filters.availability);
    }

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters.verified !== undefined) {
      query = query.eq("verified", filters.verified);
    }

    if (filters.minRating !== undefined) {
      query = query.gte("stats->averageRating", filters.minRating);
    }

    if (filters.search) {
      query = query.or(
        `display_name.ilike.%${filters.search}%,title.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`
      );
    }

    // Apply sorting
    const sortColumn =
      sortBy === "rating"
        ? "stats->averageRating"
        : sortBy === "hourlyRate"
          ? "hourly_rate"
          : sortBy === "jobsCompleted"
            ? "stats->jobsCompleted"
            : "created_at";

    query = query.order(sortColumn, {
      ascending: sortOrder === "asc",
      nullsFirst: false,
    });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching developers:", error);
      return res.status(500).json({ error: "Failed to fetch developers" });
    }

    const developers: DeveloperListItem[] =
      data?.map((dev: any) => ({
        id: dev.id,
        userId: dev.user_id,
        username: dev.username,
        displayName: dev.display_name,
        avatar: dev.avatar,
        title: dev.title,
        location: dev.location,
        hourlyRate: dev.hourly_rate,
        skills: dev.skills?.map((s: any) => s.name) || [],
        availability: dev.availability,
        stats: {
          averageRating: dev.stats?.averageRating || 0,
          jobsCompleted: dev.stats?.jobsCompleted || 0,
        },
        verified: dev.verified,
      })) || [];

    const response: DeveloperSearchResponse = {
      developers,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    };

    res.json(response);
  } catch (error) {
    console.error("Unexpected error in searchDevelopers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/developers/:id - Get full developer profile
export const getDeveloperProfile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("developer_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Developer profile not found" });
    }

    // Track profile view (don't block on this)
    const userId = req.header("x-user-id");
    if (userId && userId !== data.user_id) {
      supabase
        .from("profile_views")
        .insert({
          profile_id: data.id,
          viewer_id: userId,
          viewed_at: new Date().toISOString(),
        })
        .then(() => {})
        .catch(() => {});
    }

    const profile: DeveloperProfile = {
      id: data.id,
      userId: data.user_id,
      username: data.username,
      displayName: data.display_name,
      avatar: data.avatar,
      bio: data.bio,
      title: data.title,
      location: data.location,
      hourlyRate: data.hourly_rate,
      skills: data.skills || [],
      portfolio: data.portfolio || [],
      availability: data.availability,
      stats: data.stats || {
        profileViews: 0,
        jobsCompleted: 0,
        averageRating: 0,
        totalEarnings: 0,
        responseTime: "N/A",
        successRate: 0,
      },
      verified: data.verified,
      badges: data.badges || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    res.json(profile);
  } catch (error) {
    console.error("Unexpected error in getDeveloperProfile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/developers/:id - Update developer profile
export const updateDeveloperProfile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateDeveloperProfileRequest = req.body;
    const supabase = getSupabase();

    // Verify user owns this profile
    const { data: existingProfile } = await supabase
      .from("developer_profiles")
      .select("user_id")
      .eq("id", id)
      .single();

    const userId = req.header("x-user-id");
    if (!existingProfile || existingProfile.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.displayName) updateData.display_name = updates.displayName;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.title) updateData.title = updates.title;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.hourlyRate !== undefined)
      updateData.hourly_rate = updates.hourlyRate;
    if (updates.skills) updateData.skills = updates.skills;
    if (updates.availability) updateData.availability = updates.availability;

    const { data, error } = await supabase
      .from("developer_profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }

    res.json(data);
  } catch (error) {
    console.error("Unexpected error in updateDeveloperProfile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/developers/:id/stats - Get developer analytics
export const getDeveloperStats: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    // Get profile stats
    const { data: profile } = await supabase
      .from("developer_profiles")
      .select("stats, user_id")
      .eq("id", id)
      .single();

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Only owner can see detailed stats
    const userId = req.header("x-user-id");
    if (profile.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get profile views for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: views } = await supabase
      .from("profile_views")
      .select("viewed_at")
      .eq("profile_id", id)
      .gte("viewed_at", thirtyDaysAgo.toISOString())
      .order("viewed_at", { ascending: true });

    // Aggregate views by date
    const viewsByDate: { [date: string]: number } = {};
    views?.forEach((view) => {
      const date = view.viewed_at.split("T")[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });

    const profileViews = Object.entries(viewsByDate).map(([date, count]) => ({
      date,
      count,
    }));

    // Get job applications for last 30 days (if we have that data)
    // For now, return mock data
    const jobApplications = [];

    const response: DeveloperStatsResponse = {
      stats: profile.stats,
      recentActivity: {
        profileViews,
        jobApplications,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Unexpected error in getDeveloperStats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
