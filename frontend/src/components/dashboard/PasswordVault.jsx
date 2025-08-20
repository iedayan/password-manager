import { useState, useEffect, useMemo } from 'react';
import { MagnifyingGlassIcon, EyeIcon, ClipboardIcon, PencilIcon, TrashIcon, FunnelIcon, ChevronDownIcon, ShieldExclamationIcon, CheckCircleIcon, ExclamationTriangleIcon, Squares2X2Icon, ListBulletIcon, StarIcon, TagIcon, ClockIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { QuickActions } from '../dashboard';
import { EditPasswordModal, DeleteConfirmModal } from '../modals';
import { LoadingSpinner, ErrorMessage, Toast } from '../ui';
import { api } from "../../services/api";
import QuickActionsBar from './QuickActionsBar';
import EnhancedSearch from './EnhancedSearch';
import { CategoryIcon, StrengthIndicator, RecentlyAccessedSection, PasswordHealthBadges, FavoriteButton, AnimatedCounter, LoadingSkeletons } from './VisualEnhancements';
import { SmartCategorizer } from './SmartCategorization';
import MobilePasswordCard from '../ui/MobilePasswordCard';
import EmptyState from '../ui/EmptyState';
import { useVirtualList } from '../../hooks/useVirtualList';
import { useDebounce } from '../../hooks/useDebounce';
import { useAutoLock } from '../../hooks/useAutoLock';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Auto-lock functionality
  useAutoLock(() => {
    setToast({ type: 'warning', message: 'Session locked due to inactivity' });
  });

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
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleCategorize = async (passwordId, newCategory) => {
    try {
      await api.passwords.update(passwordId, { category: newCategory });
      setPasswords(prev => prev.map(p => 
        p.id === passwordId ? { ...p, category: newCategory } : p
      ));
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleEnhancedSearch = (term, filters) => {
    setSearchTerm(term);
    // Apply advanced filters here
  };

  const handleAdvancedFilter = (filters) => {
    // Apply advanced filters
    console.log('Advanced filters:', filters);
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Password Vault</h1>
        <LoadingSkeletons count={8} />
      </div>
    </div>
  );

  if (passwords.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState 
          type="passwords"
          onAction={() => setShowAddForm?.(true)}
        />
      </div>
    );
  }

  if (filteredPasswords.length === 0 && searchTerm) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState 
          type="search"
          onAction={() => setSearchTerm('')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
      
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-5 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Password Vault</h1>
            <p className="text-slate-300 text-sm mt-1 hidden sm:block">Secure storage for all your passwords</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xl sm:text-2xl font-bold text-blue-400">{stats.total}</span>
            <p className="text-xs text-slate-400">Total passwords</p>
          </div>
        </div>
        
        {/* Password Health Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6">
          <div className="bg-slate-700/80 border border-slate-600/60 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-300 uppercase tracking-wide">Total</p>
                <p className="text-lg sm:text-xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <ShieldExclamationIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
              </div>
            </div>
          </div>
          <div className="bg-green-900/60 border border-green-700/60 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-300 uppercase tracking-wide">Strong</p>
                <p className="text-lg sm:text-xl font-bold text-green-200">{stats.strong}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-800 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-yellow-900/60 border border-yellow-700/60 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-300 uppercase tracking-wide">Medium</p>
                <p className="text-lg sm:text-xl font-bold text-yellow-200">{stats.medium}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-800 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="bg-red-900/60 border border-red-700/60 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-300 uppercase tracking-wide">Weak</p>
                <p className="text-lg sm:text-xl font-bold text-red-200">{stats.weak}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-800 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              </div>
            </div>
          </div>
          <div className="bg-orange-900/60 border border-orange-700/60 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-300 uppercase tracking-wide">Duplicates</p>
                <p className="text-lg sm:text-xl font-bold text-orange-200">{stats.duplicates}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-800 rounded-lg flex items-center justify-center">
                <ClipboardIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              </div>
            </div>
          </div>
          <div className="bg-purple-900/60 border border-purple-700/60 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-300 uppercase tracking-wide">Old</p>
                <p className="text-lg sm:text-xl font-bold text-purple-200">{stats.old}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-800 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Categorization */}
      {passwords.length > 0 && (
        <SmartCategorizer 
          passwords={passwords}
          onCategorize={handleCategorize}
        />
      )}

      {/* Recently Accessed */}
      <RecentlyAccessedSection 
        passwords={passwords}
        onPasswordClick={(password) => setEditingPassword(password)}
      />

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

      {/* Enhanced Search */}
      <div className="mb-6">
        <EnhancedSearch 
          onSearch={handleEnhancedSearch}
          onFilter={handleAdvancedFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          passwords={passwords}
        />
      </div>

      {/* Password List */}
      <div className={isMobile ? 'space-y-3' : (viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-3' : 'space-y-2')}>
        {filteredPasswords.map((password) => 
          isMobile ? (
            <MobilePasswordCard
              key={password.id}
              password={password}
              onEdit={onEditPassword || setEditingPassword}
              onDelete={setDeletingPassword}
              onToggleFavorite={() => toggleFavorite(password.id)}
              onCopy={(text, type) => copyToClipboard(text, type)}
              onView={setShowMasterKeyModal}
            />
          ) : (
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
          )
        )}
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

      {/* Floating Quick Actions Bar */}
      <QuickActionsBar 
        onAddPassword={() => setShowAddForm?.(true)}
        onSearch={() => document.querySelector('.search-bar')?.focus()}
        onFilter={() => setShowFilters(!showFilters)}
        onExport={() => console.log('Export passwords')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedPasswords.size}
        onBulkAction={bulkDelete}
      />
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
    <div className={`bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm border rounded-2xl p-5 hover:shadow-2xl hover:from-slate-700/90 hover:to-slate-600/90 transition-all duration-300 group relative transform hover:scale-[1.02] ${
      isSelected ? 'border-blue-400 bg-gradient-to-br from-blue-900/30 to-blue-800/30 shadow-blue-500/20 shadow-lg' : 'border-slate-600/40 hover:border-slate-500/60'
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
            <div className={`bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-500/30 ${
              viewMode === 'grid' ? 'w-14 h-14' : 'w-12 h-12'
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
              <span className={`text-slate-200 font-bold ${faviconUrl ? 'hidden' : 'block'} ${
                viewMode === 'grid' ? 'text-lg' : 'text-base'
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
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-300 font-semibold tracking-wide">
                  {category}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 rounded-full bg-slate-600/50 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        (password.strength_score || 0) >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        (password.strength_score || 0) >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                      style={{ width: `${Math.max(5, password.strength_score || 0)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-300 min-w-[35px]">{password.strength_score || 0}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200 truncate flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  {password.username}
                </p>
                {password.site_url && (
                  <p className="text-xs text-slate-400 truncate pl-4 font-mono">{password.site_url}</p>
                )}
                {daysOld > 0 && (
                  <p className="text-xs text-slate-500 pl-4 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                    {daysOld} days old
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
          viewMode === 'grid' ? 'justify-center w-full mt-4' : 'ml-4'
        }`}>
          <button
            onClick={() => onCopy(password.username, 'Username')}
            className="p-2.5 text-slate-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-xl transition-all duration-200 hover:scale-110 border border-transparent hover:border-blue-500/30"
            title="Copy username"
          >
            <ClipboardIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onReveal(password.id)}
            className="p-2.5 text-slate-400 hover:text-green-300 hover:bg-green-600/20 rounded-xl transition-all duration-200 hover:scale-110 border border-transparent hover:border-green-500/30"
            title="View password"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(password)}
            className="p-2.5 text-slate-400 hover:text-purple-300 hover:bg-purple-600/20 rounded-xl transition-all duration-200 hover:scale-110 border border-transparent hover:border-purple-500/30"
            title="Edit password"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(password.id)}
            className="p-2.5 text-slate-400 hover:text-red-300 hover:bg-red-600/20 rounded-xl transition-all duration-200 hover:scale-110 border border-transparent hover:border-red-500/30"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm border border-gray-200/60 shadow-2xl">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Enter Master Key</h3>
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
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all text-sm font-medium"
            >
              {loading ? 'Decrypting...' : 'Reveal'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
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