import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileText, Briefcase, DollarSign, MessageCircle, BookOpen, Laptop, BarChart2, Rocket, Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContractTemplates from '@/components/ContractTemplates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PlatformToolsGuide = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="p-2 w-fit rounded-lg bg-blue-100 dark:bg-blue-900/30 mb-2">
          <Laptop className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle>Time Tracker</CardTitle>
        <CardDescription>Built-in session logging for accurate billing.</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        <p className="mb-4">Forget manual timesheets. Our integrated time tracker lets you log work sessions in real-time, categorizing them by project and client.</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Start/Stop timer with one click</li>
          <li>Associate sessions with specific active jobs</li>
          <li>Generate automated timesheets for invoices</li>
        </ul>
      </CardContent>
    </Card>
    
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="p-2 w-fit rounded-lg bg-green-100 dark:bg-green-900/30 mb-2">
          <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle>Invoicing System</CardTitle>
        <CardDescription>Professional billing made simple.</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        <p className="mb-4">Create compliant, professional invoices directly from your dashboard. Track status from "Sent" to "Paid" automatically.</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Auto-fill from Time Tracker data</li>
          <li>Support for hourly and fixed-price items</li>
          <li>PDF generation and email delivery</li>
        </ul>
      </CardContent>
    </Card>

    <Card className="bg-card border-border md:col-span-2">
      <CardHeader>
        <div className="p-2 w-fit rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-2">
          <BarChart2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <CardTitle>Analytics & Reports</CardTitle>
        <CardDescription>Data-driven insights for your career.</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        <p>Visualize your earnings, profile views, and application success rates. Our reporting tools allow you to export CSV/PDF summaries for tax season or personal record-keeping.</p>
      </CardContent>
    </Card>
  </div>
);

const LearningGrowthGuide = () => (
  <div className="space-y-8">
    <div className="prose dark:prose-invert max-w-none">
      <h3>Level Up Your Career</h3>
      <p>Devconnect isn't just about finding work; it's about getting better at what you do. Our Learning Center and Gamification systems are designed to reward your growth.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="p-2 w-fit rounded-lg bg-yellow-100 dark:bg-yellow-900/30 mb-2">
            <BookOpen className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle>Foundation Courses</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p className="mb-4">Access premium courses covering everything from technical skills to soft skills like negotiation and project management.</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Exclusive video content</li>
            <li>Quizzes and practical assignments</li>
            <li>Earn XP and badges upon completion</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="p-2 w-fit rounded-lg bg-red-100 dark:bg-red-900/30 mb-2">
            <Rocket className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>Gamification & Badges</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p className="mb-4">Turn your professional journey into an achievement. Your profile showcases your level, XP, and earned badges.</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Daily Streaks:</strong> Rewards for consistent activity</li>
            <li><strong>Skill Badges:</strong> Verified proof of expertise</li>
            <li><strong>Leaderboards:</strong> Compete with top developers</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
);

const BusinessSuiteGuide = () => (
  <div className="prose dark:prose-invert max-w-none">
    <h3>For Business & Studios</h3>
    <p>Whether you're an indie studio or a large enterprise, our Business Suite provides the tools you need to scale your team effectively.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose my-8">
      <div className="p-6 bg-card border border-border rounded-lg">
        <Building className="w-8 h-8 text-indigo-500 mb-4" />
        <h4 className="font-bold mb-2">Company Profile</h4>
        <p className="text-sm text-muted-foreground">Showcase your brand, culture, and open positions in a dedicated hub.</p>
      </div>
      <div className="p-6 bg-card border border-border rounded-lg">
        <Briefcase className="w-8 h-8 text-indigo-500 mb-4" />
        <h4 className="font-bold mb-2">Talent Directory</h4>
        <p className="text-sm text-muted-foreground">Search and filter through thousands of verified contractor profiles.</p>
      </div>
      <div className="p-6 bg-card border border-border rounded-lg">
        <FileText className="w-8 h-8 text-indigo-500 mb-4" />
        <h4 className="font-bold mb-2">Contract Management</h4>
        <p className="text-sm text-muted-foreground">Handle MSAs, NDAs, and project contracts all in one secure place.</p>
      </div>
    </div>

    <h4>Streamlined Hiring</h4>
    <p>Post jobs with detailed requirements, manage applicants through a kanban-style board, and seamlessly transition from "Applicant" to "Hired".</p>
  </div>
);

const OldGuidesContent = () => (
    <div className="space-y-8">
        <div className="prose dark:prose-invert max-w-none p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-lg mb-8">
            <strong className="text-yellow-600 dark:text-yellow-400">Disclaimer:</strong> These templates are for informational purposes only and do not constitute legal advice.
        </div>
        <Tabs defaultValue="contracts" className="w-full">
             <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="contracts">Contracts</TabsTrigger>
                <TabsTrigger value="pricing">Pricing Guide</TabsTrigger>
                <TabsTrigger value="comms">Communication</TabsTrigger>
             </TabsList>
             <TabsContent value="contracts" className="mt-6">
                 <ContractTemplates />
             </TabsContent>
             <TabsContent value="pricing" className="mt-6 prose dark:prose-invert max-w-none">
                <h3>Pricing Your Work</h3>
                <p>Your price should reflect your skill, experience, and value.</p>
                <ul>
                    <li><strong>Hourly Rate:</strong> Best for undefined scope.</li>
                    <li><strong>Fixed Price:</strong> Best for clear deliverables.</li>
                    <li><strong>Retainer:</strong> Best for long-term availability.</li>
                </ul>
             </TabsContent>
             <TabsContent value="comms" className="mt-6 prose dark:prose-invert max-w-none">
                <h3>Client Communication</h3>
                <p>Clear communication prevents 90% of project issues.</p>
                <ul>
                    <li>Set expectations early regarding availability.</li>
                    <li>Provide regular written updates.</li>
                    <li>Don't ghost—even bad news is better than no news.</li>
                </ul>
             </TabsContent>
        </Tabs>
    </div>
);

const ResourcesPage = () => {
  const pageTitle = "Platform Resources | Devconnect";
  const pageDescription = "Master the Devconnect platform with our comprehensive guides on tools, learning, and business features.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <div className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-purple-600/10 rounded-full p-4 mb-6">
              <BookOpen className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">Platform Resources</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to succeed on Devconnect. From powerful tools to career growth.
            </p>
          </motion.div>

          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="flex flex-col h-auto md:h-12 md:grid md:grid-cols-4 w-full bg-muted p-1 rounded-lg">
              <TabsTrigger value="tools" className="py-2 data-[state=active]:bg-background">
                <Laptop className="mr-2 h-4 w-4" /> Platform Tools
              </TabsTrigger>
              <TabsTrigger value="growth" className="py-2 data-[state=active]:bg-background">
                <Rocket className="mr-2 h-4 w-4" /> Learning & Growth
              </TabsTrigger>
              <TabsTrigger value="business" className="py-2 data-[state=active]:bg-background">
                <Building className="mr-2 h-4 w-4" /> Business Suite
              </TabsTrigger>
              <TabsTrigger value="guides" className="py-2 data-[state=active]:bg-background">
                <FileText className="mr-2 h-4 w-4" /> Guides & Templates
              </TabsTrigger>
            </TabsList>
            
            <motion.div
              key="tab-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <TabsContent value="tools" className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <PlatformToolsGuide />
              </TabsContent>
              <TabsContent value="growth" className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <LearningGrowthGuide />
              </TabsContent>
              <TabsContent value="business" className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <BusinessSuiteGuide />
              </TabsContent>
              <TabsContent value="guides" className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <OldGuidesContent />
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ResourcesPage;