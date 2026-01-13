import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MessageSquare as MessageSquareWarning, AlertTriangle, UserX, ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModerationPage = () => {
  const pageTitle = "Moderation & Reporting | Devconnect Safety";
  const pageDescription = "Learn how to report issues, what happens after you file a report, and how we work to keep the community safe.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-red-600/50 rounded-full p-4 mb-6 glow-effect-red">
              <MessageSquareWarning className="w-12 h-12 text-red-300" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Moderation & Reporting</h1>
            <p className="text-xl text-gray-300">Help us maintain a safe and professional environment by reporting violations of our community standards.</p>
          </motion.div>

          <div className="space-y-12 prose prose-invert prose-lg max-w-none">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-4xl font-bold">How to Report an Issue</h2>
              <p>If you encounter a user or a post that violates our policies, you can easily report it. Look for the "Report" button on user profiles, job posts, and messages. When you file a report, you'll be asked to select a reason and provide details.</p>
              <p><strong className="text-white">The more detail you provide, the faster and more effectively our team can investigate.</strong></p>
              <Link to="/report-issue">
                <motion.button className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                  File a General Report
                </motion.button>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="text-4xl font-bold">What to Report</h2>
              <p>We rely on you to help us identify and address behavior that harms the community. Please report any of the following:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mt-6">
                <div className="flex items-start gap-4 p-4 bg-glass rounded-lg">
                  <AlertTriangle className="h-7 w-7 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Scams & Fraud</h3>
                    <p className="text-gray-300">Requests for free work, suspicious payment schemes, or phishing attempts.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-glass rounded-lg">
                  <UserX className="h-7 w-7 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Harassment & Abuse</h3>
                    <p className="text-gray-300">Hate speech, personal attacks, threats, or any form of abusive language.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-glass rounded-lg">
                  <ShieldOff className="h-7 w-7 text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Policy Violations</h3>
                    <p className="text-gray-300">Spam, plagiarism, or any other violation of our <Link to="/terms-of-service" className="text-blue-400 hover:underline">Terms of Service</Link>.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <h2 className="text-4xl font-bold">What Happens Next</h2>
              <p>Our dedicated moderation team reviews every report. Based on the evidence, we will take appropriate action, which can range from an official warning to a permanent ban from the platform. While we cannot always share the specific outcome of an investigation for privacy reasons, rest assured that we take every report seriously.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModerationPage;