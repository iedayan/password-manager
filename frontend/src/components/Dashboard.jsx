import { useState, useRef, useEffect } from 'react';
import { PlusIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import PasswordVault from './PasswordVault';
import PasswordGenerator from './PasswordGenerator';
import AddPasswordModal from './AddPasswordModal';
import Settings from './Settings';
import Breadcrumb from './Breadcrumb';
import { api } from '../lib/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('vault');
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
          <div className="flex justify-between items-center py-5">
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
                      onClick={() => setActiveTab('settings')}
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
          <div className="flex border-b border-gray-200/60">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
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
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Security Dashboard</h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                  Advanced security monitoring and analysis tools to keep your passwords safe and secure.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60 rounded-xl p-5">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Password Health Check</h3>
                  <p className="text-gray-600 text-sm mb-3">Analyze all your passwords for strength, reuse, and security vulnerabilities.</p>
                  <div className="text-xs text-green-600 font-medium">Coming Q1 2024</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200/60 rounded-xl p-5">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Breach Monitoring</h3>
                  <p className="text-gray-600 text-sm mb-3">Get instant alerts when your passwords appear in data breaches.</p>
                  <div className="text-xs text-orange-600 font-medium">Coming Q1 2024</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/60 rounded-xl p-5">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Two-Factor Authentication</h3>
                  <p className="text-gray-600 text-sm mb-3">Enhanced security with TOTP and biometric authentication options.</p>
                  <div className="text-xs text-purple-600 font-medium">Coming Q2 2024</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/60 rounded-xl p-5">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Security Reports</h3>
                  <p className="text-gray-600 mb-4">Detailed security analytics and recommendations for your account.</p>
                  <div className="text-sm text-blue-600 font-medium">Coming Q2 2024</div>
                </div>
              </div>

              <div className="text-center bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Stay Updated</h3>
                <p className="text-gray-600 mb-4">Be the first to know when these security features become available.</p>
                <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium shadow-lg">
                  Notify Me
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddPasswordModal 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={() => setShowAddForm(false)}
      />
    </div>
  );
};

export default Dashboard;