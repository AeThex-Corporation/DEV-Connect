
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { DEVELOPER_ROLES, PAYMENT_TYPES, EXPERIENCE_LEVELS, WORK_STATUSES } from "@/components/utils/constants";
import { getWorkStatusColor } from "@/components/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User as UserIcon,
  Star,
  Github,
  ExternalLink,
  Edit,
  Save,
  Plus,
  X,
  Upload,
  Camera,
  Play,
  Image as ImageIcon,
  Briefcase,
  Award,
  CheckCircle,
  Sparkles,
  MessageSquare,
  Brain,
  Lightbulb,
  Target,
  Map,
  RefreshCw,
  Loader2,
  Twitter,
  Linkedin,
  Youtube,
  Palette,
  Link as LinkIcon,
  Link2,
  Building,
  Users,
  Eye,
  ThumbsUp,
  Trophy,
  MapPin,
  Crown
} from "lucide-react";
import GamificationWidget from "../components/GamificationSystem";
import AILearningPathGenerator from "../components/AILearningPathGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvatarCustomizer from "../components/AvatarCustomizer";
import SkillEndorsements from "../components/SkillEndorsements";
import RobloxVerification from "../components/RobloxVerification";
import GameStatsRefresher from "../components/GameStatsRefresher";
import AIProfileAssistant from '../components/AIProfileAssistant';
import AIProjectGenerator from '../components/AIProjectGenerator';
import AISkillGapAnalyzer from '../components/AISkillGapAnalyzer';
import AICareerRoadmapGenerator from '../components/AICareerRoadmapGenerator';
import GitHubVerification from '../components/GitHubVerification';
import RobloxReputationCard from '../components/RobloxReputationCard';
import DevForumVerification from '../components/DevForumVerification';
import RDCVerification from '../components/RDCVerification';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [formData, setFormData] = useState({});
  const [newSkill, setNewSkill] = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [showProjectGenerator, setShowProjectGenerator] = useState(false);
  const [showSkillAnalyzer, setShowSkillAnalyzer] = useState(false);
  const [showRoadmapGenerator, setShowRoadmapGenerator] = useState(false);
  const [syncingRoblox, setSyncingRoblox] = useState(false);
  const [editingLinks, setEditingLinks] = useState(false);
  const [linksFormData, setLinksFormData] = useState({});

  const [robloxGames, setRobloxGames] = useState([]);
  const [robloxGroups, setRobloxGroups] = useState([]);
  const [loadingRobloxData, setLoadingRobloxData] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupGames, setGroupGames] = useState([]);
  const [loadingGroupGames, setLoadingGroupGames] = useState(false);
  const [claimingGroup, setClaimingGroup] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [studios, setStudios] = useState([]); // ADDED

  useEffect(() => {
    loadProfile();
    loadPortfolio();
    loadCertifications();
    loadWorkExperience();
    loadCompanyProfile();
    loadStudios(); // ADDED
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setFormData({
        full_name: currentUser.full_name || "",
        developer_roles: currentUser.developer_roles || [],
        skills: currentUser.skills || [],
        portfolio_links: currentUser.portfolio_links || {},
        work_status: currentUser.work_status || "Open to Work",
        payment_preferences: currentUser.payment_preferences || [],
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        experience_level: currentUser.experience_level || "Intermediate",
        roblox_username: currentUser.roblox_username || "",
        years_of_experience: currentUser.years_of_experience || 0,
        use_roblox_display_name: currentUser.use_roblox_display_name || false,
        use_roblox_avatar: currentUser.use_roblox_avatar || false,
        banner_url: currentUser.banner_url || ""
      });
      setLinksFormData(currentUser.portfolio_links || {});
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      const currentUser = await base44.auth.me();
      const portfolioItems = await base44.entities.Portfolio.filter({
        user_id: currentUser.id
      }, '-created_date');
      setPortfolio(portfolioItems);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };

  const loadCertifications = async () => {
    try {
      const currentUser = await base44.auth.me();
      const certs = await base44.entities.Certification.filter({
        user_id: currentUser.id,
        status: 'active'
      }, '-issued_date');
      setCertifications(certs);
    } catch (error) {
      console.error('Error loading certifications:', error);
    }
  };

  const loadWorkExperience = async () => {
    try {
      const currentUser = await base44.auth.me();
      const experience = await base44.entities.WorkExperience.filter({
        user_id: currentUser.id
      }, '-start_date');
      setWorkExperience(experience);
    } catch (error) {
      console.error('Error loading work experience:', error);
    }
  };

  const loadCompanyProfile = async () => {
    try {
      const currentUser = await base44.auth.me();
      const profiles = await base44.entities.CompanyProfile.filter({
        user_id: currentUser.id
      });
      if (profiles.length > 0) {
        setCompanyProfile(profiles[0]);
      } else {
        setCompanyProfile(null);
      }
    } catch (error) {
      console.error('Error loading company profile:', error);
    }
  };

  // ADDED
  const loadStudios = async () => {
    try {
      const currentUser = await base44.auth.me();
      const profiles = await base44.entities.CompanyProfile.filter({
        user_id: currentUser.id
      });
      
      if (profiles.length > 0) {
        const allStudios = await base44.entities.Studio.filter({
          company_profile_id: profiles[0].id
        });
        setStudios(allStudios);
      } else {
        setStudios([]);
      }
    } catch (error) {
      console.error('Error loading studios:', error);
    }
  };

  const loadRobloxData = async () => {
    if (!user?.roblox_verified || !user?.roblox_user_id) return;

    setLoadingRobloxData(true);
    try {
      const gamesResponse = await base44.functions.fetchRobloxUserGames(user.roblox_user_id);

      if (gamesResponse && gamesResponse.success) {
        setRobloxGames(gamesResponse.games || []);
      }

      const groupsResponse = await base44.functions.fetchRobloxGroups(user.roblox_user_id);

      if (groupsResponse && groupsResponse.success) {
        setRobloxGroups(groupsResponse.groups || []);
      }
    } catch (error) {
      console.error('Error loading Roblox data:', error);
    } finally {
      setLoadingRobloxData(false);
    }
  };

  const loadGroupGames = async (groupId) => {
    setLoadingGroupGames(true);
    try {
      const result = await base44.functions.fetchGroupGames(groupId);

      if (result && result.success) {
        setGroupGames(result.games || []);
      }
    } catch (error) {
      console.error('Error loading group games:', error);
    } finally {
      setLoadingGroupGames(false);
    }
  };

  const handleGroupClick = async (group) => {
    if (selectedGroup?.id === group.id) {
      setSelectedGroup(null);
      setGroupGames([]);
    } else {
      setSelectedGroup(group);
      await loadGroupGames(group.id);
    }
  };

  const handleClaimGroupAsStudio = async (group) => {
    // Check if user is owner or high rank
    if (group.role.rank < 250) {
      alert('You must be the owner or have a high rank (250+) in the group to claim it as your studio.');
      return;
    }

    // Check if company profile exists
    if (!companyProfile) {
      if (!confirm('You need to create a Company Profile first. Would you like to do that now?')) {
        return;
      }
      window.location.href = createPageUrl('EditCompanyProfile'); // Assuming this leads to company profile creation
      return;
    }

    // Check if this group is already claimed as a studio
    const alreadyClaimed = studios.some(s => s.roblox_group_id === String(group.id));
    if (alreadyClaimed) {
      alert('This group is already claimed as a studio!');
      return;
    }

    if (!confirm(`Add "${group.name}" as a studio under ${companyProfile.company_name}?`)) {
      return;
    }

    setClaimingGroup(true);
    try {
      if (!user) {
        throw new Error("User not loaded. Please try again.");
      }

      console.log('Claiming group as studio:', group);

      const studioData = {
        company_profile_id: companyProfile.id, // Link to existing company profile
        studio_name: group.name,
        description: group.description || `${group.name} - A game development studio`,
        roblox_group_id: String(group.id), // Store group ID as string
        roblox_group_data: { // Store full group data for display
          id: String(group.id),
          name: group.name,
          description: group.description || '',
          memberCount: Number(group.member_count) || 0,
          verified: Boolean(group.has_verified_badge) || false
        },
        user_role_in_group: group.role.name,
        user_rank_in_group: Number(group.role.rank),
        verified: Boolean(group.has_verified_badge) || false,
        status: 'active'
      };

      console.log('Studio data to save:', studioData);

      // Create new Studio entity, not CompanyProfile
      await base44.entities.Studio.create(studioData);

      // Reload studios, not company profile
      await loadStudios();

      // Create notification
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '🏢 Studio Added',
        message: `${group.name} has been added as a studio under ${companyProfile.company_name}!`,
        link: createPageUrl('Teams')
      });

      alert(`✅ Successfully added ${group.name} as a studio! View it on the Teams page.`);
      
      // Refresh the page data
      await loadProfile();
      
    } catch (error) {
      console.error('Error claiming group:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to add studio: ${error.message || 'Unknown error'}. Please check the console for details.`);
    } finally {
      setClaimingGroup(false);
    }
  };

  const handleDisconnectDevForum = async () => {
    if (!confirm('Are you sure you want to disconnect your DevForum account?')) return;

    try {
      await base44.auth.updateMe({
        devforum_verified: false,
        devforum_username: null,
        devforum_trust_level: null,
        devforum_data: null
      });

      await loadProfile();
      alert('DevForum account disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting DevForum:', error);
      alert('Failed to disconnect DevForum account');
    }
  };


  useEffect(() => {
    if (user?.roblox_verified && activeTab === 'accounts') {
      loadRobloxData();
    }
  }, [user?.roblox_verified, activeTab]);

  const getDisplayName = () => {
    if (user?.use_roblox_display_name && user?.roblox_username) {
      return user.roblox_username;
    }
    return user?.full_name || 'User';
  };

  const getAvatarUrl = () => {
    // If user wants to use Roblox avatar and has one
    if (user?.use_roblox_avatar && user?.roblox_data?.avatar_url) {
      return user.roblox_data.avatar_url;
    }
    // Otherwise use custom avatar
    return user?.avatar_url;
  };

  const handleSyncRoblox = async () => {
    if (!user?.roblox_username) {
      alert('Please connect your Roblox account first.');
      return;
    }

    setSyncingRoblox(true);
    try {
      const response = await base44.functions.verifyRobloxUsername(user.roblox_username);

      if (response && response.success) {
        const reputationData = await base44.functions.calculateRobloxReputation(response.userId);
        
        await base44.entities.User.update(user.id, {
          roblox_reputation_score: reputationData.score,
          roblox_reputation_tier: reputationData.tier
        });
        
        await loadProfile();
        await loadRobloxData();

        await base44.entities.Notification.create({
          user_id: user.id,
          type: 'message',
          title: '🔄 Roblox Account Synced',
          message: 'Your Roblox profile data has been refreshed!',
          link: createPageUrl('Profile') + '?tab=accounts'
        });
      } else {
        alert(response.message || 'Failed to sync Roblox account. Please ensure your Roblox profile is public.');
      }
    } catch (error) {
      console.error('Error syncing Roblox:', error);
      alert('Failed to sync Roblox account. Please try again.');
    } finally {
      setSyncingRoblox(false);
    }
  };

  const handleConnectDiscord = async () => {
    alert('Discord connection coming soon! This will allow instant notifications and direct messaging.');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        full_name: formData.full_name || user?.full_name
      };

      await base44.auth.updateMe(dataToSave);
      await loadProfile();
      setEditing(false);

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '✅ Profile Updated',
        message: 'Your profile has been successfully updated!',
        link: createPageUrl('Profile')
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateName = async (newName) => {
    if (!newName.trim()) {
      alert('Name cannot be empty');
      return;
    }

    try {
      await base44.auth.updateMe({ full_name: newName.trim() });
      await loadProfile();
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const toggleRole = (role) => {
    const roles = formData.developer_roles || [];
    if (roles.includes(role)) {
      setFormData({
        ...formData,
        developer_roles: roles.filter(r => r !== role)
      });
    } else {
      setFormData({
        ...formData,
        developer_roles: [...roles, role]
      });
    }
  };

  const togglePayment = (payment) => {
    const payments = formData.payment_preferences || [];
    if (payments.includes(payment)) {
      setFormData({
        ...formData,
        payment_preferences: payments.filter(p => p !== payment)
      });
    } else {
      setFormData({
        ...formData,
        payment_preferences: [...payments, payment]
      });
    }
  };

  const handleSaveAvatar = async (avatarData) => {
    try {
      const params = new URLSearchParams(avatarData);
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;

      await base44.auth.updateMe({
        avatar_customization: avatarData,
        avatar_url: avatarUrl,
        use_roblox_avatar: false
      });

      await loadProfile();
      setShowAvatarCustomizer(false);

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '🎨 Avatar Customized!',
        message: 'Your avatar has been updated successfully!',
        link: createPageUrl('Profile')
      });
    } catch (error) {
      console.error('Error saving avatar:', error);
      alert('Failed to save avatar. Please try again.');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const timestamp = Date.now();
      const avatarUrlWithCache = `${file_url}?t=${timestamp}`;

      await base44.auth.updateMe({
        avatar_url: avatarUrlWithCache,
        avatar_customization: null,
        use_roblox_avatar: false
      });
      await loadProfile();

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '📸 Avatar Updated',
        message: 'Your profile picture has been successfully updated!',
        link: createPageUrl('Profile')
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = null;
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setUploadingBanner(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const timestamp = Date.now();
      const bannerUrlWithCache = `${file_url}?t=${timestamp}`;

      await base44.auth.updateMe({ banner_url: bannerUrlWithCache });
      await loadProfile();

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '🎨 Banner Updated',
        message: 'Your profile banner has been successfully updated!',
        link: createPageUrl('Profile')
      });
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner. Please try again.');
    } finally {
      setUploadingBanner(false);
      e.target.value = null;
    }
  };

  const handleDisconnectRoblox = async () => {
    if (!confirm('Are you sure you want to disconnect your Roblox account?')) return;

    try {
      await base44.auth.updateMe({
        roblox_username: null,
        roblox_user_id: null,
        roblox_verified: false,
        roblox_profile_url: null,
        roblox_data: null,
        roblox_reputation_score: null,
        roblox_reputation_tier: null,
        use_roblox_display_name: false,
        use_roblox_avatar: false
      });

      await loadProfile();
      setRobloxGames([]);
      setRobloxGroups([]);

      alert('Roblox account disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting Roblox:', error);
      alert('Failed to disconnect Roblox account');
    }
  };

  const handleSaveLinks = async () => {
    try {
      await base44.auth.updateMe({
        portfolio_links: linksFormData
      });
      await loadProfile();
      setEditingLinks(false);

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '✅ Social Links Updated',
        message: 'Your connected accounts have been updated!',
        link: createPageUrl('Profile') + '?tab=accounts'
      });
    } catch (error) {
      console.error('Error saving links:', error);
      alert('Failed to save links. Please try again.');
    }
  };

  const calculateRank = () => {
    return user?.leaderboard_rank || '?';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full"></div>
        </div>
      </div>
    );
  }

  if (showAvatarCustomizer) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
        <div className="max-w-5xl w-full">
          <AvatarCustomizer
            currentAvatar={user?.avatar_customization}
            onSave={handleSaveAvatar}
            onCancel={() => setShowAvatarCustomizer(false)}
          />
        </div>
      </div>
    );
  }

  const userPortfolioRobloxGames = portfolio.filter(item =>
    item.category === 'Full Game' && item.game_link
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Profile Header */}
        <Card className="glass-card border-0 overflow-hidden relative">
          {/* Animated Gradient Banner OR Custom Banner */}
          <div className="h-56 relative overflow-hidden group">
            {user?.banner_url ? (
              <img
                src={user.banner_url}
                alt="Profile Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              </div>
            )}

            {/* Banner Upload Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingBanner ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                  <p className="text-white text-sm">Uploading banner...</p>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                  <Upload className="w-8 h-8 text-white" />
                  <span className="text-white font-medium">Change Banner</span>
                  <span className="text-white/70 text-xs">Recommended: 1920x400px</span>
                </label>
              )}
            </div>

            {/* Verification Badge - Fixed Position */}
            {user?.verified && (
              <div className="absolute top-6 right-6 z-10">
                <Badge className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 text-sm font-bold shadow-lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verified
                </Badge>
              </div>
            )}

            {/* Reputation Tier Badge - Top Right */}
            {user?.roblox_verified && user?.roblox_reputation_tier && user.roblox_reputation_tier !== 'Unverified' && (
              <div className="absolute top-6 right-6 z-10">
                <div className={`px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl border-2 ${
                  user.roblox_reputation_tier === 'Legend' ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-yellow-400/50' :
                  user.roblox_reputation_tier === 'Diamond' ? 'bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border-cyan-400/50' :
                  user.roblox_reputation_tier === 'Platinum' ? 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-300/50' :
                  user.roblox_reputation_tier === 'Gold' ? 'bg-gradient-to-r from-yellow-300/20 to-yellow-500/20 border-yellow-400/50' :
                  user.roblox_reputation_tier === 'Silver' ? 'bg-gradient-to-r from-gray-200/20 to-gray-300/20 border-gray-300/50' :
                  'bg-gradient-to-r from-orange-400/20 to-orange-600/20 border-orange-400/50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Crown className={`w-6 h-6 ${
                      user.roblox_reputation_tier === 'Legend' ? 'text-yellow-400' :
                      user.roblox_reputation_tier === 'Diamond' ? 'text-cyan-400' :
                      user.roblox_reputation_tier === 'Platinum' ? 'text-gray-300' :
                      user.roblox_reputation_tier === 'Gold' ? 'text-yellow-400' :
                      user.roblox_reputation_tier === 'Silver' ? 'text-gray-300' :
                      'text-orange-400'
                    }`} />
                    <div>
                      <p className="text-white font-bold text-lg">{user.roblox_reputation_tier}</p>
                      <p className="text-white/80 text-xs">{user.roblox_reputation_score}/1000</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-6 md:p-8 -mt-16">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
              {/* Enhanced Avatar */}
              <div className="relative flex-shrink-0">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()}
                      alt={getDisplayName()}
                      className="relative w-32 h-32 rounded-full object-cover ring-4 ring-white/20 shadow-2xl"
                    />
                  ) : (
                    <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center ring-4 ring-white/20 shadow-2xl">
                      <UserIcon className="w-16 h-16 text-white" />
                    </div>
                  )}

                  {/* Verified Badge (for Roblox) */}
                  {user?.roblox_verified && (
                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 border-4 border-[#0a0a0a] rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}

                  {/* Edit Overlay */}
                  {!user?.use_roblox_avatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingAvatar ? (
                        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <div className="flex gap-2">
                          <label className="cursor-pointer p-2 hover:bg-white/20 rounded-full" title="Upload custom image">
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            <Camera className="w-5 h-5 text-white" />
                          </label>
                          <button
                            onClick={() => setShowAvatarCustomizer(true)}
                            className="p-2 hover:bg-white/20 rounded-full"
                            title="Customize with AI"
                          >
                            <Sparkles className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left pt-20 md:pt-16 w-full">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    {getDisplayName()}
                  </h1>
                </div>

                {(!user?.use_roblox_display_name && user?.roblox_username) && (
                  <p className="text-gray-300 text-lg mb-2">@{user.roblox_username}</p>
                )}
                <p className="text-gray-400 mb-4">{user?.email}</p>

                {/* Enhanced Stats Row with more spacing */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                  <div className="flex items-center gap-2 px-5 py-3 glass-card rounded-xl">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold text-lg">
                      {user?.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-400 text-sm">rating</span>
                  </div>

                  <div className="flex items-center gap-2 px-5 py-3 glass-card rounded-xl">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-semibold text-lg">Level {user?.level || 1}</span>
                  </div>

                  <div className="flex items-center gap-2 px-5 py-3 glass-card rounded-xl">
                    <Briefcase className="w-5 h-5 text-green-400" />
                    <span className="text-white font-semibold text-lg">
                      {user?.completed_projects || 0}
                    </span>
                    <span className="text-gray-400 text-sm">projects</span>
                  </div>

                  {user?.location && (
                    <div className="flex items-center gap-2 px-5 py-3 glass-card rounded-xl">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-400 text-sm">{user.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Status Badge and Edit Button with better spacing */}
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Badge className={`${
                  user?.work_status === 'Open to Work'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse'
                    : user?.work_status === 'Networking Only'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                } px-6 py-3 text-base font-bold shadow-lg backdrop-blur-md whitespace-nowrap`}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  {user?.work_status || 'Open to Work'}
                </Badge>

                <Button
                  onClick={() => {setActiveTab('basic'); setEditing(true);}}
                  variant="outline"
                  size="sm"
                  className="glass-card border-0 text-white hover:bg-white/5"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={() => window.location.href = createPageUrl('PublicProfile') + `?id=${user.id}`}
                  variant="outline"
                  size="sm"
                  className="glass-card border-0 text-white hover:bg-white/5"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card border-0 card-hover cursor-pointer" onClick={() => setActiveTab('basic')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{user?.rating?.toFixed(1) || '0.0'}</p>
              <p className="text-gray-400 text-sm">Average Rating</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 card-hover cursor-pointer" onClick={() => setActiveTab('portfolio')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{user?.completed_projects || 0}</p>
              <p className="text-gray-400 text-sm">Completed Projects</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 card-hover cursor-pointer" onClick={() => setActiveTab('gamification')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">Level {user?.level || 1}</p>
              <p className="text-gray-400 text-sm">Rank #{calculateRank()}</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 card-hover cursor-pointer" onClick={() => setActiveTab('basic')}>
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                user?.work_status === 'Open to Work' ? 'bg-gradient-to-br from-blue-400 to-indigo-500' :
                user?.work_status === 'Networking Only' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}>
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {user?.work_status === 'Open to Work' ? 'Available' :
                 user?.work_status === 'Networking Only' ? 'Networking' :
                 'Unavailable'}
              </p>
              <p className="text-gray-400 text-sm">Work Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-card border-0 mb-6 flex flex-wrap justify-center">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Portfolio ({portfolio.length})
            </TabsTrigger>
            <TabsTrigger value="work-experience" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Experience ({workExperience.length})
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Certifications ({certifications.length})
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Tools
            </TabsTrigger>
          </TabsList>

          {/* Basic Profile Tab Content */}
          <TabsContent value="basic">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* AI Profile Assistant */}
                <AIProfileAssistant user={user} onRefresh={loadProfile} />

                {/* Basic Information */}
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="text-white">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Full Name</Label>
                      {editing ? (
                        <Input
                          value={formData.full_name || ''}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          className="text-lg font-bold bg-white/5 border-white/20 text-white"
                          placeholder="Your Name"
                        />
                      ) : (
                        <p className="text-gray-300 mt-1">{user?.full_name}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-300">Roblox Username</Label>
                      {editing ? (
                        <>
                          <Input
                            value={formData.roblox_username}
                            onChange={(e) => setFormData({...formData, roblox_username: e.target.value})}
                            placeholder="Your Roblox username"
                            className="mt-1 bg-white/5 border-white/20 text-white"
                          />
                          <div className="space-y-2 mt-3">
                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.use_roblox_display_name || false}
                                onChange={(e) => setFormData({...formData, use_roblox_display_name: e.target.checked})}
                                className="rounded"
                              />
                              Use Roblox username as display name
                            </label>
                            {user?.roblox_verified && user?.roblox_data?.avatar_url && (
                              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.use_roblox_avatar || false}
                                  onChange={(e) => setFormData({...formData, use_roblox_avatar: e.target.checked})}
                                  className="rounded"
                                />
                                Use Roblox avatar as profile picture
                              </label>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-300 mt-1">{user?.roblox_username || 'Not specified'}</p>
                          {user?.use_roblox_display_name && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs mt-2">
                              Using as display name
                            </Badge>
                          )}
                          {user?.use_roblox_avatar && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs mt-2 ml-2">
                              Using Roblox avatar
                            </Badge>
                          )}
                        </>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-300">Bio</Label>
                      {editing ? (
                        <Textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          placeholder="Tell us about yourself..."
                          className="mt-1 bg-white/5 border-white/20 text-white"
                        />
                      ) : (
                        <p className="text-gray-300 mt-1">{user?.bio || 'No bio provided'}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-300">Location</Label>
                      {editing ? (
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="Your location/timezone"
                          className="mt-1 bg-white/5 border-white/20 text-white"
                        />
                      ) : (
                        <p className="text-gray-300 mt-1">{user?.location || 'Location not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-300">Years of Experience</Label>
                      {editing ? (
                        <Input
                          type="number"
                          value={formData.years_of_experience}
                          onChange={(e) => setFormData({...formData, years_of_experience: parseInt(e.target.value) || 0})}
                          placeholder="Years of Roblox development experience"
                          className="mt-1 bg-white/5 border-white/20 text-white"
                        />
                      ) : (
                        <p className="text-gray-300 mt-1">{user?.years_of_experience || 0} years</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-300">Experience Level</Label>
                      {editing ? (
                        <Select value={formData.experience_level} onValueChange={(value) => setFormData({...formData, experience_level: value})}>
                          <SelectTrigger className="mt-1 bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPERIENCE_LEVELS.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-gray-300 mt-1">{user?.experience_level}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-300">Work Status</Label>
                      {editing ? (
                        <Select value={formData.work_status} onValueChange={(value) => setFormData({...formData, work_status: value})}>
                          <SelectTrigger className="mt-1 bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WORK_STATUSES.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={`mt-1 ${
                          user?.work_status === 'Open to Work' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          user?.work_status === 'Networking Only' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                          'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                          {user?.work_status}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Developer Roles */}
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="text-white">Developer Roles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <div className="grid grid-cols-2 gap-2">
                        {DEVELOPER_ROLES.map(role => (
                          <Button
                            key={role}
                            variant={formData.developer_roles?.includes(role) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleRole(role)}
                            className={formData.developer_roles?.includes(role)
                              ? "btn-primary text-white"
                              : "glass-card border-white/20 text-white hover:bg-white/5"
                            }
                          >
                            {role}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user?.developer_roles?.length > 0 ? user.developer_roles.map(role => (
                          <Badge key={role} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {role}
                          </Badge>
                        )) : <p className="text-gray-400">No roles selected</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skills with Endorsements */}
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="text-white">Skills & Endorsements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing && (
                      <div className="flex gap-2 mb-4">
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
                    )}

                    {!editing && user ? (
                      <SkillEndorsements
                        userId={user.id}
                        skills={user.skills || []}
                        onEndorsementsChange={loadProfile}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.skills?.length > 0 ? formData.skills.map(skill => (
                          <Badge key={skill} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {skill}
                            {editing && (
                              <button onClick={() => removeSkill(skill)} className="ml-1">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </Badge>
                        )) : <p className="text-gray-400">No skills added</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - 1/3 width */}
              <div className="lg:col-span-1 space-y-6">
                {/* NEW: Roblox Reputation Card */}
                {user?.roblox_verified && (
                  <RobloxReputationCard user={user} onUpdate={loadProfile} />
                )}

                {/* AI Learning Path - NEW */}
                {!editing && (
                  <AILearningPathGenerator user={user} />
                )}

                {/* Payment Preferences */}
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="text-white">Payment Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_TYPES.map(payment => (
                          <Button
                            key={payment}
                            variant={formData.payment_preferences?.includes(payment) ? "default" : "outline"}
                            size="sm"
                            onClick={() => togglePayment(payment)}
                            className={formData.payment_preferences?.includes(payment)
                              ? "btn-primary text-white"
                              : "glass-card border-white/20 text-white hover:bg-white/5"
                            }
                          >
                            {payment}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user?.payment_preferences?.length > 0 ? user.payment_preferences.map(payment => (
                          <Badge key={payment} className="bg-green-500/20 text-green-300 border-green-500/30">
                            {payment}
                          </Badge>
                        )) : <p className="text-gray-400">No payment preferences set</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Portfolio Links (legacy, handled by formData) */}
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="text-white">Portfolio Links (Legacy)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['roblox_games', 'github', 'artstation', 'youtube', 'other'].map(platform => (
                      <div key={platform}>
                        <Label className="text-gray-300 capitalize">{platform.replace('_', ' ')}</Label>
                        {editing ? (
                          <Input
                            value={formData.portfolio_links?.[platform] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              portfolio_links: {
                                ...formData.portfolio_links,
                                [platform]: e.target.value
                              }
                            })}
                            placeholder={`Your ${platform.replace('_', ' ')} link`}
                            className="mt-1 bg-white/5 border-white/20 text-white"
                          />
                        ) : user?.portfolio_links?.[platform] ? (
                          <a
                            href={user.portfolio_links[platform]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-400 hover:text-blue-300 mt-1"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            {user.portfolio_links[platform]}
                          </a>
                        ) : (
                          <p className="text-gray-400 mt-1">No link provided</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {editing && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => {
                    setEditing(false);
                    loadProfile();
                  }}
                  variant="outline"
                  className="mr-4 glass-card border-white/20 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* UPDATED: Connected Accounts Tab */}
          <TabsContent value="accounts">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Connected Accounts</h2>
                <p className="text-gray-400 text-sm">
                  Manage your verified accounts and showcase your work
                </p>
              </div>

              {/* Verified Accounts Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Verified Accounts
                </h3>

                {/* Roblox Connection */}
                <Card className="glass-card border-0 mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.rbxcdn.com/c2be32293c1ce7ca9e186f06a0b3e823"
                          alt="Roblox"
                          className="w-12 h-12"
                        />
                        <div>
                          <h3 className="text-white font-semibold text-lg">Roblox Account</h3>
                          <p className="text-gray-400 text-sm">Connect to showcase games & groups</p>
                        </div>
                      </div>
                      {user?.roblox_verified ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                          Not Connected
                        </Badge>
                      )}
                    </div>

                    {user?.roblox_verified ? (
                      <div className="space-y-6">
                        {/* User Profile Card */}
                        <div className="glass-card rounded-lg p-4 bg-green-500/5">
                          <div className="flex items-center gap-3 mb-3">
                            {user.roblox_data?.avatar_url && (
                              <img
                                src={user.roblox_data.avatar_url}
                                alt="Roblox Avatar"
                                className="w-12 h-12 rounded-full"
                              />
                            )}
                            <div>
                              <p className="text-white font-semibold">@{user.roblox_username}</p>
                              {user.roblox_data?.display_name && (
                                <p className="text-gray-400 text-sm">{user.roblox_data.display_name}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              onClick={handleSyncRoblox}
                              disabled={syncingRoblox}
                              className="btn-primary text-white"
                            >
                              {syncingRoblox ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                  Syncing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-3 h-3 mr-2" />
                                  Sync Data
                                </>
                              )}
                            </Button>
                            {user.roblox_profile_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="glass-card border-0 text-white hover:bg-white/5"
                                asChild
                              >
                                <a href={user.roblox_profile_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3 h-3 mr-2" />
                                  View Profile
                                </a>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleDisconnectRoblox}
                              className="glass-card border-0 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="w-3 h-3 mr-2" />
                              Disconnect
                            </Button>
                          </div>
                        </div>

                        {/* Games Section */}
                        {loadingRobloxData ? (
                          <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Loading your Roblox games & groups...</p>
                          </div>
                        ) : (
                          <>
                            {/* Your Games */}
                            {robloxGames.length > 0 && (
                              <div>
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                  <Play className="w-4 h-4 text-blue-400" />
                                  Your Roblox Games ({robloxGames.length})
                                </h4>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {robloxGames.slice(0, 6).map(game => (
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
                                            <ImageIcon className="w-8 h-8 text-gray-600" />
                                          </div>
                                        )}
                                        {game.playing > 0 && (
                                          <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                            {game.playing} playing
                                          </div>
                                        )}
                                      </div>
                                      <CardContent className="p-3">
                                        <h5 className="text-white font-medium text-sm mb-2 line-clamp-1">{game.title}</h5>
                                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                          <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            {game.visits >= 1000000 ? `${(game.visits / 1000000).toFixed(1)}M` :
                                             game.visits >= 1000 ? `${(game.visits / 1000).toFixed(1)}K` :
                                             game.visits}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <ThumbsUp className="w-3 h-3" />
                                            {game.likes >= 1000 ? `${(game.likes / 1000).toFixed(1)}K` : game.likes}
                                          </span>
                                        </div>
                                        <Button size="sm" variant="outline" className="w-full glass-card border-0 text-white text-xs" asChild>
                                          <a href={game.game_url} target="_blank" rel="noopener noreferrer">
                                            <Play className="w-3 h-3 mr-1" />
                                            Play Game
                                          </a>
                                        </Button>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                                {robloxGames.length > 6 && (
                                  <p className="text-gray-400 text-sm mt-3 text-center">
                                    +{robloxGames.length - 6} more games
                                  </p>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <RobloxVerification
                        user={user}
                        onVerified={loadProfile}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* GitHub Connection */}
                <Card className="glass-card border-0 mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                          <Github className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">GitHub Account</h3>
                          <p className="text-gray-400 text-sm">Link your code repositories</p>
                        </div>
                      </div>
                      {user?.github_verified ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                          Not Connected
                        </Badge>
                      )}
                    </div>

                    <GitHubVerification user={user} onVerified={loadProfile} />
                  </CardContent>
                </Card>

                {/* Discord Connection */}
                <Card className="glass-card border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">Discord Account</h3>
                          <p className="text-gray-400 text-sm">Connect for quick communication</p>
                        </div>
                      </div>
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">
                      Discord integration will enable instant notifications and direct communication with employers.
                    </p>
                    <Button
                      onClick={handleConnectDiscord}
                      disabled
                      variant="outline"
                      className="glass-card border-0 text-gray-500"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Connect Discord (Coming Soon)
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* NEW: DevForum Connection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-400" />
                  Developer Community
                </h3>

                <Card className="glass-card border-0 mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">Roblox DevForum</h3>
                          <p className="text-gray-400 text-sm">Verify your Developer Forum account</p>
                        </div>
                      </div>
                      {user?.devforum_verified ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                          Not Verified
                        </Badge>
                      )}
                    </div>

                    <DevForumVerification user={user} onVerified={loadProfile} />

                    {user?.devforum_verified && (
                      <div className="mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDisconnectDevForum}
                          className="glass-card border-0 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-3 h-3 mr-2" />
                          Disconnect
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* NEW: RDC Verification */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  Elite Developer Status
                </h3>

                <Card className="glass-card border-0 mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">RDC Attendee</h3>
                          <p className="text-gray-400 text-sm">Verify your RDC attendance</p>
                        </div>
                      </div>
                      {user?.rdc_verified && user?.rdc_verification_status === 'approved' ? (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : user?.rdc_verification_status === 'pending' ? (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Pending
                        </Badge>
                      ) : user?.rdc_verification_status === 'rejected' ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          <X className="w-3 h-3 mr-1" />
                          Rejected
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                          Not Verified
                        </Badge>
                      )}
                    </div>

                    <RDCVerification user={user} onVerified={loadProfile} />
                  </CardContent>
                </Card>
              </div>

              {/* ENHANCED: Your Groups Section with Studio Claiming */}
              {loadingRobloxData ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Loading your Roblox games & groups...</p>
                </div>
              ) : robloxGroups.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      Your Roblox Groups ({robloxGroups.length})
                    </h4>
                  </div>

                  {/* Show current company + studios if set */}
                  {companyProfile && (
                    <div className="mb-4 space-y-3">
                      {/* Company Profile */}
                      <div className="glass-card rounded-lg p-4 bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="w-4 h-4 text-blue-400" />
                          <p className="text-blue-400 font-medium text-sm">Your Company</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {companyProfile.logo_url && (
                            <img 
                              src={companyProfile.logo_url}
                              alt={companyProfile.company_name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-white font-semibold">{companyProfile.company_name}</p>
                            <p className="text-gray-400 text-xs">{companyProfile.industry}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-card border-0 text-white hover:bg-white/5"
                            onClick={() => window.location.href = createPageUrl('Teams')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>

                      {/* Studios under this company */}
                      {studios.length > 0 && (
                        <div className="glass-card rounded-lg p-4 bg-green-500/5 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <p className="text-green-400 font-medium text-sm">Your Studios ({studios.length})</p>
                          </div>
                          <div className="space-y-2">
                            {studios.map(studio => (
                              <div key={studio.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                  <Users className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-white font-medium text-sm">{studio.studio_name}</p>
                                  <p className="text-gray-400 text-xs">{studio.roblox_group_data?.memberCount?.toLocaleString()} members</p>
                                </div>
                                {studio.verified && (
                                  <CheckCircle className="w-4 h-4 text-blue-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-3">
                    {robloxGroups.map(group => {
                      const isOwner = group.role.rank >= 250;
                      const isAlreadyStudio = studios.some(s => s.roblox_group_id === String(group.id));
                      
                      return (
                        <div key={group.id}>
                          <Card
                            className={`glass-card border-0 card-hover cursor-pointer transition-all ${
                              selectedGroup?.id === group.id ? 'ring-2 ring-purple-500' : ''
                            } ${isOwner ? 'border-l-4 border-l-yellow-500' : ''}`}
                            onClick={() => handleGroupClick(group)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 ${
                                  isOwner ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-purple-500 to-indigo-500'
                                } rounded-lg flex items-center justify-center flex-shrink-0`}>
                                  {isOwner ? (
                                    <Crown className="w-6 h-6 text-white" />
                                  ) : (
                                    <Users className="w-6 h-6 text-white" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="text-white font-medium text-sm line-clamp-1">{group.name}</h5>
                                    {group.has_verified_badge && (
                                      <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                    )}
                                    {isAlreadyStudio && (
                                      <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                                        Studio
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Badge className={`text-xs ${
                                      group.role.rank >= 250 ? 'bg-yellow-500/20 text-yellow-400' :
                                      group.role.rank >= 200 ? 'bg-purple-500/20 text-purple-400' :
                                      group.role.rank >= 100 ? 'bg-blue-500/20 text-blue-400' :
                                      'bg-gray-500/20 text-gray-400'
                                    } border-0`}>
                                      {group.role.name}
                                    </Badge>
                                    <span className="text-gray-400 text-xs">
                                      {group.member_count.toLocaleString()} members
                                    </span>
                                  </div>
                                  {group.description && (
                                    <p className="text-gray-400 text-xs line-clamp-2 mb-2">{group.description}</p>
                                  )}
                                  
                                  {/* Action Buttons */}
                                  <div className="flex gap-2 flex-wrap">
                                    {isOwner && !isAlreadyStudio && companyProfile && (
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleClaimGroupAsStudio(group);
                                        }}
                                        disabled={claimingGroup}
                                        className="btn-primary text-white text-xs"
                                      >
                                        {claimingGroup ? (
                                          <>
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            Adding...
                                          </>
                                        ) : (
                                          <>
                                            <Building className="w-3 h-3 mr-1" />
                                            Add as Studio
                                          </>
                                        )}
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="glass-card border-0 text-white text-xs"
                                      asChild
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <a href={`https://www.roblox.com/groups/${group.id}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        View
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Show click hint */}
                              <div className="mt-2 text-xs text-purple-400">
                                {selectedGroup?.id === group.id ? '▼ Hide games' : '▶ View group games'}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Group Games Dropdown */}
                          {selectedGroup?.id === group.id && (
                            <div className="mt-3 ml-4 space-y-3">
                              {loadingGroupGames ? (
                                <div className="text-center py-4">
                                  <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto mb-2" />
                                  <p className="text-gray-400 text-sm">Loading group games...</p>
                                </div>
                              ) : groupGames.length > 0 ? (
                                <div className="space-y-2">
                                  <p className="text-purple-400 text-sm font-medium">
                                    {groupGames.length} Games in this group
                                  </p>
                                  {groupGames.slice(0, 5).map(game => (
                                    <Card key={game.id} className="glass-card border-0">
                                      <CardContent className="p-3">
                                        <div className="flex items-start gap-3">
                                          {game.thumbnail_url && (
                                            <img
                                              src={game.thumbnail_url}
                                              alt={game.name}
                                              className="w-16 h-16 rounded object-cover"
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <h6 className="text-white font-medium text-sm mb-1 line-clamp-1">
                                              {game.name}
                                            </h6>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                              <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {game.visits >= 1000000 ? `${(game.visits / 1000000).toFixed(1)}M` :
                                                 game.visits >= 1000 ? `${(game.visits / 1000).toFixed(1)}K` :
                                                 game.visits}
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <ThumbsUp className="w-3 h-3" />
                                                {game.likes >= 1000 ? `${(game.likes / 1000).toFixed(1)}K` : game.likes}
                                              </span>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="mt-2 glass-card border-0 text-white text-xs"
                                              asChild
                                            >
                                              <a href={game.game_url} target="_blank" rel="noopener noreferrer">
                                                <Play className="w-3 h-3 mr-1" />
                                                Play
                                              </a>
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                  {groupGames.length > 5 && (
                                    <p className="text-gray-500 text-xs text-center">
                                      +{groupGames.length - 5} more games
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm text-center py-4">
                                  No games found in this group
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Info about group ownership */}
                  <div className="mt-4 glass-card rounded-lg p-4 bg-blue-500/5">
                    <p className="text-blue-400 text-sm flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4" />
                      <strong>Own a group?</strong>
                    </p>
                    <p className="text-gray-400 text-xs">
                      Groups where you're the owner or have rank 250+ can be added as studios under your company. {!companyProfile && 'Create a company profile first on the Teams page!'}
                    </p>
                  </div>
                </div>
              )}

              {robloxGames.length === 0 && robloxGroups.length === 0 && !loadingRobloxData && (
                <div className="text-center py-8 glass-card rounded-lg">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No games or groups found</p>
                  <p className="text-gray-500 text-sm mt-1">Make sure your Roblox profile is public</p>
                </div>
              )}

              {/* Social Media & Portfolio Links Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-400" />
                    Social Media & Portfolio Links
                  </h3>
                  {!editingLinks ? (
                    <Button
                      onClick={() => {
                        setLinksFormData(user?.portfolio_links || {});
                        setEditingLinks(true);
                      }}
                      size="sm"
                      className="btn-primary text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Links
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingLinks(false);
                          setLinksFormData(user?.portfolio_links || {});
                        }}
                        size="sm"
                        variant="outline"
                        className="glass-card border-0 text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveLinks}
                        size="sm"
                        className="btn-primary text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Twitter/X */}
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                          <Twitter className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">Twitter / X</h4>
                          <p className="text-gray-400 text-xs">Your Twitter profile</p>
                        </div>
                      </div>
                      {editingLinks ? (
                        <Input
                          value={linksFormData.twitter || ''}
                          onChange={(e) => setLinksFormData({...linksFormData, twitter: e.target.value})}
                          placeholder="https://twitter.com/username"
                          className="bg-white/5 border-white/20 text-white text-sm"
                        />
                      ) : user?.portfolio_links?.twitter ? (
                        <a
                          href={user.portfolio_links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Profile
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not connected</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* LinkedIn */}
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Linkedin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">LinkedIn</h4>
                          <p className="text-gray-400 text-xs">Professional network</p>
                        </div>
                      </div>
                      {editingLinks ? (
                        <Input
                          value={linksFormData.linkedin || ''}
                          onChange={(e) => setLinksFormData({...linksFormData, linkedin: e.target.value})}
                          placeholder="https://linkedin.com/in/username"
                          className="bg-white/5 border-white/20 text-white text-sm"
                        />
                      ) : user?.portfolio_links?.linkedin ? (
                        <a
                          href={user.portfolio_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Profile
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not connected</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* YouTube */}
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                          <Youtube className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">YouTube</h4>
                          <p className="text-gray-400 text-xs">Video content channel</p>
                        </div>
                      </div>
                      {editingLinks ? (
                        <Input
                          value={linksFormData.youtube || ''}
                          onChange={(e) => setLinksFormData({...linksFormData, youtube: e.target.value})}
                          placeholder="https://youtube.com/@username"
                          className="bg-white/5 border-white/20 text-white text-sm"
                        />
                      ) : user?.portfolio_links?.youtube ? (
                        <a
                          href={user.portfolio_links.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Channel
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not connected</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* ArtStation */}
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">ArtStation</h4>
                          <p className="text-gray-400 text-xs">Art portfolio</p>
                        </div>
                      </div>
                      {editingLinks ? (
                        <Input
                          value={linksFormData.artstation || ''}
                          onChange={(e) => setLinksFormData({...linksFormData, artstation: e.target.value})}
                          placeholder="https://artstation.com/username"
                          className="bg-white/5 border-white/20 text-white text-sm"
                        />
                      ) : user?.portfolio_links?.artstation ? (
                        <a
                          href={user.portfolio_links.artstation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Portfolio
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not connected</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Behance */}
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">Behance</h4>
                          <p className="text-gray-400 text-xs">Design showcase</p>
                        </div>
                      </div>
                      {editingLinks ? (
                        <Input
                          value={linksFormData.behance || ''}
                          onChange={(e) => setLinksFormData({...linksFormData, behance: e.target.value})}
                          placeholder="https://behance.net/username"
                          className="bg-white/5 border-white/20 text-white text-sm"
                        />
                      ) : user?.portfolio_links?.behance ? (
                        <a
                          href={user.portfolio_links.behance}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Portfolio
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not connected</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Dribbble */}
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">Dribbble</h4>
                          <p className="text-gray-400 text-xs">Design work</p>
                        </div>
                      </div>
                      {editingLinks ? (
                        <Input
                          value={linksFormData.dribbble || ''}
                          onChange={(e) => setLinksFormData({...linksFormData, dribbble: e.target.value})}
                          placeholder="https://dribbble.com/username"
                          className="bg-white/5 border-white/20 text-white text-sm"
                        />
                      ) : user?.portfolio_links?.dribbble ? (
                        <a
                          href={user.portfolio_links.dribbble}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Work
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not connected</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* DevForum */}
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">DevForum</h4>
                          <p className="text-gray-400 text-xs">Roblox developer forum</p>
                        </div>
                      </div>
                      {editingLinks ? (
                        <Input
                          value={linksFormData.devforum || ''}
                          onChange={(e) => setLinksFormData({...linksFormData, devforum: e.target.value})}
                          placeholder="https://devforum.roblox.com/u/username"
                          className="bg-white/5 border-white/20 text-white text-sm"
                        />
                      ) : user?.portfolio_links?.devforum ? (
                        <a
                          href={user.portfolio_links.devforum}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Profile
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not connected</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Other/Custom Link */}
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                          <LinkIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">Other Link</h4>
                          <p className="text-gray-400 text-xs">Personal website or portfolio</p>
                        </div>
                      </div>
                      {editingLinks ? (
                        <Input
                          value={linksFormData.other || ''}
                          onChange={(e) => setLinksFormData({...linksFormData, other: e.target.value})}
                          placeholder="https://yoursite.com"
                          className="bg-white/5 border-white/20 text-white text-sm"
                        />
                      ) : user?.portfolio_links?.other ? (
                        <a
                          href={user.portfolio_links.other}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Visit Website
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not connected</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">My Portfolio</h2>
                  <p className="text-gray-400 text-sm">
                    Showcase your best work to attract employers
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = createPageUrl('UploadPortfolio')}
                  className="btn-primary text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>

              {/* Featured Roblox Games Section */}
              {userPortfolioRobloxGames.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-green-400" />
                    My Roblox Games
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {userPortfolioRobloxGames.map(game => (
                      <Card key={game.id} className="glass-card border-0 card-hover overflow-hidden">
                        <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 relative">
                          {game.images?.[0] ? (
                            <img
                              src={game.images[0]}
                              alt={game.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900"><svg class="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg><p class="text-gray-400 text-sm mt-2">No thumbnail</p></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <div className="text-center">
                                <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No thumbnail</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold text-lg mb-1">{game.title}</h4>
                              {game.featured && (
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 inline mr-1" />
                              )}
                            </div>
                          </div>

                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {game.description}
                          </p>

                          {/* Game Stats - Large Display */}
                          {game.game_stats && (game.game_stats.visits > 0 || game.game_stats.likes > 0 || game.game_stats.favorites > 0) ? (
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              {game.game_stats.visits > 0 && (
                                <div className="text-center glass-card rounded p-3">
                                  <p className="text-xs text-gray-400 mb-1">Visits</p>
                                  <p className="text-white font-bold text-lg">
                                    {game.game_stats.visits >= 1000000
                                      ? (game.game_stats.visits / 1000000).toFixed(1) + 'M'
                                      : game.game_stats.visits >= 1000
                                      ? (game.game_stats.visits / 1000).toFixed(1) + 'K'
                                      : game.game_stats.visits}
                                  </p>
                                </div>
                              )}
                              {game.game_stats.likes > 0 && (
                                <div className="text-center glass-card rounded p-3">
                                  <p className="text-xs text-gray-400 mb-1">Likes</p>
                                  <p className="text-white font-bold text-lg">
                                    {game.game_stats.likes >= 1000
                                      ? (game.game_stats.likes / 1000).toFixed(1) + 'K'
                                      : game.game_stats.likes}
                                  </p>
                                </div>
                              )}
                              {game.game_stats.favorites > 0 && (
                                <div className="text-center glass-card rounded p-3">
                                  <p className="text-xs text-gray-400 mb-1">Favorites</p>
                                  <p className="text-white font-bold text-lg">
                                    {game.game_stats.favorites >= 1000
                                      ? (game.game_stats.favorites / 1000).toFixed(1) + 'K'
                                      : game.game_stats.favorites}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : null}

                          {/* Game Stats Refresher */}
                          <GameStatsRefresher
                            portfolioItem={game}
                            onUpdated={loadPortfolio}
                          />

                          {/* Technologies */}
                          {game.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3 mt-3">
                              {game.technologies.slice(0, 5).map(tech => (
                                <Badge key={tech} className="bg-white/5 text-gray-300 border-0 text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Links */}
                          <div className="flex gap-2 flex-wrap">
                            {game.game_link && (
                              <Button size="sm" className="btn-primary text-white" asChild>
                                <a href={game.game_link} target="_blank" rel="noopener noreferrer">
                                  <Play className="w-3 h-3 mr-1" />
                                  Play Game
                                </a>
                              </Button>
                            )}
                            {game.github_url && (
                              <Button size="sm" variant="outline" className="glass-card border-0 text-white text-xs" asChild>
                                <a href={game.github_url} target="_blank" rel="noopener noreferrer">
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
                </div>
              )}

              {/* All Portfolio Items */}
              {portfolio.length === 0 ? (
                <Card className="glass-card border-0">
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Portfolio Items Yet</h3>
                    <p className="text-gray-400 mb-6">
                      Start building your portfolio by adding your best projects
                    </p>
                    <Button
                      onClick={() => window.location.href = createPageUrl('UploadPortfolio')}
                      className="btn-primary text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">All Projects</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {portfolio.map(item => (
                      <Card key={item.id} className="glass-card border-0 card-hover overflow-hidden">
                        <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900"><svg class="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg><p class="text-gray-400 text-sm mt-2">No image</p></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <div className="text-center">
                                <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No image</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                              <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs mb-2">
                                {item.category}
                              </Badge>
                              {item.role && (
                                <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs ml-1">
                                  {item.role}
                                </Badge>
                              )}
                            </div>
                            {item.featured && (
                              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            )}
                          </div>

                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>

                          {/* Technologies */}
                          {item.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {item.technologies.slice(0, 5).map(tech => (
                                <Badge key={tech} className="bg-white/5 text-gray-300 border-0 text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {item.technologies.length > 5 && (
                                <Badge className="bg-white/5 text-gray-400 border-0 text-xs">
                                  +{item.technologies.length - 5}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Game Stats */}
                          {item.game_stats && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {item.game_stats.visits && (
                                <div className="text-center glass-card rounded p-2">
                                  <p className="text-xs text-gray-400">Visits</p>
                                  <p className="text-white font-semibold">{item.game_stats.visits.toLocaleString()}</p>
                                </div>
                              )}
                              {item.game_stats.likes && (
                                <div className="text-center glass-card rounded p-2">
                                  <p className="text-xs text-gray-400">Likes</p>
                                  <p className="text-white font-semibold">{item.game_stats.likes.toLocaleString()}</p>
                                </div>
                              )}
                              {item.game_stats.favorites && (
                                <div className="text-center glass-card rounded p-2">
                                  <p className="text-xs text-gray-400">Favorites</p>
                                  <p className="text-white font-semibold">{item.game_stats.favorites.toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Links */}
                          <div className="flex gap-2 flex-wrap">
                            {item.game_link && (
                              <Button size="sm" variant="outline" className="glass-card border-0 text-white text-xs" asChild>
                                <a href={item.game_link} target="_blank" rel="noopener noreferrer">
                                  <Play className="w-3 h-3 mr-1" />
                                  Play
                                </a>
                              </Button>
                            )}
                            {item.github_url && (
                              <Button size="sm" variant="outline" className="glass-card border-0 text-white text-xs" asChild>
                                <a href={item.github_url} target="_blank" rel="noopener noreferrer">
                                  <Github className="w-3 h-3 mr-1" />
                                  Code
                                </a>
                              </Button>
                            )}
                            {item.videos?.[0] && (
                              <Button size="sm" variant="outline" className="glass-card border-0 text-white text-xs" asChild>
                                <a href={item.videos[0]} target="_blank" rel="noopener noreferrer">
                                  <Play className="w-3 h-3 mr-1" />
                                  Video
                                </a>
                              </Button>
                            )}
                          </div>

                          {/* Client Testimonial */}
                          {item.client_testimonial && (
                            <div className="mt-3 p-3 glass-card rounded-lg bg-green-500/5">
                              <p className="text-gray-300 text-xs italic">
                                "{item.client_testimonial}"
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Work Experience Tab */}
          <TabsContent value="work-experience">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Work Experience</h2>
                  <p className="text-gray-400 text-sm">
                    Showcase your professional journey
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = createPageUrl('AddWorkExperience')}
                  className="btn-primary text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>

              {workExperience.length === 0 ? (
                <Card className="glass-card border-0">
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Work Experience Yet</h3>
                    <p className="text-gray-400 mb-6">
                      Add your work history to showcase your professional experience
                    </p>
                    <Button
                      onClick={() => window.location.href = createPageUrl('AddWorkExperience')}
                      className="btn-primary text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Experience
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {workExperience.map(exp => (
                    <Card key={exp.id} className="glass-card border-0">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Company Logo */}
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
                            {/* Job Title and Company */}
                            <h3 className="text-white font-semibold text-lg mb-1">{exp.job_title}</h3>
                            <p className="text-gray-300 mb-2">{exp.company_name}</p>

                            {/* Employment Details */}
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

                            {/* Description */}
                            {exp.description && (
                              <p className="text-gray-400 text-sm mb-3 whitespace-pre-line">
                                {exp.description}
                              </p>
                            )}

                            {/* Achievements */}
                            {exp.achievements && exp.achievements.length > 0 && (
                              <div className="mb-3">
                                <p className="text-gray-400 text-xs font-medium mb-2">Key Achievements:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {exp.achievements.map((achievement, i) => (
                                    <li key={i} className="text-gray-300 text-sm">{achievement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Skills Used */}
                            {exp.skills_used && exp.skills_used.length > 0 && (
                              <div className="mb-3">
                                <p className="text-gray-400 text-xs font-medium mb-2">Skills:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {exp.skills_used.map(skill => (
                                    <Badge key={skill} className="bg-white/5 text-gray-300 border-0 text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Projects */}
                            {exp.projects && exp.projects.length > 0 && (
                              <div>
                                <p className="text-gray-400 text-xs font-medium mb-2">Projects:</p>
                                <div className="space-y-2">
                                  {exp.projects.map((project, i) => (
                                    <div key={i} className="glass-card rounded p-2">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h4 className="text-white font-medium text-sm">{project.name}</h4>
                                          <p className="text-gray-400 text-xs">{project.description}</p>
                                        </div>
                                        {project.url && (
                                          <a
                                            href={project.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300"
                                          >
                                            <ExternalLink className="w-4 h-4" />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">My Certifications</h2>
                  <p className="text-gray-400 text-sm">
                    Verified skills and achievements
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = createPageUrl('Certifications')}
                  className="btn-primary text-white"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Earn New Certification
                </Button>
              </div>

              {certifications.length === 0 ? (
                <Card className="glass-card border-0">
                  <CardContent className="p-12 text-center">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Certifications Yet</h3>
                    <p className="text-gray-400 mb-6">
                      Take skill assessments to earn verified certifications
                    </p>
                    <Button
                      onClick={() => window.location.href = createPageUrl('Certifications')}
                      className="btn-primary text-white"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Browse Certifications
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {certifications.map(cert => (
                    <Card key={cert.id} className="glass-card border-0 card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            cert.certification_level === 'expert' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                            cert.certification_level === 'advanced' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                            cert.certification_level === 'intermediate' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                            'bg-gradient-to-br from-gray-500 to-gray-600'
                          }`}>
                            <Award className="w-8 h-8 text-white" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-white font-semibold text-lg">
                                {cert.skill_name}
                              </h3>
                              <Badge className={`${
                                cert.certification_level === 'expert' ? 'bg-yellow-500/20 text-yellow-400' :
                                cert.certification_level === 'advanced' ? 'bg-purple-500/20 text-purple-400' :
                                cert.certification_level === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                              } border-0 text-xs capitalize`}>
                                {cert.certification_level}
                              </Badge>
                              {cert.verified && (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="glass-card rounded p-2">
                                <p className="text-gray-400 text-xs">Score</p>
                                <p className="text-white font-semibold">{cert.score}/100</p>
                              </div>
                              <div className="glass-card rounded p-2">
                                <p className="text-gray-400 text-xs">Percentile</p>
                                <p className="text-white font-semibold">Top {cert.percentile}%</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">
                                Issued {new Date(cert.issued_date).toLocaleDateString()}
                              </span>
                              {cert.expiry_date && (
                                <span className="text-gray-400">
                                  Expires {new Date(cert.expiry_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {cert.certificate_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-3 glass-card border-0 text-white hover:bg-white/5"
                                asChild
                              >
                                <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3 h-3 mr-2" />
                                  View Certificate
                                </a>
                              </Button>
                            )}

                            {cert.verification_code && (
                              <div className="mt-2 text-xs text-gray-500">
                                Verification: {cert.verification_code}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification">
            <GamificationWidget user={user} />
          </TabsContent>

          {/* AI Tools Tab */}
          <TabsContent value="ai-tools">
            {/* AI Tools Section - Enhanced */}
            <Card className="glass-card border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI Career Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Existing: AI Project Generator */}
                  <div
                    onClick={() => setShowProjectGenerator(true)}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 cursor-pointer hover:bg-purple-500/15 transition-all border border-purple-500/20"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Lightbulb className="w-6 h-6 text-purple-400" />
                      <h4 className="text-white font-semibold">Project Generator</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      Get personalized project ideas
                    </p>
                    <Button size="sm" className="btn-primary text-white">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Ideas
                    </Button>
                  </div>

                  {/* Existing: AI Skill Gap Analyzer */}
                  <div
                    onClick={() => setShowSkillAnalyzer(true)}
                    className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-lg p-4 cursor-pointer hover:bg-indigo-500/15 transition-all border border-indigo-500/20"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-6 h-6 text-indigo-400" />
                      <h4 className="text-white font-semibold">Skill Gap Analyzer</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      Find skills to unlock opportunities
                    </p>
                    <Button size="sm" className="btn-primary text-white">
                      <Target className="w-4 h-4 mr-2" />
                      Analyze Skills
                    </Button>
                  </div>

                  {/* NEW: AI Career Roadmap Generator */}
                  <div
                    onClick={() => setShowRoadmapGenerator(true)}
                    className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 cursor-pointer hover:bg-green-500/15 transition-all border border-green-500/20"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Map className="w-6 h-6 text-green-400" />
                      <h4 className="text-white font-semibold">Career Roadmap</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      Long-term development plan
                    </p>
                    <Button size="sm" className="btn-primary text-white">
                      <Map className="w-4 h-4 mr-2" />
                      Generate Roadmap
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Generator Modal */}
      {showProjectGenerator && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">AI Project Idea Generator</h2>
              <Button
                onClick={() => setShowProjectGenerator(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <AIProjectGenerator user={user} />
          </div>
        </div>
      )}

      {/* NEW: Skill Gap Analyzer Modal */}
      {showSkillAnalyzer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">AI Skill Gap Analyzer</h2>
              <Button
                onClick={() => setShowSkillAnalyzer(false)}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <AISkillGapAnalyzer user={user} />
          </div>
        </div>
      )}

      {/* NEW: Career Roadmap Generator Modal */}
      {showRoadmapGenerator && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">AI Career Roadmap Generator</h2>
              <Button
                onClick={() => setShowRoadmapGenerator(false)}
                variant="ghost"
                className="text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <AICareerRoadmapGenerator user={user} />
          </div>
        </div>
      )}
    </div>
  );
}
