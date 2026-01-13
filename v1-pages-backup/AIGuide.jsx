import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Search,
  Target,
  Users,
  Briefcase,
  BookOpen,
  Award,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Shield,
  Bell,
  Brain,
  Map,
  Trophy,
  Rocket,
  Building2,
  BarChart,
  CheckCircle,
  ArrowRight,
  Play,
  Eye
} from 'lucide-react';

export default function AIGuide() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Agents', icon: Sparkles },
    { id: 'career', name: 'Career Growth', icon: TrendingUp },
    { id: 'jobs', name: 'Job Matching', icon: Briefcase },
    { id: 'team', name: 'Team Building', icon: Users },
    { id: 'learning', name: 'Learning', icon: BookOpen },
    { id: 'community', name: 'Community', icon: MessageSquare },
    { id: 'employer', name: 'For Employers', icon: Building2 }
  ];

  const aiAgents = [
    {
      id: 'talent-scout',
      name: 'AI Talent Scout',
      icon: Target,
      category: 'employer',
      color: 'from-purple-500 to-indigo-500',
      description: 'Automatically find and analyze the perfect developers for your job postings',
      location: 'Employer Dashboard',
      howToUse: [
        'Go to Employer Dashboard',
        'Click "AI Talent Scout" button',
        'AI analyzes all developers and ranks them by match score',
        'Review detailed analysis for each candidate',
        'Send auto-generated outreach messages'
      ],
      features: [
        '0-100% match scoring for each developer',
        'Detailed skill compatibility analysis',
        'Experience level matching',
        'Auto-generated personalized outreach messages',
        'Why each developer is a good fit'
      ],
      bestFor: 'Employers looking to fill positions quickly with qualified candidates',
      proTip: 'Review the top 10 matches first - they typically have 85%+ match scores'
    },
    {
      id: 'job-matcher',
      name: 'AI Job Matcher',
      icon: Briefcase,
      category: 'jobs',
      color: 'from-blue-500 to-cyan-500',
      description: 'Get personalized job recommendations based on your skills and experience',
      location: 'Dashboard → AI Matches Tab',
      howToUse: [
        'Complete your profile with skills and experience',
        'Visit your Dashboard',
        'Click on "AI Matches" tab',
        'See ranked job recommendations',
        'Click "Why this match?" to see detailed analysis'
      ],
      features: [
        'Personalized match scoring',
        'Success probability predictions',
        'Skills you bring to each role',
        'What you\'ll learn from the job',
        'Application tips specific to each job'
      ],
      bestFor: 'Developers who want AI to find the perfect jobs for them',
      proTip: 'Jobs with 80%+ match scores have 5x higher acceptance rates'
    },
    {
      id: 'career-coach',
      name: 'AI Career Coach',
      icon: Brain,
      category: 'career',
      color: 'from-green-500 to-emerald-500',
      description: 'Receive personalized career guidance and skill development roadmaps',
      location: 'Dashboard',
      howToUse: [
        'Access from Dashboard',
        'AI analyzes your current profile',
        'Receive personalized career advice',
        'Get skill gap recommendations',
        'Follow suggested learning paths'
      ],
      features: [
        'Career trajectory analysis',
        'Skill gap identification',
        'Market demand insights',
        'Salary growth predictions',
        'Next role recommendations'
      ],
      bestFor: 'Developers planning their long-term career growth',
      proTip: 'Run this monthly to track your progress and adjust your learning path'
    },
    {
      id: 'skill-gap-analyzer',
      name: 'AI Skill Gap Analyzer',
      icon: Target,
      category: 'career',
      color: 'from-purple-500 to-pink-500',
      description: 'Discover specific skill gaps preventing job opportunities',
      location: 'Profile → AI Career Tools',
      howToUse: [
        'Go to your Profile page',
        'Find "AI Career Tools" section',
        'Click "Skill Gap Analyzer"',
        'AI compares your skills vs 100+ open jobs',
        'Get prioritized list of skills to learn'
      ],
      features: [
        'Career competitiveness score (0-100)',
        'Critical skill gaps with market demand',
        'Job opportunities locked by each gap',
        'Salary impact of learning each skill',
        'Trending skills with growth rates',
        'Certification readiness assessment'
      ],
      bestFor: 'Developers wondering what to learn next to unlock more opportunities',
      proTip: 'Focus on "critical" priority gaps first - they unlock the most jobs'
    },
    {
      id: 'career-roadmap',
      name: 'AI Career Roadmap Generator',
      icon: Map,
      category: 'career',
      color: 'from-teal-500 to-cyan-500',
      description: 'Get a detailed multi-year career development plan',
      location: 'Profile → AI Career Tools',
      howToUse: [
        'Navigate to Profile → AI Career Tools',
        'Click "Career Roadmap"',
        'Select your target role (e.g., Senior Scripter)',
        'Choose timeframe (6 months to 3 years)',
        'Receive detailed quarterly milestones'
      ],
      features: [
        'Quarter-by-quarter goals and milestones',
        'Skills learning sequence (what to learn when)',
        'Portfolio projects roadmap',
        'Certification timeline',
        'Salary growth projections by year',
        'Networking and experience goals'
      ],
      bestFor: 'Developers who want a clear, structured path to their dream role',
      proTip: 'Save your roadmap and review it quarterly to track progress'
    },
    {
      id: 'project-generator',
      name: 'AI Project Generator',
      icon: Sparkles,
      category: 'learning',
      color: 'from-pink-500 to-rose-500',
      description: 'Generate detailed project ideas tailored to your skill level',
      location: 'Profile → AI Career Tools',
      howToUse: [
        'Go to your Profile',
        'Click "Project Generator" in AI Tools',
        'AI analyzes your skills and experience',
        'Receive 5-8 personalized project ideas',
        'Each includes implementation guide and monetization tips'
      ],
      features: [
        'Personalized project concepts',
        'Step-by-step implementation guides',
        'Tech stack recommendations',
        'Estimated completion time',
        'Monetization strategies',
        'Skills you\'ll practice'
      ],
      bestFor: 'Developers looking for portfolio project ideas',
      proTip: 'Build projects marked "high portfolio value" first - employers love seeing them'
    },
    {
      id: 'learning-path',
      name: 'AI Learning Path Generator',
      icon: BookOpen,
      category: 'learning',
      color: 'from-yellow-500 to-orange-500',
      description: 'Get custom learning paths based on your goals and market trends',
      location: 'Learning Hub',
      howToUse: [
        'Visit Learning Hub page',
        'Specify your learning goal',
        'AI creates step-by-step learning path',
        'Follow curated resources in order',
        'Track your progress automatically'
      ],
      features: [
        'Personalized course sequences',
        'Beginner to expert progression',
        'Project-based learning milestones',
        'Time estimates for each resource',
        'Progress tracking and certificates'
      ],
      bestFor: 'Developers starting to learn a new skill from scratch',
      proTip: 'Complete one module fully before moving to the next for better retention'
    },
    {
      id: 'interview-assistant',
      name: 'AI Interview Assistant',
      icon: MessageSquare,
      category: 'jobs',
      color: 'from-indigo-500 to-purple-500',
      description: 'Prepare for interviews with AI-generated questions and guidance',
      location: 'Available in Interview Scheduler',
      howToUse: [
        'When you have an interview scheduled',
        'Open the Interview Scheduler',
        'Click "AI Interview Prep"',
        'Get custom questions for that specific job',
        'Practice with STAR method examples'
      ],
      features: [
        'Job-specific interview questions',
        'Technical and behavioral questions',
        'Sample answers using STAR method',
        'What to ask the interviewer',
        'Red flags to watch for'
      ],
      bestFor: 'Developers preparing for upcoming interviews',
      proTip: 'Practice answering out loud, not just in your head'
    },
    {
      id: 'asset-optimizer',
      name: 'AI Asset Optimizer',
      icon: DollarSign,
      category: 'employer',
      color: 'from-emerald-500 to-teal-500',
      description: 'Optimize marketplace listings for maximum sales',
      location: 'My Assets Page',
      howToUse: [
        'Upload an asset to Marketplace',
        'Click "AI Optimize" on the asset',
        'AI analyzes pricing, title, description, and tags',
        'Review suggestions',
        'Apply optimizations with one click'
      ],
      features: [
        'Smart pricing based on similar assets',
        'SEO-optimized titles and descriptions',
        'High-impact tag recommendations',
        'Competitive analysis',
        'Performance improvement predictions'
      ],
      bestFor: 'Marketplace sellers wanting to increase sales',
      proTip: 'Optimize pricing first - it has the biggest immediate impact on sales'
    },
    {
      id: 'team-builder',
      name: 'AI Team Builder',
      icon: Users,
      category: 'team',
      color: 'from-violet-500 to-purple-500',
      description: 'Build optimal teams with perfect skill synergies',
      location: 'Teams Page',
      howToUse: [
        'Go to Teams page',
        'Click "Create Team" or select existing team',
        'Click "AI Optimize Team"',
        'For new teams: AI suggests 3-7 developers',
        'For existing teams: Get optimization recommendations'
      ],
      features: [
        'Optimal team composition (3-7 members)',
        'Role assignments (lead, technical lead, specialists)',
        'Skill coverage analysis',
        'Team synergy predictions',
        'Complementary skills matching'
      ],
      bestFor: 'Team leaders forming new teams or optimizing existing ones',
      proTip: 'Look for "leadership potential" badges when selecting team leads'
    },
    {
      id: 'collaboration-analyzer',
      name: 'AI Collaboration Analyzer',
      icon: BarChart,
      category: 'team',
      color: 'from-indigo-500 to-blue-500',
      description: 'Monitor team dynamics and identify bottlenecks',
      location: 'Teams Page → Team Dashboard',
      howToUse: [
        'Select a team from Teams page',
        'Click "Analyze Dynamics" button',
        'AI analyzes tasks, messages, and collaboration',
        'Review health score and insights',
        'Implement recommended actions'
      ],
      features: [
        'Team health score (0-100)',
        'Velocity and timeline risk analysis',
        'Communication quality assessment',
        'Workload distribution balance',
        'Bottleneck identification with solutions',
        'Team morale indicators',
        'Actionable recommendations'
      ],
      bestFor: 'Team leaders monitoring project health and team dynamics',
      proTip: 'Check weekly to catch issues before they become critical'
    },
    {
      id: 'mentorship-matcher',
      name: 'AI Mentorship Matcher',
      icon: Users,
      category: 'community',
      color: 'from-green-500 to-teal-500',
      description: 'Find perfect mentors or mentees based on goals and interests',
      location: 'Mentorship Page',
      howToUse: [
        'Visit Mentorship page',
        'Choose "Find a Mentor" or "Become a Mentor"',
        'AI analyzes profiles and compatibility',
        'Review top 8 matches with detailed analysis',
        'Send mentorship request with auto-generated message'
      ],
      features: [
        '0-100% compatibility scoring',
        'Shared interests identification',
        'Complementary skills matching',
        'Success probability prediction',
        'Meeting frequency suggestions',
        'Focus areas and expected outcomes'
      ],
      bestFor: 'Developers seeking guidance or wanting to help others grow',
      proTip: 'Matches with 80%+ compatibility and high success probability work best'
    },
    {
      id: 'gamification-engine',
      name: 'AI Gamification Engine',
      icon: Trophy,
      category: 'community',
      color: 'from-yellow-500 to-orange-500',
      description: 'Get personalized challenges and compete on leaderboards',
      location: 'Dashboard → Challenges Section',
      howToUse: [
        'Check Dashboard daily',
        'View 6 personalized challenges',
        'Complete challenges to earn XP',
        'Click "Generate" for leaderboards',
        'See where you rank globally'
      ],
      features: [
        '6 daily personalized challenges',
        'XP rewards based on difficulty',
        'Dynamic leaderboards (XP, Streaks, Rising Stars)',
        'Challenge tips and guidance',
        'Bonus rewards for difficult challenges'
      ],
      bestFor: 'Developers who love gamification and friendly competition',
      proTip: 'Complete challenges early in the day to maintain your streak'
    },
    {
      id: 'onboarding-assistant',
      name: 'AI Onboarding Assistant',
      icon: Rocket,
      category: 'all',
      color: 'from-pink-500 to-rose-500',
      description: 'Get guided through the platform with smart tutorials',
      location: 'Dashboard (Auto-shows for new users)',
      howToUse: [
        'Shows automatically when you first login',
        'Follow 5 personalized onboarding steps',
        'Get role-specific guidance (developer vs employer)',
        'Complete steps to earn 100 XP bonus',
        'Skip anytime if you prefer exploring on your own'
      ],
      features: [
        '5-step personalized onboarding flow',
        'Role-based guidance',
        'Feature discovery prompts',
        'Time estimates for each step',
        'Direct links to relevant pages',
        '100 XP completion bonus'
      ],
      bestFor: 'New users getting started on the platform',
      proTip: 'Don\'t skip - completing onboarding unlocks key features faster'
    },
    {
      id: 'support-bot',
      name: 'AI Support Bot',
      icon: MessageSquare,
      category: 'all',
      color: 'from-blue-500 to-indigo-500',
      description: 'Get instant answers to your questions 24/7',
      location: 'Floating Chat Widget (Bottom-Right)',
      howToUse: [
        'Click the chat bubble in bottom-right corner',
        'Ask any question about the platform',
        'Get instant AI-powered answers',
        'Click quick questions for common queries',
        'Complex questions auto-escalate to human support'
      ],
      features: [
        'Instant answers to common questions',
        'Context from forum posts and resources',
        'Suggested resources with links',
        'Confidence scoring on answers',
        'Smart escalation to human support',
        'Earn 5 XP per question asked'
      ],
      bestFor: 'Anyone needing quick help navigating the platform',
      proTip: 'Try the quick questions first - they cover 80% of common needs'
    },
    {
      id: 'profile-assistant',
      name: 'AI Profile Assistant',
      icon: Sparkles,
      category: 'career',
      color: 'from-cyan-500 to-blue-500',
      description: 'Optimize your profile to attract more opportunities',
      location: 'Profile Page',
      howToUse: [
        'Visit your Profile',
        'AI automatically analyzes completeness',
        'Get profile optimization suggestions',
        'Apply AI-generated improvements',
        'See your profile score increase'
      ],
      features: [
        'Profile completeness score',
        'Bio improvement suggestions',
        'Keyword optimization for searchability',
        'Missing section identification',
        'Market alignment recommendations'
      ],
      bestFor: 'Developers wanting to increase profile visibility',
      proTip: 'Profiles with 90%+ completion get 10x more views'
    },
    {
      id: 'company-brand-builder',
      name: 'AI Company Brand Builder',
      icon: Building2,
      category: 'employer',
      color: 'from-indigo-500 to-violet-500',
      description: 'Craft compelling employer branding to attract top talent',
      location: 'Company Profile',
      howToUse: [
        'Go to Company Profile page',
        'Click "AI Brand Builder"',
        'AI generates company description, mission, values',
        'Get interview questions aligned with culture',
        'Apply branding with one click'
      ],
      features: [
        'Compelling company descriptions',
        'Mission and vision statements',
        'Core values with demonstrations',
        'Developer value propositions',
        'Values-aligned interview questions',
        'Job posting templates',
        'Brand positioning strategy'
      ],
      bestFor: 'Employers wanting to build strong employer brand',
      proTip: 'Apply all branding updates at once for consistent messaging'
    },
    {
      id: 'forum-trends',
      name: 'AI Forum Trends Analyzer',
      icon: TrendingUp,
      category: 'community',
      color: 'from-orange-500 to-red-500',
      description: 'Discover trending topics and engagement opportunities',
      location: 'Forum Page (Admin Only)',
      howToUse: [
        'Go to Forum page (admins only)',
        'Click "AI Trends" button',
        'AI analyzes all forum activity',
        'See trending topics and unanswered questions',
        'Create AI-suggested discussion prompts'
      ],
      features: [
        'Trending topic identification',
        'Unanswered question detection',
        'Expert contributor identification',
        'Category health analysis',
        'AI-generated discussion prompts',
        'Content gap analysis',
        'Community health score'
      ],
      bestFor: 'Community managers and moderators',
      proTip: 'Create discussion prompts weekly to maintain engagement'
    },
    {
      id: 'branding-assistant',
      name: 'AI Branding Assistant',
      icon: Award,
      category: 'employer',
      color: 'from-fuchsia-500 to-pink-500',
      description: 'Generate professional logos and brand elements',
      location: 'Company Profile',
      howToUse: [
        'Visit Company Profile',
        'Access AI Branding Assistant',
        'Generate logo concepts',
        'Get color palette suggestions',
        'Download and apply branding'
      ],
      features: [
        'AI logo generation',
        'Brand color palette suggestions',
        'Typography recommendations',
        'Brand style guide',
        'Asset variations'
      ],
      bestFor: 'Employers creating professional company presence',
      proTip: 'Generate 3-5 options before choosing your final brand'
    },
    {
      id: 'forum-moderator',
      name: 'AI Forum Moderator',
      icon: Shield,
      category: 'community',
      color: 'from-red-500 to-orange-500',
      description: 'Keep community safe with intelligent content moderation',
      location: 'Moderation Page',
      howToUse: [
        'AI automatically scans all forum posts',
        'Flags violations in real-time',
        'Review flagged content in Moderation page',
        'AI provides violation type and severity',
        'Take action with one click'
      ],
      features: [
        'Real-time content scanning',
        'Violation type detection',
        'Severity scoring (low to critical)',
        'Context-aware analysis',
        'Suggested moderation actions',
        'False positive prevention'
      ],
      bestFor: 'Moderators keeping the community safe',
      proTip: 'Review AI confidence scores - high confidence flags are usually accurate'
    },
    {
      id: 'proactive-matcher',
      name: 'Proactive Job Matcher',
      icon: Bell,
      category: 'jobs',
      color: 'from-lime-500 to-green-500',
      description: 'Get notified about perfect jobs before you even search',
      location: 'Runs Automatically in Background',
      howToUse: [
        'System runs automatically',
        'AI monitors new job postings',
        'Matches against your profile',
        'Sends notifications for high matches',
        'Check Dashboard for new matches'
      ],
      features: [
        'Automatic job monitoring',
        'Real-time match notifications',
        'Skill requirement analysis',
        'Priority alerts for best matches',
        'Market insight notifications'
      ],
      bestFor: 'Developers who want passive job discovery',
      proTip: 'Enable push notifications to never miss a perfect match'
    }
  ];

  const filteredAgents = aiAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">AI Features Guide</h1>
            <p className="text-gray-400">Master all 21 AI agents to supercharge your career</p>
          </div>
        </div>

        <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-5xl font-bold gradient-text mb-2">21</p>
                <p className="text-gray-400 text-sm">AI Agents Available</p>
              </div>
              <div>
                <p className="text-5xl font-bold gradient-text mb-2">24/7</p>
                <p className="text-gray-400 text-sm">Always Working For You</p>
              </div>
              <div>
                <p className="text-5xl font-bold gradient-text mb-2">100%</p>
                <p className="text-gray-400 text-sm">Free to Use</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AI agents..."
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className={selectedCategory === cat.id 
                ? 'btn-primary text-white' 
                : 'glass-card border-0 text-white hover:bg-white/5'}
              size="sm"
            >
              <cat.icon className="w-4 h-4 mr-2" />
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Start Guide */}
      <Card className="glass-card border-0 mb-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-green-400" />
            Quick Start: Your First 24 Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400 font-bold">1</span>
                </div>
                <h4 className="text-white font-semibold">Complete Onboarding</h4>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                Let AI Onboarding Assistant guide you through the platform
              </p>
              <p className="text-green-400 text-xs">+100 XP</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 font-bold">2</span>
                </div>
                <h4 className="text-white font-semibold">Use AI Profile Assistant</h4>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                Optimize your profile for maximum visibility
              </p>
              <p className="text-blue-400 text-xs">10x more views</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <h4 className="text-white font-semibold">Check AI Job Matcher</h4>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                See your top job matches and apply immediately
              </p>
              <p className="text-purple-400 text-xs">Find perfect jobs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Agents List */}
      <div className="space-y-6">
        {filteredAgents.map((agent, index) => {
          const Icon = agent.icon;
          
          return (
            <Card key={agent.id} className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${agent.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-2xl">{agent.name}</h3>
                      <Badge className={`bg-gradient-to-r ${agent.color} text-white border-0`}>
                        #{index + 1}
                      </Badge>
                    </div>
                    <p className="text-gray-400 mb-3">{agent.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                        📍 {agent.location}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs capitalize">
                        {agent.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="how-to" className="w-full">
                  <TabsList className="glass-card border-0 mb-4">
                    <TabsTrigger value="how-to">How to Use</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="tips">Best Practices</TabsTrigger>
                  </TabsList>

                  <TabsContent value="how-to">
                    <div className="space-y-2">
                      {agent.howToUse.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                          <div className="w-6 h-6 bg-indigo-500/20 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-400 text-sm font-bold">{i + 1}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="features">
                    <div className="space-y-2">
                      {agent.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="tips">
                    <div className="space-y-3">
                      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                        <p className="text-blue-400 font-semibold text-sm mb-2">👥 Best For:</p>
                        <p className="text-gray-300 text-sm">{agent.bestFor}</p>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                        <p className="text-green-400 font-semibold text-sm mb-2">💡 Pro Tip:</p>
                        <p className="text-gray-300 text-sm">{agent.proTip}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAgents.length === 0 && (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">No AI agents found</h3>
            <p className="text-gray-400">Try a different search term or category</p>
          </CardContent>
        </Card>
      )}

      {/* Usage Tips Section */}
      <Card className="glass-card border-0 mt-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">✅ Do's</h4>
              <ul className="space-y-2">
                {[
                  'Keep your profile up-to-date for accurate AI recommendations',
                  'Use multiple AI tools together for best results',
                  'Run analyses regularly to track your progress',
                  'Apply AI suggestions that align with your goals',
                  'Give feedback when AI recommendations help you'
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">❌ Don'ts</h4>
              <ul className="space-y-2">
                {[
                  'Don\'t ignore high-priority AI suggestions',
                  'Don\'t apply to jobs with <60% match scores',
                  'Don\'t skip profile optimization - it affects all AI tools',
                  'Don\'t rely solely on AI - use your judgment too',
                  'Don\'t forget to complete daily challenges for XP'
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 flex-shrink-0 mt-0.5">❌</div>
                    <span className="text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Workflows */}
      <Card className="glass-card border-0 mt-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-indigo-400" />
            Recommended AI Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Workflow 1 */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-white font-bold text-lg mb-4">🎯 For Developers Looking for Jobs</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 1: AI Profile Assistant</p>
                    <p className="text-gray-400 text-xs">Optimize your profile to attract employers (takes 10 mins)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 2: AI Skill Gap Analyzer</p>
                    <p className="text-gray-400 text-xs">Find out what skills to learn to unlock more opportunities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 3: AI Job Matcher</p>
                    <p className="text-gray-400 text-xs">Apply to top matches with 80%+ scores</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 4: Enable Proactive Job Matcher</p>
                    <p className="text-gray-400 text-xs">Get notified about new perfect matches automatically</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow 2 */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-white font-bold text-lg mb-4">🏢 For Employers Hiring Developers</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 1: AI Company Brand Builder</p>
                    <p className="text-gray-400 text-xs">Create compelling company branding to attract talent</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 2: Post Job with AI Description Assistant</p>
                    <p className="text-gray-400 text-xs">Optimize job posting for better candidate attraction</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 3: AI Talent Scout</p>
                    <p className="text-gray-400 text-xs">Let AI find top candidates for your job</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 4: AI Interview Assistant</p>
                    <p className="text-gray-400 text-xs">Use AI-generated interview questions aligned with your values</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow 3 */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-white font-bold text-lg mb-4">🚀 For Career Growth</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 1: AI Career Roadmap Generator</p>
                    <p className="text-gray-400 text-xs">Get a detailed 1-3 year career plan</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 2: AI Skill Gap Analyzer</p>
                    <p className="text-gray-400 text-xs">Identify critical skills to learn</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 3: AI Learning Path Generator</p>
                    <p className="text-gray-400 text-xs">Follow structured learning paths</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Step 4: AI Project Generator</p>
                    <p className="text-gray-400 text-xs">Build projects to practice new skills</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Questions */}
      <Card className="glass-card border-0 mt-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Common Questions About AI Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                q: 'Are AI features free to use?',
                a: 'Yes! All 21 AI agents are completely free for all users. No hidden fees or premium requirements.'
              },
              {
                q: 'How accurate are AI recommendations?',
                a: 'Our AI analyzes thousands of data points and has 85%+ accuracy. We continuously improve based on user feedback.'
              },
              {
                q: 'Can I use multiple AI agents at once?',
                a: 'Absolutely! In fact, using them together (like Career Roadmap + Skill Gap Analyzer + Project Generator) gives the best results.'
              },
              {
                q: 'How often should I use AI tools?',
                a: 'Use Profile Assistant weekly, Job Matcher daily, and Career tools monthly. Daily challenges appear automatically.'
              },
              {
                q: 'What if AI suggestions don\'t match my goals?',
                a: 'AI learns from your interactions. The more you use the platform, the better recommendations become. You can also skip suggestions that don\'t fit.'
              },
              {
                q: 'Do I need to complete my profile for AI to work?',
                a: 'AI works better with complete profiles. Aim for 80%+ completion for best results.'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2 text-sm">{faq.q}</h4>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Stories */}
      <Card className="glass-card border-0 mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            AI Success Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-4xl mb-2">🎯</p>
              <h4 className="text-white font-semibold mb-2">2x More Interviews</h4>
              <p className="text-gray-400 text-sm">
                "Using AI Profile Assistant and Job Matcher, I got 2x more interview invitations in my first week!"
              </p>
              <p className="text-purple-400 text-xs mt-2">- Sarah, UI Designer</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-4xl mb-2">⚡</p>
              <h4 className="text-white font-semibold mb-2">Hired in 3 Days</h4>
              <p className="text-gray-400 text-sm">
                "AI Talent Scout found me a perfect developer in 3 days. Usually takes weeks on other platforms."
              </p>
              <p className="text-blue-400 text-xs mt-2">- Mike, Studio Owner</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-4xl mb-2">📈</p>
              <h4 className="text-white font-semibold mb-2">Career Clarity</h4>
              <p className="text-gray-400 text-sm">
                "AI Career Roadmap gave me a clear 2-year plan. I now know exactly what to learn and when."
              </p>
              <p className="text-green-400 text-xs mt-2">- Alex, Scripter</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Get Started CTA */}
      <Card className="glass-card border-0 mt-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">
            Ready to Experience AI-Powered Career Growth?
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Start with AI Profile Assistant and Job Matcher today. Within 24 hours, you'll have 
            optimized profile and see your first personalized job matches.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => window.location.href = createPageUrl('Profile')}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start with Profile Assistant
            </Button>
            <Button
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              variant="outline"
              className="glass-card border-0 text-white hover:bg-white/5"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}