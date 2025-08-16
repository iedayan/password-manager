import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon, EyeIcon, EyeSlashIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import QuickActions from './QuickActions';

const PasswordVault = () => {
  const [passwords, setPasswords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMasterKeyModal, setShowMasterKeyModal] = useState(null);

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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/passwords', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPasswords(data);
    } catch (error) {
      console.error('Failed to fetch passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPasswords = passwords.filter(p => 
    p.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    // Auto-clear clipboard after 30 seconds
    setTimeout(() => navigator.clipboard.writeText(''), 30000);
  };

  if (loading) return <div className="flex justify-center p-8">Loading vault...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Password Vault</h1>
        <span className="text-sm text-gray-500">{passwords.length} passwords</span>
      </div>

      {/* Quick Actions */}
      <QuickActions onAddPassword={() => console.log('Add password')} />

      {/* Search Bar */}
      <div className="relative mb-6">
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

      {/* Password List */}
      <div className="space-y-3">
        {filteredPasswords.map((password) => (
          <PasswordCard 
            key={password.id} 
            password={password}
            onCopy={copyToClipboard}
            onReveal={setShowMasterKeyModal}
          />
        ))}
      </div>

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

const PasswordCard = ({ password, onCopy, onReveal }) => {
  const getStrengthColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {password.site_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium">{password.site_name}</h3>
              <p className="text-sm text-gray-500">{password.username}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded ${getStrengthColor(password.strength_score)}`}>
            {password.strength_score}%
          </span>
          <button
            onClick={() => onCopy(password.username)}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Copy username"
          >
            <ClipboardIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onReveal(password.id)}
            className="p-2 text-gray-400 hover:text-blue-600"
            title="Reveal password"
          >
            <EyeIcon className="w-4 h-4" />
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/passwords/${passwordId}/decrypt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ master_key: masterKey })
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(data.password);
      } else {
        alert('Invalid master key');
      }
    } catch (error) {
      console.error('Failed to decrypt:', error);
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