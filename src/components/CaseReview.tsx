import React from 'react';
import { X, Shield, User, Mail, Activity, Send, Brain, Flag, Phone, FileAudio, MessageCircle, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Application } from '../contexts/ApplicationContext';

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: string;
}

interface CaseReviewProps {
  case: Application;
  onClose: () => void;
  mode?: 'modal' | 'fullscreen';
}

const CaseReview: React.FC<CaseReviewProps> = ({ case: fraudCase, onClose, mode = 'fullscreen' }) => {
  const { isDark } = useTheme();
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const docsRef = React.useRef<HTMLDivElement>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  
  // UI state
  const [isGenerating, setIsGenerating] = React.useState(true);
  const [transcriptAvailable, setTranscriptAvailable] = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [emailTemplate, setEmailTemplate] = React.useState('');
  const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>([]);
  const [showChatWindow, setShowChatWindow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsGenerating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: newMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = '';
      if (newMessage.toLowerCase().includes('why was this flagged')) {
        aiResponse = 'This application was flagged due to three main factors: 1) Essay similarity of 78% with known fraudulent applications, 2) Email account created only 3 days before submission, and 3) Unusually rapid form completion time of 12 minutes.';
      } else if (newMessage.toLowerCase().includes('request id proof')) {
        aiResponse = 'I can help you request ID proof. Would you like me to prepare an email template for document verification?';
      } else if (newMessage.toLowerCase().includes('risk factors')) {
        aiResponse = 'Key risk factors: High essay similarity (78%), new email account (3 days old), rapid submission pattern, and unusual browser fingerprint. Combined risk score: 85/100.';
      } else {
        aiResponse = 'I can help you analyze this application. Ask me about specific flags, risk factors, or request additional documents from the applicant.';
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setNewMessage('');
  };

  const handleRequestDocuments = () => {
    if (selectedDocuments.length === 0) {
      alert('Please select at least one document to request.');
      return;
    }

    const template = `Dear ${application.name},

Thank you for your application to our program. As part of our standard verification process, we need to request the following additional documents:

${selectedDocuments.map(doc => `• ${doc}`).join('\\n')}

Please submit these documents within 5 business days to avoid any delays in processing your application.

You can submit documents through our secure portal or reply directly to this email.

If you have any questions, please don't hesitate to contact our admissions team.

Best regards,
Admissions Review Team
University Fraud Detection Department

---
Application ID: ${application.studentId}
Risk Assessment Level: ${(application.riskScore || 0) >= 80 ? 'High' : (application.riskScore || 0) >= 50 ? 'Medium' : 'Low'}
`;

    setEmailTemplate(template);
    setShowEmailModal(true);
  };

  const handleSendEmail = () => {
    alert('Email sent successfully!');
    setShowEmailModal(false);
    setEmailTemplate('');
    setSelectedDocuments([]);
  };

  const containerClass = mode === 'modal' 
    ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 lg:p-4"
    : `fixed inset-0 z-50 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`;

  const contentClass = mode === 'modal'
    ? `border rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200 shadow-xl'
      } lg:rounded-xl rounded-none h-full lg:h-auto`
    : 'h-full flex flex-col';

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header */}
        <header className={`border-b px-6 py-4 ${mode === 'modal' ? 'sticky top-0 z-10' : ''} ${
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
                  {application.studentId} • Risk Score: {application.riskScore}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Request Call / Transcript */}
              {transcriptAvailable ? (
                <button
                  onClick={() => {/* Transcript functionality can be added later */}}
                  className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileAudio className="w-4 h-4" />
                  View Transcript
                </button>
              ) : (
                <button
                  onClick={() => setTranscriptAvailable(true)}
                  className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Request Call
                </button>
              )}

              {/* AI Chat Button */}
              <button
                onClick={() => setShowChatWindow(true)}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                AI Assistant
              </button>
            </div>
          </div>
        </header>

        {/* Main Layout Container */}
        <div className={`flex ${mode === 'modal' ? 'max-h-[calc(90vh-80px)]' : 'h-[calc(100vh-80px)]'}`}>
          {/* Left Side - Main Content */}
          <div className={`flex-1 overflow-y-auto ${showChatWindow ? 'pr-2' : ''}`}>
            <div className="p-3">
              {/* Student Info */}
              <div className={`border rounded-lg p-2 mb-3 ${
                isDark 
                  ? 'bg-gray-900/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`text-base font-semibold mb-2 flex items-center space-x-2`}>
                  <User className="w-4 h-4" />
                  <span>Student Information</span>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={fraudCase.avatar} 
                      alt={fraudCase.name}
                      className={`w-10 h-10 rounded-full object-cover border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                    />
                    <div>
                      <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{fraudCase.name}</h4>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{fraudCase.email}</p>
                      <p className={`font-mono text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{fraudCase.studentId}</p>
                    </div>
                  </div>
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between text-xs">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Risk Score:</span>
                      <span className="text-red-500 font-bold">{fraudCase.riskScore || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Stage:</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{fraudCase.stage}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Program:</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{application.program}</span>
                    </div>
                  </div>
                </div>

                {/* Flag Chips */}
                <div className="mt-2">
                  <div className={`text-xs mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Flags</div>
                  <div className="flex flex-wrap gap-1">
                    {application.flags.map((f, i) => (
                      <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] ${
                        f.severity === 'high'
                          ? (isDark ? 'bg-red-500/10 text-red-300 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200')
                          : f.severity === 'medium'
                          ? (isDark ? 'bg-orange-500/10 text-orange-300 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200')
                          : (isDark ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200')
                      }`}>
                        <Flag className="w-3 h-3" /> {f.rule}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline View */}
              <div ref={timelineRef} className={`border rounded-lg p-2 mb-3 ${
                isDark 
                  ? 'bg-gray-900/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`text-base font-semibold mb-2 flex items-center space-x-2`}>
                  <Activity className="w-4 h-4" />
                  <span>Case Timeline</span>
                </h3>
                {/* Horizontal Timeline */}
                <div className="overflow-x-auto">
                  <div className="flex items-stretch gap-3 min-w-[400px] pb-1 relative">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 z-0" style={{background: isDark ? '#4B5563' : '#E5E7EB'}} />
                    {timelineEvents.map((e, idx) => (
                      <div key={`${e.id}+${idx}`} className="relative z-10 flex flex-col items-center min-w-[140px]">
                        {/* Dot */}
                        <div className={`w-3 h-3 rounded-full border-2 mb-1 ${
                          e.color === 'green' ? 'bg-green-500 border-green-200' :
                          e.color === 'orange' ? 'bg-orange-500 border-orange-200' :
                          'bg-red-500 border-red-200'
                        }`} />
                        {/* Card */}
                        <div className={`p-2 rounded-md border shadow-sm w-full ${
                          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="font-medium text-xs">{e.title}</div>
                            <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(e.timestamp).toLocaleTimeString()}</div>
                          </div>
                          <div className="flex flex-wrap gap-0.5 mb-0.5">
                            {e.rules.map((r, i) => (
                              <span key={i} className="text-[10px] text-gray-500">{r}</span>
                            ))}
                          </div>
                          {e.note && <div className={`text-[10px] mb-0.5 text-gray-500 italic`}>{e.note}</div>}
                          <span className={`px-1 py-0.5 rounded-full border text-[10px] ${
                            e.color === 'green' ? 'text-green-600 border-green-300' :
                            e.color === 'orange' ? 'text-orange-600 border-orange-300' :
                            'text-red-600 border-red-300'
                          }`}>Risk: {e.risk}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className={`border rounded-lg p-2 mb-3 ${
                isDark 
                  ? 'bg-gray-900/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`text-base font-semibold mb-2 flex items-center space-x-2 `}>
                  <Shield className="w-4 h-4" />
                  <span>AI Reasoning Summary</span>
                </h3>
                <div className={`border rounded-lg p-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="relative">
                    {isGenerating && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#7100EB] to-transparent animate-pulse" />
                    )}
                    <div className={`flex items-start gap-3 ${isGenerating ? 'animate-pulse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center`}>
                        <Brain className={`${isDark ? 'text-black-400' : 'text-black-600'} w-3 h-3`} />
                      </div>
                      <p className={`text-xs leading-snug ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {application.aiRecommendation.summary}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center space-x-1">
                      <span className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-600'} font-bold`}>Confidence:</span>
                      <div className={`flex-1 rounded-full h-1.5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="bg-red-500 h-1.5 rounded-full"
                          style={{ width: `${application.aiRecommendation.confidence}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold">{application.aiRecommendation.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Documents Section */}
              <div ref={docsRef} className={`border rounded-lg p-2 mb-3 ${
                isDark 
                  ? 'bg-gray-900/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`text-base font-semibold mb-2 flex items-center space-x-2 `}>
                  <Mail className="w-4 h-4" />
                  <span>Request Documents</span>
                </h3>
                
                <div className="space-y-2">
                  {['ID Proof', 'Bank Statements', 'Address Proof', 'Income Verification'].map(doc => (
                    <label key={doc} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-[#7100EB] h-3 w-3"
                        checked={selectedDocuments.includes(doc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocuments(prev => [...prev, doc]);
                          } else {
                            setSelectedDocuments(prev => prev.filter(d => d !== doc));
                          }
                        }}
                      />
                      <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{doc}</span>
                    </label>
                  ))}
                  
                    <button
                    onClick={handleRequestDocuments}
                    className={`w-full mt-2 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                      isDark
                      ? 'bg-purple-700 text-white hover:bg-purple-600'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                    >
                    <Send className="w-3 h-3" />
                    Request Selected Documents
                    </button>
                </div>
              </div>

              {/* Case Actions at the bottom of main content */}
              <div className={`border rounded-lg p-2 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Case Actions</h4>
                <div className="grid grid-cols-3 gap-1">
                  <button className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    isDark 
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30' 
                      : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                  }`}>
                    ✅ Approve
                  </button>
                  <button className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    isDark 
                      ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30' 
                      : 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
                  }`}>
                    ❌ Reject
                  </button>
                  <button className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    isDark 
                      ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30' 
                      : 'bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                  }`}>
                    🚨 Escalate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - AI Chat Window */}
          {showChatWindow && (
            <div className="w-96 border-l flex flex-col">
              <div className={`flex-1 flex flex-col ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                {/* Chat Header */}
                <div className={`border-b px-4 py-3 ${
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
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ask questions about this case
                  </p>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Initial AI message */}
                  <div className="max-w-[85%]">
                    <div className={`p-3 rounded-2xl text-sm border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          AI Assistant
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        I've analyzed the application for <strong>{application.name}</strong>. The risk score is elevated at <strong>{application.riskScore}</strong> due to inconsistencies. Would you like me to elaborate?
                      </p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%]`}>
                        <div className={`p-3 rounded-2xl text-sm ${
                          msg.isUser 
                            ? isDark 
                              ? 'bg-gray-600 text-white' 
                              : 'bg-gray-600 text-white'
                            : isDark 
                              ? 'bg-gray-700 border-gray-600 text-gray-200 border' 
                              : 'bg-gray-50 border-gray-200 text-gray-800 border'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium ${
                              msg.isUser 
                                ? 'text-gray-300'
                                : isDark 
                                  ? 'text-gray-400' 
                                  : 'text-gray-600'
                            }`}>
                              {msg.isUser ? 'You' : (
                                <>
                                  AI
                                </>
                              )}
                            </span>
                            <span className={`text-xs ${
                              msg.isUser 
                                ? 'text-gray-300'
                                : isDark 
                                  ? 'text-gray-500' 
                                  : 'text-gray-500'
                            }`}>
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className={`border-t px-4 py-3 ${
                  isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask about this case..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        newMessage.trim()
                          ? isDark
                            ? 'bg-gray-600 text-white hover:bg-gray-500'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                          : isDark
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`max-w-2xl w-full mx-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`border-b px-6 py-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Document Request Email
                </h3>
              </div>
              <div className="p-6">
                <textarea
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  className={`w-full h-64 p-3 border rounded-lg text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Email content..."
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className={`px-4 py-2 border rounded-lg ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    className="px-4 py-2 bg-[#7100EB] text-white rounded-lg hover:bg-[#7100EB]/80"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseReview;
