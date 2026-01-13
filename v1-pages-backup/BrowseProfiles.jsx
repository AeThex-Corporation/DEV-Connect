
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Users,
  BookmarkPlus,
  Bookmark,
  X,
  Sparkles,
  User,
  CheckCircle,
  Crown,
  Trophy,
  Zap,
  Eye,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Gamepad2,
  Code,
  Palette,
  Layout,
  Music,
  Wand2,
  Award,
  Clock,
  DollarSign,
  Target
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function BrowseProfiles() {
  const [developers, setDevelopers] = useState([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedReputationTier, setSelectedReputationTier] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [minProjects, setMinProjects] = useState(0);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [selectedRdcFilter, setSelectedRdcFilter] = useState("all");
  const [sortBy, setSortBy] = useState("reputation");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  const roles = ["Scripter", "Builder", "UI/UX Designer", "3D Modeler", "Sound Designer", "Game Designer", "Artist", "Animator", "VFX Designer"];
  const workStatuses = ["Open to Work", "Networking Only", "Unavailable"];
  const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const paymentTypes = ["Robux", "USD", "Percentage", "Fixed Price", "Rev-Share"];
  const reputationTiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Legend"];

  const roleIcons = {
    "Scripter": Code,
    "Builder": Layout,
    "UI/UX Designer": Palette,
    "3D Modeler": Wand2,
    "Sound Designer": Music,
    "Game Designer": Gamepad2,
    "Artist": Palette,
    "Animator": Sparkles,
    "VFX Designer": Zap
  };

  useEffect(() => {
    loadDevelopers();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: savedDevelopers = [] } = useQuery({
    queryKey: ['saved-developers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.SavedDeveloper.filter({ employer_id: user.id });
    },
    enabled: !!user
  });

  const toggleSaveDeveloperMutation = useMutation({
    mutationFn: async (dev) => {
      const saved = savedDevelopers.find(s => s.developer_id === dev.id);
      if (saved) {
        await base44.entities.SavedDeveloper.delete(saved.id);
      } else {
        await base44.entities.SavedDeveloper.create({
          employer_id: user.id,
          developer_id: dev.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-developers']);
    }
  });

  const isDeveloperSaved = (devId) => {
    return savedDevelopers.some(s => s.developer_id === devId);
  };

  const loadDevelopers = async () => {
    try {
      const allUsers = await base44.entities.User.list();
      const devs = allUsers.filter(user => user.developer_roles?.length > 0);
      setDevelopers(devs);
    } catch (error) {
      console.error('Error loading developers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDevelopers = useCallback(() => {
    let filtered = developers;

    if (searchTerm) {
      filtered = filtered.filter(dev =>
        (dev.roblox_username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dev.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        dev.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        dev.developer_roles?.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter(dev =>
        dev.developer_roles?.includes(selectedRole)
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(dev => dev.work_status === selectedStatus);
    }

    if (selectedExperience !== "all") {
      filtered = filtered.filter(dev => dev.experience_level === selectedExperience);
    }

    if (selectedReputationTier !== "all") {
      filtered = filtered.filter(dev => 
        dev.roblox_verified && dev.roblox_reputation_tier === selectedReputationTier
      );
    }

    if (selectedRdcFilter === "rdc_only") {
      filtered = filtered.filter(dev => dev.rdc_verified === true && dev.rdc_verification_status === 'approved');
    }

    if (minRating > 0) {
      filtered = filtered.filter(dev => (dev.rating || 0) >= minRating);
    }

    if (minProjects > 0) {
      filtered = filtered.filter(dev => (dev.completed_projects || 0) >= minProjects);
    }

    if (selectedPayments.length > 0) {
      filtered = filtered.filter(dev =>
        dev.payment_preferences?.some(p => selectedPayments.includes(p))
      );
    }

    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "reputation":
          const scoreA = (a.roblox_verified ? 1000 : 0) + (a.roblox_reputation_score || 0);
          const scoreB = (b.roblox_verified ? 1000 : 0) + (b.roblox_reputation_score || 0);
          return scoreB - scoreA;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "projects":
          return (b.completed_projects || 0) - (a.completed_projects || 0);
        case "experience":
          return (b.years_of_experience || 0) - (a.years_of_experience || 0);
        case "name":
          const nameA = a.use_roblox_display_name && a.roblox_username ? a.roblox_username : a.full_name || "";
          const nameB = b.use_roblox_display_name && b.roblox_username ? b.roblox_username : b.full_name || "";
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

    setFilteredDevelopers(filtered);
  }, [developers, searchTerm, selectedRole, selectedStatus, selectedExperience, selectedReputationTier, minRating, minProjects, selectedPayments, sortBy, selectedRdcFilter]);

  useEffect(() => {
    filterDevelopers();
  }, [filterDevelopers]);

  const togglePayment = (payment) => {
    setSelectedPayments(prev =>
      prev.includes(payment)
        ? prev.filter(p => p !== payment)
        : [...prev, payment]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedStatus("all");
    setSelectedExperience("all");
    setSelectedReputationTier("all");
    setSelectedRdcFilter("all");
    setMinRating(0);
    setMinProjects(0);
    setSelectedPayments([]);
  };

  const handleContact = async (developer) => {
    try {
      const currentUser = await base44.auth.me();
      
      const existingSessions = await base44.entities.ChatSession.filter({
        $or: [
          { participant_1_id: currentUser.id, participant_2_id: developer.id },
          { participant_1_id: developer.id, participant_2_id: currentUser.id }
        ]
      });

      let sessionId;
      if (existingSessions.length > 0) {
        sessionId = existingSessions[0].id;
      } else {
        const newSession = await base44.entities.ChatSession.create({
          participant_1_id: currentUser.id,
          participant_2_id: developer.id,
          last_message: '',
          last_message_at: new Date().toISOString()
        });
        sessionId = newSession.id;
      }

      window.location.href = `${createPageUrl('Messages')}?session=${sessionId}`;
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  const getDisplayName = (dev) => {
    if (dev?.use_roblox_display_name && dev?.roblox_username) {
      return dev.roblox_username;
    }
    return dev?.full_name || 'Developer';
  };

  const getAvatarUrl = (dev) => {
    // If user wants to use Roblox avatar and has one
    if (dev?.use_roblox_avatar && dev?.roblox_data?.avatar_url) {
      return dev.roblox_data.avatar_url;
    }
    // Otherwise use custom avatar
    return dev?.avatar_url;
  };

  const getTierColor = (tier) => {
    const colors = {
      'Legend': 'from-yellow-400 via-orange-500 to-red-500',
      'Diamond': 'from-cyan-400 via-blue-500 to-indigo-600',
      'Platinum': 'from-gray-300 via-gray-400 to-gray-500',
      'Gold': 'from-yellow-300 via-yellow-500 to-yellow-600',
      'Silver': 'from-gray-200 via-gray-300 to-gray-400',
      'Bronze': 'from-orange-400 via-orange-500 to-orange-600'
    };
    return colors[tier] || colors['Bronze'];
  };

  const getTierIcon = (tier) => {
    const icons = {
      'Legend': Crown,
      'Diamond': Sparkles,
      'Platinum': Trophy,
      'Gold': Trophy,
      'Silver': Star,
      'Bronze': Zap
    };
    const Icon = icons[tier] || Star;
    return Icon;
  };

  const featuredDevelopers = filteredDevelopers
    .filter(d => d.roblox_verified && d.roblox_reputation_tier && d.roblox_reputation_tier !== 'Unverified')
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full mb-4 border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">Discover Elite Talent</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Find Your Perfect
            </span>
            <br />
            <span className="text-white">Developer Match</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Connect with {developers.length}+ verified Roblox developers ready to bring your vision to life
          </p>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg"
            >
              <Users className="w-5 h-5 text-indigo-400" />
              <div className="text-left">
                <p className="text-2xl font-bold text-white">{filteredDevelopers.length}</p>
                <p className="text-xs text-gray-400">Developers</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <p className="text-2xl font-bold text-white">{filteredDevelopers.filter(d => d.roblox_verified).length}</p>
                <p className="text-xs text-gray-400">Verified</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg"
            >
              <Target className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <p className="text-2xl font-bold text-white">{developers.filter(d => d.work_status === 'Open to Work').length}</p>
                <p className="text-xs text-gray-400">Available</p>
              </div>
            </motion.div>

            {featuredDevelopers.length > 0 && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg border border-purple-500/30"
              >
                <Crown className="w-5 h-5 text-yellow-400" />
                <div className="text-left">
                  <p className="text-2xl font-bold text-white">{featuredDevelopers.length}</p>
                  <p className="text-xs text-gray-400">Elite Tier</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Featured Developers Carousel */}
        {featuredDevelopers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Featured Elite Developers</h2>
                  <p className="text-sm text-gray-400">Top-rated verified professionals</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredDevelopers.map((dev, i) => {
                const TierIcon = getTierIcon(dev.roblox_reputation_tier);
                
                return (
                  <motion.div
                    key={dev.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="relative"
                  >
                    <Card className="glass-card border-0 overflow-hidden relative group">
                      {/* Tier gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${getTierColor(dev.roblox_reputation_tier)} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                      
                      {/* Tier badge */}
                      <div className="absolute top-0 right-0 z-10">
                        <div className={`px-3 py-1.5 bg-gradient-to-r ${getTierColor(dev.roblox_reputation_tier)} rounded-bl-xl flex items-center gap-1.5`}>
                          <TierIcon className="w-4 h-4 text-white" />
                          <span className="text-white font-bold text-xs">{dev.roblox_reputation_tier}</span>
                        </div>
                      </div>

                      <CardContent className="p-6 relative">
                        <div className="flex flex-col items-center text-center">
                          {/* Avatar */}
                          <div className="relative mb-4">
                            <div className={`absolute inset-0 rounded-full blur-xl opacity-60 bg-gradient-to-r ${getTierColor(dev.roblox_reputation_tier)}`}></div>
                            {getAvatarUrl(dev) ? (
                              <img 
                                src={getAvatarUrl(dev)} 
                                alt={getDisplayName(dev)}
                                className="relative w-24 h-24 rounded-full object-cover ring-4 ring-white/20"
                              />
                            ) : (
                              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ring-4 ring-white/20 bg-gradient-to-br ${getTierColor(dev.roblox_reputation_tier)}`}>
                                <User className="w-12 h-12 text-white" />
                              </div>
                            )}
                            {dev.roblox_verified && (
                              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-[#0a0a0a] rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-white mb-1">{getDisplayName(dev)}</h3>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-white ml-1 text-sm font-semibold">{dev.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                            <span className="text-gray-400 text-xs">•</span>
                            <span className="text-gray-400 text-xs">{dev.completed_projects || 0} projects</span>
                          </div>

                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {dev.bio || 'No bio provided'}
                          </p>

                          {/* Stats */}
                          {dev.roblox_stats_summary?.total_visits > 0 && (
                            <div className="grid grid-cols-3 gap-2 w-full mb-4">
                              <div className="text-center">
                                <Eye className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                                <p className="text-white font-bold text-xs">
                                  {dev.roblox_stats_summary.total_visits >= 1000000 
                                    ? `${(dev.roblox_stats_summary.total_visits / 1000000).toFixed(1)}M`
                                    : dev.roblox_stats_summary.total_visits >= 1000
                                    ? `${(dev.roblox_stats_summary.total_visits / 1000).toFixed(0)}K`
                                    : dev.roblox_stats_summary.total_visits}
                                </p>
                              </div>
                              <div className="text-center">
                                <ThumbsUp className="w-3 h-3 text-green-400 mx-auto mb-1" />
                                <p className="text-white font-bold text-xs">
                                  {dev.roblox_stats_summary.total_likes >= 1000 
                                    ? `${(dev.roblox_stats_summary.total_likes / 1000).toFixed(1)}K`
                                    : dev.roblox_stats_summary.total_likes}
                                </p>
                              </div>
                              <div className="text-center">
                                <Gamepad2 className="w-3 h-3 text-purple-400 mx-auto mb-1" />
                                <p className="text-white font-bold text-xs">{dev.roblox_stats_summary.total_games || 0}</p>
                              </div>
                            </div>
                          )}

                          <Button
                            onClick={() => window.location.href = createPageUrl('PublicProfile') + `?id=${dev.id}`}
                            className="w-full btn-primary text-white"
                          >
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Main Search */}
          <div className="glass-card rounded-2xl p-6 mb-6 border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name, skills, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl text-lg"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-14 px-6 ${showFilters ? 'bg-indigo-600' : 'glass-card'} text-white border-0`}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                {(selectedRole !== "all" || selectedStatus !== "all" || selectedExperience !== "all" || selectedReputationTier !== "all" || minRating > 0 || minProjects > 0 || selectedPayments.length > 0 || selectedRdcFilter !== "all") && (
                  <Badge className="ml-2 bg-indigo-400 text-white border-0">
                    {[selectedRole !== "all", selectedStatus !== "all", selectedExperience !== "all", selectedReputationTier !== "all", minRating > 0, minProjects > 0, selectedPayments.length > 0, selectedRdcFilter !== "all"].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Quick Role Filters */}
            <div className="flex flex-wrap gap-2">
              {roles.slice(0, 6).map(role => {
                const RoleIcon = roleIcons[role];
                return (
                  <motion.button
                    key={role}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRole(selectedRole === role ? "all" : role)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      selectedRole === role
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                        : 'glass-card text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <RoleIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{role}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card rounded-2xl p-6 border border-white/10 mb-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Advanced Filters
                  </h3>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="glass-card border-0 text-white hover:bg-white/5"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Role</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="glass-card border-0 text-white rounded-lg">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Reputation Tier</label>
                    <Select value={selectedReputationTier} onValueChange={setSelectedReputationTier}>
                      <SelectTrigger className="glass-card border-0 text-white rounded-lg">
                        <SelectValue placeholder="All Tiers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        {reputationTiers.slice().reverse().map(tier => ( // Use slice() to avoid reversing the original array
                          <SelectItem key={tier} value={tier}>
                            {tier === 'Legend' && '👑'} {tier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Status</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="glass-card border-0 text-white rounded-lg">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {workStatuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Experience</label>
                    <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                      <SelectTrigger className="glass-card border-0 text-white rounded-lg">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {experienceLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* NEW: RDC Filter */}
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">RDC Attendance</label>
                    <Select value={selectedRdcFilter} onValueChange={setSelectedRdcFilter}>
                      <SelectTrigger className="glass-card border-0 text-white rounded-lg">
                        <SelectValue placeholder="All Developers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Developers</SelectItem>
                        <SelectItem value="rdc_only">🏆 RDC Attendees Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-white text-sm font-medium mb-3 block flex items-center justify-between">
                      <span>Minimum Rating</span>
                      <span className="text-yellow-400 font-bold">{minRating.toFixed(1)} ⭐</span>
                    </label>
                    <Slider
                      value={[minRating]}
                      onValueChange={(value) => setMinRating(value[0])}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-3 block flex items-center justify-between">
                      <span>Minimum Projects</span>
                      <span className="text-indigo-400 font-bold">{minProjects}</span>
                    </label>
                    <Slider
                      value={[minProjects]}
                      onValueChange={(value) => setMinProjects(value[0])}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-3 block">Payment Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {paymentTypes.map(payment => (
                      <motion.button
                        key={payment}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => togglePayment(payment)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedPayments.includes(payment)
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : 'glass-card text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {payment === 'Robux' && '🤑'}
                        {payment === 'USD' && '💵'}
                        {payment === 'Percentage' && '📊'}
                        {payment === 'Fixed Price' && '💰'}
                        {payment === 'Rev-Share' && '🤝'}
                        {' '}{payment}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sort and View Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="glass-card border-0 text-white w-[200px] rounded-lg">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reputation">🏆 Top Reputation</SelectItem>
                  <SelectItem value="rating">⭐ Top Rated</SelectItem>
                  <SelectItem value="projects">💼 Most Projects</SelectItem>
                  <SelectItem value="experience">📈 Most Experience</SelectItem>
                  <SelectItem value="name">🔤 Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-400">
                Showing <span className="text-white font-semibold">{filteredDevelopers.length}</span> developers
              </div>
            </div>
          </div>
        </motion.div>

        {/* Developers Grid */}
        <AnimatePresence mode="popLayout">
          {filteredDevelopers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <div className="glass-card rounded-2xl p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No developers found
                </h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  onClick={clearFilters}
                  className="btn-primary text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevelopers.map((dev, index) => {
                const isSaved = isDeveloperSaved(dev.id);
                const TierIcon = getTierIcon(dev.roblox_reputation_tier);
                const hasReputation = dev.roblox_verified && dev.roblox_reputation_tier && dev.roblox_reputation_tier !== 'Unverified';
                
                return (
                  <motion.div
                    key={dev.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card 
                      className={`border-0 card-hover relative overflow-hidden h-full ${
                        hasReputation 
                          ? 'glass-card border-l-4 border-purple-500' 
                          : 'glass-card'
                      }`}
                    >
                      {/* Mini Banner Preview */}
                      {dev.banner_url && (
                        <div className="h-16 overflow-hidden relative">
                          <img 
                            src={dev.banner_url}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]"></div>
                        </div>
                      )}

                      {hasReputation && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className={`px-3 py-1.5 bg-gradient-to-r ${getTierColor(dev.roblox_reputation_tier)} rounded-bl-lg flex items-center gap-1.5 shadow-lg`}>
                            <TierIcon className="w-4 h-4 text-white" />
                            <span className="text-white font-bold text-xs">{dev.roblox_reputation_tier}</span>
                          </div>
                        </div>
                      )}

                      <CardContent className={`${dev.banner_url ? 'p-4 -mt-6' : 'p-6'}`}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${
                              hasReputation ? `bg-gradient-to-r ${getTierColor(dev.roblox_reputation_tier)}` : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                            }`}></div>
                            {getAvatarUrl(dev) ? (
                              <img 
                                src={getAvatarUrl(dev)} 
                                alt={getDisplayName(dev)}
                                className="relative w-16 h-16 rounded-full object-cover ring-2 ring-white/20"
                              />
                            ) : (
                              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ring-2 ring-white/20 ${
                                hasReputation 
                                  ? `bg-gradient-to-br ${getTierColor(dev.roblox_reputation_tier)}`
                                  : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                              }`}>
                                <User className="w-8 h-8 text-white" />
                              </div>
                            )}
                            {dev.roblox_verified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#0a0a0a] rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 pt-4">
                            <h3 className="text-white font-semibold text-lg mb-1 truncate">{getDisplayName(dev)}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-white ml-1 text-sm font-semibold">{dev.rating?.toFixed(1) || '0.0'}</span>
                              </div>
                              <span className="text-gray-400 text-xs">•</span>
                              <span className="text-gray-400 text-xs">{dev.completed_projects || 0} projects</span>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (user) {
                                toggleSaveDeveloperMutation.mutate(dev);
                              } else {
                                alert('Please log in to save developers.');
                              }
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              isSaved
                                ? 'text-yellow-400 bg-yellow-500/10'
                                : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                            }`}
                          >
                            {isSaved ? (
                              <Bookmark className="w-5 h-5 fill-current" />
                            ) : (
                              <BookmarkPlus className="w-5 h-5" />
                            )}
                          </motion.button>
                        </div>

                        {/* Connected Accounts Preview */}
                        {(dev.roblox_verified || dev.github_verified || dev.devforum_verified || dev.portfolio_links?.youtube || (dev.rdc_verified && dev.rdc_verification_status === 'approved')) && (
                          <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <span className="text-gray-400 text-xs">Connected:</span>
                            {dev.roblox_verified && (
                              <Badge className="bg-red-500/20 text-red-400 border-0 text-xs flex items-center gap-1">
                                <Gamepad2 className="w-3 h-3" />
                                Roblox
                              </Badge>
                            )}
                            {dev.github_verified && (
                              <Badge className="bg-gray-700/20 text-gray-400 border-0 text-xs flex items-center gap-1">
                                <Code className="w-3 h-3" />
                                GitHub
                              </Badge>
                            )}
                            {dev.portfolio_links?.youtube && (
                              <Badge className="bg-red-600/20 text-red-400 border-0 text-xs flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                YouTube
                              </Badge>
                            )}
                            
                            {/* UPDATED: RDC Badge */}
                            {dev.rdc_verified && dev.rdc_verification_status === 'approved' && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                RDC {dev.rdc_years && dev.rdc_years.length > 0 ? dev.rdc_years[0] : ''}
                              </Badge>
                            )}
                          </div>
                        )}

                        {dev.roblox_stats_summary && dev.roblox_stats_summary.total_visits > 0 && (
                          <div className="mb-4 glass-card rounded-lg p-3 bg-purple-500/5">
                            <p className="text-purple-300 text-xs mb-2 flex items-center gap-1">
                              <Gamepad2 className="w-3 h-3" />
                              Roblox Game Stats
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center">
                                <Eye className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                                <p className="text-white font-bold text-xs">
                                  {dev.roblox_stats_summary.total_visits >= 1000000 
                                    ? `${(dev.roblox_stats_summary.total_visits / 1000000).toFixed(1)}M`
                                    : dev.roblox_stats_summary.total_visits >= 1000
                                    ? `${(dev.roblox_stats_summary.total_visits / 1000).toFixed(1)}K`
                                    : dev.roblox_stats_summary.total_visits}
                                </p>
                                <p className="text-gray-400 text-xs">Visits</p>
                              </div>
                              <div className="text-center">
                                <ThumbsUp className="w-3 h-3 text-green-400 mx-auto mb-1" />
                                <p className="text-white font-bold text-xs">
                                  {dev.roblox_stats_summary.total_likes >= 1000 
                                    ? `${(dev.roblox_stats_summary.total_likes / 1000).toFixed(1)}K`
                                    : dev.roblox_stats_summary.total_likes}
                                </p>
                                <p className="text-gray-400 text-xs">Likes</p>
                              </div>
                              <div className="text-center">
                                <Gamepad2 className="w-3 h-3 text-purple-400 mx-auto mb-1" />
                                <p className="text-white font-bold text-xs">{dev.roblox_stats_summary.total_games || 0}</p>
                                <p className="text-gray-400 text-xs">Games</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {dev.developer_roles?.slice(0, 3).map(role => (
                            <Badge key={role} className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                              {role}
                            </Badge>
                          ))}
                          {dev.developer_roles?.length > 3 && (
                            <Badge className="bg-white/5 text-gray-400 border-0 text-xs">
                              +{dev.developer_roles.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => window.location.href = createPageUrl('PublicProfile') + `?id=${dev.id}`}
                            className="flex-1 btn-primary text-white"
                            size="sm"
                          >
                            View Profile
                          </Button>
                          <Button
                            onClick={() => handleContact(dev)}
                            variant="outline"
                            className="glass-card border-0 text-white hover:bg-white/5"
                            size="sm"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
