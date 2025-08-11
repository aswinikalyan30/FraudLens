import { useState } from 'react';
import { Shield, Settings, Search, Sun, Moon, Users, FileText, Home } from 'lucide-react';
import HomeContent from './components/HomeContent';
import SettingsPanel from './components/SettingsPanel';
import NotificationCenter from './components/NotificationCenter';
import CaseReview from './components/CaseReview';
import MobileBottomNav from './components/MobileBottomNav';
import ApplicationQueue from './components/ApplicationQueue';
import ProcessedApplications from './components/ProcessedApplications';
import UserProfile from './components/UserProfile';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ApplicationProvider, Application, useApplications } from './contexts/ApplicationContext';
import { NavigationProvider } from './contexts/NavigationContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCaseFromNotification, setSelectedCaseFromNotification] = useState<Application | null>(null);
  const [reviewingApplicationId, setReviewingApplicationId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { queueApplications, processedApplications } = useApplications();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'queue', label: 'Queue', icon: Users, count: queueApplications.length>0 ? queueApplications.length : undefined },
    { id: 'processed', label: 'Processed', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    if (reviewingApplicationId) {
      // Find the application from queue or processed applications
      const allApplications = [...queueApplications, ...processedApplications];
      const application = allApplications.find(app => app.id === reviewingApplicationId);
      
      if (!application) {
        // Fallback if application not found
        setReviewingApplicationId(null);
        return null;
      }

      return (
        <CaseReview
          case={application}
          onClose={() => setReviewingApplicationId(null)}
          mode="fullscreen"
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeContent
            onNavigateToQueue={() => setActiveTab('queue')}
            onNavigateToProcessed={() => setActiveTab('processed')}
          />
        );
      case 'queue':
        return <ApplicationQueue />;
      case 'processed':
        return <ProcessedApplications 
          onReviewApplication={(applicationId) => {
            setReviewingApplicationId(applicationId);
          }}
        />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return (
          <HomeContent
            onNavigateToQueue={() => setActiveTab('queue')}
            onNavigateToProcessed={() => setActiveTab('processed')}
          />
        );
    }
  };

  const handleNavigateToCase = (caseId: string) => {
    // Create a mock case from the notification caseId
    const randomStageIndex = Math.floor(Math.random() * 2); // only two stages now
    const stageOptions: Array<'admission' | 'financial-aid'> = ['admission', 'financial-aid'];
    
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
                ? 'bg-purple-500/20 border-purple-500/30' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <Shield className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
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
                    {/* Notification Badge */}
                    {tab.count && tab.count > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[18px] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                        {tab.count > 99 ? '99+' : tab.count}
                      </div>
                    )}
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
                    isDark ? 'bg-teal-400' : 'bg-teal-500'
                  }`}></div>
                  <span className={`text-sm hidden sm:block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {activeTab === 'home' && 'Application Management Dashboard'}
                    {activeTab === 'queue' && 'Application Queue'}
                    {activeTab === 'processed' && 'Processed Applications'}
                    {activeTab === 'settings' && 'System Configuration'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative hidden md:block">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search cases..."
                    className={`border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                      isDark 
                        ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
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
                    className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-500 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-white">AI</span>
                  </button>
                  <div className="text-sm">
                    <div className={isDark ? 'text-white' : 'text-gray-900'}>Admin 1</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Fraud Analyst
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content - All pages use same container */}
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
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