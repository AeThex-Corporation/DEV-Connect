import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';

    const PrivacyPolicyPage = () => {
      const pageTitle = "Privacy Policy | Devconnect";
      const pageDescription = "Learn how Devconnect collects, uses, and protects your personal data.";

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
                <h1 className="text-5xl font-bold mb-8">Privacy Policy</h1>
                <p className="text-gray-400">Last updated: October 4, 2025</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, post content, or communicate with us. This may include your name, email address, and any other information you choose to provide.</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">2. How We Use Your Information</h2>
                <p>We use the information we collect to provide, maintain, and improve our services. This includes connecting users, personalizing your experience, and communicating with you about products, services, and events.</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">3. Information Sharing</h2>
                <p>We do not share your personal information with third parties except as described in this Privacy Policy. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">4. Data Security</h2>
                <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">5. Your Choices</h2>
                <p>You may update, correct, or delete information about you at any time by logging into your account. If you wish to delete your account, please contact us, but note that we may retain certain information as required by law or for legitimate business purposes.</p>

                <h2 className="text-3xl font-bold mt-12 mb-4">6. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@aethex.dev" className="text-blue-400 hover:underline">privacy@aethex.dev</a>.</p>
              </motion.div>
            </div>
          </div>
        </>
      );
    };

    export default PrivacyPolicyPage;