
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Target,
  Zap,
  CheckCircle,
  TrendingUp,
  Award,
  Sparkles,
  Crown,
  Flame
} from 'lucide-react';

export default function AIGamificationEngine({ user }) {
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    if (user) {
      loadPersonalizedChallenges();
    }
  }, [user]);

  const loadPersonalizedChallenges = async () => {
    setLoading(true);
    try {
      const [applications, portfolio, assessments, forumPosts, achievements, allChallenges] = await Promise.all([
        base44.entities.Application.filter({ applicant_id: user.id }),
        base44.entities.Portfolio.filter({ user_id: user.id }),
        base44.entities.SkillAssessment.filter({ user_id: user.id }),
        base44.entities.ForumPost.filter({ author_id: user.id }),
        base44.entities.Achievement.filter({ user_id: user.id }),
        base44.entities.DailyChallenge.filter({ user_id: user.id, date: new Date().toISOString().split('T')[0] })
      ]);

      const prompt = `You are an AI gamification engine for a Roblox developer platform. Generate PERSONALIZED challenges and quests for this user.

USER PROFILE:
Name: ${user.full_name}
Level: ${user.level || 1}
XP: ${user.xp_points || 0}
Experience: ${user.experience_level}
Roles: ${user.developer_roles?.join(', ') || 'Not specified'}
Completed Projects: ${user.completed_projects || 0}
Streak: ${user.streak_days || 0} days
Work Status: ${user.work_status}

USER ACTIVITY:
- Applications Sent: ${applications.length}
- Portfolio Projects: ${portfolio.length}
- Skill Assessments Taken: ${assessments.length}
- Forum Posts: ${forumPosts.length}
- Achievements Unlocked: ${achievements.length}
- Today's Challenges: ${allChallenges.length}

GENERATE 6 PERSONALIZED CHALLENGES that will:
1. Push user to explore new platform features (AI Talent Scout, Project Generator, etc.)
2. Encourage engagement (applying to jobs, posting in forums, networking)
3. Promote skill development (assessments, learning resources)
4. Build portfolio (uploading projects, showcasing work)
5. Match their current level and activity patterns
6. Offer appropriate XP rewards based on difficulty`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  challenge_type: {
                    type: "string",
                    enum: [
                      "apply_to_jobs",
                      "update_profile",
                      "complete_assessment",
                      "help_community",
                      "network",
                      "learn_skill",
                      "view_jobs",
                      "message_developers",
                      "use_ai_talent_scout",
                      "use_project_generator",
                      "use_skill_analyzer",
                      "upload_portfolio",
                      "get_certification",
                      "attend_mentorship"
                    ]
                  },
                  title: { type: "string" },
                  description: { type: "string" },
                  xp_reward: { type: "number" },
                  difficulty: {
                    type: "string",
                    enum: ["easy", "medium", "hard", "epic"]
                  },
                  target_count: { type: "number" },
                  time_limit_hours: { type: "number" },
                  category: {
                    type: "string",
                    enum: ["exploration", "engagement", "skill_building", "networking", "career_growth"]
                  },
                  why_recommended: { type: "string" },
                  tips: {
                    type: "array",
                    items: { type: "string" }
                  },
                  bonus_reward: { type: "string" }
                },
                required: ["challenge_type", "title", "xp_reward"]
              }
            }
          }
        }
      });

      // Save challenges to database with validation
      const challengesToday = response.challenges?.slice(0, 6) || [];
      const createdChallenges = [];

      for (const challenge of challengesToday) {
        try {
          // Validate required fields
          if (!challenge.challenge_type || !challenge.title || !challenge.xp_reward) {
            console.warn('Skipping invalid challenge due to missing required fields:', challenge);
            continue;
          }

          const newChallenge = await base44.entities.DailyChallenge.create({
            user_id: user.id,
            date: new Date().toISOString().split('T')[0],
            challenge_type: challenge.challenge_type,
            title: challenge.title,
            description: challenge.description || 'Complete this challenge', // Provide default if missing
            xp_reward: challenge.xp_reward || 20, // Provide default if missing
            target_count: challenge.target_count || 1,
            current_progress: 0,
            completed: false
          });

          createdChallenges.push(challenge); // Push the original challenge object from LLM response
        } catch (error) {
          console.error('Error creating individual challenge:', error);
          // Continue with other challenges even if one fails
        }
      }

      setChallenges(createdChallenges);

    } catch (error) {
      console.error('Error loading challenges:', error);
      // Set fallback challenges if AI fails or an error occurs
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const generateLeaderboard = async () => {
    setLoading(true);
    try {
      const allUsers = await base44.entities.User.list();

      const prompt = `Generate an AI-powered leaderboard that ranks users by multiple engagement metrics.

USER DATA (${allUsers.length} users):
${allUsers.slice(0, 100).map(u => `
- ${u.full_name}: XP ${u.xp_points || 0}, Level ${u.level || 1}, Projects ${u.completed_projects || 0}, Streak ${u.streak_days || 0}
`).join('\n')}

Create dynamic leaderboards for:
1. Overall XP Leaders (top 20)
2. Level Leaders (top 20)
3. Streak Champions (longest streaks, top 20)
4. Rising Stars (biggest XP gains this week, top 20)
5. Community Heroes (forum activity, top 20)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_leaders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  rank: { type: "number" },
                  xp_points: { type: "number" },
                  level: { type: "number" },
                  badge: { type: "string" }
                }
              }
            },
            streak_champions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  rank: { type: "number" },
                  streak_days: { type: "number" },
                  badge: { type: "string" }
                }
              }
            },
            rising_stars: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  rank: { type: "number" },
                  xp_gain: { type: "number" },
                  badge: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Enrich with user data
      const enrichLeaderboard = (board) => {
        return board?.map(entry => ({
          ...entry,
          user: allUsers.find(u => u.id === entry.user_id)
        })).filter(e => e.user);
      };

      setLeaderboard({
        overall: enrichLeaderboard(response.overall_leaders),
        streaks: enrichLeaderboard(response.streak_champions),
        rising: enrichLeaderboard(response.rising_stars)
      });

    } catch (error) {
      console.error('Error generating leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async (challenge) => {
    // Mark challenge as complete and award XP
    try {
      const dbChallenge = await base44.entities.DailyChallenge.filter({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        challenge_type: challenge.challenge_type,
        title: challenge.title // Use title as well for better specificity
      });

      if (dbChallenge[0]) {
        await base44.entities.DailyChallenge.update(dbChallenge[0].id, {
          completed: true,
          completed_at: new Date().toISOString(),
          current_progress: challenge.target_count
        });
      }

      // Award XP
      await base44.auth.updateMe({
        xp_points: (user.xp_points || 0) + challenge.xp_reward
      });

      alert(`🎉 Challenge completed! +${challenge.xp_reward} XP`);
      loadPersonalizedChallenges(); // Reload challenges to update UI
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'easy': 'bg-green-500/20 text-green-400',
      'medium': 'bg-yellow-500/20 text-yellow-400',
      'hard': 'bg-orange-500/20 text-orange-400',
      'epic': 'bg-purple-500/20 text-purple-400'
    };
    return colors[difficulty] || colors['medium'];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'exploration': Sparkles,
      'engagement': Target,
      'skill_building': Award,
      'networking': Trophy,
      'career_growth': TrendingUp
    };
    return icons[category] || Target;
  };

  return (
    <div className="space-y-6">
      {/* Daily Challenges */}
      <Card className="glass-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Today's Challenges
            </CardTitle>
            <Button
              onClick={loadPersonalizedChallenges}
              size="sm"
              className="btn-primary text-white"
              disabled={loading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && challenges.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Generating personalized challenges...</p>
            </div>
          ) : !loading && challenges.length === 0 ? ( // Added condition for no challenges after loading
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">No Challenges Available</p>
              <p className="text-gray-400 text-sm mb-4">
                Click refresh to generate new personalized challenges
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {challenges.map((challenge, i) => {
                const CategoryIcon = getCategoryIcon(challenge.category);

                return (
                  <Card key={i} className="glass-card border-0 bg-white/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${
                          challenge.difficulty === 'epic' ? 'from-purple-500 to-pink-500' :
                          challenge.difficulty === 'hard' ? 'from-orange-500 to-red-500' :
                          challenge.difficulty === 'medium' ? 'from-yellow-500 to-orange-500' :
                          'from-green-500 to-emerald-500'
                        } rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <CategoryIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold text-sm">{challenge.title}</h4>
                            <Badge className={`${getDifficultyColor(challenge.difficulty)} border-0 text-xs`}>
                              {challenge.difficulty}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs">{challenge.description}</p>
                        </div>
                      </div>

                      <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 mb-3">
                        <p className="text-blue-400 text-xs font-semibold mb-1">💡 Why this challenge:</p>
                        <p className="text-gray-300 text-xs">{challenge.why_recommended}</p>
                      </div>

                      {challenge.tips && challenge.tips.length > 0 && (
                        <div className="mb-3">
                          <p className="text-white font-semibold text-xs mb-1">Tips:</p>
                          <ul className="space-y-1">
                            {challenge.tips.map((tip, j) => (
                              <li key={j} className="text-gray-400 text-xs">• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-bold text-sm">+{challenge.xp_reward} XP</span>
                        </div>
                        <Button
                          onClick={() => completeChallenge(challenge)}
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Button>
                      </div>

                      {challenge.bonus_reward && (
                        <p className="text-yellow-400 text-xs mt-2">🎁 Bonus: {challenge.bonus_reward}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboards */}
      <Card className="glass-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              AI-Generated Leaderboards
            </CardTitle>
            <Button
              onClick={generateLeaderboard}
              size="sm"
              className="btn-primary text-white"
              disabled={loading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!leaderboard ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">See How You Rank</p>
              <p className="text-gray-400 text-sm mb-4">
                Generate AI-powered leaderboards to see top performers
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Leaders */}
              <div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Top XP Leaders
                </h4>
                <div className="space-y-2">
                  {leaderboard.overall?.slice(0, 10).map((entry, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                      i === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' :
                      i === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30' :
                      i === 2 ? 'bg-gradient-to-r from-orange-600/20 to-orange-700/20 border border-orange-600/30' :
                      'bg-white/5'
                    }`}>
                      <div className="w-8 h-8 flex items-center justify-center">
                        {i < 3 ? (
                          <Crown className={`w-5 h-5 ${
                            i === 0 ? 'text-yellow-400' :
                            i === 1 ? 'text-gray-400' :
                            'text-orange-600'
                          }`} />
                        ) : (
                          <span className="text-gray-400 font-bold">#{entry.rank}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{entry.user?.full_name}</p>
                        <p className="text-gray-400 text-xs">Level {entry.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{entry.xp_points} XP</p>
                        <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                          {entry.badge}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak Champions */}
              <div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Streak Champions
                </h4>
                <div className="space-y-2">
                  {leaderboard.streaks?.slice(0, 5).map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <span className="text-gray-400 font-bold">#{entry.rank}</span>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{entry.user?.full_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-bold">{entry.streak_days} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rising Stars */}
              <div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Rising Stars
                </h4>
                <div className="space-y-2">
                  {leaderboard.rising?.slice(0, 5).map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <span className="text-gray-400 font-bold">#{entry.rank}</span>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{entry.user?.full_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-bold">+{entry.xp_gain} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
