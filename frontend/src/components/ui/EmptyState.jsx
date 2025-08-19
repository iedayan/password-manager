import { PlusIcon, MagnifyingGlassIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ 
  type = 'passwords', 
  onAction, 
  actionLabel = 'Add Password',
  title,
  description 
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'passwords':
        return {
          icon: ShieldCheckIcon,
          title: title || 'No passwords yet',
          description: description || 'Start building your secure password vault by adding your first password.',
          actionLabel: actionLabel || 'Add Your First Password',
          gradient: 'from-blue-500 to-indigo-500'
        };
      case 'search':
        return {
          icon: MagnifyingGlassIcon,
          title: title || 'No results found',
          description: description || 'Try adjusting your search terms or filters to find what you\'re looking for.',
          actionLabel: actionLabel || 'Clear Search',
          gradient: 'from-slate-500 to-gray-500'
        };
      default:
        return {
          icon: PlusIcon,
          title: title || 'Nothing here yet',
          description: description || 'Get started by adding some content.',
          actionLabel: actionLabel || 'Get Started',
          gradient: 'from-blue-500 to-indigo-500'
        };
    }
  };

  const config = getEmptyStateConfig();
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Main Icon with Enhanced Design */}
      <div className="relative mb-8">
        <div className={`w-24 h-24 bg-gradient-to-br ${config.gradient} rounded-3xl flex items-center justify-center shadow-2xl border border-white/10`}>
          <Icon className="w-12 h-12 text-white" />
        </div>
        <div className={`absolute -inset-2 bg-gradient-to-br ${config.gradient} rounded-3xl opacity-20 blur-xl`}></div>
      </div>
      
      {/* Title with Better Typography */}
      <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
        {config.title}
      </h3>
      
      {/* Description with Better Spacing */}
      <p className="text-slate-300 mb-10 max-w-lg leading-relaxed text-lg">
        {config.description}
      </p>
      
      {/* Enhanced Action Button */}
      {onAction && (
        <button
          onClick={onAction}
          className={`bg-gradient-to-r ${config.gradient} hover:shadow-2xl text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:scale-105 flex items-center gap-3 text-lg border border-white/10`}
        >
          <PlusIcon className="w-6 h-6" />
          {config.actionLabel}
        </button>
      )}
      
      {/* Enhanced Feature Cards */}
      {type === 'passwords' && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm border border-slate-600/40 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
            </div>
            <div className="text-blue-300 font-bold text-lg mb-2">Secure</div>
            <div className="text-slate-300 text-sm leading-relaxed">Military-grade encryption protects your sensitive data</div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm border border-slate-600/40 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
            </div>
            <div className="text-green-300 font-bold text-lg mb-2">Fast</div>
            <div className="text-slate-300 text-sm leading-relaxed">Lightning-fast access to all your passwords</div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm border border-slate-600/40 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
            </div>
            <div className="text-purple-300 font-bold text-lg mb-2">Smart</div>
            <div className="text-slate-300 text-sm leading-relaxed">AI-powered suggestions and security insights</div>
          </div>
        </div>
      )}
      
      {/* Additional Help Text */}
      {type === 'passwords' && (
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Need help getting started? Check out our{' '}
            <button className="text-blue-400 hover:text-blue-300 underline transition-colors">
              quick start guide
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default EmptyState;