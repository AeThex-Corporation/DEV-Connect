
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare,
  Search,
  Plus,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Lock,
  Shield,
  Award,
  TrendingUp,
  Sparkles,
  Flag,
  CheckCircle,
  X // Added X icon for modal close button
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CommunityGamification from "@/components/CommunityGamification";
import AIForumTrendsAnalyzer from '../components/AIForumTrendsAnalyzer'; // Added AIForumTrendsAnalyzer import

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("reputation");
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    category: "Questions",
    title: "",
    content: "",
    tags: []
  });
  const [showTrendsAnalyzer, setShowTrendsAnalyzer] = useState(false); // Added state for AI Trends Analyzer

  const categories = ["Questions", "Showcases", "Best Practices", "Collaboration", "Job Discussion", "General"];

  useEffect(() => {
    loadData();
  }, [sortBy, selectedCategory]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      let allPosts = await base44.entities.ForumPost.list();

      // Filter by category
      if (selectedCategory !== "all") {
        allPosts = allPosts.filter(p => p.category === selectedCategory);
      }

      // Get ALL users at once (more efficient than individual queries)
      const allUsers = await base44.entities.User.list();
      const userMap = {};
      allUsers.forEach(u => {
        userMap[u.id] = u;
      });

      // Map posts with author info
      const postsWithReputation = allPosts.map(post => {
        const author = userMap[post.author_id];
        return {
          ...post,
          author_reputation: author?.forum_reputation || 0,
          author_name: author?.full_name || 'Unknown User'
        };
      });

      // Sort posts
      const sorted = sortPosts(postsWithReputation, sortBy);
      setPosts(sorted);
    } catch (error) {
      console.error('Error loading forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortPosts = (postsArray, sortMethod) => {
    const pinnedPosts = postsArray.filter(p => p.pinned);
    const regularPosts = postsArray.filter(p => !p.pinned);

    let sortedRegular = [...regularPosts];

    switch (sortMethod) {
      case "reputation":
        // Posts by high-reputation users appear first
        sortedRegular.sort((a, b) => (b.author_reputation || 0) - (a.author_reputation || 0));
        break;
      case "likes":
        sortedRegular.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case "recent":
        sortedRegular.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case "replies":
        sortedRegular.sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0));
        break;
      default:
        break;
    }

    return [...pinnedPosts, ...sortedRegular];
  };

  const awardForumPoints = async (userId, activityType, relatedId) => {
    const pointsMap = {
      forum_post: 10,
      forum_reply: 5,
      best_answer: 50,
      helpful_vote: 2
    };

    const points = pointsMap[activityType] || 0;
    if (points === 0) return; // No points for this activity type

    try {
      const users = await base44.entities.User.filter({ id: userId });
      if (users.length > 0) {
        const currentUserData = users[0];
        const currentPoints = currentUserData.community_points || 0;
        
        // Corrected: Use base44.entities.User.update for any user, not auth.updateMe
        await base44.entities.User.update(userId, { 
          community_points: currentPoints + points 
        });

        await base44.entities.CommunityContribution.create({
          user_id: userId,
          contribution_type: activityType,
          points_earned: points,
          related_entity_id: relatedId,
          related_entity_type: (activityType === 'forum_post' || activityType === 'helpful_vote') ? 'forum_post' : 'forum_reply'
        });

        // Check for badges
        if (activityType === 'best_answer') {
          const bestAnswersCount = (currentUserData.best_answers_count || 0) + 1; // Assuming best_answers_count is tracked on User
          
          await base44.entities.User.update(userId, { // Update best answers count on user
            best_answers_count: bestAnswersCount
          });

          if (bestAnswersCount >= 10) {
            const existingBadges = await base44.entities.CommunityBadge.filter({ 
              user_id: userId,
              badge_type: 'problem_solver'
            });

            if (existingBadges.length === 0) {
              await base44.entities.CommunityBadge.create({
                user_id: userId,
                badge_type: 'problem_solver',
                badge_tier: 'gold',
                title: 'Problem Solver',
                description: 'Provided 10 best answers',
                icon: '🎯',
                perks: ['Featured on forum', 'Priority answers'],
                rarity: 'rare',
                earned_date: new Date().toISOString()
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error awarding forum points:', error);
    }
  };


  const handleVote = async (postId, voteType) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post || !user) return; // Ensure user is logged in to vote

      const hasUpvoted = post.liked_by?.includes(user.id);
      let updatedLikes = post.likes || 0;
      let updatedLikedBy = [...(post.liked_by || [])];
      let reputationChange = 0;

      if (voteType === 'up') {
        if (hasUpvoted) {
          // Remove upvote
          updatedLikes = Math.max(0, updatedLikes - 1);
          updatedLikedBy = updatedLikedBy.filter(id => id !== user.id);
          reputationChange = -5; // Remove reputation if undoing upvote
        } else {
          // Add upvote
          updatedLikes = updatedLikes + 1;
          updatedLikedBy.push(user.id);
          reputationChange = 5; // Add reputation for upvote
          await awardForumPoints(user.id, 'helpful_vote', postId); // Award points to voter for helpful vote
        }
      } else if (voteType === 'down') {
        if (hasUpvoted) {
          // Remove existing upvote first, then apply downvote
          updatedLikes = Math.max(0, updatedLikes - 2); // -1 for undoing upvote, -1 for downvote
          updatedLikedBy = updatedLikedBy.filter(id => id !== user.id);
          reputationChange = -8; // -5 for undoing upvote, -3 for downvote
        } else {
          // Just downvote
          updatedLikes = Math.max(0, updatedLikes - 1);
          reputationChange = -3; // Deduct reputation for downvote
        }
      }

      await base44.entities.ForumPost.update(postId, {
        likes: updatedLikes,
        liked_by: updatedLikedBy
      });

      // Award/deduct reputation for the post author
      if (reputationChange !== 0) {
        await awardReputation(post.author_id, reputationChange,
          voteType === 'up' ? 'post_upvoted' : 'post_downvoted');
      }

      loadData();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handlePinPost = async (postId) => {
    if (user?.role !== 'admin') return;

    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        await base44.entities.ForumPost.update(postId, {
          pinned: !post.pinned
        });
        loadData();
      }
    } catch (error) {
      console.error('Error pinning post:', error);
    }
  };

  const handleFlagPost = async (postId, reason) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      // Skip AI analysis to avoid rate limits - just flag it
      await base44.entities.ForumPost.update(postId, {
        status: "flagged"
      });

      // Notify moderators
      const admins = await base44.entities.User.filter({ role: 'admin' });
      for (const admin of admins) {
        await base44.entities.Notification.create({
          user_id: admin.id,
          type: 'message',
          title: '🚩 Post Flagged for Review',
          message: `Post "${post.title}" has been flagged by a user.`,
          link: createPageUrl('Moderation')
        });
      }

      alert('Post has been flagged for moderator review');
      loadData();
    } catch (error) {
      console.error('Error flagging post:', error);
      alert('Failed to flag post.');
    }
  };

  const awardReputation = async (userId, points, reason) => {
    try {
      const users = await base44.entities.User.filter({ id: userId });
      const targetUser = users[0];
      if (!targetUser) return;

      const newReputation = Math.max(0, (targetUser.forum_reputation || 0) + points);
      
      await base44.entities.User.update(userId, {
        forum_reputation: newReputation
      });

      if (points > 0) {
        await base44.entities.Notification.create({
          user_id: userId,
          type: 'message',
          title: `+${points} Reputation!`,
          message: `You earned ${points} reputation points for ${reason.replace(/_/g, ' ')}`,
          link: createPageUrl('Forum')
        });
      }
    } catch (error) {
      console.error('Error awarding reputation:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) {
      alert('Please fill in title and content');
      return;
    }
    if (!user) {
      alert('You must be logged in to create a post.');
      return;
    }

    try {
      // Try AI moderation with timeout and error handling
      let shouldFlag = false;
      
      try {
        const moderationCheck = await Promise.race([
          base44.integrations.Core.InvokeLLM({
            prompt: `Check if this forum post violates community guidelines:
            
Title: ${newPost.title}
Content: ${newPost.content}
Category: ${newPost.category}

Check for: spam, harassment, inappropriate content, promotional content.
Determine if this should be auto-rejected.`,
            response_json_schema: {
              type: "object",
              properties: {
                is_violation: { type: "boolean" },
                violation_type: { type: "string" },
                severity: { type: "string" },
                should_reject: { type: "boolean" },
                reason: { type: "string" }
              }
            }
          }),
          // Timeout after 5 seconds
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI moderation timeout')), 5000)
          )
        ]);

        if (moderationCheck.should_reject) {
          alert(`Post rejected: ${moderationCheck.reason}`);
          return;
        }

        shouldFlag = moderationCheck.is_violation;
      } catch (aiError) {
        console.warn('AI moderation failed, posting without check:', aiError);
        // Continue without AI moderation if it fails, default to not flagging.
        // It's safer to post without AI moderation than to block a legitimate post due to AI service issues.
        shouldFlag = false; // explicitly set to false if AI fails or times out
      }

      const createdPost = await base44.entities.ForumPost.create({
        ...newPost,
        author_id: user.id,
        views: 0,
        replies_count: 0,
        likes: 0,
        liked_by: [],
        status: shouldFlag ? 'flagged' : 'active',
        created_date: new Date().toISOString()
      });

      // Award points for creating post
      await awardForumPoints(user.id, 'forum_post', createdPost.id);
      
      // Award reputation for creating post
      await awardReputation(user.id, 10, 'created_post');

      setNewPost({ category: "Questions", title: "", content: "", tags: [] });
      setShowNewPostDialog(false);
      loadData();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  // The outline also mentioned changes to handleReplySubmit and handleMarkBestAnswer.
  // These functions are not present in the current Forum component (which lists posts).
  // They would typically exist in a ForumPostDetail component.
  // Therefore, they are not implemented here to avoid adding functions not part of the initial file.

  const getReputationBadge = (reputation) => {
    if (reputation >= 1000) return { icon: '👑', text: 'Legend', color: 'bg-yellow-500/20 text-yellow-400' };
    if (reputation >= 500) return { icon: '🏆', text: 'Expert', color: 'bg-purple-500/20 text-purple-400' };
    if (reputation >= 250) return { icon: '⭐', text: 'Veteran', color: 'bg-blue-500/20 text-blue-400' };
    if (reputation >= 100) return { icon: '🎖️', text: 'Contributor', color: 'bg-green-500/20 text-green-400' };
    return { icon: '🌱', text: 'Newbie', color: 'bg-gray-500/20 text-gray-400' };
  };

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header with AI Trends Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Community Forum</h1>
          <p className="text-gray-400">Discuss, share, and learn with the community</p>
        </div>
        <div className="flex gap-2">
          {/* Existing Create Post Button */}
          <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
            <DialogTrigger asChild>
              <Button className="btn-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-0 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Create New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Category</label>
                  <Select value={newPost.category} onValueChange={(val) => setNewPost({...newPost, category: val})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    placeholder="What's your question or topic?"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    placeholder="Provide details, code examples, or context..."
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-48"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>Posts are automatically checked by AI for spam and inappropriate content</span>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowNewPostDialog(false)} className="glass-card border-0 text-white">
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePost} className="btn-primary text-white">
                    Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* NEW: AI Trends Analyzer Button */}
          {user?.role === 'admin' && (
            <Button
              onClick={() => setShowTrendsAnalyzer(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              AI Trends
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2">
          {/* Filters & Sort */}
          <Card className="glass-card border-0 mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <div className="flex items-center glass-card rounded-lg px-3 py-2">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <Input
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-0 text-white placeholder-gray-500 text-sm p-0 h-auto focus:ring-0"
                    />
                  </div>
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="glass-card border-0 text-white text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="glass-card border-0 text-white text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reputation">
                      <div className="flex items-center">
                        <Award className="w-3 h-3 mr-2" />
                        By Reputation
                      </div>
                    </SelectItem>
                    <SelectItem value="likes">
                      <div className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-2" />
                        Most Liked
                      </div>
                    </SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="replies">Most Replies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reputation Leaderboard Teaser */}
          <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Your Reputation: {user?.forum_reputation || 0}</p>
                    <p className="text-gray-400 text-xs">
                      {getReputationBadge(user?.forum_reputation || 0).text} • 
                      Earn points by posting helpful content and getting upvotes
                    </p>
                  </div>
                </div>
                <Badge className={getReputationBadge(user?.forum_reputation || 0).color}>
                  {getReputationBadge(user?.forum_reputation || 0).icon} {getReputationBadge(user?.forum_reputation || 0).text}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <Card className="glass-card border-0">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                  <p className="text-gray-400 mb-6">Be the first to start a discussion!</p>
                  <Button onClick={() => setShowNewPostDialog(true)} className="btn-primary text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => {
                const hasUpvoted = post.liked_by?.includes(user?.id);
                const repBadge = getReputationBadge(post.author_reputation);

                return (
                  <Card key={post.id} className={`glass-card border-0 card-hover ${post.pinned ? 'border-l-4 border-yellow-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Voting Column */}
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => handleVote(post.id, 'up')}
                            className={`p-2 rounded-lg transition-all ${
                              hasUpvoted
                                ? 'bg-green-500/20 text-green-400'
                                : 'glass-card text-gray-400 hover:text-green-400 hover:bg-green-500/10'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <span className="text-white font-bold text-lg">{post.likes || 0}</span>
                          <button
                            onClick={() => handleVote(post.id, 'down')}
                            className="p-2 rounded-lg glass-card text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Post Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {post.pinned && (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">
                                    <Pin className="w-3 h-3 mr-1" />
                                    Pinned
                                  </Badge>
                                )}
                                {post.best_answer_id && (
                                  <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Solved
                                  </Badge>
                                )}
                                <Badge className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                                  {post.category}
                                </Badge>
                                <Badge className={`${repBadge.color} border-0 text-xs`}>
                                  {repBadge.icon} {repBadge.text}
                                </Badge>
                              </div>

                              <h3 className="text-white font-semibold text-lg mb-2">{post.title}</h3>
                              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>By {post.author_name}</span>
                                <span>•</span>
                                <span>{post.author_reputation || 0} rep</span>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {post.views || 0} views
                                </div>
                                <span>•</span>
                                <div className="flex items-center">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  {post.replies_count || 0} replies
                                </div>
                                <span>•</span>
                                <span>{new Date(post.created_date).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 ml-4">
                              {user?.role === 'admin' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePinPost(post.id)}
                                  className="text-gray-400 hover:text-yellow-400"
                                >
                                  <Pin className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleFlagPost(post.id, 'spam')}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <Flag className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {post.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {post.tags.map((tag, i) => (
                                <Badge key={i} className="bg-white/5 text-gray-300 border-0 text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* NEW: Community Gamification Widget */}
          {user && (
            <CommunityGamification user={user} />
          )}

          {/* Example of other sidebar content (like Forum Stats, Categories) */}
          {/*
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Forum Stats</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>Total Posts: 1234</li>
                <li>Total Replies: 5678</li>
                <li>Active Users: 123</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Badge key={cat} variant="outline" className="glass-card text-white cursor-pointer hover:bg-white/10" onClick={() => setSelectedCategory(cat)}>
                    {cat}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          */}
        </div>
      </div>

      {/* NEW: AI Trends Analyzer Modal */}
      {showTrendsAnalyzer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                AI Forum Trends Analyzer
              </h2>
              <Button
                onClick={() => setShowTrendsAnalyzer(false)}
                variant="ghost"
                className="text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <AIForumTrendsAnalyzer />
          </div>
        </div>
      )}
    </div>
  );
}
