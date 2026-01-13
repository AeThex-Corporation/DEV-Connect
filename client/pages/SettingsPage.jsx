import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Building2, Layers, Save, Loader2 } from 'lucide-react';

const SettingsPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    account_type: '',
    location: '',
    website_url: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        account_type: profile.account_type || '',
        location: profile.location || '',
        website_url: profile.website_url || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountTypeChange = (value) => {
    setFormData(prev => ({ ...prev, account_type: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          account_type: formData.account_type,
          location: formData.location,
          website_url: formData.website_url,
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Settings Updated",
        description: "Your profile settings have been successfully saved.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update settings.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 px-4 pb-20">
      <Helmet>
        <title>Settings | Devconnect</title>
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400 mb-8">Manage your profile and account preferences.</p>

        <Card className="bg-gray-900 border-gray-800">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-white">General Information</CardTitle>
              <CardDescription>Update your public profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="account_type" className="text-white">Account Type</Label>
                <div className="text-sm text-gray-400 mb-2">
                  This determines which features are highlighted on your dashboard.
                </div>
                <Select 
                  value={formData.account_type} 
                  onValueChange={handleAccountTypeChange}
                >
                  <SelectTrigger className="w-full bg-gray-950 border-gray-800 text-white">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800 text-white">
                    <SelectItem value="contractor" className="focus:bg-gray-800 focus:text-white cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-400" />
                        <span>Find Work (Contractor)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="business" className="focus:bg-gray-800 focus:text-white cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-400" />
                        <span>Hire Talent (Business)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="both" className="focus:bg-gray-800 focus:text-white cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-green-400" />
                        <span>Both (Contractor & Hiring)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-white">Display Name</Label>
                  <Input
                    id="display_name"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    className="bg-gray-950 border-gray-800 text-white"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="bg-gray-950 border-gray-800 text-white"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="bg-gray-950 border-gray-800 text-white min-h-[100px]"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url" className="text-white">Website URL</Label>
                <Input
                  id="website_url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  className="bg-gray-950 border-gray-800 text-white"
                  placeholder="https://your-portfolio.com"
                />
              </div>

            </CardContent>
            <CardFooter className="border-t border-gray-800 pt-6 flex justify-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;