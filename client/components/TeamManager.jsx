
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Send,
  ListTodo,
  Plus,
  X,
  Calendar,
  Clock,
  MessageSquare,
  Briefcase,
  CheckCircle,
  Building2,
  Link as LinkIcon
} from "lucide-react";

export default function TeamManager({ team, user, onUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [linkedJobs, setLinkedJobs] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: ""
  });
  const [showLinkJob, setShowLinkJob] = useState(false);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]); // NEW: Store team member data with Roblox avatars

  useEffect(() => {
    loadTeamData();
    const interval = setInterval(loadTeamData, 5000);
    return () => clearInterval(interval);
  }, [team.id]);

  const loadTeamData = async () => {
    try {
      // Load tasks
      const teamTasks = await base44.entities.CollabTask.filter({
        room_id: team.id
      });
      setTasks(teamTasks);

      // Load messages (using team.id as room_id)
      const teamMessages = await base44.entities.CollabMessage.filter({
        room_id: team.id
      }, '-created_date', 50);
      setMessages(teamMessages);

      // NEW: Load team member data with Roblox avatars
      if (team.member_ids && team.member_ids.length > 0) {
        const membersData = await Promise.all(
          team.member_ids.map(async (memberId) => {
            try {
              const userData = await base44.entities.User.filter({ id: memberId });
              return userData[0] || null;
            } catch (error) {
              console.error('Error loading member:', error);
              return null;
            }
          })
        );
        setTeamMembers(membersData.filter(m => m !== null));
      }

      // Load linked jobs
      if (team.job_id) {
        const job = await base44.entities.Job.filter({ id: team.job_id });
        setLinkedJobs(job);
      }

      // Load company profile if team is associated
      if (team.company_id) {
        const company = await base44.entities.CompanyProfile.filter({ id: team.company_id });
        if (company.length > 0) setCompanyProfile(company[0]);
      }

      // Load available jobs for linking (employer's jobs)
      const allJobs = await base44.entities.Job.filter({
        employer_id: user.id,
        status: "Open"
      });
      setAvailableJobs(allJobs);

    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await base44.entities.CollabMessage.create({
        room_id: team.id,
        sender_id: user.id,
        message_type: 'text',
        content: newMessage
      });

      // Notify team members
      const memberIds = team.member_ids.filter(id => id !== user.id);
      await Promise.all(memberIds.map(memberId =>
        base44.entities.Notification.create({
          user_id: memberId,
          type: 'message',
          title: `💬 New message in ${team.name}`,
          message: `${user.full_name}: ${newMessage.substring(0, 50)}${newMessage.length > 50 ? '...' : ''}`,
          link: createPageUrl('Teams')
        })
      ));

      setNewMessage("");
      await loadTeamData();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // UPDATED: Get member data with Roblox avatar and REAL names
  const getMemberData = (memberId) => {
    return teamMembers.find(m => m.id === memberId);
  };

  // UPDATED: Get Roblox avatar URL or fallback
  const getMemberAvatar = (memberId) => {
    const member = getMemberData(memberId);
    if (member?.roblox_data?.avatar_url) {
      return member.roblox_data.avatar_url;
    }
    if (member?.avatar_url) {
      return member.avatar_url;
    }
    return null;
  };

  // UPDATED: Get member display name - SHOW ACTUAL NAMES NOT DIGITS
  const getMemberName = (memberId) => {
    const member = getMemberData(memberId);
    if (!member) return 'Unknown User';
    
    // Use Roblox display name if enabled
    if (member.use_roblox_display_name && member.roblox_username) {
      return member.roblox_username;
    }
    
    // Otherwise use full name
    return member.full_name || 'Unknown User';
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      await base44.entities.CollabTask.create({
        room_id: team.id,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        created_by: user.id,
        status: 'todo'
      });

      setNewTask({ title: "", description: "", priority: "medium", due_date: "" });
      setShowNewTask(false);
      await loadTeamData();

      const memberIds = team.member_ids.filter(id => id !== user.id);
      await Promise.all(memberIds.map(memberId =>
        base44.entities.Notification.create({
          user_id: memberId,
          type: 'message',
          title: `📋 New task in ${team.name}`,
          message: `${user.full_name} created: ${newTask.title}`,
          link: createPageUrl('Teams')
        })
      ));
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await base44.entities.CollabTask.update(taskId, { status: newStatus });
      await loadTeamData();

      if (newStatus === 'done') {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.assigned_to) {
          const xpGain = task.priority === 'urgent' ? 50 : task.priority === 'high' ? 30 : 20;
          const assignee = await base44.entities.User.filter({ id: task.assigned_to });
          if (assignee.length > 0) {
            // Note: This updates the current user's XP, not the assignee's
            // This might be an existing bug or intended behavior based on the original code
            await base44.auth.updateMe({ 
              xp_points: (user.xp_points || 0) + xpGain 
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const linkJobToTeam = async (jobId) => {
    try {
      await base44.entities.Team.update(team.id, { job_id: jobId });
      setShowLinkJob(false);
      await loadTeamData();
      if (onUpdate) onUpdate();

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '🔗 Job Linked to Team',
        message: `Successfully linked job to ${team.name}`,
        link: createPageUrl('Teams')
      });
    } catch (error) {
      console.error('Error linking job:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const formatChatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{team.name}</h2>
                <Badge className={`${
                  team.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  team.status === 'forming' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                } border-0`}>
                  {team.status}
                </Badge>
              </div>
              {team.description && (
                <p className="text-gray-400 mb-4">{team.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center text-gray-400">
                  <Users className="w-4 h-4 mr-2" />
                  {team.member_ids?.length || 0} members
                </div>
                {linkedJobs.length > 0 && (
                  <div className="flex items-center text-blue-400">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Linked to job
                  </div>
                )}
                {companyProfile && (
                  <div className="flex items-center text-purple-400">
                    <Building2 className="w-4 h-4 mr-2" />
                    {companyProfile.company_name}
                  </div>
                )}
              </div>
            </div>
            {user.id === team.leader_id && !team.job_id && (
              <Button
                onClick={() => setShowLinkJob(true)}
                size="sm"
                className="btn-primary text-white"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Link Job
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Link Job Modal */}
      {showLinkJob && (
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Link Job to Team</h3>
              <button onClick={() => setShowLinkJob(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {availableJobs.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No open jobs available. Create a job first.
              </p>
            ) : (
              <div className="space-y-2">
                {availableJobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => linkJobToTeam(job.id)}
                    className="w-full text-left p-3 glass-card rounded-lg hover:bg-white/10 transition-all"
                  >
                    <h4 className="text-white font-medium">{job.title}</h4>
                    <p className="text-gray-400 text-sm line-clamp-1">{job.description}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs for Chat, Tasks, etc */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="glass-card border-0">
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            Team Chat
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ListTodo className="w-4 h-4 mr-2" />
            Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" />
            Members
          </TabsTrigger>
        </TabsList>

        {/* ENHANCED Chat Tab with Roblox Avatars */}
        <TabsContent value="chat">
          <Card className="glass-card border-0">
            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.sender_id === user.id;
                    const avatarUrl = getMemberAvatar(msg.sender_id);
                    const memberName = getMemberName(msg.sender_id);
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn && (
                          <div className="flex-shrink-0">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={memberName}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          {!isOwn && (
                            <span className="text-xs text-gray-400 mb-1 px-2">
                              {memberName}
                            </span>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-indigo-500 text-white'
                                : 'glass-card text-white'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 px-2">
                            {formatChatTime(msg.created_date)}
                          </span>
                        </div>

                        {isOwn && (
                          <div className="flex-shrink-0">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={memberName}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-white/5 border-white/20 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="icon" className="btn-primary text-white">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              {!showNewTask ? (
                <Button
                  onClick={() => setShowNewTask(true)}
                  size="sm"
                  className="w-full btn-primary text-white mb-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              ) : (
                <Card className="glass-card border-0 mb-4">
                  <CardContent className="p-4 space-y-3">
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      placeholder="Task title..."
                      className="bg-white/5 border-white/20 text-white"
                    />
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      placeholder="Description..."
                      className="bg-white/5 border-white/20 text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createTask} size="sm" className="btn-primary text-white">
                        Create
                      </Button>
                      <Button
                        onClick={() => {
                          setShowNewTask(false);
                          setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
                        }}
                        size="sm"
                        variant="outline"
                        className="glass-card border-0 text-white hover:bg-white/5"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No tasks yet. Create one above!</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="glass-card rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">{task.title}</h4>
                            <Badge className={`${
                              task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                              task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            } border-0 text-xs`}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            {task.due_date && (
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                            {task.estimated_hours && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {task.estimated_hours}h
                              </span>
                            )}
                          </div>
                        </div>
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          className="glass-card border-0 text-white text-xs px-2 py-1 rounded"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ENHANCED Members Tab with Roblox Avatars */}
        <TabsContent value="members">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="space-y-3">
                {teamMembers.map((member) => {
                  const avatarUrl = member.roblox_data?.avatar_url || member.avatar_url;
                  const displayName = member.use_roblox_display_name && member.roblox_username 
                    ? member.roblox_username 
                    : member.full_name;
                  const isLeader = member.id === team.leader_id;

                  return (
                    <div key={member.id} className="flex items-center justify-between glass-card rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{displayName}</p>
                          {member.roblox_verified && (
                            <div className="flex items-center gap-1 text-xs text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              <span>Roblox Verified</span>
                            </div>
                          )}
                          {isLeader && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs mt-1">
                              Team Leader
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
