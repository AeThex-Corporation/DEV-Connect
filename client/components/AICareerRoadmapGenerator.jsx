import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Map,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';

export default function AICareerRoadmapGenerator({ user }) {
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [goalRole, setGoalRole] = useState('');
  const [timeframe, setTimeframe] = useState('1_year');

  const generateRoadmap = async () => {
    if (!goalRole) {
      alert('Please select a target role');
      return;
    }

    setLoading(true);
    try {
      const [jobs, portfolio, certifications, assessments, learningPaths] = await Promise.all([
        base44.entities.Job.filter({ status: 'Open' }, '-created_date', 200),
        base44.entities.Portfolio.filter({ user_id: user.id }),
        base44.entities.Certification.filter({ user_id: user.id }),
        base44.entities.SkillAssessment.filter({ user_id: user.id }),
        base44.entities.LearningPath.filter({ user_id: user.id })
      ]);

      const prompt = `You are an AI career development strategist for Roblox developers. Create a detailed, long-term career roadmap.

CURRENT PROFILE:
Name: ${user.full_name}
Current Roles: ${user.developer_roles?.join(', ') || 'None'}
Skills: ${user.skills?.join(', ') || 'None'}
Experience: ${user.experience_level} (${user.years_of_experience || 0} years)
XP Level: ${user.level || 1}
Projects: ${user.completed_projects || 0}
Portfolio: ${portfolio.length} pieces
Certifications: ${certifications.length}
Assessments Passed: ${assessments.filter(a => a.passed).length}

TARGET GOAL:
Role: ${goalRole}
Timeframe: ${timeframe.replace('_', ' ')}

MARKET DATA (${jobs.length} jobs analyzed):
Top Skills in Demand: ${Array.from(new Set(jobs.flatMap(j => j.required_skills || []))).slice(0, 30).join(', ')}
Top Roles Hiring: ${Array.from(new Set(jobs.flatMap(j => j.required_roles || []))).slice(0, 10).join(', ')}
Salary Ranges: ${jobs.map(j => j.budget_range).filter(Boolean).slice(0, 10).join(', ')}

CREATE COMPREHENSIVE CAREER ROADMAP with:
1. Quarter-by-quarter milestones
2. Specific skills to learn in sequence
3. Portfolio projects to build
4. Certifications to earn
5. Networking and experience goals
6. Expected role progressions
7. Salary growth projections
8. Market positioning improvements`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            roadmap_overview: {
              type: "object",
              properties: {
                current_role: { type: "string" },
                target_role: { type: "string" },
                estimated_duration: { type: "string" },
                difficulty: {
                  type: "string",
                  enum: ["achievable", "challenging", "ambitious", "requires_dedication"]
                },
                success_probability: { type: "number" },
                key_challenges: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            quarterly_milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  quarter: { type: "string" },
                  timeframe: { type: "string" },
                  focus_theme: { type: "string" },
                  goals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        goal: { type: "string" },
                        category: {
                          type: "string",
                          enum: ["skill", "project", "certification", "networking", "experience"]
                        },
                        priority: { type: "string" },
                        estimated_hours: { type: "number" }
                      }
                    }
                  },
                  success_metrics: {
                    type: "array",
                    items: { type: "string" }
                  },
                  expected_outcomes: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            skills_learning_sequence: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sequence_number: { type: "number" },
                  skill_name: { type: "string" },
                  why_now: { type: "string" },
                  learning_resources: {
                    type: "array",
                    items: { type: "string" }
                  },
                  practice_projects: {
                    type: "array",
                    items: { type: "string" }
                  },
                  estimated_weeks: { type: "number" },
                  mastery_indicators: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            portfolio_roadmap: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  project_name: { type: "string" },
                  description: { type: "string" },
                  skills_demonstrated: {
                    type: "array",
                    items: { type: "string" }
                  },
                  complexity: {
                    type: "string",
                    enum: ["simple", "moderate", "complex", "advanced"]
                  },
                  estimated_weeks: { type: "number" },
                  when_to_build: { type: "string" },
                  career_impact: { type: "string" }
                }
              }
            },
            certification_path: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  certification: { type: "string" },
                  level: { type: "string" },
                  when_to_earn: { type: "string" },
                  preparation_needed: { type: "string" },
                  career_value: { type: "string" }
                }
              }
            },
            career_progression: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timeline: { type: "string" },
                  role_title: { type: "string" },
                  responsibilities: {
                    type: "array",
                    items: { type: "string" }
                  },
                  required_skills: {
                    type: "array",
                    items: { type: "string" }
                  },
                  typical_salary_range: { type: "string" },
                  market_demand: {
                    type: "string",
                    enum: ["low", "moderate", "high", "very_high"]
                  }
                }
              }
            },
            salary_projections: {
              type: "object",
              properties: {
                current_range: { type: "string" },
                year_1_range: { type: "string" },
                year_2_range: { type: "string" },
                target_role_range: { type: "string" },
                growth_factors: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            networking_strategy: {
              type: "object",
              properties: {
                target_connections: { type: "number" },
                key_communities: {
                  type: "array",
                  items: { type: "string" }
                },
                events_to_attend: {
                  type: "array",
                  items: { type: "string" }
                },
                mentorship_plan: { type: "string" }
              }
            }
          }
        }
      });

      setRoadmap(response);

      // Save roadmap as learning path
      await base44.entities.LearningPath.create({
        user_id: user.id,
        path_name: `Career Roadmap: ${goalRole}`,
        target_role: goalRole,
        current_level: user.experience_level?.toLowerCase() || 'beginner',
        target_level: 'expert',
        estimated_duration_weeks: parseInt(timeframe.split('_')[0]) * 52,
        ai_recommendations: JSON.stringify(response)
      });

      // Award XP
      await base44.auth.updateMe({
        xp_points: (user.xp_points || 0) + 50
      });

    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('Failed to generate career roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white mb-2">🤖 AI is creating your career roadmap...</p>
          <p className="text-gray-400 text-sm">Analyzing market trends and career paths</p>
        </CardContent>
      </Card>
    );
  }

  if (!roadmap) {
    return (
      <Card className="glass-card border-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <CardContent className="p-12">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Map className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 text-center">
            AI Career Roadmap Generator
          </h2>
          <p className="text-gray-400 mb-6 text-center max-w-lg mx-auto">
            Get a personalized, long-term career development plan with milestones, learning paths, and salary projections
          </p>

          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="text-white text-sm font-semibold mb-2 block">Target Role</label>
              <Select value={goalRole} onValueChange={setGoalRole}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select target role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Senior Scripter">Senior Scripter</SelectItem>
                  <SelectItem value="Lead Game Designer">Lead Game Designer</SelectItem>
                  <SelectItem value="Technical Director">Technical Director</SelectItem>
                  <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                  <SelectItem value="UI/UX Lead">UI/UX Lead</SelectItem>
                  <SelectItem value="3D Art Director">3D Art Director</SelectItem>
                  <SelectItem value="Studio Owner">Studio Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm font-semibold mb-2 block">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6_months">6 Months</SelectItem>
                  <SelectItem value="1_year">1 Year</SelectItem>
                  <SelectItem value="2_years">2 Years</SelectItem>
                  <SelectItem value="3_years">3 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateRoadmap}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate My Roadmap
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-xl mb-1">
                {roadmap.roadmap_overview?.current_role} → {roadmap.roadmap_overview?.target_role}
              </h3>
              <p className="text-gray-400 text-sm">{roadmap.roadmap_overview?.estimated_duration}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-1">
                {roadmap.roadmap_overview?.success_probability}%
              </div>
              <p className="text-gray-400 text-xs">Success Rate</p>
            </div>
          </div>

          <Badge className={`${
            roadmap.roadmap_overview?.difficulty === 'achievable' ? 'bg-green-500/20 text-green-400' :
            roadmap.roadmap_overview?.difficulty === 'challenging' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-orange-500/20 text-orange-400'
          } border-0 mb-4`}>
            {roadmap.roadmap_overview?.difficulty}
          </Badge>

          {roadmap.roadmap_overview?.key_challenges?.length > 0 && (
            <div>
              <p className="text-white font-semibold text-sm mb-2">Key Challenges:</p>
              <div className="space-y-1">
                {roadmap.roadmap_overview.key_challenges.map((challenge, i) => (
                  <p key={i} className="text-gray-400 text-xs">• {challenge}</p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quarterly Milestones */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Quarterly Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {roadmap.quarterly_milestones?.map((quarter, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-bold text-lg">{quarter.quarter}</h4>
                  <p className="text-gray-400 text-sm">{quarter.timeframe}</p>
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-0">
                  {quarter.focus_theme}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                {quarter.goals?.map((goal, j) => (
                  <div key={j} className="flex items-start gap-2 bg-white/5 rounded p-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white text-sm">{goal.goal}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-0 text-xs capitalize">
                          {goal.category}
                        </Badge>
                        <span className="text-gray-500 text-xs">~{goal.estimated_hours}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-500/10 rounded p-3 border border-blue-500/20">
                <p className="text-blue-400 font-semibold text-xs mb-1">Expected Outcomes:</p>
                <div className="space-y-1">
                  {quarter.expected_outcomes?.map((outcome, j) => (
                    <p key={j} className="text-gray-300 text-xs">✓ {outcome}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills Sequence */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Skills Learning Sequence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {roadmap.skills_learning_sequence?.map((skill, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-400 font-bold">{skill.sequence_number}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{skill.skill_name}</h4>
                  <p className="text-gray-400 text-sm mb-2">{skill.why_now}</p>
                  <p className="text-purple-400 text-xs">⏱️ {skill.estimated_weeks} weeks</p>
                </div>
              </div>

              <div className="bg-green-500/10 rounded p-3 border border-green-500/20 mb-2">
                <p className="text-green-400 font-semibold text-xs mb-1">Mastery Indicators:</p>
                <div className="space-y-1">
                  {skill.mastery_indicators?.slice(0, 3).map((indicator, j) => (
                    <p key={j} className="text-gray-300 text-xs">✓ {indicator}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Career Progression */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Career Progression Path
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {roadmap.career_progression?.map((stage, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs mb-2">
                    {stage.timeline}
                  </Badge>
                  <h4 className="text-white font-bold text-lg">{stage.role_title}</h4>
                </div>
                <Badge className={`${
                  stage.market_demand === 'very_high' ? 'bg-green-500/20 text-green-400' :
                  stage.market_demand === 'high' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                } border-0`}>
                  {stage.market_demand} demand
                </Badge>
              </div>

              <div className="bg-green-500/10 rounded p-3 border border-green-500/20 mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <p className="text-green-400 font-semibold">{stage.typical_salary_range}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-xs mb-2">Responsibilities:</p>
                  <div className="space-y-1">
                    {stage.responsibilities?.slice(0, 3).map((resp, j) => (
                      <p key={j} className="text-gray-300 text-xs">• {resp}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {stage.required_skills?.slice(0, 5).map((skill, j) => (
                      <Badge key={j} className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Salary Projections */}
      <Card className="glass-card border-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Salary Growth Projection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded p-3">
              <p className="text-gray-400 text-xs mb-1">Current Range</p>
              <p className="text-white font-semibold">{roadmap.salary_projections?.current_range}</p>
            </div>
            <div className="bg-white/5 rounded p-3">
              <p className="text-gray-400 text-xs mb-1">Year 1</p>
              <p className="text-white font-semibold">{roadmap.salary_projections?.year_1_range}</p>
            </div>
            <div className="bg-white/5 rounded p-3">
              <p className="text-gray-400 text-xs mb-1">Year 2</p>
              <p className="text-white font-semibold">{roadmap.salary_projections?.year_2_range}</p>
            </div>
            <div className="bg-green-500/20 rounded p-3 border border-green-500/30">
              <p className="text-green-400 text-xs mb-1">Target Role</p>
              <p className="text-white font-semibold">{roadmap.salary_projections?.target_role_range}</p>
            </div>
          </div>

          <div>
            <p className="text-white font-semibold text-sm mb-2">Growth Factors:</p>
            <div className="space-y-1">
              {roadmap.salary_projections?.growth_factors?.map((factor, i) => (
                <div key={i} className="flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-xs">{factor}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <Button
          onClick={() => window.location.href = createPageUrl('LearningHub')}
          className="btn-primary text-white"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Start Learning
        </Button>
        <Button
          onClick={() => {
            setRoadmap(null);
            setGoalRole('');
          }}
          variant="outline"
          className="glass-card border-0 text-white hover:bg-white/5"
        >
          Generate New Roadmap
        </Button>
      </div>
    </div>
  );
}