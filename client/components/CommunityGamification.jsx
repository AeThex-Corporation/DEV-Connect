import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Award,
  TrendingUp,
  Zap,
  Crown,
  Flame,
  Target
} from "lucide-react";

export default function CommunityGamification({ user }) {
  const [communityBadges, setCommunityBadges] = useState([]);
  const [recentContributions, setRecentContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    try {
      const [badges, contributions] = await Promise.all([
        base44.entities.CommunityBadge.filter({ user_id: user.id }),
        base44.entities.CommunityContribution.filter(
          { user_id: user.id },
          '-created_date',
          5
        )
      ]);

      setCommunityBadges(badges);
      setRecentContributions(contributions);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankInfo = (points) => {
    if (points >= 10000) return { rank: 'Legend', color: 'from-yellow-500 to-orange-500', nextRank: null, nextPoints: null, progress: 100 };
    if (points >= 5000) return { rank: 'Mentor', color: 'from-purple-500 to-pink-500', nextRank: 'Legend', nextPoints: 10000, progress: ((points - 5000) / 5000) * 100 };
    if (points >= 2500) return { rank: 'Expert', color: 'from-blue-500 to-indigo-500', nextRank: 'Mentor', nextPoints: 5000, progress: ((points - 2500) / 2500) * 100 };
    if (points >= 1000) return { rank: 'Trusted Member', color: 'from-green-500 to-teal-500', nextRank: 'Expert', nextPoints: 2500, progress: ((points - 1000) / 1500) * 100 };
    if (points >= 500) return { rank: 'Active Member', color: 'from-cyan-500 to-blue-500', nextRank: 'Trusted Member', nextPoints: 1000, progress: ((points - 500) / 500) * 100 };
    if (points >= 100) return { rank: 'Contributor', color: 'from-indigo-500 to-purple-500', nextRank: 'Active Member', nextPoints: 500, progress: ((points - 100) / 400) * 100 };
    return { rank: 'Newcomer', color: 'from-gray-500 to-gray-600', nextRank: 'Contributor', nextPoints: 100, progress: (points / 100) * 100 };
  };

  const getContributionIcon = (type) => {
    const icons = {
      forum_post: Star,
      forum_reply: Star,
      best_answer: Award,
      group_project: Target,
      helpful_vote: TrendingUp,
      resource_shared: Zap
    };
    return icons[type] || Star;
  };

  const getBadgeTierColor = (tier) => {
    const colors = {
      bronze: 'from-orange-600 to-orange-700',
      silver: 'from-gray-400 to-gray-500',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-cyan-400 to-blue-500',
      diamond: 'from-purple-400 to-pink-500'
    };
    return colors[tier] || colors.bronze;
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  const rankInfo = getRankInfo(user.community_points || 0);

  return (
    <div className="space-y-4">
      {/* Community Rank Card */}
      <Card className={`glass-card border-0 bg-gradient-to-br ${rankInfo.color} bg-opacity-10`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${rankInfo.color} rounded-xl flex items-center justify-center`}>
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-xs mb-1">Community Rank</p>
              <h3 className="text-white font-bold text-xl">{user.community_rank || rankInfo.rank}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-sm">
                  {user.community_points || 0} Points
                </span>
              </div>
            </div>
          </div>

          {rankInfo.nextRank && (
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-400">Next: {rankInfo.nextRank}</span>
                <span className="text-gray-400">
                  {rankInfo.nextPoints - (user.community_points || 0)} points to go
                </span>
              </div>
              <Progress value={rankInfo.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earned Badges */}
      {communityBadges.length > 0 && (
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Community Badges
              </h3>
              <Badge className="bg-purple-500/20 text-purple-300 border-0">
                {communityBadges.length}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {communityBadges.slice(0, 4).map((badge) => (
                <div
                  key={badge.id}
                  className="glass-card rounded-lg p-3 text-center card-hover"
                  title={badge.description}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${getBadgeTierColor(badge.badge_tier)} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                    <span className="text-2xl">{badge.icon || '🏆'}</span>
                  </div>
                  <p className="text-white font-medium text-xs mb-1">{badge.title}</p>
                  <Badge className={`bg-${badge.badge_tier === 'diamond' ? 'purple' : badge.badge_tier === 'platinum' ? 'blue' : badge.badge_tier === 'gold' ? 'yellow' : 'orange'}-500/20 text-${badge.badge_tier === 'diamond' ? 'purple' : badge.badge_tier === 'platinum' ? 'blue' : badge.badge_tier === 'gold' ? 'yellow' : 'orange'}-300 border-0 text-xs capitalize`}>
                    {badge.badge_tier}
                  </Badge>
                </div>
              ))}
            </div>

            {communityBadges.length > 4 && (
              <button
                onClick={() => window.location.href = createPageUrl('Profile')}
                className="text-indigo-400 hover:text-indigo-300 text-sm mt-3 w-full text-center"
              >
                View all {communityBadges.length} badges →
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Contributions */}
      {recentContributions.length > 0 && (
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Recent Contributions
            </h3>

            <div className="space-y-2">
              {recentContributions.map((contribution) => {
                const Icon = getContributionIcon(contribution.contribution_type);
                return (
                  <div key={contribution.id} className="flex items-center justify-between glass-card rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      <span className="text-gray-300 text-xs capitalize">
                        {contribution.contribution_type.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                      +{contribution.points_earned}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points Breakdown */}
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <h3 className="text-white font-semibold mb-4">Earn More Points</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Create forum post</span>
              <span className="text-green-400 font-semibold">+10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Reply to post</span>
              <span className="text-green-400 font-semibold">+5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Best answer</span>
              <span className="text-green-400 font-semibold">+50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Join group project</span>
              <span className="text-green-400 font-semibold">+25</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Share resource</span>
              <span className="text-green-400 font-semibold">+15</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}