import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

function ReportIssuePage() {
  const pageTitle = "Report an Issue | Devconnect";
  const pageDescription = "Submit a report for a user, job, or any other issue you've encountered on the platform.";
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to submit a report.",
      });
      return;
    }
    if (!subject || !description) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out both the subject and description fields.",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('reports')
      .insert([{ 
        subject, 
        description, 
        reporter_id: user.id,
        status: 'open' 
      }]);

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Report Submission Failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Report Submitted",
        description: "Thank you for your feedback. We will review your report shortly.",
      });
      navigate('/my-reports');
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <div className="max-w-2xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
          <h1 className="text-4xl font-bold">Report an Issue</h1>
          <p className="text-gray-400 mt-2">Help us keep the community safe and productive.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-glass p-8 rounded-lg border-glow space-y-6"
        >
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
            <Input
              id="subject"
              type="text"
              placeholder="e.g., Bug in messaging, Spammy job post, User harassment"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-input"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <Textarea
              id="description"
              placeholder="Please provide as much detail as possible. Include usernames, links to jobs/profiles, and a clear description of what happened."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input min-h-[150px]"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </motion.form>
      </div>
    </>
  );
}

export default ReportIssuePage;