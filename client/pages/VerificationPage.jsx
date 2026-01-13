import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Shield, Zap } from 'lucide-react';

const VerificationPage = () => {
  const pageTitle = "Verification & Ratings | Devconnect Safety";
  const pageDescription = "Learn how Devconnect's verification, roles, and rating systems build trust and help you make informed decisions.";

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
            <div className="inline-block bg-blue-600/50 rounded-full p-4 mb-6 glow-effect">
              <ShieldCheck className="w-12 h-12 text-blue-300" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Verification, Roles & Ratings</h1>
            <p className="text-xl text-gray-300">Trust is the foundation of any successful collaboration. Our systems are designed to help you make informed decisions.</p>
          </motion.div>

          <div className="space-y-12 prose prose-invert prose-lg max-w-none">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-4xl font-bold">Platform Roles & Badges</h2>
              <p>Look for these badges on user profiles to quickly assess their status and role within the community.</p>
              <div className="space-y-6 not-prose">
                <div className="flex items-start gap-4 p-6 bg-glass rounded-lg">
                  <Shield className="h-8 w-8 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-white">Admin</h3>
                    <p className="text-gray-300">The red shield identifies official platform administrators. Admins have moderation tools and are here to ensure the safety and integrity of the community. Always be cautious of anyone claiming to be an admin without this badge.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-glass rounded-lg">
                  <Award className="h-8 w-8 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-white">Notable Developer</h3>
                    <p className="text-gray-300">The gold badge is an exclusive honor awarded to developers with a proven, extensive history of high-quality work, positive community contributions, and reliability. This is our highest level of recognition.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-glass rounded-lg">
                  <ShieldCheck className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-white">Verified User</h3>
                    <p className="text-gray-300">The blue checkmark indicates that a user has completed our identity verification process. This is a strong signal of authenticity and a commitment to the platform's safety standards.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-glass rounded-lg">
                  <Zap className="h-8 w-8 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-white">Pro Member</h3>
                    <p className="text-gray-300">The green lightning bolt signifies a Pro subscriber. These users have invested in their experience on the platform, unlocking advanced features and demonstrating a higher level of commitment.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="text-4xl font-bold">Ratings & Reviews</h2>
              <p>After a contract is completed, both the client and the developer can rate each other and leave a review. This public feedback is crucial for building a trustworthy reputation.</p>
              <ul className="space-y-4">
                <li><strong className="text-white">Check Past Performance:</strong> Before hiring or accepting a job, always review a user's profile for their average rating and read reviews from past collaborations.</li>
                <li><strong className="text-white">Leave Honest Feedback:</strong> Your reviews help others. Be fair, honest, and constructive in your feedback to contribute to a transparent community.</li>
                <li><strong className="text-white">Build Your Reputation:</strong> Consistently delivering high-quality work and communicating professionally is the best way to earn positive ratings and attract more opportunities.</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerificationPage;