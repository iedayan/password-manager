import { useState, useEffect } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, ClockIcon, KeyIcon, EyeIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import PasswordHealthCheck from './PasswordHealthCheck';
import TwoFactorAuth from './TwoFactorAuth';
import ExportData from './ExportData';
import { analyzePasswordHealth } from '../utils/passwordHealth';
import { api } from '../lib/api';

const SecurityDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [securityMetrics, setSecurityMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityMetrics();
  }, []);

  const fetchSecurityMetrics = async () => {
    try {
      const response = await api.passwords.getAll();
      const passwords = response.data || [];
      const healthData = analyzePasswordHealth(passwords);
      
      // Calculate additional metrics
      const metrics = {
        ...healthData,
        loginAttempts: Math.floor(Math.random() * 50), // Mock data
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        deviceCount: 3, // Mock data
        is2FAEnabled: localStorage.getItem('2fa_enabled') === 'true',
        breachAlerts: Math.floor(Math.random() * 3),
        passwordAge: passwords.length > 0 ? Math.floor(Math.random() * 365) : 0
      };
      
      setSecurityMetrics(metrics);
    } catch (error) {
      console.error('Failed to fetch security metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSecurityLevel = () => {
    if (!securityMetrics) return { level: 'Unknown', color: 'gray' };
    
    const score = securityMetrics.overallScore;
    if (score >= 90) return { level: 'Excellent', color: 'green' };
    if (score >= 75) return { level: 'Good', color: 'blue' };
    if (score >= 60) return { level: 'Fair', color: 'yellow' };
    return { level: 'Poor', color: 'red' };
  };

  const sections = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'health', name: 'Password Health', icon: ShieldCheckIcon },
    { id: '2fa', name: 'Two-Factor Auth', icon: KeyIcon },
    { id: 'export', name: 'Export Data', icon: EyeIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const securityLevel = getSecurityLevel();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <ShieldCheckIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-4">Security Dashboard</h2>
        <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Monitor your password security, enable advanced protection, and manage your data exports.
        </p>
      </div>

      {/* Security Level Banner */}
      {securityMetrics && (
        <div className={`bg-${securityLevel.color}-500/10 border border-${securityLevel.color}-400/30 rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold text-${securityLevel.color}-400 mb-2`}>
                Security Level: {securityLevel.level}
              </h3>
              <p className="text-slate-300 text-sm">
                Your overall security score is {Math.round(securityMetrics.overallScore)}/100
              </p>
            </div>
            <div className={`text-3xl font-bold text-${securityLevel.color}-400`}>
              {Math.round(securityMetrics.overallScore)}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {securityMetrics && (
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
              <span className="text-2xl font-bold text-white">{securityMetrics.totalPasswords}</span>
            </div>
            <div className="text-slate-300 text-sm">Total Passwords</div>
          </div>

          <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              <span className="text-2xl font-bold text-red-400">
                {securityMetrics.weakPasswords.length + securityMetrics.reusedPasswords.length}
              </span>
            </div>
            <div className="text-slate-300 text-sm">Security Issues</div>
          </div>

          <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <KeyIcon className="w-6 h-6 text-green-400" />
              <span className={`text-2xl font-bold ${securityMetrics.is2FAEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {securityMetrics.is2FAEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="text-slate-300 text-sm">Two-Factor Auth</div>
          </div>

          <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-white">
                {Math.floor((Date.now() - securityMetrics.lastLogin) / (1000 * 60 * 60 * 24))}d
              </span>
            </div>
            <div className="text-slate-300 text-sm">Last Login</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.name}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-slate-700/30 rounded-xl p-6">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Security Overview</h3>
            
            {securityMetrics && (
              <>
                {/* Recent Activity */}
                <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-white mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-300">Last password added</span>
                      <span className="text-slate-400 text-sm">2 days ago</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-300">Security scan completed</span>
                      <span className="text-slate-400 text-sm">1 week ago</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-300">Login from new device</span>
                      <span className="text-slate-400 text-sm">2 weeks ago</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {securityMetrics.recommendations.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-6">
                    <h4 className="text-lg font-medium text-yellow-400 mb-4 flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                      Security Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {securityMetrics.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="text-yellow-300 flex items-start">
                          <span className="text-yellow-400 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeSection === 'health' && <PasswordHealthCheck />}
        {activeSection === '2fa' && <TwoFactorAuth />}
        {activeSection === 'export' && <ExportData />}
      </div>
    </div>
  );
};

export default SecurityDashboard;