
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  CheckCircle,
  Zap,
  Trophy,
  Flame,
  Gift
} from 'lucide-react';

export default function DailyChallenges({ user, onChallengeComplete }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, [user?.id]);

  const loadChallenges = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      let todaysChallenges = await base44.entities.DailyChallenge.filter({
        user_id: user.id,
        date: today
      });

      // Generate new challenges if none exist for today
      if (todaysChallenges.length === 0) {
        todaysChallenges = await generateDailyChallenges(user.id, today);
      }

      setChallenges(todaysChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
      // Set empty array on error to prevent UI crashes
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyChallenges = async (userId, date) => {
    const challengeTemplates = [
      {
        type: 'apply_to_jobs',
        title: 'Job Hunter',
        description: 'Apply to 3 jobs today',
        xp_reward: 50,
        target_count: 3
      },
      {
        type: 'update_profile',
        title: 'Profile Polish',
        description: 'Update your profile or portfolio',
        xp_reward: 30,
        target_count: 1
      },
      {
        type: 'help_community',
        title: 'Community Helper',
        description: 'Answer 2 forum questions',
        xp_reward: 40,
        target_count: 2
      },
      {
        type: 'view_jobs',
        title: 'Opportunity Seeker',
        description: 'View 10 job postings',
        xp_reward: 20,
        target_count: 10
      },
      {
        type: 'message_developers',
        title: 'Network Builder',
        description: 'Send 3 messages to developers',
        xp_reward: 35,
        target_count: 3
      }
    ];

    // Select 3 random challenges
    const selected = challengeTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const newChallenges = [];
    for (const template of selected) {
      try {
        const challenge = await base44.entities.DailyChallenge.create({
          user_id: userId,
          date: date,
          challenge_type: template.type,
          title: template.title,
          description: template.description,
          xp_reward: template.xp_reward,
          target_count: template.target_count,
          current_progress: 0,
          completed: false
        });
        newChallenges.push(challenge);
      } catch (error) {
        console.error('Error creating challenge:', error);
        // Continue creating other challenges even if one fails
      }
    }

    return newChallenges;
  };

  const checkProgress = async (challengeId, increment = 1) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    const newProgress = challenge.current_progress + increment;
    const isCompleted = newProgress >= challenge.target_count;

    let updateData = {
      current_progress: Math.min(newProgress, challenge.target_count)
    };

    if (isCompleted) {
      // Calculate streak bonus
      const streakBonus = user.streak_days >= 7 ? 20 : 0;
      
      updateData = {
        ...updateData,
        completed: true,
        completed_at: new Date().toISOString(),
        streak_bonus: streakBonus > 0,
        bonus_xp: streakBonus
      };

      // Award XP to user
      const totalXP = challenge.xp_reward + streakBonus;
      await base44.auth.updateMe({
        xp_points: (user.xp_points || 0) + totalXP
      });

      // Create notification
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '🎯 Challenge Completed!',
        message: `You earned ${totalXP} XP ${streakBonus > 0 ? `(+${streakBonus} streak bonus!)` : ''}`,
        link: '/dashboard'
      });

      if (onChallengeComplete) onChallengeComplete();
    }

    await base44.entities.DailyChallenge.update(challengeId, updateData);
    loadChallenges();
  };

  const completedCount = challenges.filter(c => c.completed).length;
  const totalXP = challenges.reduce((sum, c) => sum + (c.completed ? c.xp_reward + (c.bonus_xp || 0) : 0), 0);

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="animate-spin w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-6 text-center">
          <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-2">No Challenges Today</p>
          <p className="text-gray-400 text-sm">
            Check back tomorrow for new challenges!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Daily Challenges</CardTitle>
              <p className="text-gray-400 text-xs">Complete for bonus XP</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{completedCount}/{challenges.length}</p>
            <p className="text-gray-400 text-xs">
              {totalXP > 0 ? `${totalXP} XP earned` : 'Not started'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`rounded-lg p-4 ${
              challenge.completed
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-semibold">{challenge.title}</h4>
                  {challenge.completed && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-2">{challenge.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      {challenge.current_progress}/{challenge.target_count}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.round((challenge.current_progress / challenge.target_count) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(challenge.current_progress / challenge.target_count) * 100} 
                    className="h-2"
                  />
                </div>
              </div>

              <div className="text-right ml-4">
                <Badge className="bg-indigo-500/20 text-indigo-400 border-0">
                  <Zap className="w-3 h-3 mr-1" />
                  {challenge.xp_reward} XP
                </Badge>
                {challenge.bonus_xp > 0 && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-0 mt-1">
                    <Flame className="w-3 h-3 mr-1" />
                    +{challenge.bonus_xp}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}

        {completedCount === challenges.length && challenges.length > 0 && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-white font-semibold mb-1">All Challenges Complete!</p>
            <p className="text-gray-400 text-sm">
              Come back tomorrow for new challenges
            </p>
            {user?.streak_days >= 7 && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-0 mt-2">
                <Flame className="w-3 h-3 mr-1" />
                {user.streak_days} Day Streak!
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
