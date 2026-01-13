import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/db';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, Edit, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const PortfolioBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contractorId, setContractorId] = useState(null);
  const [items, setItems] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    github_link: '',
    case_study_url: ''
  });

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const contractor = await api.getCurrentContractor(user.id);
        if (contractor) {
          setContractorId(contractor.id);
          const portfolioData = await api.getPortfolio(contractor.id);
          setItems(portfolioData || []);
        }
      } catch (err) {
        console.error("Error loading portfolio", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [user]);

  const handleSave = async () => {
    try {
      if (editingItem) {
        const updated = await api.updatePortfolioItem(editingItem.id, formData);
        setItems(items.map(i => i.id === editingItem.id ? updated : i));
        toast({ title: "Item updated" });
      } else {
        const newId = await api.addPortfolioItem({ ...formData, contractor_id: contractorId });
        setItems([newId, ...items]);
        toast({ title: "Item created" });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deletePortfolioItem(id);
      setItems(items.filter(i => i.id !== id));
      toast({ title: "Item deleted" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url || '',
      github_link: item.github_link || '',
      case_study_url: item.case_study_url || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '', image_url: '', github_link: '', case_study_url: '' });
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!contractorId) return <div className="min-h-screen pt-24 text-center text-xl">You must be a registered contractor to use this feature.</div>;

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <Helmet><title>Portfolio Builder | Devconnect</title></Helmet>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Portfolio Builder</h1>
            <p className="text-gray-400">Showcase your best work to potential clients.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-500"><Plus className="w-4 h-4 mr-2" /> Add Project</Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Project' : 'Add Project'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input 
                  placeholder="Project Title" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="bg-black/30 border-white/10"
                />
                <Textarea 
                  placeholder="Description" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="bg-black/30 border-white/10 min-h-[100px]"
                />
                <Input 
                  placeholder="Image URL (e.g. Imgur, Unsplash)" 
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  className="bg-black/30 border-white/10"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="GitHub Link" 
                    value={formData.github_link}
                    onChange={e => setFormData({...formData, github_link: e.target.value})}
                    className="bg-black/30 border-white/10"
                  />
                  <Input 
                    placeholder="Case Study URL" 
                    value={formData.case_study_url}
                    onChange={e => setFormData({...formData, case_study_url: e.target.value})}
                    className="bg-black/30 border-white/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave}>Save Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-glass rounded-xl overflow-hidden border border-white/10 group hover:border-blue-500/50 transition-all">
              <div className="h-48 bg-gray-800 relative overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No Image</div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEdit(item)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">{item.description}</p>
                <div className="flex gap-3">
                  {item.github_link && (
                    <a href={item.github_link} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-blue-400 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Code
                    </a>
                  )}
                  {item.case_study_url && (
                    <a href={item.case_study_url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-blue-400 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Case Study
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500 border border-dashed border-gray-700 rounded-xl">
              No projects yet. Click "Add Project" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioBuilder;