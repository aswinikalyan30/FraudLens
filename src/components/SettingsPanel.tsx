import React, { useState } from 'react';
import { Settings, Shield, Bell, Sliders, Mail, MessageSquare, Save } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Rule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold?: number;
  category: 'admission' | 'financial' | 'enrollment';
}

const SettingsPanel: React.FC = () => {
  const { isDark } = useTheme();
  const [rules, setRules] = useState<Rule[]>([
    {
      id: 'essay-similarity',
      name: 'Essay Similarity Check',
      description: 'Detects similar essay content across applications',
      enabled: true,
      threshold: 85,
      category: 'admission'
    },
    {
      id: 'email-age',
      name: 'Email Age Verification',
      description: 'Flags recently created email accounts',
      enabled: true,
      threshold: 30,
      category: 'admission'
    },
    {
      id: 'rapid-submission',
      name: 'Rapid Submission Pattern',
      description: 'Identifies suspiciously fast application completion',
      enabled: true,
      threshold: 5,
      category: 'admission'
    },
    {
      id: 'income-inconsistency',
      name: 'Income Inconsistency Check',
      description: 'Detects inconsistent financial information',
      enabled: true,
      threshold: 75,
      category: 'financial'
    },
    {
      id: 'document-anomaly',
      name: 'Document Anomaly Detection',
      description: 'Identifies potentially fraudulent documents',
      enabled: true,
      threshold: 80,
      category: 'financial'
    },
    {
      id: 'ghost-student',
      name: 'Ghost Student Detection',
      description: 'Identifies students with no actual activity',
      enabled: true,
      threshold: 90,
      category: 'enrollment'
    },
    {
      id: 'lms-activity',
      name: 'LMS Activity Monitoring',
      description: 'Tracks student learning management system usage',
      enabled: true,
      threshold: 10,
      category: 'enrollment'
    }
  ]);

  const [escalationThreshold, setEscalationThreshold] = useState(85);
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    slack: true,
    webhook: false
  });

  type TabId = 'rules' | 'escalation' | 'notifications';
  const [activeTab, setActiveTab] = useState<TabId>('rules');

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const updateRuleThreshold = (ruleId: string, threshold: number) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, threshold } : rule
    ));
  };

  const getRulesByCategory = (category: string) => {
    return rules.filter(rule => rule.category === category);
  };

  const categories = [
    { id: 'admission', name: 'Admission', color: 'blue' },
    { id: 'financial', name: 'Financial Aid', color: 'yellow' },
    { id: 'enrollment', name: 'Enrollment', color: 'purple' }
  ];

  const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void; disabled?: boolean }> = ({ 
    enabled, 
    onChange, 
    disabled = false 
  }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-all ${
        enabled ? 'bg-teal-500' : (isDark ? 'bg-gray-600' : 'bg-gray-300')
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${
        enabled ? 'translate-x-6' : 'translate-x-0'
      }`}></div>
    </button>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            System Settings
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Configure fraud detection rules and notifications
          </p>
        </div>
        <button className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all ${
          isDark 
            ? 'bg-purple-500/20 border-purple-500 text-purple-400 hover:bg-purple-500/30' 
            : 'bg-purple-50 border-purple-500 text-purple-700 hover:bg-purple-100'
        }`}>
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className={`flex space-x-1 mb-6 p-1 rounded-lg ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        {[
          { id: 'rules', label: 'Detection Rules', icon: Shield },
          { id: 'escalation', label: 'Escalation', icon: Sliders },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? isDark
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-purple-50 text-purple-700'
                  : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className={`border rounded-xl p-6 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 shadow-lg' 
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  category.color === 'blue' ? 'bg-blue-500' :
                  category.color === 'yellow' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`}></div>
                <span>{category.name} Rules</span>
              </h3>
              <div className="space-y-4">
                {getRulesByCategory(category.id).map((rule) => (
                  <div key={rule.id} className={`border rounded-lg p-4 ${
                    isDark 
                      ? 'bg-gray-900/50 border-gray-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <ToggleSwitch
                          enabled={rule.enabled}
                          onChange={() => toggleRule(rule.id)}
                        />
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {rule.name}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {rule.description}
                          </p>
                        </div>
                      </div>
                      {rule.threshold && (
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Threshold:
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={rule.threshold}
                            onChange={(e) => updateRuleThreshold(rule.id, parseInt(e.target.value))}
                            className={`w-20 h-2 rounded-lg appearance-none cursor-pointer ${
                              isDark ? 'bg-gray-700' : 'bg-gray-300'
                            }`}
                            disabled={!rule.enabled}
                          />
                          <span className={`text-sm w-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {rule.threshold}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Escalation Tab */}
      {activeTab === 'escalation' && (
        <div className="space-y-6">
          <div className={`border rounded-xl p-6 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-lg' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Escalation Thresholds
            </h3>
            <div className="space-y-4">
              <div className={`border rounded-lg p-4 ${
                isDark 
                  ? 'bg-gray-900/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Auto-Escalation Threshold
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cases above this risk score are automatically escalated
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={escalationThreshold}
                      onChange={(e) => setEscalationThreshold(parseInt(e.target.value))}
                      className={`w-32 h-2 rounded-lg appearance-none cursor-pointer ${
                        isDark ? 'bg-gray-700' : 'bg-gray-300'
                      }`}
                    />
                    <span className={`text-lg font-bold w-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {escalationThreshold}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className={`border rounded-lg p-3 ${
                    isDark 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="text-green-500 font-semibold">Low Risk</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      0-74
                    </div>
                  </div>
                  <div className={`border rounded-lg p-3 ${
                    isDark 
                      ? 'bg-blue-500/10 border-blue-500/30' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="text-blue-500 font-semibold">Medium Risk</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      75-{escalationThreshold-1}
                    </div>
                  </div>
                  <div className={`border rounded-lg p-3 ${
                    isDark 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="text-red-500 font-semibold">High Risk</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {escalationThreshold}+
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className={`border rounded-xl p-6 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-lg' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notification Channels
            </h3>
            <div className="space-y-4">
              {[
                {
                  key: 'email',
                  icon: Mail,
                  title: 'Email Notifications',
                  description: 'Receive alerts via email',
                  color: 'blue'
                },
                {
                  key: 'slack',
                  icon: MessageSquare,
                  title: 'Slack Integration',
                  description: 'Send alerts to Slack channels',
                  color: 'green'
                },
                {
                  key: 'webhook',
                  icon: Settings,
                  title: 'Webhook Notifications',
                  description: 'Custom webhook endpoints',
                  color: 'purple'
                }
              ].map((channel) => {
                const Icon = channel.icon;
                return (
                  <div key={channel.key} className={`border rounded-lg p-4 ${
                    isDark 
                      ? 'bg-gray-900/50 border-gray-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${
                          channel.color === 'blue' ? 'text-blue-500' :
                          channel.color === 'green' ? 'text-green-500' :
                          'text-purple-500'
                        }`} />
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {channel.title}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {channel.description}
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={notificationChannels[channel.key as keyof typeof notificationChannels]}
                        onChange={() => setNotificationChannels(prev => ({ 
                          ...prev, 
                          [channel.key]: !prev[channel.key as keyof typeof prev] 
                        }))}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;