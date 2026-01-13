import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  MessageSquare,
  Briefcase,
  Star,
  Users,
  Award,
  TrendingUp,
  Mail,
  Smartphone,
  Save
} from "lucide-react";

export default function NotificationSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    // In-App Notifications
    messages: true,
    applications: true,
    job_matches: true,
    collab_invites: true,
    forum_replies: true,
    achievements: true,
    level_ups: true,
    learning_milestones: true,
    mentorship_requests: true,
    reviews: true,
    
    // Email Notifications
    email_messages: false,
    email_applications: true,
    email_job_matches: true,
    email_weekly_digest: true,
    email_marketing: false,
    
    // Push Notifications (future)
    push_enabled: false
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser.notification_preferences) {
        setPreferences({
          ...preferences,
          ...currentUser.notification_preferences
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        notification_preferences: preferences
      });

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '✅ Settings Saved',
        message: 'Your notification preferences have been updated.',
        link: '/notification-settings'
      });

      alert('Notification preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Bell className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold gradient-text">Notification Settings</h1>
        </div>
        <p className="text-gray-400">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* In-App Notifications */}
      <Card className="glass-card border-0 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            In-App Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Direct Messages</p>
                <p className="text-gray-400 text-sm">New messages from other users</p>
              </div>
            </div>
            <Switch
              checked={preferences.messages}
              onCheckedChange={() => togglePreference('messages')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Job Applications</p>
                <p className="text-gray-400 text-sm">Application status updates</p>
              </div>
            </div>
            <Switch
              checked={preferences.applications}
              onCheckedChange={() => togglePreference('applications')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Job Matches</p>
                <p className="text-gray-400 text-sm">New jobs matching your skills</p>
              </div>
            </div>
            <Switch
              checked={preferences.job_matches}
              onCheckedChange={() => togglePreference('job_matches')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-pink-400" />
              <div>
                <p className="text-white font-medium">Collaboration Invites</p>
                <p className="text-gray-400 text-sm">Invitations to collab rooms</p>
              </div>
            </div>
            <Switch
              checked={preferences.collab_invites}
              onCheckedChange={() => togglePreference('collab_invites')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-white font-medium">Forum Replies</p>
                <p className="text-gray-400 text-sm">Replies to your forum posts</p>
              </div>
            </div>
            <Switch
              checked={preferences.forum_replies}
              onCheckedChange={() => togglePreference('forum_replies')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-white font-medium">Achievements & Badges</p>
                <p className="text-gray-400 text-sm">When you unlock new achievements</p>
              </div>
            </div>
            <Switch
              checked={preferences.achievements}
              onCheckedChange={() => togglePreference('achievements')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-white font-medium">Level Ups</p>
                <p className="text-gray-400 text-sm">When you reach a new level</p>
              </div>
            </div>
            <Switch
              checked={preferences.level_ups}
              onCheckedChange={() => togglePreference('level_ups')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Learning Path Milestones</p>
                <p className="text-gray-400 text-sm">Progress on your learning journey</p>
              </div>
            </div>
            <Switch
              checked={preferences.learning_milestones}
              onCheckedChange={() => togglePreference('learning_milestones')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Mentorship Requests</p>
                <p className="text-gray-400 text-sm">New mentorship opportunities</p>
              </div>
            </div>
            <Switch
              checked={preferences.mentorship_requests}
              onCheckedChange={() => togglePreference('mentorship_requests')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-white font-medium">Reviews & Ratings</p>
                <p className="text-gray-400 text-sm">When you receive new reviews</p>
              </div>
            </div>
            <Switch
              checked={preferences.reviews}
              onCheckedChange={() => togglePreference('reviews')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card className="glass-card border-0 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Email for Messages</p>
                <p className="text-gray-400 text-sm">Receive emails for new messages</p>
              </div>
            </div>
            <Switch
              checked={preferences.email_messages}
              onCheckedChange={() => togglePreference('email_messages')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Email for Applications</p>
                <p className="text-gray-400 text-sm">Important application updates via email</p>
              </div>
            </div>
            <Switch
              checked={preferences.email_applications}
              onCheckedChange={() => togglePreference('email_applications')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Job Match Alerts</p>
                <p className="text-gray-400 text-sm">Email digest of matching jobs</p>
              </div>
            </div>
            <Switch
              checked={preferences.email_job_matches}
              onCheckedChange={() => togglePreference('email_job_matches')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-white font-medium">Weekly Digest</p>
                <p className="text-gray-400 text-sm">Summary of your week on Dev-Link</p>
              </div>
            </div>
            <Switch
              checked={preferences.email_weekly_digest}
              onCheckedChange={() => togglePreference('email_weekly_digest')}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">Marketing Emails</p>
                <p className="text-gray-400 text-sm">Product updates and tips</p>
              </div>
            </div>
            <Switch
              checked={preferences.email_marketing}
              onCheckedChange={() => togglePreference('email_marketing')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={() => loadPreferences()}
          variant="outline"
          className="glass-card border-0 text-white hover:bg-white/5"
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-white"
        >
          {saving ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}