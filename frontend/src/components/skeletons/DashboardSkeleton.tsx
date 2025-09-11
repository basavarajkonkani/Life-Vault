import React from 'react';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="flex space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="flex items-center">
              <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-80 bg-gray-200 rounded"></div>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
