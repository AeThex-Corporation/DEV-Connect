import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileText, Briefcase, DollarSign, MessageCircle, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContractTemplates from '@/components/ContractTemplates';

const PortfolioGuide = () => (
  <div className="prose prose-invert prose-lg max-w-none">
    <h3 className="text-3xl font-bold">Building a Killer Portfolio</h3>
    <p>Your portfolio is your #1 sales tool. It's not just a gallery; it's a story about your skills, your process, and the value you provide.</p>
    <ul>
      <li><strong>Show, Don't Just Tell:</strong> Instead of listing skills, show them in action. Include high-quality images, videos, and interactive demos.</li>
      <li><strong>Context is King:</strong> For each project, explain the goal, your role, the challenges you faced, and how you solved them. What was the outcome?</li>
      <li><strong>Quality Over Quantity:</strong> It's better to have 3-5 amazing, well-documented projects than 20 mediocre ones. Choose your best work.</li>
      <li><strong>Keep it Updated:</strong> Add new projects as you complete them. A portfolio that shows recent activity is a sign of an active, in-demand developer.</li>
      <li><strong>Make it Accessible:</strong> Ensure your portfolio is easy to navigate and looks great on all devices. Your Devconnect profile is a great place to start!</li>
    </ul>
  </div>
);

const PricingGuide = () => (
  <div className="prose prose-invert prose-lg max-w-none">
    <h3 className="text-3xl font-bold">Pricing Your Work</h3>
    <p>Pricing is one of the hardest parts of freelancing. Your price should reflect your skill, experience, and the value you bring to the client.</p>
    <h4>Common Pricing Models:</h4>
    <ul>
      <li><strong>Hourly Rate:</strong> Good for ongoing projects or work with unclear scope. Track your time meticulously. Calculate your rate based on your desired salary, business expenses, and billable hours.</li>
      <li><strong>Per-Project Fee:</strong> Best for projects with a clearly defined scope and deliverables. Estimate the total hours you'll spend and multiply by your hourly rate, then add a buffer (15-20%) for unexpected issues.</li>
      <li><strong>Value-Based Pricing:</strong> Advanced. Instead of your time, you charge based on the value your work brings to the client's business. (e.g., "This feature will increase your sales by an estimated $50,000, so my fee is $10,000").</li>
    </ul>
    <p className="p-4 bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg"><strong>Pro Tip:</strong> Never underprice yourself. It devalues your work and attracts difficult clients. Research what others with your skill level are charging and price yourself competitively.</p>
  </div>
);

const CommunicationGuide = () => (
  <div className="prose prose-invert prose-lg max-w-none">
    <h3 className="text-3xl font-bold">Client Communication Best Practices</h3>
    <p>Great communication can save a project, while poor communication can sink it. Professionalism is key.</p>
    <ul>
      <li><strong>Set Expectations Early:</strong> From the start, clarify the scope, timeline, deliverables, and how you'll communicate (e.g., weekly check-ins via Discord).</li>
      <li><strong>Be Proactive, Not Reactive:</strong> Don't wait for the client to ask for an update. Send regular progress reports. If you hit a roadblock, inform them immediately and propose solutions.</li>
      <li><strong>Keep a Written Record:</strong> Follow up important calls or voice chats with a written summary via email or platform message. This creates a paper trail and prevents misunderstandings.</li>
      <li><strong>Listen More Than You Speak:</strong> Truly understand your client's needs and goals before you start building. Ask clarifying questions.</li>
      <li><strong>Be Professional, Always:</strong> Even when disagreements arise, maintain a calm and professional tone. Focus on solving the problem, not winning an argument.</li>
    </ul>
  </div>
);

const ResourcesPage = () => {
  const pageTitle = "Developer Resources | Devconnect";
  const pageDescription = "Essential guides and templates for developers on contracts, portfolios, pricing, and client communication.";

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
            <div className="inline-block bg-purple-600/50 rounded-full p-4 mb-6 glow-effect-purple">
              <BookOpen className="w-12 h-12 text-purple-300" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Developer Resources</h1>
            <p className="text-xl text-gray-300">Your toolkit for a successful freelance career. Master the business side of development.</p>
          </motion.div>

          <Tabs defaultValue="contracts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-12">
              <TabsTrigger value="contracts" className="py-3"><FileText className="mr-2 h-5 w-5" />Contracts</TabsTrigger>
              <TabsTrigger value="portfolio" className="py-3"><Briefcase className="mr-2 h-5 w-5" />Portfolio</TabsTrigger>
              <TabsTrigger value="pricing" className="py-3"><DollarSign className="mr-2 h-5 w-5" />Pricing</TabsTrigger>
              <TabsTrigger value="communication" className="py-3"><MessageCircle className="mr-2 h-5 w-5" />Communication</TabsTrigger>
            </TabsList>
            
            <motion.div
              key="tab-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TabsContent value="contracts" className="bg-glass border-glow rounded-lg p-8 mt-6">
                <p className="prose prose-invert prose-lg max-w-none p-4 bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r-lg mb-8"><strong className="text-yellow-300">Disclaimer:</strong> These templates are for informational purposes only and do not constitute legal advice. For complex or high-value projects, we strongly recommend consulting with a legal professional.</p>
                <ContractTemplates />
              </TabsContent>
              <TabsContent value="portfolio" className="bg-glass border-glow rounded-lg p-8 mt-6">
                <PortfolioGuide />
              </TabsContent>
              <TabsContent value="pricing" className="bg-glass border-glow rounded-lg p-8 mt-6">
                <PricingGuide />
              </TabsContent>
              <TabsContent value="communication" className="bg-glass border-glow rounded-lg p-8 mt-6">
                <CommunicationGuide />
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ResourcesPage;