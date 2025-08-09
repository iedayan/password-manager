const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );

export default LoadingSpinner;