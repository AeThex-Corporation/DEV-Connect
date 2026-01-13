import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

const EditProfileDialog = ({ open, onOpenChange, profile, onProfileUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    motto: '',
    bio: '',
    role: '',
    availability: '',
    location: '',
    tags: '',
    devforum_url: '',
    discord_handle: '',
    github_url: '',
    artstation_url: '',
    youtube_url: '',
    contact_twitter: '',
    roblox_game_url: '',
    roblox_user_id: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        display_name: profile.display_name || '',
        motto: profile.motto || '',
        bio: profile.bio || '',
        role: profile.role || '',
        availability: profile.availability || 'Not Available',
        location: profile.location || '',
        tags: profile.tags?.join(', ') || '',
        devforum_url: profile.devforum_url || '',
        discord_handle: profile.discord_handle || '',
        github_url: profile.github_url || '',
        artstation_url: profile.artstation_url || '',
        youtube_url: profile.youtube_url || '',
        contact_twitter: profile.contact_twitter || '',
        roblox_game_url: profile.roblox_game_url || '',
        roblox_user_id: profile.roblox_user_id || '',
      });
    }
  }, [profile, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAvailabilityChange = (value) => {
    setFormData((prev) => ({ ...prev, availability: value }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (fileType === 'avatar') setAvatarFile(file);
    if (fileType === 'banner') setBannerFile(file);
  };

  const uploadFile = async (file, bucket, userId) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const updates = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      const avatarUrl = await uploadFile(avatarFile, 'avatars', user.id);
      if (avatarUrl) updates.avatar_url = avatarUrl;

      const bannerUrl = await uploadFile(bannerFile, 'banners', user.id);
      if (bannerUrl) updates.banner_url = bannerUrl;

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

      if (error) throw error;

      toast({ title: 'Profile Updated!', description: 'Your changes have been saved.' });
      if (onProfileUpdate) onProfileUpdate();
      onOpenChange(false);
      
      if (formData.username !== profile.username) {
        navigate(`/profile/${formData.username}`);
      }

    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.code === '23505' ? 'Username is already taken.' : error.message });
    } finally {
      setLoading(false);
      setAvatarFile(null);
      setBannerFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium">Username</label>
            <Input id="username" name="username" value={formData.username} onChange={handleInputChange} />
          </div>
          <div className="space-y-1">
            <label htmlFor="display_name" className="text-sm font-medium">Display Name</label>
            <Input id="display_name" name="display_name" value={formData.display_name} onChange={handleInputChange} />
          </div>
          <div className="space-y-1">
            <label htmlFor="motto" className="text-sm font-medium">Motto</label>
            <Input id="motto" name="motto" value={formData.motto} onChange={handleInputChange} />
          </div>
          <div className="space-y-1">
            <label htmlFor="bio" className="text-sm font-medium">Bio</label>
            <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} />
          </div>
          <div className="space-y-1">
            <label htmlFor="role" className="text-sm font-medium">Role</label>
            <Input id="role" name="role" value={formData.role} onChange={handleInputChange} placeholder="e.g. Lead Developer" />
          </div>
          <div className="space-y-1">
            <label htmlFor="availability" className="text-sm font-medium">Availability</label>
            <Select onValueChange={handleAvailabilityChange} value={formData.availability}>
              <SelectTrigger>
                <SelectValue placeholder="Set your work status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available for Hire">Available for Hire</SelectItem>
                <SelectItem value="Open to Offers">Open to Offers</SelectItem>
                <SelectItem value="Busy">Busy</SelectItem>
                <SelectItem value="Focusing on Projects">Focusing on Projects</SelectItem>
                <SelectItem value="Not Available">Not Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="location" className="text-sm font-medium">Location</label>
            <Input id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. San Francisco, CA" />
          </div>
          <div className="space-y-1">
            <label htmlFor="tags" className="text-sm font-medium">Skills</label>
            <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="Comma-separated, e.g., Builder, Scripter" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label htmlFor="avatar" className="text-sm font-medium">Avatar</label>
              <Button asChild variant="outline" className="w-full cursor-pointer">
                <label htmlFor="avatar" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" /> <span className="truncate">{avatarFile ? avatarFile.name : 'Upload Image'}</span>
                  <Input id="avatar" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" />
                </label>
              </Button>
            </div>
            <div className="space-y-1">
              <label htmlFor="banner" className="text-sm font-medium">Banner</label>
              <Button asChild variant="outline" className="w-full cursor-pointer">
                <label htmlFor="banner" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" /> <span className="truncate">{bannerFile ? bannerFile.name : 'Upload Image'}</span>
                  <Input id="banner" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} className="hidden" />
                </label>
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-2">Social & Game Links</h3>
            <div className="space-y-2">
              <label htmlFor="roblox_user_id" className="text-sm font-medium">Roblox User ID</label>
              <Input id="roblox_user_id" name="roblox_user_id" value={formData.roblox_user_id} onChange={handleInputChange} placeholder="e.g., 12345678" />
            </div>
            <div className="space-y-2">
              <label htmlFor="discord_handle" className="text-sm font-medium">Discord</label>
              <Input id="discord_handle" name="discord_handle" value={formData.discord_handle} onChange={handleInputChange} placeholder="username#1234" />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact_twitter" className="text-sm font-medium">Twitter</label>
              <Input id="contact_twitter" name="contact_twitter" type="url" value={formData.contact_twitter} onChange={handleInputChange} placeholder="https://twitter.com/..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="github_url" className="text-sm font-medium">GitHub</label>
              <Input id="github_url" name="github_url" type="url" value={formData.github_url} onChange={handleInputChange} placeholder="https://github.com/..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="artstation_url" className="text-sm font-medium">ArtStation</label>
              <Input id="artstation_url" name="artstation_url" type="url" value={formData.artstation_url} onChange={handleInputChange} placeholder="https://www.artstation.com/..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="youtube_url" className="text-sm font-medium">YouTube</label>
              <Input id="youtube_url" name="youtube_url" type="url" value={formData.youtube_url} onChange={handleInputChange} placeholder="https://www.youtube.com/c/..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="devforum_url" className="text-sm font-medium">DevForum</label>
              <Input id="devforum_url" name="devforum_url" type="url" value={formData.devforum_url} onChange={handleInputChange} placeholder="https://devforum.roblox.com/u/..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="roblox_game_url" className="text-sm font-medium">Roblox Game</label>
              <Input id="roblox_game_url" name="roblox_game_url" type="url" value={formData.roblox_game_url} onChange={handleInputChange} placeholder="https://www.roblox.com/games/..." />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;