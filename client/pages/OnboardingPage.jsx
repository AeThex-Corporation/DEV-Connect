import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';

const OnboardingPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    role: '',
    tags: '',
    bio: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (profile) {
      if (profile.onboarding_complete) {
        navigate('/dashboard');
      }
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        role: profile.role || '',
        tags: profile.tags?.join(', ') || '',
        bio: profile.bio || '',
      });
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = data.publicUrl;
      }

      const updates = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        avatar_url: avatarUrl,
        onboarding_complete: true,
      };

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw error;

      // Award 'First Steps' achievement
      const { error: achievementError } = await supabase.rpc('award_achievement', {
        p_user_id: user.id,
        p_achievement_slug: 'first-steps'
      });
      if (achievementError) {
        console.error("Could not award 'first-steps' achievement:", achievementError.message);
      }

      toast({ title: 'Profile Setup Complete!', description: 'Welcome to Devconnect!' });
      await refreshProfile();
      navigate('/dashboard');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Setup Your Profile | Devconnect</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-grid-pattern p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-glass border-glow rounded-2xl p-8 md:p-12"
        >
          <h1 className="text-4xl font-bold text-center mb-2">Set Up Your Profile</h1>
          <p className="text-gray-400 text-center mb-8">Let's get you started. This helps others find you.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <img
                  src={avatarPreview || `https://api.dicebear.com/7.x/bottts/svg?seed=${formData.username}`}
                  alt="Avatar Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-700"
                />
                <label
                  htmlFor="avatar"
                  className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-5 h-5 text-white" />
                  <input id="avatar" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="display_name" className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                <Input id="display_name" name="display_name" value={formData.display_name} onChange={handleInputChange} required />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <Input id="username" name="username" value={formData.username} onChange={handleInputChange} required />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">Primary Role</label>
              <Input id="role" name="role" value={formData.role} onChange={handleInputChange} placeholder="e.g., Scripter, Builder, UI/UX Designer" required />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
              <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="Comma-separated, e.g., Luau, Blender, Photoshop" />
              <p className="text-xs text-gray-500 mt-1">Separate skills with a comma.</p>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
              <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} placeholder="Tell us a bit about yourself..." />
            </div>

            <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Complete Setup'}
            </Button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default OnboardingPage;