import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, EyeIcon, ClipboardIcon, PencilIcon, TrashIcon, FunnelIcon, ChevronDownIcon, ShieldExclamationIcon, CheckCircleIcon, ExclamationTriangleIcon, Squares2X2Icon, ListBulletIcon, StarIcon, TagIcon, ClockIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import QuickActions from './QuickActions';
import EditPasswordModal from './EditPasswordModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import Toast from './Toast';
import { api } from '../lib/api';

const PasswordVault = ({ showAddForm, setShowAddForm, onImportClick, onEditPassword, refreshTrigger }) => {
  const [passwords, setPasswords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMasterKeyModal, setShowMasterKeyModal] = useState(null);
  const [editingPassword, setEditingPassword] = useState(null);
  const [deletingPassword, setDeletingPassword] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedPasswords, setSelectedPasswords] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [categories, setCategories] = useState(new Map());
  const [toast, setToast] = useState(null);
  const [recentPasswords, setRecentPasswords] = useState(new Set());

  // Helper functions
  const detectDuplicates = () => {
    const passwordMap = new Map();
    passwords.forEach(p => {
      const key = p.password || 'empty';
      if (!passwordMap.has(key)) passwordMap.set(key, []);
      passwordMap.get(key).push(p);
    });
    return new Map([...passwordMap].filter(([key, passwords]) => passwords.length > 1 && key !== 'empty'));
  };

  const getDaysOld = (dateString) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const now = new Date();
    return Math.floor((now - date) / (1000 * 60 * 60 * 24));
  };

  const getPasswordCategory = (siteName) => {
    const site = siteName.toLowerCase();
    if (['bank', 'chase', 'wells', 'citi', 'paypal', 'venmo'].some(s => site.includes(s))) return 'Banking';
    if (['gmail', 'outlook', 'yahoo', 'proton'].some(s => site.includes(s))) return 'Email';
    if (['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'].some(s => site.includes(s))) return 'Social';
    if (['github', 'gitlab', 'aws', 'azure', 'docker'].some(s => site.includes(s))) return 'Work';
    if (['netflix', 'spotify', 'youtube', 'disney'].some(s => site.includes(s))) return 'Entertainment';
    return 'Personal';
  };

  useEffect(() => {
    fetchPasswords();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchPasswords();
    
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.querySelector('input[placeholder*="Search"]')?.focus();
            break;
          case 'n':
            e.preventDefault();
            setShowAddForm?.(true);
            break;
          case 'f':
            e.preventDefault();
            setFilterBy('favorites');
            break;
          case 'd':
            e.preventDefault();
            setFilterBy('duplicates');
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [setShowAddForm]);

  // Refresh passwords when add form closes
  useEffect(() => {
    if (!showAddForm) {
      fetchPasswords();
    }
  }, [showAddForm]);

  const fetchPasswords = async () => {
    try {
      setError('');
      const data = await api.passwords.getAll();
      setPasswords(data.passwords || data);
    } catch (error) {
      console.error('Failed to fetch passwords:', error);
      setError('Failed to load passwords. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const duplicates = detectDuplicates();
  
  const filteredPasswords = passwords
    .filter(p => {
      const matchesSearch = p.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.site_url && p.site_url.toLowerCase().includes(searchTerm.toLowerCase())) ||
        getPasswordCategory(p.site_name).toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'weak') return matchesSearch && (p.strength_score || 0) < 60;
      if (filterBy === 'strong') return matchesSearch && (p.strength_score || 0) >= 80;
      if (filterBy === 'medium') return matchesSearch && (p.strength_score || 0) >= 60 && (p.strength_score || 0) < 80;
      if (filterBy === 'favorites') return matchesSearch && favorites.has(p.id);
      if (filterBy === 'duplicates') return matchesSearch && duplicates.has(p.password);
      if (filterBy === 'old') return matchesSearch && getDaysOld(p.created_at) > 90;
      return matchesSearch;
    })
    .sort((a, b) => {
      // Favorites first if sorting by favorites
      if (sortBy === 'favorites') {
        const aFav = favorites.has(a.id);
        const bFav = favorites.has(b.id);
        if (aFav !== bFav) return bFav - aFav;
      }
      
      if (sortBy === 'name') return a.site_name.localeCompare(b.site_name);
      if (sortBy === 'strength') return (b.strength_score || 0) - (a.strength_score || 0);
      if (sortBy === 'recent') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'category') return getPasswordCategory(a.site_name).localeCompare(getPasswordCategory(b.site_name));
      return 0;
    });

  const getPasswordStats = () => {
    const total = passwords.length;
    const weak = passwords.filter(p => (p.strength_score || 0) < 60).length;
    const medium = passwords.filter(p => (p.strength_score || 0) >= 60 && (p.strength_score || 0) < 80).length;
    const strong = passwords.filter(p => (p.strength_score || 0) >= 80).length;
    const duplicateCount = duplicates.size;
    const oldCount = passwords.filter(p => getDaysOld(p.created_at) > 90).length;
    return { total, weak, medium, strong, duplicates: duplicateCount, old: oldCount };
  };

  const stats = getPasswordStats();

  const copyToClipboard = async (text, type = 'text') => {
    await navigator.clipboard.writeText(text);
    setToast({ message: `${type} copied to clipboard`, type: 'success' });
    // Auto-clear clipboard after 30 seconds
    setTimeout(() => navigator.clipboard.writeText(''), 30000);
  };

  const togglePasswordSelection = (passwordId) => {
    const newSelected = new Set(selectedPasswords);
    if (newSelected.has(passwordId)) {
      newSelected.delete(passwordId);
    } else {
      newSelected.add(passwordId);
    }
    setSelectedPasswords(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAllPasswords = () => {
    const allIds = new Set(filteredPasswords.map(p => p.id));
    setSelectedPasswords(allIds);
    setShowBulkActions(true);
  };

  const clearSelection = () => {
    setSelectedPasswords(new Set());
    setShowBulkActions(false);
  };

  const toggleFavorite = (passwordId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(passwordId)) {
      newFavorites.delete(passwordId);
    } else {
      newFavorites.add(passwordId);
    }
    setFavorites(newFavorites);
  };

  const bulkDelete = async () => {
    if (confirm(`Delete ${selectedPasswords.size} selected passwords?`)) {
      try {
        await Promise.all([...selectedPasswords].map(id => api.passwords.delete(id)));
        setPasswords(prev => prev.filter(p => !selectedPasswords.has(p.id)));
        clearSelection();
      } catch (error) {
        console.error('Failed to delete passwords:', error);
      }
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading vault..." />;

  if (passwords.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldExclamationIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">Your vault is empty</h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
            Start securing your digital life by adding your first password. All passwords are encrypted with military-grade security and stored safely.
          </p>
          <button 
            onClick={() => setShowAddForm?.(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            Add Your First Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
      
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Password Vault</h1>
            <p className="text-slate-300 text-sm mt-1">Secure storage for all your passwords</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-400">{stats.total}</span>
            <p className="text-xs text-slate-400">Total passwords</p>
          </div>
        </div>
        
        {/* Password Health Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-slate-700/80 border border-slate-600/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-300 uppercase tracking-wide">Total</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <ShieldExclamationIcon className="w-5 h-5 text-slate-300" />
              </div>
            </div>
          </div>
          <div className="bg-green-900/60 border border-green-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-300 uppercase tracking-wide">Strong</p>
                <p className="text-xl font-bold text-green-200">{stats.strong}</p>
              </div>
              <div className="w-8 h-8 bg-green-800 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-yellow-900/60 border border-yellow-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-300 uppercase tracking-wide">Medium</p>
                <p className="text-xl font-bold text-yellow-200">{stats.medium}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-800 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="bg-red-900/60 border border-red-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-300 uppercase tracking-wide">Weak</p>
                <p className="text-xl font-bold text-red-200">{stats.weak}</p>
              </div>
              <div className="w-8 h-8 bg-red-800 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
          <div className="bg-orange-900/60 border border-orange-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-300 uppercase tracking-wide">Duplicates</p>
                <p className="text-xl font-bold text-orange-200">{stats.duplicates}</p>
              </div>
              <div className="w-8 h-8 bg-orange-800 rounded-lg flex items-center justify-center">
                <ClipboardIcon className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </div>
          <div className="bg-purple-900/60 border border-purple-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-300 uppercase tracking-wide">Old</p>
                <p className="text-xl font-bold text-purple-200">{stats.old}</p>
              </div>
              <div className="w-8 h-8 bg-purple-800 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {passwords.length > 0 && <QuickActions onAddPassword={() => setShowAddForm?.(true)} />}

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-900/60 backdrop-blur-sm border border-blue-600/60 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-blue-200 font-medium">
              {selectedPasswords.size} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-blue-300 hover:text-white text-sm underline"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={bulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search passwords... (⌘K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-16 py-3 border border-slate-600/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700/80 backdrop-blur-sm text-sm transition-all text-white placeholder-slate-400"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-slate-400 bg-slate-600/80 px-2 py-1 rounded-md">
              ⌘K
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex border border-slate-600/60 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-3 flex items-center gap-2 text-sm transition-all ${
                viewMode === 'grid' ? 'bg-blue-900/60 text-blue-300' : 'text-slate-300 hover:bg-slate-600/80'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-3 flex items-center gap-2 text-sm transition-all border-l border-slate-600/60 ${
                viewMode === 'list' ? 'bg-blue-900/60 text-blue-300' : 'text-slate-300 hover:bg-slate-600/80'
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border border-slate-600/60 rounded-xl hover:bg-slate-600/80 flex items-center gap-2 text-sm transition-all ${
              showFilters ? 'bg-blue-900/60 border-blue-600 text-blue-300' : 'text-slate-300'
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showFilters && (
          <div className="bg-slate-700/90 backdrop-blur-sm border border-slate-600/60 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wide">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2.5 border border-slate-600/60 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-slate-800/80 text-white"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="strength">Password Strength</option>
                  <option value="recent">Recently Added</option>
                  <option value="favorites">Favorites First</option>
                  <option value="category">Category</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wide">Filter by</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full p-2.5 border border-slate-600/60 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-slate-800/80 text-white"
                >
                  <option value="all">All passwords</option>
                  <option value="favorites">Favorites</option>
                  <option value="strong">Strong (80%+)</option>
                  <option value="medium">Medium (60-79%)</option>
                  <option value="weak">Weak (&lt;60%)</option>
                  <option value="duplicates">Duplicates</option>
                  <option value="old">Old (90+ days)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wide">Bulk Actions</label>
                <button
                  onClick={selectAllPasswords}
                  className="w-full p-2.5 border border-slate-600/60 rounded-lg hover:bg-slate-600/80 text-sm text-slate-300 transition-colors"
                >
                  Select All ({filteredPasswords.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-2'}>
        {filteredPasswords.map((password) => (
          <PasswordCard 
            key={password.id} 
            password={password}
            viewMode={viewMode}
            isSelected={selectedPasswords.has(password.id)}
            isFavorite={favorites.has(password.id)}
            onCopy={(text, type) => copyToClipboard(text, type)}
            category={getPasswordCategory(password.site_name)}
            isDuplicate={duplicates.has(password.password)}
            daysOld={getDaysOld(password.created_at)}
            onReveal={setShowMasterKeyModal}
            onEdit={onEditPassword || setEditingPassword}
            onDelete={setDeletingPassword}
            onToggleSelect={() => togglePasswordSelection(password.id)}
            onToggleFavorite={() => toggleFavorite(password.id)}
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
            copyToClipboard(decryptedPassword, 'Password');
            setShowMasterKeyModal(null);
          }}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const PasswordCard = ({ password, viewMode, isSelected, isFavorite, onCopy, onReveal, onEdit, onDelete, onToggleSelect, onToggleFavorite, category, isDuplicate, daysOld }) => {
  const getStrengthColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getStrengthLabel = (score) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Medium';
    return 'Weak';
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
    <div className={`bg-slate-700/80 backdrop-blur-sm border rounded-xl p-4 hover:shadow-lg hover:bg-slate-600/80 transition-all duration-200 group relative ${
      isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600/60 hover:border-blue-500/60'
    }`}>
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 rounded focus:ring-blue-500"
        />
      </div>
      
      <div className={`flex items-center ${viewMode === 'list' ? 'justify-between' : 'flex-col gap-3'} ${isSelected ? 'ml-6' : ''}`}>
        <div className={`${viewMode === 'list' ? 'flex-1' : 'w-full text-center'}`}>
          <div className={`flex items-center gap-3 ${viewMode === 'grid' ? 'flex-col' : ''}`}>
            <div className={`bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 ${
              viewMode === 'grid' ? 'w-12 h-12' : 'w-10 h-10'
            }`}>
              {faviconUrl ? (
                <img 
                  src={faviconUrl} 
                  alt={`${password.site_name} favicon`}
                  className={viewMode === 'grid' ? 'w-8 h-8' : 'w-6 h-6'}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <span className={`text-blue-600 font-semibold ${faviconUrl ? 'hidden' : 'block'} ${
                viewMode === 'grid' ? 'text-base' : 'text-sm'
              }`}>
                {password.site_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`min-w-0 flex-1 ${viewMode === 'grid' ? 'text-center' : ''}`}>
              <div className={`flex items-center gap-2 mb-1 ${viewMode === 'grid' ? 'justify-center flex-wrap' : ''}`}>
                <h3 className={`font-semibold text-white truncate ${viewMode === 'grid' ? 'text-base' : 'text-sm'}`}>
                  {password.site_name}
                </h3>
                <button
                  onClick={onToggleFavorite}
                  className="p-1 hover:bg-slate-600/60 rounded transition-colors"
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorite ? (
                    <StarIconSolid className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-4 h-4 text-slate-400 hover:text-yellow-400" />
                  )}
                </button>
                {isDuplicate && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-orange-900/60 border border-orange-600 text-orange-200 font-medium" title="Duplicate password detected">
                    Duplicate
                  </span>
                )}
                {daysOld > 90 && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-purple-900/60 border border-purple-600 text-purple-200 font-medium" title={`${daysOld} days old`}>
                    Old
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-md bg-blue-900/60 border border-blue-600 text-blue-200 font-medium">
                  {category}
                </span>
                <div className="flex items-center gap-1">
                  <div className={`w-16 h-1.5 rounded-full overflow-hidden ${getStrengthColor(password.strength_score || 0).replace('text-', 'bg-').replace('border-', 'bg-').replace('100', '500')}`}>
                    <div 
                      className="h-full bg-current transition-all duration-300" 
                      style={{ width: `${password.strength_score || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400">{password.strength_score || 0}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 truncate">{password.username}</p>
              {password.site_url && (
                <p className="text-xs text-slate-400 truncate mt-0.5">{password.site_url}</p>
              )}
              {daysOld > 0 && (
                <p className="text-xs text-slate-500 mt-0.5">{daysOld} days old</p>
              )}
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity ${
          viewMode === 'grid' ? 'justify-center w-full' : 'ml-3'
        }`}>
          <button
            onClick={() => onCopy(password.username, 'Username')}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/40 rounded-lg transition-colors"
            title="Copy username (U)"
          >
            <ClipboardIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onReveal(password.id)}
            className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-900/40 rounded-lg transition-colors"
            title="Copy password"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(password)}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/40 rounded-lg transition-colors"
            title="Edit password"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(password.id)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/40 rounded-lg transition-colors"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-sm border border-gray-200/60 shadow-2xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Enter Master Key</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Master key"
            value={masterKey}
            onChange={(e) => setMasterKey(e.target.value)}
            className="w-full p-3 border border-gray-200/60 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 text-sm"
            autoFocus
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all text-sm font-medium"
            >
              {loading ? 'Decrypting...' : 'Reveal'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
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