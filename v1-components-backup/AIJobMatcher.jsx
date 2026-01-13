import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Briefcase, TrendingUp, X, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function AIJobMatcher({ user }) {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      matchJobs();
    }
  }, [user?.id]);

  const matchJobs = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Get open jobs
      const jobs = await base44.entities.Job.filter({ status: 'Open' }, '-created_date', 20);
      
      if (jobs.length === 0) {
        setMatchedJobs([]);
        setLoading(false);
        return;
      }

      // Prepare user profile summary
      const userProfile = {
        roles: user.developer_roles || [],
        skills: user.skills || [],
        experience_level: user.experience_level || 'Intermediate',
        years_of_experience: user.years_of_experience || 0,
        payment_preferences: user.payment_preferences || []
      };

      // Use AI to match jobs
      const prompt = `You are a job matching AI. Match the developer profile with the most suitable jobs.

Developer Profile:
- Roles: ${userProfile.roles.join(', ') || 'Not specified'}
- Skills: ${userProfile.skills.join(', ') || 'Not specified'}
- Experience Level: ${userProfile.experience_level}
- Years of Experience: ${userProfile.years_of_experience}
- Payment Preferences: ${userProfile.payment_preferences.join(', ') || 'Any'}

Available Jobs:
${jobs.map((job, i) => `
Job ${i + 1}:
- ID: ${job.id}
- Title: ${job.title}
- Required Roles: ${job.required_roles?.join(', ') || 'Any'}
- Required Skills: ${job.required_skills?.join(', ') || 'Any'}
- Experience Level: ${job.experience_level || 'Any'}
- Payment Type: ${job.payment_type}
- Budget: ${job.budget_range || 'Not specified'}
`).join('\n')}

Return the top 5 best matches with match scores and reasons.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false,
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
                  missing_skills: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      // Map AI matches to actual job objects
      const matches = (response.matches || []).map(match => {
        const job = jobs.find(j => j.id === match.job_id);
        return job ? { ...job, ...match } : null;
      }).filter(Boolean);

      setMatchedJobs(matches);
    } catch (err) {
      console.error('Error matching jobs:', err);
      setError(err.message || 'Failed to match jobs. Please try again later.');
      
      // Fallback: Show recent jobs without AI matching
      try {
        const fallbackJobs = await base44.entities.Job.filter({ status: 'Open' }, '-created_date', 5);
        setMatchedJobs(fallbackJobs.map(job => ({
          ...job,
          match_score: 70,
          match_reasons: ['Recent job posting']
        })));
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Finding your perfect matches...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card border-0 bg-yellow-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-yellow-400 text-sm mb-2">⚠️ AI matching temporarily unavailable</p>
              <p className="text-gray-400 text-xs">{error}</p>
            </div>
            <Button onClick={matchJobs} size="sm" variant="outline" className="text-white">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matchedJobs.length === 0) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-6 text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No matches found</p>
          <p className="text-gray-400 text-sm mb-4">
            Try updating your skills and experience to get better matches
          </p>
          <Button onClick={matchJobs} size="sm" className="btn-primary text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Refresh Matches
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Matched Jobs
          </CardTitle>
          <Button onClick={matchJobs} size="sm" variant="outline" className="text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {matchedJobs.map((job) => (
          <Link
            key={job.id}
            to={createPageUrl('Jobs') + `?id=${job.id}`}
            className="block glass-card rounded-lg p-4 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">{job.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{job.description}</p>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 ml-2">
                {job.match_score || 75}% Match
              </Badge>
            </div>

            {job.match_reasons && job.match_reasons.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Why this matches:</p>
                <div className="flex flex-wrap gap-1">
                  {job.match_reasons.slice(0, 3).map((reason, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-green-500/30 text-green-400">
                      ✓ {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                {job.payment_type}
              </Badge>
              {job.budget_range && (
                <Badge variant="outline" className="text-xs text-gray-400">
                  {job.budget_range}
                </Badge>
              )}
              {job.project_scope && (
                <Badge variant="outline" className="text-xs text-gray-400">
                  {job.project_scope}
                </Badge>
              )}
            </div>
          </Link>
        ))}

        <Link to={createPageUrl('Jobs')}>
          <Button className="w-full btn-primary text-white">
            View All Jobs
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}