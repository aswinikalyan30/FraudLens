import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Send } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DecisionDocumentationModalProps {
  case: {
    id: string;
    studentId: string;
    name: string;
    riskScore: number;
  };
  onClose: () => void;
  onSubmit: (decision: DecisionData) => void;
}

export interface DecisionData {
  resolution: 'false-positive' | 'valid-fraud';
  reasoning: string;
  confidence: number;
}

const DecisionDocumentationModal: React.FC<DecisionDocumentationModalProps> = ({ 
  case: fraudCase, 
  onClose, 
  onSubmit 
}) => {
  const { isDark } = useTheme();
  const [resolution, setResolution] = useState<'false-positive' | 'valid-fraud' | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!resolution) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const decisionData: DecisionData = {
      resolution,
      reasoning,
      confidence
    };
    
    setShowSuccess(true);
    
    // Show success animation then close
    setTimeout(() => {
      onSubmit(decisionData);
      onClose();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`border rounded-xl p-8 text-center max-w-md w-full ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-xl'
        }`}>
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-green-500" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
              <path 
                d="M15 25 L22 32 L35 18" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="checkmark-draw"
              />
            </svg>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Decision Recorded
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your feedback has been saved and will improve our AI models.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200 shadow-xl'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Decision Documentation
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Case: {fraudCase.studentId} - {fraudCase.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Resolution Selection */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Final Determination
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setResolution('false-positive')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  resolution === 'false-positive'
                    ? 'border-green-500 bg-green-500/10'
                    : isDark
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className={`w-6 h-6 ${
                    resolution === 'false-positive' ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <div className="text-left">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      False Positive
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Legitimate application
                    </div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setResolution('valid-fraud')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  resolution === 'valid-fraud'
                    ? 'border-red-500 bg-red-500/10'
                    : isDark
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <XCircle className={`w-6 h-6 ${
                    resolution === 'valid-fraud' ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <div className="text-left">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Valid Fraud
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Confirmed fraudulent
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Context Addition */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Additional Reasoning (Optional)
            </label>
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              rows={4}
              placeholder="Provide additional context for your decision..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Confidence Level */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Decision Confidence: {confidence}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg transition-all ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!resolution || isSubmitting}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Record Decision</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionDocumentationModal;
