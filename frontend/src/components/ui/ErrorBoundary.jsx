import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Sanitize error data before logging to prevent log injection
    const sanitizedError = {
      message: error?.message?.replace(/[\r\n\t]/g, ' ').substring(0, 200) || 'Unknown error',
      stack: error?.stack?.replace(/[\r\n\t]/g, ' ').substring(0, 500) || 'No stack trace',
      componentStack: errorInfo?.componentStack?.replace(/[\r\n\t]/g, ' ').substring(0, 300) || 'No component stack'
    };
    console.error('Error caught by boundary:', sanitizedError);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-6">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/60 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-slate-300 mb-6">
              An unexpected error occurred. Don't worry, your data is safe.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
              >
                Go to Home
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-slate-400 text-sm cursor-pointer">Error Details</summary>
                <pre className="text-xs text-red-300 mt-2 p-3 bg-slate-900/50 rounded overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;