import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  TrendingUp, 
  Eye, 
  ThumbsUp, 
  Star,
  CheckCircle
} from "lucide-react";

// Format large numbers for display
function formatRobloxNumber(num) {
  if (!num || num === 0) return '0';
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

export default function GameStatsRefresher({ portfolioItem, onUpdated }) {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(portfolioItem.stats_last_updated);
  const [stats, setStats] = useState(portfolioItem.game_stats || { visits: 0, likes: 0, favorites: 0 });

  const handleRefresh = async () => {
    if (!portfolioItem.game_link) {
      alert('No game link provided');
      return;
    }

    setRefreshing(true);
    try {
      const universeIdMatch = portfolioItem.game_link?.match(/games\/(\d+)/);
      const universeId = universeIdMatch ? universeIdMatch[1] : null;
      
      if (!universeId) {
        alert('Could not extract game ID from link');
        setRefreshing(false);
        return;
      }
      
      const response = await base44.functions.fetchRobloxGameStats(universeId);
      
      if (response.success && response.stats) {
        const gameData = response.stats;
        const newStats = {
          visits: gameData.visits || 0,
          likes: gameData.upVotes || 0,
          favorites: gameData.favoritedCount || 0,
          playing: gameData.playing || 0,
          dislikes: gameData.downVotes || 0
        };

        const updateData = {
          game_stats: newStats,
          stats_last_updated: new Date().toISOString(),
          title: gameData.name || portfolioItem.title,
          description: gameData.description || portfolioItem.description
        };

        await base44.entities.Portfolio.update(portfolioItem.id, updateData);

        setStats(newStats);
        setLastUpdated(new Date().toISOString());

        if (onUpdated) {
          onUpdated(newStats);
        }

        await base44.entities.Notification.create({
          user_id: portfolioItem.user_id,
          type: 'message',
          title: '📊 Game Stats Updated!',
          message: `Updated statistics for ${gameData.name || portfolioItem.title}`,
          link: `/profile?tab=portfolio`
        });

        alert('Game statistics updated successfully!');
      } else {
        alert(response.message || 'Failed to fetch game stats. Please try again.');
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
      alert('Error updating statistics. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Display */}
      {stats && (stats.visits > 0 || stats.likes > 0 || stats.favorites > 0) ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.visits > 0 && (
            <div className="glass-card rounded-lg p-3 text-center">
              <Eye className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{formatRobloxNumber(stats.visits)}</p>
              <p className="text-gray-400 text-xs">Visits</p>
            </div>
          )}

          {stats.likes > 0 && (
            <div className="glass-card rounded-lg p-3 text-center">
              <ThumbsUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{formatRobloxNumber(stats.likes)}</p>
              <p className="text-gray-400 text-xs">Likes</p>
            </div>
          )}

          {stats.favorites > 0 && (
            <div className="glass-card rounded-lg p-3 text-center">
              <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{formatRobloxNumber(stats.favorites)}</p>
              <p className="text-gray-400 text-xs">Favorites</p>
            </div>
          )}

          {stats.playing > 0 && (
            <div className="glass-card rounded-lg p-3 text-center">
              <TrendingUp className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{formatRobloxNumber(stats.playing)}</p>
              <p className="text-gray-400 text-xs">Playing Now</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center glass-card rounded-lg p-4">
          <p className="text-gray-400 text-sm">No game statistics available yet</p>
          <p className="text-gray-500 text-xs mt-1">Click refresh to fetch live stats from Roblox</p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          {lastUpdated ? (
            <p className="text-gray-500 text-xs flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-gray-500 text-xs">Stats never fetched</p>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          size="sm"
          className="btn-primary text-white"
        >
          {refreshing ? (
            <>
              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 mr-2" />
              Refresh Stats
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="glass-card rounded p-3 bg-blue-500/5">
        <p className="text-blue-400 text-xs">
          💡 Game statistics are fetched directly from Roblox. Refresh regularly to keep your portfolio up-to-date!
        </p>
      </div>
    </div>
  );
}