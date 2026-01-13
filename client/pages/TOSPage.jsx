import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';

    const TOSPage = () => {
      const pageTitle = "Terms of Service | Devconnect";
      const pageDescription = "Read the Terms of Service for using the Devconnect platform.";

      return (
        <>
          <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
          </Helmet>
          <div className="py-20 px-6">
            <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl font-bold mb-8">Terms of Service</h1>
                <p className="text-gray-400">Last updated: October 4, 2025</p>
                
                <h2 className="text-3xl font-bold mt-12 mb-4">1. Introduction</h2>
                <p>Welcome to Devconnect! These Terms of Service ("Terms") govern your use of our website and services. By accessing or using Devconnect, you agree to be bound by these Terms.</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">2. User Accounts</h2>
                <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">3. User Conduct</h2>
                <p>You agree not to use the service for any unlawful purpose or to engage in any conduct that is harmful, fraudulent, or otherwise objectionable. This includes, but is not limited to, spamming, harassment, and intellectual property infringement.</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">4. Content</h2>
                <p>You retain ownership of the content you post on Devconnect. However, by posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content in connection with the service.</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">5. Disclaimers</h2>
                <p>The service is provided "as is" without any warranties. We do not guarantee that the service will be error-free or uninterrupted. Devconnect is a platform to connect users; we are not a party to any agreements made between users.</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">6. Limitation of Liability</h2>
                <p>In no event shall Devconnect or AeThex.dev be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">7. Changes to Terms</h2>
                <p>We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page.</p>
              </motion.div>
            </div>
          </div>
        </>
      );
    };

    export default TOSPage;