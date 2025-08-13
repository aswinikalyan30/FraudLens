import React, { useState, useRef } from 'react';
import { 
  User, 
  Camera, 
  Award, 
  Target, 
  Clock, 
  Users, 
  CheckCircle, 
  X, 
  Activity,
  FileText
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApplications } from '../contexts/ApplicationContext';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  profilePhoto?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  jobTitle: string;
  department: string;
  employeeId: string;
  institution: string;
  campus?: string;
  yearsExperience: string;
  specializations: string[];
  reportingManager: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { processedApplications } = useApplications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { signOut } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'profile'>('analytics');
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data - in real app would come from context/API
  const [userData, setUserData] = useState<UserData>({
    firstName: 'Robert',
    lastName: 'Wesley', 
    displayName: 'Robert Wesley',
    email: 'robert.wesley@university.edu',
    emailVerified: true,
    phone: '+1 (555) 123-4567',
    jobTitle: 'Senior Fraud Analyst',
    department: 'Admissions Security',
    employeeId: 'EMP001',
    institution: 'State University',
    campus: 'Main Campus',
    yearsExperience: '5-10 years',
    specializations: ['Financial Aid Fraud', 'Admission Fraud', 'International Applications'],
    reportingManager: 'Sarah Johnson'
  });

  // Calculate analytics data
  const totalCasesProcessed = processedApplications.length;
  const thisMonthCases = processedApplications.filter(app => {
    const appDate = new Date(app.timestamp);
    const now = new Date();
    return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
  }).length;
  
  const successRate = processedApplications.length > 0 ? 
    Math.round((processedApplications.filter(app => app.status === 'approved' || app.status === 'rejected').length / processedApplications.length) * 100) : 0;
  
  const avgProcessingTime = 2.3; // Mock data
  const fraudDetectionAccuracy = 94.2; // Mock data

  // Case type breakdown
  const admissionCases = processedApplications.filter(app => app.stage === 'admissions').length;
  const financialAidCases = processedApplications.filter(app => app.stage === 'financial-aid').length;
  
  // Recent performance trends (mock data)
  const performanceTrends = [
    { month: 'Oct', cases: 45, accuracy: 92 },
    { month: 'Nov', cases: 52, accuracy: 94 },
    { month: 'Dec', cases: 38, accuracy: 96 },
    { month: 'Jan', cases: 41, accuracy: 93 },
    { month: 'Feb', cases: thisMonthCases, accuracy: fraudDetectionAccuracy }
  ];

  const specializationOptions = [
    'Financial Aid Fraud',
    'Admission Fraud', 
    'International Applications',
    'Document Verification',
    'Identity Fraud',
    'Academic Fraud'
  ];

  if (!isOpen) return null;

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In real app, would handle image upload and cropping
      console.log('File selected:', file.name);
    }
  };

  const handleSpecializationToggle = (spec: string) => {
    setUserData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                User Profile
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your account and view analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { signOut(); onClose(); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Sign out
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? isDark ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Personal Analytics
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? isDark ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile Information
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'analytics' ? (
            <div className="p-6 space-y-6">
              {/* Performance Dashboard */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Performance Dashboard
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Total Cases
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {totalCasesProcessed}
                    </div>
                    <div className="text-sm text-green-500">
                      +{thisMonthCases} this month
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-green-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Success Rate
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {successRate}%
                    </div>
                    <div className="text-sm text-green-500">
                      +2% vs last month
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Avg Time
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {avgProcessingTime}m
                    </div>
                    <div className="text-sm text-green-500">
                      -0.3m improvement
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-blue-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Accuracy
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {fraudDetectionAccuracy}%
                    </div>
                    <div className="text-sm text-green-500">
                      Industry leading
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Load Management */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Case Load Management
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Case Type Distribution
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Admission Cases
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all"
                              style={{ width: `${(admissionCases / totalCasesProcessed) * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {admissionCases}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Financial Aid
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${(financialAidCases / totalCasesProcessed) * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {financialAidCases}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Monthly Performance Trend
                    </h4>
                    <div className="space-y-2">
                      {performanceTrends.map((month) => (
                        <div key={month.month} className="flex items-center justify-between text-sm">
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {month.month}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {month.cases} cases
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              month.accuracy >= 95 ? 'bg-green-100 text-green-700' :
                              month.accuracy >= 90 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {month.accuracy}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Tracking */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Time Tracking Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Investigation
                      </span>
                    </div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      45.2h
                    </div>
                    <div className="text-xs text-gray-500">
                      This month
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-green-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Documentation
                      </span>
                    </div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      12.8h
                    </div>
                    <div className="text-xs text-gray-500">
                      This month
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Collaboration
                      </span>
                    </div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      8.5h
                    </div>
                    <div className="text-xs text-gray-500">
                      This month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Profile Header with Photo */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full border-4 overflow-hidden ${
                    isDark ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    {userData.profilePhoto ? (
                      <img 
                        src={userData.profilePhoto} 
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <User className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handlePhotoUpload}
                    className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      isDark 
                        ? 'bg-blue-600 border-gray-800 text-white hover:bg-blue-700' 
                        : 'bg-blue-600 border-white text-white hover:bg-blue-700'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {userData.firstName} {userData.lastName}
                    </h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isEditing
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {userData.jobTitle}
                    </span>
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>•</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {userData.department}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Personal Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={userData.firstName}
                        onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                        } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 pr-10 rounded-lg border ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                              : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                          } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                        />
                        {userData.emailVerified && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={userData.employeeId}
                        onChange={(e) => setUserData(prev => ({ ...prev, employeeId: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                        } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={userData.lastName}
                        onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                        } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={userData.phone || ''}
                        onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Optional"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50 placeholder-gray-400'
                        } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={userData.displayName}
                        onChange={(e) => setUserData(prev => ({ ...prev, displayName: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                        } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Professional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Institution
                      </label>
                      <input
                        type="text"
                        value={userData.institution}
                        onChange={(e) => setUserData(prev => ({ ...prev, institution: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                        } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Years of Experience
                      </label>
                      <select
                        value={userData.yearsExperience}
                        onChange={(e) => setUserData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                        } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                      >
                        <option value="0-1 years">0-1 years</option>
                        <option value="2-4 years">2-4 years</option>
                        <option value="5-10 years">5-10 years</option>
                        <option value="10+ years">10+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Reporting Manager
                      </label>
                      <input
                        type="text"
                        value={userData.reportingManager}
                        onChange={(e) => setUserData(prev => ({ ...prev, reportingManager: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                        } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Campus/Branch
                      </label>
                      <input
                        type="text"
                        value={userData.campus || ''}
                        onChange={(e) => setUserData(prev => ({ ...prev, campus: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Optional"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50 placeholder-gray-400'
                        } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={userData.jobTitle}
                        onChange={(e) => setUserData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                        } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Department
                      </label>
                      <input
                        type="text"
                        value={userData.department}
                        onChange={(e) => setUserData(prev => ({ ...prev, department: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                            : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                        } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialization Areas */}
              <div>
                <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Specialization Areas
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specializationOptions.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => isEditing && handleSpecializationToggle(spec)}
                      disabled={!isEditing}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                        userData.specializations.includes(spec)
                          ? isDark 
                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                            : 'bg-blue-100 border-blue-300 text-blue-700'
                          : isDark
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
