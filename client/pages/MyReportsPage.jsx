import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function MyReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching reports', description: error.message });
    } else {
      setReports(data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReports();
  }, [user, navigate, fetchReports]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'text-yellow-400';
      case 'in_progress':
        return 'text-blue-400';
      case 'resolved':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-2xl">Loading your reports...</div>;
  }

  return (
    <>
      <Helmet>
        <title>My Reports | Devconnect</title>
        <meta name="description" content="View the status of your submitted reports on Devconnect." />
      </Helmet>
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold">My Reports</h1>
            <p className="text-lg text-gray-400 mt-2">Track the status of your submissions.</p>
          </div>
          <Link to="/report-issue">
            <Button>Create New Report</Button>
          </Link>
        </motion.div>

        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report, index) => (
              <motion.div
                key={report.id}
                className="bg-glass p-6 rounded-lg border-glow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{report.subject}</h2>
                    <p className="text-gray-400 mt-2">{report.description}</p>
                  </div>
                  <span className={`font-bold text-sm uppercase ${getStatusColor(report.status)}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Reported on: {new Date(report.created_at).toLocaleDateString()}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-glass rounded-lg border-glow">
              <p className="text-gray-400">You haven't submitted any reports yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyReportsPage;