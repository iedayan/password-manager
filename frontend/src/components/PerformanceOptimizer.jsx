import { useEffect } from 'react';

export const PerformanceOptimizer = () => {
  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=300&fit=crop&crop=face'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      criticalImages.forEach(src => {
        const link = document.querySelector(`link[href="${src}"]`);
        if (link) document.head.removeChild(link);
      });
    };
  }, []);

  return null;
};