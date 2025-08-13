import React, { useState, useEffect, useMemo } from 'react';
import { X, User, FileText, Star, CreditCard, Building, Users, Send, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';


interface DocumentRequestData {
  documents: string[];
  message: string;
  urgency: number;
  dueDate: string;
  tone: 'formal' | 'friendly' | 'urgent';
  language: string;
}

interface DocumentRequestWizardProps {
  isOpen: boolean;
  onClose: () => void;
  applicantName: string;
  studentId: string;
  program: string;
  riskScore: number;
  onSend: (requestData: DocumentRequestData) => void;
}

const DocumentRequestWizard: React.FC<DocumentRequestWizardProps> = ({
  isOpen,
  onClose,
  applicantName,
  studentId,
  program,
  riskScore,
  onSend
}) => {
  const { isDark } = useTheme();
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Document types with icons and descriptions
  const documentTypes = useMemo(() => [
    {
      id: 'id_proof',
      name: 'Government ID',
      icon: <User className="w-6 h-6" />,
      description: 'Valid government-issued photo identification',
      category: 'identity',
      required: true
    },
    {
      id: 'passport',
      name: 'Passport',
      icon: <FileText className="w-6 h-6" />,
      description: 'Current passport for international students',
      category: 'identity'
    },
    {
      id: 'transcript',
      name: 'Official Transcript',
      icon: <FileText className="w-6 h-6" />,
      description: 'Sealed academic transcript from previous institution',
      category: 'academic',
      required: true
    },
    {
      id: 'diploma',
      name: 'Degree Certificate',
      icon: <Star className="w-6 h-6" />,
      description: 'Original or certified copy of degree certificate',
      category: 'academic'
    },
    {
      id: 'bank_statement',
      name: 'Bank Statements',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Last 3 months of bank statements',
      category: 'financial'
    },
    {
      id: 'income_proof',
      name: 'Income Verification',
      icon: <Building className="w-6 h-6" />,
      description: 'Pay stubs, tax returns, or employment letter',
      category: 'financial'
    },
    {
      id: 'address_proof',
      name: 'Address Proof',
      icon: <Building className="w-6 h-6" />,
      description: 'Utility bill or lease agreement',
      category: 'identity'
    },
    {
      id: 'sponsor_letter',
      name: 'Sponsorship Letter',
      icon: <Users className="w-6 h-6" />,
      description: 'Financial sponsorship documentation',
      category: 'financial'
    }
  ], []);

  // Initialize default due date (7 days from now)
  useEffect(() => {
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  // Auto-select required documents based on risk score
  useEffect(() => {
    if (riskScore >= 80) {
      setSelectedDocuments(['id_proof', 'transcript', 'bank_statement']);
    } else if (riskScore >= 60) {
      setSelectedDocuments(['id_proof', 'transcript']);
    } else {
      setSelectedDocuments(['id_proof']);
    }
  }, [riskScore]);

  useEffect(() => {
    const defaultMessage = `Dear ${applicantName},

As part of our review process for your application to the ${program} program (ID: ${studentId}), we require some additional documentation.

Please provide the following documents by ${new Date(dueDate).toLocaleDateString()}:
${selectedDocuments.map(docId => {
  const doc = documentTypes.find(d => d.id === docId);
  return `• ${doc ? doc.name : ''}`;
}).join('\n')}

You can submit these documents through our secure portal.

Best regards,
Admissions Review Team`;
    setCustomMessage(defaultMessage);
  }, [selectedDocuments, applicantName, program, studentId, dueDate, documentTypes]);

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSend = () => {
    const requestData = {
      documents: selectedDocuments,
      message: customMessage,
      urgency: 3, // Default urgency
      dueDate,
      tone: 'formal' as const,
      language: 'en',
    };
    onSend(requestData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] rounded-xl border overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className={`border-b px-6 py-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Request Additional Documents
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                To: {applicantName} ({studentId})
              </p>
            </div>
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

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Document Selection */}
          <div className="md:col-span-1 space-y-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Documents
            </h3>
            <div className="space-y-2">
              {documentTypes.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => handleDocumentToggle(doc.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center space-x-3 ${
                    selectedDocuments.includes(doc.id)
                      ? 'border-blue-500 bg-blue-500/10'
                      : isDark
                      ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`flex-shrink-0 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{doc.icon}</div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{doc.name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{doc.description}</p>
                  </div>
                  {selectedDocuments.includes(doc.id) && (
                    <CheckCircle className="w-5 h-5 text-blue-500 ml-auto flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Email Composition */}
          <div className="md:col-span-2 space-y-4 flex flex-col">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Message
            </h3>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Response Deadline
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`p-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Content
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className={`w-full flex-1 p-3 border rounded-lg resize-none ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Type your message here..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`border-t px-6 py-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex justify-end">
            <button
              onClick={handleSend}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Send Request</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentRequestWizard;
