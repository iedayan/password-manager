import { useState } from 'react';
import { PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import PasswordVault from './PasswordVault';
import PasswordGenerator from './PasswordGenerator';
import Breadcrumb from './Breadcrumb';
import { api } from '../lib/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('vault');
  const [showAddForm, setShowAddForm] = useState(false);

  const tabs = [
    { id: 'vault', name: 'Vault', icon: '🔐' },
    { id: 'generator', name: 'Generator', icon: '⚡' },
    { id: 'security', name: 'Security', icon: '🛡️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Lok Password Manager</h1>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4" />
                Add Password
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
            </div>
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