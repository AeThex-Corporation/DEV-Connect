import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Sparkles,
  Target,
  BookOpen,
  TrendingUp,
  CheckCircle,
  MessageSquare,
  Award,
  Star,
  Send
} from 'lucide-react';

export default function AIMentorshipMatcher({ user, mode = 'find_mentor' }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);

  const findMatches = async () => {
    setLoading(true);
    try {
      const [allUsers, portfolios, certifications, reviews, mentorshipSessions] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Portfolio.list(),
        base44.entities.Certification.list(),
        base44.entities.Review.list(),
        base44.entities.MentorshipSession.list()
      ]);

      const isFindingMentor = mode === 'find_mentor';

      const prompt = isFindingMentor
        ? `You are an AI mentorship matchmaker. Find the PERFECT mentors for this developer seeking guidance.

MENTEE PROFILE (seeking mentorship):
Name: ${user.full_name}
Roles: ${user.developer_roles?.join(', ') || 'Not specified'}
Skills: ${user.skills?.join(', ') || 'Not specified'}
Experience: ${user.experience_level} (${user.years_of_experience || 0} years)
Projects: ${user.completed_projects || 0}
Career Goal: ${user.career_goal || 'Not specified'}
Bio: ${user.bio || 'No bio provided'}

AVAILABLE MENTORS (${allUsers.length} potential mentors):
${allUsers.filter(u => 
  u.id !== user.id && 
  u.experience_level === 'Advanced' || u.experience_level === 'Expert'
).slice(0, 50).map((dev, i) => {
  const devPortfolio = portfolios.filter(p => p.user_id === dev.id);
  const devCerts = certifications.filter(c => c.user_id === dev.id && c.status === 'active');
  const devReviews = reviews.filter(r => r.reviewee_id === dev.id);
  const devMentoringSessions = mentorshipSessions.filter(s => s.mentor_id === dev.id);
  const avgRating = devReviews.length > 0 
    ? (devReviews.reduce((sum, r) => sum + r.rating, 0) / devReviews.length).toFixed(1)
    : '0.0';

  return `${i + 1}. ${dev.full_name} (ID: ${dev.id})
   Roles: ${dev.developer_roles?.join(', ') || 'None'}
   Skills: ${dev.skills?.join(', ') || 'None'}
   Experience: ${dev.experience_level} (${dev.years_of_experience || 0} years)
   Projects: ${dev.completed_projects || 0}
   Portfolio: ${devPortfolio.length} items
   Certifications: ${devCerts.map(c => c.skill_name).join(', ') || 'None'}
   Rating: ${avgRating}/5
   Mentoring Sessions: ${devMentoringSessions.length}
   Bio: ${dev.bio?.substring(0, 200) || 'No bio'}`;
}).join('\n\n')}

FIND THE TOP 8 MENTOR MATCHES that would be most beneficial for this developer's growth.`
        : `You are an AI mentorship matchmaker. Find developers who would benefit from THIS user's expertise as a mentor.

MENTOR PROFILE (can offer mentorship):
Name: ${user.full_name}
Roles: ${user.developer_roles?.join(', ') || 'Not specified'}
Skills: ${user.skills?.join(', ') || 'Not specified'}
Experience: ${user.experience_level} (${user.years_of_experience || 0} years)
Projects: ${user.completed_projects || 0}
Bio: ${user.bio || 'No bio provided'}

POTENTIAL MENTEES (${allUsers.length} developers):
${allUsers.filter(u => 
  u.id !== user.id && 
  (u.experience_level === 'Beginner' || u.experience_level === 'Intermediate')
).slice(0, 50).map((dev, i) => `${i + 1}. ${dev.full_name} (ID: ${dev.id})
   Roles: ${dev.developer_roles?.join(', ') || 'None'}
   Skills: ${dev.skills?.join(', ') || 'None'}
   Experience: ${dev.experience_level} (${dev.years_of_experience || 0} years)
   Career Goal: ${dev.career_goal || 'Not specified'}
   Bio: ${dev.bio?.substring(0, 200) || 'No bio'}`).join('\n\n')}

FIND THE TOP 8 MENTEE MATCHES who would benefit most from this mentor's expertise.`;

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
                  user_id: { type: "string" },
                  match_score: { type: "number", minimum: 0, maximum: 100 },
                  compatibility_reasons: {
                    type: "array",
                    items: { type: "string" }
                  },
                  shared_interests: {
                    type: "array",
                    items: { type: "string" }
                  },
                  complementary_skills: {
                    type: "array",
                    items: { type: "string" }
                  },
                  learning_opportunities: {
                    type: "array",
                    items: { type: "string" }
                  },
                  mentorship_style_fit: { type: "string" },
                  time_commitment_suggestion: {
                    type: "string",
                    enum: ["casual", "regular", "intensive"]
                  },
                  suggested_meeting_frequency: {
                    type: "string",
                    enum: ["weekly", "bi-weekly", "monthly", "as-needed"]
                  },
                  focus_areas: {
                    type: "array",
                    items: { type: "string" }
                  },
                  expected_outcomes: {
                    type: "array",
                    items: { type: "string" }
                  },
                  potential_challenges: {
                    type: "array",
                    items: { type: "string" }
                  },
                  success_probability: { type: "number", minimum: 0, maximum: 100 }
                }
              }
            },
            general_insights: {
              type: "object",
              properties: {
                market_demand_for_skills: { type: "string" },
                ideal_mentor_profile: { type: "string" },
                growth_trajectory: { type: "string" },
                recommendations: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Enrich with user data
      const enrichedMatches = response.matches?.map(match => {
        const matchedUser = allUsers.find(u => u.id === match.user_id);
        const userPortfolio = portfolios.filter(p => p.user_id === match.user_id);
        const userCerts = certifications.filter(c => c.user_id === match.user_id && c.status === 'active');
        
        return {
          ...match,
          user: matchedUser,
          portfolio: userPortfolio,
          certifications: userCerts
        };
      }).filter(m => m.user);

      setMatches({
        matches: enrichedMatches,
        insights: response.general_insights
      });

    } catch (error) {
      console.error('Error finding mentorship matches:', error);
      alert('Failed to find mentorship matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMentorshipRequest = async (match) => {
    try {
      const isFindingMentor = mode === 'find_mentor';
      
      await base44.entities.MentorshipRequest.create({
        mentee_id: isFindingMentor ? user.id : match.user.id,
        mentor_id: isFindingMentor ? match.user.id : user.id,
        focus_areas: match.focus_areas || [],
        message: `Hi ${match.user.full_name},

I came across your profile and think we'd be a great match for mentorship! 

${isFindingMentor 
  ? `I'm looking to learn more about ${match.focus_areas?.slice(0, 3).join(', ')} and your experience would be invaluable.`
  : `I believe I could help you grow in ${match.focus_areas?.slice(0, 3).join(', ')} based on my experience.`}

Here's what I think we could work on together:
${match.learning_opportunities?.slice(0, 3).map((o, i) => `${i + 1}. ${o}`).join('\n')}

${isFindingMentor 
  ? 'Would you be open to a mentorship relationship?'
  : 'I\'d love to support your development journey!'}

Best,
${user.full_name}`,
        goals: match.expected_outcomes?.join('\n') || 'Career growth and skill development',
        commitment_level: match.time_commitment_suggestion || 'regular',
        preferred_meeting_frequency: match.suggested_meeting_frequency || 'bi-weekly'
      });

      await base44.entities.Notification.create({
        user_id: match.user.id,
        type: 'message',
        title: isFindingMentor ? '🎓 New Mentorship Request' : '👨‍🏫 Someone Wants Your Mentorship!',
        message: `${user.full_name} is interested in a mentorship relationship with you!`,
        link: createPageUrl('Mentorship')
      });

      alert('✅ Mentorship request sent successfully!');
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send mentorship request. Please try again.');
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white mb-2">🤖 AI is analyzing {mode === 'find_mentor' ? 'mentor' : 'mentee'} profiles...</p>
          <p className="text-gray-400 text-sm">Finding your perfect matches</p>
        </CardContent>
      </Card>
    );
  }

  if (!matches) {
    return (
      <Card className="glass-card border-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Mentorship Matcher
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            {mode === 'find_mentor' 
              ? 'Find experienced mentors who can guide your career growth'
              : 'Discover developers who would benefit from your expertise'}
          </p>
          <Button
            onClick={findMatches}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-lg px-8 py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Find {mode === 'find_mentor' ? 'Mentors' : 'Mentees'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Insights */}
      <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {matches.insights?.market_demand_for_skills && (
            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
              <p className="text-blue-400 font-semibold text-sm mb-1">Market Demand:</p>
              <p className="text-gray-300 text-sm">{matches.insights.market_demand_for_skills}</p>
            </div>
          )}
          {matches.insights?.ideal_mentor_profile && (
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
              <p className="text-green-400 font-semibold text-sm mb-1">Ideal Match:</p>
              <p className="text-gray-300 text-sm">{matches.insights.ideal_mentor_profile}</p>
            </div>
          )}
          {matches.insights?.growth_trajectory && (
            <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
              <p className="text-purple-400 font-semibold text-sm mb-1">Growth Path:</p>
              <p className="text-gray-300 text-sm">{matches.insights.growth_trajectory}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matches */}
      <div className="space-y-4">
        <h3 className="text-white font-bold text-xl">
          Top {mode === 'find_mentor' ? 'Mentor' : 'Mentee'} Matches ({matches.matches?.length || 0})
        </h3>

        {matches.matches?.map((match, i) => (
          <Card key={i} className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                {match.user?.avatar_url ? (
                  <img 
                    src={match.user.avatar_url}
                    alt={match.user.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-bold text-lg">{match.user?.full_name}</h4>
                    <Badge className="bg-purple-500/20 text-purple-400 border-0">
                      {match.match_score}% Match
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-0">
                      {match.success_probability}% Success
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <span className="text-gray-400">{match.user?.experience_level}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{match.user?.years_of_experience || 0} years</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{match.user?.completed_projects || 0} projects</span>
                  </div>

                  <p className="text-gray-300 text-sm mb-3">{match.user?.bio?.substring(0, 150)}...</p>
                </div>
              </div>

              <Tabs defaultValue="compatibility" className="w-full">
                <TabsList className="glass-card border-0 mb-4">
                  <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                  <TabsTrigger value="focus">Focus Areas</TabsTrigger>
                  <TabsTrigger value="outcomes">Expected Outcomes</TabsTrigger>
                </TabsList>

                <TabsContent value="compatibility" className="space-y-3">
                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Why This Match:</p>
                    <div className="space-y-2">
                      {match.compatibility_reasons?.map((reason, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Shared Interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.shared_interests?.map((interest, j) => (
                        <Badge key={j} className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Complementary Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.complementary_skills?.map((skill, j) => (
                        <Badge key={j} className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-indigo-500/10 rounded-lg p-3 border border-indigo-500/20">
                    <p className="text-indigo-400 font-semibold text-sm mb-1">Mentorship Style:</p>
                    <p className="text-gray-300 text-sm">{match.mentorship_style_fit}</p>
                  </div>
                </TabsContent>

                <TabsContent value="focus" className="space-y-3">
                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Focus Areas:</p>
                    <div className="space-y-2">
                      {match.focus_areas?.map((area, j) => (
                        <div key={j} className="bg-white/5 rounded-lg p-3">
                          <p className="text-white font-semibold text-sm">{area}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Learning Opportunities:</p>
                    <div className="space-y-2">
                      {match.learning_opportunities?.map((opp, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{opp}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Time Commitment</p>
                      <p className="text-white font-semibold capitalize">{match.time_commitment_suggestion}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Meeting Frequency</p>
                      <p className="text-white font-semibold capitalize">{match.suggested_meeting_frequency?.replace(/-/g, ' ')}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="outcomes" className="space-y-3">
                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Expected Outcomes:</p>
                    <div className="space-y-2">
                      {match.expected_outcomes?.map((outcome, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {match.potential_challenges?.length > 0 && (
                    <div>
                      <p className="text-white font-semibold text-sm mb-2">Potential Challenges:</p>
                      <div className="space-y-2">
                        {match.potential_challenges.map((challenge, j) => (
                          <div key={j} className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                            <p className="text-gray-300 text-sm">{challenge}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                    <p className="text-green-400 font-semibold text-sm mb-1">Success Probability:</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${match.success_probability}%` }}
                        />
                      </div>
                      <span className="text-white font-bold">{match.success_probability}%</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => sendMentorshipRequest(match)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </Button>
                <Button
                  onClick={() => window.location.href = createPageUrl(`PublicProfile?id=${match.user.id}`)}
                  variant="outline"
                  className="flex-1 glass-card border-0 text-white hover:bg-white/5"
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refresh Button */}
      <Button
        onClick={findMatches}
        className="w-full glass-card border-0 text-white hover:bg-white/5"
      >
        Find More Matches
      </Button>
    </div>
  );
}