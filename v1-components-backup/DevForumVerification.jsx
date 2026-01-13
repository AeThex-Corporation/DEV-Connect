
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ExternalLink, Loader2, AlertCircle, MessageSquare, Award, TrendingUp, Star, Trophy, Sparkles } from 'lucide-react';

export default function DevForumVerification({ user, onVerified }) {
  const [verifying, setVerifying] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!username.trim()) {
      setError('Please enter your DevForum username');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const result = await base44.functions.verifyDevForum(username.trim());

      if (result && result.success) {
        if (onVerified) {
          onVerified();
        }
      } else {
        setError(result?.message || 'Verification failed');
      }
    } catch (err) {
      console.error('DevForum verification error:', err);
      setError('Failed to verify DevForum account. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const getTrustLevelBadge = (trustLevel) => {
    const badges = {
      'Leader': { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Award },
      'Regular': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Star },
      'Member': { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
      'Basic User': { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: MessageSquare },
      'New User': { color: 'bg-gray-600/20 text-gray-500 border-gray-600/30', icon: MessageSquare }
    };
    return badges[trustLevel] || badges['New User'];
  };

  if (user?.devforum_verified) {
    const badgeStyle = getTrustLevelBadge(user.devforum_trust_level);
    const BadgeIcon = badgeStyle.icon;

    return (
      <div className="space-y-4">
        <div className="glass-card rounded-lg p-4 bg-green-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-semibold">@{user.devforum_username}</p>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <Badge className={`${badgeStyle.color} text-xs`}>
                <BadgeIcon className="w-3 h-3 mr-1" />
                {user.devforum_trust_level}
              </Badge>
            </div>
          </div>

          {/* DevForum Stats */}
          {user.devforum_data && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center glass-card rounded p-2">
                <p className="text-xs text-gray-400">Posts</p>
                <p className="text-white font-semibold">{user.devforum_data.post_count?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center glass-card rounded p-2">
                <p className="text-xs text-gray-400">Likes</p>
                <p className="text-white font-semibold">{user.devforum_data.likes_received?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center glass-card rounded p-2">
                <p className="text-xs text-gray-400">Solutions</p>
                <p className="text-white font-semibold">{user.devforum_data.solutions || 0}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="glass-card border-0 text-white hover:bg-white/5 flex-1"
              asChild
            >
              <a href={user.devforum_data?.profile_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-2" />
                View DevForum Profile
              </a>
            </Button>
          </div>
        </div>

        {/* DevForum Benefits */}
        <div className="glass-card rounded-lg p-4 bg-blue-500/5">
          <p className="text-blue-400 text-sm flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            DevForum Verified Benefits
          </p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Enhanced credibility badge on profile</li>
            <li>• Priority in developer search results</li>
            <li>• Showcase your community contributions</li>
            {user.devforum_trust_level === 'Regular' || user.devforum_trust_level === 'Leader' ? (
              <li>• <span className="text-green-400">Premium tier perks unlocked!</span></li>
            ) : null}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-3">
          Verify your Roblox DevForum account to showcase your community contributions and trust level.
        </p>
        
        <div className="space-y-3">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              DevForum Username
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="YourDevForumUsername"
              className="bg-white/5 border-white/20 text-white"
              disabled={verifying}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleVerify}
            disabled={verifying || !username.trim()}
            className="w-full btn-primary text-white"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify DevForum Account
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-lg p-4 bg-blue-500/5">
        <p className="text-blue-400 text-sm font-medium mb-2">Why verify DevForum?</p>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>• Showcase your community trust level</li>
          <li>• Display post count and solutions</li>
          <li>• Enhanced profile credibility</li>
          <li>• Regular/Leader ranks get extra perks</li>
        </ul>
      </div>
    </div>
  );
}
