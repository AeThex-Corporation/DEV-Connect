import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  X,
  AlertCircle
} from "lucide-react";

export default function ReviewsSection({ companyProfile, currentUser, isOwner }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [averageRatings, setAverageRatings] = useState(null);
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    loadReviews();
    checkCanReview();
  }, [companyProfile.id, currentUser]);

  const loadReviews = async () => {
    try {
      const companyReviews = await base44.entities.CompanyReview.filter({
        company_profile_id: companyProfile.id,
        status: "published"
      }, "-created_date");
      
      setReviews(companyReviews);
      calculateAverageRatings(companyReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    if (!currentUser || isOwner) {
      setCanReview(false);
      return;
    }

    try {
      // Check if user has worked with this company
      const completedJobs = await base44.entities.Job.filter({
        employer_id: companyProfile.user_id,
        status: "Completed"
      });

      const userWorkedHere = completedJobs.some(job => {
        // Check applications or contracts
        return true; // Simplified - would need to check applications
      });

      // Check if already reviewed
      const existingReview = await base44.entities.CompanyReview.filter({
        company_profile_id: companyProfile.id,
        reviewer_id: currentUser.id
      });

      setCanReview(userWorkedHere && existingReview.length === 0);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const calculateAverageRatings = (reviewsList) => {
    if (reviewsList.length === 0) {
      setAverageRatings(null);
      return;
    }

    const totals = {
      overall: 0,
      work_environment: 0,
      communication: 0,
      payment_timeliness: 0,
      professionalism: 0,
      project_clarity: 0
    };

    reviewsList.forEach(review => {
      totals.overall += review.rating;
      if (review.categories) {
        Object.keys(review.categories).forEach(key => {
          totals[key] += review.categories[key] || 0;
        });
      }
    });

    const count = reviewsList.length;
    setAverageRatings({
      overall: (totals.overall / count).toFixed(1),
      work_environment: (totals.work_environment / count).toFixed(1),
      communication: (totals.communication / count).toFixed(1),
      payment_timeliness: (totals.payment_timeliness / count).toFixed(1),
      professionalism: (totals.professionalism / count).toFixed(1),
      project_clarity: (totals.project_clarity / count).toFixed(1),
      count
    });
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      const helpfulBy = review.helpful_by || [];
      
      if (helpfulBy.includes(currentUser.id)) {
        // Remove helpful
        await base44.entities.CompanyReview.update(reviewId, {
          helpful_count: (review.helpful_count || 0) - 1,
          helpful_by: helpfulBy.filter(id => id !== currentUser.id)
        });
      } else {
        // Add helpful
        await base44.entities.CompanyReview.update(reviewId, {
          helpful_count: (review.helpful_count || 0) + 1,
          helpful_by: [...helpfulBy, currentUser.id]
        });
      }
      
      await loadReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const handleRespondToReview = async (reviewId) => {
    if (!response.trim()) return;

    try {
      await base44.entities.CompanyReview.update(reviewId, {
        company_response: response,
        company_response_date: new Date().toISOString()
      });

      setRespondingTo(null);
      setResponse("");
      await loadReviews();
    } catch (error) {
      console.error('Error responding to review:', error);
    }
  };

  const RatingStars = ({ rating, size = "w-4 h-4" }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
          }`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average Ratings Summary */}
      {averageRatings && (
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">
                  {averageRatings.overall}
                </div>
                <RatingStars rating={Math.round(parseFloat(averageRatings.overall))} size="w-6 h-6" />
                <p className="text-gray-400 text-sm mt-2">
                  Based on {averageRatings.count} review{averageRatings.count !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { key: 'work_environment', label: 'Work Environment' },
                  { key: 'communication', label: 'Communication' },
                  { key: 'payment_timeliness', label: 'Payment Timeliness' },
                  { key: 'professionalism', label: 'Professionalism' },
                  { key: 'project_clarity', label: 'Project Clarity' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm">{label}</span>
                      <span className="text-white text-sm font-semibold">
                        {averageRatings[key]}
                      </span>
                    </div>
                    <Progress 
                      value={(parseFloat(averageRatings[key]) / 5) * 100} 
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review Button */}
      {canReview && !showReviewForm && (
        <Button
          onClick={() => setShowReviewForm(true)}
          className="w-full btn-primary text-white"
        >
          <Star className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="glass-card border-0">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-gray-400 text-sm">
                Be the first to review this company
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map(review => (
            <Card key={review.id} className="glass-card border-0">
              <CardContent className="p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <RatingStars rating={review.rating} />
                      <span className="text-white font-semibold">{review.rating}.0</span>
                      {review.verified_employment && (
                        <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {review.would_work_again && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                          Would work again
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">
                      {new Date(review.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Review Content */}
                <p className="text-gray-300 mb-4">{review.review_text}</p>

                {/* Category Ratings */}
                {review.categories && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {Object.entries(review.categories).map(([key, value]) => (
                      <div key={key} className="glass-card rounded-lg p-3 text-center">
                        <p className="text-gray-400 text-xs capitalize mb-1">
                          {key.replace('_', ' ')}
                        </p>
                        <p className="text-white font-semibold text-sm">{value}/5</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pros and Cons */}
                {(review.pros?.length > 0 || review.cons?.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {review.pros?.length > 0 && (
                      <div>
                        <p className="text-green-400 text-sm font-semibold mb-2">Pros</p>
                        <ul className="space-y-1">
                          {review.pros.map((pro, i) => (
                            <li key={i} className="text-gray-300 text-sm flex items-start">
                              <CheckCircle className="w-3 h-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons?.length > 0 && (
                      <div>
                        <p className="text-orange-400 text-sm font-semibold mb-2">Cons</p>
                        <ul className="space-y-1">
                          {review.cons.map((con, i) => (
                            <li key={i} className="text-gray-300 text-sm flex items-start">
                              <AlertCircle className="w-3 h-3 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Company Response */}
                {review.company_response && (
                  <div className="mt-4 p-4 glass-card rounded-lg bg-indigo-500/5 border-l-2 border-indigo-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                        Company Response
                      </Badge>
                      <span className="text-gray-400 text-xs">
                        {new Date(review.company_response_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{review.company_response}</p>
                  </div>
                )}

                {/* Response Form */}
                {isOwner && !review.company_response && respondingTo === review.id && (
                  <div className="mt-4 p-4 glass-card rounded-lg">
                    <Label className="text-gray-300 mb-2 block">Your Response</Label>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Thank you for your feedback..."
                      className="bg-white/5 border-white/20 text-white mb-3"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRespondToReview(review.id)}
                        size="sm"
                        className="btn-primary text-white"
                      >
                        Submit Response
                      </Button>
                      <Button
                        onClick={() => {
                          setRespondingTo(null);
                          setResponse("");
                        }}
                        size="sm"
                        variant="outline"
                        className="glass-card border-0 text-white hover:bg-white/5"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                  {currentUser && (
                    <button
                      onClick={() => handleMarkHelpful(review.id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        review.helpful_by?.includes(currentUser.id)
                          ? 'text-indigo-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({review.helpful_count || 0})</span>
                    </button>
                  )}
                  
                  {isOwner && !review.company_response && respondingTo !== review.id && (
                    <button
                      onClick={() => setRespondingTo(review.id)}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Respond</span>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}