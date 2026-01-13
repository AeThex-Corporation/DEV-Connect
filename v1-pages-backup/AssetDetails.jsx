import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Download,
  ShoppingCart,
  Share2,
  Flag,
  ExternalLink,
  Package,
  CheckCircle,
  User,
  Calendar,
  FileText,
  Code,
  Shield
} from "lucide-react";

export default function AssetDetails() {
  const [asset, setAsset] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userPurchase, setUserPurchase] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const urlParams = new URLSearchParams(window.location.search);
  const assetId = urlParams.get('id');

  useEffect(() => {
    if (assetId) {
      loadAssetDetails();
    }
  }, [assetId]);

  const loadAssetDetails = async () => {
    try {
      const [currentUser, assets, assetReviews] = await Promise.all([
        base44.auth.me(),
        base44.entities.Asset.filter({ id: assetId }),
        base44.entities.AssetReview.filter({ asset_id: assetId }, "-created_date")
      ]);

      const assetData = assets[0];
      setAsset(assetData);
      setReviews(assetReviews);
      setUser(currentUser);

      // Load seller info
      const sellers = await base44.entities.User.filter({ id: assetData.seller_id });
      setSeller(sellers[0]);

      // Check if user already purchased
      const purchases = await base44.entities.AssetPurchase.filter({
        asset_id: assetId,
        buyer_id: currentUser.id
      });
      if (purchases.length > 0) {
        setUserPurchase(purchases[0]);
      }
    } catch (error) {
      console.error('Error loading asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      alert('Please log in to purchase');
      return;
    }

    setPurchasing(true);
    try {
      // In a real app, this would integrate with payment processor
      const purchase = await base44.entities.AssetPurchase.create({
        asset_id: assetId,
        buyer_id: user.id,
        seller_id: asset.seller_id,
        price_paid: asset.price,
        currency: asset.currency,
        license_type: asset.license_type,
        transaction_id: `txn_${Date.now()}`,
        download_url: asset.file_url
      });

      // Update asset downloads
      await base44.entities.Asset.update(assetId, {
        downloads: (asset.downloads || 0) + 1,
        revenue: (asset.revenue || 0) + asset.price
      });

      // Notify seller
      await base44.entities.Notification.create({
        user_id: asset.seller_id,
        type: 'message',
        title: '💰 Asset Sold!',
        message: `${user.full_name} purchased "${asset.title}" for ${asset.currency === 'Robux' ? 'R$' : '$'}${asset.price}`,
        link: createPageUrl('MyAssets')
      });

      setUserPurchase(purchase);
      alert('Purchase successful! You can now download the asset.');
      loadAssetDetails();
    } catch (error) {
      console.error('Error purchasing asset:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = async () => {
    if (!userPurchase) return;

    try {
      // Update download count
      await base44.entities.AssetPurchase.update(userPurchase.id, {
        download_count: (userPurchase.download_count || 0) + 1,
        last_download_date: new Date().toISOString()
      });

      // Open download URL
      window.open(userPurchase.download_url, '_blank');
    } catch (error) {
      console.error('Error downloading asset:', error);
    }
  };

  const submitReview = async () => {
    if (!userPurchase) {
      alert('You must purchase this asset to review it');
      return;
    }

    try {
      await base44.entities.AssetReview.create({
        asset_id: assetId,
        reviewer_id: user.id,
        purchase_id: userPurchase.id,
        rating: reviewRating,
        review_text: reviewText,
        verified_purchase: true
      });

      // Update asset rating
      const allReviews = await base44.entities.AssetReview.filter({ asset_id: assetId });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await base44.entities.Asset.update(assetId, {
        rating: avgRating,
        review_count: allReviews.length
      });

      setReviewText("");
      setReviewRating(5);
      loadAssetDetails();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Asset Not Found</h2>
          <Button onClick={() => window.location.href = createPageUrl('Marketplace')} className="btn-primary text-white mt-4">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Asset Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview */}
          <Card className="glass-card border-0 overflow-hidden">
            {asset.preview_images?.[0] ? (
              <img src={asset.preview_images[0]} alt={asset.title} className="w-full aspect-video object-cover" />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <Package className="w-24 h-24 text-white/20" />
              </div>
            )}
          </Card>

          {/* Info */}
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{asset.title}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className="bg-purple-500/20 text-purple-300 border-0">
                      {asset.category}
                    </Badge>
                    {asset.verified && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-0">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-semibold">{asset.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-400 text-sm">({asset.review_count} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Download className="w-3 h-3" />
                      {asset.downloads || 0} downloads
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-6">{asset.description}</p>

              {/* Asset Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="glass-card rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Version</p>
                  <p className="text-white font-semibold">{asset.version}</p>
                </div>
                <div className="glass-card rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Format</p>
                  <p className="text-white font-semibold">{asset.file_format || 'N/A'}</p>
                </div>
                <div className="glass-card rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Size</p>
                  <p className="text-white font-semibold">{asset.file_size_mb || '?'} MB</p>
                </div>
                <div className="glass-card rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">License</p>
                  <p className="text-white font-semibold text-xs">{asset.license_type}</p>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {asset.includes_source && (
                  <Badge className="bg-green-500/20 text-green-400 border-0">
                    <Code className="w-3 h-3 mr-1" />
                    Source Included
                  </Badge>
                )}
                {asset.support_included && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-0">
                    Support Included
                  </Badge>
                )}
              </div>

              {/* Tags */}
              {asset.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map(tag => (
                    <Badge key={tag} className="bg-white/5 text-gray-300 border-0 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="glass-card border-0">
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="changelog">Changelog</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="space-y-4">
              {userPurchase && !userPurchase.reviewed && (
                <Card className="glass-card border-0">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold mb-4">Write a Review</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setReviewRating(star)}>
                              <Star className={`w-6 h-6 ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience with this asset..."
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                      />
                      <Button onClick={submitReview} className="btn-primary text-white">
                        Submit Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {reviews.length === 0 ? (
                <Card className="glass-card border-0">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400">No reviews yet</p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map(review => (
                  <Card key={review.id} className="glass-card border-0">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                            ))}
                          </div>
                          {review.verified_purchase && (
                            <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <span className="text-gray-400 text-sm">
                          {new Date(review.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{review.review_text}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="changelog">
              {asset.changelog?.length > 0 ? (
                <div className="space-y-3">
                  {asset.changelog.map((change, i) => (
                    <Card key={i} className="glass-card border-0">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-purple-500/20 text-purple-300 border-0">
                            v{change.version}
                          </Badge>
                          <span className="text-gray-400 text-sm">
                            {new Date(change.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{change.changes}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-card border-0">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400">No changelog available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Purchase */}
        <div className="space-y-6">
          <Card className="glass-card border-0 sticky top-20">
            <CardContent className="p-6">
              <div className="mb-6">
                <p className="text-4xl font-bold text-white mb-2">
                  {asset.currency === 'Robux' ? 'R$' : '$'}{asset.price}
                </p>
                <p className="text-gray-400 text-sm">One-time purchase • {asset.license_type}</p>
              </div>

              {userPurchase ? (
                <div className="space-y-3">
                  <Button onClick={handleDownload} className="w-full btn-primary text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download Asset
                  </Button>
                  <div className="glass-card rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Downloads</p>
                    <p className="text-white font-semibold">{userPurchase.download_count || 0} times</p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full btn-primary text-white mb-3"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {purchasing ? 'Processing...' : 'Purchase Now'}
                </Button>
              )}

              {asset.demo_place_url && (
                <Button variant="outline" className="w-full glass-card border-0 text-white hover:bg-white/5 mb-3" asChild>
                  <a href={asset.demo_place_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Demo
                  </a>
                </Button>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 glass-card border-0 text-white hover:bg-white/5">
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="flex-1 glass-card border-0 text-white hover:bg-white/5">
                  <Flag className="w-3 h-3 mr-1" />
                  Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          {seller && (
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Seller Information</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{seller.full_name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-400 text-sm">{seller.rating?.toFixed(1)} rating</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = `${createPageUrl('PublicProfile')}?id=${seller.id}`}
                  variant="outline"
                  className="w-full glass-card border-0 text-white hover:bg-white/5"
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}