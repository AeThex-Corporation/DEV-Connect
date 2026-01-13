// Portfolio Management Types - Phase 3

export interface PortfolioProject {
  id: string;
  user_id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  images: string[];
  videos?: string[];
  demo_url?: string;
  github_url?: string;
  technologies: string[];
  category: string;
  status: 'completed' | 'in_progress' | 'archived';
  featured: boolean;
  likes_count: number;
  views_count: number;
  date_completed?: string;
  client_name?: string;
  testimonial?: PortfolioTestimonial;
  collaborators?: string[];
  created_at: string;
  updated_at: string;
}

export interface PortfolioTestimonial {
  client_name: string;
  client_role?: string;
  client_avatar?: string;
  rating: number;
  text: string;
  date: string;
}

export interface PortfolioCreate {
  title: string;
  description: string;
  thumbnail_url?: string;
  images?: string[];
  videos?: string[];
  demo_url?: string;
  github_url?: string;
  technologies: string[];
  category: string;
  status?: PortfolioProject['status'];
  featured?: boolean;
  date_completed?: string;
  client_name?: string;
}

export interface PortfolioUpdate {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  images?: string[];
  videos?: string[];
  demo_url?: string;
  github_url?: string;
  technologies?: string[];
  category?: string;
  status?: PortfolioProject['status'];
  featured?: boolean;
  date_completed?: string;
  client_name?: string;
}

export interface PortfolioSearchRequest {
  user_id?: string;
  category?: string;
  technologies?: string[];
  status?: PortfolioProject['status'];
  featured_only?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PortfolioSearchResponse {
  projects: PortfolioProject[];
  total: number;
  categories: string[];
  popular_technologies: string[];
}
