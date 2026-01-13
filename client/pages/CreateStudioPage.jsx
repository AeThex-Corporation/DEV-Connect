import React, { useState } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Building, Link as LinkIcon, Twitter, Linkedin, MapPin, Tag } from 'lucide-react';

    function CreateStudioPage() {
      const { user } = useAuth();
      const { toast } = useToast();
      const navigate = useNavigate();
      const [name, setName] = useState('');
      const [description, setDescription] = useState('');
      const [websiteUrl, setWebsiteUrl] = useState('');
      const [twitterUrl, setTwitterUrl] = useState('');
      const [linkedinUrl, setLinkedinUrl] = useState('');
      const [location, setLocation] = useState('');
      const [tags, setTags] = useState('');
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
          toast({ variant: 'destructive', title: 'Not authenticated' });
          return;
        }
        if (!name.trim()) {
          toast({ variant: 'destructive', title: 'Studio name is required' });
          return;
        }

        setLoading(true);

        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        const { data, error } = await supabase
          .from('studios')
          .insert({
            name,
            slug,
            description,
            owner_id: user.id,
            type: 'studio',
            website_url: websiteUrl,
            twitter_url: twitterUrl,
            linkedin_url: linkedinUrl,
            location,
            tags: tagsArray,
          })
          .select()
          .single();

        setLoading(false);

        if (error) {
          toast({
            variant: 'destructive',
            title: 'Error creating studio',
            description: error.message,
          });
        } else {
          toast({
            title: 'Studio Created!',
            description: `Your new studio "${name}" is live.`,
          });
          navigate(`/studios/${data.slug}`);
        }
      };

      return (
        <>
          <Helmet>
            <title>Create a Studio | Devconnect</title>
          </Helmet>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-glass p-8 rounded-lg border-glow"
            >
              <div className="text-center mb-8">
                <Building className="mx-auto h-12 w-12 text-indigo-400" />
                <h1 className="text-4xl font-bold mt-4">Create Your Studio</h1>
                <p className="text-gray-400 mt-2">Build your brand and team on Devconnect.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="studio-name">Studio Name</Label>
                  <Input
                    id="studio-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., 'Pixel Perfect Studios'"
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="studio-description">Description</Label>
                  <Textarea
                    id="studio-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what your studio does, its mission, and what makes it unique."
                    className="bg-gray-800 border-gray-700"
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="website-url" className="flex items-center"><LinkIcon className="w-4 h-4 mr-2" />Website URL</Label>
                        <Input id="website-url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourstudio.com" className="bg-gray-800 border-gray-700" />
                    </div>
                    <div>
                        <Label htmlFor="location" className="flex items-center"><MapPin className="w-4 h-4 mr-2" />Location</Label>
                        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., San Francisco, CA" className="bg-gray-800 border-gray-700" />
                    </div>
                    <div>
                        <Label htmlFor="twitter-url" className="flex items-center"><Twitter className="w-4 h-4 mr-2" />Twitter URL</Label>
                        <Input id="twitter-url" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://twitter.com/yourstudio" className="bg-gray-800 border-gray-700" />
                    </div>
                    <div>
                        <Label htmlFor="linkedin-url" className="flex items-center"><Linkedin className="w-4 h-4 mr-2" />LinkedIn URL</Label>
                        <Input id="linkedin-url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/company/yourstudio" className="bg-gray-800 border-gray-700" />
                    </div>
                </div>
                 <div>
                  <Label htmlFor="tags" className="flex items-center"><Tag className="w-4 h-4 mr-2" />Tags / Specializations</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., Game Development, Web Design, Mobile Apps"
                    className="bg-gray-800 border-gray-700"
                  />
                   <p className="text-xs text-gray-500 mt-1">Separate tags with commas.</p>
                </div>
                <Button type="submit" disabled={loading} className="w-full text-lg py-6">
                  {loading ? 'Creating...' : 'Create Studio'}
                </Button>
              </form>
            </motion.div>
          </div>
        </>
      );
    }

    export default CreateStudioPage;