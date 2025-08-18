import { useState, useRef, useEffect } from 'react';
import { PlusIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, UserIcon, ShieldCheckIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import PasswordVault from './PasswordVault';
import PasswordGenerator from './PasswordGenerator';
import AddPasswordModal from './AddPasswordModal';
import Settings from './Settings';
import Breadcrumb from './Breadcrumb';
import OnboardingFlow from './OnboardingFlow';
import ImportWizard from './ImportWizard';
import { api } from '../lib/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'vault';
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const dropdownRef = useRef(null);

  // Check if user needs onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
    };
    
    // Global keyboard shortcuts for tab navigation
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('vault');
            localStorage.setItem('activeTab', 'vault');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('generator');
            localStorage.setItem('activeTab', 'generator');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('security');
            localStorage.setItem('activeTab', 'security');
            break;
          case '4':
            e.preventDefault();
            setActiveTab('settings');
            localStorage.setItem('activeTab', 'settings');
            break;
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyPress);
    };
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowImportWizard(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm"
                >
                  <DocumentArrowUpIcon className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Password
                </button>
              </div>
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
                        setShowOnboarding(true);
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50/80 flex items-center gap-3 transition-colors"
                    >
                      <ShieldCheckIcon className="w-4 h-4" />
                      Setup Guide
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('settings');
                        localStorage.setItem('activeTab', 'settings');
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50/80 flex items-center gap-3 transition-colors"
                    >
                      <Cog6ToothIcon className="w-4 h-4" />
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
        <div className="mb-6">
          <Breadcrumb />
        </div>
        <div className="bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/60 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 via-transparent to-slate-900/20 pointer-events-none"></div>
          <div className="relative z-10">
            {activeTab === 'vault' && (
              <PasswordVault 
                showAddForm={showAddForm} 
                setShowAddForm={setShowAddForm}
                onImportClick={() => setShowImportWizard(true)}
              />
            )}
            {activeTab === 'generator' && (
              <div className="max-w-3xl mx-auto">
                <PasswordGenerator />
              </div>
            )}
            {activeTab === 'settings' && <Settings />}
            {activeTab === 'security' && (
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 animate-pulse">
                    <ShieldCheckIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Security Dashboard</h2>
                  <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
                    Advanced security monitoring and analysis tools to keep your passwords safe and secure.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="group relative bg-gradient-to-br from-green-900/90 to-emerald-900/70 border-2 border-green-400/40 rounded-2xl p-6 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-500 hover:scale-[1.02] backdrop-blur-xl before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-green-400/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-5 shadow-xl group-hover:shadow-green-400/60 transition-all duration-300 group-hover:rotate-3">
                      <div className="w-7 h-7 bg-white rounded-full opacity-95 animate-pulse"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-100 transition-colors">Password Health Check</h3>
                    <p className="text-green-100/90 text-sm mb-5 leading-relaxed">Analyze all your passwords for strength, reuse, and security vulnerabilities.</p>
                    <div className="inline-flex items-center px-4 py-2 bg-green-400/20 border border-green-300/40 rounded-full text-xs text-green-200 font-semibold backdrop-blur-sm">Coming Q1 2024</div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/20 via-transparent to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <div className="group relative bg-gradient-to-br from-orange-900/90 to-red-900/70 border-2 border-orange-400/40 rounded-2xl p-6 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 hover:scale-[1.02] backdrop-blur-xl before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-orange-400/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-5 shadow-xl group-hover:shadow-orange-400/60 transition-all duration-300 group-hover:rotate-3">
                      <div className="w-7 h-7 bg-white rounded-full opacity-95 animate-pulse"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-100 transition-colors">Breach Monitoring</h3>
                    <p className="text-orange-100/90 text-sm mb-5 leading-relaxed">Get instant alerts when your passwords appear in data breaches.</p>
                    <div className="inline-flex items-center px-4 py-2 bg-orange-400/20 border border-orange-300/40 rounded-full text-xs text-orange-200 font-semibold backdrop-blur-sm">Coming Q1 2024</div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/20 via-transparent to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <div className="group relative bg-gradient-to-br from-purple-900/90 to-indigo-900/70 border-2 border-purple-400/40 rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:scale-[1.02] backdrop-blur-xl before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-purple-400/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-5 shadow-xl group-hover:shadow-purple-400/60 transition-all duration-300 group-hover:rotate-3">
                      <div className="w-7 h-7 bg-white rounded-full opacity-95 animate-pulse"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-100 transition-colors">Two-Factor Authentication</h3>
                    <p className="text-purple-100/90 text-sm mb-5 leading-relaxed">Enhanced security with TOTP and biometric authentication options.</p>
                    <div className="inline-flex items-center px-4 py-2 bg-purple-400/20 border border-purple-300/40 rounded-full text-xs text-purple-200 font-semibold backdrop-blur-sm">Coming Q2 2024</div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 via-transparent to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <div className="group relative bg-gradient-to-br from-blue-900/90 to-cyan-900/70 border-2 border-blue-400/40 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-[1.02] backdrop-blur-xl before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-blue-400/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-5 shadow-xl group-hover:shadow-blue-400/60 transition-all duration-300 group-hover:rotate-3">
                      <div className="w-7 h-7 bg-white rounded-full opacity-95 animate-pulse"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors">Advanced Analytics</h3>
                    <p className="text-blue-100/90 text-sm mb-5 leading-relaxed">Comprehensive security insights and detailed password analytics.</p>
                    <div className="inline-flex items-center px-4 py-2 bg-blue-400/20 border border-blue-300/40 rounded-full text-xs text-blue-200 font-semibold backdrop-blur-sm">Coming Q2 2024</div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-transparent to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAddForm(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          title="Add Password (⌘N)"
        >
          <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {showAddForm && (
        <AddPasswordModal 
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onAdd={() => {
            // Refresh the vault if we're on the vault tab
            if (activeTab === 'vault') {
              window.location.reload();
            }
          }}
        />
      )}

      {/* Onboarding Flow */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          localStorage.setItem('onboarding_completed', 'true');
          setShowOnboarding(false);
        }}
      />

      {/* Import Wizard */}
      <ImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onComplete={() => {
          setShowImportWizard(false);
          if (activeTab === 'vault') {
            window.location.reload();
          }
        }}
      />
    </div>
  );
};

export default Dashboard;