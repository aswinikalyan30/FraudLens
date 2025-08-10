import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  CreditCard, 
  User, 
  Building, 
  Clock, 
  Star, 
  Send,
  ArrowRight,
  ArrowLeft,
  Bold,
  Italic,
  List,
  Users,
  Heart
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DocumentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'identity' | 'academic' | 'financial';
  required?: boolean;
}

interface MessageTemplate {
  id: string;
  name: string;
  category: 'identity' | 'academic' | 'financial' | 'general';
  content: string;
  tone: 'formal' | 'friendly' | 'urgent';
  successRate: number;
  lastUsed?: string;
  isFavorite?: boolean;
}

interface DocumentRequestData {
  documents: string[];
  message: string;
  urgency: number;
  dueDate: string;
  tone: 'formal' | 'friendly' | 'urgent';
  language: string;
  template?: string;
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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [urgency, setUrgency] = useState(2); // 1-5 scale
  const [dueDate, setDueDate] = useState('');
  const [tone, setTone] = useState<'formal' | 'friendly' | 'urgent'>('formal');
  const [language, setLanguage] = useState('en');
  const [activeCategory, setActiveCategory] = useState<'all' | 'identity' | 'academic' | 'financial' | 'recent' | 'favorites'>('all');

  // Document types with icons and descriptions
  const documentTypes: DocumentType[] = [
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
  ];

  // Message templates organized by category
  const messageTemplates: MessageTemplate[] = [
    {
      id: 'identity_standard',
      name: 'Identity Verification - Standard',
      category: 'identity',
      content: `Dear {{applicant_name}},

As part of our standard verification process for your application to the {{program}} program, we need to verify your identity with additional documentation.

Please submit the following documents by {{deadline}}:
• Government-issued photo ID (driver's license, passport, or state ID)
• Proof of address (utility bill or bank statement from last 30 days)

You can submit these documents through our secure portal or email them directly to admissions@university.edu.

Best regards,
Admissions Review Team`,
      tone: 'formal',
      successRate: 92,
      isFavorite: true
    },
    {
      id: 'academic_fraud',
      name: 'Academic Verification - High Priority',
      category: 'academic',
      content: `Dear {{applicant_name}},

We are conducting additional verification of your academic credentials for your {{program}} application (ID: {{student_id}}).

URGENT: Please provide the following within 3 business days:
• Official sealed transcript directly from your previous institution
• Degree certificate (original or certified copy)
• Academic verification letter from registrar

Failure to provide these documents may result in application withdrawal.

Admissions Security Team`,
      tone: 'urgent',
      successRate: 87,
      lastUsed: '2024-08-08'
    },
    {
      id: 'financial_verification',
      name: 'Financial Documentation Request',
      category: 'financial',
      content: `Hi {{applicant_name}},

Thank you for your interest in our {{program}} program! To complete your financial aid evaluation, we need a few more documents.

Could you please send us:
• Bank statements from the last 3 months
• Income verification (pay stubs or tax returns)
• Sponsorship letter (if applicable)

We're here to help if you have any questions about these requirements. Please submit by {{deadline}} to avoid delays.

Best,
Financial Aid Office`,
      tone: 'friendly',
      successRate: 94,
      isFavorite: true,
      lastUsed: '2024-08-09'
    },
    {
      id: 'comprehensive_review',
      name: 'Comprehensive Document Review',
      category: 'general',
      content: `Dear {{applicant_name}},

Your application for the {{program}} program is under comprehensive review. To ensure accuracy and completeness, we require additional documentation.

Required documents (due by {{deadline}}):
• Government-issued photo identification
• Official academic transcripts (sealed)
• Financial documentation (bank statements, income proof)
• Address verification

This is a standard part of our thorough review process. Please submit all documents through our secure portal.

Sincerely,
Admissions Review Committee`,
      tone: 'formal',
      successRate: 89
    }
  ];

  // Languages available
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' }
  ];

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
      setUrgency(4);
    } else if (riskScore >= 60) {
      setSelectedDocuments(['id_proof', 'transcript']);
      setUrgency(3);
    } else {
      setSelectedDocuments(['id_proof']);
      setUrgency(2);
    }
  }, [riskScore]);

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setTone(template.tone);
    
    // Replace merge fields
    const processedContent = template.content
      .replace(/{{applicant_name}}/g, applicantName)
      .replace(/{{student_id}}/g, studentId)
      .replace(/{{program}}/g, program)
      .replace(/{{deadline}}/g, new Date(dueDate).toLocaleDateString());
    
    setCustomMessage(processedContent);
  };

  const getUrgencyLabel = (level: number) => {
    const labels = ['Low', 'Normal', 'Standard', 'High', 'Critical'];
    return labels[level - 1] || 'Standard';
  };

  const getUrgencyColor = (level: number) => {
    if (level <= 2) return 'text-green-500';
    if (level === 3) return 'text-blue-500';
    if (level === 4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const filteredTemplates = messageTemplates.filter(template => {
    switch (activeCategory) {
      case 'recent':
        return template.lastUsed;
      case 'favorites':
        return template.isFavorite;
      case 'all':
        return true;
      default:
        return template.category === activeCategory;
    }
  });

  const filteredDocuments = documentTypes.filter(doc => 
    activeCategory === 'all' || doc.category === activeCategory
  );

  const handleSend = () => {
    const requestData = {
      documents: selectedDocuments,
      message: customMessage,
      urgency,
      dueDate,
      tone,
      language,
      template: selectedTemplate?.id
    };
    onSend(requestData);
    onClose();
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] rounded-xl border overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-2xl`}>
        {/* Header */}
        <div className={`border-b px-6 py-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Document Request Wizard
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Request additional documents from {applicantName}
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
          
          {/* Progress Steps */}
          <div className="flex items-center mt-4 space-x-2">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep 
                    ? 'bg-purple-700 text-white'
                    : step < currentStep 
                    ? 'bg-green-500 text-white'
                    : isDark 
                    ? 'bg-gray-700 text-gray-400' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Step 1: Document Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Select Required Documents
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose which documents to request based on verification needs
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'identity', 'academic', 'financial'] as const).map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-purple-700 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* Document Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => handleDocumentToggle(doc.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedDocuments.includes(doc.id)
                        ? 'border-purple-100 dark:bg-purple-900/20'
                        : isDark
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-650 hover:border-gray-500'
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedDocuments.includes(doc.id)
                          ? 'text-purple-600 dark:bg-purple-800 dark:text-purple-300'
                          : isDark
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {doc.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {doc.name}
                          </h4>
                          {doc.required && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {doc.description}
                        </p>
                      </div>
                      {selectedDocuments.includes(doc.id) && (
                        <div className="text-purple-600 dark:text-purple-400">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Selected: {selectedDocuments.length} documents
              </div>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Choose Message Template
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select from pre-approved templates or start with a blank message
                </p>
              </div>

              {/* Template Categories */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'recent', 'favorites', 'identity', 'academic', 'financial'] as const).map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                      activeCategory === category
                        ? 'bg-purple-50 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'recent' && <Clock className="w-3 h-3" />}
                    {category === 'favorites' && <Heart className="w-3 h-3" />}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-purple-100 bg-purple-50 dark:bg-purple-900/20'
                        : isDark
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-650'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {template.name}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {template.isFavorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          template.successRate >= 90
                            ? 'bg-green-100 text-green-700'
                            : template.successRate >= 80
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {template.successRate}% success
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        template.tone === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : template.tone === 'friendly'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {template.tone}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {template.category}
                      </span>
                      {template.lastUsed && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Used: {template.lastUsed}
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm line-clamp-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {template.content.substring(0, 150)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Message Customization */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Customize Your Message
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Personalize the message content, tone, and formatting
                </p>
              </div>

              {/* Message Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tone Selector */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Communication Tone
                  </label>
                  <div className="space-y-2">
                    {(['formal', 'friendly', 'urgent'] as const).map(toneOption => (
                      <button
                        key={toneOption}
                        onClick={() => setTone(toneOption)}
                        className={`w-full p-2 rounded-lg border text-left transition-colors ${
                          tone === toneOption
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : isDark
                            ? 'border-gray-600 bg-gray-700 hover:bg-gray-650'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {toneOption === 'formal' && 'Professional and official'}
                          {toneOption === 'friendly' && 'Warm and approachable'}
                          {toneOption === 'urgent' && 'Direct and time-sensitive'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`w-full p-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Urgency Level */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority Level
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={urgency}
                      onChange={(e) => setUrgency(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs">
                      <span className={getUrgencyColor(urgency)}>
                        {getUrgencyLabel(urgency)}
                      </span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Level {urgency}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Due Date */}
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
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message Content
                </label>
                
                {/* Formatting Toolbar */}
                <div className={`border-b p-2 flex items-center space-x-2 ${
                  isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                }`}>
                  <button className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                    <Bold className="w-4 h-4" />
                  </button>
                  <button className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                    <Italic className="w-4 h-4" />
                  </button>
                  <button className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                    <List className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-gray-300" />
                  <select className={`text-xs p-1 rounded border-0 ${
                    isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                  }`}>
                    <option>Insert Field</option>
                    <option>{'{{applicant_name}}'}</option>
                    <option>{'{{student_id}}'}</option>
                    <option>{'{{program}}'}</option>
                    <option>{'{{deadline}}'}</option>
                  </select>
                </div>

                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={12}
                  className={`w-full p-3 border-0 resize-none ${
                    isDark
                      ? 'bg-gray-700 text-white placeholder-gray-400'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  } focus:ring-0 focus:outline-none`}
                  placeholder="Type your message here..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Send */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Review & Send Request
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Review your document request before sending
                </p>
              </div>

              {/* Summary */}
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Request Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Documents: 
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {selectedDocuments.length} selected
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Priority: 
                    </span>
                    <span className={getUrgencyColor(urgency)}>
                      {getUrgencyLabel(urgency)}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Due Date: 
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {new Date(dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Language: 
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {languages.find(l => l.code === language)?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Preview */}
              <div className={`border rounded-lg ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className={`p-3 border-b ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Message Preview
                  </h4>
                </div>
                <div className="p-4">
                  <pre className={`whitespace-pre-wrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {customMessage}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t px-6 py-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                currentStep === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : isDark
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && selectedDocuments.length === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 1 && selectedDocuments.length === 0
                    ? 'opacity-50 cursor-not-allowed bg-gray-300'
                    : 'bg-purple-800 text-white hover:bg-purple-700'
                }`}
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send Request</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentRequestWizard;
