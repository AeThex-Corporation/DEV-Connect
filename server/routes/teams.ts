import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import type {
  Team,
  TeamCreate,
  TeamUpdate,
  TeamInvite,
  TeamInviteResponse,
  TeamMember,
} from "@shared/teams";

// GET /api/teams - List user's teams
export const listTeams: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(*)")
    .contains("team_members", [{ user_id: userId }])
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ teams: (data || []) as Team[] });
};

// GET /api/teams/:id - Get team details
export const getTeam: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(*)")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Team not found" });
  }

  // Check if user is a member
  const isMember = data.team_members?.some((m: TeamMember) => m.user_id === userId);
  if (!isMember && data.settings?.visibility !== "public") {
    return res.status(403).json({ error: "Not authorized" });
  }

  res.json(data as Team);
};

// POST /api/teams - Create team
export const createTeam: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const team: TeamCreate = req.body;
  const supabase = getSupabase();

  // Generate invite code
  const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  const { data, error } = await supabase
    .from("teams")
    .insert({
      name: team.name,
      description: team.description,
      avatar_url: team.avatar_url,
      owner_id: userId,
      invite_code: inviteCode,
      settings: {
        visibility: team.settings?.visibility || "private",
        require_approval: team.settings?.require_approval ?? true,
        allow_member_invites: team.settings?.allow_member_invites ?? false,
        default_permissions: team.settings?.default_permissions || ["read"],
      },
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Add owner as member
  await supabase.from("team_members").insert({
    team_id: data.id,
    user_id: userId,
    role: "owner",
    permissions: ["*"],
    status: "active",
  });

  res.status(201).json(data as Team);
};

// PUT /api/teams/:id - Update team
export const updateTeam: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const updates: TeamUpdate = req.body;
  const supabase = getSupabase();

  // Verify ownership or admin role
  const { data: member } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", id)
    .eq("user_id", userId)
    .single();

  if (!member || !["owner", "admin"].includes(member.role)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const { data, error } = await supabase
    .from("teams")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as Team);
};

// DELETE /api/teams/:id - Delete team
export const deleteTeam: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  // Verify ownership
  const { data: team } = await supabase
    .from("teams")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!team || team.owner_id !== userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const { error } = await supabase.from("teams").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
};

// POST /api/teams/:id/invite - Invite member
export const inviteToTeam: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const invite: TeamInvite = req.body;
  const supabase = getSupabase();

  // Verify permission to invite
  const { data: member } = await supabase
    .from("team_members")
    .select("role, team:teams(settings)")
    .eq("team_id", id)
    .eq("user_id", userId)
    .single();

  if (!member) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const teamSettings = (member as any).team?.settings;
  const canInvite =
    ["owner", "admin"].includes(member.role) ||
    (member.role === "member" && teamSettings?.allow_member_invites);

  if (!canInvite) {
    return res.status(403).json({ error: "No permission to invite" });
  }

  // Create invite
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const { data, error } = await supabase
    .from("team_invites")
    .insert({
      team_id: id,
      email: invite.email,
      role: invite.role,
      status: "pending",
      invited_by: userId,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // TODO: Send email invitation

  res.status(201).json(data as TeamInviteResponse);
};

// POST /api/teams/:id/join - Join team with invite code
export const joinTeam: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { invite_code } = req.body;
  const supabase = getSupabase();

  // Verify invite code
  const { data: team } = await supabase
    .from("teams")
    .select("*, settings")
    .eq("id", id)
    .single();

  if (!team || team.invite_code !== invite_code) {
    return res.status(404).json({ error: "Invalid invite code" });
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", id)
    .eq("user_id", userId)
    .single();

  if (existing) {
    return res.status(400).json({ error: "Already a member" });
  }

  // Add member
  const { data, error } = await supabase
    .from("team_members")
    .insert({
      team_id: id,
      user_id: userId,
      role: "member",
      permissions: team.settings?.default_permissions || ["read"],
      status: team.settings?.require_approval ? "invited" : "active",
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

// DELETE /api/teams/:teamId/members/:userId - Remove team member
export const removeTeamMember: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { teamId, userId: targetUserId } = req.params;
  const supabase = getSupabase();

  // Verify permission
  const { data: member } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .single();

  if (!member || !["owner", "admin"].includes(member.role)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", targetUserId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
};
