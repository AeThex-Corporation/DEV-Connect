
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdvancedModeration from "../components/AdvancedModeration";
import {
  Shield,
  Activity,
  Users,
  MessageSquare,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Search,
  Filter,
  Clock,
  Ban,
  Eye,
  Zap,
  TrendingUp,
  UserX,
  Flag,
  Calendar,
  Download,
  FileText,
  Settings,
  History,
  AlertCircle
} from "lucide-react";

export default function Moderation() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_flagged: 0,
    auto_removed: 0,
    pending_review: 0,
    approved_today: 0,
    total_actions: 0,
    avg_response_time: 0,
    repeat_offenders: 0,
    actions_this_week: 0
  });
  const [recentActions, setRecentActions] = useState([]);
  const [activeTab, setActiveTab] = useState("queue");
  const [timeRange, setTimeRange] = useState("week");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [analytics, setAnalytics] = useState({
    violationTypes: {},
    timeline: []
  });
  const [patternDetection, setPatternDetection] = useState({
    repeat_offenders: [],
    suspicious_patterns: [],
    escalation_needed: []
  });
  const [auditLog, setAuditLog] = useState([]);
  const [moderatorStats, setModeratorStats] = useState({});
  const [autoModSettings, setAutoModSettings] = useState({
    enabled: true,
    confidence_threshold: 95,
    auto_remove_critical: false,
    notify_on_flag: true,
    escalate_repeat_offenders: true
  });

  useEffect(() => {
    checkAccess();
    const interval = setInterval(loadStats, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [timeRange]);

  const checkAccess = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser.role !== 'admin') {
        setLoading(false);
        return;
      }

      await loadStats();
      await loadRecentActions();
      await loadAnalytics();
      // Initially load advanced analytics if the default tab is one that uses it, or load on demand.
      // For now, following the outline: load on demand via tab change.
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [flaggedPosts, flaggedReplies, actions, users] = await Promise.all([
        base44.entities.ForumPost.filter({ status: "flagged" }),
        base44.entities.ForumReply.filter({ flagged: true }),
        base44.entities.ModerationAction.list("-created_date", 100),
        base44.entities.User.list()
      ]);

      // Calculate date range
      const now = new Date();
      const rangeStart = new Date();
      if (timeRange === 'week') rangeStart.setDate(now.getDate() - 7);
      else if (timeRange === 'month') rangeStart.setMonth(now.getMonth() - 1);
      else if (timeRange === 'year') rangeStart.setFullYear(now.getFullYear() - 1);

      const recentActionsFiltered = actions.filter(a => new Date(a.created_date) >= rangeStart);
      
      // Calculate approved today
      const today = new Date().toDateString();
      const approvedToday = actions.filter(a => {
        const actionDate = new Date(a.created_date).toDateString();
        return actionDate === today && a.action_type === 'warning'; // Assuming 'warning' is an approval equivalent for stats
      }).length;

      // Calculate avg response time (hours between flag and action)
      let totalResponseTime = 0;
      let responseCount = 0;
      recentActionsFiltered.forEach(action => {
        if (action.content_id) {
          // Simplified - in real scenario, would calculate from flag time to action time
          totalResponseTime += 2; // Placeholder
          responseCount++;
        }
      });

      // Find repeat offenders (users with multiple violations)
      const userViolations = {};
      actions.forEach(action => {
        userViolations[action.user_id] = (userViolations[action.user_id] || 0) + 1;
      });
      const repeatOffenders = Object.values(userViolations).filter(count => count >= 3).length;

      setStats({
        total_flagged: flaggedPosts.length + flaggedReplies.length,
        auto_removed: recentActionsFiltered.filter(a => a.action_type === 'content_removal').length,
        pending_review: flaggedPosts.length + flaggedReplies.length,
        approved_today: approvedToday,
        total_actions: recentActionsFiltered.length,
        avg_response_time: responseCount > 0 ? (totalResponseTime / responseCount).toFixed(1) : 0,
        repeat_offenders: repeatOffenders,
        actions_this_week: recentActionsFiltered.length // This should be `recentActionsFiltered.length` not just `recentActions`
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentActions = async () => {
    try {
      const actions = await base44.entities.ModerationAction.list("-created_date", 10);
      setRecentActions(actions);
    } catch (error) {
      console.error('Error loading recent actions:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const actions = await base44.entities.ModerationAction.list("-created_date", 100);
      
      // Violation type distribution
      const violationTypes = {};
      actions.forEach(action => {
        violationTypes[action.violation_type] = (violationTypes[action.violation_type] || 0) + 1;
      });

      // Timeline data (last 10 days)
      const timeline = [];
      for (let i = 9; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayActions = actions.filter(a => 
          a.created_date.split('T')[0] === dateStr
        );

        timeline.push({
          date: dateStr,
          warnings: dayActions.filter(a => a.action_type === 'warning').length,
          suspensions: dayActions.filter(a => a.action_type === 'temporary_suspension').length,
          bans: dayActions.filter(a => a.action_type === 'permanent_ban').length,
          content_removed: dayActions.filter(a => a.action_type === 'content_removal').length
        });
      }

      setAnalytics({ violationTypes, timeline });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadAdvancedAnalytics = async () => {
    try {
      // Fetch a larger dataset for comprehensive analysis
      const [actions, users, posts, replies] = await Promise.all([
        base44.entities.ModerationAction.list("-created_date", 500),
        base44.entities.User.list(), // Fetching users might be needed to link user IDs to details
        // base44.entities.ForumPost.list(), // Potentially useful for content context
        // base44.entities.ForumReply.list() // Potentially useful for content context
      ]);

      // Pattern Detection: Repeat Offenders
      const userViolationsSummary = {};
      actions.forEach(action => {
        if (!userViolationsSummary[action.user_id]) {
          userViolationsSummary[action.user_id] = {
            count: 0,
            violations: [],
            last_action: null,
            escalating: false
          };
        }
        userViolationsSummary[action.user_id].count++;
        userViolationsSummary[action.user_id].violations.push(action);
        userViolationsSummary[action.user_id].last_action = action.created_date;
      });

      const repeatOffenders = Object.entries(userViolationsSummary)
        .filter(([_, data]) => data.count >= 3)
        .map(([userId, data]) => ({
          user_id: userId,
          violation_count: data.count,
          last_violation: data.last_action,
          violation_types: [...new Set(data.violations.map(v => v.violation_type))],
          escalating: data.count >= 5 // Example condition for escalation
        }))
        .sort((a, b) => b.violation_count - a.violation_count);

      // Pattern Detection: Suspicious Activity
      const suspiciousPatterns = [];
      Object.entries(userViolationsSummary).forEach(([userId, data]) => {
        // Multiple violations in short time (e.g., within 24 hours)
        const now = new Date();
        const recentViolations = data.violations.filter(v => 
          (now.getTime() - new Date(v.created_date).getTime()) < 24 * 60 * 60 * 1000
        );
        if (recentViolations.length >= 2) {
          suspiciousPatterns.push({
            user_id: userId,
            pattern: 'rapid_violations',
            count: recentViolations.length,
            severity: 'high'
          });
        }

        // Same violation type repeatedly
        const typeCount = {};
        data.violations.forEach(v => {
          typeCount[v.violation_type] = (typeCount[v.violation_type] || 0) + 1;
        });
        Object.entries(typeCount).forEach(([type, count]) => {
          if (count >= 3) {
            suspiciousPatterns.push({
              user_id: userId,
              pattern: 'repeated_violation_type',
              violation_type: type,
              count,
              severity: 'medium'
            });
          }
        });
      });

      setPatternDetection({
        repeat_offenders: repeatOffenders,
        suspicious_patterns: suspiciousPatterns,
        escalation_needed: repeatOffenders.filter(o => o.escalating)
      });

      // Moderator Activity Stats
      const modStats = {};
      actions.forEach(action => {
        // Only count actions if a moderator_id exists (i.e., not auto-moderated or system action)
        if (action.moderator_id) { 
          if (!modStats[action.moderator_id]) {
            modStats[action.moderator_id] = {
              total_actions: 0,
              action_types: {},
              avg_response_time: 0, // This needs more data, e.g., time from flag to action
              last_active: null
            };
          }
          modStats[action.moderator_id].total_actions++;
          modStats[action.moderator_id].action_types[action.action_type] = 
            (modStats[action.moderator_id].action_types[action.action_type] || 0) + 1;
          
          // Keep track of the most recent action for last_active
          const currentActionDate = new Date(action.created_date);
          if (!modStats[action.moderator_id].last_active || currentActionDate > new Date(modStats[action.moderator_id].last_active)) {
            modStats[action.moderator_id].last_active = action.created_date;
          }
        }
      });
      setModeratorStats(modStats);

      // Load audit log (recent 50 actions from the fetched list)
      const recentAudit = actions.slice(0, 50).map(action => ({
        ...action,
        type: 'moderation_action',
        description: `${action.action_type} applied to user ${action.user_id?.slice(-6) || 'N/A'}`
      }));
      setAuditLog(recentAudit);

    } catch (error) {
      console.error('Error loading advanced analytics:', error);
    }
  };

  const exportReport = async (reportType) => {
    try {
      let data = {};
      let filename = '';

      switch (reportType) {
        case 'actions':
          data = recentActions;
          filename = 'moderation_actions_report.json';
          break;
        case 'patterns':
          data = patternDetection;
          filename = 'pattern_detection_report.json';
          break;
        case 'audit':
          data = { auditLog: auditLog, moderatorStats: moderatorStats };
          filename = 'audit_log_report.json';
          break;
        default:
          console.warn('Unknown report type:', reportType);
          return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const updateAutoModSettings = async (newSettings) => {
    setAutoModSettings(newSettings);
    // In production, save to database or config via API call
    console.log('Auto-moderation settings updated:', newSettings);
    // alert('Auto-moderation settings updated'); // Removed alert for smoother UX
  };

  const getActionColor = (actionType) => {
    const colors = {
      'warning': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'temporary_suspension': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'content_removal': 'bg-red-500/20 text-red-400 border-red-500/30',
      'permanent_ban': 'bg-red-600/20 text-red-500 border-red-600/30',
      'approval': 'bg-green-500/20 text-green-400 border-green-500/30' // Added approval as a possible action type
    };
    return colors[actionType] || colors['warning'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Enhanced Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Moderation Center
              </h1>
              <p className="text-gray-400 text-sm">
                AI-powered content moderation • Real-time monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Activity className="w-3 h-3 mr-1" />
              System Active
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Auto-moderation: {autoModSettings.enabled ? 'ON' : 'OFF'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <Card className="glass-card border-0 col-span-1">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <TrendingUp className="w-3 h-3 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.total_flagged}</p>
              <p className="text-xs text-gray-400">Flagged</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 col-span-1">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <Clock className="w-3 h-3 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.pending_review}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 col-span-1">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <TrendingDown className="w-3 h-3 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.auto_removed}</p>
              <p className="text-xs text-gray-400">Auto-Removed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 col-span-1">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <Calendar className="w-3 h-3 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.approved_today}</p>
              <p className="text-xs text-gray-400">Today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 col-span-1">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <TrendingUp className="w-3 h-3 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.actions_this_week}</p>
              <p className="text-xs text-gray-400">This Week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 col-span-1">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <Activity className="w-3 h-3 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.avg_response_time}h</p>
              <p className="text-xs text-gray-400">Avg Time</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 col-span-1">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <UserX className="w-4 h-4 text-red-400" />
                <TrendingUp className="w-3 h-3 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.repeat_offenders}</p>
              <p className="text-xs text-gray-400">Repeat</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 col-span-1">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <Activity className="w-3 h-3 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.total_actions}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 glass-card border-0 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>

        <Badge className="bg-blue-500/20 text-blue-400 border-0">
          Showing data for: {timeRange}
        </Badge>
      </div>

      {/* Moderation Tabs */}
      <Tabs value={activeTab} onValueChange={(tab) => {
        setActiveTab(tab);
        if (tab === 'analytics' || tab === 'patterns' || tab === 'audit') {
          loadAdvancedAnalytics();
        }
      }} className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="queue">
            <Flag className="w-4 h-4 mr-2" />
            Queue ({stats.pending_review})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <AlertCircle className="w-4 h-4 mr-2" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="w-4 h-4 mr-2" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Moderation Queue */}
        <TabsContent value="queue">
          <AdvancedModeration 
            user={user}
            searchTerm={searchTerm}
            filterType={filterType}
            sortBy={sortBy}
            onRefresh={loadStats}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Violation Type Distribution */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Violation Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.violationTypes).length === 0 ? (
                    <p className="text-gray-400 text-sm">No violation data available for this period.</p>
                  ) : (
                    Object.entries(analytics.violationTypes).map(([type, count]) => {
                      const total = Object.values(analytics.violationTypes).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                      
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm capitalize">{type.replace(/_/g, ' ')}</span>
                            <Badge className="bg-white/5 text-gray-300 border-0">
                              {count} ({percentage}%)
                            </Badge>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Timeline */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Moderation Timeline (Last 10 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.timeline.length === 0 ? (
                    <p className="text-gray-400 text-sm">No timeline data available.</p>
                  ) : (
                    analytics.timeline.map((day, index) => (
                      <div key={index} className="glass-card rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white text-sm font-medium">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {day.warnings + day.suspensions + day.bans + day.content_removed} actions
                          </span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {day.warnings > 0 && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">
                              {day.warnings} warnings
                            </Badge>
                          )}
                          {day.suspensions > 0 && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">
                              {day.suspensions} suspensions
                            </Badge>
                          )}
                          {day.bans > 0 && (
                            <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                              {day.bans} bans
                            </Badge>
                          )}
                          {day.content_removed > 0 && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                              {day.content_removed} removed
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {stats.total_actions > 0 ? ((stats.approved_today / stats.total_actions) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-xs text-gray-400">Resolution Rate</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">Actions resolved successfully</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {stats.total_actions > 0 ? ((stats.auto_removed / stats.total_actions) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-xs text-gray-400">Auto-Moderation</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">Handled automatically</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.avg_response_time}h</p>
                      <p className="text-xs text-gray-400">Avg Response</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">Time to action</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* NEW: Pattern Detection Tab */}
        <TabsContent value="patterns">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Pattern Detection & Risk Analysis</h2>
              <Button
                onClick={() => exportReport('patterns')}
                size="sm"
                className="btn-primary text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Repeat Offenders */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserX className="w-5 h-5 text-red-400" />
                  Repeat Offenders ({patternDetection.repeat_offenders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patternDetection.repeat_offenders.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-white font-medium">No repeat offenders detected</p>
                    <p className="text-gray-400 text-sm">System is monitoring for patterns</p>
                  </div>
                ) : (
                  patternDetection.repeat_offenders.map((offender, i) => (
                    <Card key={i} className={`glass-card border-0 ${offender.escalating ? 'border-l-4 border-red-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-white font-semibold">User {offender.user_id?.slice(-8)}</span>
                              <Badge className="bg-red-500/20 text-red-400 border-0">
                                {offender.violation_count} violations
                              </Badge>
                              {offender.escalating && (
                                <Badge className="bg-orange-500/20 text-orange-400 border-0 animate-pulse">
                                  Escalation Needed
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {offender.violation_types.map(type => (
                                <Badge key={type} className="bg-purple-500/20 text-purple-400 border-0 text-xs capitalize">
                                  {type?.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-gray-400 text-sm">
                              Last violation: {offender.last_violation ? new Date(offender.last_violation).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            onClick={() => {
                              // Navigate to user management with this user
                              alert(`View detailed history for user ${offender.user_id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Suspicious Patterns */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Suspicious Activity Patterns ({patternDetection.suspicious_patterns.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patternDetection.suspicious_patterns.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-white font-medium">No suspicious patterns detected</p>
                    <p className="text-gray-400 text-sm">AI is monitoring user behavior</p>
                  </div>
                ) : (
                  patternDetection.suspicious_patterns.map((pattern, i) => (
                    <div key={i} className="glass-card rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            pattern.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            pattern.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          } border-0 capitalize`}>
                            {pattern.severity} Risk
                          </Badge>
                          <span className="text-white text-sm">User {pattern.user_id?.slice(-8)}</span>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                          {pattern.pattern?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {pattern.pattern === 'rapid_violations' 
                          ? `${pattern.count} violations in the last 24 hours`
                          : `${pattern.count} repeated ${pattern.violation_type} violations`}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Auto-Escalation Queue */}
            {patternDetection.escalation_needed.length > 0 && (
              <Card className="glass-card border-0 border-l-4 border-red-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-400" />
                    Auto-Escalation Required ({patternDetection.escalation_needed.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patternDetection.escalation_needed.map((user, i) => (
                      <div key={i} className="glass-card rounded-lg p-4 bg-red-500/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold mb-1">
                              User {user.user_id?.slice(-8)} - {user.violation_count} violations
                            </p>
                            <p className="text-red-400 text-sm">
                              Recommended Action: Temporary Suspension or Permanent Ban
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            Take Action
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users by ID or email..."
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>
                  <Button className="btn-primary text-white">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                <div className="glass-card rounded-lg p-6 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-white font-medium mb-2">User Management</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Search for users to view their moderation history and take actions
                  </p>
                  <Badge className="bg-blue-500/20 text-blue-400 border-0">
                    {stats.repeat_offenders} repeat offenders flagged
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEW: Audit Log Tab */}
        <TabsContent value="audit">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Moderation Audit Trail</h2>
              <Button
                onClick={() => exportReport('audit')}
                size="sm"
                className="btn-primary text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Log
              </Button>
            </div>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Recent Audit Entries</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {auditLog.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-white font-medium">No recent audit entries</p>
                      <p className="text-gray-400 text-sm">Moderation actions will appear here</p>
                    </div>
                  ) : (
                    auditLog.map((entry, i) => (
                      <div key={i} className="glass-card rounded-lg p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-blue-400" />
                              <span className="text-white font-medium text-sm">{entry.description}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>By: Moderator {entry.moderator_id?.slice(-6) || 'System/AI'}</span>
                              <span>•</span>
                              <span>{new Date(entry.created_date).toLocaleString()}</span>
                              <span>•</span>
                              <Badge className={`${getActionColor(entry.action_type)} border-0 text-xs`}>
                                {entry.action_type?.replace('_', ' ')}
                              </Badge>
                            </div>
                            {entry.reason && (
                              <p className="text-gray-400 text-sm mt-2">Reason: {entry.reason}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Moderator Activity Stats */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Moderator Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(moderatorStats).length === 0 ? (
                    <div className="text-center py-8 col-span-full">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-white font-medium">No moderator activity yet</p>
                      <p className="text-gray-400 text-sm">Stats will appear after manual moderation actions</p>
                    </div>
                  ) : (
                    Object.entries(moderatorStats).map(([modId, stats]) => (
                      <div key={modId} className="glass-card rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-medium">Moderator {modId?.slice(-6)}</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border-0">
                            {stats.total_actions} actions
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(stats.action_types).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between text-sm">
                              <span className="text-gray-400 capitalize">{type?.replace('_', ' ')}</span>
                              <span className="text-white">{count}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-gray-500 text-xs mt-3">
                          Last active: {stats.last_active ? new Date(stats.last_active).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ENHANCED: Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Auto-Moderation Settings</h2>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">AI Moderation Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">Enable Auto-Moderation</p>
                    <p className="text-gray-400 text-sm">Automatically flag content using AI</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoModSettings.enabled}
                      onChange={(e) => updateAutoModSettings({...autoModSettings, enabled: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="p-4 glass-card rounded-lg">
                  <div className="mb-3">
                    <p className="text-white font-medium mb-1">AI Confidence Threshold</p>
                    <p className="text-gray-400 text-sm mb-3">Minimum confidence for auto-action ({autoModSettings.confidence_threshold}%)</p>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="99"
                    value={autoModSettings.confidence_threshold}
                    onChange={(e) => updateAutoModSettings({...autoModSettings, confidence_threshold: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-400">70% (More flags)</span>
                    <span className="text-white font-bold">{autoModSettings.confidence_threshold}%</span>
                    <span className="text-gray-400">99% (Fewer flags)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">Auto-remove Critical Violations</p>
                    <p className="text-gray-400 text-sm">Automatically remove content with critical severity</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoModSettings.auto_remove_critical}
                      onChange={(e) => updateAutoModSettings({...autoModSettings, auto_remove_critical: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">Notify on Flagged Content</p>
                    <p className="text-gray-400 text-sm">Send notifications when content is flagged</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoModSettings.notify_on_flag}
                      onChange={(e) => updateAutoModSettings({...autoModSettings, notify_on_flag: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">Auto-Escalate Repeat Offenders</p>
                    <p className="text-gray-400 text-sm">Automatically flag users with multiple violations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoModSettings.escalate_repeat_offenders}
                      onChange={(e) => updateAutoModSettings({...autoModSettings, escalate_repeat_offenders: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Recent Actions (from original settings tab) */}
            <Card className="glass-card border-0 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Recent Moderation Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActions.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-white font-medium">No recent actions</p>
                    <p className="text-gray-400 text-sm">Actions will appear here as they are taken</p>
                  </div>
                ) : (
                  recentActions.slice(0, 5).map((action, i) => (
                    <div key={i} className="glass-card rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${getActionColor(action.action_type)} text-xs`}>
                              {action.action_type?.replace(/_/g, ' ')}
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                              {action.violation_type}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{action.reason}</p>
                        </div>
                        <span className="text-gray-500 text-xs whitespace-nowrap ml-4">
                          {new Date(action.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      {action.ai_confidence && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                          AI: {action.ai_confidence}% confident
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
