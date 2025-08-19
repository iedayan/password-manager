import { useState, useEffect } from 'react';
import { SparklesIcon, TagIcon, FolderIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Smart categorization rules
const categorizationRules = {
  Banking: {
    keywords: ['bank', 'chase', 'wells', 'citi', 'paypal', 'venmo', 'credit', 'debit', 'finance', 'investment'],
    domains: ['chase.com', 'wellsfargo.com', 'bankofamerica.com', 'paypal.com', 'venmo.com']
  },
  Social: {
    keywords: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'snapchat', 'discord', 'reddit'],
    domains: ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'tiktok.com', 'discord.com']
  },
  Work: {
    keywords: ['slack', 'teams', 'zoom', 'office', 'work', 'corporate', 'company', 'enterprise'],
    domains: ['slack.com', 'teams.microsoft.com', 'zoom.us', 'office.com', 'sharepoint.com']
  },
  Shopping: {
    keywords: ['amazon', 'ebay', 'shop', 'store', 'buy', 'cart', 'retail', 'marketplace'],
    domains: ['amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com']
  },
  Entertainment: {
    keywords: ['netflix', 'spotify', 'youtube', 'disney', 'hulu', 'music', 'video', 'stream'],
    domains: ['netflix.com', 'spotify.com', 'youtube.com', 'disneyplus.com', 'hulu.com']
  },
  Email: {
    keywords: ['gmail', 'outlook', 'yahoo', 'mail', 'email', 'proton'],
    domains: ['gmail.com', 'outlook.com', 'yahoo.com', 'protonmail.com']
  },
  Gaming: {
    keywords: ['steam', 'xbox', 'playstation', 'nintendo', 'game', 'gaming', 'epic'],
    domains: ['steam.com', 'xbox.com', 'playstation.com', 'nintendo.com', 'epicgames.com']
  }
};

export const SmartCategorizer = ({ passwords, onCategorize }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePasswords = () => {
    setIsAnalyzing(true);
    
    const newSuggestions = [];
    
    passwords.forEach(password => {
      const currentCategory = password.category || 'Personal';
      const suggestedCategory = categorizePassword(password);
      
      if (suggestedCategory && suggestedCategory !== currentCategory) {
        newSuggestions.push({
          passwordId: password.id,
          siteName: password.site_name,
          currentCategory,
          suggestedCategory,
          confidence: calculateConfidence(password, suggestedCategory)
        });
      }
    });
    
    setSuggestions(newSuggestions.sort((a, b) => b.confidence - a.confidence));
    setIsAnalyzing(false);
  };

  const categorizePassword = (password) => {
    const siteName = password.site_name.toLowerCase();
    const siteUrl = (password.site_url || '').toLowerCase();
    
    for (const [category, rules] of Object.entries(categorizationRules)) {
      // Check keywords
      const keywordMatch = rules.keywords.some(keyword => 
        siteName.includes(keyword) || siteUrl.includes(keyword)
      );
      
      // Check domains
      const domainMatch = rules.domains.some(domain => 
        siteUrl.includes(domain)
      );
      
      if (keywordMatch || domainMatch) {
        return category;
      }
    }
    
    return null;
  };

  const calculateConfidence = (password, category) => {
    const siteName = password.site_name.toLowerCase();
    const siteUrl = (password.site_url || '').toLowerCase();
    const rules = categorizationRules[category];
    
    let confidence = 0;
    
    // Exact domain match = high confidence
    if (rules.domains.some(domain => siteUrl.includes(domain))) {
      confidence += 0.8;
    }
    
    // Keyword match in site name = medium confidence
    if (rules.keywords.some(keyword => siteName.includes(keyword))) {
      confidence += 0.6;
    }
    
    // Keyword match in URL = lower confidence
    if (rules.keywords.some(keyword => siteUrl.includes(keyword))) {
      confidence += 0.4;
    }
    
    return Math.min(confidence, 1.0);
  };

  const applySuggestion = (suggestion) => {
    onCategorize(suggestion.passwordId, suggestion.suggestedCategory);
    setSuggestions(prev => prev.filter(s => s.passwordId !== suggestion.passwordId));
  };

  const applyAllSuggestions = () => {
    suggestions.forEach(suggestion => {
      onCategorize(suggestion.passwordId, suggestion.suggestedCategory);
    });
    setSuggestions([]);
  };

  const dismissSuggestion = (passwordId) => {
    setSuggestions(prev => prev.filter(s => s.passwordId !== passwordId));
  };

  // Remove auto-analysis - only run when manually triggered

  if (suggestions.length === 0 && !isAnalyzing) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-600/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Smart Categorization</h3>
            {isAnalyzing && (
              <ArrowPathIcon className="w-4 h-4 text-blue-400 animate-spin" />
            )}
          </div>
          
          {suggestions.length === 0 && !isAnalyzing && (
            <button
              onClick={analyzePasswords}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Analyze Passwords
            </button>
          )}
          
          {suggestions.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={applyAllSuggestions}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Apply All ({suggestions.length})
              </button>
              <button
                onClick={() => setSuggestions([])}
                className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Dismiss All
              </button>
            </div>
          )}
        </div>

        {isAnalyzing ? (
          <div className="text-center py-4">
            <div className="text-slate-300">Analyzing passwords for better organization...</div>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-blue-300 mb-3">
              Found {suggestions.length} categorization suggestions to improve organization:
            </div>
            
            {suggestions.slice(0, 5).map((suggestion) => (
              <div
                key={suggestion.passwordId}
                className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-slate-600/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {suggestion.siteName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <div className="font-medium text-white">{suggestion.siteName}</div>
                    <div className="text-sm text-slate-400">
                      Move from <span className="text-slate-300">{suggestion.currentCategory}</span> to{' '}
                      <span className="text-blue-300">{suggestion.suggestedCategory}</span>
                      <span className="ml-2 text-xs">
                        ({Math.round(suggestion.confidence * 100)}% confidence)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => applySuggestion(suggestion)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => dismissSuggestion(suggestion.passwordId)}
                    className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
            
            {suggestions.length > 5 && (
              <div className="text-center text-sm text-slate-400">
                And {suggestions.length - 5} more suggestions...
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-green-300">✓ All passwords are properly categorized!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CategoryManager = ({ categories, onCreateCategory, onUpdateCategory, onDeleteCategory }) => {
  const [showManager, setShowManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      onCreateCategory({
        name: newCategoryName.trim(),
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
        icon: '📁'
      });
      setNewCategoryName('');
    }
  };

  if (!showManager) {
    return (
      <button
        onClick={() => setShowManager(true)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-all text-sm"
      >
        <FolderIcon className="w-4 h-4" />
        Manage Categories
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-600/60 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Manage Categories</h3>
        
        {/* Create New Category */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
            />
            <button
              onClick={handleCreateCategory}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Category List */}
        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {Object.entries(categories).map(([name, category]) => (
            <div key={name} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span>{category.icon}</span>
                <span className="text-white">{name}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingCategory(name)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDeleteCategory(name)}
                  className="p-1 text-slate-400 hover:text-red-400"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowManager(false)}
          className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default { SmartCategorizer, CategoryManager };