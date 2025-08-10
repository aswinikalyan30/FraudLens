import React, { useState } from 'react';
import { ZoomIn, ZoomOut, PlusCircle, User, Bot, Mail, Phone, FileText, AlertTriangle, Eye, MessageSquare, Crown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
// import { useTheme } from '../../contexts/ThemeContext';
import CollapsibleSection from './CollapsibleSection';

interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  risk: number;
  rules: string[];
  color: string; // green | orange | red | blue | purple | gray
  note?: string;
  type: 'investigator' | 'system' | 'communication' | 'evidence' | 'review' | 'override';
  investigator?: {
    id: string;
    name: string;
    role: string;
    action: string;
    conclusion?: string;
    duration?: string;
  };
  system?: {
    component: string;
    action: string;
    result: string;
    confidence?: number;
  };
  communication?: {
    type: 'email' | 'phone' | 'sms' | 'chat';
    direction: 'inbound' | 'outbound';
    recipient: string;
    subject?: string;
    status: 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  };
  evidence?: {
    type: 'document' | 'verification' | 'additional_info';
    requested: string[];
    received: string[];
    missing: string[];
    quality: 'high' | 'medium' | 'low';
  };
  review?: {
    previousReviewer: string;
    previousConclusion: string;
    currentReviewer: string;
    currentConclusion: string;
    disagreement: boolean;
    escalated: boolean;
  };
  override?: {
    originalDecision: string;
    newDecision: string;
    authorizedBy: string;
    reason: string;
    authority: string;
  };
}

interface TimelineProps {
  events: TimelineEvent[];
  isDark: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ events, isDark }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'investigator' | 'system' | 'communication' | 'evidence' | 'review' | 'override'>('all');
  const [zoom, setZoom] = useState(1);
  const [manualNotes, setManualNotes] = useState<Record<string, string[]>>({});
  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Sample comprehensive timeline data (this would come from props in real implementation)
  const comprehensiveEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Case Assigned to Investigator',
      timestamp: '2024-01-15T09:00:00Z',
      risk: 0,
      rules: [],
      color: 'blue',
      type: 'investigator',
      investigator: {
        id: 'INV001',
        name: 'Sarah Chen',
        role: 'Senior Fraud Analyst',
        action: 'Case Assignment',
        duration: '0 minutes'
      }
    },
    {
      id: '2',
      title: 'AI Risk Model Updated',
      timestamp: '2024-01-15T09:05:00Z',
      risk: 85,
      rules: ['ESSAY_SIMILARITY', 'EMAIL_AGE'],
      color: 'purple',
      type: 'system',
      system: {
        component: 'ML Risk Engine v2.3',
        action: 'Risk Score Calculation',
        result: 'High Risk Detected',
        confidence: 92
      }
    },
    {
      id: '3',
      title: 'Additional Documents Requested',
      timestamp: '2024-01-15T09:15:00Z',
      risk: 85,
      rules: [],
      color: 'orange',
      type: 'evidence',
      evidence: {
        type: 'document',
        requested: ['Government ID', 'Proof of Address', 'Bank Statement'],
        received: [],
        missing: ['Government ID', 'Proof of Address', 'Bank Statement'],
        quality: 'high'
      }
    },
    {
      id: '4',
      title: 'Email Sent to Applicant',
      timestamp: '2024-01-15T09:20:00Z',
      risk: 85,
      rules: [],
      color: 'blue',
      type: 'communication',
      communication: {
        type: 'email',
        direction: 'outbound',
        recipient: 'john.doe@email.com',
        subject: 'Additional Documentation Required',
        status: 'delivered'
      }
    },
    {
      id: '5',
      title: 'Phone Verification Attempted',
      timestamp: '2024-01-15T10:30:00Z',
      risk: 85,
      rules: [],
      color: 'blue',
      type: 'communication',
      communication: {
        type: 'phone',
        direction: 'outbound',
        recipient: '+1-555-0123',
        status: 'failed'
      }
    },
    {
      id: '6',
      title: 'Case Escalated for Second Review',
      timestamp: '2024-01-15T11:00:00Z',
      risk: 85,
      rules: [],
      color: 'yellow',
      type: 'review',
      review: {
        previousReviewer: 'Sarah Chen',
        previousConclusion: 'Requires Additional Verification',
        currentReviewer: 'Mike Rodriguez',
        currentConclusion: 'Pending Review',
        disagreement: false,
        escalated: true
      }
    },
    {
      id: '7',
      title: 'Documents Received',
      timestamp: '2024-01-15T14:30:00Z',
      risk: 65,
      rules: [],
      color: 'green',
      type: 'evidence',
      evidence: {
        type: 'document',
        requested: ['Government ID', 'Proof of Address', 'Bank Statement'],
        received: ['Government ID', 'Bank Statement'],
        missing: ['Proof of Address'],
        quality: 'medium'
      }
    },
    {
      id: '8',
      title: 'Reviewer Disagreement Logged',
      timestamp: '2024-01-15T15:45:00Z',
      risk: 65,
      rules: [],
      color: 'red',
      type: 'review',
      review: {
        previousReviewer: 'Sarah Chen',
        previousConclusion: 'High Risk - Recommend Rejection',
        currentReviewer: 'Mike Rodriguez',
        currentConclusion: 'Medium Risk - Request More Info',
        disagreement: true,
        escalated: true
      }
    },
    {
      id: '9',
      title: 'Supervisor Override Applied',
      timestamp: '2024-01-15T16:00:00Z',
      risk: 45,
      rules: [],
      color: 'purple',
      type: 'override',
      override: {
        originalDecision: 'Rejection Recommended',
        newDecision: 'Approved with Conditions',
        authorizedBy: 'Jennifer Walsh',
        reason: 'Additional context provided by applicant',
        authority: 'Regional Supervisor'
      }
    }
  ];

  const allEvents = [...(events || []), ...comprehensiveEvents].filter(e => e && e.type && e.id);
  const filtered = filter === 'all' ? allEvents : allEvents.filter(e => e.type === filter);

  const getEventIcon = (event: TimelineEvent) => {
    if (!event || !event.type) return <Clock className="w-4 h-4 text-white" />;
    
    switch (event.type) {
      case 'investigator':
        return <User className="w-4 h-4 text-white" />;
      case 'system':
        return <Bot className="w-4 h-4 text-white" />;
      case 'communication':
        return event.communication?.type === 'email' ? <Mail className="w-4 h-4 text-white" /> :
               event.communication?.type === 'phone' ? <Phone className="w-4 h-4 text-white" /> :
               <MessageSquare className="w-4 h-4 text-white" />;
      case 'evidence':
        return <FileText className="w-4 h-4 text-white" />;
      case 'review':
        return event.review?.disagreement ? <AlertTriangle className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />;
      case 'override':
        return <Crown className="w-4 h-4 text-white" />;
      default:
        return <Clock className="w-4 h-4 text-white" />;
    }
  };

  const getEventColor = (color: string) => {
    if (!color) return 'bg-gray-500 border-gray-200';
    
    switch (color) {
      case 'green': return 'bg-green-500 border-green-200';
      case 'orange': return 'bg-orange-500 border-orange-200';
      case 'red': return 'bg-red-500 border-red-200';
      case 'blue': return 'bg-blue-500 border-blue-200';
      case 'purple': return 'bg-purple-500 border-purple-200';
      case 'yellow': return 'bg-yellow-500 border-yellow-200';
      default: return 'bg-gray-500 border-gray-200';
    }
  };

  const handleAddNote = (id: string) => {
    if (!noteText.trim()) return;
    setManualNotes(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), noteText.trim()]
    }));
    setNoteText('');
    setAddingNoteFor(null);
  };

  return (
    <CollapsibleSection
      title="Comprehensive Timeline"
      defaultOpen
      rightAdornment={
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as 'all' | 'investigator' | 'system' | 'communication' | 'evidence' | 'review' | 'override')}
            className={`text-xs rounded-md border px-2 py-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`}
            aria-label="Filter timeline"
          >
            <option value="all">All Events</option>
            <option value="investigator">Investigator Actions</option>
            <option value="system">System Events</option>
            <option value="communication">Communications</option>
            <option value="evidence">Evidence Collection</option>
            <option value="review">Reviews</option>
            <option value="override">Overrides</option>
          </select>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className={`p-1 rounded border ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(2, z + 0.25))}
              className={`p-1 rounded border ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>
      }
    >
      <div style={{ fontSize: `${zoom * 0.85}rem` }} className="space-y-4 relative">
        <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
        {filtered.map((e) => {
          // Ensure event has required properties
          if (!e || !e.id || !e.title) return null;
          
          return (
          <div
            key={e.id}
            className={`relative flex items-start gap-4 transition-all duration-200`}
          >
            <div
              className={`relative z-10 w-8 h-8 rounded-full border-3 flex items-center justify-center cursor-pointer ${getEventColor(e.color)}`}
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
            >
              {getEventIcon(e)}
              {(e.type === 'review' && e.review?.disagreement) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className={`flex-1 p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{e.title || 'Unknown Event'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      e.type === 'investigator' 
                        ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                        : e.type === 'system'
                        ? isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                        : e.type === 'communication'
                        ? isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                        : e.type === 'evidence'
                        ? isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                        : e.type === 'review'
                        ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                        : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                    }`}>
                      {e.type?.replace('_', ' ') || 'unknown'}
                    </span>
                    {e.risk > 0 && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                        e.risk >= 80
                          ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                          : e.risk >= 60
                          ? isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                          : isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                        Risk: {e.risk}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {e.timestamp ? new Date(e.timestamp).toLocaleString() : 'Unknown time'}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                      className={`text-[10px] px-2 py-0.5 rounded border ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700'}`}
                    >
                      {expanded === e.id ? 'Hide' : 'Details'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingNoteFor(e.id)}
                      className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${isDark ? 'bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/30 text-purple-300' : 'bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-700'}`}
                    >
                      <PlusCircle className="w-2.5 h-2.5" /> Note
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expanded === e.id && (
                <div className={`mt-3 p-3 rounded-lg border space-y-3 ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  
                  {/* Investigator Details */}
                  {e.investigator && (
                    <div className="space-y-2">
                      <h5 className={`font-medium text-xs ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Investigator Details</h5>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name:</span> {e.investigator.name}</div>
                        <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Role:</span> {e.investigator.role}</div>
                        <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Action:</span> {e.investigator.action}</div>
                        {e.investigator.duration && <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Duration:</span> {e.investigator.duration}</div>}
                        {e.investigator.conclusion && <div className="col-span-2"><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Conclusion:</span> {e.investigator.conclusion}</div>}
                      </div>
                    </div>
                  )}

                  {/* System Details */}
                  {e.system && (
                    <div className="space-y-2">
                      <h5 className={`font-medium text-xs ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>System Details</h5>
                      <div className="grid grid-cols-1 gap-1 text-[11px]">
                        <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Component:</span> {e.system.component}</div>
                        <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Action:</span> {e.system.action}</div>
                        <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Result:</span> {e.system.result}</div>
                        {e.system.confidence && (
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confidence:</span> 
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${e.system.confidence}%` }}></div>
                            </div>
                            <span className="text-[10px]">{e.system.confidence}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Communication Details */}
                  {e.communication && (
                    <div className="space-y-2">
                      <h5 className={`font-medium text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>Communication Details</h5>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type:</span> {e.communication.type.toUpperCase()}</div>
                        <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Direction:</span> {e.communication.direction}</div>
                        <div className="col-span-2"><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Recipient:</span> {e.communication.recipient}</div>
                        {e.communication.subject && <div className="col-span-2"><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Subject:</span> {e.communication.subject}</div>}
                        <div className="col-span-2 flex items-center gap-2">
                          <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status:</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            e.communication.status === 'sent' || e.communication.status === 'delivered' || e.communication.status === 'read'
                              ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                              : e.communication.status === 'replied'
                              ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                              : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                          }`}>
                            {e.communication.status === 'sent' && <CheckCircle className="w-2.5 h-2.5" />}
                            {e.communication.status === 'delivered' && <CheckCircle className="w-2.5 h-2.5" />}
                            {e.communication.status === 'read' && <Eye className="w-2.5 h-2.5" />}
                            {e.communication.status === 'replied' && <MessageSquare className="w-2.5 h-2.5" />}
                            {e.communication.status === 'failed' && <XCircle className="w-2.5 h-2.5" />}
                            {e.communication.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Evidence Details */}
                  {e.evidence && (
                    <div className="space-y-2">
                      <h5 className={`font-medium text-xs ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>Evidence Collection</h5>
                      <div className="space-y-2 text-[11px]">
                        <div>
                          <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type:</span> {e.evidence.type}
                        </div>
                        <div>
                          <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Quality:</span>
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            e.evidence.quality === 'high'
                              ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                              : e.evidence.quality === 'medium'
                              ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                              : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                          }`}>
                            {e.evidence.quality}
                          </span>
                        </div>
                        {e.evidence.requested.length > 0 && (
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Requested:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {e.evidence.requested.map((item, i) => (
                                <span key={i} className={`px-2 py-0.5 rounded text-[10px] ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{item}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {e.evidence.received.length > 0 && (
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Received:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {e.evidence.received.map((item, i) => (
                                <span key={i} className={`px-2 py-0.5 rounded text-[10px] ${isDark ? 'bg-green-600/30 text-green-300' : 'bg-green-200 text-green-700'}`}>{item}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {e.evidence.missing.length > 0 && (
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Missing:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {e.evidence.missing.map((item, i) => (
                                <span key={i} className={`px-2 py-0.5 rounded text-[10px] ${isDark ? 'bg-red-600/30 text-red-300' : 'bg-red-200 text-red-700'}`}>{item}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Review Details */}
                  {e.review && (
                    <div className="space-y-2">
                      <h5 className={`font-medium text-xs flex items-center gap-2 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Review Details
                        {e.review.disagreement && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      </h5>
                      <div className="space-y-2 text-[11px]">
                        <div className={`p-2 rounded border ${isDark ? 'bg-gray-600/30 border-gray-500' : 'bg-gray-100 border-gray-300'}`}>
                          <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Previous:</span> {e.review.previousReviewer}</div>
                          <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Conclusion:</span> {e.review.previousConclusion}</div>
                        </div>
                        <div className={`p-2 rounded border ${isDark ? 'bg-gray-600/30 border-gray-500' : 'bg-gray-100 border-gray-300'}`}>
                          <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Current:</span> {e.review.currentReviewer}</div>
                          <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Conclusion:</span> {e.review.currentConclusion}</div>
                        </div>
                        {e.review.disagreement && (
                          <div className={`p-2 rounded border border-red-500/30 ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700'}`}>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              <span className="font-medium">Disagreement Detected</span>
                            </div>
                            <div className="text-[10px] mt-1">Case escalated for senior review</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Override Details */}
                  {e.override && (
                    <div className="space-y-2">
                      <h5 className={`font-medium text-xs ${isDark ? 'text-red-400' : 'text-red-700'}`}>Supervisor Override</h5>
                      <div className="space-y-2 text-[11px]">
                        <div className={`p-2 rounded border ${isDark ? 'bg-red-600/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                          <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Original:</span> {e.override.originalDecision}</div>
                          <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>New Decision:</span> {e.override.newDecision}</div>
                          <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Authorized By:</span> {e.override.authorizedBy} ({e.override.authority})</div>
                          <div><span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reason:</span> {e.override.reason}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rules/Flags */}
                  {e.rules.length > 0 && (
                    <div className="space-y-1">
                      <h5 className={`font-medium text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Triggered Rules</h5>
                      <div className="flex flex-wrap gap-1">
                        {e.rules.map((r, i) => (
                          <span key={i} className={`text-[10px] px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{r}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Original Notes */}
                  {e.note && (
                    <div className="space-y-1">
                      <h5 className={`font-medium text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>System Notes</h5>
                      <p className={`text-xs italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{e.note}</p>
                    </div>
                  )}

                  {/* Manual Notes */}
                  {manualNotes[e.id]?.length && (
                    <div className="space-y-1">
                      <h5 className={`font-medium text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manual Notes</h5>
                      <div className="space-y-1">
                        {manualNotes[e.id].map((n, i) => (
                          <p key={i} className={`text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>• {n}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Add Note Interface */}
              {addingNoteFor === e.id && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    className={`flex-1 text-xs rounded border px-2 py-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'}`}
                    placeholder="Add investigator note..."
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleAddNote(e.id)}
                    disabled={!noteText.trim()}
                    className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                      noteText.trim() 
                        ? isDark ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-purple-600 text-white hover:bg-purple-700'
                        : isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingNoteFor(null)}
                    className={`text-xs px-3 py-1 rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          );
        }).filter(Boolean)}
      </div>
    </CollapsibleSection>
  );
};

export default Timeline;
