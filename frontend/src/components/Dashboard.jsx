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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Lok Password Manager</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Add Password
              </button>
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                </button>
                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4" />
                      Security Settings
                    </button>
                    <hr className="my-1" />
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 relative ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <Breadcrumb />
        {activeTab === 'vault' && <PasswordVault />}
        {activeTab === 'generator' && (
          <div className="max-w-md mx-auto">
            <PasswordGenerator />
          </div>
        )}
        {activeTab === 'security' && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Security Dashboard</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        )}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Site Name"
            value={formData.site_name}
            onChange={(e) => setFormData(prev => ({...prev, site_name: e.target.value}))}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="url"
            placeholder="Site URL"
            value={formData.site_url}
            onChange={(e) => setFormData(prev => ({...prev, site_url: e.target.value}))}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Add Password
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
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