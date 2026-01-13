import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Briefcase,
  TrendingUp,
  Target,
  Star,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw
} from "lucide-react";

export default function AIJobRecommendations({ user, onJobSelect }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [matchScores, setMatchScores] = useState({});

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Fetch all active jobs
      const allJobs = await base44.entities.Job.filter({ status: 'Open' }, '-created_date', 50);

      // Get user's applications to exclude already applied jobs
      const userApplications = await base44.entities.Application.filter({
        applicant_id: user.id
      });
      const appliedJobIds = userApplications.map(app => app.job_id);

      // Filter out jobs user has already applied to
      const availableJobs = allJobs.filter(job => !appliedJobIds.includes(job.id));

      if (availableJobs.length === 0) {
        setRecommendations([]);
        return;
      }

      // Use AI to score and rank jobs
      const prompt = `You are an AI job matching system. Analyze the following developer profile and rank the job opportunities based on match quality.

Developer Profile:
- Roles: ${user.developer_roles?.join(', ') || 'Not specified'}
- Skills: ${user.skills?.join(', ') || 'Not specified'}
- Experience Level: ${user.experience_level || 'Not specified'}
- Years of Experience: ${user.years_of_experience || 0}
- Payment Preferences: ${user.payment_preferences?.join(', ') || 'Not specified'}
- Location: ${user.location || 'Not specified'}
- Work Status: ${user.work_status || 'Open to Work'}

Available Jobs:
${availableJobs.slice(0, 20).map((job, i) => `
Job ${i + 1}:
- ID: ${job.id}
- Title: ${job.title}
- Required Roles: ${job.required_roles?.join(', ') || 'Not specified'}
- Required Skills: ${job.required_skills?.join(', ') || 'Not specified'}
- Experience Level: ${job.experience_level || 'Not specified'}
- Payment Type: ${job.payment_type}
- Budget: ${job.budget_range || 'Not specified'}
- Remote Type: ${job.remote_type || 'Remote'}
- Timeline: ${job.timeline || 'Not specified'}
`).join('\n')}

For each job, calculate a match score (0-100) based on:
1. Role alignment (40%): How well developer's roles match required roles
2. Skill match (30%): Overlap between developer's skills and required skills
3. Experience fit (15%): Whether experience level matches
4. Payment compatibility (10%): Payment preferences alignment
5. Other factors (5%): Timeline, remote preference, etc.

Return ONLY a JSON array with match scores for each job, ordered by score (highest first). Include only jobs with score >= 50.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  job_id: { type: "string" },
                  match_score: { type: "number" },
                  match_reasons: {
                    type: "array",
                    items: { type: "string" }
                  },
                  why_great_fit: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response.matches && response.matches.length > 0) {
        // Map match scores
        const scores = {};
        response.matches.forEach(match => {
          scores[match.job_id] = {
            score: match.match_score,
            reasons: match.match_reasons || [],
            why_great_fit: match.why_great_fit || ''
          };
        });
        setMatchScores(scores);

        // Get top 10 recommended jobs
        const recommendedJobIds = response.matches.slice(0, 10).map(m => m.job_id);
        const recommendedJobs = availableJobs.filter(job => recommendedJobIds.includes(job.id));
        setRecommendations(recommendedJobs);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 85) return 'from-green-500 to-emerald-500';
    if (score >= 70) return 'from-blue-500 to-indigo-500';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <Card className="glass-card border-0 mb-6">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Analyzing jobs for you...</p>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="glass-card border-0 mb-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        <CardContent className="p-6 text-center">
          <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-gray-400 text-sm mb-4">
            Complete your profile to get AI-powered job recommendations
          </p>
          <Button
            onClick={generateRecommendations}
            size="sm"
            className="btn-primary text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI-Recommended Jobs for You
          </CardTitle>
          <Button
            onClick={generateRecommendations}
            size="sm"
            variant="outline"
            className="glass-card border-0 text-white hover:bg-white/5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map(job => {
            const match = matchScores[job.id] || { score: 0, reasons: [], why_great_fit: '' };
            
            return (
              <div
                key={job.id}
                className="glass-card rounded-lg p-5 hover:bg-white/5 transition-all cursor-pointer border-l-4"
                style={{ borderLeftColor: match.score >= 85 ? '#10b981' : match.score >= 70 ? '#3b82f6' : '#f59e0b' }}
                onClick={() => onJobSelect && onJobSelect(job)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-semibold text-lg">{job.title}</h3>
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getMatchColor(match.score)} flex items-center gap-1`}>
                        <Star className="w-3 h-3 text-white" />
                        <span className="text-white text-xs font-bold">{match.score}% Match</span>
                      </div>
                    </div>
                    
                    {match.why_great_fit && (
                      <div className="glass-card rounded-lg p-3 bg-purple-500/5 mb-3">
                        <p className="text-purple-300 text-sm">
                          <strong>Why it's a great fit:</strong> {match.why_great_fit}
                        </p>
                      </div>
                    )}

                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.required_roles?.slice(0, 3).map(role => (
                        <Badge key={role} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                          {role}
                        </Badge>
                      ))}
                      {job.payment_type && (
                        <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {job.payment_type}
                        </Badge>
                      )}
                      {job.remote_type && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.remote_type}
                        </Badge>
                      )}
                      {job.timeline && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-0 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {job.timeline}
                        </Badge>
                      )}
                    </div>

                    {match.reasons && match.reasons.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Match Reasons:</p>
                        <ul className="text-gray-400 text-xs space-y-1">
                          {match.reasons.slice(0, 3).map((reason, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <TrendingUp className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = createPageUrl('Jobs') + `?job=${job.id}`;
                  }}
                  size="sm"
                  className="w-full btn-primary text-white"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  View & Apply
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}