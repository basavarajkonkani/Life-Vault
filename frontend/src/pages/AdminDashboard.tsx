import React, { useState } from 'react';
import { Users, Lock, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useVaultRequests } from '../hooks/queries/useVaultRequests';
import { useNotification } from '../contexts/NotificationContext';

const AdminDashboard: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { vaultRequests, isLoading, isError, error, refetch, updateVaultRequest } = useVaultRequests();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');

  const handleStatusUpdate = async (requestId: string, newStatus: string, adminNotes?: string) => {
    try {
      await updateVaultRequest.mutateAsync({
        id: requestId,
        status: newStatus,
        notes: adminNotes
      });
      showSuccess(`Request ${newStatus} successfully!`);
      setShowNotesModal(false);
      setSelectedRequest(null);
      setAction(null);
      setNotes('');
    } catch (err) {
      console.error('Error updating request status:', err);
      showError('Failed to update request status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p>Error loading vault requests: {error?.message}</p>
          </div>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage vault requests and system administration.</p>
        </div>
        <div className="flex items-center space-x-2 text-primary-600">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{vaultRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {vaultRequests.filter((req: any) => req.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {vaultRequests.filter((req: any) => req.status === 'Approved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vault Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Vault Requests</h2>
        </div>
        
        {vaultRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Lock className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vault requests found</h3>
            <p className="text-gray-500">All caught up! No pending requests to review.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {vaultRequests.map((request: any) => (
              <div key={request.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{request.nominee_name}</h3>
                    <p className="text-sm text-gray-600">{request.relation_to_deceased}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status}</span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <p className="text-sm text-gray-900">{request.phone_number}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-sm text-gray-900">{request.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Submitted:</span>
                    <p className="text-sm text-gray-900">{formatDate(request.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Death Certificate:</span>
                    {request.death_certificate_url ? (
                      <a
                        href={request.death_certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Document</span>
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">Not provided</p>
                    )}
                  </div>
                </div>

                {request.status === 'Pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setAction('approve');
                        setShowNotesModal(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setAction('reject');
                        setShowNotesModal(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedRequest && action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {action === 'approve' ? 'Approve Request' : 'Reject Request'}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add any notes about this decision..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNotesModal(false);
                    setSelectedRequest(null);
                    setAction(null);
                    setNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(
                    selectedRequest.id,
                    action === 'approve' ? 'Approved' : 'Rejected',
                    notes
                  )}
                  className={`px-4 py-2 text-white rounded-md ${
                    action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
