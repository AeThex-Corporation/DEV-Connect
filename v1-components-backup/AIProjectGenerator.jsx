import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Lightbulb,
  Sparkles,
  Code,
  Target,
  Clock,
  TrendingUp,
  BookOpen,
  Rocket,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function AIProjectGenerator({ user }) {
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);

  const generateProject = async () => {
    setLoading(true);
    try {
      // Get market data
      const [jobs, resources, portfolios] = await Promise.all([
        base44.entities.Job.filter({ status: 'Open' }, '-created_date', 50),
        base44.entities.LearningResource.list(),
        base44.entities.Portfolio.list()
      ]);

      const prompt = `You are an AI creative partner for Roblox developers. Generate a DETAILED, ACTIONABLE project idea that will help this developer build their portfolio and skills.

DEVELOPER PROFILE:
- Roles: ${user.developer_roles?.join(', ') || 'Not specified'}
- Skills: ${user.skills?.join(', ') || 'Not specified'}
- Experience: ${user.experience_level} (${user.years_of_experience || 0} years)
- Completed Projects: ${user.completed_projects || 0}
- Current XP: ${user.xp_points || 0}
- Career Goal: ${user.career_goal || 'Not specified'}

MARKET TRENDS (${jobs.length} open jobs):
${jobs.slice(0, 20).map(j => `- ${j.title}: ${j.required_skills?.join(', ')}`).join('\n')}

GENERATE A COMPREHENSIVE PROJECT IDEA THAT:
1. Aligns with their current skills and stretches them slightly
2. Is marketable and demonstrates skills employers want
3. Can be completed in a reasonable timeframe
4. Builds portfolio value
5. Teaches valuable new concepts

Include:
- Unique, creative game/project concept
- Clear technical requirements
- Step-by-step implementation plan
- Skill progression (what they'll learn)
- Marketing/launch strategy
- Monetization suggestions
- Timeline with milestones
- Resource recommendations
- Success metrics`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            concept: {
              type: "object",
              properties: {
                title: { type: "string" },
                tagline: { type: "string" },
                description: { type: "string" },
                genre: { type: "string" },
                unique_selling_points: {
                  type: "array",
                  items: { type: "string" }
                },
                target_audience: { type: "string" },
                inspiration: { type: "string" }
              }
            },
            technical_requirements: {
              type: "object",
              properties: {
                core_mechanics: {
                  type: "array",
                  items: { type: "string" }
                },
                required_skills: {
                  type: "array",
                  items: { type: "string" }
                },
                new_skills_learned: {
                  type: "array",
                  items: { type: "string" }
                },
                tools_needed: {
                  type: "array",
                  items: { type: "string" }
                },
                estimated_complexity: { type: "string" }
              }
            },
            implementation_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase_number: { type: "number" },
                  phase_name: { type: "string" },
                  duration_weeks: { type: "number" },
                  tasks: {
                    type: "array",
                    items: { type: "string" }
                  },
                  deliverables: {
                    type: "array",
                    items: { type: "string" }
                  },
                  skills_focus: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            monetization_strategy: {
              type: "object",
              properties: {
                primary_model: { type: "string" },
                revenue_streams: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      stream: { type: "string" },
                      description: { type: "string" },
                      estimated_potential: { type: "string" }
                    }
                  }
                },
                pricing_suggestions: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            marketing_launch: {
              type: "object",
              properties: {
                pre_launch_strategy: {
                  type: "array",
                  items: { type: "string" }
                },
                launch_checklist: {
                  type: "array",
                  items: { type: "string" }
                },
                post_launch_growth: {
                  type: "array",
                  items: { type: "string" }
                },
                community_building: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  why_helpful: { type: "string" }
                }
              }
            },
            success_metrics: {
              type: "object",
              properties: {
                week_1_goals: {
                  type: "array",
                  items: { type: "string" }
                },
                month_1_goals: {
                  type: "array",
                  items: { type: "string" }
                },
                month_3_goals: {
                  type: "array",
                  items: { type: "string" }
                },
                portfolio_impact: { type: "string" }
              }
            },
            ai_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setProject(response);

      // Award XP for generating project
      await base44.auth.updateMe({
        xp_points: (user.xp_points || 0) + 25
      });

    } catch (error) {
      console.error('Error generating project:', error);
      alert('Failed to generate project idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveToPortfolio = async () => {
    if (!project) return;

    try {
      await base44.entities.Portfolio.create({
        user_id: user.id,
        title: project.concept.title,
        description: `${project.concept.description}\n\n**Unique Features:**\n${project.concept.unique_selling_points?.join('\n')}`,
        category: 'Full Game',
        technologies: project.technical_requirements.required_skills || [],
        role: 'Creator',
        featured: false
      });

      alert('✅ Project idea saved to your portfolio!');
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white mb-2">🎨 AI is generating creative project ideas...</p>
          <p className="text-gray-400 text-sm">Analyzing market trends and your skills</p>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card className="glass-card border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Project Idea Generator
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Get a personalized, detailed project idea that will boost your portfolio, teach you valuable skills, and align with market demand
          </p>
          <Button
            onClick={generateProject}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-8 py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Project Idea
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Concept */}
      <Card className="glass-card border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              {project.concept.title}
            </CardTitle>
            <Button
              onClick={saveToPortfolio}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Save Idea
            </Button>
          </div>
          <p className="text-purple-400 italic">{project.concept.tagline}</p>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">{project.concept.description}</p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white font-semibold text-sm mb-2">🎮 Genre:</p>
              <Badge className="bg-purple-500/20 text-purple-400 border-0">
                {project.concept.genre}
              </Badge>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-2">👥 Target Audience:</p>
              <p className="text-gray-400 text-sm">{project.concept.target_audience}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-white font-semibold text-sm mb-2">✨ Unique Selling Points:</p>
            <div className="space-y-2">
              {project.concept.unique_selling_points?.map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {project.concept.inspiration && (
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <p className="text-blue-400 font-semibold text-sm mb-1">💡 Inspiration:</p>
              <p className="text-gray-300 text-sm">{project.concept.inspiration}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="technical" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="technical">
            <Code className="w-4 h-4 mr-2" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="plan">
            <Target className="w-4 h-4 mr-2" />
            Implementation
          </TabsTrigger>
          <TabsTrigger value="monetization">
            <TrendingUp className="w-4 h-4 mr-2" />
            Monetization
          </TabsTrigger>
          <TabsTrigger value="marketing">
            <Rocket className="w-4 h-4 mr-2" />
            Marketing
          </TabsTrigger>
          <TabsTrigger value="resources">
            <BookOpen className="w-4 h-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Technical Requirements */}
        <TabsContent value="technical">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Technical Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-white font-semibold mb-2">Core Mechanics:</p>
                <div className="space-y-2">
                  {project.technical_requirements.core_mechanics?.map((mechanic, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-300 text-sm">{mechanic}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-2">Skills You'll Use:</p>
                <div className="flex flex-wrap gap-2">
                  {project.technical_requirements.required_skills?.map((skill, i) => (
                    <Badge key={i} className="bg-blue-500/20 text-blue-400 border-0">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-2">New Skills You'll Learn:</p>
                <div className="flex flex-wrap gap-2">
                  {project.technical_requirements.new_skills_learned?.map((skill, i) => (
                    <Badge key={i} className="bg-green-500/20 text-green-400 border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-2">Tools Needed:</p>
                <div className="flex flex-wrap gap-2">
                  {project.technical_requirements.tools_needed?.map((tool, i) => (
                    <Badge key={i} className="bg-purple-500/20 text-purple-400 border-0">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
                <p className="text-indigo-400 font-semibold text-sm mb-1">Complexity Level:</p>
                <p className="text-white">{project.technical_requirements.estimated_complexity}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Implementation Plan */}
        <TabsContent value="plan">
          <div className="space-y-4">
            {project.implementation_plan?.map((phase, i) => (
              <Card key={i} className="glass-card border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      Phase {phase.phase_number}: {phase.phase_name}
                    </CardTitle>
                    <Badge className="bg-purple-500/20 text-purple-400 border-0">
                      <Clock className="w-3 h-3 mr-1" />
                      {phase.duration_weeks} weeks
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Tasks:</p>
                    <div className="space-y-2">
                      {phase.tasks?.map((task, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded border-2 border-gray-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{task}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Deliverables:</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.deliverables?.map((deliverable, j) => (
                        <Badge key={j} className="bg-green-500/20 text-green-400 border-0 text-xs">
                          {deliverable}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Skills Focus:</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.skills_focus?.map((skill, j) => (
                        <Badge key={j} className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Monetization Strategy */}
        <TabsContent value="monetization">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Monetization Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <p className="text-green-400 font-semibold mb-2">Primary Model:</p>
                <p className="text-white text-lg">{project.monetization_strategy.primary_model}</p>
              </div>

              <div>
                <p className="text-white font-semibold mb-3">Revenue Streams:</p>
                <div className="space-y-3">
                  {project.monetization_strategy.revenue_streams?.map((stream, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold">{stream.stream}</h4>
                        <Badge className="bg-green-500/20 text-green-400 border-0">
                          {stream.estimated_potential}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{stream.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-2">Pricing Suggestions:</p>
                <div className="space-y-2">
                  {project.monetization_strategy.pricing_suggestions?.map((suggestion, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing & Launch */}
        <TabsContent value="marketing">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Marketing & Launch Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-white font-semibold mb-2">Pre-Launch Strategy:</p>
                <div className="space-y-2">
                  {project.marketing_launch.pre_launch_strategy?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-2">Launch Checklist:</p>
                <div className="space-y-2">
                  {project.marketing_launch.launch_checklist?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded border-2 border-gray-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-2">Post-Launch Growth:</p>
                <div className="space-y-2">
                  {project.marketing_launch.post_launch_growth?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-2">Community Building:</p>
                <div className="space-y-2">
                  {project.marketing_launch.community_building?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources">
          <div className="space-y-4">
            {project.resources?.map((resource, i) => (
              <Card key={i} className="glass-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold">{resource.title}</h4>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{resource.description}</p>
                  <p className="text-blue-400 text-xs">💡 {resource.why_helpful}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Success Metrics */}
          <Card className="glass-card border-0 mt-4">
            <CardHeader>
              <CardTitle className="text-white">Success Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-white font-semibold mb-2">Week 1 Goals:</p>
                <div className="space-y-1">
                  {project.success_metrics.week_1_goals?.map((goal, i) => (
                    <p key={i} className="text-gray-300 text-sm">• {goal}</p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-2">Month 1 Goals:</p>
                <div className="space-y-1">
                  {project.success_metrics.month_1_goals?.map((goal, i) => (
                    <p key={i} className="text-gray-300 text-sm">• {goal}</p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-2">Month 3 Goals:</p>
                <div className="space-y-1">
                  {project.success_metrics.month_3_goals?.map((goal, i) => (
                    <p key={i} className="text-gray-300 text-sm">• {goal}</p>
                  ))}
                </div>
              </div>

              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <p className="text-green-400 font-semibold text-sm mb-1">Portfolio Impact:</p>
                <p className="text-white text-sm">{project.success_metrics.portfolio_impact}</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Tips */}
          {project.ai_tips?.length > 0 && (
            <Card className="glass-card border-0 bg-purple-500/5 mt-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.ai_tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={generateProject}
          className="flex-1 glass-card border-0 text-white hover:bg-white/5"
        >
          Generate Another Idea
        </Button>
        <Button
          onClick={saveToPortfolio}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
        >
          <FileText className="w-4 h-4 mr-2" />
          Save to Portfolio
        </Button>
      </div>
    </div>
  );
}