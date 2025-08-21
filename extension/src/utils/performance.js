/**
 * Performance optimization utilities for Lok Password Manager Extension
 */

class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
    this.observers = new Map();
    this.init();
  }

  init() {
    this.setupMemoryManagement();
    this.setupCacheManagement();
    this.setupPerformanceMonitoring();
  }

  // Debounce utility
  debounce(key, func, delay = 300) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    const timer = setTimeout(() => {
      func();
      this.debounceTimers.delete(key);
    }, delay);
    
    this.debounceTimers.set(key, timer);
  }

  // Throttle utility
  throttle(key, func, delay = 100) {
    if (this.throttleTimers.has(key)) {
      return;
    }
    
    func();
    const timer = setTimeout(() => {
      this.throttleTimers.delete(key);
    }, delay);
    
    this.throttleTimers.set(key, timer);
  }

  // Efficient DOM queries with caching
  querySelector(selector, context = document, ttl = 5000) {
    const cacheKey = `query_${selector}_${context.tagName || 'document'}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < ttl) {
        return cached.element;
      }
    }
    
    const element = context.querySelector(selector);
    this.cache.set(cacheKey, {
      element,
      timestamp: Date.now()
    });
    
    return element;
  }

  // Batch DOM operations
  batchDOMOperations(operations) {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        operations.forEach(op => op());
        resolve();
      });
    });
  }

  // Lazy loading for heavy operations
  lazy(key, factory, ttl = 30000) {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
    }
    
    const value = factory();
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    
    return value;
  }

  // Efficient event delegation
  delegate(container, selector, event, handler) {
    const delegateKey = `${container.tagName}_${selector}_${event}`;
    
    if (this.observers.has(delegateKey)) {
      return;
    }
    
    const delegateHandler = (e) => {
      const target = e.target.closest(selector);
      if (target) {
        handler.call(target, e);
      }
    };
    
    container.addEventListener(event, delegateHandler);
    this.observers.set(delegateKey, { container, event, handler: delegateHandler });
  }

  // Memory management
  setupMemoryManagement() {
    // Clear cache periodically
    setInterval(() => {
      this.cleanupCache();
    }, 60000); // Every minute

    // Clear on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  setupCacheManagement() {
    // Limit cache size
    const maxCacheSize = 100;
    
    setInterval(() => {
      if (this.cache.size > maxCacheSize) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Remove oldest 20% of entries
        const toRemove = Math.floor(entries.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
          this.cache.delete(entries[i][0]);
        }
      }
    }, 30000);
  }

  setupPerformanceMonitoring() {
    if (typeof performance !== 'undefined' && performance.mark) {
      this.startTime = performance.now();
    }
  }

  cleanupCache(maxAge = 300000) { // 5 minutes
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }

  cleanup() {
    // Clear all timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.throttleTimers.forEach(timer => clearTimeout(timer));
    
    // Remove event listeners
    this.observers.forEach(({ container, event, handler }) => {
      container.removeEventListener(event, handler);
    });
    
    // Clear caches
    this.cache.clear();
    this.debounceTimers.clear();
    this.throttleTimers.clear();
    this.observers.clear();
  }

  // Performance measurement
  mark(name) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  measure(name, startMark, endMark) {
    if (typeof performance !== 'undefined' && performance.measure) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure ? measure.duration : 0;
    }
    return 0;
  }
}

// Export singleton instance
window.LokPerformance = new PerformanceOptimizer();