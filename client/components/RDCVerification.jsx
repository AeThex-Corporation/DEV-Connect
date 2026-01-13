import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, Loader2, AlertCircle, Trophy, Sparkles, X, ExternalLink, Calendar } from 'lucide-react';

export default function RDCVerification({ user, onVerified }) {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    years: user?.rdc_years || [],
    notes: user?.rdc_submission_notes || '',
    proofUrls: user?.rdc_proof_urls || []
  });
  const [newYear, setNewYear] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadedUrls = [];
      
      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          setError('Please upload only image files');
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          setError('Images must be less than 10MB');
          continue;
        }

        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }

      setFormData({
        ...formData,
        proofUrls: [...formData.proofUrls, ...uploadedUrls]
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload proof images. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const addYear = () => {
    const year = parseInt(newYear);
    if (!year || year < 2017 || year > new Date().getFullYear()) {
      setError('Please enter a valid RDC year (2017 or later)');
      return;
    }

    if (formData.years.includes(year)) {
      setError('Year already added');
      return;
    }

    setFormData({
      ...formData,
      years: [...formData.years, year].sort((a, b) => b - a)
    });
    setNewYear('');
    setError('');
  };

  const removeYear = (year) => {
    setFormData({
      ...formData,
      years: formData.years.filter(y => y !== year)
    });
  };

  const removeProof = (url) => {
    setFormData({
      ...formData,
      proofUrls: formData.proofUrls.filter(u => u !== url)
    });
  };

  const handleSubmit = async () => {
    if (formData.years.length === 0) {
      setError('Please add at least one RDC year');
      return;
    }

    if (formData.proofUrls.length === 0) {
      setError('Please upload at least one proof of attendance (photo, badge, ticket, etc.)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await base44.auth.updateMe({
        rdc_years: formData.years,
        rdc_submission_notes: formData.notes,
        rdc_proof_urls: formData.proofUrls,
        rdc_verification_status: 'pending'
      });

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '📝 RDC Verification Submitted',
        message: 'Your RDC attendance verification has been submitted for review. Admins will review it shortly.',
        link: '/Profile?tab=accounts'
      });

      if (onVerified) {
        onVerified();
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Verified state
  if (user?.rdc_verified && user?.rdc_verification_status === 'approved') {
    return (
      <div className="space-y-4">
        <div className="glass-card rounded-lg p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-semibold text-lg">RDC Attendee</p>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-purple-300 text-sm">Roblox Developers Conference</p>
            </div>
          </div>

          {/* Years Attended */}
          <div className="mb-3">
            <p className="text-purple-300 text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Years Attended
            </p>
            <div className="flex flex-wrap gap-2">
              {user.rdc_years?.map(year => (
                <Badge key={year} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-sm font-bold">
                  <Calendar className="w-3 h-3 mr-1" />
                  {year}
                </Badge>
              ))}
            </div>
          </div>

          {/* Submitted Proof */}
          {user.rdc_proof_urls && user.rdc_proof_urls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {user.rdc_proof_urls.slice(0, 3).map((url, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-black/20">
                  <img src={url} alt={`RDC Proof ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="glass-card rounded-lg p-3 bg-green-500/5 border border-green-500/20">
            <p className="text-green-400 text-xs flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified by Devconnect admins
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="glass-card rounded-lg p-4 bg-blue-500/5">
          <p className="text-blue-400 text-sm font-medium mb-2">Elite Developer Benefits</p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• 🏆 Exclusive RDC Attendee badge on profile</li>
            <li>• 🌟 Featured in elite developer searches</li>
            <li>• 💼 Priority visibility to employers</li>
            <li>• 🎖️ Recognition as top-tier Roblox developer</li>
          </ul>
        </div>
      </div>
    );
  }

  // Pending verification state
  if (user?.rdc_verification_status === 'pending') {
    return (
      <div className="space-y-4">
        <div className="glass-card rounded-lg p-4 bg-yellow-500/5 border border-yellow-500/20">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
            <div>
              <p className="text-white font-semibold">Verification Pending</p>
              <p className="text-gray-400 text-sm">Your RDC attendance is under review</p>
            </div>
          </div>

          {/* Submitted Years */}
          <div className="mb-3">
            <p className="text-gray-400 text-sm mb-2">Submitted Years:</p>
            <div className="flex flex-wrap gap-2">
              {user.rdc_years?.map(year => (
                <Badge key={year} className="bg-yellow-500/20 text-yellow-300 border-0">
                  {year}
                </Badge>
              ))}
            </div>
          </div>

          {/* Submitted Proof */}
          {user.rdc_proof_urls && user.rdc_proof_urls.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Submitted Proof:</p>
              <div className="grid grid-cols-3 gap-2">
                {user.rdc_proof_urls.map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-black/20">
                    <img src={url} alt={`Proof ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-500 text-xs mt-3">
            Admins typically review submissions within 24-48 hours
          </p>
        </div>
      </div>
    );
  }

  // Rejected state
  if (user?.rdc_verification_status === 'rejected') {
    return (
      <div className="space-y-4">
        <div className="glass-card rounded-lg p-4 bg-red-500/5 border border-red-500/20">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-white font-semibold">Verification Rejected</p>
              <p className="text-gray-400 text-sm">Your submission could not be verified</p>
            </div>
          </div>

          {user.rdc_admin_notes && (
            <div className="glass-card rounded-lg p-3 bg-red-500/5 mb-3">
              <p className="text-red-300 text-sm font-medium mb-1">Admin Notes:</p>
              <p className="text-gray-300 text-sm">{user.rdc_admin_notes}</p>
            </div>
          )}

          <Button
            onClick={() => {
              base44.auth.updateMe({ rdc_verification_status: 'not_submitted' }).then(onVerified);
            }}
            size="sm"
            className="w-full btn-primary text-white"
          >
            Submit New Verification
          </Button>
        </div>
      </div>
    );
  }

  // Submission form
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-3">
          Submit proof of your RDC (Roblox Developers Conference) attendance for verification. This exclusive badge is for elite developers who attended this invite-only event.
        </p>

        <div className="space-y-4">
          {/* Years Attended */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Years Attended
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                placeholder="2024"
                className="bg-white/5 border-white/20 text-white"
                disabled={submitting}
                min="2017"
                max={new Date().getFullYear()}
              />
              <Button
                onClick={addYear}
                size="sm"
                className="btn-primary text-white"
                disabled={submitting}
              >
                Add
              </Button>
            </div>

            {formData.years.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.years.map(year => (
                  <Badge key={year} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {year}
                    <button onClick={() => removeYear(year)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Proof Upload */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Proof of Attendance (Required)
            </label>
            <p className="text-gray-400 text-xs mb-2">
              Upload photos of your conference badge, attendance certificate, event photos, or any proof that shows you attended RDC
            </p>

            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading || submitting}
              />
              <div className="glass-card rounded-lg p-4 border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-colors text-center">
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-white">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div className="text-white">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm">Click to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">Up to 5 images, max 10MB each</p>
                  </div>
                )}
              </div>
            </label>

            {formData.proofUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {formData.proofUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-black/20 group">
                    <img src={url} alt={`Proof ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeProof(url)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Additional Notes (Optional)
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information about your RDC attendance..."
              className="bg-white/5 border-white/20 text-white"
              disabled={submitting}
              rows={3}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={submitting || uploading || formData.years.length === 0 || formData.proofUrls.length === 0}
            className="w-full btn-primary text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Submit for Verification
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-lg p-4 bg-blue-500/5">
        <p className="text-blue-400 text-sm font-medium mb-2">What counts as proof?</p>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>• 📸 Photo of your RDC conference badge</li>
          <li>• 🎫 Ticket or invitation confirmation</li>
          <li>• 🏆 Certificate of attendance</li>
          <li>• 📷 Photos at the conference venue</li>
          <li>• 🎤 Photos from sessions or with Roblox staff</li>
        </ul>
      </div>
    </div>
  );
}