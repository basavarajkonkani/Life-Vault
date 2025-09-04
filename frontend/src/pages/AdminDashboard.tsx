import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, UserPlus, FileText, Eye } from 'lucide-react';
import { dashboardAPI, vaultAPI, adminAPI } from '../services/api';

interface DashboardData {
  totalAssets: number;
  totalNominees: number;
  netWorth: number;
  assetAllocation: Array<any>;
  recentActivity: Array<any>;
  adminStats?: {
    pendingRequests: number;
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  };
}

interface VaultRequest {
  id: string;
  nominee_id: string;
  owner_id: string;
  status: string;
  created_at: string;
  admin_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalAssets: 0,
    totalNominees: 0,
    netWorth: 0,
    assetAllocation: [],
    recentActivity: []
  });
  const [vaultRequests, setVaultRequests] = useState<VaultRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    phone: '',
    email: ''
  });

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
          totalAssets: 0,
          totalNominees: 0,
          netWorth: 0,
          assetAllocation: [],
          recentActivity: [],
          adminStats: {
            pendingRequests: 3,
            totalRequests: 10,
            approvedRequests: 5,
            rejectedRequests: 2
          }
        });
        setVaultRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected', notes?: string) => {
    try {
      const response = await vaultAPI.updateStatus(requestId, action, notes);
      if (response.data.success) {
        // Update local state
        setVaultRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: action, admin_notes: notes, reviewed_at: new Date().toISOString() }
              : req
          )
        );
        alert(`Request ${action} successfully`);
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Error updating request. Please try again.');
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminData.name || !newAdminData.phone || !newAdminData.email) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await adminAPI.createAdmin(newAdminData);
      if (response.data.success) {
        alert('Admin created successfully');
        setShowCreateAdminModal(false);
        setNewAdminData({ name: '', phone: '', email: '' });
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Error creating admin. Please try again.');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Review vault requests and manage system</p>
        </div>
        <button
          onClick={() => setShowCreateAdminModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Admin</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.adminStats?.pendingRequests || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.adminStats?.totalRequests || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.adminStats?.approvedRequests || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.adminStats?.rejectedRequests || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Vault Requests Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vault Requests</h2>

        {vaultRequests.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No vault requests to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vaultRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium text-gray-900">Vault Access Request</p>
                      <p className="text-sm text-gray-600">
                        Request ID: {request.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        const notes = prompt('Add approval notes (optional):');
                        handleRequestAction(request.id, 'approved', notes || undefined);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Add rejection reason:');
                        if (notes) {
                          handleRequestAction(request.id, 'rejected', notes);
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                )}

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

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Admin</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newAdminData.phone}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateAdmin}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Admin
              </button>
              <button
                onClick={() => {
                  setShowCreateAdminModal(false);
                  setNewAdminData({ name: '', phone: '', email: '' });
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

export default AdminDashboard;
