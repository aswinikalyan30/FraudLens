import React from 'react';

interface ActionButtonsProps {
  isDark: boolean;
  setDecisionType: (type: 'approve' | 'reject' | 'escalate' | null) => void;
  setShowDecisionModal: (v: boolean) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ isDark, setDecisionType, setShowDecisionModal }) => {
  return (
    <div className="pt-4">
      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={() => {
            setDecisionType('approve');
            setShowDecisionModal(true);
          }}
          className={`action-button flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDark 
              ? 'bg-green-700 text-white hover:bg-green-600 focus:ring-green-500' 
              : 'bg-green-700 text-white hover:bg-green-800 focus:ring-green-500'
          }`}
          aria-label="Approve application"
        >
          ✅ Approve
        </button>
        <button 
          onClick={() => {
            setDecisionType('reject');
            setShowDecisionModal(true);
          }}
          className={`action-button flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDark 
              ? 'bg-red-700 text-white hover:bg-red-600 focus:ring-red-500' 
              : 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-500'
          }`}
          aria-label="Reject application"
        >
          ❌ Reject
        </button>
        <button 
          onClick={() => {
            setDecisionType('escalate');
            setShowDecisionModal(true);
          }}
          className={`action-button flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDark 
              ? 'bg-pink-700 text-white hover:bg-pink-600 focus:ring-pink-500' 
              : 'bg-pink-700 text-white hover:bg-pink-800 focus:ring-pink-500'
          }`}
          aria-label="Escalate application for manual review"
        >
          🚨 Escalate
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
