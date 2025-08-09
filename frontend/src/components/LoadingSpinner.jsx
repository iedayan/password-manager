export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className="relative">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <svg className="w-full h-full" viewBox="0 0 24 24">
          <circle
            className="opacity-25 stroke-gray-300"
            cx="12"
            cy="12"
            r="10"
            fill="none"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            d="M12 2a10 10 0 0 1 10 10"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className={`absolute inset-0 ${sizeClasses[size]} animate-ping opacity-20`}>
        <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white/95 via-indigo-50/80 to-purple-50/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 relative">
              <div className="w-16 h-16 animate-spin">
                <svg className="w-full h-full" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25 stroke-gray-300"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    strokeWidth="2"
                  />
                  <path
                    className="opacity-75"
                    fill="none"
                    stroke="url(#loadingGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M12 2a10 10 0 0 1 10 10"
                  />
                  <defs>
                    <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="absolute inset-0 w-16 h-16 animate-ping opacity-20">
                <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Loading Lok</h3>
          <p className="text-sm text-gray-600 font-medium">Securing your digital world...</p>
        </div>
      </div>
    );
  }

  return spinner;
}