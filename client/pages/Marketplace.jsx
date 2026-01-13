import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Star,
  Download,
  ShoppingCart,
  TrendingUp,
  Filter,
  Plus,
  ExternalLink,
  Code,
  Palette,
  Music,
  Box,
  Zap
} from "lucide-react";

export default function Marketplace() {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [user, setUser] = useState(null);

  const categories = ["Model", "Script", "UI Kit", "Sound Effect", "Music", "Plugin", "Tool", "System", "Module", "Other"];

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, searchTerm, selectedCategory, sortBy, minPrice, maxPrice]);

  const loadAssets = async () => {
    try {
      const [currentUser, allAssets] = await Promise.all([
        base44.auth.me(),
        base44.entities.Asset.filter({ status: "active" })
      ]);
      setUser(currentUser);
      setAssets(allAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssets = () => {
    let filtered = assets;

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    filtered = filtered.filter(asset =>
      asset.price >= minPrice && asset.price <= maxPrice
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "trending":
          return (b.downloads || 0) - (a.downloads || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
          return new Date(b.created_date) - new Date(a.created_date);
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    setFilteredAssets(filtered);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Model': Box,
      'Script': Code,
      'UI Kit': Palette,
      'Sound Effect': Music,
      'Music': Music,
      'Plugin': Zap,
      'Tool': Zap,
      'System': Code,
      'Module': Code
    };
    return icons[category] || Box;
  };

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
          <h1 className="text-2xl font-bold gradient-text mb-2">Asset Marketplace</h1>
          <p className="text-gray-400 text-sm">{filteredAssets.length} assets available</p>
        </div>
        <Button
          onClick={() => window.location.href = createPageUrl('MyAssets')}
          className="btn-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Sell Asset
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="glass-card rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <div className="flex items-center glass-card rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-0 text-white placeholder-gray-500 text-sm p-0 h-auto"
              />
            </div>
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="glass-card border-0 text-white text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="glass-card border-0 text-white text-sm">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="glass-card border-0 text-white hover:bg-white/5">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => {
          const Icon = getCategoryIcon(asset.category);
          
          return (
            <Card
              key={asset.id}
              className="glass-card border-0 card-hover overflow-hidden cursor-pointer"
              onClick={() => window.location.href = `${createPageUrl('AssetDetails')}?id=${asset.id}`}
            >
              {/* Asset Preview Image */}
              {asset.preview_images?.[0] ? (
                <div className="aspect-video overflow-hidden bg-black/20">
                  <img
                    src={asset.preview_images[0]}
                    alt={asset.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <Icon className="w-16 h-16 text-white/20" />
                </div>
              )}

              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold mb-1 truncate">{asset.title}</h3>
                    <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                      {asset.category}
                    </Badge>
                  </div>
                  {asset.verified && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs ml-2">
                      Verified
                    </Badge>
                  )}
                </div>

                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{asset.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                      {asset.rating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Download className="w-3 h-3 mr-1" />
                      {asset.downloads || 0}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {asset.currency === 'Robux' ? 'R$' : '$'}{asset.price}
                    </p>
                    <p className="text-gray-500 text-xs">One-time purchase</p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `${createPageUrl('AssetDetails')}?id=${asset.id}`;
                    }}
                    size="sm"
                    className="btn-primary text-white"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Buy
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <div className="glass-card rounded-lg p-8 max-w-md mx-auto">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Assets Found</h3>
            <p className="text-gray-400 text-sm mb-4">
              {assets.length === 0 
                ? 'Be the first to sell on the marketplace!'
                : 'Try adjusting your filters'}
            </p>
            {assets.length === 0 && (
              <Button
                onClick={() => window.location.href = createPageUrl('MyAssets')}
                className="btn-primary text-white"
              >
                List Your First Asset
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}