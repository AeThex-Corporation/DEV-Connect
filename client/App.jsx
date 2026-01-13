import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from '@/pages/RootLayout';
import HomePage from '@/pages/HomePage';
import DevelopersPage from '@/pages/DevelopersPage';
import JobsPage from '@/pages/JobsPage';
import PostJobPage from '@/pages/PostJobPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import OnboardingPage from '@/pages/OnboardingPage';
import ProfilePage from '@/pages/ProfilePage';
import DashboardPage from '@/pages/DashboardPage';
import MessagesPage from '@/pages/MessagesPage';
import TeamUpsPage from '@/pages/TeamUpsPage';
import PostTeamUpPage from '@/pages/PostTeamUpPage';
import ChangelogPage from '@/pages/ChangelogPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import AdminPage from '@/pages/AdminPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import JobModeration from '@/pages/admin/JobModeration';
import DisputeResolution from '@/pages/admin/DisputeResolution';
import Verifications from '@/pages/admin/Verifications';
import AdminRoute from '@/components/AdminRoute';
import ReportIssuePage from '@/pages/ReportIssuePage';
import MyReportsPage from '@/pages/MyReportsPage';
import AboutUsPage from '@/pages/AboutUsPage';
import TOSPage from '@/pages/TOSPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import SafetyCenterPage from '@/pages/SafetyCenterPage';
import VerificationPage from '@/pages/VerificationPage';
import ModerationPage from '@/pages/ModerationPage';
import ResourcesPage from '@/pages/ResourcesPage';
import ApplicationMessagesPage from '@/pages/ApplicationMessagesPage';
import ConversationPage from '@/pages/ConversationPage';
import StudioDetailsPage from '@/pages/StudioDetailsPage';
import CreateStudioPage from '@/pages/CreateStudioPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import TeamUpDetailsPage from '@/pages/TeamUpDetailsPage';
import JobDetailsPage from '@/pages/JobDetailsPage';
import LimitsPage from '@/pages/LimitsPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ReferralProgramPage from '@/pages/ReferralProgramPage';
import StudiosPage from '@/pages/StudiosPage';
import ContactPage from '@/pages/ContactPage';
import VerifyGatePage from '@/pages/VerifyGatePage';
import FoundationDashboard from '@/pages/FoundationDashboard';
import CourseDetail from '@/pages/CourseDetail';
import ContractorProfile from '@/pages/ContractorProfile';
import JobBoard from '@/pages/JobBoard';
import MessagingDashboard from '@/pages/MessagingDashboard';
import AnalyticsDashboard from '@/pages/dashboard/AnalyticsDashboard';
import ReportsGenerator from '@/pages/dashboard/ReportsGenerator';
import BusinessDashboard from '@/pages/business/BusinessDashboard';
import ContractorDirectory from '@/pages/business/ContractorDirectory';
import PortfolioBuilder from '@/pages/dashboard/PortfolioBuilder';
import AvailabilityCalendar from '@/pages/dashboard/AvailabilityCalendar';
import Leaderboards from '@/pages/Leaderboards';
import SubscriptionPlans from '@/pages/business/SubscriptionPlans';
import BillingDashboard from '@/pages/business/BillingDashboard';
import PaymentSuccess from '@/pages/business/PaymentSuccess';
import PaymentFailed from '@/pages/business/PaymentFailed';
import GamificationDashboard from '@/pages/dashboard/GamificationDashboard';
import ReferralProgram from '@/pages/dashboard/ReferralProgram';
import TimeTracker from '@/pages/contractor/TimeTracker';
import HourlyRatesManager from '@/pages/contractor/HourlyRatesManager';
import InvoiceGenerator from '@/pages/contractor/InvoiceGenerator';
import InvoicePreview from '@/pages/contractor/InvoicePreview';
import SettingsPage from '@/pages/SettingsPage';

// V1 Merged Pages
import About from '@/pages/About';
import Achievements from '@/pages/Achievements';
import AIGuide from '@/pages/AIGuide';
import Analytics from '@/pages/Analytics';
import BrowseProfiles from '@/pages/BrowseProfiles';
import Certifications from '@/pages/Certifications';
import Collaboration from '@/pages/Collaboration';
import CommunityHub from '@/pages/CommunityHub';
import CompanyProfile from '@/pages/CompanyProfile';
import EditCompanyProfile from '@/pages/EditCompanyProfile';
import EmployerAnalytics from '@/pages/EmployerAnalytics';
import EmployerDashboard from '@/pages/EmployerDashboard';
import EmployerOnboarding from '@/pages/EmployerOnboarding';
import ExternalJobsManager from '@/pages/ExternalJobsManager';
import Forum from '@/pages/Forum';
import Groups from '@/pages/Groups';
import GroupDetails from '@/pages/GroupDetails';
import JobAlerts from '@/pages/JobAlerts';
import LearningHub from '@/pages/LearningHub';
import Marketplace from '@/pages/Marketplace';
import Mentorship from '@/pages/Mentorship';
import MyApplications from '@/pages/MyApplications';
import MyAssets from '@/pages/MyAssets';
import Premium from '@/pages/Premium';
import PublicProfile from '@/pages/PublicProfile';
import SavedJobs from '@/pages/SavedJobs';
import TakeAssessment from '@/pages/TakeAssessment';
import Teams from '@/pages/Teams';
import UploadPortfolio from '@/pages/UploadPortfolio';
import Waitlist from '@/pages/Waitlist';
import Blog from '@/pages/Blog';
import Press from '@/pages/Press';
import Feedback from '@/pages/Feedback';
import AssetDetails from '@/pages/AssetDetails';
import DeveloperFeed from '@/pages/DeveloperFeed';
import NotificationSettings from '@/pages/NotificationSettings';
import RoleManagement from '@/pages/RoleManagement';
import AddWorkExperience from '@/pages/AddWorkExperience';

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/developers" element={<DevelopersPage />} />
        
        {/* Public/Contractor Job Board */}
        <Route path="/dashboard/jobs" element={<JobBoard />} />
        
        {/* Messaging Dashboard */}
        <Route path="/dashboard/messages" element={<MessagingDashboard />} />
        
        {/* Phase 1 Routes */}
        <Route path="/dashboard/portfolio" element={<PortfolioBuilder />} />
        <Route path="/dashboard/availability" element={<AvailabilityCalendar />} />
        <Route path="/leaderboards" element={<Leaderboards />} />
        
        {/* Phase 3 Routes */}
        <Route path="/dashboard/gamification" element={<GamificationDashboard />} />
        <Route path="/dashboard/referrals" element={<ReferralProgram />} />
        
        {/* Phase 5 Routes - Analytics */}
        <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
        <Route path="/dashboard/reports" element={<ReportsGenerator />} />
        
        {/* Settings Page */}
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        
        {/* Phase 4 Routes - Time & Invoicing */}
        <Route path="/contractor/time-tracker" element={<TimeTracker />} />
        <Route path="/contractor/rates" element={<HourlyRatesManager />} />
        <Route path="/contractor/invoices" element={<InvoiceGenerator />} />
        <Route path="/contractor/invoices/:invoiceId" element={<InvoicePreview />} />
        
        {/* Contractor Profile */}
        <Route path="/contractors/:contractorId" element={<ContractorProfile />} />
        
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/post-a-job" element={<PostJobPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        <Route path="/profile/:username" element={<ProfilePage />} />
        
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/foundation" element={<FoundationDashboard />} />
        <Route path="/foundation/course/:courseId" element={<CourseDetail />} />
        
        {/* Business & Billing Routes */}
        <Route path="/business/dashboard" element={<BusinessDashboard />} />
        <Route path="/business/contractors" element={<ContractorDirectory />} />
        <Route path="/business/jobs" element={<JobsPage />} /> 
        <Route path="/business/upgrade" element={<SubscriptionPlans />} />
        <Route path="/business/billing" element={<BillingDashboard />} />
        <Route path="/business/billing/success" element={<PaymentSuccess />} />
        <Route path="/business/billing/failed" element={<PaymentFailed />} />
        
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/application/:applicationId" element={<ApplicationMessagesPage />} />
        <Route path="/messages/user/:username" element={<ConversationPage />} />
        <Route path="/team-ups" element={<TeamUpsPage />} />
        <Route path="/team-ups/:id" element={<TeamUpDetailsPage />} />
        <Route path="/post-team-up" element={<PostTeamUpPage />} />
        
        <Route path="/collectives" element={<Navigate to="/studios" replace />} />
        <Route path="/collectives/:slug" element={<Navigate to="/studios" replace />} />
        <Route path="/create-collective" element={<Navigate to="/create-studio" replace />} />
        
        <Route path="/studios" element={<StudiosPage />} />
        <Route path="/studios/:slug" element={<StudioDetailsPage />} />
        <Route path="/create-studio" element={<CreateStudioPage />} />

        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/limits" element={<LimitsPage />} />
        
        {/* Admin Routes - Updated for Phase 5 */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminPage />}>
             <Route index element={<Navigate to="/admin/dashboard" replace />} />
             <Route path="dashboard" element={<AdminDashboard />} />
             <Route path="users" element={<UserManagement />} />
             <Route path="jobs" element={<JobModeration />} />
             <Route path="disputes" element={<DisputeResolution />} />
             <Route path="verifications" element={<Verifications />} />
          </Route>
        </Route>

        <Route path="/report-issue" element={<ReportIssuePage />} />
        <Route path="/my-reports" element={<MyReportsPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms-of-service" element={<TOSPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/safety" element={<SafetyCenterPage />} />
        <Route path="/safety/verification" element={<VerificationPage />} />
        <Route path="/safety/moderation" element={<ModerationPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/referrals" element={<ReferralProgramPage />} />
        <Route path="/verify" element={<VerifyGatePage />} />
        
        {/* V1 Merged Routes */}
        <Route path="/browse-profiles" element={<BrowseProfiles />} />
        <Route path="/profiles/:username" element={<PublicProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/press" element={<Press />} />
        <Route path="/feedback" element={<Feedback />} />
        
        {/* Community & Social */}
        <Route path="/community" element={<CommunityHub />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetails />} />
        <Route path="/feed" element={<DeveloperFeed />} />
        
        {/* Learning & Skills */}
        <Route path="/learning" element={<LearningHub />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/assessments/:id" element={<TakeAssessment />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/mentorship" element={<Mentorship />} />
        
        {/* Jobs & Applications */}
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />
        <Route path="/job-alerts" element={<JobAlerts />} />
        <Route path="/external-jobs" element={<ExternalJobsManager />} />
        
        {/* Employer Features */}
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/onboarding" element={<EmployerOnboarding />} />
        <Route path="/employer/analytics" element={<EmployerAnalytics />} />
        <Route path="/company/:id" element={<CompanyProfile />} />
        <Route path="/company/:id/edit" element={<EditCompanyProfile />} />
        
        {/* Premium & Upgrades */}
        <Route path="/premium" element={<Premium />} />
        <Route path="/waitlist" element={<Waitlist />} />
        
        {/* Portfolio & Assets */}
        <Route path="/my-assets" element={<MyAssets />} />
        <Route path="/assets/:id" element={<AssetDetails />} />
        <Route path="/upload-portfolio" element={<UploadPortfolio />} />
        <Route path="/marketplace" element={<Marketplace />} />
        
        {/* Teams & Collaboration */}
        <Route path="/teams" element={<Teams />} />
        <Route path="/collaboration" element={<Collaboration />} />
        
        {/* AI Features */}
        <Route path="/ai-guide" element={<AIGuide />} />
        
        {/* Analytics & Reports */}
        <Route path="/analytics" element={<Analytics />} />
        
        {/* Settings & Profile Management */}
        <Route path="/notifications" element={<NotificationSettings />} />
        <Route path="/roles" element={<RoleManagement />} />
        <Route path="/work-experience/add" element={<AddWorkExperience />} />
      </Route>
    </Routes>
  );
}

export default App;