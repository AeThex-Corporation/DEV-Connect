import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Trophy, Briefcase, Users, Globe, BadgeCheck, Sparkles, Shield, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader } from '@/components/Loader';
import { useToast } from '@/components/ui/use-toast';

const ProfileCard = ({ profile, contractorId }) => {
  const skills = profile.skills || []; 
  const uniqueSkills = [...new Set(skills)]; // Remove duplicates
  
  // Badge Logic - Derived directly from profiles table
  const role = profile.role || 'user';
  const isAdmin = role === 'admin' || role === 'site_owner';
  const isStaff = role === 'staff';
  
  const isVerified = profile.verification_status === 'verified';
  const isPro = profile.subscription_tier === 'pro' || profile.subscription_tier === 'business';
  const isNotable = profile.reputation > 500;

  const maxVisibleSkills = 3;
  const displaySkills = uniqueSkills.slice(0, maxVisibleSkills);
  const remainingSkills = uniqueSkills.length - maxVisibleSkills;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <div className="h-full bg-[#0A0A0B] border border-gray-800 rounded-xl p-6 flex flex-col hover:border-gray-700 transition-all duration-300 group relative overflow-hidden shadow-sm hover:shadow-md">
        {/* Subtle gradient glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Header: Avatar + Info */}
        <div className="flex items-start gap-4 mb-6 relative z-10">
          <Avatar className="w-14 h-14 border border-gray-800 shrink-0">
            <AvatarImage src={profile.avatar_url} alt={profile.username} />
            <AvatarFallback className="bg-gray-900 text-gray-400 font-mono">
              {profile.display_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="text-lg font-bold text-white truncate leading-tight">
                {profile.display_name || 'Anonymous User'}
                </h3>
                {/* Verified Icon next to name */}
                {isVerified && (
                    <div className="text-blue-400" title="Verified User">
                        <BadgeCheck className="w-5 h-5 fill-blue-500/20" />
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-500 truncate mb-2">@{profile.username}</p>
            {profile.title && (
              <Badge variant="secondary" className="w-fit bg-purple-900/30 text-purple-300 border border-purple-800/50 rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium">
                {profile.title}
              </Badge>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6 flex-grow relative z-10">
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
            {profile.bio || "This user hasn't added a bio yet. They are likely busy building something amazing in the shadows."}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-900 relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-1 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> XP Level
            </span>
            {/* FIXED: Using profile.xp instead of total_xp */}
            <span className="text-yellow-500 font-mono font-bold text-sm">
              {profile.xp ? `${profile.xp.toLocaleString()} XP` : '0 XP'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </span>
            <span className="text-gray-300 font-mono font-medium text-sm truncate">
              {profile.location || 'Remote'}
            </span>
          </div>
        </div>

        {/* Badges & Skills Area */}
        <div className="flex flex-wrap gap-2 mb-6 relative z-10 content-start min-h-[28px]">
           {/* Admin / Staff Badges */}
           {isAdmin && (
            <Badge variant="secondary" className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors gap-1 pl-1.5 pr-2.5 font-medium">
               <Shield className="w-3 h-3 fill-current" /> Admin
            </Badge>
           )}
           {isStaff && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors gap-1 pl-1.5 pr-2.5 font-medium">
               <Shield className="w-3 h-3 fill-current" /> Staff
            </Badge>
           )}
           
           {/* Verified Badge (Text Version) */}
           {isVerified && (
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors gap-1 pl-1.5 pr-2.5">
               <BadgeCheck className="w-3 h-3" /> Verified
            </Badge>
          )}
          
          {/* Pro Badge */}
          {isPro && (
             <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors gap-1 pl-1.5 pr-2.5">
               <Sparkles className="w-3 h-3" /> Pro
            </Badge>
          )}
          
          {/* Notable Badge */}
          {isNotable && (
             <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors gap-1 pl-1.5 pr-2.5">
               <Crown className="w-3 h-3" /> Notable
            </Badge>
          )}

          {/* Skills */}
          {displaySkills.length > 0 ? (
            displaySkills.map((skill, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800 hover:text-gray-300 rounded-md px-2.5 py-1 text-xs font-normal transition-colors"
              >
                {skill}
              </Badge>
            ))
          ) : (
             (!isVerified && !isPro && !isAdmin && !isStaff && !isNotable) && (
                <Badge variant="secondary" className="bg-gray-900 text-gray-600 border border-gray-800 border-dashed">
                No skills listed
                </Badge>
            )
          )}
          {remainingSkills > 0 && (
            <span className="text-xs text-gray-600 flex items-center px-1" title={`+${remainingSkills} more skills`}>+{remainingSkills}</span>
          )}
        </div>

        {/* Action Button */}
        <Button 
          asChild 
          variant="secondary" 
          className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 hover:border-gray-700 transition-all relative z-10 font-medium tracking-wide"
        >
          <Link to={`/contractors/${contractorId}`}>View Profile</Link>
        </Button>
      </div>
    </motion.div>
  );
};

const StudioCard = ({ studio }) => {
  const tags = studio.tags || [];
  const displayTags = tags.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <div className="h-full bg-[#0A0A0B] border border-gray-800 rounded-xl p-6 flex flex-col hover:border-purple-900/30 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Header */}
        <div className="flex items-start gap-4 mb-6 relative z-10">
          <Avatar className="w-14 h-14 border border-gray-800 shrink-0 rounded-lg">
            <AvatarImage src={studio.avatar_url} alt={studio.name} />
            <AvatarFallback className="bg-gray-900 text-purple-400 font-mono rounded-lg">
              {studio.name?.[0] || 'S'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <h3 className="text-lg font-bold text-white truncate leading-tight">
              {studio.name}
            </h3>
            <p className="text-sm text-gray-500 truncate mb-2">@{studio.slug}</p>
             <Badge variant="outline" className="w-fit border-purple-900 text-purple-400 text-[10px] uppercase tracking-widest">
               Studio
             </Badge>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6 flex-grow relative z-10">
           <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
             {studio.description || "A collective of creative minds building the future."}
           </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-900 relative z-10">
           <div className="flex flex-col">
             <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-1 flex items-center gap-1">
               <Users className="w-3 h-3" /> Team Size
             </span>
             <span className="text-gray-300 font-mono font-medium text-sm">
               Unknown
             </span>
           </div>
           <div className="flex flex-col">
             <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-1 flex items-center gap-1">
               <Globe className="w-3 h-3" /> Website
             </span>
             <span className="text-blue-400 font-mono font-medium text-sm truncate cursor-pointer hover:underline">
               {studio.website_url ? 'Visit Site' : 'None'}
             </span>
           </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6 relative z-10">
           {displayTags.map((tag, i) => (
             <Badge 
               key={i} 
               variant="secondary" 
               className="bg-purple-950/20 text-purple-300 border border-purple-900/30 rounded-md px-2.5 py-1 text-xs font-normal"
             >
               {tag}
             </Badge>
           ))}
        </div>

         <Button 
          asChild 
          className="w-full bg-purple-900/20 hover:bg-purple-900/40 text-purple-100 border border-purple-900/50 transition-all relative z-10"
        >
          <Link to={`/studios/${studio.slug}`}>Visit Studio</Link>
        </Button>
      </div>
    </motion.div>
  );
};

const DevelopersPage = () => {
  const [contractors, setContractors] = useState([]);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // FIXED: Changed total_xp to xp to match database schema
        const { data: contractorsData, error: contractorsError } = await supabase
          .from('contractors')
          .select(`
             id, skills, hourly_rate, status,
             user:profiles!inner(
               id, display_name, username, avatar_url, reputation, 
               bio, location, xp, title, verification_status, subscription_tier, role
             )
          `)
          .eq('status', 'approved');
        
        if (contractorsError) throw contractorsError;
        
        // Map and merge skills if needed (skills can be in profile tags or contractor skills)
        const formattedContractors = (contractorsData || []).map(c => ({
          ...c,
          user: {
            ...c.user,
            skills: c.skills || c.user?.tags || [] 
          }
        }));
        
        setContractors(formattedContractors);

        // Fetch Studios
        const { data: studiosData, error: studiosError } = await supabase
          .from('studios')
          .select('*');

        if (studiosError) throw studiosError;
        setStudios(studiosData || []);

      } catch (err) {
        console.error("Error fetching data:", err);
        toast({
            title: "Error loading directory",
            description: "Could not fetch profiles. Please try again.",
            variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredContractors = contractors.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.user?.display_name?.toLowerCase().includes(term) ||
      c.user?.username?.toLowerCase().includes(term) ||
      c.user?.skills?.some(s => s.toLowerCase().includes(term))
    );
  });

  const filteredStudios = studios.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.tags?.some(t => t.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 px-4 pb-20">
      <Helmet>
        <title>Talent Directory | Devconnect</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input 
               placeholder="Search by name, bio, or skill..." 
               className="pl-12 h-14 bg-[#0A0A0B] border-gray-800 rounded-xl text-white focus:ring-1 focus:ring-gray-700 focus:border-gray-700 transition-all text-lg placeholder:text-gray-600"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center px-4 py-3 bg-[#0A0A0B] border border-gray-800 rounded-xl text-gray-300 whitespace-nowrap">
              <Users className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium">Total Members: <span className="text-white font-bold ml-1">{filteredContractors.length + filteredStudios.length}</span></span>
            </div>
            <div className="flex items-center px-4 py-3 bg-[#0A0A0B] border border-gray-800 rounded-xl text-green-400 whitespace-nowrap">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              <span className="text-sm font-bold">Live</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="freelancers" className="space-y-8">
            <TabsList className="bg-transparent border-b border-gray-800 w-full justify-start rounded-none p-0 h-auto gap-8">
               <TabsTrigger 
                 value="freelancers" 
                 className="bg-transparent border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent text-gray-500 data-[state=active]:text-white rounded-none px-0 py-4 text-base font-medium transition-all hover:text-gray-300"
               >
                 Freelancers <span className="ml-2 text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{filteredContractors.length}</span>
               </TabsTrigger>
               <TabsTrigger 
                 value="studios" 
                 className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent text-gray-500 data-[state=active]:text-purple-400 rounded-none px-0 py-4 text-base font-medium transition-all hover:text-gray-300"
               >
                 Studios <span className="ml-2 text-xs bg-purple-900/20 text-purple-400 px-2 py-0.5 rounded-full">{filteredStudios.length}</span>
               </TabsTrigger>
            </TabsList>

            <TabsContent value="freelancers" className="mt-8">
               {filteredContractors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredContractors.map(contractor => (
                        <ProfileCard 
                          key={contractor.id} 
                          profile={contractor.user} 
                          contractorId={contractor.id} 
                        />
                      ))}
                  </div>
               ) : (
                  <div className="text-center py-24 border border-dashed border-gray-800 rounded-xl bg-[#0A0A0B]">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Search className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No freelancers found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                       We couldn't find any freelancers matching your search. Try different keywords or clear your filters.
                    </p>
                  </div>
               )}
            </TabsContent>

            <TabsContent value="studios" className="mt-8">
               {filteredStudios.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredStudios.map(studio => (
                        <StudioCard key={studio.id} studio={studio} />
                      ))}
                  </div>
               ) : (
                  <div className="text-center py-24 border border-dashed border-gray-800 rounded-xl bg-[#0A0A0B]">
                     <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Briefcase className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No studios found</h3>
                    <p className="text-gray-500">No studios match your search criteria right now.</p>
                  </div>
               )}
            </TabsContent>
         </Tabs>
      </div>
    </div>
  );
};

export default DevelopersPage;