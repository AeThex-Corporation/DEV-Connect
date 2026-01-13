import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { supabase } from '@/lib/customSupabaseClient';

    function CreateCollectivePage() {
      const { toast } = useToast();
      const { user } = useAuth();
      const navigate = useNavigate();
      const [loading, setLoading] = useState(false);
      const [name, setName] = useState('');
      const [description, setDescription] = useState('');
      const [associatedStudioId, setAssociatedStudioId] = useState(null);
      const [ownedStudios, setOwnedStudios] = useState([]);

      useEffect(() => {
        const fetchOwnedStudios = async () => {
          if (!user) return;
          const { data, error } = await supabase
            .from('studios')
            .select('id, name')
            .eq('owner_id', user.id)
            .eq('type', 'studio');
          
          if (error) {
            toast({ variant: "destructive", title: "Error fetching studios", description: error.message });
          } else {
            setOwnedStudios(data);
          }
        };
        fetchOwnedStudios();
      }, [user, toast]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
          toast({ variant: "destructive", title: "Authentication Required" });
          navigate('/login');
          return;
        }
        setLoading(true);
        
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        const postData = {
          name,
          slug,
          description,
          owner_id: user.id,
          type: 'collective',
          associated_studio_id: associatedStudioId,
        };

        const { data, error } = await supabase.from('studios').insert([postData]).select().single();
        if (error) {
          toast({ variant: "destructive", title: "Error Creating Collective", description: error.message });
        } else {
          toast({ title: "Collective Created!", description: "Your new collective is live." });
          navigate(`/collectives/${data.slug}`);
        }
        setLoading(false);
      };

      return (
        <>
          <Helmet><title>Create a Collective | Devconnect</title></Helmet>
          <div className="px-6 py-20 text-center">
            <h1 className="text-5xl font-bold mb-6">Create a Collective</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Start your own development team or learning group.</p>
          </div>
          <div className="max-w-2xl mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-glass p-8 rounded-lg border-glow"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Collective Name</Label>
                  <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., The Scripters Guild" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="6" className="w-full p-2 bg-input rounded-md" placeholder="What is your collective about?" required />
                </div>
                {ownedStudios.length > 0 && (
                  <div>
                    <Label htmlFor="associated-studio">Link to a Studio (Optional)</Label>
                    <Select onValueChange={setAssociatedStudioId} value={associatedStudioId || ''}>
                      <SelectTrigger id="associated-studio" className="w-full">
                        <SelectValue placeholder="Select a studio..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>None</SelectItem>
                        {ownedStudios.map(studio => (
                          <SelectItem key={studio.id} value={studio.id}>{studio.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg py-3">
                  {loading ? 'Creating...' : 'Create Collective'}
                </Button>
              </form>
            </motion.div>
          </div>
        </>
      );
    }

    export default CreateCollectivePage;