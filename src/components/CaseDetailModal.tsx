import React from 'react';
import { X, Shield, AlertTriangle, User, Mail, FileText, Activity, Send, Brain, Flag, ShieldAlert, Phone, MessageSquare, FileAudio, MessageCircle, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Application } from '../contexts/ApplicationContext';

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: string;
}

interface CaseDetailModalProps {
  case: Application;
  onClose: () => void;
}

const CaseDetailModal: React.FC<CaseDetailModalProps> = ({ case: fraudCase, onClose }) => {
  const { isDark } = useTheme();
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const docsRef = React.useRef<HTMLDivElement>(null);
  // New UI state
  const [isGenerating, setIsGenerating] = React.useState(true);
  const [transcriptAvailable, setTranscriptAvailable] = React.useState(false);
  const [showTranscript, setShowTranscript] = React.useState(false);
  
  React.useEffect(() => {
    const t = setTimeout(() => setIsGenerating(false), 1200);
    return () => clearTimeout(t);
  }, []);
  
  // Provide default values for missing properties in Application type
  const caseSummary = "Based on our analysis of this application, there are several risk indicators that warrant attention. The essay shows significant similarity to previously submitted essays in our database, and the email account associated with this application was created very recently. Additionally, the application was submitted rapidly after account creation, which is a common pattern in fraudulent applications. We recommend a thorough human review before proceeding.";
  const previousFlags = fraudCase.flags?.length || 0;

  // Build rich timeline events
  const timelineEvents = React.useMemo(() => {
    const events: Array<{
      id: string;
      title: string;
      timestamp: string;
      risk: number;
      rules: string[];
      color: 'green' | 'orange' | 'red';
      note?: string;
    }> = [];

    const baseRisk = fraudCase.riskScore || 0;

    events.push({
      id: 'submitted',
      title: 'Application Submitted',
      timestamp: fraudCase.timestamp || new Date().toISOString(),
      risk: baseRisk,
      rules: [],
      color: baseRisk > 80 ? 'red' : baseRisk > 60 ? 'orange' : 'green',
      note: 'Initial submission'
    });

    (fraudCase.flags || []).forEach((f, idx) => {
      const r = Math.min(95, (baseRisk || 50) + 5 * (idx + 1));
      events.push({
        id: `flag-${idx}`,
        title: 'Agent Flag Raised',
        timestamp: new Date(Date.now() + (idx + 1) * 60_000).toISOString(),
        risk: r,
        rules: [f],
        color: r > 80 ? 'red' : r > 60 ? 'orange' : 'green',
        note: `What changed: Triggered rule ${f}`
      });
    });

    if (fraudCase.stage === 'financial-aid') {
      const r = Math.max(baseRisk, 65);
      events.push({
        id: 'fa-review',
        title: 'Financial Aid Review',
        timestamp: new Date(Date.now() + 5 * 60_000).toISOString(),
        risk: r,
        rules: ['Asset Mismatch Check'],
        color: r > 80 ? 'red' : 'orange',
        note: 'Financial documents reviewed'
      });
    }

    if (fraudCase.status === 'escalated') {
      const r = Math.max(baseRisk, 85);
      events.push({
        id: 'escalated',
        title: 'Escalation Decision',
        timestamp: new Date(Date.now() + 10 * 60_000).toISOString(),
        risk: r,
        rules: ['High Similarity Essay', 'Email Age < 7 days'],
        color: 'red',
        note: 'What changed: Escalated due to essay similarity 95% after resubmission'
      });
    }

    return events;
  }, [fraudCase]);

  const ruleTraces = [
    {
      rule: 'Essay Similarity Check',
      result: 'TRIGGERED',
      confidence: 96,
      details: 'Found 3 similar essays in database with 96% text similarity',
      agent: 'Memory Agent'
    },
    {
      rule: 'Email Age Verification',
      result: 'TRIGGERED',
      confidence: 88,
      details: 'Email account created 5 days ago, below 30-day threshold',
      agent: 'Verification Agent'
    },
    {
      rule: 'Rapid Submission Pattern',
      result: 'TRIGGERED',
      confidence: 78,
      details: 'Application submitted within 2 minutes of account creation',
      agent: 'Behavior Agent'
    }
  ];

  const memoryLog = [
    {
      timestamp: '2024-01-15T10:25:00Z',
      agent: 'Memory Agent',
      action: 'Cross-referenced essay content against fraud database',
      result: 'Match found: 3 similar essays from 2023'
    },
    {
      timestamp: '2024-01-15T10:26:00Z',
      agent: 'Explainer Agent',
      action: 'Generated risk explanation based on similarity patterns',
      result: 'High confidence fraud detection (96% similarity)'
    },
    {
      timestamp: '2024-01-15T10:27:00Z',
      agent: 'Decision Agent',
      action: 'Evaluated all evidence and made escalation decision',
      result: 'Recommended for immediate human review'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 lg:p-4">
      <div className={`border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200 shadow-xl'
      } lg:rounded-xl rounded-none h-full lg:h-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 lg:p-6 border-b sticky top-0 z-10 ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`text-lg lg:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Case Details
          </h2>
          <div className="flex items-center gap-2">
            {/* Request Call / Transcript */}
            {transcriptAvailable ? (
              <button
                onClick={() => setShowTranscript(v => !v)}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="View Transcript"
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
                title="Request Call"
              >
                <Phone className="w-4 h-4" />
                Request Call
              </button>
            )}

            {/* Scroll to Request Docs */}
            <button
              onClick={() => docsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                isDark ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              title="Request Documents"
            >
              <Mail className="w-4 h-4" />
              Request Docs
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-6 pb-20 lg:pb-6">
          {/* Student Info */}
          <div className={`border rounded-lg p-4 ${
            isDark 
              ? 'bg-gray-900/50 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>
              <User className="w-5 h-5" />
              <span>Student Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={fraudCase.avatar} 
                  alt={fraudCase.name}
                  className={`w-16 h-16 rounded-full object-cover border-2 ${
                    isDark ? 'border-gray-600' : 'border-gray-300'
                  }`}
                />
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {fraudCase.name}
                  </h4>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{fraudCase.email}</p>
                  <p className={`font-mono text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {fraudCase.studentId}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Risk Score:</span>
                  <span className="text-red-500 font-bold">{fraudCase.riskScore || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Stage:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{fraudCase.stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Previous Flags:</span>
                  <span className="text-yellow-500">{previousFlags}</span>
                </div>
              </div>
            </div>

            {/* Flag Chips */}
            {(fraudCase.flags && fraudCase.flags.length > 0) && (
              <div className="mt-4">
                <div className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Flags</div>
                <div className="flex flex-wrap gap-2">
                  {fraudCase.flags.map((f, i) => (
                    <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs ${
                      f.toLowerCase().includes('essay')
                        ? (isDark ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200')
                        : f.toLowerCase().includes('email')
                        ? (isDark ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200')
                        : (isDark ? 'bg-orange-500/10 text-orange-300 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200')
                    }`}>
                      <Flag className="w-3 h-3" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline View (full) */}
          <div ref={timelineRef} className={`border rounded-lg p-4 ${
            isDark 
              ? 'bg-gray-900/50 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>
              <Activity className="w-5 h-5" />
              <span>Full Case Timeline</span>
            </h3>
            {/* Horizontal (desktop) */}
            <div className="hidden lg:block overflow-x-auto pb-4">
              <div className="min-w-max flex items-stretch gap-6 px-2">
                {timelineEvents.map((e, idx) => (
                  <div key={e.id} className="flex items-center gap-6">
                    <div className={`flex flex-col items-center w-48 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 ${
                        e.color === 'green' ? 'ring-green-500 bg-green-500/20 text-green-500' : e.color === 'orange' ? 'ring-orange-500 bg-orange-500/20 text-orange-500' : 'ring-red-500 bg-red-500/20 text-red-500'
                      }`}>
                        {e.title.includes('Agent') ? <Brain className="w-5 h-5" /> : e.title.includes('Escalation') ? <ShieldAlert className="w-5 h-5" /> : e.title.includes('Financial') ? <FileText className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="font-medium text-sm">{e.title}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(e.timestamp).toLocaleString()}</p>
                        <div className="mt-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full border ${
                            e.color === 'green' ? 'text-green-600 border-green-300' : e.color === 'orange' ? 'text-orange-600 border-orange-300' : 'text-red-600 border-red-300'
                          }`}>Risk: {e.risk}</span>
                        </div>
                        {e.rules.length > 0 && (
                          <div className="mt-2 flex flex-wrap justify-center gap-1">
                            {e.rules.map((r, i) => (
                              <span key={i} className={`px-2 py-0.5 rounded-full text-[11px] border ${
                                isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                              }`}>{r}</span>
                            ))}
                          </div>
                        )}
                        {e.note && (
                          <div className={`mt-2 text-[11px] ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{e.note}</div>
                        )}
                      </div>
                    </div>
                    {idx < timelineEvents.length - 1 && (
                      <div className={`h-1 w-16 self-center ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Vertical (mobile) */}
            <div className="lg:hidden space-y-4">
              {timelineEvents.map((e) => (
                <div key={e.id} className={`flex items-start gap-3 p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`mt-1 w-3 h-3 rounded-full ${e.color === 'green' ? 'bg-green-500' : e.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{e.title}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(e.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {e.rules.map((r, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded-full text-[11px] border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>{r}</span>
                      ))}
                    </div>
                    {e.note && <div className={`mt-1 text-[11px] ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{e.note}</div>}
                    <div className="mt-1 text-[11px]">
                      <span className={`px-2 py-0.5 rounded-full border ${e.color === 'green' ? 'text-green-600 border-green-300' : e.color === 'orange' ? 'text-orange-600 border-orange-300' : 'text-red-600 border-red-300'}`}>Risk: {e.risk}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rule Traces */}
          <div className={`border rounded-lg p-4 ${
            isDark 
              ? 'bg-gray-900/50 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
              <span>Rule Trace Analysis</span>
            </h3>
            <div className="space-y-3">
              {ruleTraces.map((trace, index) => (
                <div key={index} className={`border rounded-lg p-3 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {trace.rule}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {trace.agent}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trace.result === 'TRIGGERED' 
                          ? isDark 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-red-100 text-red-700'
                          : isDark
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {trace.result}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {trace.details}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Confidence:
                    </span>
                    <div className={`flex-1 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${trace.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-red-500">{trace.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Reasoning (enhanced) */}
          <div className={`border rounded-lg p-4 ${
            isDark 
              ? 'bg-gray-900/50 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>
              <Shield className="w-5 h-5" />
              <span>AI Reasoning</span>
            </h3>
            <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="relative">
                {/* Neural wave */}
                {isGenerating && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#7100EB] to-transparent animate-pulse" />
                )}
                <div className={`flex items-start gap-3 ${isGenerating ? 'animate-pulse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <Brain className={`${isDark ? 'text-purple-400' : 'text-purple-600'} w-4 h-4`} />
                  </div>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {caseSummary}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat-style Agent Log */}
          <div className={`border rounded-lg p-4 ${
            isDark 
              ? 'bg-gray-900/50 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>
              <MessageSquare className="w-5 h-5" />
              <span>AI Agent Discussion</span>
            </h3>
            <div className="space-y-3">
              {memoryLog.map((log, index) => (
                <div key={index} className={`max-w-[80%] ${index % 2 === 0 ? '' : 'ml-auto'}`}>
                  <div className={`p-3 rounded-2xl border ${
                    isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>{log.agent}</span>
                      <span className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm">{log.action}</div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{log.result}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Documents Section (add ref) */}
          <div ref={docsRef} className={`border rounded-lg p-4 ${
            isDark 
              ? 'bg-gray-900/50 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>
              <Mail className="w-5 h-5" />
              <span>Request Documents</span>
            </h3>
            
            <div className={`border rounded-lg p-4 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Pre-filled Email Template */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Recipient
                  </label>
                  <input 
                    type="text"
                    value={fraudCase.email}
                    disabled
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-900 border-gray-700 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Subject
                  </label>
                  <input 
                    type="text"
                    defaultValue={`Additional Documentation Needed - Application ${fraudCase.studentId}`}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-900 border-gray-700 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Documents Required
                  </label>
                  <div className={`p-2 border rounded-md grid grid-cols-2 gap-2 ${
                    isDark 
                      ? 'bg-gray-900 border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-[#7100EB]" defaultChecked />
                      <span className="text-sm">ID Proof</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-[#7100EB]" defaultChecked />
                      <span className="text-sm">Bank Statements</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-[#7100EB]" />
                      <span className="text-sm">Address Proof</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-[#7100EB]" />
                      <span className="text-sm">Income Verification</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Message
                  </label>
                  <textarea
                    rows={5}
                    defaultValue={`Dear ${fraudCase.name},\n\nThank you for your application. To proceed with your review, we require additional documentation for verification purposes. Please provide the requested documents within 7 days.\n\nRegards,\nFraud Prevention Team`}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-900 border-gray-700 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-700'
                    }`}
                  ></textarea>
                </div>
                
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      // Email modal functionality removed for now
                      console.log('Request additional documents');
                    }}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all min-h-[44px] ${
                      isDark 
                        ? 'bg-[#7100EB] hover:bg-[#7100EB]/80 text-white' 
                        : 'bg-[#7100EB] hover:bg-[#7100EB]/80 text-white'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Request</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Drawer */}
          {transcriptAvailable && showTranscript && (
            <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                <FileAudio className="w-5 h-5" /> Call Transcript
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Agent:</span> Hello, this is the admissions team. We need to verify your documents.
                </div>
                <div>
                  <span className="font-medium">Applicant:</span> Sure, I can provide them today.
                </div>
                <div>
                  <span className="font-medium">Agent:</span> Thank you. Sending the checklist via email.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Case Actions */}
        <div className={`border rounded-lg p-4 ${
          isDark 
            ? 'bg-gray-900/50 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        } mb-16 lg:mb-0`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
            isDark ? 'text-purple-400' : 'text-purple-600'
          }`}>
            <Shield className="w-5 h-5" />
            <span>Case Actions</span>
          </h3>
          
          <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
            <button className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 border rounded-lg transition-all ${
              isDark 
                ? 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30' 
                : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
            }`}>
              <span>✅ Approve</span>
            </button>
            
            <button className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 border rounded-lg transition-all ${
              isDark 
                ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30' 
                : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
            }`}>
              <span>❌ Reject</span>
            </button>
            
            <button className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 border rounded-lg transition-all ${
              isDark 
                ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
            }`}>
              <span>🚨 Escalate</span>
            </button>
          </div>
          
          <div className="mt-4">
            <textarea
              placeholder="Leave comments or feedback about this case..."
              className={`w-full px-3 py-2 border rounded-md ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' 
                  : 'bg-white border-gray-300 text-gray-700 placeholder:text-gray-400'
              }`}
              rows={3}
            ></textarea>
          </div>
        </div>
        
        {/* Sticky Footer Actions - Mobile */}
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700 bg-opacity-90 backdrop-blur-sm' 
            : 'bg-white border-gray-200 bg-opacity-90 backdrop-blur-sm'
        }`}>
          <div className="flex space-x-3">
            <button className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg transition-all ${
              isDark 
                ? 'bg-[#7100EB] hover:bg-[#7100EB]/80 text-white' 
                : 'bg-[#7100EB] hover:bg-[#7100EB]/80 text-white'
            }`}>
              <span>Complete Review</span>
            </button>
          </div>
        </div>

        {/* Email Request Modal - Removed for now */}
      </div>
    </div>
  );
};

export default CaseDetailModal;