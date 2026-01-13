import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, UserCheck, Gavel, BookOpen, Lock, Clock, DollarSign, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const SafetyCard = ({ icon, title, description, link }) => {
  const IconComponent = icon;
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
      className="bg-card text-card-foreground rounded-xl p-8 border border-border h-full flex flex-col shadow-sm"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <IconComponent className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-muted-foreground flex-grow leading-relaxed">{description}</p>
      <Link to={link} className="mt-6 text-primary font-semibold hover:underline inline-flex items-center gap-2 group">
        Learn More <span className="group-hover:translate-x-1 transition-transform">→</span>
      </Link>
    </motion.div>
  );
};

const SafetyCenterPage = () => {
  const pageTitle = "Safety Center | Devconnect";
  const pageDescription = "Your hub for understanding our safety policies, verification processes, and community guidelines to ensure a secure and trustworthy platform.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <div className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-primary/10 rounded-full p-4 mb-6">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">Safety Center</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide advanced tools to ensure your work is secure, verified, and fairly compensated.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SafetyCard
              icon={Clock}
              title="Verified Work History"
              description="Our integrated Time Tracker creates immutable logs of your work sessions. This provides indisputable proof of work for contractors and transparency for clients."
              link="/contractor/time-tracker"
            />
            <SafetyCard
              icon={DollarSign}
              title="Secure Payments"
              description="Use our Invoicing system to generate professional, tracked payment requests. Clear documentation reduces disputes and ensures you get paid on time."
              link="/contractor/invoices"
            />
            <SafetyCard
              icon={UserCheck}
              title="Identity & Skills Verification"
              description="From basic identity checks to our Gamification system where you earn badges for real skills—know exactly who you're working with."
              link="/safety/verification"
            />
            <SafetyCard
              icon={BarChart}
              title="Business Transparency"
              description="Our Analytics and Reporting tools give businesses and freelancers a clear view of performance, financial health, and project status."
              link="/dashboard/analytics"
            />
            <SafetyCard
              icon={Gavel}
              title="Moderation & Reporting"
              description="Community standards are enforced strictly. Learn how to report suspicious activity or disputes through our official channels."
              link="/safety/moderation"
            />
            <SafetyCard
              icon={BookOpen}
              title="Developer Resources"
              description="Access guides on contracts, pricing, and best practices to protect your business interests and career growth."
              link="/resources"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SafetyCenterPage;