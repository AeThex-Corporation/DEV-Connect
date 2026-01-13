
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RobloxReputationCard from '../components/RobloxReputationCard'; // New import
import {
  Star,
  MapPin,
  Briefcase,
  Award as AwardIcon,
  Github,
  Linkedin,
  ExternalLink,
  MessageSquare,
  Code,
  Palette,
  Brain,
  Smartphone,
  Gamepad2,
  Boxes,
  Video,
  Play,
  User as UserIcon, // Keep User as UserIcon
  Users,
  Eye,
  ThumbsUp,
  CheckCircle,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Twitter,
  Crown // New import for Crown icon
} from "lucide-react";

export default function PublicProfile() {
  const location = useLocation();
  const [developer, setDeveloper] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [robloxGames, setRobloxGames] = useState([]);
  const [robloxGroups, setRobloxGroups] = useState([]);
  const [loadingRobloxData, setLoadingRobloxData] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const developerId = searchParams.get('id');

  const createPageUrl = (pageName) => {
    switch (pageName) {
      case 'BrowseProfiles':
        return '/browse-profiles';
      case 'Messages':
        return '/messages';
      default:
        return '/';
    }
  };

  useEffect(() => {
    if (developerId) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [developerId]);

  const loadProfile = async () => {
    try {
      const [user, devUsers, portfolioItems, userReviews, userAchievements, userCerts, userExp] = await Promise.all([
        base44.auth.me().catch(() => null),
        base44.entities.User.filter({ id: developerId }),
        base44.entities.Portfolio.filter({ user_id: developerId }),
        base44.entities.Review.filter({ reviewee_id: developerId }),
        base44.entities.Achievement.filter({ user_id: developerId }),
        base44.entities.Certification.filter({ user_id: developerId, status: 'active' }),
        base44.entities.WorkExperience.filter({ user_id: developerId })
      ]);

      setCurrentUser(user);
      setDeveloper(devUsers[0]);
      setPortfolio(portfolioItems);
      setReviews(userReviews);
      setAchievements(userAchievements);
      setCertifications(userCerts);
      setWorkExperience(userExp);

      // Load Roblox data if verified
      if (devUsers[0]?.roblox_verified && devUsers[0]?.roblox_user_id) {
        loadRobloxData(devUsers[0]);
      }

      if (user && user.id && developerId && user.id !== developerId) {
        await base44.entities.Analytics.create({
          user_id: developerId,
          metric_type: 'profile_view',
          metric_value: 1,
          date: new Date().toISOString().split('T')[0],
          metadata: { viewer_id: user.id }
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRobloxData = async (dev) => {
    setLoadingRobloxData(true);
    try {
      const [gamesResponse, groupsResponse] = await Promise.all([
        base44.functions.fetchRobloxUserGames(dev.roblox_user_id),
        base44.functions.fetchRobloxGroups(dev.roblox_user_id)
      ]);

      if (gamesResponse?.success) {
        setRobloxGames(gamesResponse.games || []);
      }
      if (groupsResponse?.success) {
        setRobloxGroups(groupsResponse.groups || []);
      }
    } catch (error) {
      console.error('Error loading Roblox data:', error);
    } finally {
      setLoadingRobloxData(false);
    }
  };

  const handleContactDeveloper = async () => {
    try {
      if (!currentUser) {
        alert('Please log in to send messages');
        return;
      }

      const existingSessions = await base44.entities.ChatSession.filter({
        $or: [
          { participant_1_id: currentUser.id, participant_2_id: developerId },
          { participant_1_id: developerId, participant_2_id: currentUser.id }
        ]
      });

      let sessionId;
      if (existingSessions.length > 0) {
        sessionId = existingSessions[0].id;
      } else {
        const newSession = await base44.entities.ChatSession.create({
          participant_1_id: currentUser.id,
          participant_2_id: developerId,
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

  const getRoleIcon = (role) => {
    const icons = {
      'Scripter': Code,
      'Builder': Briefcase,
      '3D Modeler': AwardIcon,
      'Sound Designer': AwardIcon,
      'Game Designer': Gamepad2,
      'Artist': Palette,
      'Animator': AwardIcon,
      'VFX Designer': AwardIcon,
      'UI/UX Designer': Palette
    };
    return icons[role] || Code;
  };

  const getDisplayName = () => {
    if (developer?.use_roblox_display_name && developer?.roblox_username) {
      return developer.roblox_username;
    }
    return developer?.full_name || 'Developer';
  };

  const getAvatarUrl = () => {
    if (developer?.avatar_url) {
      return developer.avatar_url;
    }
    if (developer?.roblox_verified && developer?.roblox_avatar_url) {
      return developer.roblox_avatar_url;
    }
    return null; // Or a default placeholder image URL if preferred
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!developerId || !developer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Developer Not Found</h2>
          <p className="text-gray-400 mb-6">
            {!developerId ? 'No developer ID provided in the URL.' : 'The profile you are looking for does not exist.'}
          </p>
          <Button
            onClick={() => window.location.href = createPageUrl('BrowseProfiles')}
            className="btn-primary text-white"
          >
            Browse Developers
          </Button>
        </div>
      </div>
    );
  }

  const primaryRole = developer.developer_roles?.[0];
  const RoleIcon = getRoleIcon(primaryRole);
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : developer.rating || 0;

  const portfolioGames = portfolio.filter(item => 
    item.category === 'Full Game' && item.game_link
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header Card */}
        <Card className="glass-card border-0 overflow-hidden">
          {/* Custom Banner OR Animated Gradient Banner */}
          <div className="h-48 relative overflow-hidden">
            {developer?.banner_url ? (
              <img 
                src={developer.banner_url}
                alt="Profile Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              </div>
            )}
            
            {/* Reputation Tier Badge */}
            {developer?.roblox_verified && developer?.roblox_reputation_tier && developer.roblox_reputation_tier !== 'Unverified' && (
              <div className="absolute top-4 right-4">
                <div className={`px-4 py-2 rounded-xl backdrop-blur-xl shadow-xl border ${
                  developer.roblox_reputation_tier === 'Legend' ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-yellow-400/50' :
                  developer.roblox_reputation_tier === 'Diamond' ? 'bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border-cyan-400/50' :
                  developer.roblox_reputation_tier === 'Platinum' ? 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-300/50' :
                  developer.roblox_reputation_tier === 'Gold' ? 'bg-gradient-to-r from-yellow-300/20 to-yellow-500/20 border-yellow-400/50' :
                  developer.roblox_reputation_tier === 'Silver' ? 'bg-gradient-to-r from-gray-200/20 to-gray-300/20 border-gray-300/50' :
                  'bg-gradient-to-r from-orange-400/20 to-orange-600/20 border-orange-400/50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Crown className={`w-5 h-5 ${
                      developer.roblox_reputation_tier === 'Legend' ? 'text-yellow-400' :
                      developer.roblox_reputation_tier === 'Diamond' ? 'text-cyan-400' :
                      developer.roblox_reputation_tier === 'Platinum' ? 'text-gray-300' :
                      developer.roblox_reputation_tier === 'Gold' ? 'text-yellow-400' :
                      developer.roblox_reputation_tier === 'Silver' ? 'text-gray-300' :
                      'text-orange-400'
                    }`} />
                    <span className="text-white font-bold">{developer.roblox_reputation_tier}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-8 -mt-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()}
                      alt={getDisplayName()}
                      className="relative w-24 h-24 rounded-full object-cover ring-4 ring-white/20 shadow-2xl"
                    />
                  ) : (
                    <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center ring-4 ring-white/20 shadow-2xl">
                      <UserIcon className="w-12 h-12 text-white" />
                    </div>
                  )}
                  
                  {developer.roblox_verified && (
                    <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 border-2 border-[#0a0a0a] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left pt-16 md:pt-12">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{getDisplayName()}</h1>
                  {developer.roblox_verified && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                {!developer?.use_roblox_display_name && developer?.roblox_username && (
                  <p className="text-gray-400 text-lg mb-3">@{developer.roblox_username}</p>
                )}
                
                {/* Enhanced Stats Row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold text-lg">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">({reviews.length})</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-semibold text-lg">Level {developer.level || 1}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg">
                    <Briefcase className="w-5 h-5 text-green-400" />
                    <span className="text-white font-semibold text-lg">{developer.completed_projects || 0}</span>
                  </div>
                  {developer.location && (
                    <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-400 text-sm">{developer.location}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-300 text-lg mb-4 max-w-3xl">{developer.bio}</p>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                  <Button onClick={handleContactDeveloper} className="btn-primary text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Me
                  </Button>
                  {developer.portfolio_links?.roblox_profile && (
                    <Button variant="outline" className="glass-card border-0 text-white" asChild>
                      <a href={developer.portfolio_links.roblox_profile} target="_blank" rel="noopener noreferrer">
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Roblox
                      </a>
                    </Button>
                  )}
                  {developer.portfolio_links?.github && (
                    <Button variant="outline" className="glass-card border-0 text-white" asChild>
                      <a href={developer.portfolio_links.github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Work Status Badge */}
              <Badge className={`${
                developer.work_status === 'Open to Work' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse' 
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              } px-6 py-3 text-lg font-bold`}>
                {developer.work_status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Grid WITH REPUTATION */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="glass-card border-0 card-hover">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{developer.experience_level}</p>
              <p className="text-gray-400 text-sm">Experience</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0 card-hover">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{developer.years_of_experience || 0}+</p>
              <p className="text-gray-400 text-sm">Years</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0 card-hover">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{developer.level || 1}</p>
              <p className="text-gray-400 text-sm">Level</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0 card-hover">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{developer.xp_points || 0}</p>
              <p className="text-gray-400 text-sm">XP Points</p>
            </CardContent>
          </Card>
          {developer.roblox_verified && (
            <Card className="glass-card border-0 card-hover">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{developer.roblox_reputation_score || 0}</p>
                <p className="text-gray-400 text-sm">{developer.roblox_reputation_tier || 'Reputation'}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Elite Badges Section - Under Stats */}
        {(developer?.rdc_verified || developer?.devforum_verified) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {developer.rdc_verified && developer.rdc_verification_status === 'approved' && (
              <div className="glass-card rounded-xl p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">RDC Attendee</p>
                  <p className="text-purple-300 text-xs">
                    {developer.rdc_years && developer.rdc_years.length > 0 
                      ? `${developer.rdc_years.join(', ')}`
                      : 'Verified'}
                  </p>
                </div>
              </div>
            )}

            {developer.devforum_verified && (
              <div className="glass-card rounded-xl p-4 bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">DevForum {developer.devforum_trust_level}</p>
                  <p className="text-orange-300 text-xs">@{developer.devforum_username}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Connected Accounts Section - NEW */}
        {(developer?.roblox_verified || developer?.github_verified || developer?.portfolio_links?.youtube || developer?.portfolio_links?.twitter) && (
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-blue-400" />
                Connected Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Roblox Account */}
                {developer?.roblox_verified && (
                  <Card className="glass-card border-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                          <Gamepad2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">Roblox</p>
                          <p className="text-gray-400 text-xs">@{developer.roblox_username}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      {developer.roblox_stats_summary?.total_visits > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="text-center bg-white/5 rounded p-2">
                            <p className="text-white font-bold text-sm">
                              {developer.roblox_stats_summary.total_visits >= 1000000 
                                ? `${(developer.roblox_stats_summary.total_visits / 1000000).toFixed(1)}M`
                                : `${(developer.roblox_stats_summary.total_visits / 1000).toFixed(0)}K`}
                            </p>
                            <p className="text-gray-400 text-xs">Visits</p>
                          </div>
                          <div className="text-center bg-white/5 rounded p-2">
                            <p className="text-white font-bold text-sm">{developer.roblox_stats_summary.total_games || 0}</p>
                            <p className="text-gray-400 text-xs">Games</p>
                          </div>
                        </div>
                      )}
                      {developer.portfolio_links?.roblox_profile && (
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0"
                          asChild
                        >
                          <a href={developer.portfolio_links.roblox_profile} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View Profile
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* GitHub Account */}
                {developer?.github_verified && (
                  <Card className="glass-card border-0 bg-gradient-to-br from-gray-700/10 to-gray-900/10 card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                          <Github className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">GitHub</p>
                          <p className="text-gray-400 text-xs">@{developer.github_username}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      {developer.portfolio_links?.github && (
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-gray-700/20 text-gray-300 hover:bg-gray-700/30 border-0"
                          asChild
                        >
                          <a href={developer.portfolio_links.github} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View Profile
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Other Links */}
                {developer?.portfolio_links?.youtube && (
                  <Card className="glass-card border-0 bg-gradient-to-br from-red-600/10 to-red-800/10 card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">YouTube</p>
                          <p className="text-gray-400 text-xs">Channel</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 bg-red-600/20 text-red-400 hover:bg-red-600/30 border-0"
                        asChild
                      >
                        <a href={developer.portfolio_links.youtube} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Watch Videos
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {developer?.portfolio_links?.twitter && (
                  <Card className="glass-card border-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                          <Twitter className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">Twitter</p>
                          <p className="text-gray-400 text-xs">@{developer.portfolio_links.twitter.split('/').pop()}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 bg-blue-400/20 text-blue-400 hover:bg-blue-400/30 border-0"
                        asChild
                      >
                        <a href={developer.portfolio_links.twitter} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Follow
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-card border-0 mb-6 flex flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="games">Games ({robloxGames.length})</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio ({portfolio.length})</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Skills & Roles */}
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="text-white">Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-3">Roles</p>
                      <div className="flex flex-wrap gap-2">
                        {developer.developer_roles?.map(role => (
                          <Badge key={role} className="bg-indigo-500/20 text-indigo-300 border-0 px-3 py-1">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-3">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {developer.skills?.slice(0, 20).map(skill => (
                          <Badge key={skill} className="bg-white/5 text-gray-300 border-0">
                            {skill}
                          </Badge>
                        ))}
                        {developer.skills?.length > 20 && (
                          <Badge className="bg-white/5 text-gray-400 border-0">
                            +{developer.skills.length - 20} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-3">Payment Preferences</p>
                      <div className="flex flex-wrap gap-2">
                        {developer.payment_preferences?.map(payment => (
                          <Badge key={payment} className="bg-green-500/20 text-green-400 border-0">
                            {payment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* NEW: Roblox Reputation for verified users */}
                {developer.roblox_verified && (
                  <RobloxReputationCard user={developer} />
                )}
              </div>
            </div>

            {/* Roblox Groups */}
            {robloxGroups.length > 0 && (
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Roblox Groups ({robloxGroups.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {robloxGroups.slice(0, 6).map(group => (
                      <Card key={group.id} className="glass-card border-0 bg-white/5 card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="text-white font-medium text-sm line-clamp-1">{group.name}</h5>
                                {group.has_verified_badge && (
                                  <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                )}
                              </div>
                              <Badge className={`text-xs mb-2 ${
                                group.role.rank >= 250 ? 'bg-yellow-500/20 text-yellow-400' :
                                group.role.rank >= 200 ? 'bg-purple-500/20 text-purple-400' :
                                group.role.rank >= 100 ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                              } border-0`}>
                                {group.role.name}
                              </Badge>
                              <p className="text-gray-400 text-xs">
                                {group.member_count.toLocaleString()} members
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AwardIcon className="w-5 h-5 text-yellow-400" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {certifications.map(cert => (
                      <Card key={cert.id} className="glass-card border-0 bg-white/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              cert.certification_level === 'expert' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                              cert.certification_level === 'advanced' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                              cert.certification_level === 'intermediate' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                              'bg-gradient-to-br from-gray-500 to-gray-600'
                            }`}>
                              <AwardIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">{cert.skill_name}</h4>
                              <Badge className={`${
                                cert.certification_level === 'expert' ? 'bg-yellow-500/20 text-yellow-400' :
                                cert.certification_level === 'advanced' ? 'bg-purple-500/20 text-purple-400' :
                                cert.certification_level === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                              } border-0 text-xs capitalize mb-2`}>
                                {cert.certification_level}
                              </Badge>
                              <p className="text-gray-400 text-xs">Score: {cert.score}/100</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="games">
            {robloxGames.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {robloxGames.map(game => (
                  <Card key={game.id} className="glass-card border-0 overflow-hidden card-hover">
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                      {game.thumbnail_url ? (
                        <img 
                          src={game.thumbnail_url}
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      {game.playing > 0 && (
                        <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          {game.playing} playing
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h5 className="text-white font-medium mb-3 line-clamp-1">{game.title}</h5>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {game.visits > 0 && (
                          <div className="text-center glass-card rounded p-2">
                            <Eye className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                            <p className="text-white font-bold text-sm">
                              {game.visits >= 1000000 ? `${(game.visits / 1000000).toFixed(1)}M` : 
                               (game.visits >= 1000 ? `${(game.visits / 1000).toFixed(1)}K` : 
                               game.visits)}
                            </p>
                            <p className="text-gray-400 text-xs">Visits</p>
                          </div>
                        )}
                        {game.likes > 0 && (
                          <div className="text-center glass-card rounded p-2">
                            <ThumbsUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                            <p className="text-white font-bold text-sm">
                              {game.likes >= 1000 ? `${(game.likes / 1000).toFixed(1)}K` : game.likes}
                            </p>
                            <p className="text-gray-400 text-xs">Likes</p>
                          </div>
                        )}
                        {game.favorites > 0 && (
                          <div className="text-center glass-card rounded p-2">
                            <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                            <p className="text-white font-bold text-sm">
                              {game.favorites >= 1000 ? `${(game.favorites / 1000).toFixed(1)}K` : game.favorites}
                            </p>
                            <p className="text-gray-400 text-xs">Favs</p>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => window.open(game.game_url, '_blank')}
                        className="w-full btn-primary text-white"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play Game
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card border-0">
                <CardContent className="p-12 text-center">
                  <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No Roblox games found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            {portfolio.length === 0 ? (
              <Card className="glass-card border-0">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No portfolio items yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {portfolio.map(item => (
                  <Card key={item.id} className="glass-card border-0 card-hover overflow-hidden">
                    {item.images?.[0] && (
                      <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                              {item.category}
                            </Badge>
                            {item.role && (
                              <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                                {item.role}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {item.featured && (
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                      {item.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {item.technologies.slice(0, 4).map(tech => (
                            <Badge key={tech} className="bg-white/5 text-gray-300 border-0 text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {item.game_link && (
                          <Button size="sm" variant="outline" className="glass-card border-0 text-white" asChild>
                            <a href={item.game_link} target="_blank" rel="noopener noreferrer">
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </a>
                          </Button>
                        )}
                        {item.github_url && (
                          <Button size="sm" variant="outline" className="glass-card border-0 text-white" asChild>
                            <a href={item.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="w-3 h-3 mr-1" />
                              Code
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="experience">
            {workExperience.length === 0 ? (
              <Card className="glass-card border-0">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No work experience listed</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {workExperience.map(exp => (
                  <Card key={exp.id} className="glass-card border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {exp.company_logo_url ? (
                          <img 
                            src={exp.company_logo_url} 
                            alt={exp.company_name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-1">{exp.job_title}</h3>
                          <p className="text-gray-300 mb-2">{exp.company_name}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                              {exp.employment_type}
                            </Badge>
                            {exp.location && (
                              <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                                {exp.location}
                              </Badge>
                            )}
                            <span className="text-gray-400 text-xs">
                              {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              {' - '}
                              {exp.is_current 
                                ? 'Present' 
                                : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-gray-400 text-sm mb-3">{exp.description}</p>
                          )}
                          {exp.skills_used && exp.skills_used.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {exp.skills_used.map(skill => (
                                <Badge key={skill} className="bg-white/5 text-gray-300 border-0 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {reviews.length === 0 ? (
              <Card className="glass-card border-0">
                <CardContent className="p-12 text-center">
                  <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              reviews.map(review => (
                <Card key={review.id} className="glass-card border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                            />
                          ))}
                        </div>
                        <span className="text-white font-semibold text-lg">{review.rating}.0</span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(review.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{review.review_text}</p>
                    {review.categories && (
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(review.categories).map(([key, value]) => (
                          <div key={key} className="glass-card rounded p-3 text-center">
                            <p className="text-gray-400 text-xs capitalize mb-1">{key}</p>
                            <p className="text-white font-semibold">{value}/5</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
