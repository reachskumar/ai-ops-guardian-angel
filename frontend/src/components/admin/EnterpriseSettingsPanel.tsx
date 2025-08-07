import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, Shield, Database, Bell, Sliders, 
  Save, RefreshCw, CheckCircle, AlertCircle, Eye, EyeOff
} from 'lucide-react';

interface Setting {
  id: string;
  category: string;
  name: string;
  description: string;
  type: 'toggle' | 'input' | 'select' | 'textarea';
  value: any;
  options?: string[];
  sensitive?: boolean;
}

interface SettingsCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  settings: Setting[];
}

const EnterpriseSettingsPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  const settingsCategories: SettingsCategory[] = [
    {
      id: 'general',
      name: 'General',
      icon: <Settings className="w-5 h-5" />,
      settings: [
        {
          id: 'platform_name',
          category: 'general',
          name: 'Platform Name',
          description: 'Display name for your DevOps platform',
          type: 'input',
          value: 'AI-Ops Guardian Angel'
        },
        {
          id: 'auto_refresh',
          category: 'general',
          name: 'Auto Refresh Dashboard',
          description: 'Automatically refresh dashboard data',
          type: 'toggle',
          value: true
        },
        {
          id: 'refresh_interval',
          category: 'general',
          name: 'Refresh Interval',
          description: 'Dashboard refresh interval in seconds',
          type: 'select',
          value: '30',
          options: ['10', '30', '60', '300']
        },
        {
          id: 'timezone',
          category: 'general',
          name: 'Default Timezone',
          description: 'Default timezone for the platform',
          type: 'select',
          value: 'UTC',
          options: ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']
        }
      ]
    },
    {
      id: 'authentication',
      name: 'Authentication',
      icon: <Users className="w-5 h-5" />,
      settings: [
        {
          id: 'mfa_required',
          category: 'authentication',
          name: 'Require Multi-Factor Authentication',
          description: 'Force all users to enable MFA',
          type: 'toggle',
          value: true
        },
        {
          id: 'session_timeout',
          category: 'authentication',
          name: 'Session Timeout',
          description: 'Automatic logout after inactivity (minutes)',
          type: 'select',
          value: '60',
          options: ['15', '30', '60', '120', '240']
        },
        {
          id: 'password_policy',
          category: 'authentication',
          name: 'Password Policy',
          description: 'Minimum password requirements',
          type: 'select',
          value: 'strong',
          options: ['basic', 'medium', 'strong', 'enterprise']
        },
        {
          id: 'sso_enabled',
          category: 'authentication',
          name: 'Single Sign-On (SSO)',
          description: 'Enable SAML/OAuth SSO integration',
          type: 'toggle',
          value: false
        },
        {
          id: 'sso_provider',
          category: 'authentication',
          name: 'SSO Provider',
          description: 'SSO identity provider configuration',
          type: 'select',
          value: 'azure_ad',
          options: ['azure_ad', 'google_workspace', 'okta', 'auth0']
        }
      ]
    },
    {
      id: 'security',
      name: 'Security',
      icon: <Shield className="w-5 h-5" />,
      settings: [
        {
          id: 'encryption_at_rest',
          category: 'security',
          name: 'Encryption at Rest',
          description: 'Encrypt all stored data',
          type: 'toggle',
          value: true
        },
        {
          id: 'audit_logging',
          category: 'security',
          name: 'Audit Logging',
          description: 'Log all user actions and system events',
          type: 'toggle',
          value: true
        },
        {
          id: 'ip_whitelist',
          category: 'security',
          name: 'IP Address Whitelist',
          description: 'Restrict access to specific IP addresses',
          type: 'textarea',
          value: '192.168.1.0/24\n10.0.0.0/8'
        },
        {
          id: 'api_rate_limit',
          category: 'security',
          name: 'API Rate Limiting',
          description: 'Maximum API requests per minute',
          type: 'select',
          value: '1000',
          options: ['100', '500', '1000', '5000', 'unlimited']
        },
        {
          id: 'security_headers',
          category: 'security',
          name: 'Security Headers',
          description: 'Enable security headers (HSTS, CSP, etc.)',
          type: 'toggle',
          value: true
        }
      ]
    },
    {
      id: 'cloud_providers',
      name: 'Cloud Providers',
      icon: <Database className="w-5 h-5" />,
      settings: [
        {
          id: 'aws_access_key',
          category: 'cloud_providers',
          name: 'AWS Access Key ID',
          description: 'AWS access key for API integration',
          type: 'input',
          value: 'AKIA...',
          sensitive: true
        },
        {
          id: 'aws_secret_key',
          category: 'cloud_providers',
          name: 'AWS Secret Access Key',
          description: 'AWS secret key for API integration',
          type: 'input',
          value: '••••••••••••••••••••',
          sensitive: true
        },
        {
          id: 'azure_client_id',
          category: 'cloud_providers',
          name: 'Azure Client ID',
          description: 'Azure service principal client ID',
          type: 'input',
          value: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          sensitive: true
        },
        {
          id: 'azure_client_secret',
          category: 'cloud_providers',
          name: 'Azure Client Secret',
          description: 'Azure service principal client secret',
          type: 'input',
          value: '••••••••••••••••••••',
          sensitive: true
        },
        {
          id: 'gcp_service_account',
          category: 'cloud_providers',
          name: 'GCP Service Account Key',
          description: 'Google Cloud service account JSON key',
          type: 'textarea',
          value: '{\n  "type": "service_account",\n  "project_id": "••••••••••",\n  ...\n}',
          sensitive: true
        }
      ]
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          id: 'email_notifications',
          category: 'notifications',
          name: 'Email Notifications',
          description: 'Send notifications via email',
          type: 'toggle',
          value: true
        },
        {
          id: 'slack_integration',
          category: 'notifications',
          name: 'Slack Integration',
          description: 'Send notifications to Slack channels',
          type: 'toggle',
          value: false
        },
        {
          id: 'slack_webhook',
          category: 'notifications',
          name: 'Slack Webhook URL',
          description: 'Slack incoming webhook URL',
          type: 'input',
          value: 'https://hooks.slack.com/services/...',
          sensitive: true
        },
        {
          id: 'teams_integration',
          category: 'notifications',
          name: 'Microsoft Teams Integration',
          description: 'Send notifications to Teams channels',
          type: 'toggle',
          value: false
        },
        {
          id: 'pagerduty_integration',
          category: 'notifications',
          name: 'PagerDuty Integration',
          description: 'Create incidents in PagerDuty',
          type: 'toggle',
          value: false
        },
        {
          id: 'notification_threshold',
          category: 'notifications',
          name: 'Alert Threshold',
          description: 'Minimum severity level for notifications',
          type: 'select',
          value: 'medium',
          options: ['low', 'medium', 'high', 'critical']
        }
      ]
    },
    {
      id: 'automation',
      name: 'Automation',
      icon: <Sliders className="w-5 h-5" />,
      settings: [
        {
          id: 'auto_scaling',
          category: 'automation',
          name: 'Auto Scaling',
          description: 'Enable automatic resource scaling',
          type: 'toggle',
          value: true
        },
        {
          id: 'auto_remediation',
          category: 'automation',
          name: 'Auto Remediation',
          description: 'Automatically fix detected issues',
          type: 'toggle',
          value: false
        },
        {
          id: 'gitops_enabled',
          category: 'automation',
          name: 'GitOps Deployment',
          description: 'Enable GitOps-based deployments',
          type: 'toggle',
          value: true
        },
        {
          id: 'backup_automation',
          category: 'automation',
          name: 'Automated Backups',
          description: 'Automatically backup critical data',
          type: 'toggle',
          value: true
        },
        {
          id: 'backup_retention',
          category: 'automation',
          name: 'Backup Retention',
          description: 'Number of days to retain backups',
          type: 'select',
          value: '30',
          options: ['7', '14', '30', '90', '365']
        }
      ]
    }
  ];

  useEffect(() => {
    // Load settings from API
    const allSettings = settingsCategories.flatMap(category => category.settings);
    setSettings(allSettings);
  }, []);

  const handleSettingChange = (settingId: string, newValue: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId ? { ...setting, value: newValue } : setting
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Show success message
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSensitiveVisibility = (settingId: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [settingId]: !prev[settingId]
    }));
  };

  const renderSetting = (setting: Setting) => {
    const isVisible = showSensitive[setting.id] || false;
    
    return (
      <div key={setting.id} className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{setting.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
          </div>
          {setting.sensitive && (
            <button
              onClick={() => toggleSensitiveVisibility(setting.id)}
              className="ml-4 p-1 text-gray-400 hover:text-gray-600"
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        
        <div className="mt-3">
          {setting.type === 'toggle' && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={setting.value}
                onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">
                {setting.value ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          )}
          
          {setting.type === 'input' && (
            <input
              type={setting.sensitive && !isVisible ? 'password' : 'text'}
              value={setting.sensitive && !isVisible ? '••••••••••••••••••••' : setting.value}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              disabled={setting.sensitive && !isVisible}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          )}
          
          {setting.type === 'select' && (
            <select
              value={setting.value}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {setting.options?.map(option => (
                <option key={option} value={option}>
                  {option === 'unlimited' ? 'Unlimited' : option}
                </option>
              ))}
            </select>
          )}
          
          {setting.type === 'textarea' && (
            <textarea
              value={setting.sensitive && !isVisible ? '••••••••••••••••••••' : setting.value}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              disabled={setting.sensitive && !isVisible}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>
      </div>
    );
  };

  const activeSettings = settingsCategories.find(cat => cat.id === activeCategory)?.settings || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enterprise Settings</h1>
          <p className="text-gray-600 mt-2">Configure your AI-Ops platform settings and integrations</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {settingsCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.icon}
                  <span className="ml-3 font-medium">{category.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Section Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {settingsCategories.find(cat => cat.id === activeCategory)?.icon}
                    <h2 className="ml-3 text-xl font-semibold text-gray-900">
                      {settingsCategories.find(cat => cat.id === activeCategory)?.name} Settings
                    </h2>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Settings Content */}
              <div className="p-6">
                <div className="space-y-6">
                  {activeSettings.map(renderSetting)}
                </div>

                {/* Status Messages */}
                {activeCategory === 'cloud_providers' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <div>
                        <p className="font-medium text-blue-800">Cloud Providers Status</p>
                        <p className="text-sm text-blue-600 mt-1">
                          AWS: Connected • Azure: Connected • GCP: Connected
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeCategory === 'security' && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-green-500 mr-2" />
                      <div>
                        <p className="font-medium text-green-800">Security Score: 94.2%</p>
                        <p className="text-sm text-green-600 mt-1">
                          All security features properly configured
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeCategory === 'notifications' && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                      <div>
                        <p className="font-medium text-yellow-800">Test Notifications</p>
                        <p className="text-sm text-yellow-600 mt-1">
                          Click "Save Changes" to test your notification settings
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseSettingsPanel;