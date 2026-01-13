
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageSquare,
  Video,
  Folder,
  TrendingUp,
  Star,
  Code,
  Lightbulb,
  ArrowRight,
  Trophy,
  Crown,
  Zap
} from "lucide-react";
import CommunityGamification from "../components/CommunityGamification";

export default function CommunityHub() {
  const [stats, setStats] = useState({
    groups: 0,
    forumPosts: 0,
    collabRooms: 0,
    activeUsers: 0
  });
  const [featuredGroups, setFeaturedGroups] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [activeCollabs, setActiveCollabs] = useState([]);
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [topContributors, setTopContributors] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load data sequentially to avoid rate limits
      const groups = await base44.entities.Group.list("-member_count", 10);
      
      // Small delay to avoid rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const posts = await base44.entities.ForumPost.list("-likes", 5);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const collabs = await base44.entities.CollabRoom.filter({ status: 'active' }, "-started_at", 5);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const portfolios = await base44.entities.Portfolio.filter({ featured: true }, "-created_date", 6);
      
      // Only fetch top contributors instead of all users
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const allUsers = await base44.entities.User.list("-community_points", 10);

      setFeaturedGroups(groups.filter(g => g.featured).slice(0, 3));
      setTrendingPosts(posts.slice(0, 5));
      setActiveCollabs(collabs);
      setShowcases(portfolios);

      // Get top community contributors from the limited user list
      const contributors = allUsers
        .filter(u => (u.community_points || 0) > 0)
        .sort((a, b) => (b.community_points || 0) - (a.community_points || 0))
        .slice(0, 10);
      setTopContributors(contributors);

      setStats({
        groups: groups.length,
        forumPosts: posts.length,
        collabRooms: collabs.length,
        activeUsers: groups.reduce((sum, g) => sum + (g.member_count || 0), 0)
      });
    } catch (error) {
      console.error('Error loading community data:', error);
      // Set empty state instead of crashing
      setStats({
        groups: 0,
        forumPosts: 0,
        collabRooms: 0,
        activeUsers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero Section */}
      <div className="glass-card rounded-2xl p-8 mb-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <h1 className="text-4xl font-bold text-white mb-3">
          Community & Collaboration Hub 🚀
        </h1>
        <p className="text-gray-300 text-lg mb-6">
          Connect, collaborate, and grow with the Roblox development community
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="glass-card rounded-lg p-4 text-center">
            <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.groups}</p>
            <p className="text-gray-400 text-sm">Active Groups</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <MessageSquare className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.forumPosts}</p>
            <p className="text-gray-400 text-sm">Forum Posts</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <Video className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.collabRooms}</p>
            <p className="text-gray-400 text-sm">Live Collabs</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
            <p className="text-gray-400 text-sm">Active Users</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card border-0 card-hover cursor-pointer" onClick={() => window.location.href = createPageUrl('Groups')}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Join Groups</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Connect with developers who share your interests and skills
                </p>
                <Button className="w-full btn-primary text-white">
                  Browse Groups
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 card-hover cursor-pointer" onClick={() => window.location.href = createPageUrl('Forum')}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Community Forum</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Ask questions, share knowledge, and discuss development topics
                </p>
                <Button className="w-full btn-primary text-white">
                  Visit Forum
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 card-hover cursor-pointer" onClick={() => window.location.href = createPageUrl('Collaboration')}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Collaborate Live</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Real-time collaboration with chat, whiteboard, and code sharing
                </p>
                <Button className="w-full btn-primary text-white">
                  Start Collaborating
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Featured Groups */}
          {featuredGroups.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  Featured Groups
                </h2>
                <Button
                  onClick={() => window.location.href = createPageUrl('Groups')}
                  variant="ghost"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredGroups.map((group) => (
                  <Card key={group.id} className="glass-card border-0 card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{group.name}</h3>
                          <p className="text-gray-400 text-xs">{group.member_count || 0} members</p>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{group.description}</p>
                      <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                        {group.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Trending Forum Posts */}
          {trendingPosts.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                  Trending Discussions
                </h2>
                <Button
                  onClick={() => window.location.href = createPageUrl('Forum')}
                  variant="ghost"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="space-y-3">
                {trendingPosts.map((post) => (
                  <Card key={post.id} className="glass-card border-0 card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-1">{post.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {post.replies_count || 0} replies
                            </span>
                            <span className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {post.likes || 0} likes
                            </span>
                            <Badge className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                              {post.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Community Leaderboard */}
          {topContributors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Top Contributors
                </h2>
                <Button
                  onClick={() => window.location.href = createPageUrl('Leaderboard')}
                  variant="ghost"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="space-y-3">
                {topContributors.slice(0, 5).map((contributor, index) => (
                  <Card key={contributor.id} className={`glass-card border-0 card-hover ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400/10 to-slate-400/10' :
                    index === 2 ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-10 h-10 glass-card rounded-full flex-shrink-0">
                          {index === 0 ? <Crown className="w-5 h-5 text-yellow-400" /> :
                           index === 1 ? <Star className="w-5 h-5 text-gray-400" /> :
                           index === 2 ? <Star className="w-5 h-5 text-orange-400" /> :
                           <span className="text-white font-bold text-sm">#{index + 1}</span>}
                        </div>

                        {/* Avatar */}
                        {contributor.avatar_url ? (
                          <img
                            src={contributor.avatar_url}
                            alt={contributor.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <a
                            href={`${createPageUrl('PublicProfile')}?id=${contributor.id}`}
                            className="text-white font-semibold hover:text-indigo-400 transition-colors"
                          >
                            {contributor.full_name}
                          </a>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                              {contributor.community_rank || 'Contributor'}
                            </Badge>
                            <span>•</span>
                            <span>{contributor.helpful_posts_count || 0} helpful posts</span>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 mb-1">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-xl font-bold text-white">
                              {contributor.community_points || 0}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">points</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Community Showcases */}
          {showcases.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                  Community Showcases
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {showcases.map((project) => (
                  <Card key={project.id} className="glass-card border-0 card-hover">
                    <CardContent className="p-0">
                      {project.images?.[0] && (
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-40 object-cover rounded-t-lg"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-2">{project.title}</h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>
                        <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                          {project.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Active Collaboration Rooms */}
          {activeCollabs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Video className="w-6 h-6 text-green-400" />
                  Active Collaboration Rooms
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCollabs.map((room) => (
                  <Card key={room.id} className="glass-card border-0 card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Video className="w-4 h-4 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium text-sm">{room.room_name}</h3>
                            <p className="text-gray-400 text-xs">{room.participant_ids?.length || 0} participants</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                          Live
                        </Badge>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                        {room.room_type}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Community Gamification Widget */}
          {user && <CommunityGamification user={user} />}
        </div>
      </div>
    </div>
  );
}
