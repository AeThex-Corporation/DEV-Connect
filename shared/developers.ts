// Developer Profile Types

export interface DeveloperSkill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface DeveloperStats {
  profileViews: number;
  jobsCompleted: number;
  averageRating: number;
  totalEarnings: number;
  responseTime: string; // e.g., "< 2 hours"
  successRate: number; // percentage
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  technologies: string[];
  completedAt: string;
  featured: boolean;
}

export interface DeveloperAvailability {
  status: 'available' | 'busy' | 'unavailable';
  hoursPerWeek?: number;
  startDate?: string;
  timezone: string;
}

export interface DeveloperProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio: string;
  title: string; // e.g., "Senior Full-Stack Developer"
  location?: string;
  hourlyRate?: number;
  skills: DeveloperSkill[];
  portfolio: PortfolioProject[];
  availability: DeveloperAvailability;
  stats: DeveloperStats;
  verified: boolean;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperListItem {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  title: string;
  location?: string;
  hourlyRate?: number;
  skills: string[]; // Just skill names
  availability: DeveloperAvailability;
  stats: Pick<DeveloperStats, 'averageRating' | 'jobsCompleted'>;
  verified: boolean;
}

export interface DeveloperFilters {
  skills?: string[];
  minHourlyRate?: number;
  maxHourlyRate?: number;
  availability?: 'available' | 'busy' | 'unavailable';
  location?: string;
  verified?: boolean;
  minRating?: number;
  search?: string;
}

export interface DeveloperSearchRequest {
  filters?: DeveloperFilters;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'hourlyRate' | 'jobsCompleted' | 'recent';
  sortOrder?: 'asc' | 'desc';
}

export interface DeveloperSearchResponse {
  developers: DeveloperListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UpdateDeveloperProfileRequest {
  displayName?: string;
  bio?: string;
  title?: string;
  location?: string;
  hourlyRate?: number;
  skills?: DeveloperSkill[];
  availability?: DeveloperAvailability;
}

export interface DeveloperStatsResponse {
  stats: DeveloperStats;
  recentActivity: {
    profileViews: { date: string; count: number }[];
    jobApplications: { date: string; count: number }[];
  };
}
