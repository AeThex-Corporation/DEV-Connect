
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  TrendingUp,
  Users,
  Heart,
  RefreshCw,
  Loader2,
  Sparkles,
  Crown,
  Award,
  Zap,
  ChevronDown,
  ChevronUp,
  Eye,
  ThumbsUp, // NEW: Added ThumbsUp icon
  Gamepad2, // NEW: Added Gamepad2 icon
  Info // NEW: Added Info icon
} from "lucide-react";

export default function RobloxReputationCard({ user, onUpdate }) {
  const [calculating, setCalculating] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownData, setBreakdownData] = useState(null);

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      if (!user.roblox_user_id) {
        console.error('No Roblox user ID found');
        return;
      }
      
      const reputationData = await base44.functions.calculateRobloxReputation(user.roblox_user_id);
      
      if (reputationData) {
        await base44.entities.User.update(user.id, {
          roblox_reputation_score: reputationData.score,
          roblox_reputation_tier: reputationData.tier
        });
        
        setBreakdownData({
          score: reputationData.score,
          tier: reputationData.tier,
          stats: reputationData.stats,
          breakdown: {
            visits_score: Math.min(reputationData.stats.total_visits / 10000, 300),
            engagement_score: Math.min(reputationData.stats.total_favorites / 100, 200),
            like_ratio_score: 0,
            success_bonus: Math.min(reputationData.stats.game_count * 20, 100),
            active_score: 0
          }
        });
        
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error('Error calculating reputation:', error);
    } finally {
      setCalculating(false);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      'Legend': 'from-yellow-400 via-orange-500 to-red-500',
      'Diamond': 'from-cyan-400 via-blue-500 to-indigo-600',
      'Platinum': 'from-gray-300 via-gray-400 to-gray-500',
      'Gold': 'from-yellow-300 via-yellow-500 to-yellow-600',
      'Silver': 'from-gray-200 via-gray-300 to-gray-400',
      'Bronze': 'from-orange-400 via-orange-500 to-orange-600',
      'Unverified': 'from-gray-600 via-gray-700 to-gray-800'
    };
    return colors[tier] || colors['Unverified'];
  };

  const getTierIcon = (tier) => {
    const icons = {
      'Legend': Crown,
      'Diamond': Sparkles,
      'Platinum': Trophy,
      'Gold': Award,
      'Silver': Star,
      'Bronze': Zap,
      'Unverified': Users
    };
    return icons[tier] || Users;
  };

  if (!user?.roblox_verified) {
    return null;
  }

  const score = user.roblox_reputation_score || 0;
  const tier = user.roblox_reputation_tier || 'Unverified';
  const stats = user.roblox_stats_summary || {}; // Existing stats summary from user object
  const TierIcon = getTierIcon(tier);

  // Calculate next tier threshold
  const tierThresholds = {
    'Unverified': 50,
    'Bronze': 200,
    'Silver': 350,
    'Gold': 500,
    'Platinum': 650,
    'Diamond': 800,
    'Legend': 1000
  };
  const currentThreshold = tierThresholds[tier] || 0;
  const nextTier = Object.keys(tierThresholds).find(
    t => tierThresholds[t] > score
  );
  const nextThreshold = nextTier ? tierThresholds[nextTier] : 1000;
  const progressToNext = tier === 'Legend' ? 100 : 
    ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  // NEW: updatedStats will come from the breakdownData if a calculation has been made
  const updatedStats = breakdownData?.stats;

  return (
    <Card className={`glass-card border-0 overflow-hidden ${
      user.roblox_reputation_tier === 'Legend' ? 'border-2 border-yellow-400/50' :
      user.roblox_reputation_tier === 'Diamond' ? 'border-2 border-cyan-400/50' :
      user.roblox_reputation_tier === 'Platinum' ? 'border-2 border-gray-300/50' :
      user.roblox_reputation_tier === 'Gold' ? 'border-2 border-yellow-400/50' :
      ''
    }`}>
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getTierColor(tier)} opacity-10`}></div>
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <TierIcon className="w-6 h-6" />
            Roblox Reputation
          </CardTitle>
          <Button
            size="sm"
            onClick={handleCalculate}
            disabled={calculating}
            className="btn-primary text-white"
          >
            {calculating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Update
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reputation Score & Tier */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getTierColor(tier)} mb-3`}>
            <div className="w-20 h-20 rounded-full bg-[#0a0a0a] flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{score}</p>
                <p className="text-xs text-gray-400">/ 1000</p>
              </div>
            </div>
          </div>
          
          <Badge className={`bg-gradient-to-r ${getTierColor(tier)} text-white border-0 px-4 py-2 text-lg font-bold`}>
            {tier} Tier
          </Badge>
          
          {tier !== 'Legend' && nextTier && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Progress to {nextTier}</span>
                <span className="text-white font-medium">
                  {score} / {nextThreshold}
                </span>
              </div>
              <Progress value={progressToNext} className="h-2" />
            </div>
          )}
        </div>

        {/* Stats Overview - Refactored and consolidated */}
        {user.roblox_stats_summary && (
          <div>
            <p className="text-gray-400 text-sm mb-3">Game Statistics</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <p className="text-gray-400 text-xs">Total Visits</p>
                </div>
                <p className="text-white font-bold text-lg">
                  {user.roblox_stats_summary.total_visits >= 1000000
                    ? `${(user.roblox_stats_summary.total_visits / 1000000).toFixed(1)}M`
                    : user.roblox_stats_summary.total_visits >= 1000
                    ? `${(user.roblox_stats_summary.total_visits / 1000).toFixed(1)}K`
                    : user.roblox_stats_summary.total_visits.toLocaleString()}
                </p>
              </div>

              <div className="glass-card rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ThumbsUp className="w-4 h-4 text-green-400" />
                  <p className="text-gray-400 text-xs">Total Likes</p>
                </div>
                <p className="text-white font-bold text-lg">
                  {user.roblox_stats_summary.total_likes >= 1000000
                    ? `${(user.roblox_stats_summary.total_likes / 1000000).toFixed(1)}M`
                    : user.roblox_stats_summary.total_likes >= 1000
                    ? `${(user.roblox_stats_summary.total_likes / 1000).toFixed(1)}K`
                    : user.roblox_stats_summary.total_likes.toLocaleString()}
                </p>
              </div>

              <div className="glass-card rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Gamepad2 className="w-4 h-4 text-purple-400" />
                  <p className="text-gray-400 text-xs">Games</p>
                </div>
                <p className="text-white font-bold text-lg">
                  {user.roblox_stats_summary.total_games || 0}
                </p>
              </div>

              <div className="glass-card rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <p className="text-gray-400 text-xs">Successful</p>
                </div>
                <p className="text-white font-bold text-lg">
                  {user.roblox_stats_summary.successful_games_count || 0}
                </p>
              </div>
            </div>

            {/* NEW: Show contribution info if applicable */}
            {updatedStats && (updatedStats.owned_games !== updatedStats.total_games) && (
              <div className="mt-3 glass-card rounded-lg p-3 bg-blue-500/5">
                <p className="text-blue-400 text-xs mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Game Breakdown
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Owned/Group Games:</span>
                  <span className="text-white font-semibold">{updatedStats.owned_games}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-400">Contributed Games:</span>
                  <span className="text-white font-semibold">{updatedStats.contributed_games}</span>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  💡 Contributed games count at 50-70% weight based on your role and verification
                </p>
              </div>
            )}
          </div>
        )}

        {/* NEW: Score Breakdown Toggle */}
        {(breakdownData || stats.total_visits > 0) && (
          <div>
            <Button
              onClick={() => setShowBreakdown(!showBreakdown)}
              variant="outline"
              size="sm"
              className="w-full glass-card border-0 text-white hover:bg-white/5"
            >
              {showBreakdown ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Score Breakdown
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Score Breakdown
                </>
              )}
            </Button>

            {showBreakdown && breakdownData && (
              <div className="mt-3 space-y-2">
                <div className="glass-card rounded-lg p-3 bg-blue-500/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm">Visits Score</span>
                    <span className="text-blue-400 font-semibold">{breakdownData.breakdown.visits_score}/300</span>
                  </div>
                  <Progress value={(breakdownData.breakdown.visits_score / 300) * 100} className="h-1" />
                </div>

                <div className="glass-card rounded-lg p-3 bg-green-500/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm">Engagement Score</span>
                    <span className="text-green-400 font-semibold">{breakdownData.breakdown.engagement_score}/250</span>
                  </div>
                  <Progress value={(breakdownData.breakdown.engagement_score / 250) * 100} className="h-1" />
                </div>

                <div className="glass-card rounded-lg p-3 bg-purple-500/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm">Quality Score</span>
                    <span className="text-purple-400 font-semibold">{breakdownData.breakdown.like_ratio_score}/150</span>
                  </div>
                  <Progress value={(breakdownData.breakdown.like_ratio_score / 150) * 100} className="h-1" />
                </div>

                <div className="glass-card rounded-lg p-3 bg-yellow-500/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm">Success Bonus</span>
                    <span className="text-yellow-400 font-semibold">{breakdownData.breakdown.success_bonus}/200</span>
                  </div>
                  <Progress value={(breakdownData.breakdown.success_bonus / 200) * 100} className="h-1" />
                </div>

                <div className="glass-card rounded-lg p-3 bg-orange-500/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm">Activity Score</span>
                    <span className="text-orange-400 font-semibold">{breakdownData.breakdown.active_score}/100</span>
                  </div>
                  <Progress value={(breakdownData.breakdown.active_score / 100) * 100} className="h-1" />
                </div>
              </div>
            )}
          </div>
        )}

        {calculating && (
          <div className="glass-card rounded-lg p-4 bg-blue-500/5">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <div className="flex-1">
                <p className="text-blue-400 font-medium">Updating Reputation...</p>
                <p className="text-gray-400 text-xs mt-1">
                  Analyzing your games and portfolio contributions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {stats.last_updated && (
          <p className="text-gray-500 text-xs text-center">
            Last updated: {new Date(stats.last_updated).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
