import { useState, useLayoutEffect } from 'react';

/**
 * A custom hook to determine the toast position based on screen width.
 * @param {number} breakpoint - The width in pixels to switch between mobile and desktop positions.
 * @returns {'top-center' | 'bottom-right'} The position for the toast container.
 */
const useResponsivePosition = (breakpoint = 768) => {
  const [position, setPosition] = useState('bottom-right');

  useLayoutEffect(() => {
    const updatePosition = () => {
      setPosition(window.innerWidth < breakpoint ? 'top-center' : 'bottom-right');
    };

    window.addEventListener('resize', updatePosition);
    updatePosition(); // Set initial position on mount

    return () => window.removeEventListener('resize', updatePosition);
  }, [breakpoint]);

  return position;
};

export default useResponsivePosition;