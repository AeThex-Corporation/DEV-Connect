import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, X } from "lucide-react";

export default function RatingModal({ isOpen, onClose, job, reviewee, reviewType, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [categories, setCategories] = useState({
    communication: 0,
    quality: 0,
    timeliness: 0,
    professionalism: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const user = await base44.auth.me();
      
      const review = await base44.entities.Review.create({
        job_id: job.id,
        reviewer_id: user.id,
        reviewee_id: reviewee.id,
        rating: rating,
        review_text: reviewText,
        review_type: reviewType,
        categories: categories
      });

      // Create notification for reviewee
      await base44.entities.Notification.create({
        user_id: reviewee.id,
        type: 'rating_received',
        title: 'New Rating Received',
        message: `${user.full_name} rated you ${rating} stars for "${job.title}"`,
        link: `/Profile`
      });

      // Update reviewee's average rating
      const allReviews = await base44.entities.Review.filter({ reviewee_id: reviewee.id });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await base44.entities.User.update(reviewee.id, { rating: avgRating });

      if (onSubmit) onSubmit(review);
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryChange = (category, value) => {
    setCategories(prev => ({ ...prev, [category]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="glass-card border-0 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg">
              Rate {reviewType === 'employer_to_developer' ? 'Developer' : 'Employer'}
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            How was your experience working with {reviewee.full_name} on "{job.title}"?
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Overall Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <label className="text-white text-sm font-medium block">Detailed Ratings</label>
            
            {Object.entries({
              communication: 'Communication',
              quality: 'Quality of Work',
              timeliness: 'Timeliness',
              professionalism: 'Professionalism'
            }).map(([key, label]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs">{label}</span>
                  <span className="text-white text-xs">{categories[key]}/5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleCategoryChange(key, star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= categories[key]
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Review Text */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Written Review (Optional)</label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience working together..."
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 min-h-24"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 glass-card border-0 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="flex-1 btn-primary text-white"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}