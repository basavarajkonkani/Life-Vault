import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  isSlowConnection: boolean;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
      const renderTime = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      
      // Memory usage (if available)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0;
      
      // Check connection speed
      const connection = (navigator as any).connection;
      const isSlowConnection = connection ? connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' : false;

      setMetrics({
        loadTime,
        renderTime,
        memoryUsage,
        isSlowConnection
      });
    };

    // Measure after component mount
    const timer = setTimeout(measurePerformance, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null;
  }

  const getPerformanceColor = (value: number, thresholds: { good: number; ok: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.ok) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 max-w-xs z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Performance</h3>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-400 hover:text-gray-600"
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>
      
      {isVisible && (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Load Time:</span>
            <span className={getPerformanceColor(metrics.loadTime, { good: 1000, ok: 3000 })}>
              {metrics.loadTime.toFixed(0)}ms
            </span>
          </div>
          <div className="flex justify-between">
            <span>Render Time:</span>
            <span className={getPerformanceColor(metrics.renderTime, { good: 1000, ok: 2000 })}>
              {metrics.renderTime.toFixed(0)}ms
            </span>
          </div>
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className={getPerformanceColor(metrics.memoryUsage, { good: 50, ok: 100 })}>
              {metrics.memoryUsage}MB
            </span>
          </div>
          {metrics.isSlowConnection && (
            <div className="text-yellow-600 text-center">
              ⚠️ Slow connection detected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
