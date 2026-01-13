import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { api } from '@/lib/db';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  BarChart3,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Plus
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0, jobs: 0 });
  const [applications, setApplications] = useState([]);
  const { toast } = useToast();
  const [expandedApp, setExpandedApp] = useState(null);

  // Job Posting State
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    role: '',
    pay_type: 'Hourly',
    genre: 'Development',
    scope: 'Remote',
    description: '',
    budget: '',
    required_skills: '' // comma separated
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, appsData] = await Promise.all([
        api.getAdminStats(),
        api.getPendingApplications()
      ]);
      setStats(statsData);
      setApplications(appsData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching admin data",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateApplicationStatus(id, status);
      toast({
        title: `Application ${status}`,
        description: `The contractor has been ${status}.`
      });
      fetchData(); 
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: error.message
      });
    }
  };

  const handleCreateJob = async () => {
    try {
      const skillsArray = jobForm.required_skills.split(',').map(s => s.trim()).filter(Boolean);
      
      await api.createJob({
        ...jobForm,
        required_skills: skillsArray,
        created_by: user.id
      });

      toast({
        title: "Job Created",
        description: "The job has been successfully posted to the board."
      });
      setIsJobDialogOpen(false);
      setJobForm({
        title: '',
        role: '',
        pay_type: 'Hourly',
        genre: 'Development',
        scope: 'Remote',
        description: '',
        budget: '',
        required_skills: ''
      });
      fetchData(); // update stats
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create job",
        description: error.message
      });
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader /></div>;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Devconnect</title>
      </Helmet>

      <div className="min-h-screen pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Verification Center</h1>
              <p className="text-gray-400">Manage contractor verifications and platform oversight.</p>
            </div>
            <Button onClick={fetchData} variant="outline" className="bg-glass">Refresh Data</Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <Card className="bg-glass border-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.pending}</div>
                <p className="text-xs text-gray-400">Applications</p>
              </CardContent>
            </Card>
            <Card className="bg-glass border-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">Total Talent</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <p className="text-xs text-gray-400">Registered contractors</p>
              </CardContent>
            </Card>
            <Card className="bg-glass border-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">Verified</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.approved}</div>
                <p className="text-xs text-gray-400">Fully vetted</p>
              </CardContent>
            </Card>
             <Card className="bg-glass border-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.jobs}</div>
                <p className="text-xs text-gray-400">Live on board</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="verifications" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 mb-8">
              <TabsTrigger value="verifications">Verifications</TabsTrigger>
              <TabsTrigger value="jobs">Job Management</TabsTrigger>
            </TabsList>

            <TabsContent value="verifications">
               {/* Applications List */}
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Pending Applications
              </h2>

              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-12 bg-glass rounded-xl border border-white/5">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">All caught up!</h3>
                    <p className="text-gray-400">No pending verifications at the moment.</p>
                  </div>
                ) : (
                  applications.map((app) => (
                    <Collapsible 
                      key={app.id} 
                      open={expandedApp === app.id}
                      onOpenChange={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                      className="bg-glass rounded-xl border border-white/10 overflow-hidden transition-all hover:border-blue-500/30"
                    >
                      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-white/10">
                            <AvatarImage src={app.profiles?.avatar_url} />
                            <AvatarFallback>{app.profiles?.display_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-white text-lg">{app.profiles?.display_name}</h3>
                            <p className="text-sm text-gray-400">@{app.profiles?.username} • {app.profiles?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex gap-2 mr-4">
                             {app.skills?.slice(0, 3).map(skill => (
                               <Badge key={skill} variant="secondary" className="bg-white/10 text-gray-300">{skill}</Badge>
                             ))}
                             {app.skills?.length > 3 && <Badge variant="secondary">+{app.skills.length - 3}</Badge>}
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {expandedApp === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>

                      <CollapsibleContent className="border-t border-white/10 bg-black/20">
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Professional Links</h4>
                              <div className="flex gap-4">
                                {app.github_url && (
                                  <a href={app.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline text-sm">
                                    <Github className="w-4 h-4" /> GitHub
                                  </a>
                                )}
                                {app.linkedin_url && (
                                  <a href={app.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline text-sm">
                                    <Linkedin className="w-4 h-4" /> LinkedIn
                                  </a>
                                )}
                                {app.portfolio_url && (
                                  <a href={app.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline text-sm">
                                    <Globe className="w-4 h-4" /> Portfolio
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Bio & Experience</h4>
                              <p className="text-white text-sm leading-relaxed mb-2">{app.bio}</p>
                              <div className="flex gap-4 text-sm text-gray-400">
                                <span><strong className="text-white">{app.experience_years}</strong> experience</span>
                                <span><strong className="text-white">${app.hourly_rate}</strong> /hr</span>
                                <span>Availability: <strong className="text-white">{app.availability}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Quiz Responses</h4>
                            <div className="space-y-3">
                              {app.verification_responses?.map((resp, i) => (
                                <div key={i} className="bg-white/5 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 mb-1">{resp.question_text}</p>
                                  <p className="text-sm text-white font-mono bg-black/30 p-2 rounded">{resp.answer_text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-white/5 flex justify-end gap-4 border-t border-white/10">
                          <Button 
                            variant="destructive" 
                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Reject Application
                          </Button>
                          <Button 
                            onClick={() => handleStatusUpdate(app.id, 'approved')}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve Contractor
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="jobs">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-semibold text-white">Active Job Listings</h2>
                 <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Post New Job
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Post a New Job</DialogTitle>
                        <DialogDescription>Create a job listing for the community board.</DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Job Title</label>
                            <Input 
                              value={jobForm.title} 
                              onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                              placeholder="e.g. Senior React Developer"
                              className="bg-black/30 border-white/10" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Role Type</label>
                            <Input 
                              value={jobForm.role} 
                              onChange={(e) => setJobForm({...jobForm, role: e.target.value})}
                              placeholder="e.g. Frontend Engineer"
                              className="bg-black/30 border-white/10" 
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                            <label className="text-sm font-medium">Budget / Rate</label>
                            <Input 
                              value={jobForm.budget} 
                              onChange={(e) => setJobForm({...jobForm, budget: e.target.value})}
                              placeholder="e.g. $60-80/hr or $5k Fixed"
                              className="bg-black/30 border-white/10" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Pay Type</label>
                            <select 
                              className="w-full h-10 px-3 rounded-md border border-white/10 bg-black/30 text-sm"
                              value={jobForm.pay_type}
                              onChange={(e) => setJobForm({...jobForm, pay_type: e.target.value})}
                            >
                              <option value="Hourly">Hourly</option>
                              <option value="Fixed Price">Fixed Price</option>
                              <option value="Salary">Salary</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea 
                            value={jobForm.description} 
                            onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                            placeholder="Describe the role responsibilities and requirements..."
                            className="bg-black/30 border-white/10 min-h-[100px]" 
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Required Skills (Comma separated)</label>
                          <Input 
                            value={jobForm.required_skills} 
                            onChange={(e) => setJobForm({...jobForm, required_skills: e.target.value})}
                            placeholder="React, Node.js, TypeScript"
                            className="bg-black/30 border-white/10" 
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsJobDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateJob} className="bg-blue-600 text-white">Create Listing</Button>
                      </DialogFooter>
                    </DialogContent>
                 </Dialog>
               </div>
               
               <div className="p-8 bg-glass rounded-xl border border-white/10 text-center">
                  <p className="text-gray-400">Job management dashboard coming soon. For now, use the "Post New Job" button to add listings.</p>
               </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;