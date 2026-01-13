// Role-Based Access Control (RBAC) System

export const PLATFORM_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  COMMUNITY_MANAGER: 'community_manager',
  CONTENT_CREATOR: 'content_creator',
  EMPLOYER_PREMIUM: 'employer_premium',
  RECRUITER: 'recruiter',
  MENTOR_VERIFIED: 'mentor_verified',
  USER: 'user'
};

export const PERMISSIONS = {
  // Admin permissions (full access)
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_ALL_DATA: 'view_all_data',
  MANAGE_PLATFORM_SETTINGS: 'manage_platform_settings',
  MANAGE_EXTERNAL_JOBS: 'manage_external_jobs',
  
  // Moderation permissions
  MODERATE_CONTENT: 'moderate_content',
  BAN_USERS: 'ban_users',
  DELETE_CONTENT: 'delete_content',
  VIEW_REPORTS: 'view_reports',
  RESOLVE_REPORTS: 'resolve_reports',
  
  // Community management permissions
  MANAGE_GROUPS: 'manage_groups',
  FEATURE_CONTENT: 'feature_content',
  MANAGE_FORUMS: 'manage_forums',
  SEND_ANNOUNCEMENTS: 'send_announcements',
  MANAGE_EVENTS: 'manage_events',
  
  // Content creation permissions
  CREATE_COURSES: 'create_courses',
  CREATE_TUTORIALS: 'create_tutorials',
  MANAGE_LEARNING_RESOURCES: 'manage_learning_resources',
  CERTIFY_SKILLS: 'certify_skills',
  
  // Employer/Recruiter permissions
  POST_UNLIMITED_JOBS: 'post_unlimited_jobs',
  ACCESS_AI_TALENT_SCOUT: 'access_ai_talent_scout',
  ADVANCED_CANDIDATE_SEARCH: 'advanced_candidate_search',
  FEATURE_JOB_LISTINGS: 'feature_job_listings',
  BULK_HIRING: 'bulk_hiring',
  EMPLOYER_ANALYTICS: 'employer_analytics',
  
  // Mentorship permissions
  BECOME_MENTOR: 'become_mentor',
  MANAGE_MENTORSHIP: 'manage_mentorship',
  VIEW_MENTEE_PROGRESS: 'view_mentee_progress'
};

// Role to Permissions mapping
export const ROLE_PERMISSIONS = {
  [PLATFORM_ROLES.ADMIN]: [
    // Admins have ALL permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [PLATFORM_ROLES.MODERATOR]: [
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.BAN_USERS,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.RESOLVE_REPORTS,
    PERMISSIONS.MANAGE_FORUMS
  ],
  
  [PLATFORM_ROLES.COMMUNITY_MANAGER]: [
    PERMISSIONS.MANAGE_GROUPS,
    PERMISSIONS.FEATURE_CONTENT,
    PERMISSIONS.MANAGE_FORUMS,
    PERMISSIONS.SEND_ANNOUNCEMENTS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.VIEW_REPORTS // Can view but not necessarily resolve
  ],
  
  [PLATFORM_ROLES.CONTENT_CREATOR]: [
    PERMISSIONS.CREATE_COURSES,
    PERMISSIONS.CREATE_TUTORIALS,
    PERMISSIONS.MANAGE_LEARNING_RESOURCES
  ],
  
  [PLATFORM_ROLES.EMPLOYER_PREMIUM]: [
    PERMISSIONS.POST_UNLIMITED_JOBS,
    PERMISSIONS.ACCESS_AI_TALENT_SCOUT,
    PERMISSIONS.ADVANCED_CANDIDATE_SEARCH,
    PERMISSIONS.FEATURE_JOB_LISTINGS,
    PERMISSIONS.EMPLOYER_ANALYTICS
  ],
  
  [PLATFORM_ROLES.RECRUITER]: [
    PERMISSIONS.ADVANCED_CANDIDATE_SEARCH,
    PERMISSIONS.BULK_HIRING,
    PERMISSIONS.EMPLOYER_ANALYTICS,
    PERMISSIONS.ACCESS_AI_TALENT_SCOUT
  ],
  
  [PLATFORM_ROLES.MENTOR_VERIFIED]: [
    PERMISSIONS.BECOME_MENTOR,
    PERMISSIONS.MANAGE_MENTORSHIP,
    PERMISSIONS.VIEW_MENTEE_PROGRESS
  ],
  
  [PLATFORM_ROLES.USER]: [
    // Basic user permissions (none specified = default access)
  ]
};

// Role descriptions for UI display
export const ROLE_DESCRIPTIONS = {
  [PLATFORM_ROLES.ADMIN]: {
    name: 'Administrator',
    description: 'Full platform access and control',
    color: 'red',
    icon: '👑'
  },
  [PLATFORM_ROLES.MODERATOR]: {
    name: 'Moderator',
    description: 'Content moderation and user management',
    color: 'orange',
    icon: '🛡️'
  },
  [PLATFORM_ROLES.COMMUNITY_MANAGER]: {
    name: 'Community Manager',
    description: 'Manages groups, forums, and community features',
    color: 'blue',
    icon: '👥'
  },
  [PLATFORM_ROLES.CONTENT_CREATOR]: {
    name: 'Content Creator',
    description: 'Creates courses, tutorials, and learning resources',
    color: 'purple',
    icon: '📚'
  },
  [PLATFORM_ROLES.EMPLOYER_PREMIUM]: {
    name: 'Premium Employer',
    description: 'Advanced hiring features and analytics',
    color: 'green',
    icon: '💼'
  },
  [PLATFORM_ROLES.RECRUITER]: {
    name: 'Recruiter',
    description: 'Advanced candidate search and bulk hiring',
    color: 'cyan',
    icon: '🎯'
  },
  [PLATFORM_ROLES.MENTOR_VERIFIED]: {
    name: 'Verified Mentor',
    description: 'Mentorship program access',
    color: 'yellow',
    icon: '🎓'
  },
  [PLATFORM_ROLES.USER]: {
    name: 'User',
    description: 'Standard platform access',
    color: 'gray',
    icon: '👤'
  }
};

/**
 * Check if a user has a specific role
 * @param {Object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export function hasRole(user, role) {
  if (!user) return false;
  
  // Check new platform_roles array
  if (user.platform_roles && Array.isArray(user.platform_roles)) {
    return user.platform_roles.includes(role);
  }
  
  // Fallback: check legacy role field
  if (user.role === 'admin') {
    return role === PLATFORM_ROLES.ADMIN;
  }
  
  return role === PLATFORM_ROLES.USER;
}

/**
 * Check if a user has any of the specified roles
 * @param {Object} user - User object
 * @param {Array<string>} roles - Array of roles to check
 * @returns {boolean}
 */
export function hasAnyRole(user, roles) {
  if (!user || !roles || roles.length === 0) return false;
  return roles.some(role => hasRole(user, role));
}

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user) return false;
  
  // Get user's roles
  let userRoles = [];
  if (user.platform_roles && Array.isArray(user.platform_roles)) {
    userRoles = user.platform_roles;
  } else if (user.role === 'admin') {
    userRoles = [PLATFORM_ROLES.ADMIN];
  } else {
    userRoles = [PLATFORM_ROLES.USER];
  }
  
  // Check if any of user's roles grant this permission
  return userRoles.some(role => {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  });
}

/**
 * Check if a user has all specified permissions
 * @param {Object} user - User object
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function hasAllPermissions(user, permissions) {
  if (!user || !permissions || permissions.length === 0) return false;
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Check if a user has any of the specified permissions
 * @param {Object} user - User object
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !permissions || permissions.length === 0) return false;
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Get all permissions for a user
 * @param {Object} user - User object
 * @returns {Array<string>} Array of permission strings
 */
export function getUserPermissions(user) {
  if (!user) return [];
  
  let userRoles = [];
  if (user.platform_roles && Array.isArray(user.platform_roles)) {
    userRoles = user.platform_roles;
  } else if (user.role === 'admin') {
    userRoles = [PLATFORM_ROLES.ADMIN];
  } else {
    userRoles = [PLATFORM_ROLES.USER];
  }
  
  // Collect all unique permissions from user's roles
  const permissions = new Set();
  userRoles.forEach(role => {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach(permission => permissions.add(permission));
  });
  
  return Array.from(permissions);
}

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isAdmin(user) {
  return hasRole(user, PLATFORM_ROLES.ADMIN);
}

/**
 * Check if user can moderate content
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canModerate(user) {
  return hasAnyRole(user, [PLATFORM_ROLES.ADMIN, PLATFORM_ROLES.MODERATOR]);
}

/**
 * Check if user can manage community features
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canManageCommunity(user) {
  return hasAnyRole(user, [PLATFORM_ROLES.ADMIN, PLATFORM_ROLES.COMMUNITY_MANAGER]);
}