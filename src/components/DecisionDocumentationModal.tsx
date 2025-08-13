import React, { useState } from 'react';
import { X } from 'lucide-react';
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
  decisionType: 'approve' | 'reject' | 'hold' | null;
  // New: When true, this is an Admin Override flow
  isOverride?: boolean;
  // New: Open document request wizard from within the modal
  onRequestDocuments?: () => void;
}

export interface DecisionData {
  resolution?: 'fraudulent' | 'valid';
  adminNote: string;
}

const DecisionDocumentationModal: React.FC<DecisionDocumentationModalProps> = ({ 
  case: fraudCase, 
  onClose, 
  onSubmit,
  decisionType,
  isOverride = false,
  onRequestDocuments,
}) => {
  const { isDark } = useTheme();
  const [resolution, setResolution] = useState<'fraudulent' | 'valid' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isHoldFlow = decisionType === 'hold' || isOverride;

  const handleSubmit = async () => {
    if (!isHoldFlow && !resolution) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const decisionData: DecisionData = {
      resolution: resolution || undefined,
      adminNote
    };

    onSubmit(decisionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`border rounded-xl max-w-md w-full ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200 shadow-xl'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isOverride ? 'Admin Override' : 'Application Decision'}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ID: {fraudCase.studentId}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Decision Options */}
          {!isHoldFlow && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setResolution('fraudulent')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  resolution === 'fraudulent'
                    ? 'border-red-500 bg-red-500/10'
                    : isDark
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Mark as Fraudulent
              </button>
              <button
                onClick={() => setResolution('valid')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  resolution === 'valid'
                    ? 'border-green-500 bg-green-500/10'
                    : isDark
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Mark as Valid
              </button>
            </div>
          )}

          {/* Admin Note */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>Admin Note</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder={isHoldFlow ? 'Explain why this is being placed on hold or what documents are required…' : 'Add a note about your decision...'}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Hold/Override auxiliary actions */}
          {isHoldFlow && (
            <div className="flex items-center justify-between gap-3">
                <button
                type="button"
                onClick={() => {
                  if (onRequestDocuments) onRequestDocuments();
                  onClose();
                }}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isDark ? 'border-blue-500 text-blue-300 hover:bg-blue-900/20' : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                }`}
                >
                Request Documents
                </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Place on Hold</span>
                )}
              </button>
            </div>
          )}

          {/* Submit button (non-hold flows) */}
          {!isHoldFlow && (
            <button
              onClick={handleSubmit}
              disabled={!resolution || isSubmitting}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Submit Decision</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecisionDocumentationModal;
