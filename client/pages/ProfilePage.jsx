import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Edit, Mail, Award, BadgeCheck, Star, Briefcase, Users, MapPin, Link as LinkIcon, Github, Twitter, Dribbble, Youtube, BookOpen, Shield, Building } from 'lucide-react';
import EditProfileDialog from '@/components/EditProfileDialog';

const AvailabilityIndicator = ({ availability }) => {
  const statusStyles = {
    'Available for Hire': {
      color: 'bg-green-500',
      text: 'Available for Hire',
    },
    'Open to Offers': {
      color: 'bg-teal-500',
      text: 'Open to Offers',
    },
    'Busy': {
      color: 'bg-yellow-500',
      text: 'Busy',
    },
    'Focusing on Projects': {
      color: 'bg-orange-500',
      text: 'Focusing on Projects',
    },
    'Not Available': {
      color: 'bg-red-500',
      text: 'Not Available',
    },
  };

  const currentStatus = statusStyles[availability] || statusStyles['Not Available'];

  return (
    <div className="flex items-center gap-2" title={currentStatus.text}>
      <div className={`w-3 h-3 rounded-full ${currentStatus.color}`}></div>
      <span className="text-sm text-gray-300">{currentStatus.text}</span>
    </div>
  );
};

const StudioListItem = ({ studio }) => (
    <Link to={`/studios/${studio.slug}`} className="block bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700/70 transition-colors">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/50 rounded-lg flex items-center justify-center overflow-hidden">
                {studio.avatar_url ? <img src={studio.avatar_url} alt={`${studio.name} avatar`} className="w-full h-full object-cover" /> : <Building className="text-indigo-300 w-6 h-6" />}
            </div>
            <div>
                <p className="font-semibold text-white">{studio.name}</p>
                <p className="text-sm text-gray-400">{studio.role || 'Member'}</p>
            </div>
        </div>
    </Link>
);

const ProfilePage = () => {
  const { username } = useParams();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [ownedStudios, setOwnedStudios] = useState([]);
  const [memberStudios, setMemberStudios] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isProfileAdmin, setIsProfileAdmin] = useState(false);

  const isOwnProfile = user && profile && user.id === profile.id;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*, achievements:user_achievements(achievements(slug, name, description, icon)))')
      .eq('username', username)
      .single();

    if (error || !data) {
      toast({ variant: 'destructive', title: 'Error', description: 'Profile not found.' });
      navigate('/developers');
      return;
    }
    
    setProfile(data);
    const userAchievements = data.achievements.map(a => a.achievements);
    setAchievements(userAchievements);

    const [ownedStudiosRes, memberStudiosRes, adminRes] = await Promise.all([
        supabase.from('studios').select('name, slug, avatar_url').eq('owner_id', data.id),
        supabase.from('studio_members').select('role, studio:studios(name, slug, avatar_url)').eq('user_id', data.id),
        supabase.rpc('check_user_role', { p_user_id: data.id, p_role: 'admin' })
    ]);

    if (ownedStudiosRes.error) toast({ variant: 'destructive', title: 'Error fetching owned studios' });
    else setOwnedStudios(ownedStudiosRes.data);

    if (memberStudiosRes.error) toast({ variant: 'destructive', title: 'Error fetching studio memberships' });
    else {
        const memberOf = memberStudiosRes.data.map(m => ({ ...m.studio, role: m.role })).filter(s => !ownedStudiosRes.data.some(os => os.slug === s.slug));
        setMemberStudios(memberOf);
    }

    if (!adminRes.error) setIsProfileAdmin(adminRes.data);

    setLoading(false);
  }, [username, navigate, toast]);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username, fetchProfile]);

  const handleProfileUpdate = () => {
    fetchProfile();
    if (user) {
      refreshProfile();
    }
  };

  const handleStartConversation = () => {
    if (!user || !profile || isOwnProfile) return;
    navigate(`/messages/user/${profile.username}`);
  };

  const getSubscriptionBadge = (tier) => {
    switch (tier) {
      case 'creator': return { icon: Star, color: 'text-cyan-400', label: 'Creator' };
      case 'pro': return { icon: BadgeCheck, color: 'text-indigo-400', label: 'Pro' };
      case 'studio': return { icon: Award, color: 'text-purple-400', label: 'Studio' };
      default: return null;
    }
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'verified': return { icon: BadgeCheck, color: 'text-blue-400', label: 'Verified' };
      case 'notable': return { icon: Award, color: 'text-yellow-400', label: 'Notable' };
      default: return null;
    }
  };
  
  const getAdminBadge = (isAdmin) => {
    if (!isAdmin) return null;
    return { icon: Shield, color: 'text-red-500', label: 'Admin' };
  };

  const socialLinks = [
    { key: 'github_url', icon: Github, label: 'GitHub' },
    { key: 'contact_twitter', icon: Twitter, label: 'Twitter' },
    { key: 'artstation_url', icon: Dribbble, label: 'ArtStation' },
    { key: 'youtube_url', icon: Youtube, label: 'YouTube' },
    { key: 'devforum_url', icon: BookOpen, label: 'DevForum' },
    { key: 'roblox_game_url', icon: LinkIcon, label: 'Roblox Game' },
  ];

  if (loading) {
    return <div className="text-center py-20">Loading profile...</div>;
  }

  if (!profile) {
    return null;
  }

  const subscriptionBadge = getSubscriptionBadge(profile.subscription_tier);
  const verificationBadge = getVerificationBadge(profile.verification_status);
  const adminBadge = getAdminBadge(isProfileAdmin);
  
  const pageTitle = `${profile.display_name || profile.username} | Devconnect`;
  const pageDescription = profile.bio ? profile.bio.substring(0, 160) + '...' : `View the profile of ${profile.display_name} on Devconnect.`;
  const pageUrl = `https://dev-connect.com/profile/${profile.username}`;
  const imageUrl = profile.banner_url || profile.avatar_url || "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="profile" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="profile:username" content={profile.username} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>
      <EditProfileDialog open={isEditOpen} onOpenChange={setEditOpen} profile={profile} onProfileUpdate={handleProfileUpdate} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="h-48 md:h-64 bg-gray-800 rounded-lg overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt={`${profile.display_name}'s banner`}
                src={profile.banner_url || "https://images.unsplash.com/photo-1666892666066-abe5c4865e9c"} />
            </div>
            <div className="absolute top-32 md:top-44 left-1/2 -translate-x-1/2 w-full px-4">
              <div className="relative max-w-3xl mx-auto bg-glass border-glow rounded-lg p-6 flex flex-col md:flex-row items-center text-center md:text-left">
                <div className="relative -mt-20 md:-mt-24 mb-4 md:mb-0 md:mr-6">
                  <div className="w-32 h-32 rounded-full border-4 border-gray-800 bg-gray-900 overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt={`${profile.display_name}'s avatar`}
                      src={profile.avatar_url || "https://images.unsplash.com/photo-1666892666066-abe5c4865e9c"} />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <h1 className="text-3xl font-bold">{profile.display_name || profile.username}</h1>
                    {adminBadge && (
                      <div className="flex items-center gap-1" title={adminBadge.label}>
                        <adminBadge.icon className={`w-6 h-6 ${adminBadge.color}`} />
                      </div>
                    )}
                    {verificationBadge && (
                      <div className="flex items-center gap-1" title={verificationBadge.label}>
                        <verificationBadge.icon className={`w-6 h-6 ${verificationBadge.color}`} />
                      </div>
                    )}
                    {subscriptionBadge && (
                      <div className="flex items-center gap-1" title={subscriptionBadge.label}>
                        <subscriptionBadge.icon className={`w-6 h-6 ${subscriptionBadge.color}`} />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 mt-1">@{profile.username}</p>
                  <p className="text-lg text-gray-300 mt-2">{profile.motto}</p>
                  <div className="mt-2 flex justify-center md:justify-start">
                    <AvailabilityIndicator availability={profile.availability} />
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {isOwnProfile ? (
                    <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  ) : (
                    user && (
                      <Button variant="default" onClick={handleStartConversation}>
                        <Mail className="mr-2 h-4 w-4" /> Message
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-48 md:mt-32 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-glass border-glow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">About Me</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{profile.bio || 'No bio provided.'}</p>
              </div>
              
              {(ownedStudios.length > 0 || memberStudios.length > 0) && (
                <div className="bg-glass border-glow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Studios</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ownedStudios.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Owned Studios</h3>
                                <div className="space-y-3">
                                    {ownedStudios.map(studio => <StudioListItem key={studio.slug} studio={{...studio, role: 'Owner'}} />)}
                                </div>
                            </div>
                        )}
                        {memberStudios.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Studio Memberships</h3>
                                <div className="space-y-3">
                                    {memberStudios.map(studio => <StudioListItem key={studio.slug} studio={studio} />)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              )}

              <div className="bg-glass border-glow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Achievements ({achievements.length})</h2>
                <div className="flex flex-wrap gap-4">
                  {achievements.length > 0 ? achievements.map(ach => (
                    <div key={ach.slug} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg" title={ach.description}>
                      <Award className="w-6 h-6 text-yellow-400" />
                      <span className="font-semibold">{ach.name}</span>
                    </div>
                  )) : <p className="text-gray-400">No achievements yet.</p>}
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-glass border-glow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Details</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-3"><Briefcase className="w-5 h-5 text-gray-400" /><span>{profile.role || 'Role not specified'}</span></li>
                  <li className="flex items-center gap-3"><MapPin className="w-5 h-5 text-gray-400" /><span>{profile.location || 'Location not specified'}</span></li>
                </ul>
              </div>
              <div className="bg-glass border-glow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Socials</h2>
                <div className="flex flex-wrap gap-4">
                  {profile.roblox_user_id && (
                    <a href={`https://www.roblox.com/users/${profile.roblox_user_id}/profile`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" title="Roblox Profile">
                        <img src="/roblox-logo.svg" alt="Roblox" className="w-6 h-6" />
                    </a>
                  )}
                  {socialLinks.map(social => profile[social.key] && (
                    <a key={social.key} href={profile[social.key]} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" title={social.label}>
                      <social.icon className="w-6 h-6" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ProfilePage;