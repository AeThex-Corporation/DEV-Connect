import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { MissionSection } from '@/components/MissionSection';
    import { WhatIsAethexSection } from '@/components/WhatIsAethexSection';

    const AboutUsPage = () => {
      const pageTitle = "About Us | Devconnect";
      const pageDescription = "Learn about Devconnect's mission to empower the Roblox creator community, powered by the innovation of AeThex.dev.";

      return (
        <>
          <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
          </Helmet>
          <div className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-20"
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                  About Devconnect
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  We are building the central nervous system for the Roblox creator economy, powered by the team at <a href="https://aethex.dev" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">AeThex.dev</a>.
                </p>
              </motion.div>

              <MissionSection />
              <div className="my-20">
                <WhatIsAethexSection />
              </div>
            </div>
          </div>
        </>
      );
    };

    export default AboutUsPage;