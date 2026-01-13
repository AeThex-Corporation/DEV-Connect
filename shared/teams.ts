// Team Collaboration Types - Phase 3

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  owner_id: string;
  members: TeamMember[];
  invite_code?: string;
  settings: TeamSettings;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  joined_at: string;
  status: 'active' | 'invited' | 'suspended';
}

export interface TeamSettings {
  visibility: 'public' | 'private';
  require_approval: boolean;
  allow_member_invites: boolean;
  default_permissions: string[];
}

export interface TeamCreate {
  name: string;
  description?: string;
  avatar_url?: string;
  settings?: Partial<TeamSettings>;
}

export interface TeamUpdate {
  name?: string;
  description?: string;
  avatar_url?: string;
  settings?: Partial<TeamSettings>;
}

export interface TeamInvite {
  team_id: string;
  email: string;
  role: TeamMember['role'];
  message?: string;
}

export interface TeamInviteResponse {
  id: string;
  team_id: string;
  email: string;
  role: TeamMember['role'];
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invited_by: string;
  expires_at: string;
  created_at: string;
}
