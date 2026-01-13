
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  MapPin,
  Globe,
  Users,
  Briefcase,
  Star,
  Calendar,
  Edit,
  ExternalLink,
  Award,
  TrendingUp,
  MessageSquare,
  Twitter,
  Youtube,
  ArrowLeft,
  Shield,
  Heart,
  Eye,
  Building2, // NEW
  CheckCircle // NEW
} from "lucide-react";
import ReviewsSection from "../components/company/ReviewsSection";
import AIBrandingAssistant from "../components/AIBrandingAssistant";

export default function CompanyProfile() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [jobs, setJobs] = useState([]); // Renamed from activeJobs
  const [studios, setStudios] = useState([]); // NEW
  const [showBrandingAssistant, setShowBrandingAssistant] = useState(false);

  useEffect(() => {
    const fetchCompanyProfileData = async () => {
      setLoading(true);
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);

        const urlParams = new URLSearchParams(location.search);
        const companyIdParam = urlParams.get('id');
        const userIdParam = urlParams.get('user_id');

        let profile = null;

        if (companyIdParam) {
          // Direct company profile ID
          profile = await base44.entities.CompanyProfile.filter({ id: companyIdParam });
          profile = profile[0];
        } else if (userIdParam) {
          // Load by user ID
          profile = await base44.entities.CompanyProfile.filter({ user_id: userIdParam });
          profile = profile[0];
        } else {
          // Load current user's company profile
          profile = await base44.entities.CompanyProfile.filter({ user_id: user.id });
          profile = profile[0];
        }

        if (profile) {
          setCompanyProfile(profile);
          setIsOwnProfile(profile.user_id === user.id);

          // Load active jobs for this company
          const companyJobs = await base44.entities.Job.filter({ 
            employer_id: profile.user_id,
            status: 'Open'
          });
          setJobs(companyJobs); // Set the 'jobs' state

          // NEW: Load studios for this company
          const companyStudios = await base44.entities.Studio.filter({ company_profile_id: profile.id });
          setStudios(companyStudios);
        } else {
          // If no profile found, clear states
          setCompanyProfile(null);
          setIsOwnProfile(false);
          setJobs([]);
          setStudios([]);
        }
      } catch (error) {
        console.error('Error loading company profile:', error);
        setCompanyProfile(null);
        setIsOwnProfile(false);
        setJobs([]);
        setStudios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfileData();
  }, [location.search]); // Trigger when URL search parameters change

  const handleBrandingApply = async (updates) => {
    if (!companyProfile) return;
    
    try {
      await base44.entities.CompanyProfile.update(companyProfile.id, updates);
      await fetchCompanyProfileData(); // Reload the profile
      alert('Branding updated successfully!');
    } catch (error) {
      console.error('Error updating branding:', error);
      alert('Failed to update branding. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!companyProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <Card className="glass-card border-0 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Company Profile Found</h2>
            <p className="text-gray-400 mb-6">
              {isOwnProfile 
                ? "You haven't created a company profile yet."
                : "This company profile doesn't exist or has been removed."}
            </p>
            {isOwnProfile && (
              <Button 
                onClick={() => window.location.href = createPageUrl("EditCompanyProfile")}
                className="btn-primary text-white"
              >
                Create Company Profile
              </Button>
            )}
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="glass-card border-0 text-white hover:bg-white/5 mt-3 w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryColor = companyProfile.brand_colors?.primary || "#6366f1";
  const secondaryColor = companyProfile.brand_colors?.secondary || "#8b5cf6";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        .glass-card {
          background-color: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btn-primary {
          background: linear-gradient(to right, ${primaryColor}, ${secondaryColor});
        }
        .btn-primary:hover {
          opacity: 0.9;
        }
      `}</style>

      {/* Banner */}
      <div 
        className="h-64 relative"
        style={{
          backgroundImage: companyProfile.banner_url 
            ? `url(${companyProfile.banner_url})`
            : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]"></div>
        
        {isOwnProfile && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={() => setShowBrandingAssistant(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Star className="w-4 h-4 mr-2" />
              AI Branding
            </Button>
            <Button
              onClick={() => window.location.href = createPageUrl("EditCompanyProfile")}
              className="glass-card border-0 text-white hover:bg-white/10"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 -mt-32 relative z-10 pb-12">
        {/* Company Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-shrink-0">
            {companyProfile.logo_url ? (
              <img
                src={companyProfile.logo_url}
                alt={companyProfile.company_name}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-[#0a0a0a] shadow-xl"
              />
            ) : (
              <div 
                className="w-32 h-32 rounded-2xl flex items-center justify-center border-4 border-[#0a0a0a] shadow-xl"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                <Building className="w-16 h-16 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {companyProfile.company_name}
              </h1>
              {companyProfile.verified && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {companyProfile.tagline && (
              <p className="text-xl text-gray-300 mb-4">{companyProfile.tagline}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {companyProfile.industry && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {companyProfile.industry}
                </div>
              )}
              {companyProfile.company_size && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {companyProfile.company_size} employees
                </div>
              )}
              {companyProfile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {companyProfile.location}
                </div>
              )}
              {companyProfile.founded_year && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Founded {companyProfile.founded_year}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {companyProfile.website_url && (
                <Button
                  onClick={() => window.open(companyProfile.website_url, '_blank')}
                  variant="outline"
                  size="sm"
                  className="glass-card border-0 text-white hover:bg-white/5"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </Button>
              )}
              {companyProfile.social_links?.twitter && (
                <Button
                  onClick={() => window.open(companyProfile.social_links.twitter, '_blank')}
                  variant="outline"
                  size="sm"
                  className="glass-card border-0 text-white hover:bg-white/5"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
              )}
              {companyProfile.social_links?.youtube && (
                <Button
                  onClick={() => window.open(companyProfile.social_links.youtube, '_blank')}
                  variant="outline"
                  size="sm"
                  className="glass-card border-0 text-white hover:bg-white/5"
                >
                  <Youtube className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="glass-card border-0 mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="studios">Studios ({studios.length})</TabsTrigger>
            <TabsTrigger value="positions">Open Positions ({jobs.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            {/* Description */}
            {companyProfile.description && (
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-white">About Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 whitespace-pre-wrap">{companyProfile.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Mission */}
            {companyProfile.mission && (
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-white">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{companyProfile.mission}</p>
                </CardContent>
              </Card>
            )}

            {/* Culture & Values */}
            {companyProfile.culture_values?.length > 0 && (
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-white">Culture & Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {companyProfile.culture_values.map((value, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
                        <Heart className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                        <p className="text-gray-300 text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Perks & Benefits */}
            {companyProfile.perks_benefits?.length > 0 && (
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-white">Perks & Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {companyProfile.perks_benefits.map((perk, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-white font-semibold mb-1">{perk.title}</h4>
                            <p className="text-gray-400 text-sm">{perk.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* NEW: Studios Tab */}
          <TabsContent value="studios">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Our Studios</h2>
                <p className="text-gray-400">
                  Meet the teams and divisions that make up {companyProfile.company_name}
                </p>
              </div>

              {studios.length === 0 ? (
                <Card className="glass-card border-0">
                  <CardContent className="p-12 text-center">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Studios Yet</h3>
                    <p className="text-gray-400">
                      {isOwnProfile 
                        ? 'Add Roblox groups as studios to showcase your organization'
                        : 'This company hasn\'t added any studios yet'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {studios.map(studio => (
                    <Card key={studio.id} className="glass-card border-0 card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          {studio.logo_url ? (
                            <img 
                              src={studio.logo_url}
                              alt={studio.studio_name}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                              <Building2 className="w-8 h-8 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-semibold text-lg">{studio.studio_name}</h3>
                              {studio.verified && (
                                <CheckCircle className="w-4 h-4 text-blue-400" />
                              )}
                            </div>
                            <Badge className={`${
                              studio.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              studio.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                              'bg-orange-500/20 text-orange-400'
                            } border-0 text-xs`}>
                              {studio.status}
                            </Badge>
                          </div>
                        </div>

                        {studio.description && (
                          <p className="text-gray-400 text-sm mb-4">{studio.description}</p>
                        )}

                        {/* Studio Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center glass-card rounded-lg p-3">
                            <Users className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                            <p className="text-white font-semibold text-sm">
                              {studio.roblox_group_data?.memberCount?.toLocaleString() || 0}
                            </p>
                            <p className="text-gray-400 text-xs">Members</p>
                          </div>
                          {studio.total_games > 0 && (
                            <div className="text-center glass-card rounded-lg p-3">
                              <Briefcase className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                              <p className="text-white font-semibold text-sm">{studio.total_games}</p>
                              <p className="text-gray-400 text-xs">Games</p>
                            </div>
                          )}
                          {studio.total_visits > 0 && (
                            <div className="text-center glass-card rounded-lg p-3">
                              <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                              <p className="text-white font-semibold text-sm">
                                {studio.total_visits >= 1000000 
                                  ? `${(studio.total_visits / 1000000).toFixed(1)}M`
                                  : `${(studio.total_visits / 1000).toFixed(0)}K`}
                              </p>
                              <p className="text-gray-400 text-xs">Visits</p>
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full glass-card border-0 text-white hover:bg-white/5"
                          asChild
                        >
                          <a 
                            href={`https://www.roblox.com/groups/${studio.roblox_group_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on Roblox
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Open Positions Tab */}
          <TabsContent value="positions">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Open Positions</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No open positions at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => window.location.href = createPageUrl("Jobs") + `?job=${job.id}`}
                        className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-semibold mb-1">{job.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {job.required_roles?.slice(0, 3).map((role, i) => (
                                <Badge key={i} className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-2">{job.description}</p>
                          </div>
                          <Button size="sm" className="btn-primary text-white">
                            View Job
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Current Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {!companyProfile.current_projects || companyProfile.current_projects.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No projects to showcase yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {companyProfile.current_projects.map((project, i) => (
                      <div key={i} className="bg-white/5 rounded-lg overflow-hidden">
                        {project.image_url && (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-semibold">{project.title}</h3>
                            {project.status && (
                              <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                                {project.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                          {project.game_link && (
                            <Button
                              onClick={() => window.open(project.game_link, '_blank')}
                              size="sm"
                              variant="outline"
                              className="glass-card border-0 text-white hover:bg-white/5"
                            >
                              <ExternalLink className="w-3 h-3 mr-2" />
                              View Game
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Our Team</CardTitle>
              </CardHeader>
              <CardContent>
                {!companyProfile.team_members || companyProfile.team_members.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No team members listed yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {companyProfile.team_members.map((member, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-4 text-center">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto mb-3 flex items-center justify-center">
                            <Users className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <h3 className="text-white font-semibold mb-1">{member.name}</h3>
                        <p className="text-indigo-400 text-sm mb-2">{member.role}</p>
                        {member.bio && (
                          <p className="text-gray-400 text-xs">{member.bio}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <ReviewsSection companyProfileId={companyProfile.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Branding Assistant Modal */}
      {showBrandingAssistant && (
        <AIBrandingAssistant
          companyProfile={companyProfile}
          onApply={handleBrandingApply}
          onClose={() => setShowBrandingAssistant(false)}
        />
      )}
    </div>
  );
}
