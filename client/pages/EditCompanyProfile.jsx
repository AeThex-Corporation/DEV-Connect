
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  Save,
  ArrowLeft,
  Plus,
  X,
  Upload,
  Sparkles,
  Link as LinkIcon,
  CheckCircle,
  Loader2
} from "lucide-react";
import AIBrandingAssistant from "../components/AIBrandingAssistant";

export default function EditCompanyProfile() {
  const [user, setUser] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBrandingAssistant, setShowBrandingAssistant] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [verifyingGroup, setVerifyingGroup] = useState(false);
  const [robloxGroupInput, setRobloxGroupInput] = useState("");
  const [verifiedGroupData, setVerifiedGroupData] = useState(null);
  
  const [formData, setFormData] = useState({
    company_name: "",
    tagline: "",
    description: "",
    mission: "",
    industry: "Gaming",
    company_size: "1-10",
    founded_year: new Date().getFullYear(),
    location: "",
    website_url: "",
    logo_url: "",
    banner_url: "",
    brand_colors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#a855f7"
    },
    social_links: {
      twitter: "",
      discord: "",
      youtube: "",
      roblox_group: ""
    },
    culture_values: [],
    perks_benefits: [],
    tech_stack: []
  });

  const [newValue, setNewValue] = useState("");
  const [newPerk, setNewPerk] = useState({ title: "", description: "" });
  const [newTech, setNewTech] = useState("");

  const industries = ["Gaming", "Education", "Entertainment", "Simulation", "Social", "Other"];
  const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profiles = await base44.entities.CompanyProfile.filter({ user_id: currentUser.id });
      
      if (profiles.length > 0) {
        const profile = profiles[0];
        setCompanyProfile(profile);
        setFormData({
          company_name: profile.company_name || "",
          tagline: profile.tagline || "",
          description: profile.description || "",
          mission: profile.mission || "",
          industry: profile.industry || "Gaming",
          company_size: profile.company_size || "1-10",
          founded_year: profile.founded_year || new Date().getFullYear(),
          location: profile.location || "",
          website_url: profile.website_url || "",
          logo_url: profile.logo_url || "",
          banner_url: profile.banner_url || "",
          brand_colors: profile.brand_colors || {
            primary: "#6366f1",
            secondary: "#8b5cf6",
            accent: "#a855f7"
          },
          social_links: profile.social_links || {
            twitter: "",
            discord: "",
            youtube: "",
            roblox_group: ""
          },
          culture_values: profile.culture_values || [],
          perks_benefits: profile.perks_benefits || [],
          tech_stack: profile.tech_stack || []
        });

        // Pre-verify Roblox group if URL exists
        if (profile.social_links?.roblox_group) {
          const robloxGroupUrl = profile.social_links.roblox_group;
          const urlMatch = robloxGroupUrl.match(/groups\/(\d+)/);
          if (urlMatch) {
            const groupId = urlMatch[1];
            try {
              const groupResponse = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`);
              if (groupResponse.ok) {
                const groupData = await groupResponse.json();
                setVerifiedGroupData({
                  id: groupData.id,
                  name: groupData.name,
                  description: groupData.description,
                  memberCount: groupData.memberCount,
                  url: `https://www.roblox.com/groups/${groupData.id}`
                });
                setRobloxGroupInput(robloxGroupUrl); // Pre-fill the input with the URL
              } else {
                console.warn("Could not verify pre-existing Roblox group URL:", robloxGroupUrl);
              }
            } catch (error) {
              console.error("Error verifying pre-existing Roblox group:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    setUploadingBanner(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, banner_url: file_url });
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner. Please try again.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const verifyRobloxGroup = async () => {
    if (!robloxGroupInput.trim()) {
      alert('Please enter a Roblox group URL or ID');
      return;
    }

    setVerifyingGroup(true);
    try {
      // Extract group ID from URL or use direct ID
      let groupId = robloxGroupInput.trim();
      const urlMatch = robloxGroupInput.match(/groups\/(\d+)/);
      if (urlMatch) {
        groupId = urlMatch[1];
      }

      // Fetch group data from Roblox API
      const groupResponse = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`);
      if (!groupResponse.ok) {
        throw new Error('Failed to fetch group data. Please check the group ID/URL.');
      }

      const groupData = await groupResponse.json();
      
      setVerifiedGroupData({
        id: groupData.id,
        name: groupData.name,
        description: groupData.description,
        memberCount: groupData.memberCount,
        url: `https://www.roblox.com/groups/${groupData.id}`
      });

      setFormData({
        ...formData,
        social_links: {
          ...formData.social_links,
          roblox_group: `https://www.roblox.com/groups/${groupData.id}`
        }
      });

      alert(`✅ Successfully verified group: ${groupData.name}`);
    } catch (error) {
      console.error('Error verifying Roblox group:', error);
      alert(error.message || 'Failed to verify Roblox group. Please try again.');
    } finally {
      setVerifyingGroup(false);
    }
  };

  const handleSave = async () => {
    if (!formData.company_name || !formData.description) {
      alert('Please fill in required fields (Company Name and Description)');
      return;
    }

    setSaving(true);
    try {
      if (companyProfile) {
        await base44.entities.CompanyProfile.update(companyProfile.id, formData);
      } else {
        await base44.entities.CompanyProfile.create({
          user_id: user.id,
          ...formData
        });
      }

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '✅ Company Profile Updated',
        message: 'Your company profile has been successfully updated!',
        link: createPageUrl('CompanyProfile')
      });

      window.location.href = createPageUrl('CompanyProfile');
    } catch (error) {
      console.error('Error saving company profile:', error);
      alert('Failed to save company profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addCultureValue = () => {
    if (newValue.trim() && !formData.culture_values.includes(newValue.trim())) {
      setFormData({
        ...formData,
        culture_values: [...formData.culture_values, newValue.trim()]
      });
      setNewValue("");
    }
  };

  const removeCultureValue = (value) => {
    setFormData({
      ...formData,
      culture_values: formData.culture_values.filter(v => v !== value)
    });
  };

  const addPerk = () => {
    if (newPerk.title.trim() && newPerk.description.trim()) {
      setFormData({
        ...formData,
        perks_benefits: [...formData.perks_benefits, { ...newPerk, icon: "✓" }]
      });
      setNewPerk({ title: "", description: "" });
    }
  };

  const removePerk = (index) => {
    setFormData({
      ...formData,
      perks_benefits: formData.perks_benefits.filter((_, i) => i !== index)
    });
  };

  const addTech = () => {
    if (newTech.trim() && !formData.tech_stack.includes(newTech.trim())) {
      setFormData({
        ...formData,
        tech_stack: [...formData.tech_stack, newTech.trim()]
      });
      setNewTech("");
    }
  };

  const removeTech = (tech) => {
    setFormData({
      ...formData,
      tech_stack: formData.tech_stack.filter(t => t !== tech)
    });
  };

  const handleBrandingApply = (updates) => {
    setFormData({
      ...formData,
      ...updates
    });
    setShowBrandingAssistant(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {companyProfile ? 'Edit Company Profile' : 'Create Company Profile'}
            </h1>
            <p className="text-gray-400">Update your company information</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowBrandingAssistant(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Branding
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="glass-card border-0 text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Company Name *</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder="Acme Studios"
                  className="mt-1 bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Tagline</Label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                  placeholder="Building the future of Roblox gaming"
                  className="mt-1 bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell developers about your company..."
                  className="mt-1 bg-white/5 border-white/10 text-white h-32"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                    <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(ind => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Company Size</Label>
                  <Select value={formData.company_size} onValueChange={(value) => setFormData({...formData, company_size: value})}>
                    <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map(size => (
                        <SelectItem key={size} value={size}>{size} employees</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Founded Year</Label>
                  <Input
                    type="number"
                    value={formData.founded_year}
                    onChange={(e) => setFormData({...formData, founded_year: parseInt(e.target.value)})}
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Remote, San Francisco, etc."
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission & Branding */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Mission & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Mission Statement</Label>
                <Textarea
                  value={formData.mission}
                  onChange={(e) => setFormData({...formData, mission: e.target.value})}
                  placeholder="What drives your company?"
                  className="mt-1 bg-white/5 border-white/10 text-white h-24"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <Label className="text-gray-300">Company Logo</Label>
                <div className="mt-2 space-y-3">
                  {formData.logo_url && (
                    <div className="relative w-32 h-32 bg-white/5 rounded-lg overflow-hidden">
                      <img 
                        src={formData.logo_url} 
                        alt="Company Logo" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setFormData({...formData, logo_url: ""})}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                      <div className="btn-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Logo
                          </>
                        )}
                      </div>
                    </label>
                    <Input
                      value={formData.logo_url}
                      onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                      placeholder="Or paste image URL"
                      className="flex-1 bg-white/5 border-white/10 text-white text-sm"
                    />
                  </div>
                  <p className="text-gray-500 text-xs">Recommended: Square image, at least 256x256px, max 5MB</p>
                </div>
              </div>

              {/* Banner Upload */}
              <div>
                <Label className="text-gray-300">Company Banner</Label>
                <div className="mt-2 space-y-3">
                  {formData.banner_url && (
                    <div className="relative w-full h-48 bg-white/5 rounded-lg overflow-hidden">
                      <img 
                        src={formData.banner_url} 
                        alt="Company Banner" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setFormData({...formData, banner_url: ""})}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                        disabled={uploadingBanner}
                      />
                      <div className="btn-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        {uploadingBanner ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Banner
                          </>
                        )}
                      </div>
                    </label>
                    <Input
                      value={formData.banner_url}
                      onChange={(e) => setFormData({...formData, banner_url: e.target.value})}
                      placeholder="Or paste image URL"
                      className="flex-1 bg-white/5 border-white/10 text-white text-sm"
                    />
                  </div>
                  <p className="text-gray-500 text-xs">Recommended: 1920x480px or wider, max 10MB</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Brand Colors</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-400 text-xs">Primary</Label>
                    <Input
                      type="color"
                      value={formData.brand_colors.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        brand_colors: {...formData.brand_colors, primary: e.target.value}
                      })}
                      className="mt-1 h-12"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Secondary</Label>
                    <Input
                      type="color"
                      value={formData.brand_colors.secondary}
                      onChange={(e) => setFormData({
                        ...formData,
                        brand_colors: {...formData.brand_colors, secondary: e.target.value}
                      })}
                      className="mt-1 h-12"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Accent</Label>
                    <Input
                      type="color"
                      value={formData.brand_colors.accent}
                      onChange={(e) => setFormData({
                        ...formData,
                        brand_colors: {...formData.brand_colors, accent: e.target.value}
                      })}
                      className="mt-1 h-12"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Links & Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Website URL</Label>
                <Input
                  value={formData.website_url}
                  onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                  placeholder="https://yourcompany.com"
                  className="mt-1 bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Roblox Group Verification */}
              <div>
                <Label className="text-gray-300">Roblox Group (Verified)</Label>
                <div className="mt-2 space-y-3">
                  {verifiedGroupData ? (
                    <Card className="glass-card border-0 bg-green-500/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                            <div>
                              <h4 className="text-white font-semibold">{verifiedGroupData.name}</h4>
                              <p className="text-gray-400 text-sm line-clamp-2">{verifiedGroupData.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span>{verifiedGroupData.memberCount.toLocaleString()} members</span>
                                <a 
                                  href={verifiedGroupData.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                  View Group <LinkIcon className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setVerifiedGroupData(null);
                              setRobloxGroupInput("");
                              setFormData({
                                ...formData,
                                social_links: {...formData.social_links, roblox_group: ""}
                              });
                            }}
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={robloxGroupInput}
                        onChange={(e) => setRobloxGroupInput(e.target.value)}
                        placeholder="Enter group URL or ID (e.g., https://roblox.com/groups/12345)"
                        className="flex-1 bg-white/5 border-white/10 text-white"
                      />
                      <Button
                        onClick={verifyRobloxGroup}
                        disabled={verifyingGroup || !robloxGroupInput.trim()}
                        className="btn-primary text-white"
                      >
                        {verifyingGroup ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify Group
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  <p className="text-gray-500 text-xs">
                    Verify your Roblox group to display it on your company profile with member count and description
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Twitter</Label>
                  <Input
                    value={formData.social_links.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: {...formData.social_links, twitter: e.target.value}
                    })}
                    placeholder="https://twitter.com/..."
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Discord</Label>
                  <Input
                    value={formData.social_links.discord}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: {...formData.social_links, discord: e.target.value}
                    })}
                    placeholder="https://discord.gg/..."
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">YouTube</Label>
                  <Input
                    value={formData.social_links.youtube}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: {...formData.social_links, youtube: e.target.value}
                    })}
                    placeholder="https://youtube.com/..."
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Culture & Values */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Culture & Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Add a value (e.g., Innovation, Collaboration)"
                  className="bg-white/5 border-white/10 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCultureValue())}
                />
                <Button onClick={addCultureValue} size="sm" className="btn-primary text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.culture_values.map(value => (
                  <div key={value} className="bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-white text-sm">{value}</span>
                    <button onClick={() => removeCultureValue(value)} className="text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Perks & Benefits */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Perks & Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  value={newPerk.title}
                  onChange={(e) => setNewPerk({...newPerk, title: e.target.value})}
                  placeholder="Benefit title (e.g., Flexible Hours)"
                  className="bg-white/5 border-white/10 text-white"
                />
                <div className="flex gap-2">
                  <Input
                    value={newPerk.description}
                    onChange={(e) => setNewPerk({...newPerk, description: e.target.value})}
                    placeholder="Description"
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Button onClick={addPerk} size="sm" className="btn-primary text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {formData.perks_benefits.map((perk, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{perk.title}</p>
                        <p className="text-gray-400 text-sm">{perk.description}</p>
                      </div>
                      <button onClick={() => removePerk(index)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Tech Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="Add technology (e.g., Lua, Git, Discord)"
                  className="bg-white/5 border-white/10 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                />
                <Button onClick={addTech} size="sm" className="btn-primary text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tech_stack.map(tech => (
                  <div key={tech} className="bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-white text-sm">{tech}</span>
                    <button onClick={() => removeTech(tech)} className="text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !formData.company_name || !formData.description}
              className="flex-1 btn-primary text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Company Profile
                </>
              )}
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="glass-card border-0 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* AI Branding Assistant */}
      {showBrandingAssistant && (
        <AIBrandingAssistant
          companyProfile={formData}
          onApply={handleBrandingApply}
          onClose={() => setShowBrandingAssistant(false)}
        />
      )}
    </div>
  );
}
