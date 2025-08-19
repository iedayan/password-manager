import { useState } from 'react';
import { UserIcon, ShieldCheckIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';
import { api } from "../../services/api";
import { LoadingSpinner, ErrorMessage } from '../ui';

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
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-500 via-gray-600 to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-500/30">
          <UserIcon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-slate-300 via-gray-200 to-slate-400 bg-clip-text text-transparent">Settings</h1>
        <p className="text-slate-300 text-lg">Manage your account and security preferences</p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <div className="bg-gradient-to-br from-slate-700/90 to-slate-800/80 rounded-3xl shadow-2xl border-2 border-slate-600/40 backdrop-blur-xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b-2 border-slate-600/40 bg-slate-800/50">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-5 text-sm font-semibold border-b-3 transition-all duration-300 relative ${
                  activeTab === tab.id
                    ? 'border-blue-400 text-blue-300 bg-blue-900/30'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
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
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-slate-600/50 to-slate-700/50 rounded-2xl p-8 border border-slate-500/30">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          Profile Information
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              className="w-full px-4 py-3 border border-slate-500/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/60 text-white placeholder-slate-400 backdrop-blur-sm"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Current Password</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({...prev, currentPassword: e.target.value}))}
              className="w-full px-4 py-3 border border-slate-500/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/60 text-white placeholder-slate-400 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({...prev, newPassword: e.target.value}))}
              className="w-full px-4 py-3 border border-slate-500/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/60 text-white placeholder-slate-400 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
              className="w-full px-4 py-3 border border-slate-500/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/60 text-white placeholder-slate-400 backdrop-blur-sm"
            />
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
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
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-slate-600/50 to-slate-700/50 rounded-2xl p-8 border border-slate-500/30">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          Active Sessions
        </h3>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-6 border border-slate-500/30 rounded-xl bg-slate-800/40 backdrop-blur-sm hover:bg-slate-700/40 transition-all">
              <div>
                <div className="font-semibold text-white">{session.device}</div>
                <div className="text-sm text-slate-300">{session.location} • {session.lastActive}</div>
                {session.current && (
                  <span className="inline-block mt-2 px-3 py-1 text-xs bg-green-500/20 text-green-300 rounded-full border border-green-400/30">
                    Current Session
                  </span>
                )}
              </div>
              {!session.current && (
                <button
                  onClick={() => handleLogoutSession(session.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-900/20 transition-all"
                >
                  Terminate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-600/50 to-slate-700/50 rounded-2xl p-8 border border-slate-500/30">
        <h3 className="text-2xl font-bold text-white mb-6">Two-Factor Authentication</h3>
        <div className="p-6 border border-slate-500/30 rounded-xl bg-slate-800/40 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Authenticator App</div>
              <div className="text-sm text-slate-300">Not configured</div>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
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
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-slate-600/50 to-slate-700/50 rounded-2xl p-8 border border-slate-500/30">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <ArrowDownTrayIcon className="w-5 h-5 text-white" />
          </div>
          Import & Export
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-slate-500/30 rounded-xl bg-slate-800/40 backdrop-blur-sm hover:bg-slate-700/40 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <ArrowDownTrayIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-white">Export Passwords</div>
                <div className="text-sm text-slate-300">Download as CSV file</div>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Export Data
            </button>
          </div>

          <div className="p-6 border border-slate-500/30 rounded-xl bg-slate-800/40 backdrop-blur-sm hover:bg-slate-700/40 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <ArrowUpTrayIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-white">Import Passwords</div>
                <div className="text-sm text-slate-300">Upload CSV file</div>
              </div>
            </div>
            <label className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 cursor-pointer text-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
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

      <div className="bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-2xl p-8 border-2 border-red-500/40">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <TrashIcon className="w-5 h-5 text-white" />
          </div>
          Danger Zone
        </h3>
        <div className="p-6 border border-red-500/30 rounded-xl bg-red-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <TrashIcon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="font-semibold text-white">Delete Account</div>
              <div className="text-sm text-red-300">Permanently delete your account and all data</div>
            </div>
          </div>
          <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;