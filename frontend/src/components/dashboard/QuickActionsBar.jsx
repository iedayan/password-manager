import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon, Squares2X2Icon, ListBulletIcon, CommandLineIcon } from '@heroicons/react/24/outline';

const QuickActionsBar = ({ 
  onAddPassword, 
  onSearch, 
  onFilter, 
  onExport, 
  viewMode, 
  onViewModeChange,
  selectedCount = 0,
  onBulkAction
}) => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const shortcuts = [
    { key: '⌘+N', action: 'Add Password', handler: onAddPassword },
    { key: '⌘+K', action: 'Search', handler: () => document.querySelector('.search-bar')?.focus() },
    { key: '⌘+F', action: 'Filter', handler: onFilter },
    { key: '⌘+E', action: 'Export', handler: onExport },
    { key: '⌘+1', action: 'Grid View', handler: () => onViewModeChange('grid') },
    { key: '⌘+2', action: 'List View', handler: () => onViewModeChange('list') }
  ];

  return (
    <>
      {/* Floating Quick Actions Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-600/60 rounded-2xl shadow-2xl p-3">
          <div className="flex items-center gap-2">
            {/* Add Password */}
            <button
              onClick={onAddPassword}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 group"
              title="Add Password (⌘+N)"
            >
              <PlusIcon className="w-5 h-5" />
            </button>

            {/* Search */}
            <button
              onClick={() => document.querySelector('.search-bar')?.focus()}
              className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition-all group"
              title="Search (⌘+K)"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Filter */}
            <button
              onClick={onFilter}
              className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition-all group"
              title="Filter (⌘+F)"
            >
              <FunnelIcon className="w-5 h-5" />
            </button>

            {/* Export */}
            <button
              onClick={onExport}
              className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition-all group"
              title="Export (⌘+E)"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>

            {/* View Mode Toggle */}
            <div className="flex border border-slate-600/60 rounded-xl overflow-hidden">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-3 transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                }`}
                title="Grid View (⌘+1)"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-3 transition-all border-l border-slate-600/60 ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                }`}
                title="List View (⌘+2)"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Keyboard Shortcuts */}
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition-all group"
              title="Keyboard Shortcuts"
            >
              <CommandLineIcon className="w-5 h-5" />
            </button>

            {/* Selected Count */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-900/60 border border-blue-600/60 rounded-xl">
                <span className="text-blue-200 text-sm font-medium">
                  {selectedCount} selected
                </span>
                <button
                  onClick={() => onBulkAction('delete')}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-600/60 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-slate-300">{shortcut.action}</span>
                  <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActionsBar;