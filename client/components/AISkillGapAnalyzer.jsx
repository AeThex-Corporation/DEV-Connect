
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  TrendingUp,
  BookOpen,
  Zap,
  Award,
  AlertCircle,
  CheckCircle,
  Briefcase
} from 'lucide-react';

export default function AISkillGapAnalyzer({ user }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeSkillGaps = async () => {
    setLoading(true);
    try {
      const [allJobs, certifications, portfolio, assessments] = await Promise.all([
        base44.entities.Job.filter({ status: 'Open' }, '-created_date', 100),
        base44.entities.Certification.filter({ user_id: user.id, status: 'active' }),
        base44.entities.Portfolio.filter({ user_id: user.id }),
        base44.entities.SkillAssessment.filter({ user_id: user.id, passed: true })
      ]);

      const prompt = `You are an AI career advisor specializing in Roblox development. Analyze this developer's profile against market trends and identify skill gaps.

DEVELOPER PROFILE:
Name: ${user.full_name}
Roles: ${user.developer_roles?.join(', ') || 'Not specified'}
Current Skills: ${user.skills?.join(', ') || 'Not specified'}
Experience: ${user.experience_level} (${user.years_of_experience || 0} years)
Completed Projects: ${user.completed_projects || 0}
XP Points: ${user.xp_points || 0}

CERTIFICATIONS (${certifications.length}):
${certifications.map(c => `- ${c.skill_name} (${c.certification_level}) - Score: ${c.score}/100`).join('\n')}

SKILL ASSESSMENTS (${assessments.length}):
${assessments.map(a => `- ${a.skill_name}: ${a.score}/100 (${a.percentile}th percentile)`).join('\n')}

PORTFOLIO (${portfolio.length} projects):
${portfolio.map(p => `- ${p.title} (${p.category}): ${p.technologies?.join(', ')}`).join('\n')}

CURRENT JOB MARKET (${allJobs.length} open positions):
Top Required Roles:
${Array.from(new Set(allJobs.flatMap(j => j.required_roles || []))).slice(0, 20).join(', ')}

Top Required Skills:
${Array.from(new Set(allJobs.flatMap(j => j.required_skills || []))).slice(0, 30).join(', ')}

Experience Levels in Demand:
${allJobs.map(j => j.experience_level).filter(Boolean).join(', ')}

PROVIDE COMPREHENSIVE SKILL GAP ANALYSIS with actionable recommendations.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            career_score: {
              type: "number",
              minimum: 0,
              maximum: 100
            },
            market_position: {
              type: "object",
              properties: {
                competitiveness: {
                  type: "string",
                  enum: ["highly_competitive", "competitive", "developing", "entry_level"]
                },
                job_match_percentage: { type: "number" },
                accessible_jobs: { type: "number" },
                total_market_jobs: { type: "number" },
                position_summary: { type: "string" }
              }
            },
            critical_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill_name: { type: "string" },
                  current_level: { type: "string" },
                  required_level: { type: "string" },
                  market_demand: { type: "number" },
                  job_opportunities_locked: { type: "number" },
                  salary_impact: { type: "string" },
                  priority: { type: "string" },
                  why_important: { type: "string" }
                }
              }
            },
            trending_skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill_name: { type: "string" },
                  growth_rate: { type: "string" },
                  current_demand: { type: "number" },
                  projected_demand: { type: "string" },
                  early_adopter_advantage: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            },
            learning_paths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path_name: { type: "string" },
                  target_outcome: { type: "string" },
                  estimated_weeks: { type: "number" },
                  difficulty: { type: "string" },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        step_number: { type: "number" },
                        title: { type: "string" },
                        description: { type: "string" },
                        estimated_hours: { type: "number" }
                      }
                    }
                  },
                  skills_gained: {
                    type: "array",
                    items: { type: "string" }
                  },
                  job_opportunities_unlocked: { type: "number" }
                }
              }
            },
            project_ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  project_name: { type: "string" },
                  description: { type: "string" },
                  skills_practiced: {
                    type: "array",
                    items: { type: "string" }
                  },
                  estimated_weeks: { type: "number" },
                  difficulty: { type: "string" },
                  portfolio_value: { type: "string" },
                  market_relevance: { type: "number" }
                }
              }
            },
            certification_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill_name: { type: "string" },
                  certification_level: { type: "string" },
                  readiness: { type: "string" },
                  preparation_needed: { type: "string" },
                  career_impact: { type: "string" }
                }
              }
            },
            competitive_advantages: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnalysis(response);

      // Award XP for using career analysis
      await base44.auth.updateMe({
        xp_points: (user.xp_points || 0) + 20
      });

    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
      alert('Failed to analyze skill gaps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'bg-red-500/20 text-red-400',
      'high': 'bg-orange-500/20 text-orange-400',
      'medium': 'bg-yellow-500/20 text-yellow-400',
      'low': 'bg-blue-500/20 text-blue-400'
    };
    return colors[priority] || colors['medium'];
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white mb-2">🤖 AI is analyzing market trends...</p>
          <p className="text-gray-400 text-sm">Comparing your skills against job requirements</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="glass-card border-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Skill Gap Analyzer
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Discover what skills you need to learn to unlock more job opportunities and advance your career
          </p>
          <Button
            onClick={analyzeSkillGaps}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-lg px-8 py-6"
          >
            <Target className="w-5 h-5 mr-2" />
            Analyze My Skills
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Career Score */}
      <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-xl mb-1">Career Competitiveness</h3>
              <p className="text-gray-400 text-sm capitalize">{analysis.market_position?.competitiveness?.replace(/_/g, ' ')}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400 mb-1">
                {analysis.career_score}
              </div>
              <p className="text-gray-400 text-xs">out of 100</p>
            </div>
          </div>

          <Progress value={analysis.career_score} className="h-3 mb-4" />

          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Briefcase className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-white font-semibold">{analysis.market_position?.accessible_jobs}</p>
              <p className="text-gray-400 text-xs">Jobs You Can Apply</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Target className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-white font-semibold">{analysis.market_position?.job_match_percentage}%</p>
              <p className="text-gray-400 text-xs">Match Rate</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-semibold">{analysis.market_position?.total_market_jobs}</p>
              <p className="text-gray-400 text-xs">Total Market</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Skill Gaps */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            Critical Skill Gaps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.critical_gaps?.slice(0, 5).map((gap, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-semibold">{gap.skill_name}</h4>
                    <Badge className={`${getPriorityColor(gap.priority)} border-0 text-xs`}>
                      {gap.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{gap.why_important}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Current Level</p>
                  <Badge className="bg-red-500/20 text-red-400 border-0 capitalize">
                    {gap.current_level}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Required Level</p>
                  <Badge className="bg-green-500/20 text-green-400 border-0 capitalize">
                    {gap.required_level}
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-2 text-xs">
                <div className="bg-white/5 rounded p-2">
                  <p className="text-gray-400 mb-1">Market Demand</p>
                  <Progress value={gap.market_demand} className="h-1" />
                  <p className="text-white font-semibold mt-1">{gap.market_demand}%</p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-gray-400 mb-1">Jobs Locked</p>
                  <p className="text-white font-semibold">{gap.job_opportunities_locked}</p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-gray-400 mb-1">Salary Impact</p>
                  <p className="text-green-400 font-semibold">{gap.salary_impact}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trending Skills - Simplified */}
      {analysis.trending_skills?.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Trending Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.trending_skills.slice(0, 10).map((skill, i) => (
                <Badge key={i} className="bg-green-500/20 text-green-400 border-0">
                  {skill.skill_name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitive Advantages */}
      {analysis.competitive_advantages?.length > 0 && (
        <Card className="glass-card border-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Your Competitive Advantages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.competitive_advantages.map((advantage, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">{advantage}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <Button
          onClick={() => window.location.href = createPageUrl('Resources')}
          className="btn-primary text-white"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Browse Learning Resources
        </Button>
        <Button
          onClick={analyzeSkillGaps}
          variant="outline"
          className="glass-card border-0 text-white hover:bg-white/5"
        >
          <Target className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
}
