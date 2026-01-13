import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, Briefcase, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function ProactiveJobMatcher({ user }) {
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id && !dismissed) {
      checkForNewMatches();
    }
  }, [user?.id]);

  const checkForNewMatches = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Get recent jobs posted in last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const recentJobs = await base44.entities.Job.filter({
        status: 'Open'
      }, '-created_date', 10);

      if (recentJobs.length === 0) {
        setSuggestedJobs([]);
        setLoading(false);
        return;
      }

      // Simple matching algorithm as fallback
      const matches = recentJobs.filter(job => {
        const roleMatch = job.required_roles?.some(role => 
          user.developer_roles?.includes(role)
        );
        const skillMatch = job.required_skills?.some(skill => 
          user.skills?.includes(skill)
        );
        return roleMatch || skillMatch;
      }).slice(0, 3);

      if (matches.length > 0) {
        // Try AI analysis for better matching
        try {
          const prompt = `Analyze these jobs for a developer with:
Roles: ${user.developer_roles?.join(', ') || 'Not specified'}
Skills: ${user.skills?.join(', ') || 'Not specified'}
Experience: ${user.experience_level || 'Intermediate'}

Jobs:
${matches.map((job, i) => `
${i + 1}. ${job.title}
   Roles needed: ${job.required_roles?.join(', ')}
   Skills needed: ${job.required_skills?.join(', ')}
`).join('\n')}

Rate each job match quality (1-100) and provide one key reason why it matches.`;

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
                      job_index: { type: "number" },
                      match_score: { type: "number" },
                      key_reason: { type: "string" }
                    }
                  }
                }
              }
            }
          });

          // Enhance matches with AI scores
          const enhancedMatches = matches.map((job, index) => {
            const aiMatch = response.matches?.find(m => m.job_index === index + 1);
            return {
              ...job,
              match_score: aiMatch?.match_score || 75,
              key_reason: aiMatch?.key_reason || 'Matches your skills'
            };
          });

          setSuggestedJobs(enhancedMatches);
        } catch (aiError) {
          console.error('AI analysis failed, using simple matches:', aiError);
          // Use simple matches without AI enhancement
          setSuggestedJobs(matches.map(job => ({
            ...job,
            match_score: 70,
            key_reason: 'Matches your profile'
          })));
        }
      } else {
        setSuggestedJobs([]);
      }
    } catch (err) {
      console.error('Error in proactive matching:', err);
      setError(err.message || 'Failed to check for matches');
      setSuggestedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 z-50 glass-card rounded-xl p-4 shadow-2xl max-w-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          <p className="text-white text-sm">Checking for new matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50 glass-card rounded-xl p-4 shadow-2xl max-w-sm bg-yellow-500/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-yellow-400 text-sm font-medium mb-1">⚠️ Matching unavailable</p>
            <p className="text-gray-400 text-xs">{error}</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (dismissed || suggestedJobs.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 glass-card rounded-xl p-4 shadow-2xl max-w-sm border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-semibold">New Matches Found!</h3>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-gray-400 text-sm mb-3">
        We found {suggestedJobs.length} new job{suggestedJobs.length > 1 ? 's' : ''} that match your profile
      </p>

      <div className="space-y-2 mb-3">
        {suggestedJobs.map((job) => (
          <Link
            key={job.id}
            to={createPageUrl('Jobs') + `?id=${job.id}`}
            className="block glass-card rounded-lg p-3 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-white font-medium text-sm line-clamp-1">{job.title}</h4>
              <Badge className="bg-green-500/20 text-green-400 border-0 text-xs ml-2">
                {job.match_score}%
              </Badge>
            </div>
            <p className="text-gray-400 text-xs mb-2">
              {job.key_reason}
            </p>
            <div className="flex gap-1 flex-wrap">
              {job.required_roles?.slice(0, 2).map((role, i) => (
                <Badge key={i} variant="outline" className="text-xs border-indigo-500/30 text-indigo-400">
                  {role}
                </Badge>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <Link to={createPageUrl('Jobs')}>
        <Button className="w-full btn-primary text-white text-sm">
          <Briefcase className="w-4 h-4 mr-2" />
          View All Matches
        </Button>
      </Link>
    </div>
  );
}