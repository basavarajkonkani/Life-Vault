import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Performance monitoring utility
export const initPerformanceMonitoring = () => {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') return;

  // Core Web Vitals monitoring
  getCLS((metric) => {
    console.log('CLS:', metric);
    // Send to analytics service
    sendToAnalytics('CLS', metric.value);
  });

  getFID((metric) => {
    console.log('FID:', metric);
    sendToAnalytics('FID', metric.value);
  });

  getFCP((metric) => {
    console.log('FCP:', metric);
    sendToAnalytics('FCP', metric.value);
  });

  getLCP((metric) => {
    console.log('LCP:', metric);
    sendToAnalytics('LCP', metric.value);
  });

  getTTFB((metric) => {
    console.log('TTFB:', metric);
    sendToAnalytics('TTFB', metric.value);
  });
};

// Send metrics to analytics (implement based on your analytics service)
const sendToAnalytics = (metricName: string, value: number) => {
  // Example: Send to Google Analytics, Mixpanel, etc.
  if (typeof gtag !== 'undefined') {
    gtag('event', metricName, {
      event_category: 'Performance',
      value: Math.round(value),
      non_interaction: true,
    });
  }
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
