import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, KeyIcon, ShieldCheckIcon, Cog6ToothIcon, MagnifyingGlassIcon, CommandLineIcon } from '@heroicons/react/24/outline';

const QuickActions = ({ onAddPassword, onGlobalSearch }) => {
  const navigate = useNavigate();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setShowCommandPalette(true);
            break;
          case 'n':
            e.preventDefault();
            onAddPassword?.();
            break;
          case 'g':
            e.preventDefault();
            navigate('/dashboard?tab=generator');
            break;
        }
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate, onAddPassword]);

  const actions = [
    {
      name: 'Add Password',
      description: 'Save a new password',
      icon: PlusIcon,
      shortcut: '⌘N',
      onClick: () => onAddPassword?.(),
      color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
    {
      name: 'Generate Password',
      description: 'Create strong password',
      icon: KeyIcon,
      shortcut: '⌘G',
      onClick: () => navigate('/dashboard?tab=generator'),
      color: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    },
    {
      name: 'Quick Search',
      description: 'Find passwords instantly',
      icon: MagnifyingGlassIcon,
      shortcut: '⌘K',
      onClick: () => setShowCommandPalette(true),
      color: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
    },
    {
      name: 'Security Check',
      description: 'Scan for weak passwords',
      icon: ShieldCheckIcon,
      onClick: () => navigate('/dashboard?tab=security'),
      color: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
    }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => onAddPassword?.()}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          title="Add Password (⌘N)"
        >
          <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {actions.map((action) => (
          <button
            key={action.name}
            onClick={action.onClick}
            className={`bg-gradient-to-r ${action.color} text-white p-4 rounded-xl transition-all hover:shadow-lg transform hover:scale-105 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <action.icon className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">{action.name}</div>
              <div className="text-xs opacity-90 mt-1">{action.description}</div>
              {action.shortcut && (
                <div className="absolute top-2 right-2 text-xs bg-white/20 px-1.5 py-0.5 rounded opacity-70">
                  {action.shortcut}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette 
          onClose={() => setShowCommandPalette(false)}
          onAddPassword={onAddPassword}
          onNavigate={navigate}
        />
      )}
    </>
  );
};

const CommandPalette = ({ onClose, onAddPassword, onNavigate }) => {
  const [search, setSearch] = useState('');
  
  const commands = [
    { name: 'Add New Password', action: () => { onAddPassword?.(); onClose(); }, icon: PlusIcon },
    { name: 'Generate Password', action: () => { onNavigate('/dashboard?tab=generator'); onClose(); }, icon: KeyIcon },
    { name: 'Security Dashboard', action: () => { onNavigate('/dashboard?tab=security'); onClose(); }, icon: ShieldCheckIcon },
    { name: 'Settings', action: () => { onNavigate('/dashboard?tab=settings'); onClose(); }, icon: Cog6ToothIcon },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-32 z-50">
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-4 border-b border-slate-700/60">
          <div className="relative">
            <CommandLineIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Type a command or search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent text-white placeholder-slate-400 focus:outline-none text-lg"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredCommands.map((cmd, index) => (
            <button
              key={cmd.name}
              onClick={cmd.action}
              className="w-full px-4 py-3 text-left hover:bg-slate-700/60 flex items-center gap-3 text-white transition-colors"
            >
              <cmd.icon className="w-5 h-5 text-slate-400" />
              <span>{cmd.name}</span>
            </button>
          ))}
          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-400">
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;