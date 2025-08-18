import { useState, useRef, useEffect } from 'react';
import { PlusIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import PasswordVault from './PasswordVault';
import PasswordGenerator from './PasswordGenerator';
import AddPasswordModal from './AddPasswordModal';
import Settings from './Settings';
import Breadcrumb from './Breadcrumb';
import { api } from '../lib/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'vault';
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    window.location.href = '/';
  };

  const tabs = [
    { id: 'vault', name: 'Vault' },
    { id: 'generator', name: 'Generator' },
    { id: 'security', name: 'Security' },
    { id: 'settings', name: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-5 border-b-2 border-gray-300/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Lok
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Add Password
              </button>
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                </button>
                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 py-1 z-50">
                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50/80 flex items-center gap-3 transition-colors">
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('settings');
                        localStorage.setItem('activeTab', 'settings');
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50/80 flex items-center gap-3 transition-colors"
                    >
                      <ShieldCheckIcon className="w-4 h-4" />
                      Settings
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50/80 flex items-center gap-3 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex bg-gray-50/60 border-b border-gray-200/60">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  localStorage.setItem('activeTab', tab.id);
                }}
                className={`px-6 py-3 text-sm font-semibold transition-all duration-300 border-b-2 relative ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-blue-600 bg-blue-50/60' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/40'
                }`}
              >
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <Breadcrumb />
        </div>
        <div className="bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-6">
          {activeTab === 'vault' && <PasswordVault showAddForm={showAddForm} setShowAddForm={setShowAddForm} />}
          {activeTab === 'generator' && (
            <div className="max-w-2xl mx-auto">
              <PasswordGenerator />
            </div>
          )}
          {activeTab === 'settings' && <Settings />}
          {activeTab === 'security' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Security Dashboard</h2>
                <p className="text-slate-300 max-w-xl mx-auto">
                  Advanced security monitoring and analysis tools to keep your passwords safe and secure.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="group bg-gradient-to-br from-green-900/80 to-emerald-900/60 border border-green-500/30 rounded-2xl p-6 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-green-500/50 transition-shadow">
                    <div className="w-6 h-6 bg-white rounded-full opacity-90"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-100 transition-colors">Password Health Check</h3>
                  <p className="text-green-100/80 text-sm mb-4 leading-relaxed">Analyze all your passwords for strength, reuse, and security vulnerabilities.</p>
                  <div className="inline-flex items-center px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-xs text-green-300 font-medium">Coming Q1 2024</div>
                </div>

                <div className="group bg-gradient-to-br from-orange-900/80 to-red-900/60 border border-orange-500/30 rounded-2xl p-6 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
                    <div className="w-6 h-6 bg-white rounded-full opacity-90"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-100 transition-colors">Breach Monitoring</h3>
                  <p className="text-orange-100/80 text-sm mb-4 leading-relaxed">Get instant alerts when your passwords appear in data breaches.</p>
                  <div className="inline-flex items-center px-3 py-1 bg-orange-500/20 border border-orange-400/30 rounded-full text-xs text-orange-300 font-medium">Coming Q1 2024</div>
                </div>

                <div className="group bg-gradient-to-br from-purple-900/80 to-indigo-900/60 border border-purple-500/30 rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                    <div className="w-6 h-6 bg-white rounded-full opacity-90"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-100 transition-colors">Two-Factor Authentication</h3>
                  <p className="text-purple-100/80 text-sm mb-4 leading-relaxed">Enhanced security with TOTP and biometric authentication options.</p>
                  <div className="inline-flex items-center px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs text-purple-300 font-medium">Coming Q2 2024</div>
                </div>

                <div className="group bg-gradient-to-br from-blue-900/80 to-cyan-900/60 border border-blue-500/30 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                    <div className="w-6 h-6 bg-white rounded-full opacity-90"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors">Advanced Analytics</h3>
                  <p className="text-blue-100/80 text-sm mb-4 leading-relaxed">Comprehensive security insights and detailed password analytics.</p>
                  <div className="inline-flex items-center px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs text-blue-300 font-medium">Coming Q2 2024</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <AddPasswordModal 
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;