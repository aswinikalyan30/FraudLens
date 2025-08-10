import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
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
  resolution: 'confirmed-fraud' | 'suspected-fraud' | 'legitimate' | 'need-more-evidence';
  reasoning: string;
  confidence: number;
  requestPeerReview: boolean;
}

const DecisionDocumentationModal: React.FC<DecisionDocumentationModalProps> = ({ 
  case: fraudCase, 
  onClose, 
  onSubmit 
}) => {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [resolution, setResolution] = useState<'confirmed-fraud' | 'suspected-fraud' | 'legitimate' | 'need-more-evidence' | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [requestPeerReview, setRequestPeerReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!resolution) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const decisionData: DecisionData = {
      resolution,
      reasoning,
      confidence,
      requestPeerReview
    };

    onSubmit(decisionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
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
          {step === 1 && (
            <>
              {/* Pre-Decision Validation */}
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Investigation Completeness</h3>
              <ul className="space-y-2">
                <li className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Required evidence reviewed
                </li>
                <li className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Mandatory verification steps completed
                </li>
                <li className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <XCircle className="w-5 h-5 text-red-500 mr-2" /> Risk factor resolution pending
                </li>
              </ul>

              <div className="mt-4">
                <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Decision Readiness Score</h4>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}">
                  <div className="h-full bg-green-500" style={{ width: '75%' }}></div>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Evidence strength: 75%</p>
              </div>

              <div className="mt-6">
                <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Comparative Case Intelligence</h4>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Similar cases: 10 / 12 fraud</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Institutional decision patterns align with 83% fraud detection.</p>
              </div>

              <button
                onClick={() => setStep(2)}
                className={`mt-6 px-4 py-2 rounded-lg transition-all ${
                  isDark 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Proceed to Decision
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Decision Options */}
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Final Determination</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setResolution('confirmed-fraud')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    resolution === 'confirmed-fraud'
                      ? 'border-red-500 bg-red-500/10'
                      : isDark
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Confirmed Fraud
                </button>
                <button
                  onClick={() => setResolution('suspected-fraud')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    resolution === 'suspected-fraud'
                      ? 'border-orange-500 bg-orange-500/10'
                      : isDark
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Suspected Fraud
                </button>
                <button
                  onClick={() => setResolution('legitimate')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    resolution === 'legitimate'
                      ? 'border-green-500 bg-green-500/10'
                      : isDark
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Legitimate (False Positive)
                </button>
                <button
                  onClick={() => setResolution('need-more-evidence')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    resolution === 'need-more-evidence'
                      ? 'border-blue-500 bg-blue-500/10'
                      : isDark
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Need More Evidence
                </button>
              </div>

              {/* Reasoning Input */}
              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Reasoning</label>
                <select
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark 
                      ? 'bg-gray-900 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select a reason...</option>
                  <option value="policy-violation">Policy Violation</option>
                  <option value="insufficient-evidence">Insufficient Evidence</option>
                  <option value="fraud-pattern-match">Fraud Pattern Match</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  rows={4}
                  placeholder="Provide additional context for your decision..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mt-2 ${
                    isDark 
                      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Confidence Slider */}
              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Decision Confidence: {confidence}/10</label>
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
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg reviewer confidence on similar cases: 7</p>
              </div>

              {/* Request Peer Review */}
              <div className="mt-6 flex items-center">
                <input
                  type="checkbox"
                  checked={requestPeerReview}
                  onChange={(e) => setRequestPeerReview(e.target.checked)}
                  className="mr-2"
                />
                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Request Peer Review</label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!resolution || isSubmitting}
                className={`mt-6 flex items-center justify-center px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Record & Continue</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecisionDocumentationModal;
