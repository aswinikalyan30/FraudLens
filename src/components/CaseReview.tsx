import React from 'react';
// REFACTOR NOTE: This file has been modularized. Core UI pieces moved to ./caseReview/*.tsx components.

import { X, User, Send, Flag, Phone, FileAudio, MessageCircle, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Application } from '../contexts/ApplicationContext';
import ChatAgent from './ChatAgent';
import DecisionDocumentationModal, { DecisionData } from './DecisionDocumentationModal';
import DocumentRequestWizard from './DocumentRequestWizard';
import './CaseReviewStyles.css';
import SummaryCard from './caseReview/SummaryCard';
// import CollapsibleSection from './caseReview/CollapsibleSection';
import RiskVisualization from './caseReview/RiskVisualization';
import Timeline from './caseReview/Timeline';
import ActionButtons from './caseReview/ActionButtons';

interface CaseReviewProps {
  case: Application;
  onClose: () => void;
  mode?: 'modal' | 'fullscreen' | 'drawer';
}

const CaseReview: React.FC<CaseReviewProps> = ({ case: fraudCase, onClose, mode = 'drawer' }) => {
  const { isDark } = useTheme();
  
  // UI state
  const [isGenerating, setIsGenerating] = React.useState(true);
  const [transcriptAvailable, setTranscriptAvailable] = React.useState(false);
  const [showDocumentWizard, setShowDocumentWizard] = React.useState(false);
  const [showChatWindow, setShowChatWindow] = React.useState(false);
  const [showDecisionModal, setShowDecisionModal] = React.useState(false);
  const [decisionType, setDecisionType] = React.useState<'approve' | 'reject' | 'escalate' | null>(null);
  // Removed tab state as layout is now two columns
  const [showMoreInfo, setShowMoreInfo] = React.useState(false);
  const [confidenceProgress, setConfidenceProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsGenerating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Sample application data based on the fraudCase
  const application = React.useMemo(() => ({
    name: fraudCase.name,
    email: fraudCase.email,
    studentId: fraudCase.studentId,
    program: 'Computer Science', // Default program since it's not in the Application type
    riskScore: fraudCase.riskScore || 0,
    stage: fraudCase.stage,
    flags: fraudCase.flags?.map(f => ({
      rule: f,
      severity: 'high' as const
    })) || [
      { rule: 'Essay Similarity', severity: 'high' as const },
      { rule: 'Email Age', severity: 'medium' as const },
      { rule: 'Rapid Submission', severity: 'low' as const }
    ],
    status: fraudCase.status || 'pending',
    aiRecommendation: {
      summary: "I've analyzed this application and found several risk factors. The high essay similarity score (78%) combined with a newly created email account raises significant concerns. Additionally, the rapid form completion suggests potential automation or familiarity beyond typical first-time applicants.",
      confidence: 85
    }
  }), [fraudCase]);

  // Confidence progress animation
  React.useEffect(() => {
    if (!isGenerating) {
      const timer = setTimeout(() => {
        const target = application.aiRecommendation.confidence;
        let current = 0;
        const increment = target / 30; // Animation over 30 frames
        const animation = setInterval(() => {
          current += increment;
          if (current >= target) {
            setConfidenceProgress(target);
            clearInterval(animation);
          } else {
            setConfidenceProgress(Math.round(current));
          }
        }, 16); // ~60fps
        return () => clearInterval(animation);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, application.aiRecommendation.confidence]);

  // Timeline events based on flags
  const timelineEvents = React.useMemo(() => {
    const baseRisk = 45;
    const events = [{
      id: 'submitted',
      title: 'Application Submitted',
      timestamp: '2024-03-08T10:32:54',
      risk: baseRisk,
      rules: [] as string[],
      color: 'green',
      note: 'Initial submission'
    }];

    application.flags.forEach((f, i) => {
      const r = Math.min(baseRisk + (i + 1) * 15, 85);
      events.push({
        id: `flag-${i}`,
        title: 'Agent Flag Raised',
        timestamp: new Date(Date.now() + (i + 1) * 2 * 60_000).toISOString(),
        risk: r,
        rules: [f.rule],
        color: f.severity === 'high' ? 'red' : f.severity === 'medium' ? 'orange' : 'green',
        note: `What changed: Triggered rule ${f.rule}`
      });
    });

    if (application.status === 'escalated') {
      const r = Math.max(baseRisk, 85);
      events.push({
        id: 'escalated',
        title: 'Escalation Decision',
        timestamp: new Date(Date.now() + 10 * 60_000).toISOString(),
        risk: r,
        rules: ['High Risk Pattern'],
        color: 'red',
        note: 'What changed: Escalated for manual review'
      });
    }

    return events;
  }, [application]);

  const handleSendDocumentRequest = (requestData: {
    documents: string[];
    message: string;
    urgency: number;
    dueDate: string;
    tone: 'formal' | 'friendly' | 'urgent';
    language: string;
    template?: string;
  }) => {
    console.log('Document request sent:', requestData);
    alert('Document request sent successfully!');
  };

  const containerClass = mode === 'modal' 
    ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 lg:p-4"
    : mode === 'drawer'
    ? "fixed inset-y-0 right-0 z-50 w-full max-w-4xl bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out"
    : `min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`;

  const contentClass = mode === 'modal'
    ? `border rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200 shadow-xl'
      } lg:rounded-xl rounded-none h-full lg:h-auto`
    : mode === 'drawer' 
    ? 'h-full flex flex-col overflow-hidden'
    : 'min-h-screen flex flex-col';

  const handleDecisionSubmit = (decision: DecisionData) => {
    console.log('Decision submitted:', { type: decisionType, ...decision });
    setShowDecisionModal(false);
    setDecisionType(null);
    onClose(); // Close the case review after decision
  };

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header */}
        <header className={`border-b px-6 py-4 flex-shrink-0 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Case Review - {application.name}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {application.studentId} • Risk Score: <span className="text-red-500 font-semibold">{application.riskScore}</span> • {application.stage}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Request Call Button - Inline for quick access */}
              <button
                onClick={() => setTranscriptAvailable(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Phone className="w-4 h-4" />
                Request Call
              </button>

              {/* View Transcript (when available) */}
              {transcriptAvailable && (
                <button
                  onClick={() => {/* Transcript functionality can be added later */}}
                  className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileAudio className="w-4 h-4" />
                  View Transcript
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Layout Container */}
        <div className={`flex flex-1 overflow-hidden ${mode === 'drawer' ? 'min-h-0' : mode === 'modal' ? 'max-h-[calc(90vh-80px)]' : 'min-h-0'}`}>
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full p-4">
            {/* Left Column: Student Info, Summary, Documents */}
            <div className="space-y-6">
              {/* Student Info */}
              <div className={`border rounded-lg p-4 transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-800 divide-gray-700' 
                  : 'bg-white divide-gray-200'
              }`}>
                <h3 className={`text-base font-semibold mb-3 flex items-center space-x-2`}>
                  <User className="w-4 h-4" />
                  <span>Student Information</span>
                </h3>
                {/* Main Info */}
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={fraudCase.avatar} 
                    alt={fraudCase.name}
                    className={`w-12 h-12 rounded-full object-cover border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                  />
                  <div className="flex-1">
                    <h4 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{fraudCase.name}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{fraudCase.stage}</p>
                    <p className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{application.program}</p>
                  </div>
                </div>
                {/* High-Impact Flags Only */}
                <div className="mb-3">
                  <div className={`text-xs mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Critical Flags</div>
                  <div className="flex flex-wrap gap-1">
                    {application.flags.filter(f => f.severity === 'high').map((f, i) => (
                      <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium transition-all duration-200 ${
                        isDark ? 'bg-red-500/10 text-red-300 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <Flag className="w-3 h-3" /> {f.rule}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Collapsible More Info */}
                <button
                  onClick={() => setShowMoreInfo(!showMoreInfo)}
                  className={`text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors`}
                >
                  {showMoreInfo ? '↑ Less info' : '↓ More info'}
                </button>
                {showMoreInfo && (
                  <div className={`mt-3 pt-3 border-t space-y-2 transition-all duration-300 ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between text-xs">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Email:</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{fraudCase.email}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Student ID:</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{fraudCase.studentId}</span>
                    </div>
                    {/* All Flags */}
                    <div>
                      <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>All Flags</div>
                      <div className="flex flex-wrap gap-1">
                        {application.flags.filter(f => f.severity !== 'high').map((f, i) => (
                          <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] ${
                            f.severity === 'medium'
                              ? (isDark ? 'bg-orange-500/10 text-orange-300 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200')
                              : (isDark ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200')
                          }`}>
                            <Flag className="w-3 h-3" /> {f.rule}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Summary */}
              <SummaryCard 
                aiRecommendation={application.aiRecommendation}
                isDark={isDark}
                confidenceProgress={confidenceProgress}
                setConfidenceProgress={setConfidenceProgress}
                isGenerating={isGenerating}
              />
              {/* Documents */}
              <div className={`border rounded-lg p-4 transition-all duration-200 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-base font-semibold mb-3 flex items-center space-x-2`}>
                  <FileAudio className="w-4 h-4" />
                  <span>Submitted Documents</span>
                </h3>
                <div className="space-y-2">
                  {[
                    { name: 'Application Form', date: '2024-03-08' },
                    { name: 'Academic Transcript', date: '2024-03-08' },
                    { name: 'Personal Essay', date: '2024-03-08' },
                    { name: 'Recommendation Letter', date: '2024-03-08' },
                    { name: 'ID Proof', date: null }
                  ].map((doc, i) => (
                    <div 
                      key={i} 
                      className={`document-item flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                        isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-gray-50 border-gray-200 hover:bg-white'
                      }`}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium`}>
                          {doc.name}
                        </span>
                      </div>
                      {doc.date && (
                        <div className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{doc.date}</div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Request Documents Section */}
                <div className={`border-t pt-4 mt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Request Additional Documents</h4>
                  <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Request additional documents from the applicant to verify their application.</p>
                  <button
                    onClick={() => setShowDocumentWizard(true)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isDark
                        ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
                        : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    Request Documents
                  </button>
                </div>
              </div>
            </div>
            {/* Right Column: Timeline and Action Buttons */}
            <div className="space-y-6 flex flex-col h-full">
              {/* Timeline */}
              <Timeline events={timelineEvents} isDark={isDark} />
                <RiskVisualization 
                score={application.riskScore}
                trend={[application.riskScore - 10, application.riskScore - 5, application.riskScore]}
                similarAverage={Math.max(0, application.riskScore - 15)}
                breakdown={[
                  { label: 'Essay Similarity', value: 40 },
                  { label: 'Email Age', value: 25 },
                  { label: 'Submission Pattern', value: 20 },
                  { label: 'Behavioral Signals', value: 10 },
                  { label: 'Other', value: 5 }
                ]}
                isDark={isDark}
              />
              {/* Action Buttons */}
              <ActionButtons 
                isDark={isDark}
                setDecisionType={setDecisionType}
                setShowDecisionModal={setShowDecisionModal}
              />
            </div>
          </div>
        </div>

        {/* Floating Chat Bubble */}
        {!showChatWindow && (
          <button
            onClick={() => setShowChatWindow(true)}
            className={`chat-bubble fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 z-40 ${
              isDark 
                ? 'bg-purple-600 text-white hover:bg-purple-500' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
            aria-label="Open AI Assistant"
          >
            <MessageCircle className="w-6 h-6 mx-auto" />
          </button>
        )}

        {/* Floating Chat Window */}
        {showChatWindow && (
          <div className={`chat-window fixed bottom-6 right-6 w-96 h-[500px] rounded-lg shadow-2xl border z-50 flex flex-col ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Chat Header */}
            <div className={`border-b px-4 py-3 rounded-t-lg ${
              isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-semibold flex items-center gap-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <MessageCircle className="w-4 h-4" />
                  AI Assistant
                </h3>
                <button
                  onClick={() => setShowChatWindow(false)}
                  className={`p-1 rounded-md transition-colors ${
                    isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden rounded-b-lg">
              <ChatAgent applicationId={application.studentId} />
            </div>
          </div>
        )}

        {/* Document Request Wizard */}
        <DocumentRequestWizard
          isOpen={showDocumentWizard}
          onClose={() => setShowDocumentWizard(false)}
          applicantName={application.name}
          studentId={application.studentId}
          program={application.program}
          riskScore={application.riskScore}
          onSend={handleSendDocumentRequest}
        />
        {showDecisionModal && (
          <DecisionDocumentationModal
            case={{
              id: fraudCase.id || '',
              studentId: fraudCase.studentId,
              name: fraudCase.name,
              riskScore: fraudCase.riskScore || 0
            }}
            onClose={() => {
              setShowDecisionModal(false);
              setDecisionType(null);
            }}
            onSubmit={(decision) => {
              console.log('Decision submitted:', { type: decisionType, ...decision });
              setShowDecisionModal(false);
              handleDecisionSubmit(decision);
              setDecisionType(null);
              onClose(); // Close the case review after decision
            }}
          />
        )}
      </div> {/* Added missing closing div for content wrapper */}
    </div>
  );
};

export default CaseReview;