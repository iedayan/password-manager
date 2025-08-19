/**
 * Centralized error handling utilities
 */

export const ErrorTypes = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

export const getErrorType = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;
  
  if (error.message?.includes('Network error') || error.message?.includes('fetch')) {
    return ErrorTypes.NETWORK;
  }
  
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    return ErrorTypes.AUTH;
  }
  
  if (error.message?.includes('400') || error.message?.includes('validation')) {
    return ErrorTypes.VALIDATION;
  }
  
  if (error.message?.includes('500') || error.message?.includes('Internal')) {
    return ErrorTypes.SERVER;
  }
  
  return ErrorTypes.UNKNOWN;
};

export const getErrorMessage = (error, context = '') => {
  const type = getErrorType(error);
  
  const messages = {
    [ErrorTypes.NETWORK]: {
      title: 'Connection Problem',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      action: 'Retry'
    },
    [ErrorTypes.AUTH]: {
      title: 'Authentication Required',
      message: 'Your session has expired. Please log in again to continue.',
      action: 'Log In'
    },
    [ErrorTypes.VALIDATION]: {
      title: 'Invalid Input',
      message: error.message || 'Please check your input and try again.',
      action: 'Fix Input'
    },
    [ErrorTypes.SERVER]: {
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again in a moment.',
      action: 'Try Again'
    },
    [ErrorTypes.UNKNOWN]: {
      title: 'Unexpected Error',
      message: error.message || 'An unexpected error occurred. Please try again.',
      action: 'Retry'
    }
  };

  return messages[type];
};

export const handleApiError = (error, showToast, context = '') => {
  const errorInfo = getErrorMessage(error, context);
  
  showToast({
    type: 'error',
    title: errorInfo.title,
    message: errorInfo.message,
    action: errorInfo.action,
    duration: 5000
  });
  
  // Log error for debugging
  console.error(`[${context}] Error:`, error);
  
  return errorInfo;
};