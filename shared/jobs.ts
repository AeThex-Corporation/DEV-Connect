// Enhanced Job Board Types

export interface JobSkillRequirement {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required: boolean;
}

export interface JobBudget {
  type: 'fixed' | 'hourly';
  min?: number;
  max?: number;
  currency: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  companyName?: string;
  companyLogo?: string;
  location?: string;
  remote: boolean;
  budget: JobBudget;
  skills: JobSkillRequirement[];
  experience: 'entry' | 'mid' | 'senior' | 'lead';
  duration?: string; // e.g., "3-6 months"
  applicants: number;
  postedBy: string; // userId
  postedAt: string;
  expiresAt?: string;
  status: 'draft' | 'active' | 'closed' | 'filled';
  featured: boolean;
  tags: string[];
}

export interface JobListItem {
  id: string;
  title: string;
  companyName?: string;
  companyLogo?: string;
  location?: string;
  remote: boolean;
  budget: JobBudget;
  skills: string[]; // Just skill names
  experience: string;
  applicants: number;
  postedAt: string;
  featured: boolean;
  saved?: boolean; // For current user
}

export interface JobFilters {
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  budgetType?: 'fixed' | 'hourly';
  remote?: boolean;
  location?: string;
  experience?: ('entry' | 'mid' | 'senior' | 'lead')[];
  search?: string;
  featured?: boolean;
}

export interface JobSearchRequest {
  filters?: JobFilters;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'budget' | 'applicants' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface JobSearchResponse {
  jobs: JobListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  recommendations?: JobListItem[]; // Personalized for user
}

export interface CreateJobRequest {
  title: string;
  description: string;
  companyName?: string;
  location?: string;
  remote: boolean;
  budget: JobBudget;
  skills: JobSkillRequirement[];
  experience: 'entry' | 'mid' | 'senior' | 'lead';
  duration?: string;
  expiresAt?: string;
  tags?: string[];
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: 'draft' | 'active' | 'closed' | 'filled';
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar?: string;
  coverLetter: string;
  proposedRate?: number;
  estimatedDuration?: string;
  portfolio?: string[];
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
}

export interface ApplyToJobRequest {
  coverLetter: string;
  proposedRate?: number;
  estimatedDuration?: string;
  portfolioProjects?: string[]; // project IDs
}

export interface JobRecommendationsRequest {
  userId: string;
  limit?: number;
}
