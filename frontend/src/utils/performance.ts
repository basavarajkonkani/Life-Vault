// Performance monitoring utility (simplified version)
export const initPerformanceMonitoring = () => {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') return;

  // Simple performance monitoring without web-vitals
  console.log('Performance monitoring enabled');
  
  // Monitor page load time
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log('Page load time:', loadTime, 'ms');
    
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_load_time', {
        event_category: 'Performance',
        value: Math.round(loadTime),
        non_interaction: true,
      });
    }
  });
};

// Performance optimization utilities
export const optimizeImages = () => {
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    // Add loading="lazy" for images below the fold
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Add decoding="async" for better performance
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
};

export const preloadCriticalResources = () => {
  // Preload critical API endpoints
  const criticalEndpoints = [
    '/api/dashboard/batch',
    '/api/dashboard/stats',
  ];

  criticalEndpoints.forEach((endpoint) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = endpoint;
    document.head.appendChild(link);
  });
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
