import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Target,
  Users,
  Sparkles,
  TrendingUp,
  Star,
  Award,
  MessageSquare,
  Send,
  CheckCircle,
  Zap,
  Brain
} from 'lucide-react';

export default function AITalentScout({ job, onClose }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [selectedDev, setSelectedDev] = useState(null);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const findTalent = async () => {
    setLoading(true);
    try {
      // Get all developers and their portfolios
      const [developers, portfolios, certifications, reviews] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Portfolio.list(),
        base44.entities.Certification.list(),
        base44.entities.Review.list()
      ]);

      const devs = developers.filter(d => 
        d.developer_roles?.length > 0 && 
        d.work_status === 'Open to Work'
      );

      const prompt = `You are an AI talent scout for a Roblox development platform. Find the PERFECT developers for this job.

JOB DETAILS:
Title: ${job.title}
Description: ${job.description}
Required Roles: ${job.required_roles?.join(', ') || 'Not specified'}
Required Skills: ${job.required_skills?.join(', ') || 'Not specified'}
Experience Level: ${job.experience_level || 'Not specified'}
Budget: ${job.budget_range || 'Negotiable'}
Timeline: ${job.timeline || 'Not specified'}
Project Scope: ${job.project_scope || 'Not specified'}

AVAILABLE DEVELOPERS (${devs.length} total):
${devs.slice(0, 50).map((dev, i) => {
  const devPortfolios = portfolios.filter(p => p.user_id === dev.id);
  const devCerts = certifications.filter(c => c.user_id === dev.id && c.status === 'active');
  const devReviews = reviews.filter(r => r.reviewee_id === dev.id);
  const avgRating = devReviews.length > 0 
    ? (devReviews.reduce((sum, r) => sum + r.rating, 0) / devReviews.length).toFixed(1)
    : 'No reviews';

  return `
${i + 1}. ${dev.full_name} (ID: ${dev.id})
   - Roles: ${dev.developer_roles?.join(', ') || 'None'}
   - Skills: ${dev.skills?.join(', ') || 'None'}
   - Experience: ${dev.experience_level} (${dev.years_of_experience || 0} years)
   - Completed Projects: ${dev.completed_projects || 0}
   - Portfolio Items: ${devPortfolios.length}
   - Certifications: ${devCerts.map(c => `${c.skill_name} (${c.certification_level})`).join(', ') || 'None'}
   - Rating: ${avgRating}
   - Payment: ${dev.payment_preferences?.join(', ') || 'Not specified'}
   - Bio: ${dev.bio?.substring(0, 200) || 'No bio'}`;
}).join('\n')}

FIND THE TOP 10 MATCHES.

For each match, provide:
1. Match score (0-100) based on role, skill, and experience alignment
2. Detailed justification explaining WHY they're perfect
3. Specific matching strengths
4. Potential concerns or gaps
5. Suggested outreach message talking points
6. Estimated probability they'll accept (based on their profile and job fit)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            top_matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  developer_id: { type: "string" },
                  match_score: { type: "number" },
                  match_percentage: { type: "number" },
                  justification: { type: "string" },
                  matching_strengths: {
                    type: "array",
                    items: { type: "string" }
                  },
                  potential_concerns: {
                    type: "array",
                    items: { type: "string" }
                  },
                  outreach_talking_points: {
                    type: "array",
                    items: { type: "string" }
                  },
                  acceptance_probability: { type: "number" },
                  why_they_fit: { type: "string" },
                  portfolio_highlights: {
                    type: "array",
                    items: { type: "string" }
                  },
                  suggested_offer_range: { type: "string" }
                }
              }
            },
            market_insights: {
              type: "object",
              properties: {
                competition_level: { type: "string" },
                average_developer_availability: { type: "string" },
                recommended_timeline: { type: "string" },
                hiring_tips: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Map developer IDs to actual developer objects
      const matchedDevs = (response.top_matches || [])
        .map(match => {
          const developer = devs.find(d => d.id === match.developer_id);
          if (!developer) return null;

          const devPortfolios = portfolios.filter(p => p.user_id === developer.id);
          const devCerts = certifications.filter(c => c.user_id === developer.id && c.status === 'active');

          return {
            ...match,
            developer,
            portfolios: devPortfolios,
            certifications: devCerts
          };
        })
        .filter(Boolean);

      setMatches(matchedDevs);

    } catch (error) {
      console.error('Error finding talent:', error);
      alert('Failed to find talent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateOutreachMessage = (match) => {
    const talkingPoints = match.outreach_talking_points || [];
    const strengths = match.matching_strengths || [];

    return `Hi ${match.developer.full_name},

I came across your profile and was really impressed by your work! I'm reaching out about an opportunity that seems like a perfect fit for your skills.

🎯 **The Role**: ${job.title}

**Why I think you'd be great for this:**
${strengths.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')}

**What we're looking for:**
${job.required_skills?.slice(0, 3).map((s, i) => `- ${s}`).join('\n') || 'See full details'}

**Project Details:**
- Timeline: ${job.timeline || 'Flexible'}
- Budget: ${job.budget_range || 'Negotiable'}
- Type: ${job.project_scope || 'Standard project'}

${talkingPoints.length > 0 ? `\n**Key Discussion Points:**\n${talkingPoints.slice(0, 2).map(p => `- ${p}`).join('\n')}` : ''}

Would you be interested in discussing this further? I'd love to learn more about your experience and see if this could be a great match!

Best regards,
${user?.full_name || 'The Team'}`;
  };

  const sendMessage = async (developerId) => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      await base44.entities.Message.create({
        sender_id: user.id,
        receiver_id: developerId,
        content: message,
        job_id: job.id,
        message_type: 'job_inquiry'
      });

      await base44.entities.Notification.create({
        user_id: developerId,
        type: 'message',
        title: `New Job Opportunity: ${job.title}`,
        message: `${user.full_name} has a job opportunity that matches your skills!`,
        link: createPageUrl('Messages')
      });

      alert('Message sent successfully!');
      setMessage('');
      setSelectedDev(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white mb-2">🔍 AI is analyzing {job.required_roles?.length || 0} roles...</p>
          <p className="text-gray-400 text-sm">Scanning developer profiles, portfolios, and certifications</p>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI Talent Scout
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Find Perfect Candidates</h3>
          <p className="text-gray-400 mb-6">
            Let AI analyze all developers and find the best matches for your job
          </p>
          <Button
            onClick={findTalent}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Find Top Talent
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              AI Talent Scout Results
            </span>
            <Badge className="bg-purple-500/20 text-purple-400 border-0">
              {matches.length} Perfect Matches
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">
            AI analyzed developer profiles, portfolios, certifications, and reviews to find your perfect candidates
          </p>
        </CardContent>
      </Card>

      {matches.map((match, i) => (
        <Card key={i} className="glass-card border-0 card-hover">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {match.developer.avatar_url ? (
                    <img 
                      src={match.developer.avatar_url} 
                      alt={match.developer.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold text-lg">{match.developer.full_name}</h3>
                    <p className="text-gray-400 text-sm">
                      {match.developer.developer_roles?.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <Badge className={`${
                  match.match_percentage >= 90 ? 'bg-green-500/20 text-green-400' :
                  match.match_percentage >= 75 ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                } border-0 text-lg`}>
                  {match.match_percentage}% Match
                </Badge>
                <p className="text-gray-400 text-xs mt-1">
                  {match.acceptance_probability}% likely to accept
                </p>
              </div>
            </div>

            {/* AI Justification */}
            <div className="bg-indigo-500/5 rounded-lg p-4 mb-4">
              <p className="text-indigo-400 font-semibold text-sm mb-2">🤖 AI Analysis:</p>
              <p className="text-gray-300 text-sm">{match.why_they_fit || match.justification}</p>
            </div>

            {/* Matching Strengths */}
            <div className="mb-4">
              <p className="text-white font-semibold text-sm mb-2">✨ Matching Strengths:</p>
              <div className="flex flex-wrap gap-2">
                {match.matching_strengths?.map((strength, j) => (
                  <Badge key={j} className="bg-green-500/20 text-green-400 border-0 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Potential Concerns */}
            {match.potential_concerns?.length > 0 && (
              <div className="mb-4">
                <p className="text-white font-semibold text-sm mb-2">⚠️ Considerations:</p>
                <div className="flex flex-wrap gap-2">
                  {match.potential_concerns.map((concern, j) => (
                    <Badge key={j} className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Developer Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4 text-xs">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <Award className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-white font-bold">{match.developer.completed_projects || 0}</p>
                <p className="text-gray-400">Projects</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-white font-bold">{match.developer.rating?.toFixed(1) || '0.0'}</p>
                <p className="text-gray-400">Rating</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <Zap className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <p className="text-white font-bold">{match.certifications.length}</p>
                <p className="text-gray-400">Certs</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <p className="text-white font-bold">{match.portfolios.length}</p>
                <p className="text-gray-400">Portfolio</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setSelectedDev(match);
                  setMessage(generateOutreachMessage(match));
                }}
                className="flex-1 btn-primary text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Developer
              </Button>
              <Button
                onClick={() => window.location.href = createPageUrl(`PublicProfile?id=${match.developer.id}`)}
                variant="outline"
                className="glass-card border-0 text-white hover:bg-white/5"
              >
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Message Modal */}
      {selectedDev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="glass-card border-0 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">
                Message {selectedDev.developer.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-blue-400 font-semibold text-sm mb-2">💡 AI-Generated Message:</p>
                <p className="text-gray-400 text-xs">
                  Feel free to personalize this message before sending
                </p>
              </div>

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="bg-white/5 border-white/10 text-white min-h-[300px]"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => sendMessage(selectedDev.developer.id)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button
                  onClick={() => {
                    setSelectedDev(null);
                    setMessage('');
                  }}
                  variant="outline"
                  className="flex-1 glass-card border-0 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}