
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Search,
  TrendingUp,
  MessageSquare,
  Calendar,
  Lock,
  Globe,
  UserPlus,
  Settings,
  Star,
  Folder,
  Trophy, // New import
  X, // New import
  Crown // New import
} from "lucide-react";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [viewMode, setViewMode] = useState("discover"); // discover, my-groups

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: "Skill-based",
    tags: [],
    privacy: "public",
    rules: []
  });
  const [tagInput, setTagInput] = useState("");

  const [memberLeaderboard, setMemberLeaderboard] = useState([]);
  const [selectedGroupStats, setSelectedGroupStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const allGroups = await base44.entities.Group.list("-member_count");
      setGroups(allGroups);

      const memberships = await base44.entities.GroupMembership.filter({ user_id: currentUser.id });
      const userGroupIds = memberships.map(m => m.group_id);
      const userGroups = allGroups.filter(g => userGroupIds.includes(g.id));
      setMyGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupLeaderboard = async (groupId) => {
    try {
      const memberships = await base44.entities.GroupMembership.filter({
        group_id: groupId
      }, '-contributions');

      const memberIds = memberships.map(m => m.user_id);
      const allUsers = await base44.entities.User.list();
      const members = allUsers.filter(u => memberIds.includes(u.id));

      const leaderboard = members.map(member => {
        const membership = memberships.find(m => m.user_id === member.id);
        return {
          ...member,
          contributions: membership?.contributions || 0,
          role: membership?.role || 'member'
        };
      }).sort((a, b) => b.contributions - a.contributions);

      setMemberLeaderboard(leaderboard);
    } catch (error) {
      console.error('Error loading group leaderboard:', error);
    }
  };

  const awardGroupPoints = async (groupId, memberId, points, activityType) => {
    try {
      // Award community points
      const member = await base44.entities.User.filter({ id: memberId });
      if (member.length > 0) {
        const currentPoints = member[0].community_points || 0;
        await base44.auth.updateMe({
          community_points: currentPoints + points
        });

        // Update group membership contributions
        const membership = await base44.entities.GroupMembership.filter({
          group_id: groupId,
          user_id: memberId
        });

        if (membership.length > 0) {
          const currentContributions = membership[0].contributions || 0;
          await base44.entities.GroupMembership.update(membership[0].id, {
            contributions: currentContributions + 1
          });
        }

        // Log contribution
        await base44.entities.CommunityContribution.create({
          user_id: memberId,
          contribution_type: activityType,
          points_earned: points,
          related_entity_id: groupId,
          related_entity_type: 'group'
        });

        // Check for badge eligibility
        await checkBadgeEligibility(memberId, currentPoints + points);
      }
    } catch (error) {
      console.error('Error awarding group points:', error);
    }
  };

  const checkBadgeEligibility = async (userId, totalPoints) => {
    try {
      const existingBadges = await base44.entities.CommunityBadge.filter({ user_id: userId });
      const badgeTypes = existingBadges.map(b => b.badge_type);

      // Group Leader badge
      if (totalPoints >= 1000 && !badgeTypes.includes('group_leader')) {
        await base44.entities.CommunityBadge.create({
          user_id: userId,
          badge_type: 'group_leader',
          badge_tier: 'gold',
          title: 'Group Leader',
          description: 'Led a community group with excellence',
          icon: '👑',
          perks: ['Featured group listing', 'Priority support'],
          rarity: 'epic',
          earned_date: new Date().toISOString()
        });

        await base44.entities.Notification.create({
          user_id: userId,
          type: 'message',
          title: '🎉 New Badge Earned!',
          message: "You've earned the Group Leader badge!",
          link: createPageUrl('Profile')
        });
      }

      // Community Champion badge
      if (totalPoints >= 5000 && !badgeTypes.includes('community_champion')) {
        await base44.entities.CommunityBadge.create({
          user_id: userId,
          badge_type: 'community_champion',
          badge_tier: 'diamond',
          title: 'Community Champion',
          description: 'Made outstanding contributions to the community',
          icon: '🏆',
          perks: ['Verified badge', 'Custom profile flair', 'Early access features'],
          rarity: 'legendary',
          earned_date: new Date().toISOString()
        });

        await base44.entities.Notification.create({
          user_id: userId,
          type: 'message',
          title: '✨ Legendary Achievement!',
          message: "You've earned the Community Champion badge! You're a legend!",
          link: createPageUrl('Profile')
        });
      }
    } catch (error) {
      console.error('Error checking badge eligibility:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const createdGroup = await base44.entities.Group.create({
        ...newGroup,
        creator_id: user.id,
        admin_ids: [user.id],
        member_ids: [user.id],
        member_count: 1
      });

      await base44.entities.GroupMembership.create({
        group_id: createdGroup.id,
        user_id: user.id,
        role: 'admin',
        status: 'active',
        joined_date: new Date().toISOString()
      });

      setCreateModalOpen(false);
      setNewGroup({
        name: "",
        description: "",
        category: "Skill-based",
        tags: [],
        privacy: "public",
        rules: []
      });
      loadData();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  const handleJoinGroup = async (group) => {
    try {
      await base44.entities.GroupMembership.create({
        group_id: group.id,
        user_id: user.id,
        role: 'member',
        status: group.privacy === 'invite-only' ? 'pending' : 'active',
        joined_date: new Date().toISOString()
      });

      if (group.privacy !== 'invite-only') {
        await base44.entities.Group.update(group.id, {
          member_ids: [...(group.member_ids || []), user.id],
          member_count: (group.member_count || 0) + 1
        });
      }

      loadData();
      alert(group.privacy === 'invite-only' ? 'Join request sent!' : 'Successfully joined group!');
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newGroup.tags.includes(tagInput.trim())) {
      setNewGroup({
        ...newGroup,
        tags: [...newGroup.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayGroups = viewMode === "my-groups" ? myGroups : filteredGroups;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Community Groups 👥
          </h1>
          <p className="text-gray-400 text-sm">
            Join communities, collaborate on projects, and grow together
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="btn-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{groups.length}</p>
            <p className="text-gray-400 text-xs">Total Groups</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <UserPlus className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{myGroups.length}</p>
            <p className="text-gray-400 text-xs">My Groups</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">
              {groups.reduce((sum, g) => sum + (g.member_count || 0), 0)}
            </p>
            <p className="text-gray-400 text-xs">Total Members</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">
              {groups.filter(g => g.featured).length}
            </p>
            <p className="text-gray-400 text-xs">Featured</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle & Filters */}
      <div className="glass-card rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode("discover")}
              className={viewMode === "discover" ? "btn-primary text-white" : "glass-card border-0 text-white hover:bg-white/5"}
            >
              Discover
            </Button>
            <Button
              onClick={() => setViewMode("my-groups")}
              className={viewMode === "my-groups" ? "btn-primary text-white" : "glass-card border-0 text-white hover:bg-white/5"}
            >
              My Groups ({myGroups.length})
            </Button>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="glass-card border-0 text-white w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Skill-based">Skill-based</SelectItem>
              <SelectItem value="Project-based">Project-based</SelectItem>
              <SelectItem value="Industry">Industry</SelectItem>
              <SelectItem value="Learning">Learning</SelectItem>
              <SelectItem value="Regional">Regional</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Groups Grid */}
      {displayGroups.length === 0 ? (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {viewMode === "my-groups" ? "No Groups Yet" : "No Groups Found"}
            </h3>
            <p className="text-gray-400 mb-6">
              {viewMode === "my-groups"
                ? "Join communities to collaborate and learn together"
                : "Try adjusting your filters"}
            </p>
            {viewMode === "my-groups" && (
              <Button onClick={() => setViewMode("discover")} className="btn-primary text-white">
                Discover Groups
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGroups.map((group) => {
            const isMember = myGroups.some(g => g.id === group.id);
            const isAdmin = group.admin_ids?.includes(user.id);

            return (
              <Card key={group.id} className="glass-card border-0 card-hover">
                <CardContent className="p-6">
                  {group.banner_url && (
                    <img
                      src={group.banner_url}
                      alt={group.name}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {group.avatar_url ? (
                        <img
                          src={group.avatar_url}
                          alt={group.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    {group.featured && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-white font-semibold text-lg mb-2">{group.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{group.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                      {group.category}
                    </Badge>
                    {group.privacy === "private" && (
                      <Badge className="bg-orange-500/20 text-orange-300 border-0 text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                    {group.privacy === "public" && (
                      <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                    )}
                  </div>

                  {group.tags?.slice(0, 3).map((tag, i) => (
                    <Badge key={i} className="bg-white/5 text-gray-300 border-0 text-xs mr-1 mb-2">
                      {tag}
                    </Badge>
                  ))}

                  {/* NEW: Top Contributors Preview */}
                  {isMember && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-gray-400 text-xs font-medium mb-2">Top Contributors:</p>
                      <button
                        onClick={() => {
                          loadGroupLeaderboard(group.id);
                          setSelectedGroupStats(group);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1"
                      >
                        <Trophy className="w-3 h-3" />
                        View Leaderboard
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {group.member_count || 0}
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {group.activity_level}
                      </div>
                    </div>

                    {isMember ? (
                      <Button
                        onClick={() => window.location.href = createPageUrl('GroupDetails') + '?id=' + group.id}
                        size="sm"
                        className="btn-primary text-white"
                      >
                        View
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleJoinGroup(group)}
                        size="sm"
                        className="glass-card border-0 text-white hover:bg-white/5"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Group Leaderboard Modal */}
      {selectedGroupStats && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="glass-card border-0 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-white font-bold text-xl flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      {selectedGroupStats.name} Leaderboard
                    </h2>
                    <p className="text-gray-400 text-sm">Top contributors this month</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedGroupStats(null);
                      setMemberLeaderboard([]);
                    }}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {memberLeaderboard.map((member, index) => (
                    <div key={member.id} className={`glass-card rounded-lg p-4 ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400/10 to-slate-400/10' :
                      index === 2 ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10' : ''
                    }`}>
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-8 h-8 glass-card rounded-full flex items-center justify-center flex-shrink-0">
                          {index === 0 ? <Crown className="w-4 h-4 text-yellow-400" /> :
                           index === 1 ? <Star className="w-4 h-4 text-gray-400" /> :
                           index === 2 ? <Star className="w-4 h-4 text-orange-400" /> :
                           <span className="text-white font-bold text-sm">#{index + 1}</span>}
                        </div>

                        {/* Avatar */}
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold">{member.full_name}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs border-0 ${
                              member.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                              member.role === 'moderator' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {member.role}
                            </Badge>
                            {member.community_rank && (
                              <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                                {member.community_rank}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Contributions */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-white font-bold text-lg">{member.contributions}</p>
                          <p className="text-gray-400 text-xs">contributions</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {memberLeaderboard.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No contributions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="glass-card border-0 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Group Name *</label>
              <Input
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                placeholder="e.g., Lua Scripters United"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={newGroup.description}
                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                placeholder="What is this group about?"
                className="bg-white/5 border-white/10 text-white h-24"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Category</label>
                <Select value={newGroup.category} onValueChange={(value) => setNewGroup({...newGroup, category: value})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Skill-based">Skill-based</SelectItem>
                    <SelectItem value="Project-based">Project-based</SelectItem>
                    <SelectItem value="Industry">Industry</SelectItem>
                    <SelectItem value="Learning">Learning</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Privacy</label>
                <Select value={newGroup.privacy} onValueChange={(value) => setNewGroup({...newGroup, privacy: value})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="invite-only">Invite Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tags (press Enter)"
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button onClick={handleAddTag} className="glass-card border-0 text-white">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newGroup.tags.map((tag, i) => (
                  <Badge key={i} className="bg-indigo-500/20 text-indigo-300 border-0">
                    {tag}
                    <button
                      onClick={() => setNewGroup({...newGroup, tags: newGroup.tags.filter((_, idx) => idx !== i)})}
                      className="ml-2 text-indigo-400 hover:text-indigo-300"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setCreateModalOpen(false)}
                variant="outline"
                className="flex-1 glass-card border-0 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                className="flex-1 btn-primary text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
