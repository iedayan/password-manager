import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [focusVisible, setFocusVisible] = useState(false);

  useEffect(() => {
    // Load accessibility preferences
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true';
    const savedFontSize = localStorage.getItem('fontSize') || 'normal';

    setHighContrast(savedHighContrast);
    setReducedMotion(savedReducedMotion);
    setFontSize(savedFontSize);

    // Check system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setReducedMotion(true);
    }

    // Apply classes to document
    updateDocumentClasses(savedHighContrast, savedReducedMotion, savedFontSize);
  }, []);

  const updateDocumentClasses = (contrast, motion, size) => {
    const root = document.documentElement;
    
    // High contrast
    if (contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (motion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Font size
    root.classList.remove('font-small', 'font-normal', 'font-large');
    root.classList.add(`font-${size}`);
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue.toString());
    updateDocumentClasses(newValue, reducedMotion, fontSize);
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem('reducedMotion', newValue.toString());
    updateDocumentClasses(highContrast, newValue, fontSize);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    updateDocumentClasses(highContrast, reducedMotion, size);
  };

  // Keyboard navigation helper
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const value = {
    highContrast,
    reducedMotion,
    fontSize,
    focusVisible,
    toggleHighContrast,
    toggleReducedMotion,
    changeFontSize
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};