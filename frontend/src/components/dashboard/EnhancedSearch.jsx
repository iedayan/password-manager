import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon, TagIcon, FunnelIcon } from '@heroicons/react/24/outline';

const EnhancedSearch = ({ onSearch, onFilter, searchTerm, setSearchTerm, passwords = [] }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    strength: '',
    dateRange: '',
    tags: []
  });
  const searchRef = useRef(null);

  useEffect(() => {
    // Load search history from localStorage
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  useEffect(() => {
    // Generate suggestions based on actual password data
    if (searchTerm.length > 1 && passwords) {
      const passwordSuggestions = passwords
        .filter(p => 
          p.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .map(p => p.site_name)
        .slice(0, 3);
      
      const historySuggestions = searchHistory.filter(h => 
        h.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 2);
      
      setSuggestions([...passwordSuggestions, ...historySuggestions]);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, searchHistory, passwords]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    onSearch(term, filters);
    
    // Add to search history
    if (term && !searchHistory.includes(term)) {
      const newHistory = [term, ...searchHistory.slice(0, 9)];
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('', filters);
    setSuggestions([]);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div className="relative">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search passwords, sites, usernames... (⌘K)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchTerm);
              }
            }}
            className="search-bar w-full pl-12 pr-20 py-3 border border-slate-600/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700/80 backdrop-blur-sm text-white placeholder-slate-400 transition-all"
          />
          
          <div className="absolute right-3 flex items-center gap-2">
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="p-1 hover:bg-slate-600/60 rounded transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-slate-400" />
              </button>
            )}
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-2 rounded-lg transition-all ${
                showAdvanced ? 'bg-blue-600 text-white' : 'hover:bg-slate-600/60 text-slate-400'
              }`}
              title="Advanced Filters"
            >
              <FunnelIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        {(suggestions.length > 0 || searchHistory.length > 0) && searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600/60 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-slate-400 px-3 py-2 font-medium">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {searchHistory.length > 0 && !searchTerm && (
              <div className="p-2 border-t border-slate-600/60">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="text-xs text-slate-400 font-medium">Recent Searches</div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    Clear
                  </button>
                </div>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(item)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <ClockIcon className="w-4 h-4 text-slate-500" />
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 p-4 bg-slate-700/50 border border-slate-600/60 rounded-xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-600/60 rounded-lg text-white text-sm"
              >
                <option value="">All Categories</option>
                <option value="Banking">Banking</option>
                <option value="Social">Social</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>

            {/* Strength Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Strength</label>
              <select
                value={filters.strength}
                onChange={(e) => handleFilterChange('strength', e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-600/60 rounded-lg text-white text-sm"
              >
                <option value="">All Strengths</option>
                <option value="weak">Weak (&lt;60%)</option>
                <option value="medium">Medium (60-79%)</option>
                <option value="strong">Strong (80%+)</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Date Added</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-600/60 rounded-lg text-white text-sm"
              >
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Quick Actions */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Quick Filters</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('category', 'favorites')}
                  className="px-3 py-1 bg-yellow-600/20 text-yellow-300 rounded-lg text-sm hover:bg-yellow-600/30 transition-colors"
                >
                  Favorites
                </button>
                <button
                  onClick={() => handleFilterChange('category', 'duplicates')}
                  className="px-3 py-1 bg-orange-600/20 text-orange-300 rounded-lg text-sm hover:bg-orange-600/30 transition-colors"
                >
                  Duplicates
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true)) && (
            <div className="mt-4 pt-4 border-t border-slate-600/60">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Active filters:</span>
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-300 rounded-md text-xs"
                    >
                      {key}: {Array.isArray(value) ? value.join(', ') : value}
                      <button
                        onClick={() => handleFilterChange(key, Array.isArray(value) ? [] : '')}
                        className="hover:text-blue-200"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                <button
                  onClick={() => {
                    setFilters({ category: '', strength: '', dateRange: '', tags: [] });
                    onFilter({ category: '', strength: '', dateRange: '', tags: [] });
                  }}
                  className="text-xs text-slate-400 hover:text-slate-300 underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;