import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, PieLabelRenderProps } from 'recharts';
import { Download, FileText, TrendingUp } from 'lucide-react';

interface AssetAllocation {
  name: string;
  value: number;
  amount: number;
  color: string;
}

interface MonthlyData {
  month: string;
  value: number;
}

const Reports: React.FC = () => {
  // Mock data
  const assetAllocation = [
    { name: 'Bank', value: 35, amount: 875000, color: '#1E3A8A' },
    { name: 'LIC', value: 25, amount: 625000, color: '#3B82F6' },
    { name: 'Property', value: 20, amount: 500000, color: '#60A5FA' },
    { name: 'Stocks', value: 20, amount: 500000, color: '#93C5FD' },
  ];

  const nomineeDistribution = [
    { name: 'Jane Doe (Spouse)', allocation: 60, amount: 1500000 },
    { name: 'John Jr. (Child)', allocation: 40, amount: 1000000 },
  ];

  const performanceData = [
    { month: 'Jan', value: 2200000 },
    { month: 'Feb', value: 2250000 },
    { month: 'Mar', value: 2300000 },
    { month: 'Apr', value: 2400000 },
    { month: 'May', value: 2450000 },
    { month: 'Jun', value: 2500000 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportPDF = () => {
    console.log('Exporting PDF report...');
    alert('PDF report exported successfully!');
  };

  const handleExportCSV = () => {
    console.log('Exporting CSV data...');
    alert('CSV data exported successfully!');
  };

  const totalValue = assetAllocation.reduce((sum, asset) => sum + asset.amount, 0);

  // Add custom label renderer

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive view of your assets and allocations</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button onClick={handleExportPDF} className="btn-primary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Assets</h3>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Nominees</h3>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Net Worth</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Allocation</h3>
              <p className="text-2xl font-bold text-primary-600">100%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {assetAllocation.map((entry: AssetAllocation, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nominee Distribution Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution Among Nominees</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nomineeDistribution}>
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Bar dataKey="allocation" fill="#1E3A8A" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Net Worth Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Net Worth Performance (6 Months)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value: number) => `₹${(value / 100000).toFixed(1)}L`}
              />
              <Bar dataKey="value" fill="#1E3A8A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Value</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">%</th>
                </tr>
              </thead>
              <tbody>
                {assetAllocation.map((asset, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-sm text-gray-900">{asset.name}</td>
                    <td className="py-2 px-3 text-sm text-gray-900 text-right">
                      {formatCurrency(asset.amount)}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900 text-right">
                      {asset.value}%
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gray-300 font-medium">
                  <td className="py-2 px-3 text-sm text-gray-900">Total</td>
                  <td className="py-2 px-3 text-sm text-gray-900 text-right">
                    {formatCurrency(totalValue)}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-900 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Nominee Allocation */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nominee Allocation</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Nominee</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">%</th>
                </tr>
              </thead>
              <tbody>
                {nomineeDistribution.map((nominee, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-sm text-gray-900">{nominee.name}</td>
                    <td className="py-2 px-3 text-sm text-gray-900 text-right">
                      {formatCurrency(nominee.amount)}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900 text-right">
                      {nominee.allocation}%
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gray-300 font-medium">
                  <td className="py-2 px-3 text-sm text-gray-900">Total</td>
                  <td className="py-2 px-3 text-sm text-gray-900 text-right">
                    {formatCurrency(totalValue)}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-900 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Report Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Asset Diversification</h4>
            <p>Your assets are well-diversified across {assetAllocation.length} categories with bank assets forming the largest portion at 35%.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Nominee Coverage</h4>
            <p>100% of your assets are allocated to {nomineeDistribution.length} nominees with clear distribution percentages.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 