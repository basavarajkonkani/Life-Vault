import React, { useEffect, useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { uploadAPI, vaultAPI } from '../services/api';

interface VaultRequest {
  id: string;
  nomineeName: string;
  relationToDeceased: string;
  requestDate?: string;
  status: 'pending' | 'under_review' | 'verified' | 'rejected';
  deathCertificate?: string;
}

const Vault: React.FC = () => {
  const [isNomineeView, setIsNomineeView] = useState(false);
  const [vaultRequests, setVaultRequests] = useState<VaultRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nomineeName: '',
    relationToDeceased: '',
    phoneNumber: '',
    email: '',
    deathCertificate: null as File | null
  });

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      try {
        const res = await vaultAPI.getRequests();
        setVaultRequests(res.data || []);
      } catch (e) {
        console.error('Failed to load vault requests', e);
        setVaultRequests([]);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, deathCertificate: file });
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deathCertificate) {
      alert('Please upload a death certificate');
      return;
    }

    setSubmitting(true);
    try {
      const uploadRes = await uploadAPI.uploadFile(formData.deathCertificate);
      const requestPayload = {
        nomineeName: formData.nomineeName,
        relationToDeceased: formData.relationToDeceased,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        deathCertificate: uploadRes.data.fileName,
      };
      await vaultAPI.submitRequest(requestPayload);
    alert('Vault access request submitted successfully. You will be notified once reviewed.');
      setFormData({ nomineeName: '', relationToDeceased: '', phoneNumber: '', email: '', deathCertificate: null });
      const refreshed = await vaultAPI.getRequests();
      setVaultRequests(refreshed.data || []);
      setIsNomineeView(false);
    } catch (error) {
      console.error('Submit failed', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'under_review':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'under_review':
        return 'Under Review';
      case 'verified':
        return 'Verified - Vault Opened';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  if (isNomineeView) {
    return (
      <div className="space-y-6">
        {/* Nominee Access Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nominee Vault Access</h1>
          <p className="text-gray-600 mt-2">
            Submit required documents to access the deceased's asset information
          </p>
          <button
            onClick={() => setIsNomineeView(false)}
            className="mt-4 text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            ← Back to Main Vault
          </button>
        </div>

        {/* Request Form */}
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Vault Access Request
          </h2>
          
          <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={formData.nomineeName}
                  onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                  className="input-field"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship to Deceased
                </label>
                <select
                  value={formData.relationToDeceased}
                  onChange={(e) => setFormData({ ...formData, relationToDeceased: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="input-field"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Death Certificate Upload
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload or drag and drop the death certificate
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  PDF, JPG, PNG up to 10MB
                </p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="death-certificate"
                />
                <label
                  htmlFor="death-certificate"
                  className="btn-secondary cursor-pointer inline-block"
                >
                  Choose File
                </label>
                {formData.deathCertificate && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {formData.deathCertificate.name}
                  </p>
                )}
              </div>
            </div>

            <button type="submit" className="w-full btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Vault Access Request'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vault</h1>
          <p className="text-gray-600">Secure access for nominees and executors</p>
        </div>
        <button
          onClick={() => setIsNomineeView(true)}
          className="btn-primary"
        >
          Nominee Access
        </button>
      </div>

      {/* Admin Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Pending Requests</h3>
              <p className="text-2xl font-bold text-yellow-600">{loading ? '-' : vaultRequests.filter(v => v.status === 'pending').length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Under Review</h3>
              <p className="text-2xl font-bold text-blue-600">{loading ? '-' : vaultRequests.filter(v => v.status === 'under_review').length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Approved</h3>
              <p className="text-2xl font-bold text-green-600">{loading ? '-' : vaultRequests.filter(v => v.status === 'verified').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Vault Access Requests</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nominee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relationship
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vaultRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.nomineeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.relationToDeceased}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(request.status)}
                      <span className="ml-2 text-sm text-gray-900">
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.deathCertificate && (
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                          View Certificate
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Vault Access Works</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">1</span>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">Nominee Submits Request</h4>
              <p className="text-sm text-gray-500">
                Nominee uploads death certificate and provides identification
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">2</span>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">Document Verification</h4>
              <p className="text-sm text-gray-500">
                Admin reviews submitted documents for authenticity
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">3</span>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">Vault Access Granted</h4>
              <p className="text-sm text-gray-500">
                Upon verification, nominee gains access to asset information
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault; 