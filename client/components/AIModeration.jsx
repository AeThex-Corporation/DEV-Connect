import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Flag,
  Ban,
  MessageSquare,
  Trash2,
  Lock
} from "lucide-react";

export default function AIModeration({ user }) {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [flaggedReplies, setFlaggedReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadFlaggedContent();
  }, []);

  const loadFlaggedContent = async () => {
    try {
      const [posts, replies] = await Promise.all([
        base44.entities.ForumPost.filter({ status: "flagged" }),
        base44.entities.ForumReply.filter({ flagged: true })
      ]);

      setFlaggedPosts(posts);
      setFlaggedReplies(replies);
    } catch (error) {
      console.error('Error loading flagged content:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeContent = async (content, contentType) => {
    setAnalyzing(true);
    try {
      const prompt = `
You are an AI content moderator for a Roblox developer community forum. Analyze this ${contentType} for policy violations.

CONTENT TO ANALYZE:
"${content}"

MODERATION POLICIES:
1. SPAM: Repetitive content, excessive links, promotional spam
2. HATE SPEECH: Discriminatory language, harassment, threats
3. OFF-TOPIC: Content unrelated to Roblox development
4. INAPPROPRIATE: Adult content, violence, illegal activities
5. LOW QUALITY: Incoherent posts, meaningless content

PROVIDE ANALYSIS:
1. Is this content violating any policies?
2. What specific violations are present?
3. Severity level (low, medium, high, critical)
4. Confidence level (0-100%)
5. Recommended moderator action
6. Brief explanation for human moderator

Return structured analysis.
`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            is_violation: {
              type: "boolean"
            },
            violations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string"
                  },
                  severity: {
                    type: "string"
                  },
                  description: {
                    type: "string"
                  }
                }
              }
            },
            confidence: {
              type: "number"
            },
            recommended_action: {
              type: "string",
              enum: ["approve", "warn_author", "remove_content", "ban_user", "needs_review"]
            },
            moderator_summary: {
              type: "string"
            },
            auto_actionable: {
              type: "boolean"
            }
          }
        }
      });

      return analysis;
    } catch (error) {
      console.error('Error analyzing content:', error);
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const handleModeratePost = async (postId, action) => {
    try {
      if (action === 'approve') {
        await base44.entities.ForumPost.update(postId, {
          status: 'active'
        });
      } else if (action === 'remove') {
        await base44.entities.ForumPost.update(postId, {
          status: 'archived'
        });
      } else if (action === 'lock') {
        await base44.entities.ForumPost.update(postId, {
          locked: true,
          status: 'active'
        });
      }

      loadFlaggedContent();
    } catch (error) {
      console.error('Error moderating post:', error);
    }
  };

  const handleModerateReply = async (replyId, action) => {
    try {
      if (action === 'approve') {
        await base44.entities.ForumReply.update(replyId, {
          flagged: false,
          flag_reason: null
        });
      } else if (action === 'remove') {
        await base44.entities.ForumReply.delete(replyId);
      }

      loadFlaggedContent();
    } catch (error) {
      console.error('Error moderating reply:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'low': 'bg-yellow-500/20 text-yellow-400',
      'medium': 'bg-orange-500/20 text-orange-400',
      'high': 'bg-red-500/20 text-red-400',
      'critical': 'bg-red-600/20 text-red-500'
    };
    return colors[severity] || colors['low'];
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-0 bg-gradient-to-r from-red-500/10 to-orange-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-400" />
              <div>
                <h2 className="text-white font-semibold text-xl">AI Moderation Dashboard</h2>
                <p className="text-gray-400 text-sm">AI-powered content moderation and review</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-red-500/20 text-red-400 border-0">
                {flaggedPosts.length} Flagged Posts
              </Badge>
              <Badge className="bg-orange-500/20 text-orange-400 border-0">
                {flaggedReplies.length} Flagged Replies
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Queue */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="posts">
            <MessageSquare className="w-4 h-4 mr-2" />
            Flagged Posts ({flaggedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="replies">
            <MessageSquare className="w-4 h-4 mr-2" />
            Flagged Replies ({flaggedReplies.length})
          </TabsTrigger>
        </TabsList>

        {/* Flagged Posts */}
        <TabsContent value="posts" className="space-y-4">
          {flaggedPosts.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">All Clear!</h3>
                <p className="text-gray-400">No posts currently flagged for review</p>
              </CardContent>
            </Card>
          ) : (
            flaggedPosts.map((post) => (
              <Card key={post.id} className="glass-card border-0 border-l-4 border-red-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="text-white font-semibold text-lg">{post.title}</h3>
                        <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                          FLAGGED
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-3">{post.content}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Posted by User {post.author_id?.slice(-6)}</span>
                        <span>•</span>
                        <span>Category: {post.category}</span>
                        <span>•</span>
                        <span>{new Date(post.created_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Button */}
                  {analyzing ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mr-2"></div>
                      <span className="text-gray-400 text-sm">Analyzing content...</span>
                    </div>
                  ) : (
                    <Button
                      onClick={async () => {
                        const analysis = await analyzeContent(post.content, 'post');
                        if (analysis) {
                          // Show analysis results (could be a modal or expand section)
                          alert(`AI Analysis:\n\nViolation: ${analysis.is_violation}\nConfidence: ${analysis.confidence}%\nAction: ${analysis.recommended_action}\n\nSummary: ${analysis.moderator_summary}`);
                        }
                      }}
                      size="sm"
                      className="glass-card border-0 text-white hover:bg-white/5 mb-3"
                    >
                      <Shield className="w-3 h-3 mr-2" />
                      Run AI Analysis
                    </Button>
                  )}

                  {/* Moderation Actions */}
                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <Button
                      onClick={() => handleModeratePost(post.id, 'approve')}
                      size="sm"
                      className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleModeratePost(post.id, 'lock')}
                      size="sm"
                      className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-0"
                    >
                      <Lock className="w-3 h-3 mr-1" />
                      Lock
                    </Button>
                    <Button
                      onClick={() => handleModeratePost(post.id, 'remove')}
                      size="sm"
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Full Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Flagged Replies */}
        <TabsContent value="replies" className="space-y-4">
          {flaggedReplies.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">All Clear!</h3>
                <p className="text-gray-400">No replies currently flagged for review</p>
              </CardContent>
            </Card>
          ) : (
            flaggedReplies.map((reply) => (
              <Card key={reply.id} className="glass-card border-0 border-l-4 border-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Flag className="w-5 h-5 text-orange-400" />
                        <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">
                          FLAGGED REPLY
                        </Badge>
                        {reply.flag_reason && (
                          <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                            {reply.flag_reason}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{reply.content}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>By User {reply.author_id?.slice(-6)}</span>
                        <span>•</span>
                        <span>{new Date(reply.created_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Button */}
                  {analyzing ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mr-2"></div>
                      <span className="text-gray-400 text-sm">Analyzing content...</span>
                    </div>
                  ) : (
                    <Button
                      onClick={async () => {
                        const analysis = await analyzeContent(reply.content, 'reply');
                        if (analysis) {
                          alert(`AI Analysis:\n\nViolation: ${analysis.is_violation}\nConfidence: ${analysis.confidence}%\nAction: ${analysis.recommended_action}\n\nSummary: ${analysis.moderator_summary}`);
                        }
                      }}
                      size="sm"
                      className="glass-card border-0 text-white hover:bg-white/5 mb-3"
                    >
                      <Shield className="w-3 h-3 mr-2" />
                      Run AI Analysis
                    </Button>
                  )}

                  {/* Moderation Actions */}
                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <Button
                      onClick={() => handleModerateReply(reply.id, 'approve')}
                      size="sm"
                      className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleModerateReply(reply.id, 'remove')}
                      size="sm"
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}