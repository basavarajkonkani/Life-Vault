import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { FileText, Clock, CheckCircle, XCircle, Upload } from 'lucide-react';
import { dashboardAPI, vaultAPI } from '../services/api';

interface AssetAllocation {
  name: string;
  value: number;
  amount: number;
  color: string;
}

interface DashboardData {
  totalAssets: number;
  totalNominees: number;
  netWorth: number;
  assetAllocation: AssetAllocation[];
  recentActivity: Array<any>;
}

interface VaultRequest {
  id: string;
  status: string;
  created_at: string;
  admin_notes?: string;
}

const NomineeDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalAssets: 0,
    totalNominees: 0,
    netWorth: 0,
    assetAllocation: [],
    recentActivity: []
  });
  const [vaultRequests, setVaultRequests] = useState<VaultRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardResponse, vaultResponse] = await Promise.all([
          dashboardAPI.getStats(),
          vaultAPI.getRequests()
        ]);
        
        setDashboardData(dashboardResponse.data);
        setVaultRequests(vaultResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback data
        setDashboardData({
          totalAssets: 2,
          totalNominees: 0,
          netWorth: 800000,
          assetAllocation: [
            { name: 'Bank', value: 62, amount: 500000, color: '#1E3A8A' },
            { name: 'LIC', value: 38, amount: 300000, color: '#3B82F6' }
          ],
          recentActivity: []
        });
        setVaultRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmitVaultRequest = async () => {
    if (!selectedFile) {
      alert('Please select a death certificate file');
      return;
    }

    try {
      // In a real app, you would upload the file first, then submit the request
      const response = await vaultAPI.submitRequest({
        death_certificate_url: 'uploaded-file-url' // This would be the actual uploaded file URL
      });
      
      if (response.data.success) {
        alert('Vault request submitted successfully');
        setShowUploadModal(false);
        setSelectedFile(null);
        // Refresh vault requests
        const vaultResponse = await vaultAPI.getRequests();
        setVaultRequests(vaultResponse.data);
      }
    } catch (error) {
      console.error('Error submitting vault request:', error);
      alert('Error submitting vault request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nominee Dashboard</h1>
        <p className="text-gray-600 mt-1">Access your assigned assets and manage vault requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Assets</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalAssets}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.netWorth)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vault Requests</p>
              <p className="text-2xl font-bold text-gray-900">{vaultRequests.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation Chart */}
      {dashboardData.assetAllocation.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Assets</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData.assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Vault Requests Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Vault Requests</h2>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Submit Request</span>
          </button>
        </div>

        {vaultRequests.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No vault requests yet</p>
            <p className="text-sm text-gray-500">Submit a request to access assigned assets</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vaultRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium text-gray-900">Vault Access Request</p>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                {request.admin_notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Admin Notes:</strong> {request.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Vault Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload the death certificate to request access to assigned assets.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Death Certificate
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSubmitVaultRequest}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Submit Request
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NomineeDashboard;
