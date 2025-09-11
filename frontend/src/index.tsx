declare global {
  function gtag(...args: any[]): void;
}
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initPerformanceMonitoring, optimizeImages, preloadCriticalResources } from './utils/performance';

// Performance optimizations
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Initialize performance monitoring
initPerformanceMonitoring();

// Optimize images after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  optimizeImages();
  preloadCriticalResources();
});

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring (simplified)
reportWebVitals((metric: any) => {
  console.log('Performance metric:', metric);
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Performance',
        value: Math.round(metric.value),
        non_interaction: true,
      });
    }
  }
});

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
