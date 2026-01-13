import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Users,
  Star,
  Award,
  TrendingUp,
  UserCheck,
  Send,
  RefreshCw,
  Target
} from "lucide-react";

export default function AIDeveloperMatcher({ companyProfile, jobs }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (companyProfile && jobs.length > 0) {
      analyzeAndMatch();
    }
  }, [companyProfile, jobs]);

  const analyzeAndMatch = async () => {
    setLoading(true);
    try {
      // Get all developers
      const allUsers = await base44.entities.User.list();
      const developers = allUsers.filter(u => u.developer_roles?.length > 0 && u.work_status === 'Open to Work');

      if (developers.length === 0) {
        setMatches([]);
        setInsights({
          total_analyzed: 0,
          top_skills_needed: [],
          market_insights: "Not enough developers to analyze"
        });
        setLoading(false);
        return;
      }

      // Get open jobs for context
      const openJobs = jobs.filter(j => j.status === 'Open');

      if (openJobs.length === 0) {
        setMatches([]);
        setInsights({
          total_analyzed: developers.length,
          top_skills_needed: [],
          market_insights: "Post jobs to get developer recommendations"
        });
        setLoading(false);
        return;
      }

      const prompt = `
You are an AI recruitment assistant for ${companyProfile.company_name}. Analyze developers and match them to open job positions.

COMPANY PROFILE:
- Name: ${companyProfile.company_name}
- Industry: ${companyProfile.industry}
- Size: ${companyProfile.company_size}
- Mission: ${companyProfile.mission || 'Not specified'}
- Tech Stack: ${companyProfile.tech_stack?.join(', ') || 'Not specified'}

OPEN JOB POSITIONS (${openJobs.length}):
${openJobs.map((job, i) => `
${i + 1}. ${job.title}
   - Required Roles: ${job.required_roles?.join(', ') || 'Any'}
   - Required Skills: ${job.required_skills?.join(', ') || 'Not specified'}
   - Experience Level: ${job.experience_level || 'Any'}
   - Budget: ${job.budget_range || 'Negotiable'}
   - Timeline: ${job.timeline || 'Flexible'}
   - Description: ${job.description?.substring(0, 200) || 'No description'}
`).join('\n')}

AVAILABLE DEVELOPERS (${developers.length}):
${developers.map((dev, i) => `
${i + 1}. ${dev.full_name || `Developer ${i + 1}`} (ID: ${dev.id})
   - Roles: ${dev.developer_roles?.join(', ') || 'Not specified'}
   - Skills: ${dev.skills?.join(', ') || 'Not specified'}
   - Experience: ${dev.experience_level || 'Not specified'} (${dev.years_of_experience || 0} years)
   - Completed Projects: ${dev.completed_projects || 0}
   - Rating: ${dev.rating || 0}/5
   - Bio: ${dev.bio?.substring(0, 150) || 'No bio'}
   - Work Status: ${dev.work_status}
   - Payment Preferences: ${dev.payment_preferences?.join(', ') || 'Not specified'}
`).join('\n')}

PROVIDE INTELLIGENT DEVELOPER MATCHING:

For each open job, find the TOP 5 best-matching developers based on:
1. Role alignment (highest weight - 40%)
2. Skills match (high weight - 30%)
3. Experience level compatibility (medium weight - 15%)
4. Past performance (rating, completed projects) (10%)
5. Availability and payment preferences (5%)

Also provide hiring insights and market analysis.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            hiring_insights: {
              type: "object",
              properties: {
                total_analyzed: { type: "number" },
                top_skills_needed: {
                  type: "array",
                  items: { type: "string" }
                },
                average_experience_available: { type: "string" },
                market_insights: { type: "string" },
                recommended_salary_ranges: {
                  type: "object",
                  additionalProperties: { type: "string" }
                }
              }
            },
            developer_matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  job_id: { type: "string" },
                  job_title: { type: "string" },
                  recommended_developers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        developer_id: { type: "string" },
                        match_score: { type: "number" },
                        match_percentage: { type: "number" },
                        why_perfect_fit: { type: "string" },
                        key_strengths: {
                          type: "array",
                          items: { type: "string" }
                        },
                        potential_concerns: {
                          type: "array",
                          items: { type: "string" }
                        },
                        role_alignment: { type: "number" },
                        skills_alignment: { type: "number" },
                        experience_fit: { type: "string" },
                        estimated_success_rate: { type: "number" },
                        interview_questions: {
                          type: "array",
                          items: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setInsights(response.hiring_insights || null);

      // Map developer IDs to actual developer objects
      const matchedDevelopers = [];
      for (const jobMatch of (response.developer_matches || [])) {
        for (const devMatch of jobMatch.recommended_developers) {
          const developer = developers.find(d => d.id === devMatch.developer_id);
          if (developer) {
            matchedDevelopers.push({
              ...devMatch,
              developer,
              job_id: jobMatch.job_id,
              job_title: jobMatch.job_title
            });
          }
        }
      }

      setMatches(matchedDevelopers);

    } catch (error) {
      console.error('Error matching developers:', error);
      setMatches([]);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (percentage >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (percentage >= 40) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">AI is analyzing {jobs.length} jobs and finding perfect matches...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
        </CardContent>
      </Card>
    );
  }

  if (!matches.length) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-8 text-center">
          <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Developer Matches Yet</h3>
          <p className="text-gray-400 mb-6">
            Post jobs to get AI-powered developer recommendations
          </p>
          <Link to={createPageUrl('PostJob')}>
            <Button className="btn-primary text-white">
              Post Your First Job
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hiring Insights */}
      {insights && (
        <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <div>
                <h2 className="text-white font-semibold text-xl">AI Hiring Insights</h2>
                <p className="text-gray-400 text-sm">Based on {insights.total_analyzed} developers analyzed</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs font-medium mb-2">Top Skills in Demand:</p>
                <div className="flex flex-wrap gap-1.5">
                  {insights.top_skills_needed?.map((skill, i) => (
                    <Badge key={i} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs font-medium mb-2">Market Insights:</p>
                <p className="text-gray-300 text-xs">{insights.market_insights}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Developer Matches */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>AI-Recommended Developers ({matches.length})</span>
            <Button size="sm" variant="outline" className="glass-card border-0 text-white hover:bg-white/5" onClick={analyzeAndMatch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Personalized recommendations for your open positions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches.map((match, i) => (
            <Card key={i} className="glass-card border-0 bg-white/5 card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-semibold text-lg">
                        {match.developer.full_name || 'Developer'}
                      </h3>
                      <Badge className={`${getMatchColor(match.match_percentage)} text-xs`}>
                        {match.match_percentage}% Match
                      </Badge>
                      {match.match_percentage >= 85 && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Top Match
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-1">For: {match.job_title}</p>
                    <p className="text-gray-500 text-xs mb-3">
                      {match.developer.experience_level} • {match.developer.completed_projects || 0} projects • {match.developer.rating?.toFixed(1) || 0}⭐
                    </p>
                  </div>
                </div>

                {/* Match Details */}
                <div className="grid md:grid-cols-3 gap-3 mb-4 text-xs">
                  <div className="glass-card rounded-lg p-3">
                    <p className="text-gray-400 mb-1">Role Match</p>
                    <Progress value={match.role_alignment} className="h-1.5 mb-1" />
                    <p className="text-white font-bold">{match.role_alignment}%</p>
                  </div>
                  <div className="glass-card rounded-lg p-3">
                    <p className="text-gray-400 mb-1">Skills Match</p>
                    <Progress value={match.skills_alignment} className="h-1.5 mb-1" />
                    <p className="text-white font-bold">{match.skills_alignment}%</p>
                  </div>
                  <div className="glass-card rounded-lg p-3">
                    <p className="text-gray-400 mb-1">Success Rate</p>
                    <Progress value={match.estimated_success_rate} className="h-1.5 mb-1" />
                    <p className="text-white font-bold">{match.estimated_success_rate}%</p>
                  </div>
                </div>

                {/* Why Perfect Fit */}
                <div className="glass-card rounded-lg p-3 bg-indigo-500/5 mb-3">
                  <p className="text-indigo-400 text-xs font-medium mb-1">Why This is a Perfect Fit:</p>
                  <p className="text-gray-300 text-xs">{match.why_perfect_fit}</p>
                </div>

                {/* Key Strengths */}
                <div className="mb-3">
                  <p className="text-gray-400 text-xs font-medium mb-2">Key Strengths:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.key_strengths?.map((strength, j) => (
                      <Badge key={j} className="bg-green-500/20 text-green-300 border-0 text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Potential Concerns */}
                {match.potential_concerns?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-gray-400 text-xs font-medium mb-2">Considerations:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {match.potential_concerns.map((concern, j) => (
                        <Badge key={j} className="bg-yellow-500/20 text-yellow-300 border-0 text-xs">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Link to={createPageUrl('PublicProfile') + `?id=${match.developer.id}`}>
                    <Button size="sm" className="btn-primary text-white">
                      <UserCheck className="w-4 h-4 mr-2" />
                      View Full Profile
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Messages')}>
                    <Button size="sm" variant="outline" className="glass-card border-0 text-white hover:bg-white/5">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}