import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader } from '@/components/Loader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Github, 
  Linkedin, 
  Globe, 
  MapPin, 
  Star,
  Shield,
  Briefcase,
  ExternalLink,
  Clock,
  Calendar,
  DollarSign,
  User,
  Mail,
  Award,
  Crown,
  BadgeCheck,
  Sparkles
} from 'lucide-react';

const ContractorProfile = () => {
  const { contractorId } = useParams();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        // Fetching role field from profiles to determine Admin/Staff status
        const { data, error } = await supabase
          .from('contractors')
          .select(`
            *,
            profiles:user_id (
              display_name,
              username,
              avatar_url,
              banner_url,
              location,
              bio,
              website_url,
              github_url,
              reputation,
              created_at,
              verification_status,
              subscription_tier,
              role,
              xp
            ),
            portfolio (*),
            ratings_reviews (*)
          `)
          .eq('id', contractorId)
          .single();

        if (error) throw error;
        setContractor(data);
      } catch (error) {
        console.error("Failed to load contractor", error);
      } finally {
        setLoading(false);
      }
    };

    if (contractorId) loadProfile();
  }, [contractorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex justify-center">
        <Loader />
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-black pt-32 text-center px-4">
        <h1 className="text-2xl font-bold text-white mb-4">Contractor Not Found</h1>
        <Button onClick={() => navigate('/developers')} variant="outline">Back to Developers</Button>
      </div>
    );
  }

  const { profiles, portfolio, ratings_reviews } = contractor;
  const averageRating = ratings_reviews?.length > 0 
    ? (ratings_reviews.reduce((a,b) => a + b.rating, 0) / ratings_reviews.length).toFixed(1) 
    : null;

  // Badge logic - properly checking role from profiles table
  const role = profiles?.role || 'user';
  const isAdmin = role === 'admin' || role === 'site_owner';
  const isStaff = role === 'staff';
  
  const isVerified = profiles?.verification_status === 'verified' || contractor.status === 'approved';
  const isPro = profiles?.subscription_tier === 'pro' || profiles?.subscription_tier === 'business';
  const isNotable = profiles?.reputation > 500;

  return (
    <>
      <Helmet>
        <title>{profiles?.display_name || 'Contractor'} | Devconnect Profile</title>
      </Helmet>

      <div className="min-h-screen bg-black pt-20 pb-12">
        
        {/* Hero / Banner Section */}
        <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gray-900 overflow-hidden group">
          {profiles?.banner_url ? (
            <img 
              src={profiles.banner_url} 
              alt="Profile Banner" 
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-black opacity-90">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            
            {/* Profile Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 ring-4 ring-black shadow-2xl bg-gray-900">
                <AvatarImage src={profiles?.avatar_url} className="object-cover" />
                <AvatarFallback className="text-4xl bg-gray-800 text-white font-bold">
                  {profiles?.display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 right-2">
                 {isVerified && (
                    <div title="Verified Contractor" className="bg-blue-500 text-white p-1.5 rounded-full border-4 border-black shadow-lg">
                      <CheckCircle className="w-5 h-5 fill-current" />
                    </div>
                 )}
              </div>
            </div>

            {/* Header Info */}
            <div className="flex-grow pt-2 md:pt-16 text-center md:text-left space-y-2">
               <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {profiles?.display_name}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {/* Admin Badge */}
                    {isAdmin && (
                      <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 gap-1.5 pl-1.5 pr-2.5 font-semibold">
                        <Shield className="w-3.5 h-3.5 fill-current" /> Admin
                      </Badge>
                    )}
                    {/* Staff Badge */}
                    {isStaff && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 gap-1.5 pl-1.5 pr-2.5 font-semibold">
                        <Shield className="w-3.5 h-3.5 fill-current" /> Staff
                      </Badge>
                    )}
                    {/* Verified Badge */}
                    {isVerified && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 gap-1.5 pl-1.5 pr-2.5">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verified
                      </Badge>
                    )}
                    {/* Pro Badge */}
                    {isPro && (
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30 gap-1.5 pl-1.5 pr-2.5">
                        <Sparkles className="w-3.5 h-3.5" /> Pro
                      </Badge>
                    )}
                    {/* Notable Badge */}
                    {isNotable && (
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30 gap-1.5 pl-1.5 pr-2.5">
                        <Crown className="w-3.5 h-3.5" /> Notable
                      </Badge>
                    )}
                    {/* Top Rated Badge */}
                    {averageRating && parseFloat(averageRating) >= 4.5 && (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30 gap-1.5 pl-1.5 pr-2.5">
                        <Star className="w-3.5 h-3.5 fill-current" /> Top Rated
                      </Badge>
                    )}
                  </div>
               </div>
               
               <p className="text-gray-400 text-lg font-medium">@{profiles?.username}</p>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400 mt-2">
                  {profiles?.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-500" /> {profiles.location}
                    </div>
                  )}
                  {contractor.experience_years && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-gray-500" /> {contractor.experience_years} Experience
                    </div>
                  )}
                  {contractor.created_at && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-500" /> Joined {new Date(contractor.created_at).getFullYear()}
                    </div>
                  )}
               </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full md:w-auto pt-4 md:pt-16 flex flex-col gap-3 min-w-[200px]">
              <Button className="w-full bg-white text-black hover:bg-gray-200 font-semibold" size="lg">
                <Mail className="w-4 h-4 mr-2" /> Contact Me
              </Button>
              <div className="flex justify-center gap-2">
                 {contractor.github_url && (
                   <Button size="icon" variant="ghost" className="hover:bg-gray-800 text-gray-400 hover:text-white" asChild>
                     <a href={contractor.github_url} target="_blank" rel="noreferrer"><Github className="w-5 h-5" /></a>
                   </Button>
                 )}
                 {contractor.linkedin_url && (
                   <Button size="icon" variant="ghost" className="hover:bg-gray-800 text-gray-400 hover:text-white" asChild>
                     <a href={contractor.linkedin_url} target="_blank" rel="noreferrer"><Linkedin className="w-5 h-5" /></a>
                   </Button>
                 )}
                 {contractor.portfolio_url && (
                   <Button size="icon" variant="ghost" className="hover:bg-gray-800 text-gray-400 hover:text-white" asChild>
                     <a href={contractor.portfolio_url} target="_blank" rel="noreferrer"><Globe className="w-5 h-5" /></a>
                   </Button>
                 )}
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Tabs Section */}
              <Tabs defaultValue="about" className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <TabsList className="bg-gray-900/50 border border-gray-800 p-1">
                    <TabsTrigger value="about" className="px-6 data-[state=active]:bg-gray-800">About</TabsTrigger>
                    <TabsTrigger value="portfolio" className="px-6 data-[state=active]:bg-gray-800">Portfolio</TabsTrigger>
                    <TabsTrigger value="reviews" className="px-6 data-[state=active]:bg-gray-800">Reviews</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="about" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" /> Biography
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {contractor.bio || profiles?.bio || "This user hasn't written a bio yet."}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-500" /> Skills & Expertise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {contractor.skills && contractor.skills.length > 0 ? (
                          contractor.skills.map(skill => (
                            <Badge key={skill} className="bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700 px-3 py-1 text-sm">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 italic">No skills listed.</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="portfolio" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portfolio && portfolio.length > 0 ? (
                      portfolio.map(item => (
                        <Card key={item.id} className="bg-gray-900 border-gray-800 overflow-hidden group hover:border-blue-500/50 transition-colors">
                          <div className="h-48 bg-black relative overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-600">
                                <Globe className="w-12 h-12 mb-2 opacity-50" />
                                <span className="text-sm">No Preview</span>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-5">
                            <h3 className="font-bold text-white text-lg mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                            <p className="text-sm text-gray-400 line-clamp-3 mb-4">{item.description}</p>
                            <div className="flex gap-3 pt-2">
                              {item.github_link && (
                                <a href={item.github_link} target="_blank" rel="noreferrer" className="text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1 bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 transition-colors">
                                  <Github className="w-3 h-3" /> Source Code
                                </a>
                              )}
                              {item.case_study_url && (
                                <a href={item.case_study_url} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-900/20 px-2 py-1 rounded hover:bg-blue-900/30 transition-colors">
                                  <ExternalLink className="w-3 h-3" /> Live Demo
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-900/30 rounded-xl border border-dashed border-gray-800 text-gray-500">
                        <Briefcase className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium text-gray-400">No portfolio items yet</p>
                        <p className="text-sm">This contractor hasn't showcased their work yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-4">
                    {ratings_reviews && ratings_reviews.length > 0 ? (
                      ratings_reviews.map((review) => (
                        <Card key={review.id} className="bg-gray-900/50 border-gray-800">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <div className="flex text-yellow-500">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-700'}`} />
                                  ))}
                                </div>
                                <span className="font-bold text-white ml-2">{review.rating}.0</span>
                              </div>
                              <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">"{review.review_text}"</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 bg-gray-900/30 rounded-xl border border-dashed border-gray-800 text-gray-500">
                        <Star className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium text-gray-400">No reviews yet</p>
                        <p className="text-sm">Be the first to hire and review this contractor.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
               
               {/* Rate & Availability Card */}
               <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {contractor.hourly_rate && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-900/20 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-500" />
                          </div>
                          <span className="text-gray-300">Hourly Rate</span>
                        </div>
                        <span className="text-xl font-bold text-white">{contractor.hourly_rate}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${contractor.availability === 'Available' ? 'bg-blue-900/20' : 'bg-orange-900/20'}`}>
                            <Clock className={`w-5 h-5 ${contractor.availability === 'Available' ? 'text-blue-500' : 'text-orange-500'}`} />
                          </div>
                          <span className="text-gray-300">Availability</span>
                       </div>
                       <Badge variant="outline" className={`${contractor.availability === 'Available' ? 'border-blue-500 text-blue-400' : 'border-orange-500 text-orange-400'}`}>
                         {contractor.availability || 'Unknown'}
                       </Badge>
                    </div>
                    
                    <Separator className="bg-gray-800" />
                    
                    <div className="pt-2">
                      <Button className="w-full" variant="secondary">Invite to Job</Button>
                    </div>
                  </CardContent>
               </Card>

               {/* Verification Status Card */}
               <Card className="bg-gray-900 border-gray-800">
                 <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Trust & Verification
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Identity Verified</span>
                      {isVerified ? <CheckCircle className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-700" />}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Email Confirmed</span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Portfolio Vetted</span>
                      {isVerified ? <CheckCircle className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-700" />}
                    </div>
                 </CardContent>
               </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractorProfile;