import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import { Briefcase, Building2, User, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PostJobPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [studios, setStudios] = useState([]);

  // Get pre-filled studio ID from URL if present
  const searchParams = new URLSearchParams(location.search);
  const prefilledStudioId = searchParams.get('studioId');

  const [formData, setFormData] = useState({
    title: '',
    role: '',
    pay_type: 'Fixed Price',
    budget: '',
    genre: '',
    description: '',
    required_skills: '',
    post_as: prefilledStudioId ? `studio:${prefilledStudioId}` : 'individual', // 'individual' or 'studio:UUID'
    target_type: 'individual', // 'individual' or 'studio'
  });

  useEffect(() => {
    const fetchMyStudios = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('studios')
        .select('id, name')
        .eq('owner_id', user.id);
      if (data) setStudios(data);
    };
    fetchMyStudios();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      setLoading(false);
      return;
    }

    // Parse "post_as"
    let studio_id = null;
    if (formData.post_as.startsWith('studio:')) {
      studio_id = formData.post_as.split(':')[1];
    }

    // Parse skills
    const skillsArray = formData.required_skills.split(',').map(s => s.trim()).filter(s => s !== '');

    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          title: formData.title,
          role: formData.role,
          pay_type: formData.pay_type,
          budget: formData.budget,
          genre: formData.genre,
          description: formData.description,
          required_skills: skillsArray,
          created_by: user.id,
          studio_id: studio_id,
          target_type: formData.target_type,
          status: 'open',
          is_boosted: false,
          created_at: new Date(),
        }
      ])
      .select();

    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to post job",
        description: error.message,
      });
    } else {
      toast({
        title: "Success!",
        description: "Your job has been posted.",
      });
      navigate('/jobs');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black pt-24 px-4 pb-20">
      <Helmet>
        <title>Post a Job | Devconnect</title>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-white">Post a New Opportunity</h1>
           <p className="text-gray-400">Find the perfect talent for your next big project.</p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-white">Job Details</CardTitle>
              <CardDescription>Provide as much detail as possible to attract the right candidates.</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              
              {/* Identity & Target Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-950 rounded-lg border border-gray-800">
                <div className="space-y-2">
                  <Label className="text-white">Post As</Label>
                  <Select value={formData.post_as} onValueChange={(v) => handleSelectChange('post_as', v)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" /> {profile?.display_name || 'Myself'}
                        </span>
                      </SelectItem>
                      {studios.map(s => (
                        <SelectItem key={s.id} value={`studio:${s.id}`}>
                           <span className="flex items-center gap-2">
                             <Building2 className="w-4 h-4" /> {s.name}
                           </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Who is the employer for this job?</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">I want to hire</Label>
                  <Select value={formData.target_type} onValueChange={(v) => handleSelectChange('target_type', v)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                         <span className="flex items-center gap-2">
                           <User className="w-4 h-4" /> Individual Contractor
                         </span>
                      </SelectItem>
                      <SelectItem value="studio">
                         <span className="flex items-center gap-2">
                           <Users className="w-4 h-4" /> Studio / Team
                         </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Are you looking for a freelancer or a full team?</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Senior Roblox Scripter needed for FPS game"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-white">Role Category</Label>
                  <Select value={formData.role} onValueChange={(v) => handleSelectChange('role', v)} required>
                    <SelectTrigger className="bg-gray-950 border-gray-800 text-white">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scripter">Scripter</SelectItem>
                      <SelectItem value="Builder">Builder</SelectItem>
                      <SelectItem value="3D Modeler">3D Modeler</SelectItem>
                      <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                      <SelectItem value="Animator">Animator</SelectItem>
                      <SelectItem value="Full Team">Full Team</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-white">Game Genre (Optional)</Label>
                  <Input
                    id="genre"
                    name="genre"
                    placeholder="e.g. Horror, RPG, Simulator"
                    value={formData.genre}
                    onChange={handleChange}
                    className="bg-gray-950 border-gray-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pay_type" className="text-white">Payment Type</Label>
                   <Select value={formData.pay_type} onValueChange={(v) => handleSelectChange('pay_type', v)}>
                    <SelectTrigger className="bg-gray-950 border-gray-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                      <SelectItem value="Hourly Rate">Hourly Rate</SelectItem>
                      <SelectItem value="% of Revenue">% of Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-white">Budget / Rate</Label>
                  <Input
                    id="budget"
                    name="budget"
                    placeholder="e.g. $500 or $25/hr"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    className="bg-gray-950 border-gray-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="required_skills" className="text-white">Required Skills (comma separated)</Label>
                <Input
                  id="required_skills"
                  name="required_skills"
                  placeholder="Lua, Blender, Photoshop, Level Design"
                  value={formData.required_skills}
                  onChange={handleChange}
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the project, responsibilities, and what you're looking for..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="min-h-[200px] bg-gray-950 border-gray-800 text-white"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</> : 'Post Job'}
              </Button>

            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PostJobPage;