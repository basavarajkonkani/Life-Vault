import React from 'react';

const TradingAccountSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export default TradingAccountSkeleton;
