
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Package,
  DollarSign,
  Download,
  Star,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Sparkles, // New import
  X // New import
} from "lucide-react";
import AIAssetOptimizer from '../components/AIAssetOptimizer'; // New import

export default function MyAssets() {
  const [user, setUser] = useState(null);
  const [myAssets, setMyAssets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Script",
    price: 100,
    currency: "Robux",
    license_type: "single_use",
    includes_source: true,
    support_included: false,
    tags: []
  });
  const [newTag, setNewTag] = useState("");
  const [showOptimizer, setShowOptimizer] = useState(false); // New state
  const [optimizingAsset, setOptimizingAsset] = useState(null); // New state

  const categories = ["Model", "Script", "UI Kit", "Sound Effect", "Music", "Plugin", "Tool", "System", "Module", "Other"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [assets, assetPurchases] = await Promise.all([
        base44.entities.Asset.filter({ seller_id: currentUser.id }, "-created_date"),
        base44.entities.AssetPurchase.filter({ buyer_id: currentUser.id }, "-created_date")
      ]);

      setMyAssets(assets);
      setPurchases(assetPurchases);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingAsset) {
        await base44.entities.Asset.update(editingAsset.id, formData);
      } else {
        await base44.entities.Asset.create({
          ...formData,
          seller_id: user.id,
          status: "draft"
        });
      }

      setCreateModalOpen(false);
      setEditingAsset(null);
      setFormData({
        title: "",
        description: "",
        category: "Script",
        price: 100,
        currency: "Robux",
        license_type: "single_use",
        includes_source: true,
        support_included: false,
        tags: []
      });
      loadData();
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Failed to save asset');
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      title: asset.title,
      description: asset.description,
      category: asset.category,
      price: asset.price,
      currency: asset.currency,
      license_type: asset.license_type,
      includes_source: asset.includes_source,
      support_included: asset.support_included,
      tags: asset.tags || []
    });
    setCreateModalOpen(true);
  };

  const handleDelete = async (assetId) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      await base44.entities.Asset.delete(assetId);
      loadData();
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const totalRevenue = myAssets.reduce((sum, asset) => sum + (asset.revenue || 0), 0);
  const totalDownloads = myAssets.reduce((sum, asset) => sum + (asset.downloads || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-2">My Assets</h1>
          <p className="text-gray-400 text-sm">Manage your marketplace listings and purchases</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="btn-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          List New Asset
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <Card className="glass-card border-0">
          <CardContent className="p-6 text-center">
            <Package className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{myAssets.length}</p>
            <p className="text-gray-400 text-sm">Assets Listed</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">R${totalRevenue}</p>
            <p className="text-gray-400 text-sm">Total Revenue</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6 text-center">
            <Download className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalDownloads}</p>
            <p className="text-gray-400 text-sm">Total Downloads</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{myAssets.filter(a => a.status === 'active').length}</p>
            <p className="text-gray-400 text-sm">Active Listings</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-listings" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="my-listings">
            <Package className="w-4 h-4 mr-2" />
            My Listings ({myAssets.length})
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <Download className="w-4 h-4 mr-2" />
            Purchases ({purchases.length})
          </TabsTrigger>
        </TabsList>

        {/* My Listings */}
        <TabsContent value="my-listings" className="space-y-4">
          {myAssets.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Assets Listed</h3>
                <p className="text-gray-400 mb-6">Start selling your creations on the marketplace</p>
                <Button onClick={() => setCreateModalOpen(true)} className="btn-primary text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  List Your First Asset
                </Button>
              </CardContent>
            </Card>
          ) : (
            myAssets.map(asset => (
              <Card key={asset.id} className="glass-card border-0 card-hover">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    {asset.preview_images?.[0] ? (
                      <img src={asset.preview_images[0]} alt={asset.title} className="w-24 h-24 object-cover rounded-lg" />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-white/20" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold text-lg mb-1">{asset.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                              {asset.category}
                            </Badge>
                            <Badge className={`${
                              asset.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              asset.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            } border-0 text-xs`}>
                              {asset.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {asset.currency === 'Robux' ? 'R$' : '$'}{asset.price}
                        </p>
                      </div>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{asset.description}</p>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="glass-card rounded p-2 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <p className="text-white text-sm font-semibold">{asset.rating?.toFixed(1) || '0.0'}</p>
                          </div>
                          <p className="text-gray-400 text-xs">{asset.review_count} reviews</p>
                        </div>
                        <div className="glass-card rounded p-2 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Download className="w-3 h-3 text-blue-400" />
                            <p className="text-white text-sm font-semibold">{asset.downloads || 0}</p>
                          </div>
                          <p className="text-gray-400 text-xs">downloads</p>
                        </div>
                        <div className="glass-card rounded p-2 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <DollarSign className="w-3 h-3 text-green-400" />
                            <p className="text-white text-sm font-semibold">R${asset.revenue || 0}</p>
                          </div>
                          <p className="text-gray-400 text-xs">revenue</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.location.href = `${createPageUrl('AssetDetails')}?id=${asset.id}`}
                          size="sm"
                          variant="outline"
                          className="glass-card border-0 text-white hover:bg-white/5"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleEdit(asset)}
                          size="sm"
                          variant="outline"
                          className="glass-card border-0 text-white hover:bg-white/5"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        {/* NEW: AI Optimizer Button */}
                        <Button
                          onClick={() => {
                            setOptimizingAsset(asset);
                            setShowOptimizer(true);
                          }}
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Optimize
                        </Button>
                        <Button
                          onClick={() => handleDelete(asset.id)}
                          size="sm"
                          variant="outline"
                          className="glass-card border-0 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Purchases */}
        <TabsContent value="purchases" className="space-y-4">
          {purchases.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Purchases Yet</h3>
                <p className="text-gray-400 mb-6">Browse the marketplace to find amazing assets</p>
                <Button onClick={() => window.location.href = createPageUrl('Marketplace')} className="btn-primary text-white">
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            purchases.map(purchase => (
              <Card key={purchase.id} className="glass-card border-0 card-hover">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold mb-1">Asset #{purchase.asset_id}</p>
                      <p className="text-gray-400 text-sm">
                        Purchased {new Date(purchase.created_date).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                          {purchase.license_type}
                        </Badge>
                        <p className="text-gray-400 text-xs">
                          Downloaded {purchase.download_count || 0} times
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white mb-2">
                        {purchase.currency === 'Robux' ? 'R$' : '$'}{purchase.price_paid}
                      </p>
                      <Button
                        onClick={() => window.open(purchase.download_url, '_blank')}
                        size="sm"
                        className="btn-primary text-white"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Asset Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="glass-card border-0 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingAsset ? 'Edit Asset' : 'List New Asset'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Asset title"
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detailed description..."
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 min-h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Price</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Currency</label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Robux">Robux</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">License Type</label>
                <Select value={formData.license_type} onValueChange={(value) => setFormData({...formData, license_type: value})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_use">Single Use</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button onClick={addTag} size="sm" className="btn-primary text-white">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-0">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-2">×</button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditingAsset(null);
                }}
                variant="outline"
                className="flex-1 glass-card border-0 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAsset}
                className="flex-1 btn-primary text-white"
              >
                {editingAsset ? 'Update Asset' : 'List Asset'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* NEW: AI Asset Optimizer Modal */}
      {showOptimizer && optimizingAsset && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                AI Asset Optimizer - {optimizingAsset.title}
              </h2>
              <Button
                onClick={() => {
                  setShowOptimizer(false);
                  setOptimizingAsset(null);
                }}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <AIAssetOptimizer 
              asset={optimizingAsset}
              onUpdate={() => {
                setShowOptimizer(false);
                setOptimizingAsset(null);
                loadData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
