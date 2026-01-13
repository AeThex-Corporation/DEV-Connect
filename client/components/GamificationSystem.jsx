
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  TrendingUp,
  Flame,
  CheckCircle,
  Users,
  MessageSquare,
  Code,
  Sparkles
} from "lucide-react";

// XP Award System
export const XP_REWARDS = {
  PROFILE_COMPLETE: 100,
  FIRST_APPLICATION: 50,
  APPLICATION_SENT: 10,
  JOB_ACCEPTED: 200,
  JOB_COMPLETED: 500,
  FIVE_STAR_REVIEW: 100,
  FORUM_POST: 20,
  FORUM_REPLY: 10,
  SKILL_ENDORSED: 15,
  PORTFOLIO_PROJECT: 75,
  LOGIN_STREAK_7: 50,
  LOGIN_STREAK_30: 200,
  REFERRAL_SIGNUP: 100,
  ASSET_LISTED: 50,
  ASSET_SOLD: 100,
  CERTIFICATION_EARNED: 150,
  COLLAB_ROOM_CREATED: 30,
  COLLAB_MESSAGE_SENT: 5,
  TASK_COMPLETED: 25,
  AI_TOOL_USED: 25,
  MENTORSHIP_SESSION: 50
};

// Badge Definitions
export const BADGES = {
  EARLY_ADOPTER: {
    id: 'early_adopter',
    title: 'Early Adopter',
    description: 'Joined during beta',
    icon: '🚀',
    rarity: 'legendary',
    xp: 100
  },
  FIRST_JOB: {
    id: 'first_job',
    title: 'First Steps',
    description: 'Landed your first job',
    icon: '🎯',
    rarity: 'common',
    xp: 50
  },
  FIVE_JOBS: {
    id: 'five_jobs',
    title: 'Rising Star',
    description: 'Completed 5 jobs',
    icon: '⭐',
    rarity: 'rare',
    xp: 150
  },
  TEN_JOBS: {
    id: 'ten_jobs',
    title: 'Professional',
    description: 'Completed 10 jobs',
    icon: '💼',
    rarity: 'epic',
    xp: 300
  },
  TOP_RATED: {
    id: 'top_rated',
    title: 'Top Rated Developer',
    description: 'Achieved 5.0 rating with 10+ reviews',
    icon: '👑',
    rarity: 'legendary',
    xp: 500
  },
  COMMUNITY_HERO: {
    id: 'community_hero',
    title: 'Community Hero',
    description: 'Made 50+ helpful forum posts',
    icon: '🦸',
    rarity: 'epic',
    xp: 250
  },
  FAST_RESPONDER: {
    id: 'fast_responder',
    title: 'Fast Responder',
    description: 'Responded to 10 jobs within 1 hour',
    icon: '⚡',
    rarity: 'rare',
    xp: 100
  },
  STREAK_MASTER: {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintained 30-day login streak',
    icon: '🔥',
    rarity: 'epic',
    xp: 300
  },
  SKILL_MASTER: {
    id: 'skill_master',
    title: 'Skill Master',
    description: 'Earned 3+ certifications',
    icon: '🎓',
    rarity: 'rare',
    xp: 150
  },
  PORTFOLIO_PRO: {
    id: 'portfolio_pro',
    title: 'Portfolio Pro',
    description: 'Added 5+ portfolio projects',
    icon: '🎨',
    rarity: 'common',
    xp: 100
  },
  TOP_SELLER: {
    id: 'top_seller',
    title: 'Top Seller',
    description: 'Sold 10+ marketplace assets',
    icon: '💰',
    rarity: 'epic',
    xp: 250
  },
  COLLABORATOR: {
    id: 'collaborator',
    title: 'Team Player',
    description: 'Participated in 10+ collaboration rooms',
    icon: '🤝',
    rarity: 'rare',
    xp: 150
  },
  AI_PIONEER: {
    id: 'ai_pioneer',
    title: 'AI Pioneer',
    description: 'Used AI tools 25+ times',
    icon: '🤖',
    rarity: 'rare',
    xp: 150
  },
  MENTOR: {
    id: 'mentor',
    title: 'Mentor',
    description: 'Completed 5+ mentorship sessions',
    icon: '👨‍🏫',
    rarity: 'epic',
    xp: 200
  },
  CERTIFIED_PRO: {
    id: 'certified_pro',
    title: 'Certified Professional',
    description: 'Earned 5+ certifications',
    icon: '📜',
    rarity: 'legendary',
    xp: 500
  }
};

// Calculate level from XP
export const calculateLevel = (xp) => {
  return Math.floor(xp / 1000) + 1;
};

// Calculate XP needed for next level
export const calculateNextLevelXP = (level) => {
  return level * 1000;
};

// Award XP to user
export const awardXP = async (userId, amount, reason) => {
  try {
    const user = await base44.entities.User.get(userId);
    const newXP = (user.xp_points || 0) + amount;
    const oldLevel = calculateLevel(user.xp_points || 0);
    const newLevel = calculateLevel(newXP);

    await base44.entities.User.update(userId, {
      xp_points: newXP,
      level: newLevel
    });

    // Create notification
    await base44.entities.Notification.create({
      user_id: userId,
      type: 'message',
      title: `+${amount} XP Earned!`,
      message: reason,
      metadata: { xp_gained: amount }
    });

    // Level up notification
    if (newLevel > oldLevel) {
      await base44.entities.Notification.create({
        user_id: userId,
        type: 'message',
        title: `🎉 Level Up! You're now Level ${newLevel}`,
        message: `Congratulations! You've reached level ${newLevel}!`,
        metadata: { level_reached: newLevel }
      });
    }

    return { newXP, newLevel, leveledUp: newLevel > oldLevel };
  } catch (error) {
    console.error('Error awarding XP:', error);
  }
};

// Award badge to user
export const awardBadge = async (userId, badgeId) => {
  try {
    const badge = BADGES[badgeId];
    if (!badge) return;

    // Check if user already has this badge
    const existingAchievements = await base44.entities.Achievement.filter({ 
      user_id: userId, 
      achievement_type: badge.id 
    });

    if (existingAchievements.length > 0) return;

    // Create achievement
    await base44.entities.Achievement.create({
      user_id: userId,
      achievement_type: badge.id,
      title: badge.title,
      description: badge.description,
      icon: badge.icon,
      points: badge.xp,
      rarity: badge.rarity,
      unlocked_at: new Date().toISOString()
    });

    // Award XP for the badge
    await awardXP(userId, badge.xp, `Unlocked badge: ${badge.title}`);

    // Create notification for badge unlock, including a link to the profile
    await base44.entities.Notification.create({
      user_id: userId,
      type: 'message',
      title: `🎉 Achievement Unlocked: ${badge.title}!`,
      message: `You earned ${badge.xp} XP`,
      link: createPageUrl('Profile'),
      metadata: { badge_id: badgeId }
    });

    return true;
  } catch (error) {
    console.error('Error awarding badge:', error);
  }
};

// Check and award badges automatically
export const checkAndAwardBadges = async (userId) => {
  try {
    const [
      user,
      jobs,
      assets,
      certifications,
      collabRooms,
      portfolios,
      achievements
    ] = await Promise.all([
      base44.entities.User.get(userId),
      base44.entities.Application.filter({ applicant_id: userId, status: 'Accepted' }),
      base44.entities.AssetPurchase.filter({ seller_id: userId }),
      base44.entities.Certification.filter({ user_id: userId }),
      base44.entities.CollabRoom.list(), // Fetch all then filter client-side if participant_ids isn't directly queryable
      base44.entities.Portfolio.filter({ user_id: userId }),
      base44.entities.Achievement.filter({ user_id: userId })
    ]);

    const myRooms = collabRooms.filter(r => r.participant_ids?.includes(userId));
    const existingBadges = achievements.map(a => a.achievement_type);

    // Check job-based badges
    if (jobs.length >= 1 && !existingBadges.includes('first_job')) {
      await awardBadge(userId, 'FIRST_JOB');
    }
    if (jobs.length >= 5 && !existingBadges.includes('five_jobs')) {
      await awardBadge(userId, 'FIVE_JOBS');
    }
    if (jobs.length >= 10 && !existingBadges.includes('ten_jobs')) {
      await awardBadge(userId, 'TEN_JOBS');
    }

    // Check seller badges
    if (assets.length >= 10 && !existingBadges.includes('top_seller')) {
      await awardBadge(userId, 'TOP_SELLER');
    }

    // Check collaboration badges
    if (myRooms.length >= 10 && !existingBadges.includes('collaborator')) {
      await awardBadge(userId, 'COLLABORATOR');
    }

    // Check portfolio badges
    if (portfolios.length >= 5 && !existingBadges.includes('portfolio_pro')) {
      await awardBadge(userId, 'PORTFOLIO_PRO');
    }

    // Check certification badges
    if (certifications.length >= 3 && !existingBadges.includes('skill_master')) {
      await awardBadge(userId, 'SKILL_MASTER');
    }
    if (certifications.length >= 5 && !existingBadges.includes('certified_pro')) {
      await awardBadge(userId, 'CERTIFIED_PRO');
    }

    // Check streak badge
    if (user.streak_days >= 30 && !existingBadges.includes('streak_master')) {
      await awardBadge(userId, 'STREAK_MASTER');
    }

  } catch (error) {
    console.error('Error checking badges:', error);
  }
};

// Gamification Widget Component
export default function GamificationWidget({ user }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      const userAchievements = await base44.entities.Achievement.filter({ 
        user_id: user.id 
      }, "-unlocked_at");
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const level = calculateLevel(user?.xp_points || 0);
  const nextLevelXP = calculateNextLevelXP(level);
  const currentLevelXP = (level - 1) * 1000;
  const xpProgress = ((user?.xp_points - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const getRarityColor = (rarity) => {
    const colors = {
      'common': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'rare': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'epic': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'legendary': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return colors[rarity] || colors['common'];
  };

  return (
    <div className="space-y-4">
      {/* Level & XP Card */}
      <Card className="glass-card border-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Level {level}</h3>
                <p className="text-gray-400 text-sm">{user?.xp_points || 0} XP</p>
              </div>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Star className="w-3 h-3 mr-1" />
              {achievements.length} Badges
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Progress to Level {level + 1}</span>
              <span className="text-white font-medium">
                {user?.xp_points - currentLevelXP} / {nextLevelXP - currentLevelXP} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Recent Achievements</h3>
              <Badge className="bg-white/5 text-gray-400 border-0 text-xs">
                {achievements.length} earned
              </Badge>
            </div>

            <div className="space-y-2">
              {achievements.slice(0, 5).map((achievement, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg glass-card card-hover">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm">{achievement.title}</h4>
                    <p className="text-gray-400 text-xs">{achievement.description}</p>
                  </div>
                  <Badge className={`${getRarityColor(achievement.rarity)} text-xs flex-shrink-0`}>
                    {achievement.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{user?.streak_days || 0}</p>
            <p className="text-gray-400 text-xs">Day Streak</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{user?.completed_projects || 0}</p>
            <p className="text-gray-400 text-xs">Completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
