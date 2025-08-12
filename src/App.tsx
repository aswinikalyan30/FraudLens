import { useState, useEffect, useCallback } from 'react';
import { Shield, Settings, Search, Sun, Moon, FileText, Home, BarChart3 } from 'lucide-react';
import HomeContent from './components/HomeContent';
import SettingsPanel from './components/SettingsPanel';
import NotificationCenter from './components/NotificationCenter';
import CaseReview from './components/CaseReview';
import MobileBottomNav from './components/MobileBottomNav';
import ProcessedApplications from './components/ProcessedApplications';
import ReportingDashboard from './components/ReportingDashboard';
import UserProfile from './components/UserProfile';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ApplicationProvider, Application, useApplications } from './contexts/ApplicationContext';
import { NavigationProvider } from './contexts/NavigationContext';
import ChatAgent from './components/ChatAgent';
import FlagsChart from './components/FlagsChart';
import { fetchApplicationById, fetchApplicationDetailById, type ApplicationDetail } from './api/applications';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCaseFromNotification, setSelectedCaseFromNotification] = useState<Application | null>(null);
  const [reviewingApplicationId, setReviewingApplicationId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  
  // Add event listener for custom case navigation event
  useEffect(() => {
    const handleCaseNavigation = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.id) {
        setReviewingApplicationId(customEvent.detail.id);
      }
    };
    
    window.addEventListener('openCaseFullScreen', handleCaseNavigation);
    return () => {
      window.removeEventListener('openCaseFullScreen', handleCaseNavigation);
    };
  }, []);
  // Use local lists only to map UI id -> API id (no merging)
  const { processedApplications, queueApplications } = useApplications();
  const [detailedApplication, setDetailedApplication] = useState<Application | null>(null);
  const [applicationDetail, setApplicationDetail] = useState<ApplicationDetail | null>(null);
  // New: loading and error state for case detail
  const [isLoadingCase, setIsLoadingCase] = useState(false);
  const [detailLoadError, setDetailLoadError] = useState<string | null>(null);

  // Memoized helper to build minimal Application from detail
  const buildCaseFromDetail = useCallback((detail: ApplicationDetail): Application => {
    const riskFraction = detail.fraud_score != null
      ? (typeof detail.fraud_score === 'string' ? parseFloat(detail.fraud_score) : detail.fraud_score)
      : undefined;
    const riskScore = typeof riskFraction === 'number' && !Number.isNaN(riskFraction)
      ? Math.round(riskFraction * 100)
      : undefined;
    const flags: string[] = [];
    const fd = detail.fraud_details as unknown as Record<string, unknown> | undefined;
    if (fd && typeof fd === 'object') {
      Object.values(fd).forEach(v => { if (Array.isArray(v)) v.forEach(i => { if (typeof i === 'string') flags.push(i); }); });
    }
    const stageNorm = (() => {
      const v = (detail.application_type || '').toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
      return v === 'financial-aid' || v === 'financialaid' || v === 'finaid' ? 'financial-aid' : 'admissions';
    })();
    console.log('Building case from detail:', detail.application_id, 'with risk score:', riskScore, 'and flags:', flags);
    return {
      id: detail.application_id,
      studentId: detail.application_id,
      name: [detail.first_name, detail.last_name].filter(Boolean).join(' ') || 'Unknown Applicant',
      email: detail.email || 'unknown@example.com',
      stage: stageNorm,
      timestamp: detail.updated_at || detail.created_at || new Date().toISOString(),
      status: (detail.application_status as Application['status']) || 'submitted',
      riskScore,
      flags,
      programId: detail.program_id,
      programName: detail.program_name,
      updatedAt: detail.updated_at,
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    if (!reviewingApplicationId) {
      setDetailedApplication(null);
      setApplicationDetail(null);
      setDetailLoadError(null);
      setIsLoadingCase(false);
      return;
    }
    setIsLoadingCase(true);
    setDetailLoadError(null);

    const listJoin = [...processedApplications, ...queueApplications];
    const match = listJoin.find(a => a.studentId === reviewingApplicationId);
    const candidates = Array.from(new Set([
      match?.studentId,
      match?.id,
      reviewingApplicationId,
    ].filter(Boolean))) as string[];

    (async () => {
      for (const apiId of candidates) {
        try {
          const [app, detail] = await Promise.all([
            fetchApplicationById(apiId),
            fetchApplicationDetailById(apiId)
          ]);
          if (canceled) return;
          if (detail) {
            console.log('Fetched application detail for:', apiId,detail);
            setApplicationDetail(detail);
            setDetailedApplication(app ?? buildCaseFromDetail(detail));
            setIsLoadingCase(false);
            return;
          }
        } catch {
          // try next candidate
        }
      }
      if (!canceled) {
        setDetailedApplication(null);
        setApplicationDetail(null);
        setDetailLoadError('We could not load this application from the API.');
        setIsLoadingCase(false);
      }
    })();

    return () => { canceled = true; };
  }, [reviewingApplicationId, processedApplications, queueApplications, buildCaseFromDetail]);

  // Tabs for sidebar and mobile nav
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'processed', label: 'Processed', icon: FileText },
    { id: 'reporting', label: 'Reporting', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    // When reviewing a case, wait for API results and do NOT use local list fallback
    if (reviewingApplicationId) {
      if (isLoadingCase) {
        return (
          <div className={`flex items-center justify-center h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex flex-col items-center space-y-3">
              <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loading application…</span>
            </div>
          </div>
        );
      }

      if (detailLoadError) {
        return (
          <div className={`flex items-center justify-center h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`p-6 border rounded-lg text-center ${isDark ? 'bg-red-900/20 border-red-500/30 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <div className="font-semibold mb-2">Unable to load application</div>
              <div className="text-sm mb-4">{detailLoadError}</div>
              <button
                onClick={() => setReviewingApplicationId(null)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                Go back
              </button>
            </div>
          </div>
        );
      }

      if (applicationDetail) {
        console.log('Rendering CaseReview with detailedApplication:', detailedApplication);
        return (
          <CaseReview
            case={detailedApplication ?? buildCaseFromDetail(applicationDetail)}
            detail={applicationDetail}
            onClose={() => setReviewingApplicationId(null)}
            mode="fullscreen"
          />
        );
      }

      // Fallback safeguard (shouldn’t reach here)
      return (
        <div className={`flex items-center justify-center h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No application selected.</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeContent
            onNavigateToProcessed={() => setActiveTab('processed')}
            onOpenCaseFullScreen={(id) => setReviewingApplicationId(id)}
          />
        );
      case 'processed':
        return <ProcessedApplications onReviewApplication={(applicationId) => setReviewingApplicationId(applicationId)} />;
      case 'reporting':
        return <ReportingDashboard />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return (
          <HomeContent
            onNavigateToProcessed={() => setActiveTab('processed')}
            onOpenCaseFullScreen={(id) => setReviewingApplicationId(id)}
          />
        );
    }
  };

  const handleNavigateToCase = (caseId: string) => {
    // Create a mock case from the notification caseId
    const randomStageIndex = Math.floor(Math.random() * 2); // only two stages now
    const stageOptions: Array<'admissions' | 'financial-aid'> = ['admissions', 'financial-aid'];

    const mockCase: Application = {
      id: caseId,
      studentId: caseId,
      name: `Student ${caseId.split('-')[2]}`,
      email: `student${caseId.split('-')[2]}@university.edu`,
      riskScore: Math.floor(Math.random() * 30) + 70,
      stage: stageOptions[randomStageIndex],
      status: 'escalated',
      flags: [['Essay Similarity', 'Email Age', 'Document Anomaly'][Math.floor(Math.random() * 3)]],
      timestamp: new Date().toISOString(),
      aiProcessing: false
    };
    
    setSelectedCaseFromNotification(mockCase);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Unified Layout for ALL pages - no special cases */}
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Unified Sidebar Navigation */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-16 border-r transition-all duration-300 hidden lg:block
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-lg'
          }
        `}>
          <div className={`flex items-center justify-center p-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isDark 
                ? 'bg-blue-500/20 border-blue-500/30' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <img src="https://cdn-ch-prod-bqhwa0ewbpg6eyc2.z01.azurefd.net/prod-img-cache/CDN-ik-images/charityprofile/9/5853/Foundation+Logo-Jan2015%20(1)%20(2)_1.png" alt="Logo" className="w-5 h-5" />
            </div>
          </div>
          
          <nav className="mt-6 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                      // Exit case review if open when navigating via sidebar
                      setReviewingApplicationId(null);
                    }}
                    className={`
                      w-12 h-12 rounded-lg flex items-center justify-center mb-2 transition-all duration-200 relative
                      ${activeTab === tab.id 
                        ? isDark
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-200 text-gray-900'
                        : isDark
                          ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {activeTab === tab.id && (
                      <div className={`absolute -right-px top-0 bottom-0 w-0.5 rounded-l ${
                        isDark ? 'bg-gray-400' : 'bg-gray-600'
                      }`} />
                    )}
                  </button>
                  {/* Tooltip */}
                  <div className={`
                    absolute left-full ml-2 px-2 py-1 rounded-md text-sm whitespace-nowrap
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50
                    ${isDark 
                      ? 'bg-gray-900 text-white border border-gray-700' 
                      : 'bg-white text-gray-900 border border-gray-200 shadow-lg'
                    }
                  `} style={{ top: '50%', transform: 'translateY(-50%)' }}>
                    {tab.label}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* AI Agent Status - Compact */}
          <div className="absolute bottom-4 left-2 right-2">
            <div className={`border rounded-lg p-2 text-center ${
              isDark 
                ? 'bg-gray-900/50 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-center mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xs text-green-500 font-medium">AI</div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Unified for all pages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Unified Top Header */}
          <header className={`border-b px-4 py-3 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`lg:hidden p-2 rounded-lg ${
                    isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Search className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-3 lg:hidden">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    isDark 
                      ? 'bg-teal-500/20 border-teal-500/30' 
                      : 'bg-teal-50 border-teal-200'
                  }`}>
                    <Shield className={`w-5 h-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                  </div>
                  <div>
                    <h1 className="font-bold text-sm">SuspiciousApplicant</h1>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-1 h-1 rounded-full animate-pulse ${
                    isDark ? 'bg-blue-400' : 'bg-blue-500'
                  }`}></div>
                  <span className={`text-l font-bold hidden sm:block ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                    Crestwood University
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <NotificationCenter 
                  isOpen={notificationsOpen}
                  onToggle={() => setNotificationsOpen(!notificationsOpen)}
                  onNavigateToCase={handleNavigateToCase}
                />
                
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-all ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                
                <div className="flex items-center space-x-2 hidden sm:flex">
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-white">AI</span>
                  </button>
                  <div className="text-sm">
                    <div className={isDark ? 'text-white' : 'text-gray-900'}>Robert Wesley</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Financial Aid Admin
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content with right activity/chat panel */}
          <div className="flex-1 flex overflow-hidden pt-3 pe-5">
            {activeTab === 'home' ? (
              <>
                <main className="flex-[5] min-w-0 overflow-auto">
                  {renderContent()}
                </main>
                {/* Hide FlagsChart and ChatAgent when a case is open from Home */}
                {!reviewingApplicationId && (
                  <aside className={`hidden xl:flex flex-[3] min-w-0 flex-col`}>
                    <div className="flex-[2]">
                      <FlagsChart onNavigateToReporting={() => setActiveTab('reporting')} compact={true} />
                    </div>
                    <div className="flex-[3] border-t border-gray-200">
                      <ChatAgent 
                        applicationId="home" 
                        userName="Robert" 
                        onOpenCaseFullScreen={(id) => setReviewingApplicationId(id)}
                      />
                    </div>
                  </aside>
                )}
              </>
            ) : (
              <main className="flex-1 overflow-auto">
                {renderContent()}
              </main>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
          setReviewingApplicationId(null);
        }}
        tabs={tabs}
      />
      
      {/* Case Detail Modal from Notification */}
      {selectedCaseFromNotification && (
        <CaseReview
          case={selectedCaseFromNotification}
          onClose={() => setSelectedCaseFromNotification(null)}
        />
      )}
      
      {/* User Profile Modal */}
      <UserProfile 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <ApplicationProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </ApplicationProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;