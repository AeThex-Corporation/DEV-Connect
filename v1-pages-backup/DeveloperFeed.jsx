import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Newspaper,
  TrendingUp,
  Rocket,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Clock,
  Eye,
  ThumbsUp,
  Sparkles,
  Zap,
  Wrench
} from 'lucide-react';

export default function DeveloperFeed() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.fetchDevForumUpdates();
      if (result && result.success) {
        setUpdates(result.updates || []);
      }
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUpdates();
    setRefreshing(false);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Release': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Feature': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Deprecation': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Bug Fix': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Announcement': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'General': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[category] || colors['General'];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Release': Rocket,
      'Feature': Sparkles,
      'Deprecation': AlertCircle,
      'Bug Fix': Wrench,
      'Announcement': TrendingUp,
      'General': Newspaper
    };
    const Icon = icons[category] || Newspaper;
    return <Icon className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Developer Feed</h1>
                <p className="text-gray-400">Latest updates from Roblox & the community</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="glass-card border-0 text-white hover:bg-white/5"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 text-center">
                <Rocket className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {updates.filter(u => u.category === 'Release').length}
                </p>
                <p className="text-gray-400 text-xs">New Releases</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {updates.filter(u => u.category === 'Feature').length}
                </p>
                <p className="text-gray-400 text-xs">New Features</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{updates.length}</p>
                <p className="text-gray-400 text-xs">Total Updates</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="glass-card border-0 mb-6">
            <TabsTrigger value="all">
              All Updates
              <Badge className="ml-2 bg-white/10 text-white border-0">{updates.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="releases">Releases</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              </div>
            ) : updates.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No Updates Yet</h3>
                  <p className="text-gray-400 mb-4">Check back soon for the latest Roblox updates</p>
                  <Button onClick={handleRefresh} className="btn-primary text-white">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Feed
                  </Button>
                </CardContent>
              </Card>
            ) : (
              updates.map((update, index) => (
                <Card key={index} className="glass-card border-0 card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {update.image_url && (
                        <div className="hidden md:block w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                          <img 
                            src={update.image_url} 
                            alt={update.title}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`${getCategoryColor(update.category)} border flex items-center gap-1.5`}>
                              {getCategoryIcon(update.category)}
                              {update.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <Clock className="w-3 h-3" />
                              {formatDate(update.published_date)}
                            </div>
                          </div>
                        </div>

                        <h3 className="text-white font-bold text-lg mb-2 hover:text-indigo-400 transition-colors">
                          {update.title}
                        </h3>

                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                          {update.content}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{update.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{update.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{update.replies_count}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => window.open(update.url, '_blank')}
                            size="sm"
                            className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border-0"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Read More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="releases" className="space-y-4">
            {updates.filter(u => u.category === 'Release').map((update, index) => (
              <Card key={index} className="glass-card border-0 border-l-4 border-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-2">{update.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{update.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">{formatDate(update.published_date)}</span>
                        <Button
                          onClick={() => window.open(update.url, '_blank')}
                          size="sm"
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            {updates.filter(u => u.category === 'Feature').map((update, index) => (
              <Card key={index} className="glass-card border-0 border-l-4 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-2">{update.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{update.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">{formatDate(update.published_date)}</span>
                        <Button
                          onClick={() => window.open(update.url, '_blank')}
                          size="sm"
                          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            {updates.filter(u => u.category === 'Announcement').map((update, index) => (
              <Card key={index} className="glass-card border-0 border-l-4 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-2">{update.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{update.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">{formatDate(update.published_date)}</span>
                        <Button
                          onClick={() => window.open(update.url, '_blank')}
                          size="sm"
                          className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-0"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 mt-8">
          <CardContent className="p-8 text-center">
            <Zap className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Get the latest Roblox developer news and updates delivered to your feed
            </p>
            <Button 
              onClick={() => window.open('https://devforum.roblox.com/c/updates/45', '_blank')}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit DevForum
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}