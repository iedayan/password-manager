import { useEffect, useRef } from 'react';

export const useAutoUpdate = (fetchFunction, interval = 30000) => {
  const intervalRef = useRef(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    // Handle visibility change
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      if (isActiveRef.current) {
        // Fetch immediately when tab becomes active
        fetchFunction();
        startPolling();
      } else {
        stopPolling();
      }
    };

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      intervalRef.current = setInterval(() => {
        if (isActiveRef.current) {
          fetchFunction();
        }
      }, interval);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Start polling
    startPolling();
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchFunction, interval]);

  return {
    start: () => {
      isActiveRef.current = true;
      fetchFunction();
    },
    stop: () => {
      isActiveRef.current = false;
    }
  };
};