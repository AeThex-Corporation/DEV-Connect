import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Jobs from "./Jobs";

import Profile from "./Profile";

import PostJob from "./PostJob";

import Messages from "./Messages";

import BrowseProfiles from "./BrowseProfiles";

import PublicProfile from "./PublicProfile";

import Analytics from "./Analytics";

import JobAlerts from "./JobAlerts";

import EmployerDashboard from "./EmployerDashboard";

import Resources from "./Resources";

import Forum from "./Forum";

import Moderation from "./Moderation";

import Onboarding from "./Onboarding";

import Welcome from "./Welcome";

import EmployerAnalytics from "./EmployerAnalytics";

import Marketplace from "./Marketplace";

import Certifications from "./Certifications";

import Mentorship from "./Mentorship";

import AssetDetails from "./AssetDetails";

import MyAssets from "./MyAssets";

import Collaboration from "./Collaboration";

import TakeAssessment from "./TakeAssessment";

import Premium from "./Premium";

import AnalyticsDashboard from "./AnalyticsDashboard";

import CompanyProfile from "./CompanyProfile";

import Leaderboard from "./Leaderboard";

import NotificationSettings from "./NotificationSettings";

import Teams from "./Teams";

import Home from "./home";

import Waitlist from "./Waitlist";

import About from "./About";

import Blog from "./Blog";

import Press from "./Press";

import Feedback from "./Feedback";

import EmployerOnboarding from "./EmployerOnboarding";

import AddWorkExperience from "./AddWorkExperience";

import Groups from "./Groups";

import CommunityHub from "./CommunityHub";

import GroupDetails from "./GroupDetails";

import UploadPortfolio from "./UploadPortfolio";

import LearningHub from "./LearningHub";

import SavedJobs from "./SavedJobs";

import Achievements from "./Achievements";

import AIGuide from "./AIGuide";

import ExternalJobsManager from "./ExternalJobsManager";

import RoleManagement from "./RoleManagement";

import DeveloperFeed from "./DeveloperFeed";

import EditCompanyProfile from "./EditCompanyProfile";

import MyApplications from "./MyApplications";

import Login from "./Login";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Jobs: Jobs,
    
    Profile: Profile,
    
    PostJob: PostJob,
    
    Messages: Messages,
    
    BrowseProfiles: BrowseProfiles,
    
    PublicProfile: PublicProfile,
    
    Analytics: Analytics,
    
    JobAlerts: JobAlerts,
    
    EmployerDashboard: EmployerDashboard,
    
    Resources: Resources,
    
    Forum: Forum,
    
    Moderation: Moderation,
    
    Onboarding: Onboarding,
    
    Welcome: Welcome,
    
    EmployerAnalytics: EmployerAnalytics,
    
    Marketplace: Marketplace,
    
    Certifications: Certifications,
    
    Mentorship: Mentorship,
    
    AssetDetails: AssetDetails,
    
    MyAssets: MyAssets,
    
    Collaboration: Collaboration,
    
    TakeAssessment: TakeAssessment,
    
    Premium: Premium,
    
    AnalyticsDashboard: AnalyticsDashboard,
    
    CompanyProfile: CompanyProfile,
    
    Leaderboard: Leaderboard,
    
    NotificationSettings: NotificationSettings,
    
    Teams: Teams,
    
    home: Home,
    
    Waitlist: Waitlist,
    
    About: About,
    
    Blog: Blog,
    
    Press: Press,
    
    Feedback: Feedback,
    
    EmployerOnboarding: EmployerOnboarding,
    
    AddWorkExperience: AddWorkExperience,
    
    Groups: Groups,
    
    CommunityHub: CommunityHub,
    
    GroupDetails: GroupDetails,
    
    UploadPortfolio: UploadPortfolio,
    
    LearningHub: LearningHub,
    
    SavedJobs: SavedJobs,
    
    Achievements: Achievements,
    
    AIGuide: AIGuide,
    
    ExternalJobsManager: ExternalJobsManager,
    
    RoleManagement: RoleManagement,
    
    DeveloperFeed: DeveloperFeed,
    
    EditCompanyProfile: EditCompanyProfile,
    
    MyApplications: MyApplications,
    
    Login: Login,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Jobs" element={<Jobs />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/PostJob" element={<PostJob />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/BrowseProfiles" element={<BrowseProfiles />} />
                
                <Route path="/PublicProfile" element={<PublicProfile />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/JobAlerts" element={<JobAlerts />} />
                
                <Route path="/EmployerDashboard" element={<EmployerDashboard />} />
                
                <Route path="/Resources" element={<Resources />} />
                
                <Route path="/Forum" element={<Forum />} />
                
                <Route path="/Moderation" element={<Moderation />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/EmployerAnalytics" element={<EmployerAnalytics />} />
                
                <Route path="/Marketplace" element={<Marketplace />} />
                
                <Route path="/Certifications" element={<Certifications />} />
                
                <Route path="/Mentorship" element={<Mentorship />} />
                
                <Route path="/AssetDetails" element={<AssetDetails />} />
                
                <Route path="/MyAssets" element={<MyAssets />} />
                
                <Route path="/Collaboration" element={<Collaboration />} />
                
                <Route path="/TakeAssessment" element={<TakeAssessment />} />
                
                <Route path="/Premium" element={<Premium />} />
                
                <Route path="/AnalyticsDashboard" element={<AnalyticsDashboard />} />
                
                <Route path="/CompanyProfile" element={<CompanyProfile />} />
                
                <Route path="/Leaderboard" element={<Leaderboard />} />
                
                <Route path="/NotificationSettings" element={<NotificationSettings />} />
                
                <Route path="/Teams" element={<Teams />} />
                
                <Route path="/home" element={<Home />} />
                
                <Route path="/Waitlist" element={<Waitlist />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Blog" element={<Blog />} />
                
                <Route path="/Press" element={<Press />} />
                
                <Route path="/Feedback" element={<Feedback />} />
                
                <Route path="/EmployerOnboarding" element={<EmployerOnboarding />} />
                
                <Route path="/AddWorkExperience" element={<AddWorkExperience />} />
                
                <Route path="/Groups" element={<Groups />} />
                
                <Route path="/CommunityHub" element={<CommunityHub />} />
                
                <Route path="/GroupDetails" element={<GroupDetails />} />
                
                <Route path="/UploadPortfolio" element={<UploadPortfolio />} />
                
                <Route path="/LearningHub" element={<LearningHub />} />
                
                <Route path="/SavedJobs" element={<SavedJobs />} />
                
                <Route path="/Achievements" element={<Achievements />} />
                
                <Route path="/AIGuide" element={<AIGuide />} />
                
                <Route path="/ExternalJobsManager" element={<ExternalJobsManager />} />
                
                <Route path="/RoleManagement" element={<RoleManagement />} />
                
                <Route path="/DeveloperFeed" element={<DeveloperFeed />} />
                
                <Route path="/EditCompanyProfile" element={<EditCompanyProfile />} />
                
                <Route path="/MyApplications" element={<MyApplications />} />
                
                <Route path="/Login" element={<Login />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}