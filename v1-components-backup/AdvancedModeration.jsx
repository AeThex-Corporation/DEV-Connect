
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Shield,
  AlertTriangle,
  Ban,
  Clock,
  XCircle,
  CheckCircle,
  TrendingDown,
  User,
  MessageSquare,
  Award,
  Search,
  X // Added X icon for quick remove
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Added Alert component

export default function AdvancedModeration({ user, onRefresh }) {
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [moderationActions, setModerationActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState({ open: false, content: null, analysis: null });
  const [actionForm, setActionForm] = useState({
    action_type: "warning",
    reason: "",
    duration_days: 0,
    points_deducted: 0
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [analyzingItem, setAnalyzingItem] = useState(null);

  // Internal state for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'post', 'reply'
  const [sortBy, setSortBy] = useState("date"); // 'date', 'severity', 'type'
  const [showManualReview, setShowManualReview] = useState(false); // New state for manual review

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [posts, replies, actions] = await Promise.all([
        base44.entities.ForumPost.filter({ status: "flagged" }),
        base44.entities.ForumReply.filter({ flagged: true }),
        base44.entities.ModerationAction.list("-created_date", 50)
      ]);

      const combined = [
        ...posts.map(p => ({ ...p, type: 'post' })),
        ...replies.map(r => ({ ...r, type: 'reply' }))
      ];

      setFlaggedContent(combined);
      setModerationActions(actions);
      setSelectedItems([]); // Clear selections on data refresh
    } catch (error) {
      console.error('Error loading moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeViolation = async (content, contentType) => {
    try {
      setAnalyzingItem(content.id); // Indicate that this item is being analyzed
      const text = contentType === 'post' ? `${content.title}\n\n${content.content}` : content.content;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this ${contentType} for policy violations. Content: "${text}"

Classify the violation type (spam, hate_speech, harassment, inappropriate_content, off_topic) and severity (low, medium, high, critical). 
Provide confidence score (0-100%) and recommend action (warning, temporary_suspension, content_removal, permanent_ban).`,
        response_json_schema: {
          type: "object",
          properties: {
            violation_type: {
              type: "string",
              enum: ["spam", "hate_speech", "harassment", "inappropriate_content", "off_topic", "multiple_violations"]
            },
            severity: {
              type: "string",
              enum: ["low", "medium", "high", "critical"]
            },
            confidence: { type: "number" },
            recommended_action: {
              type: "string",
              enum: ["warning", "temporary_suspension", "content_removal", "permanent_ban"]
            },
            explanation: { type: "string" },
            evidence: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return analysis;
    } catch (error) {
      console.error('Error analyzing violation:', error);
      return null;
    } finally {
      setAnalyzingItem(null); // Clear analyzing state
    }
  };

  const openActionModal = async (content, skipAI = false) => {
    let analysis = null;
    
    if (!skipAI) {
      analysis = await analyzeViolation(content, content.type);
    }
    
    setActionForm({
      action_type: analysis?.recommended_action || "warning",
      reason: analysis?.explanation || "",
      duration_days: analysis?.recommended_action === 'temporary_suspension' ? 7 : 0,
      points_deducted: getSuggestedPenalty(analysis?.severity || 'low')
    });

    setActionModal({ open: true, content, analysis });
  };

  const getSuggestedPenalty = (severity) => {
    const penalties = {
      'low': 10,
      'medium': 25,
      'high': 50,
      'critical': 100
    };
    return penalties[severity] || 10;
  };

  const executeModerationAction = async () => {
    try {
      const { content, analysis } = actionModal;

      // Create moderation action record
      await base44.entities.ModerationAction.create({
        user_id: content.author_id,
        moderator_id: user.id,
        action_type: actionForm.action_type,
        reason: actionForm.reason,
        violation_type: analysis?.violation_type || 'inappropriate_content', // Use analysis or default
        content_id: content.id,
        content_type: content.type === 'post' ? 'forum_post' : 'forum_reply',
        duration_days: actionForm.duration_days,
        points_deducted: actionForm.points_deducted,
        ai_confidence: analysis?.confidence || 0,
        expires_at: actionForm.duration_days > 0 
          ? new Date(Date.now() + actionForm.duration_days * 24 * 60 * 60 * 1000).toISOString()
          : null
      });

      // Update user reputation
      const targetUser = await base44.entities.User.list();
      const user_to_update = targetUser.find(u => u.id === content.author_id);
      if (user_to_update) {
        await base44.entities.User.update(content.author_id, {
          forum_reputation: Math.max(0, (user_to_update.forum_reputation || 0) - actionForm.points_deducted)
        });
      }

      // Handle content based on action
      if (actionForm.action_type === 'content_removal') {
        if (content.type === 'post') {
          await base44.entities.ForumPost.update(content.id, { status: 'archived' });
        } else {
          await base44.entities.ForumReply.delete(content.id);
        }
      } else {
        // Approve the content but record the warning
        if (content.type === 'post') {
          await base44.entities.ForumPost.update(content.id, { status: 'active' });
        } else {
          await base44.entities.ForumReply.update(content.id, { flagged: false });
        }
      }

      // Send notification to user
      const actionNames = {
        'warning': '⚠️ Warning Issued',
        'temporary_suspension': '🚫 Temporary Suspension',
        'content_removal': '🗑️ Content Removed',
        'permanent_ban': '⛔ Account Banned'
      };

      await base44.entities.Notification.create({
        user_id: content.author_id,
        type: 'message',
        title: actionNames[actionForm.action_type],
        message: `Moderation action taken: ${actionForm.reason}. ${actionForm.points_deducted} reputation points deducted.`,
        link: '/forum'
      });

      setActionModal({ open: false, content: null, analysis: null });
      loadData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error executing moderation action:', error);
      alert('Failed to execute moderation action');
    }
  };

  const handleBulkAction = async (actionType) => {
    if (selectedItems.length === 0) {
      alert('No items selected');
      return;
    }

    if (!confirm(`Apply "${actionType.replace(/_/g, ' ')}" to ${selectedItems.length} selected items?`)) {
      return;
    }

    try {
      setLoading(true); // Show loading during bulk operation
      for (const itemId of selectedItems) {
        const item = flaggedContent.find(c => c.id === itemId);
        if (!item) continue;

        // Perform analysis for each item, but it's not strictly necessary for simple bulk actions
        // Keeping it for consistency with single action analysis, though it adds overhead
        const analysis = await analyzeViolation(item, item.type);

        await base44.entities.ModerationAction.create({
          user_id: item.author_id,
          moderator_id: user.id,
          action_type: actionType,
          reason: `Bulk action: ${actionType.replace(/_/g, ' ')}`,
          violation_type: analysis?.violation_type || 'multiple_violations', // Default if analysis isn't perfect
          content_id: item.id,
          content_type: item.type === 'post' ? 'forum_post' : 'forum_reply',
          duration_days: actionType === 'temporary_suspension' ? 7 : 0, // Default duration for suspension
          points_deducted: getSuggestedPenalty(analysis?.severity), // Use suggested penalty from analysis, default 10
          ai_confidence: analysis?.confidence || 0
        });

        // Update user reputation (added this to bulk action based on single action logic)
        const targetUser = await base44.entities.User.list();
        const user_to_update = targetUser.find(u => u.id === item.author_id);
        if (user_to_update) {
          await base44.entities.User.update(item.author_id, {
            forum_reputation: Math.max(0, (user_to_update.forum_reputation || 0) - getSuggestedPenalty(analysis?.severity))
          });
        }

        if (actionType === 'content_removal') {
          if (item.type === 'post') {
            await base44.entities.ForumPost.update(item.id, { status: 'archived' });
          } else {
            await base44.entities.ForumReply.delete(item.id);
          }
        } else {
          // If not content removal, mark content as active/unflagged
          if (item.type === 'post') {
            await base44.entities.ForumPost.update(item.id, { status: 'active' });
          } else {
            await base44.entities.ForumReply.update(item.id, { flagged: false });
          }
        }

        // Send notification to user (added this to bulk action based on single action logic)
        const actionNames = {
          'warning': '⚠️ Warning Issued (Bulk Action)',
          'temporary_suspension': '🚫 Temporary Suspension (Bulk Action)',
          'content_removal': '🗑️ Content Removed (Bulk Action)',
          'permanent_ban': '⛔ Account Banned (Bulk Action)'
        };
        await base44.entities.Notification.create({
          user_id: item.author_id,
          type: 'message',
          title: actionNames[actionType],
          message: `Bulk moderation action taken: ${actionType.replace(/_/g, ' ')}. ${getSuggestedPenalty(analysis?.severity)} reputation points deducted.`,
          link: '/forum'
        });
      }

      setSelectedItems([]);
      setShowBulkActions(false);
      await loadData(); // Reload data after all bulk actions
      if (onRefresh) onRefresh();

      alert(`Bulk action completed for ${selectedItems.length} items`);
    } catch (error) {
      console.error('Error executing bulk action:', error);
      alert('Failed to execute bulk action');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAll = () => {
    setSelectedItems(filteredContent.map(c => c.id));
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  // NEW: Quick approve function
  const quickApprove = async (content) => {
    if (!confirm(`Approve this ${content.type}? It will be marked as safe and unflagged.`)) {
      return;
    }

    try {
      if (content.type === 'post') {
        await base44.entities.ForumPost.update(content.id, { status: 'active' });
      } else {
        await base44.entities.ForumReply.update(content.id, { flagged: false });
      }

      // Log the manual approval (as a warning with 0 penalty and reason)
      await base44.entities.ModerationAction.create({
        user_id: content.author_id,
        moderator_id: user.id,
        action_type: 'warning', // Log as a 'warning' action for consistency, but with 0 penalty
        reason: 'Manually approved - no violation found',
        violation_type: 'none', // Indicate no actual violation
        content_id: content.id,
        content_type: content.type === 'post' ? 'forum_post' : 'forum_reply',
        duration_days: 0,
        points_deducted: 0,
        ai_confidence: 0
      });

      await base44.entities.Notification.create({
        user_id: content.author_id,
        type: 'message',
        title: '✅ Content Approved',
        message: 'Your content has been reviewed and approved by a moderator.',
        link: '/forum'
      });

      loadData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error approving content:', error);
      alert('Failed to approve content');
    }
  };

  // NEW: Quick remove function
  const quickRemove = async (content) => {
    const reason = prompt(`Why are you removing this ${content.type}? (Required)`);
    if (!reason) return;

    try {
      // Remove content
      if (content.type === 'post') {
        await base44.entities.ForumPost.update(content.id, { status: 'archived' });
      } else {
        await base44.entities.ForumReply.delete(content.id);
      }

      // Log the action
      await base44.entities.ModerationAction.create({
        user_id: content.author_id,
        moderator_id: user.id,
        action_type: 'content_removal',
        reason: `Manual removal: ${reason}`,
        violation_type: 'multiple_violations', // Default for manual without AI analysis
        content_id: content.id,
        content_type: content.type === 'post' ? 'forum_post' : 'forum_reply',
        duration_days: 0,
        points_deducted: 25, // Default penalty for quick remove
        ai_confidence: 0
      });

      // Update user reputation
      const targetUserList = await base44.entities.User.list();
      const user_to_update = targetUserList.find(u => u.id === content.author_id);
      if (user_to_update) {
        await base44.entities.User.update(content.author_id, {
          forum_reputation: Math.max(0, (user_to_update.forum_reputation || 0) - 25)
        });
      }

      await base44.entities.Notification.create({
        user_id: content.author_id,
        type: 'message',
        title: '🗑️ Content Removed',
        message: `Your content was removed by a moderator. Reason: ${reason}`,
        link: '/forum'
      });

      loadData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error removing content:', error);
      alert('Failed to remove content');
    }
  };

  // NEW: Quick warn function
  const quickWarn = async (content) => {
    const reason = prompt(`Warning reason for this ${content.type}? (Required)`);
    if (!reason) return;

    try {
      // Approve the content but issue warning
      if (content.type === 'post') {
        await base44.entities.ForumPost.update(content.id, { status: 'active' });
      } else {
        await base44.entities.ForumReply.update(content.id, { flagged: false });
      }

      await base44.entities.ModerationAction.create({
        user_id: content.author_id,
        moderator_id: user.id,
        action_type: 'warning',
        reason: `Manual warning: ${reason}`,
        violation_type: 'inappropriate_content', // Default for manual without AI analysis
        content_id: content.id,
        content_type: content.type === 'post' ? 'forum_post' : 'forum_reply',
        duration_days: 0,
        points_deducted: 10, // Default penalty for quick warn
        ai_confidence: 0
      });

      // Update user reputation
      const targetUserList = await base44.entities.User.list();
      const user_to_update = targetUserList.find(u => u.id === content.author_id);
      if (user_to_update) {
        await base44.entities.User.update(content.author_id, {
          forum_reputation: Math.max(0, (user_to_update.forum_reputation || 0) - 10)
        });
      }

      await base44.entities.Notification.create({
        user_id: content.author_id,
        type: 'message',
        title: '⚠️ Warning Issued',
        message: `You received a warning from a moderator. Reason: ${reason}. Your content is approved but please follow community guidelines.`,
        link: '/forum'
      });

      loadData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error issuing warning:', error);
      alert('Failed to issue warning');
    }
  };

  // Filter and sort content
  const filteredContent = flaggedContent
    .filter(item => {
      if (filterType === 'post' && item.type !== 'post') return false;
      if (filterType === 'reply' && item.type !== 'reply') return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const title = item.title?.toLowerCase() || '';
        const content = item.content?.toLowerCase() || '';
        return title.includes(searchLower) || content.includes(searchLower);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_date) - new Date(a.created_date);
      }
      // Assuming 'severity' and 'type' sorting would require AI analysis data already attached to flaggedContent items
      // For now, only 'date' is fully implemented as other data might not be present until analysis.
      // If AI analysis is pre-run, then severity and type can be accessed directly.
      // For this implementation, we'll stick to 'date' or no specific sort if not date.
      return 0; // No specific sort order for other types without pre-analysis
    });

  const getActionColor = (actionType) => {
    const colors = {
      'warning': 'bg-yellow-500/20 text-yellow-400',
      'temporary_suspension': 'bg-orange-500/20 text-orange-400',
      'content_removal': 'bg-red-500/20 text-red-400',
      'permanent_ban': 'bg-red-600/20 text-red-500',
      'none': 'bg-gray-500/20 text-gray-400', // For manual approval, no violation
    };
    return colors[actionType] || colors['warning'];
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
      {/* Search and Filters */}
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search flagged content..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 glass-card border-0 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="post">Posts Only</SelectItem>
                <SelectItem value="reply">Replies Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 glass-card border-0 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={loadData}
              variant="outline"
              size="sm"
              className="glass-card border-0 text-white hover:bg-white/5"
            >
              <Shield className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Selection Controls */}
          {filteredContent.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <Button
                  onClick={selectAll}
                  variant="outline"
                  size="sm"
                  className="glass-card border-0 text-white hover:bg-white/5"
                >
                  Select All
                </Button>
                <Button
                  onClick={deselectAll}
                  variant="outline"
                  size="sm"
                  className="glass-card border-0 text-white hover:bg-white/5"
                  disabled={selectedItems.length === 0}
                >
                  Deselect All
                </Button>
                {selectedItems.length > 0 && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-0">
                    {selectedItems.length} selected
                  </Badge>
                )}
              </div>

              <span className="text-gray-400 text-sm">
                {filteredContent.length} items in queue
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <Card className="glass-card border-0 bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">
                  Bulk Actions ({selectedItems.length} selected)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleBulkAction('warning')}
                  size="sm"
                  className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-0"
                >
                  Issue Warnings
                </Button>
                <Button
                  onClick={() => handleBulkAction('content_removal')}
                  size="sm"
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0"
                >
                  Remove Content
                </Button>
                <Button
                  onClick={() => handleBulkAction('temporary_suspension')}
                  size="sm"
                  className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-0"
                >
                  Suspend Users
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moderation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{flaggedContent.length}</p>
                <p className="text-xs text-gray-400">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{moderationActions.length}</p>
                <p className="text-xs text-gray-400">Actions Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Ban className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {moderationActions.filter(a => a.action_type === 'temporary_suspension').length}
                </p>
                <p className="text-xs text-gray-400">Active Suspensions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {moderationActions.reduce((sum, a) => sum + (a.points_deducted || 0), 0)}
                </p>
                <p className="text-xs text-gray-400">Rep Deducted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Content Queue */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Flagged Content Queue</span>
            <Badge className="bg-red-500/20 text-red-400 border-0">
              {filteredContent.length} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">All Clear!</h3>
              <p className="text-gray-400">No content currently flagged for review</p>
            </div>
          ) : (
            filteredContent.map((content) => (
              <Card 
                key={content.id} 
                className={`glass-card border-0 ${
                  content.type === 'post' ? 'border-l-4 border-red-500' : 'border-l-4 border-orange-500'
                } ${selectedItems.includes(content.id) ? 'bg-white/5' : ''}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(content.id)}
                      onChange={() => toggleSelectItem(content.id)}
                      className="mt-1 w-4 h-4 rounded text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {content.type === 'post' ? (
                          <MessageSquare className="w-4 h-4 text-red-400" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-orange-400" />
                        )}
                        <h3 className="text-white font-semibold">
                          {content.type === 'post' ? content.title : 'Reply'}
                        </h3>
                        <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                          FLAGGED
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{content.content}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>By User {content.author_id?.slice(-6)}</span>
                        <span>•</span>
                        <span>{new Date(content.created_date).toLocaleDateString()}</span>
                        {content.flag_reason && (
                          <>
                            <span>•</span>
                            <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">
                              {content.flag_reason}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    {/* NEW: Quick Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => quickApprove(content)}
                        size="sm"
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0"
                      >
                        <CheckCircle className="w-3 h-3 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => quickWarn(content)}
                        size="sm"
                        className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-0"
                      >
                        <AlertTriangle className="w-3 h-3 mr-2" />
                        Warn
                      </Button>
                      <Button
                        onClick={() => quickRemove(content)}
                        size="sm"
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0"
                      >
                        <X className="w-3 h-3 mr-2" />
                        Remove
                      </Button>
                      <Button
                        onClick={() => openActionModal(content, false)}
                        size="sm"
                        className="btn-primary text-white"
                        disabled={analyzingItem === content.id}
                      >
                        {analyzingItem === content.id ? (
                          <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        ) : (
                          <Shield className="w-3 h-3 mr-2" />
                        )}
                        {analyzingItem === content.id ? 'AI...' : 'AI Review'}
                      </Button>
                      <Button
                        onClick={() => openActionModal(content, true)}
                        size="sm"
                        variant="outline"
                        className="glass-card border-0 text-white hover:bg-white/5"
                      >
                        Manual
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Moderation Actions */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white">Recent Moderation Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {moderationActions.slice(0, 10).map((action) => (
            <div key={action.id} className="glass-card rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${getActionColor(action.action_type)} border-0 text-xs capitalize`}>
                      {action.action_type.replace('_', ' ')}
                    </Badge>
                    {action.points_deducted > 0 && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                        -{action.points_deducted} rep
                      </Badge>
                    )}
                    {action.ai_confidence && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                        AI: {action.ai_confidence}%
                      </Badge>
                    )}
                     {action.violation_type && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs capitalize">
                        {action.violation_type.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{action.reason}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>User {action.user_id?.slice(-6)}</span>
                    <span>•</span>
                    <span>By Moderator</span>
                    <span>•</span>
                    <span>{new Date(action.created_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Modal */}
      <Dialog open={actionModal.open} onOpenChange={(open) => setActionModal({ open, content: null, analysis: null })}>
        <DialogContent className="glass-card border-0 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Take Moderation Action</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {actionModal.analysis ? (
              <div className="glass-card rounded-lg p-4 bg-blue-500/5">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-blue-400" />
                  AI Analysis
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Violation Type</p>
                    <Badge className="bg-red-500/20 text-red-400 border-0 text-xs capitalize">
                      {actionModal.analysis.violation_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Severity</p>
                    <Badge className={`${getSeverityColor(actionModal.analysis.severity)} border-0 text-xs capitalize`}>
                      {actionModal.analysis.severity}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">AI Confidence</p>
                    <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                      {actionModal.analysis.confidence}%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Recommended</p>
                    <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs capitalize">
                      {actionModal.analysis.recommended_action.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{actionModal.analysis.explanation}</p>
              </div>
            ) : (
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <Shield className="w-4 h-4 text-blue-400" />
                <AlertDescription className="text-blue-300 text-sm">
                  Manual Review Mode - No AI analysis. Use your judgment to determine the appropriate action.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Action Type</label>
              <Select value={actionForm.action_type} onValueChange={(val) => setActionForm({...actionForm, action_type: val})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">⚠️ Warning</SelectItem>
                  <SelectItem value="temporary_suspension">🚫 Temporary Suspension</SelectItem>
                  <SelectItem value="content_removal">🗑️ Remove Content</SelectItem>
                  <SelectItem value="permanent_ban">⛔ Permanent Ban</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {actionForm.action_type === 'temporary_suspension' && (
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Duration (days)</label>
                <Select value={actionForm.duration_days.toString()} onValueChange={(val) => setActionForm({...actionForm, duration_days: parseInt(val)})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Reputation Penalty</label>
              <Select value={actionForm.points_deducted.toString()} onValueChange={(val) => setActionForm({...actionForm, points_deducted: parseInt(val)})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No penalty</SelectItem>
                  <SelectItem value="10">-10 points (Minor)</SelectItem>
                  <SelectItem value="25">-25 points (Moderate)</SelectItem>
                  <SelectItem value="50">-50 points (Serious)</SelectItem>
                  <SelectItem value="100">-100 points (Severe)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Reason (sent to user)</label>
              <Textarea
                value={actionForm.reason}
                onChange={(e) => setActionForm({...actionForm, reason: e.target.value})}
                placeholder="Explain the violation and action taken..."
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-24"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setActionModal({ open: false, content: null, analysis: null })}
              variant="outline"
              className="glass-card border-0 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={executeModerationAction}
              className="btn-primary text-white"
              disabled={!actionForm.reason}
            >
              Execute Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
