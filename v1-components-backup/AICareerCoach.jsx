
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Sparkles,
  Target,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Rocket,
  Award,
  PlayCircle,
  Briefcase
} from "lucide-react";

export default function AICareerCoach({ user }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [learningPaths, setLearningPaths] = useState([]);
  const [portfolioProjects, setPortfolioProjects] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [profileOptimization, setProfileOptimization] = useState(null);

  useEffect(() => {
    if (user) {
      analyzeCareer();
    }
  }, [user]);

  const analyzeCareer = async () => {
    setLoading(true);
    try {
      const [trendingJobs, allJobs] = await Promise.all([
        base44.entities.Job.filter({ status: "Open" }, "-created_date", 20),
        base44.entities.Job.list()
      ]);
      
      const prompt = `
You are an AI career coach for Roblox developers. Provide comprehensive, actionable career guidance.

DEVELOPER PROFILE:
- Roles: ${user.developer_roles?.join(', ') || 'Not specified'}
- Skills: ${user.skills?.join(', ') || 'Not specified'}
- Experience Level: ${user.experience_level || 'Not specified'}
- Years of Experience: ${user.years_of_experience || 0}
- Completed Projects: ${user.completed_projects || 0}
- Rating: ${user.rating || 0}/5
- Current Level: ${user.level || 1}
- XP: ${user.xp_points || 0}

MARKET ANALYSIS (Top 10 Recent Jobs):
${trendingJobs.slice(0, 10).map(job => `
- ${job.title}
  Required Roles: ${job.required_roles?.join(', ')}
  Required Skills: ${job.required_skills?.join(', ')}
  Experience: ${job.experience_level}
  Payment: ${job.budget_range}
`).join('\n')}

PROVIDE DETAILED CAREER GUIDANCE:

1. SKILL GAP ANALYSIS:
   - Identify missing high-demand skills
   - Prioritize gaps (critical, important, nice-to-have)
   - Explain WHY each skill matters
   - Include market demand percentage

2. PERSONALIZED LEARNING PATHS:
   For each skill gap, create a structured learning path with:
   - Step-by-step progression (Beginner → Intermediate → Advanced)
   - Specific Roblox official documentation links
   - Estimated time to proficiency
   - Practice exercises

3. PORTFOLIO PROJECT SUGGESTIONS:
   Suggest 5 specific portfolio projects that will address skill gaps and impress employers.
   
4. PROFILE OPTIMIZATION:
   - Current completeness score (0-100)
   - Missing sections
   - Bio enhancements
   - Portfolio tips

Return structured JSON with actionable data.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            skill_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" },
                  market_demand: { type: "string" },
                  current_jobs_requiring: { type: "number" }
                }
              }
            },
            learning_paths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  difficulty: { type: "string" },
                  total_hours: { type: "number" },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        phase: { type: "string" },
                        resources: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              title: { type: "string" },
                              url: { type: "string" },
                              type: { type: "string" },
                              duration: { type: "string" }
                            }
                          }
                        },
                        practice_exercises: {
                          type: "array",
                          items: { type: "string" }
                        },
                        estimated_hours: { type: "number" }
                      }
                    }
                  }
                }
              }
            },
            portfolio_projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  skills_demonstrated: {
                    type: "array",
                    items: { type: "string" }
                  },
                  difficulty: { type: "string" },
                  estimated_weeks: { type: "number" },
                  key_features: {
                    type: "array",
                    items: { type: "string" }
                  },
                  why_impressive: { type: "string" },
                  target_job_types: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            profile_optimization: {
              type: "object",
              properties: {
                completeness_score: { type: "number" },
                missing_sections: {
                  type: "array",
                  items: { type: "string" }
                },
                bio_suggestions: {
                  type: "array",
                  items: { type: "string" }
                },
                portfolio_tips: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSkillGaps(response.skill_gaps || []);
      setLearningPaths(response.learning_paths || []);
      setPortfolioProjects(response.portfolio_projects || []);
      setProfileOptimization(response.profile_optimization);
      setAnalysis(response);

      // Create notification
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '💡 Career Advice Ready!',
        message: 'Your personalized career roadmap is ready to view.',
        link: createPageUrl('Profile')
      });

    } catch (error) {
      console.error('Error analyzing career:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'bg-red-500/20 text-red-400 border-red-500/30',
      'important': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'nice-to-have': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[priority?.toLowerCase()] || colors['nice-to-have'];
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'beginner': 'bg-green-500/20 text-green-400',
      'intermediate': 'bg-yellow-500/20 text-yellow-400',
      'advanced': 'bg-red-500/20 text-red-400'
    };
    return colors[difficulty?.toLowerCase()] || colors['beginner'];
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Analyzing your career path with AI...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-8 text-center">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">AI Career Coach</h3>
          <p className="text-gray-400 mb-6">
            Get personalized career guidance powered by AI
          </p>
          <Button onClick={analyzeCareer} className="btn-primary text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze My Career
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-white font-semibold text-xl">Your AI Career Coach</h2>
              <p className="text-gray-400 text-sm">Personalized insights to advance your Roblox career</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="learning" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="learning">
            <BookOpen className="w-4 h-4 mr-2" />
            Learning Paths ({learningPaths.length})
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Rocket className="w-4 h-4 mr-2" />
            Portfolio Projects ({portfolioProjects.length})
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Target className="w-4 h-4 mr-2" />
            Skill Gaps ({skillGaps.length})
          </TabsTrigger>
          <TabsTrigger value="profile">
            <TrendingUp className="w-4 h-4 mr-2" />
            Profile Tips
          </TabsTrigger>
        </TabsList>

        {/* Learning Paths */}
        <TabsContent value="learning" className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Personalized Learning Paths</CardTitle>
              <p className="text-gray-400 text-sm">
                Step-by-step roadmaps to master in-demand skills
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {learningPaths.map((path, i) => (
                <Card key={i} className="glass-card border-0 bg-white/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-2">{path.skill}</h3>
                        <div className="flex gap-2">
                          <Badge className={`${getDifficultyColor(path.difficulty)} border-0 text-xs`}>
                            {path.difficulty}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                            ~{path.total_hours}h total
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Learning Steps */}
                    <div className="space-y-4">
                      {path.steps?.map((step, j) => (
                        <div key={j} className="glass-card rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center">
                              <span className="text-indigo-400 text-xs font-bold">{j + 1}</span>
                            </div>
                            <h4 className="text-white font-medium">{step.phase}</h4>
                            <Badge className="bg-white/5 text-gray-400 border-0 text-xs ml-auto">
                              {step.estimated_hours}h
                            </Badge>
                          </div>

                          {/* Resources */}
                          <div className="space-y-2 mb-3">
                            <p className="text-gray-400 text-xs font-medium">Resources:</p>
                            {step.resources?.map((resource, k) => (
                              <a
                                key={k}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all group"
                              >
                                <PlayCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm group-hover:text-indigo-400 transition-colors">
                                    {resource.title}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {resource.type} • {resource.duration}
                                  </p>
                                </div>
                                <ExternalLink className="w-3 h-3 text-gray-500 flex-shrink-0" />
                              </a>
                            ))}
                          </div>

                          {/* Practice Exercises */}
                          {step.practice_exercises?.length > 0 && (
                            <div>
                              <p className="text-gray-400 text-xs font-medium mb-2">Practice:</p>
                              <div className="space-y-1">
                                {step.practice_exercises.map((exercise, k) => (
                                  <div key={k} className="flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-300 text-xs">{exercise}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Projects */}
        <TabsContent value="projects" className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Portfolio Project Recommendations</CardTitle>
              <p className="text-gray-400 text-sm">
                Build these projects to impress employers and fill skill gaps
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {portfolioProjects.map((project, i) => (
                <Card key={i} className="glass-card border-0 bg-white/5 card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Rocket className="w-5 h-5 text-purple-400" />
                          <h3 className="text-white font-semibold text-lg">{project.name}</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                      </div>
                      <Badge className={`${getDifficultyColor(project.difficulty)} border-0 text-xs flex-shrink-0`}>
                        {project.difficulty}
                      </Badge>
                    </div>

                    {/* Skills Demonstrated */}
                    <div className="mb-3">
                      <p className="text-gray-400 text-xs font-medium mb-2">Skills You'll Demonstrate:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.skills_demonstrated?.map((skill, j) => (
                          <Badge key={j} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="mb-3">
                      <p className="text-gray-400 text-xs font-medium mb-2">Key Features to Implement:</p>
                      <div className="space-y-1">
                        {project.key_features?.map((feature, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-300 text-xs">{feature}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Why Impressive */}
                    <div className="glass-card rounded-lg p-3 bg-green-500/5 mb-3">
                      <div className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-green-400 text-xs font-medium mb-1">Why This Will Impress Employers:</p>
                          <p className="text-gray-300 text-xs">{project.why_impressive}</p>
                        </div>
                      </div>
                    </div>

                    {/* Target Jobs */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {project.target_job_types?.slice(0, 3).map((job, j) => (
                          <Badge key={j} className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                            {job}
                          </Badge>
                        ))}
                      </div>
                      <Badge className="bg-white/5 text-gray-400 border-0 text-xs">
                        {project.estimated_weeks} week{project.estimated_weeks !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skill Gaps */}
        <TabsContent value="skills" className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Skills to Develop</CardTitle>
              <p className="text-gray-400 text-sm">
                Based on trending Roblox job postings and market demand
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {skillGaps.map((gap, i) => (
                <Card key={i} className="glass-card border-0 bg-white/5">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{gap.skill}</h3>
                        <p className="text-gray-400 text-sm mb-2">{gap.reason}</p>
                      </div>
                      <Badge className={`${getPriorityColor(gap.priority)} text-xs flex-shrink-0`}>
                        {gap.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center text-yellow-400">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {gap.market_demand} demand
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {gap.current_jobs_requiring || 0} jobs require this
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Optimization */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Profile Optimization</CardTitle>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={profileOptimization?.completeness_score || 0} 
                    className="w-24 h-2"
                  />
                  <Badge className="bg-purple-500/20 text-purple-400 border-0">
                    {profileOptimization?.completeness_score || 0}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Missing Sections */}
              {profileOptimization?.missing_sections?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-white font-semibold">Missing Sections</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileOptimization.missing_sections.map((section, i) => (
                      <Badge key={i} className="bg-yellow-500/20 text-yellow-400 border-0">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio Suggestions */}
              {profileOptimization?.bio_suggestions?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Bio Improvement Tips</h3>
                  <div className="space-y-2">
                    {profileOptimization.bio_suggestions.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-300 text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Tips */}
              {profileOptimization?.portfolio_tips?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Portfolio Enhancements</h3>
                  <div className="space-y-2">
                    {profileOptimization.portfolio_tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-300 text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <Card className="glass-card border-0">
        <CardContent className="p-4 text-center">
          <Button onClick={analyzeCareer} variant="outline" className="glass-card border-0 text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Refresh Career Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
