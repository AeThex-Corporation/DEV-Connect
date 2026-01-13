import React, { useState } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { supabase } from '@/lib/customSupabaseClient';

    function PostTeamUpPage() {
      const { toast } = useToast();
      const { user } = useAuth();
      const navigate = useNavigate();
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
          toast({ variant: "destructive", title: "Authentication Required", description: "You must be logged in to post." });
          navigate('/login');
          return;
        }
        setLoading(true);
        const formData = new FormData(e.target);
        const roles = formData.get('roles').split(',').map(r => r.trim()).filter(r => r);
        const postData = {
          title: formData.get('title'),
          description: formData.get('description'),
          roles_needed: roles,
          created_by: user.id,
        };

        const { error } = await supabase.from('team_ups').insert([postData]);
        if (error) {
          toast({ variant: "destructive", title: "Error Posting", description: error.message });
        } else {
          toast({ title: "Team-Up Posted!", description: "Your post is now live." });
          navigate('/team-ups');
        }
        setLoading(false);
      };

      return (
        <>
          <Helmet>
            <title>Post a Team-Up | Devconnect</title>
          </Helmet>
          <div className="px-6 py-20 text-center">
            <h1 className="text-5xl font-bold mb-6">Create a Team-Up Post</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Share your project idea and find collaborators.</p>
          </div>
          <div className="max-w-2xl mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-glass p-8 rounded-lg border-glow"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
                  <Input id="title" name="title" placeholder="e.g., Open World RPG" required />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea id="description" name="description" rows="6" className="w-full p-2 bg-input rounded-md" placeholder="Describe your project..." required></textarea>
                </div>
                <div>
                  <label htmlFor="roles" className="block text-sm font-medium text-gray-300 mb-2">Roles Needed (comma-separated)</label>
                  <Input id="roles" name="roles" placeholder="e.g., Scripter, Builder, Animator" required />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold text-lg py-3">
                  {loading ? 'Posting...' : 'Post Team-Up'}
                </Button>
              </form>
            </motion.div>
          </div>
        </>
      );
    }

    export default PostTeamUpPage;