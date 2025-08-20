import { useState, useRef, useEffect } from 'react';
import { PlusIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, UserIcon, ShieldCheckIcon, DocumentArrowUpIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { PasswordVault, SetupChecklist } from '../dashboard';
import { PasswordGenerator, SecurityDashboard } from '../security';
import { AddPasswordModal, EditPasswordModal } from '../modals';
import { Settings, ImportWizard } from '../forms';
import { Breadcrumb } from '../ui';
import { OnboardingFlow } from '../auth';
import { BetaFeedbackWidget, ProductTour } from '../../features';
import { api } from "../../services/api";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'vault';
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showFeatureBoard, setShowFeatureBoard] = useState(false);
  const [refreshVault, setRefreshVault] = useState(0);
  const [passwords, setPasswords] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch passwords for security dashboard
  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const data = await api.passwords.getAll();
        setPasswords(data.passwords || data);
      } catch (error) {
        console.error('Failed to fetch passwords:', error);
      }
    };
    
    fetchPasswords();
  }, [refreshVault]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 32 32">
                  <path d="M16 3l10 4v8c0 7-4 14-10 16-6-2-10-9-10-16V7l10-4z" fill="white" opacity="0.95"/>
                  <rect x="12" y="16" width="8" height="7" rx="1.5" fill="#0891b2"/>
                  <path d="M13 16V12c0-1.7 1.3-3 3-3s3 1.3 3 3v4" stroke="#0891b2" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                  <circle cx="16" cy="19.5" r="1.8" fill="white"/>
                  <rect x="12.5" y="16.5" width="7" height="1" rx="0.5" fill="rgba(255,255,255,0.5)"/>
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                Lok
              </h1>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Setup Guide
                </button>
                <button
                  onClick={() => setShowImportWizard(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                >
                  <DocumentArrowUpIcon className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Password
                </button>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                </button>
                {showSettingsDropdown && (
                  <div className="fixed right-6 top-16 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999]">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Account</div>
                          <div className="text-xs text-gray-500">Manage your profile</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Profile</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          setShowOnboarding(true);
                          setShowSettingsDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <ShieldCheckIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Setup Guide</span>
                      </button>
                      

                      
                      <button 
                        onClick={() => {
                          setActiveTab('settings');
                          localStorage.setItem('activeTab', 'settings');
                          setShowSettingsDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Settings</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="my-1 border-t border-gray-100"></div>

                    {/* Logout Section */}
                    <div className="py-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-500" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  localStorage.setItem('activeTab', tab.id);
                }}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
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
        
        {/* Setup Checklist - only show if not completed */}
        <SetupChecklist onComplete={() => setActiveTab('vault')} />
        <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/60 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 via-transparent to-slate-900/20 pointer-events-none"></div>
          <div className="relative z-10">
            {activeTab === 'vault' && (
              <div className="password-vault">
                <PasswordVault 
                  showAddForm={showAddForm} 
                  setShowAddForm={setShowAddForm}
                  onImportClick={() => setShowImportWizard(true)}
                  onEditPassword={setEditingPassword}
                  refreshTrigger={refreshVault}
                />
              </div>
            )}
            {activeTab === 'generator' && (
              <div className="max-w-3xl mx-auto password-generator">
                <PasswordGenerator />
              </div>
            )}
            {activeTab === 'settings' && <Settings />}
            {activeTab === 'security' && (
              <div className="max-w-5xl mx-auto security-dashboard">
                <SecurityDashboard 
                  passwords={passwords} 
                  onNavigateToGenerator={() => {
                    setActiveTab('generator');
                    localStorage.setItem('activeTab', 'generator');
                  }}
                />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAddForm(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors flex items-center justify-center group"
          title="Add Password (⌘N)"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      {showAddForm && (
        <AddPasswordModal 
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onAdd={() => {
            setShowAddForm(false);
            setRefreshVault(prev => prev + 1);
          }}
        />
      )}

      {/* Edit Password Modal */}
      {editingPassword && (
        <EditPasswordModal
          password={editingPassword}
          onClose={() => setEditingPassword(null)}
          onUpdate={() => {
            setEditingPassword(null);
            setRefreshVault(prev => prev + 1);
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
          setRefreshVault(prev => prev + 1);
        }}
      />
      
      {/* Beta Feedback Widget */}
      <BetaFeedbackWidget />
      
      {/* Product Tour */}
      <ProductTour onComplete={() => setActiveTab('vault')} />
    </div>
  );
};

export default Dashboard;