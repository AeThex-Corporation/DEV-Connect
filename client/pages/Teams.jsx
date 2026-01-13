
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import TeamManager from "../components/TeamManager";
import AITeamBuilder from '../components/AITeamBuilder';
import AICollaborationAnalyzer from '../components/AICollaborationAnalyzer';
import {
  Users,
  Plus,
  Crown,
  Star,
  Briefcase,
  DollarSign,
  Edit,
  Trash2,
  UserPlus,
  Building2,
  ExternalLink,
  Sparkles,
  X,
  Brain,
  CheckCircle // NEW IMPORT
} from "lucide-react";

export default function Teams() {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [studios, setStudios] = useState([]); // NEW STATE
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  // const [showCreateCompany, setShowCreateCompany] = useState(false); // Removed, handled by direct navigation
  const [companyProfile, setCompanyProfile] = useState(null);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    skills_offered: [],
    team_rate: 0
  });
  const [newSkill, setNewSkill] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null); // New state for selected team
  const [showBulkJobPost, setShowBulkJobPost] = useState(false);
  const [bulkJobs, setBulkJobs] = useState([{ title: '', roles: [], budget: '' }]);
  const [showTeamBuilder, setShowTeamBuilder] = useState(false);
  const [teamForBuilder, setTeamForBuilder] = useState(null);
  const [showCollabAnalyzer, setShowCollabAnalyzer] = useState(false); // NEW STATE
  const [analyzingTeam, setAnalyzingTeam] = useState(null); // NEW STATE


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load teams where user is leader or member
      const allTeams = await base44.entities.Team.list();
      const userTeams = allTeams.filter(team =>
        team.leader_id === currentUser.id || team.member_ids?.includes(currentUser.id)
      );
      setTeams(userTeams);

      // Load company profile if exists
      const companies = await base44.entities.CompanyProfile.filter({
        user_id: currentUser.id
      });
      if (companies.length > 0) {
        setCompanyProfile(companies[0]);

        // Load studios under this company
        const companyStudios = await base44.entities.Studio.filter({
          company_profile_id: companies[0].id
        });
        setStudios(companyStudios);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!newTeam.name.trim()) {
      alert('Please enter a team name');
      return;
    }

    try {
      await base44.entities.Team.create({
        name: newTeam.name,
        description: newTeam.description,
        leader_id: user.id,
        member_ids: [user.id],
        skills_offered: newTeam.skills_offered,
        team_rate: newTeam.team_rate || 0,
        status: 'forming'
      });

      setShowCreateTeam(false);
      setNewTeam({ name: "", description: "", skills_offered: [], team_rate: 0 });
      await loadData();

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '✅ Team Created',
        message: `Your team "${newTeam.name}" has been created successfully!`,
        link: createPageUrl('Teams')
      });
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team. Please try again.');
    }
  };

  const deleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await base44.entities.Team.delete(teamId);
      await loadData();
      if (selectedTeam && selectedTeam.id === teamId) {
        setSelectedTeam(null); // Close the dialog if the deleted team was open
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team.');
    }
  };

  const deleteStudio = async (studioId) => {
    if (!confirm('Are you sure you want to remove this studio?')) return;

    try {
      await base44.entities.Studio.delete(studioId);
      await loadData();
    } catch (error) {
      console.error('Error deleting studio:', error);
      alert('Failed to delete studio.');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !newTeam.skills_offered.includes(newSkill.trim())) {
      setNewTeam({
        ...newTeam,
        skills_offered: [...newTeam.skills_offered, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setNewTeam({
      ...newTeam,
      skills_offered: newTeam.skills_offered.filter(s => s !== skill)
    });
  };

  const createBulkJobs = async () => {
    if (!companyProfile) {
      alert('Please create a company profile first');
      return;
    }

    const validJobs = bulkJobs.filter(j => j.title.trim() && (j.roles && j.roles.length > 0));
    if (validJobs.length === 0) {
      alert('Please add at least one valid job with a title and roles');
      return;
    }

    try {
      for (const jobData of validJobs) {
        await base44.entities.Job.create({
          title: jobData.title,
          description: jobData.description || `Join ${companyProfile.company_name} as ${jobData.title}`,
          required_roles: jobData.roles,
          payment_type: 'Robux',
          budget_range: jobData.budget,
          employer_id: user.id,
          company_size: companyProfile.company_size,
          remote_type: 'Remote',
          status: 'Open'
        });
      }

      alert(`✅ Successfully posted ${validJobs.length} job(s)!`);
      setShowBulkJobPost(false);
      setBulkJobs([{ title: '', roles: [], budget: '' }]);
    } catch (error) {
      console.error('Error creating bulk jobs:', error);
      alert('Failed to post jobs. Please try again.');
    }
  };

  const addBulkJob = () => {
    setBulkJobs([...bulkJobs, { title: '', roles: [], budget: '' }]);
  };

  const removeBulkJob = (index) => {
    setBulkJobs(bulkJobs.filter((_, i) => i !== index));
  };

  const updateBulkJob = (index, field, value) => {
    const updated = [...bulkJobs];
    updated[index][field] = value;
    setBulkJobs(updated);
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Teams & Company</h1>
        <p className="text-gray-400 text-sm">
          Manage your teams and company profile
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="glass-card border-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 cursor-pointer card-hover" onClick={() => setShowCreateTeam(true)}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">Create a Team</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Form a team with other developers to work on projects together
                </p>
                <Button size="sm" className="btn-primary text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Team
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NEW: Bulk Job Posting */}
        <Card className="glass-card border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 cursor-pointer card-hover" onClick={() => setShowBulkJobPost(true)}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">Bulk Job Posting</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Post multiple job openings at once to find talent faster
                </p>
                <Button size="sm" className="btn-primary text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Multiple Jobs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card border-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 cursor-pointer card-hover"
          onClick={() => window.location.href = createPageUrl('EditCompanyProfile')} // Always redirect to EditCompanyProfile
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">
                  {companyProfile ? 'Edit Company Profile' : 'Create Company Profile'}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {companyProfile
                    ? 'Update your company profile and showcase your work'
                    : 'Set up your company profile to attract talent and clients'
                  }
                </p>
                <Button size="sm" className="btn-primary text-white">
                  <Building2 className="w-4 h-4 mr-2" />
                  {companyProfile ? 'Edit Profile' : 'Create Profile'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Profile Summary */}
      {companyProfile && (
        <Card className="glass-card border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {companyProfile.logo_url && (
                  <img
                    src={companyProfile.logo_url}
                    alt={companyProfile.company_name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                )}
                <div>
                  <h3 className="text-white font-semibold text-xl mb-1">
                    {companyProfile.company_name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">{companyProfile.tagline}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-300 border-0">
                      {companyProfile.industry}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border-0">
                      {companyProfile.company_size} employees
                    </Badge>
                    {companyProfile.verified && (
                      <Badge className="bg-green-500/20 text-green-300 border-0">
                        ✓ Verified
                      </Badge>
                    )}
                    {studios.length > 0 && (
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-0">
                        {studios.length} Studios
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={createPageUrl('CompanyProfile')}>
                  <Button variant="outline" size="sm" className="glass-card border-0 text-white hover:bg-white/5">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Public Profile
                  </Button>
                </Link>
                <Link to={createPageUrl('EditCompanyProfile')}>
                  <Button variant="outline" size="sm" className="glass-card border-0 text-white hover:bg-white/5">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{companyProfile.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Studios List - NEW SECTION */}
      {companyProfile && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Studios & Groups
            </h2>
            <Button
              onClick={() => window.location.href = createPageUrl('Profile') + '?tab=accounts'}
              size="sm"
              className="btn-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Studio from Roblox Groups
            </Button>
          </div>

          {studios.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">No Studios Yet</h3>
                <p className="text-gray-400 mb-4 text-sm">
                  Connect your Roblox groups to showcase your studios
                </p>
                <Button
                  onClick={() => window.location.href = createPageUrl('Profile') + '?tab=accounts'}
                  className="btn-primary text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Studio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studios.map((studio) => (
                <Card key={studio.id} className="glass-card border-0 card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold">{studio.studio_name}</h3>
                            {studio.verified && (
                              <CheckCircle className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                            {studio.user_role_in_group}
                          </Badge>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteStudio(studio.id);
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {studio.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {studio.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        {studio.roblox_group_data?.memberCount?.toLocaleString() || 0} members
                      </div>
                      {studio.total_games > 0 && (
                        <div className="flex items-center text-sm text-gray-400">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {studio.total_games} games
                        </div>
                      )}
                      {studio.total_visits > 0 && (
                        <div className="flex items-center text-sm text-gray-400">
                          <Star className="w-4 h-4 mr-2" />
                          {studio.total_visits >= 1000000
                            ? `${(studio.total_visits / 1000000).toFixed(1)}M`
                            : `${(studio.total_visits / 1000).toFixed(0)}K`} visits
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 glass-card border-0 text-white hover:bg-white/5"
                        asChild
                      >
                        <a
                          href={`https://www.roblox.com/groups/${studio.roblox_group_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Group
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Teams List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Project Teams</h2>
          <Button onClick={() => setShowCreateTeam(true)} size="sm" className="btn-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>

        {teams.length === 0 ? (
          <Card className="glass-card border-0">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Teams Yet</h3>
              <p className="text-gray-400 mb-6">
                Create your first team to collaborate with other developers
              </p>
              <Button onClick={() => setShowCreateTeam(true)} className="btn-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const isLeader = team.leader_id === user.id;

              return (
                <Card
                  key={team.id}
                  className="glass-card border-0 card-hover cursor-pointer"
                  onClick={() => setSelectedTeam(team)} // Open TeamManager dialog
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                          {isLeader && (
                            <Crown className="w-4 h-4 text-yellow-400" title="Team Leader" />
                          )}
                        </div>
                        <Badge className={`${
                          team.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          team.status === 'forming' ? 'bg-yellow-500/20 text-yellow-400' :
                          team.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        } border-0 text-xs`}>
                          {team.status}
                        </Badge>
                      </div>
                      {isLeader && (
                        <button
                          onClick={(e) => { // Prevent card click when deleting
                            e.stopPropagation();
                            deleteTeam(team.id);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {team.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {team.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        {team.member_ids?.length || 0} members
                      </div>
                      {team.team_rate > 0 && (
                        <div className="flex items-center text-sm text-gray-400">
                          <DollarSign className="w-4 h-4 mr-2" />
                          R${team.team_rate}/hour
                        </div>
                      )}
                      {team.job_id && (
                        <div className="flex items-center text-sm text-gray-400">
                          <Briefcase className="w-4 h-4 mr-2" />
                          Working on project
                        </div>
                      )}
                    </div>

                    {team.skills_offered?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {team.skills_offered.slice(0, 3).map(skill => (
                          <Badge key={skill} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {team.skills_offered.length > 3 && (
                          <Badge className="bg-gray-500/20 text-gray-400 border-0 text-xs">
                            +{team.skills_offered.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {isLeader && ( // This button is now redundant because the whole card is clickable, but keeping it for consistency if needed later
                      <Button size="sm" variant="outline" className="w-full glass-card border-0 text-white hover:bg-white/5">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Open Team Dashboard
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent className="glass-card border-0 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Create New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Team Name *</Label>
              <Input
                value={newTeam.name}
                onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                placeholder="Enter team name..."
                className="mt-1 bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={newTeam.description}
                onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                placeholder="Describe your team..."
                className="mt-1 bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Team Hourly Rate (Robux)</Label>
              <Input
                type="number"
                value={newTeam.team_rate}
                onChange={(e) => setNewTeam({...newTeam, team_rate: parseInt(e.target.value) || 0})}
                placeholder="0"
                className="mt-1 bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Skills Offered</Label>
              <div className="flex gap-2 mt-1 mb-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  className="bg-white/5 border-white/20 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button onClick={addSkill} size="sm" className="btn-primary text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newTeam.skills_offered.map(skill => (
                  <Badge key={skill} className="bg-purple-500/20 text-purple-300 border-0">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={createTeam} className="flex-1 btn-primary text-white">
                Create Team
              </Button>
              <Button
                onClick={() => {
                  setShowCreateTeam(false);
                  setNewTeam({ name: "", description: "", skills_offered: [], team_rate: 0 });
                }}
                variant="outline"
                className="flex-1 glass-card border-0 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Manager Modal */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="glass-card border-0 max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center justify-between">
              <span>Team Dashboard</span>
              <div className="flex gap-2">
                {/* Existing AI Team Builder Button */}
                <Button
                  onClick={() => {
                    setTeamForBuilder(selectedTeam);
                    setShowTeamBuilder(true);
                    setSelectedTeam(null);
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Optimize Team
                </Button>
                {/* NEW: AI Collaboration Analyzer Button */}
                <Button
                  onClick={() => {
                    setAnalyzingTeam(selectedTeam);
                    setShowCollabAnalyzer(true);
                    setSelectedTeam(null);
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Dynamics
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedTeam && user && (
            <TeamManager
              team={selectedTeam}
              user={user}
              onUpdate={loadData}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* NEW: Bulk Job Posting Dialog */}
      <Dialog open={showBulkJobPost} onOpenChange={setShowBulkJobPost}>
        <DialogContent className="glass-card border-0 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Bulk Job Posting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Create multiple job postings at once. Perfect for studios hiring for multiple roles.
            </p>

            {bulkJobs.map((job, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Job #{index + 1}</h4>
                    {bulkJobs.length > 1 && (
                      <Button
                        onClick={() => removeBulkJob(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Input
                      value={job.title}
                      onChange={(e) => updateBulkJob(index, 'title', e.target.value)}
                      placeholder="Job Title (e.g., Senior Scripter)"
                      className="bg-white/5 border-white/10 text-white"
                    />

                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">Required Roles</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Scripter', 'Builder', 'UI/UX Designer', '3D Modeler', 'Game Designer'].map(role => (
                          <Button
                            key={role}
                            size="sm"
                            onClick={() => {
                              const roles = job.roles || [];
                              const updated = roles.includes(role)
                                ? roles.filter(r => r !== role)
                                : [...roles, role];
                              updateBulkJob(index, 'roles', updated);
                            }}
                            className={
                              (job.roles || []).includes(role)
                                ? 'btn-primary text-white text-xs'
                                : 'glass-card border-0 text-white hover:bg-white/5 text-xs'
                            }
                          >
                            {role}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Input
                      value={job.budget}
                      onChange={(e) => updateBulkJob(index, 'budget', e.target.value)}
                      placeholder="Budget (e.g., 50-100 Robux/hr)"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={addBulkJob}
              variant="outline"
              className="w-full glass-card border-0 text-white hover:bg-white/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Job
            </Button>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button
                onClick={createBulkJobs}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Post {bulkJobs.filter(j => j.title.trim()).length} Job(s)
              </Button>
              <Button
                onClick={() => {
                  setShowBulkJobPost(false);
                  setBulkJobs([{ title: '', roles: [], budget: '' }]);
                }}
                variant="outline"
                className="flex-1 glass-card border-0 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* NEW: AI Team Builder Modal */}
      {showTeamBuilder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                AI Team Builder {teamForBuilder ? `- ${teamForBuilder.name}` : ''}
              </h2>
              <Button
                onClick={() => {
                  setShowTeamBuilder(false);
                  setTeamForBuilder(null);
                }}
                variant="ghost"
                className="text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <AITeamBuilder
              team={teamForBuilder}
              job={null}
              onUpdate={() => {
                setShowTeamBuilder(false);
                setTeamForBuilder(null);
                loadData();
              }}
            />
          </div>
        </div>
      )}

      {/* NEW: AI Collaboration Analyzer Modal */}
      {showCollabAnalyzer && analyzingTeam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                Team Collaboration Analysis - {analyzingTeam.name}
              </h2>
              <Button
                onClick={() => {
                  setShowCollabAnalyzer(false);
                  setAnalyzingTeam(null);
                }}
                variant="ghost"
                className="text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <AICollaborationAnalyzer
              team={analyzingTeam}
              onInsightApplied={() => {
                setShowCollabAnalyzer(false);
                setAnalyzingTeam(null);
                loadData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
