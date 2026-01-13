import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldCheck, MessageSquare as MessageSquareWarning, FileText, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const SafetyCenterPage = () => {
  const pageTitle = "Safety Center | Devconnect";
  const pageDescription = "Your hub for safety on Devconnect. Learn about our safety features, best practices, and how to collaborate with confidence.";

  const safetyTopics = [
    {
      icon: ShieldCheck,
      title: 'Verification & Ratings',
      description: 'Understand our verification system and how ratings build trust.',
      link: '/safety/verification'
    },
    {
      icon: MessageSquareWarning,
      title: 'Moderation & Reporting',
      description: 'Learn how to report issues and how we moderate the platform.',
      link: '/safety/moderation'
    },
    {
      icon: FileText,
      title: 'Contract Templates',
      description: 'Use our templates to create clear agreements and protect yourself.',
      link: '/safety/contracts'
    }
  ];

  const safetyTips = [
    "Never share your password or personal financial information.",
    "Always use a contract, even for small projects.",
    "Vet potential partners by checking their profile, ratings, and portfolio.",
    "Keep all communication and payments on-platform when possible.",
    "If something feels off, trust your gut and report it.",
    "Be wary of offers that seem too good to be true."
  ];

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Safety Center
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              At <a href="https://aethex.dev" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">AeThex</a>, your safety is our priority. We've built tools and policies to help you collaborate with confidence.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }}
          >
            {safetyTopics.map((topic, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={topic.link} className="block p-8 bg-glass rounded-lg border-glow h-full hover:bg-gray-800/50 transition-all duration-300 group">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-600/50 rounded-full mb-6 glow-effect">
                    <topic.icon className="w-8 h-8 text-blue-300" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{topic.title}</h2>
                  <p className="text-gray-400 mb-4">{topic.description}</p>
                  <div className="flex items-center text-blue-400 font-semibold">
                    Learn More <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-center mb-10">Top Safety Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safetyTips.map((tip, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-900/50 rounded-lg">
                  <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0 mt-1" />
                  <p className="text-gray-300 text-lg">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SafetyCenterPage;