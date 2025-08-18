import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, EyeIcon, ClipboardIcon, PencilIcon, TrashIcon, FunnelIcon, ChevronDownIcon, ShieldExclamationIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import QuickActions from './QuickActions';
import EditPasswordModal from './EditPasswordModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { api } from '../lib/api';

const PasswordVault = () => {
  const [passwords, setPasswords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMasterKeyModal, setShowMasterKeyModal] = useState(null);
  const [editingPassword, setEditingPassword] = useState(null);
  const [deletingPassword, setDeletingPassword] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPasswords();
    
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.querySelector('input[placeholder="Search passwords..."]')?.focus();
            break;
          case 'n':
            e.preventDefault();
            console.log('Add new password');
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const fetchPasswords = async () => {
    try {
      const data = await api.passwords.getAll();
      setPasswords(data.passwords || data);
    } catch (error) {
      console.error('Failed to fetch passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPasswords = passwords
    .filter(p => {
      const matchesSearch = p.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'weak') return matchesSearch && (p.strength_score || 0) < 60;
      if (filterBy === 'strong') return matchesSearch && (p.strength_score || 0) >= 80;
      if (filterBy === 'medium') return matchesSearch && (p.strength_score || 0) >= 60 && (p.strength_score || 0) < 80;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.site_name.localeCompare(b.site_name);
      if (sortBy === 'strength') return (b.strength_score || 0) - (a.strength_score || 0);
      if (sortBy === 'recent') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      return 0;
    });

  const getPasswordStats = () => {
    const total = passwords.length;
    const weak = passwords.filter(p => (p.strength_score || 0) < 60).length;
    const medium = passwords.filter(p => (p.strength_score || 0) >= 60 && (p.strength_score || 0) < 80).length;
    const strong = passwords.filter(p => (p.strength_score || 0) >= 80).length;
    return { total, weak, medium, strong };
  };

  const stats = getPasswordStats();

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    // Auto-clear clipboard after 30 seconds
    setTimeout(() => navigator.clipboard.writeText(''), 30000);
  };

  if (loading) return (
    <div className="flex justify-center items-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Loading vault...</span>
    </div>
  );

  if (passwords.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldExclamationIcon className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your vault is empty</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start securing your digital life by adding your first password. All passwords are encrypted with military-grade security.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Add Your First Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Password Vault</h1>
          <span className="text-sm text-gray-500">{stats.total} passwords</span>
        </div>
        
        {/* Password Health Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <ShieldExclamationIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Strong</p>
                <p className="text-2xl font-bold text-green-600">{stats.strong}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Medium</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Weak</p>
                <p className="text-2xl font-bold text-red-600">{stats.weak}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onAddPassword={() => console.log('Add password')} />

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search passwords... (Ctrl+K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-20 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              ⌘K
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showFilters && (
          <div className="bg-white border rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="strength">Password Strength</option>
                  <option value="recent">Recently Added</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by strength</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All passwords</option>
                  <option value="strong">Strong (80%+)</option>
                  <option value="medium">Medium (60-79%)</option>
                  <option value="weak">Weak (&lt;60%)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password List */}
      <div className="space-y-3">
        {filteredPasswords.map((password) => (
          <PasswordCard 
            key={password.id} 
            password={password}
            onCopy={copyToClipboard}
            onReveal={setShowMasterKeyModal}
            onEdit={setEditingPassword}
            onDelete={setDeletingPassword}
          />
        ))}
      </div>

      {/* Edit Password Modal */}
      {editingPassword && (
        <EditPasswordModal
          password={editingPassword}
          onClose={() => setEditingPassword(null)}
          onUpdate={(updatedPassword) => {
            setPasswords(prev => prev.map(p => 
              p.id === updatedPassword.id ? updatedPassword : p
            ));
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingPassword && (
        <DeleteConfirmModal
          passwordId={deletingPassword}
          onClose={() => setDeletingPassword(null)}
          onConfirm={async () => {
            try {
              await api.passwords.delete(deletingPassword);
              setPasswords(prev => prev.filter(p => p.id !== deletingPassword));
              setDeletingPassword(null);
            } catch (error) {
              console.error('Failed to delete password:', error);
            }
          }}
        />
      )}

      {/* Master Key Modal */}
      {showMasterKeyModal && (
        <MasterKeyModal 
          passwordId={showMasterKeyModal}
          onClose={() => setShowMasterKeyModal(null)}
          onSuccess={(decryptedPassword) => {
            copyToClipboard(decryptedPassword);
            setShowMasterKeyModal(null);
          }}
        />
      )}
    </div>
  );
};

const PasswordCard = ({ password, onCopy, onReveal, onEdit, onDelete }) => {
  const getStrengthColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getFaviconUrl = (siteUrl) => {
    try {
      const domain = new URL(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(password.site_url);

  return (
    <div className="bg-white border rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center overflow-hidden">
              {faviconUrl ? (
                <img 
                  src={faviconUrl} 
                  alt={`${password.site_name} favicon`}
                  className="w-8 h-8"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <span className={`text-blue-600 font-bold text-lg ${faviconUrl ? 'hidden' : 'block'}`}>
                {password.site_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{password.site_name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full border ${getStrengthColor(password.strength_score || 0)}`}>
                  {password.strength_score || 0}%
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{password.username}</p>
              {password.site_url && (
                <p className="text-xs text-gray-400 truncate">{password.site_url}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => onCopy(password.username)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Copy username"
          >
            <ClipboardIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onReveal(password.id)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Copy password"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(password)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit password"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(password.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete password"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MasterKeyModal = ({ passwordId, onClose, onSuccess }) => {
  const [masterKey, setMasterKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.passwords.decrypt(passwordId, masterKey);
      onSuccess(data.password);
    } catch (error) {
      console.error('Failed to decrypt:', error);
      alert(error.message || 'Invalid master key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Enter Master Key</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Master key"
            value={masterKey}
            onChange={(e) => setMasterKey(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            autoFocus
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Decrypting...' : 'Reveal'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordVault;