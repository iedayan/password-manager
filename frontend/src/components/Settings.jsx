import { useState } from 'react';
import { UserIcon, ShieldCheckIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';
import { api } from '../lib/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useToast();

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'data', name: 'Data', icon: ArrowDownTrayIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and security preferences</p>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError('')} />}


        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading && <LoadingSpinner />}
            
            {activeTab === 'profile' && (
              <ProfileSettings 
                setLoading={setLoading} 
                setError={setError} 
                showSuccess={showSuccess}
                showError={showError}
              />
            )}
            
            {activeTab === 'security' && (
              <SecuritySettings 
                setLoading={setLoading} 
                setError={setError} 
                showSuccess={showSuccess}
                showError={showError}
              />
            )}
            
            {activeTab === 'data' && (
              <DataSettings 
                setLoading={setLoading} 
                setError={setError} 
                showSuccess={showSuccess}
                showError={showError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSettings = ({ setLoading, setError, showSuccess, showError }) => {
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({...prev, currentPassword: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({...prev, newPassword: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

const SecuritySettings = ({ setLoading, setError, showSuccess, showError }) => {
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'New York, US', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'New York, US', lastActive: '1 hour ago', current: false }
  ]);

  const handleLogoutSession = async (sessionId) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      showSuccess('Session terminated successfully');
    } catch (error) {
      showError('Failed to terminate session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{session.device}</div>
                <div className="text-sm text-gray-500">{session.location} • {session.lastActive}</div>
                {session.current && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    Current Session
                  </span>
                )}
              </div>
              {!session.current && (
                <button
                  onClick={() => handleLogoutSession(session.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Terminate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Authenticator App</div>
              <div className="text-sm text-gray-500">Not configured</div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DataSettings = ({ setLoading, setError, showSuccess, showError }) => {
  const handleExport = async () => {
    setLoading(true);
    try {
      const passwords = await api.passwords.getAll();
      const csvContent = generateCSV(passwords);
      downloadCSV(csvContent, 'lok-passwords-export.csv');
      showSuccess('Passwords exported successfully');
    } catch (error) {
      showError('Failed to export passwords');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const csvText = await file.text();
      const passwords = parseCSV(csvText);
      
      for (const password of passwords) {
        await api.passwords.create(password);
      }
      
      showSuccess(`Imported ${passwords.length} passwords successfully`);
    } catch (error) {
      showError('Failed to import passwords. Please check file format.');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const generateCSV = (passwords) => {
    const headers = ['Site Name', 'Site URL', 'Username', 'Password'];
    const rows = passwords.map(p => [p.site_name, p.site_url, p.username, '***ENCRYPTED***']);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        site_name: values[0] || '',
        site_url: values[1] || '',
        username: values[2] || '',
        password: values[3] || ''
      };
    });
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import & Export</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <ArrowDownTrayIcon className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Export Passwords</div>
                <div className="text-sm text-gray-500">Download as CSV file</div>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export Data
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <ArrowUpTrayIcon className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Import Passwords</div>
                <div className="text-sm text-gray-500">Upload CSV file</div>
              </div>
            </div>
            <label className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-center">
              Choose File
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-3 mb-3">
            <TrashIcon className="w-6 h-6 text-red-600" />
            <div>
              <div className="font-medium text-red-900">Delete Account</div>
              <div className="text-sm text-red-700">Permanently delete your account and all data</div>
            </div>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;