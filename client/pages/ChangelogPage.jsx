import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { GitCommit, PlusCircle, Bug, Zap, User, KeyRound, MessageSquare, Link2, Award, BadgeCheck as BadgeCheckIcon, Shield, Image, MailCheck, Database } from 'lucide-react';

const changelogData = [
  {
    version: 'v1.6.2',
    date: '2025-10-26',
    changes: [
      { type: 'fix', description: 'Resolved an issue where developer profile avatars were not displaying correctly on the Developers page, ensuring unique and accurate images for each profile.', icon: Bug, color: 'text-red-400' },
    ],
  },
  {
    version: 'v1.6.1',
    date: '2025-10-07',
    changes: [
      { type: 'fix', description: 'Resolved critical issue preventing "Set as Verified" and "Set as Notable" actions from updating user profiles in the Admin Panel by implementing a robust database policy.', icon: Database, color: 'text-red-400' },
    ],
  },
  {
    version: 'v1.6.0',
    date: '2025-10-05',
    changes: [
      { type: 'improvement', description: 'Improved user onboarding flow by redirecting new sign-ups to a dedicated email verification page and ensuring correct redirection to the dashboard after onboarding completion.', icon: MailCheck, color: 'text-blue-400' },
    ],
  },
  {
    version: 'v1.5.0',
    date: '2025-10-04',
    changes: [
      { type: 'new', description: 'Implemented a full-fledged Direct Messaging system, allowing users to chat directly with each other outside of job applications.', icon: MessageSquare, color: 'text-green-400' },
      { type: 'fix', description: 'Synchronized public profiles to display correct avatar and banner images, and enabled live updates after editing profile details.', icon: Image, color: 'text-blue-400' },
    ],
  },
  {
    version: 'v1.4.0',
    date: '2025-10-04',
    changes: [
      { type: 'new', description: 'Introduced a comprehensive Safety Center with dedicated pages for Verification & Ratings, Moderation & Reporting, and Contract Templates.', icon: Shield, color: 'text-blue-400' },
      { type: 'improvement', description: 'Enhanced footer navigation to include direct links to all new safety-related pages.', icon: Link2, color: 'text-yellow-400' },
    ],
  },
  {
    version: 'v1.3.0',
    date: '2025-10-04',
    changes: [
      { type: 'new', description: 'Introduced the exclusive "Founding Member" badge for the first 100 users to join!', icon: Award, color: 'text-green-400' },
      { type: 'improvement', description: 'Brought back distinct verification badges! The classic blue "Verified" and gold "Notable" checkmarks are now displayed alongside subscription tier badges on profiles.', icon: BadgeCheckIcon, color: 'text-yellow-400' },
      { type: 'improvement', description: 'Enforced subscription tier rules for job posting limits and advanced developer search filters.', icon: Zap, color: 'text-yellow-400' },
      { type: 'fix', description: 'Fixed database relationship issues causing errors in the admin panel and report submission pages.', icon: Bug, color: 'text-red-400' },
    ],
  },
  {
    version: 'v1.2.0',
    date: '2025-10-04',
    changes: [
      { type: 'new', description: 'Massive Profile Overhaul! Users can now upload custom avatars and banners, edit their bio, and manage portfolio links.', icon: User, color: 'text-green-400' },
      { type: 'new', description: 'Gamification System is LIVE. XP, levels, and achievement badges are now integrated into profiles.', icon: Zap, color: 'text-green-400' },
      { type: 'new', description: 'Direct Messaging enabled for accepted job applications.', icon: MessageSquare, color: 'text-green-400' },
      { type: 'improvement', description: 'Profile URLs now use clean, shareable usernames instead of UUIDs.', icon: Link2, color: 'text-yellow-400' },
      { type: 'improvement', description: 'Complete authentication system rework for true, individual user sessions.', icon: KeyRound, color: 'text-yellow-400' },
      { type: 'fix', description: 'Crushed numerous ambiguous query bugs across the platform.', icon: Bug, color: 'text-red-400' },
    ],
  },
  {
    version: 'v1.1.0',
    date: '2025-10-04',
    changes: [
      { type: 'new', description: 'Launched the official Changelog page to keep the community updated.', icon: PlusCircle, color: 'text-green-400' },
      { type: 'improvement', description: 'Major homepage overhaul to be more robust and informative.', icon: Zap, color: 'text-yellow-400' },
      { type: 'improvement', description: 'Full mobile-responsiveness pass and SEO improvements.', icon: Zap, color: 'text-yellow-400' },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2025-10-03',
    changes: [
      { type: 'new', description: 'Platform Launch! User profiles, job boards, and team-ups are live.', icon: PlusCircle, color: 'text-green-400' },
      { type: 'fix', description: 'Fixed critical bugs in the user onboarding and profile creation flow.', icon: Bug, color: 'text-red-400' },
      { type: 'improvement', description: 'Wired up all pages to create a cohesive user experience.', icon: Zap, color: 'text-yellow-400' },
    ],
  },
];

function ChangelogPage() {
  const pageTitle = "Changelog | Devconnect";
  const pageDescription = "See the latest updates, improvements, and bug fixes for the Devconnect platform.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <div className="px-6 py-12 md:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-wider">
            Platform Changelog
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Tracking our progress as we build the future of Roblox collaboration.
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="space-y-12">
          {changelogData.map((release, index) => (
            <motion.div
              key={release.version}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-glass rounded-full p-3 border-glow">
                  <GitCommit className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{release.version}</h2>
                  <p className="text-gray-400">{release.date}</p>
                </div>
              </div>
              <div className="mt-6 pl-8 border-l-2 border-gray-800 ml-5">
                <ul className="space-y-4">
                  {release.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="flex items-start space-x-3">
                      <change.icon className={`w-5 h-5 mt-1 flex-shrink-0 ${change.color}`} />
                      <span className="text-gray-300">{change.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ChangelogPage;