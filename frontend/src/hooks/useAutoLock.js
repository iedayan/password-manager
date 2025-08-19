import { useEffect, useRef } from 'react';

export const useAutoLock = (onLock, timeout = 15 * 60 * 1000) => { // 15 minutes
  const timeoutRef = useRef(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onLock();
    }, timeout);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const resetTimerHandler = () => resetTimer();
    
    // Set initial timer
    resetTimer();
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimerHandler, true);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimerHandler, true);
      });
    };
  }, [onLock, timeout]);

  return resetTimer;
};