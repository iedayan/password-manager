import { useState, useRef, useEffect } from 'react';
import { PlusIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import PasswordVault from './PasswordVault';
import PasswordGenerator from './PasswordGenerator';
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
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const tabs = [
    { id: 'vault', name: 'Vault' },
    { id: 'generator', name: 'Generator' },
    { id: 'security', name: 'Security' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">
                Lok
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <PlusIcon className="w-5 h-5" />
                Add Password
              </button>
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <Cog6ToothIcon className="w-6 h-6" />
                </button>
                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50">
                    <button className="w-full px-5 py-3 text-left text-sm text-gray-700 hover:bg-gray-50/80 flex items-center gap-3 transition-colors">
                      <UserIcon className="w-5 h-5" />
                      Profile
                    </button>
                    <button className="w-full px-5 py-3 text-left text-sm text-gray-700 hover:bg-gray-50/80 flex items-center gap-3 transition-colors">
                      <ShieldCheckIcon className="w-5 h-5" />
                      Security Settings
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button 
                      onClick={handleLogout}
                      className="w-full px-5 py-3 text-left text-sm text-red-600 hover:bg-red-50/80 flex items-center gap-3 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200/50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 text-base font-semibold transition-all duration-300 border-b-3 relative ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/30'
                }`}
              >
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-6">
          <Breadcrumb />
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          {activeTab === 'vault' && <PasswordVault />}
          {activeTab === 'generator' && (
            <div className="max-w-2xl mx-auto">
              <PasswordGenerator />
            </div>
          )}
          {activeTab === 'security' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Security Dashboard</h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Advanced security monitoring and analysis tools to keep your passwords safe and secure.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Password Health Check</h3>
                  <p className="text-gray-600 mb-4">Analyze all your passwords for strength, reuse, and security vulnerabilities.</p>
                  <div className="text-sm text-green-600 font-medium">Coming Q1 2024</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Breach Monitoring</h3>
                  <p className="text-gray-600 mb-4">Get instant alerts when your passwords appear in data breaches.</p>
                  <div className="text-sm text-orange-600 font-medium">Coming Q1 2024</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Two-Factor Authentication</h3>
                  <p className="text-gray-600 mb-4">Enhanced security with TOTP and biometric authentication options.</p>
                  <div className="text-sm text-purple-600 font-medium">Coming Q2 2024</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
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

      {showAddForm && (
        <AddPasswordForm 
          onClose={() => setShowAddForm(false)} 
          onAdd={(newPassword) => {
            // Refresh passwords or add to state
            window.location.reload(); // Simple refresh for now
          }}
        />
      )}
    </div>
  );
};

const AddPasswordForm = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    site_name: '',
    site_url: '',
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.passwords.create(formData);
      onAdd?.(data.password);
      onClose();
    } catch (error) {
      console.error('Failed to add password:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Site Name"
            value={formData.site_name}
            onChange={(e) => setFormData(prev => ({...prev, site_name: e.target.value}))}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80"
            required
          />
          <input
            type="url"
            placeholder="Site URL"
            value={formData.site_url}
            onChange={(e) => setFormData(prev => ({...prev, site_url: e.target.value}))}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80"
            required
          />
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
            >
              Add Password
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;