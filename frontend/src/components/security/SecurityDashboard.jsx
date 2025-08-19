import { useState, useEffect, useCallback } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, KeyIcon, EyeIcon, SparklesIcon, ArrowPathIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { AnimatedCounter } from '../dashboard/VisualEnhancements';
import { api } from '../../services/api';

// Helper functions outside component to prevent re-creation
const findDuplicates = (passwords) => {
  const seen = new Set();
  return passwords.filter(p => {
    if (seen.has(p.password)) return true;
    seen.add(p.password);
    return false;
  });
};

const findReusedPasswords = (passwords) => {
  const passwordCounts = {};
  passwords.forEach(p => {
    passwordCounts[p.password] = (passwordCounts[p.password] || 0) + 1;
  });
  return passwords.filter(p => passwordCounts[p.password] > 1);
};

const isOld = (dateString) => {
  if (!dateString) return false;
  const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
  return days > 365;
};

const SecurityDashboard = ({ passwords = [], onNavigateToGenerator }) => {
  const [securityScore, setSecurityScore] = useState(0);
  const [metrics, setMetrics] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [scanning, setScanning] = useState(false);

  const calculateSecurityMetrics = useCallback(() => {
    if (passwords.length === 0) {
      setSecurityScore(0);
      setMetrics({});
      return;
    }

    const total = passwords.length;
    const strong = passwords.filter(p => (p.strength_score || 0) >= 80).length;
    const weak = passwords.filter(p => (p.strength_score || 0) < 60).length;
    const duplicates = findDuplicates(passwords).length;
    const old = passwords.filter(p => isOld(p.created_at)).length;
    const reused = findReusedPasswords(passwords).length;

    // Calculate security score
    const score = Math.round(
      (strong / total) * 40 +
      ((total - weak) / total) * 25 +
      ((total - duplicates) / total) * 20 +
      ((total - old) / total) * 10 +
      ((total - reused) / total) * 5
    );

    setSecurityScore(score);
    setMetrics({
      total,
      strong,
      weak,
      duplicates,
      old,
      reused,
      averageStrength: Math.round(
        passwords.reduce((sum, p) => sum + (p.strength_score || 0), 0) / total
      )
    });
  }, [passwords]);

  useEffect(() => {
    calculateSecurityMetrics();
  }, [calculateSecurityMetrics]);

  const runSecurityScan = async () => {
    setScanning(true);
    try {
      const scanResults = await api.security.runScan();
      // Update metrics with scan results
      setSecurityScore(scanResults.security_score || 0);
      setMetrics({
        total: scanResults.total_passwords || 0,
        strong: scanResults.strong_passwords || 0,
        weak: scanResults.weak_passwords || 0,
        duplicates: scanResults.duplicate_passwords || 0,
        old: scanResults.old_passwords || 0,
        reused: scanResults.reused_passwords || 0
      });
    } catch (error) {
      console.error('Security scan failed:', error);
      // Fallback to local calculation
      calculateSecurityMetrics();
    } finally {
      setScanning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ShieldCheckIcon },
    { id: 'health', name: 'Password Health', icon: CheckCircleIcon },
    { id: 'security', name: 'Security Tools', icon: LockClosedIcon }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header with Security Score */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <ShieldCheckIcon className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Security Center</h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Monitor and improve your password security with actionable insights
        </p>
      </div>

      {/* Security Score Circle */}
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/60 p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="w-40 h-40 mx-auto relative">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-slate-600"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - securityScore / 100)}`}
                  className={getScoreColor(securityScore)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 2s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(securityScore)}`}>
                    <AnimatedCounter value={securityScore} />
                  </div>
                  <div className="text-slate-400 text-sm">Security Score</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <button
              onClick={runSecurityScan}
              disabled={scanning}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
            >
              {scanning ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <SparklesIcon className="w-5 h-5" />
              )}
              {scanning ? 'Scanning...' : 'Run Security Scan'}
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-700/50 rounded-xl">
                <div className="text-2xl font-bold text-green-400">
                  <AnimatedCounter value={metrics.strong || 0} />
                </div>
                <div className="text-xs text-slate-400">Strong</div>
              </div>
              <div className="text-center p-3 bg-slate-700/50 rounded-xl">
                <div className="text-2xl font-bold text-red-400">
                  <AnimatedCounter value={metrics.weak || 0} />
                </div>
                <div className="text-xs text-slate-400">Weak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Security Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
                  <span className="text-xl font-bold text-white">
                    <AnimatedCounter value={metrics.total || 0} />
                  </span>
                </div>
                <div className="text-slate-400 text-sm mt-1">Total Passwords</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-400" />
                  <span className="text-xl font-bold text-orange-400">
                    <AnimatedCounter value={metrics.duplicates || 0} />
                  </span>
                </div>
                <div className="text-slate-400 text-sm mt-1">Duplicates</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <ClockIcon className="w-6 h-6 text-yellow-400" />
                  <span className="text-xl font-bold text-yellow-400">
                    <AnimatedCounter value={metrics.old || 0} />
                  </span>
                </div>
                <div className="text-slate-400 text-sm mt-1">Old Passwords</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <KeyIcon className="w-6 h-6 text-purple-400" />
                  <span className="text-xl font-bold text-purple-400">
                    <AnimatedCounter value={metrics.reused || 0} />
                  </span>
                </div>
                <div className="text-slate-400 text-sm mt-1">Reused</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-600/40 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-300 mb-3">Password Generator</h3>
                <p className="text-slate-300 text-sm mb-4">Create strong, unique passwords</p>
                <button 
                  onClick={() => onNavigateToGenerator?.()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Generate Password
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-600/40 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-300 mb-3">Two-Factor Auth</h3>
                <p className="text-slate-300 text-sm mb-4">Add extra security to your account</p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Setup 2FA
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Password Health Analysis</h2>
            
            {metrics.weak > 0 && (
              <div className="bg-red-900/40 border border-red-600/40 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  Weak Passwords ({metrics.weak})
                </h3>
                <p className="text-red-200 text-sm">These passwords are vulnerable and should be updated immediately.</p>
              </div>
            )}
            
            {metrics.duplicates > 0 && (
              <div className="bg-orange-900/40 border border-orange-600/40 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  Duplicate Passwords ({metrics.duplicates})
                </h3>
                <p className="text-orange-200 text-sm">Using the same password for multiple accounts increases security risk.</p>
              </div>
            )}
            
            {metrics.strong > 0 && (
              <div className="bg-green-900/40 border border-green-600/40 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-300 mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  Strong Passwords ({metrics.strong})
                </h3>
                <p className="text-green-200 text-sm">These passwords meet security best practices.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Security Tools</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Export Data</h3>
                <p className="text-slate-300 text-sm mb-4">Download your passwords securely</p>
                <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Export Passwords
                </button>
              </div>
              
              <div className="bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Account Settings</h3>
                <p className="text-slate-300 text-sm mb-4">Manage your security preferences</p>
                <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Open Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;