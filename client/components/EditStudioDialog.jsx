import React, { useState, useEffect, useCallback } from 'react';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
    } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Label } from '@/components/ui/label';
    import { Link as LinkIcon, Twitter, Linkedin, MapPin, Tag, Trash2, Upload } from 'lucide-react';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Link } from 'react-router-dom';

    const MemberManagementTab = ({ studioId, onUpdate }) => {
        const [members, setMembers] = useState([]);
        const [loading, setLoading] = useState(true);
        const { toast } = useToast();

        const fetchMembers = useCallback(async () => {
            if (!studioId) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('studio_members')
                .select('*, profile:profiles(id, display_name, username, avatar_url)')
                .eq('studio_id', studioId);
            
            if (error) {
                toast({ variant: 'destructive', title: 'Error fetching members', description: error.message });
                setMembers([]);
            } else {
                setMembers(data);
            }
            setLoading(false);
        }, [studioId, toast]);

        useEffect(() => {
            fetchMembers();
        }, [fetchMembers]);

        const handleRoleChange = async (userId, newRole) => {
            const { error } = await supabase
                .from('studio_members')
                .update({ role: newRole })
                .match({ studio_id: studioId, user_id: userId });
            if (error) {
                toast({ variant: 'destructive', title: 'Error updating role', description: error.message });
            } else {
                toast({ title: 'Role updated!' });
                fetchMembers();
                if (onUpdate) onUpdate();
            }
        };

        const handleRemoveMember = async (userId) => {
            const { error } = await supabase
                .from('studio_members')
                .delete()
                .match({ studio_id: studioId, user_id: userId });
            if (error) {
                toast({ variant: 'destructive', title: 'Error removing member', description: error.message });
            } else {
                toast({ title: 'Member removed' });
                fetchMembers();
                if (onUpdate) onUpdate();
            }
        };

        if (loading) {
            return <div className="text-center p-8">Loading members...</div>;
        }

        if (members.length === 0) {
            return <div className="text-center p-8 text-gray-400">No members found.</div>;
        }

        return (
            <div className="space-y-4">
                {members.map(member => (
                    <div key={member.user_id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-md">
                        <Link to={`/profile/${member.profile.username}`} className="flex items-center gap-3">
                            <img src={member.profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.profile.username}`} alt="avatar" className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-semibold">{member.profile.display_name}</p>
                                <p className="text-sm text-gray-400">@{member.profile.username}</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Select value={member.role} onValueChange={(newRole) => handleRoleChange(member.user_id, newRole)}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Editor">Editor</SelectItem>
                                    <SelectItem value="Member">Member</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="destructive" size="icon" onClick={() => handleRemoveMember(member.user_id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const EditStudioDialog = ({ open, onOpenChange, studio, onStudioUpdate }) => {
      const { toast } = useToast();
      const [name, setName] = useState('');
      const [description, setDescription] = useState('');
      const [websiteUrl, setWebsiteUrl] = useState('');
      const [twitterUrl, setTwitterUrl] = useState('');
      const [linkedinUrl, setLinkedinUrl] = useState('');
      const [location, setLocation] = useState('');
      const [tags, setTags] = useState('');
      const [loading, setLoading] = useState(false);
      const [avatarFile, setAvatarFile] = useState(null);
      const [bannerFile, setBannerFile] = useState(null);

      useEffect(() => {
        if (studio) {
          setName(studio.name || '');
          setDescription(studio.description || '');
          setWebsiteUrl(studio.website_url || '');
          setTwitterUrl(studio.twitter_url || '');
          setLinkedinUrl(studio.linkedin_url || '');
          setLocation(studio.location || '');
          setTags((studio.tags || []).join(', '));
        }
      }, [studio]);

      const handleFileChange = (e, fileType) => {
        const file = e.target.files[0];
        if (fileType === 'avatar') setAvatarFile(file);
        if (fileType === 'banner') setBannerFile(file);
      };

      const uploadFile = async (file, bucket, studioId) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${studioId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

            const updates = { 
                name, 
                slug,
                description,
                website_url: websiteUrl,
                twitter_url: twitterUrl,
                linkedin_url: linkedinUrl,
                location,
                tags: tagsArray,
            };

            const avatarUrl = await uploadFile(avatarFile, 'avatars', studio.id);
            if (avatarUrl) updates.avatar_url = avatarUrl;

            const bannerUrl = await uploadFile(bannerFile, 'banners', studio.id);
            if (bannerUrl) updates.banner_url = bannerUrl;

            const { error } = await supabase
              .from('studios')
              .update(updates)
              .eq('id', studio.id);

            if (error) throw error;

            toast({
                title: 'Studio Updated!',
                description: 'Your studio details have been saved.',
            });
            onStudioUpdate();
            onOpenChange(false);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error updating studio',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
      };

      if (!studio) {
        return null;
      }

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Studio</DialogTitle>
              <DialogDescription>
                Update your studio's public information and manage members.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mt-4">
                      <div>
                        <Label htmlFor="studio-name">Studio Name</Label>
                        <Input id="studio-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your awesome studio name" className="bg-gray-800 border-gray-700" />
                      </div>
                      <div>
                        <Label htmlFor="studio-description">Description</Label>
                        <Textarea id="studio-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell everyone what your studio is about." className="bg-gray-800 border-gray-700" rows={5} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="edit-website-url" className="flex items-center"><LinkIcon className="w-4 h-4 mr-2" />Website URL</Label>
                            <Input id="edit-website-url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourstudio.com" className="bg-gray-800 border-gray-700" />
                        </div>
                        <div>
                            <Label htmlFor="edit-location" className="flex items-center"><MapPin className="w-4 h-4 mr-2" />Location</Label>
                            <Input id="edit-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., San Francisco, CA" className="bg-gray-800 border-gray-700" />
                        </div>
                        <div>
                            <Label htmlFor="edit-twitter-url" className="flex items-center"><Twitter className="w-4 h-4 mr-2" />Twitter URL</Label>
                            <Input id="edit-twitter-url" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://twitter.com/yourstudio" className="bg-gray-800 border-gray-700" />
                        </div>
                        <div>
                            <Label htmlFor="edit-linkedin-url" className="flex items-center"><Linkedin className="w-4 h-4 mr-2" />LinkedIn URL</Label>
                            <Input id="edit-linkedin-url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/company/yourstudio" className="bg-gray-800 border-gray-700" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="edit-tags" className="flex items-center"><Tag className="w-4 h-4 mr-2" />Tags / Specializations</Label>
                        <Input id="edit-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., Game Development, Web Design" className="bg-gray-800 border-gray-700" />
                        <p className="text-xs text-gray-500 mt-1">Separate tags with commas.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <Label htmlFor="avatar">Studio Avatar</Label>
                          <Button asChild variant="outline" className="w-full cursor-pointer">
                            <label htmlFor="avatar" className="flex items-center gap-2">
                              <Upload className="h-4 w-4" /> <span className="truncate">{avatarFile ? avatarFile.name : 'Upload Image'}</span>
                              <Input id="avatar" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" />
                            </label>
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="banner">Studio Banner</Label>
                          <Button asChild variant="outline" className="w-full cursor-pointer">
                            <label htmlFor="banner" className="flex items-center gap-2">
                              <Upload className="h-4 w-4" /> <span className="truncate">{bannerFile ? bannerFile.name : 'Upload Image'}</span>
                              <Input id="banner" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} className="hidden" />
                            </label>
                          </Button>
                        </div>
                      </div>
                      <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </DialogFooter>
                    </form>
                </TabsContent>
                <TabsContent value="members" className="max-h-[60vh] overflow-y-auto pr-2 mt-4">
                    <MemberManagementTab studioId={studio?.id} onUpdate={onStudioUpdate} />
                </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      );
    };

    export default EditStudioDialog;