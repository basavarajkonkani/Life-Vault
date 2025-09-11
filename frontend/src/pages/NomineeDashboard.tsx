import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Send, AlertCircle, Users, Lock, TrendingUp, Eye } from 'lucide-react';
import { useVaultRequests } from '../hooks/queries/useVaultRequests';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

interface VaultRequestFormData {
  nomineeName: string;
  relationToDeceased: string;
  phoneNumber: string;
  email: string;
}

const NomineeDashboard: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use React Query for vault requests
  const { 
    vaultRequests, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    createVaultRequest 
  } = useVaultRequests();
  
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState<VaultRequestFormData>({
    nomineeName: '',
    relationToDeceased: '',
    phoneNumber: '',
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `vault-requests/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploadingFile(true);
      
      let deathCertificateUrl: string | null = null;
      if (selectedFile) {
        deathCertificateUrl = await uploadFile(selectedFile);
      }

      const requestData = {
        nomineeName: formData.nomineeName,
        relationToDeceased: formData.relationToDeceased,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        deathCertificateUrl: deathCertificateUrl,
      };

      await createVaultRequest.mutateAsync(requestData);
      showSuccess('Vault request submitted successfully! Our team will review it shortly.');

      // Reset form
      setFormData({
        nomineeName: '',
        relationToDeceased: '',
        phoneNumber: '',
        email: '',
      });
      setSelectedFile(null);
      setShowSubmitForm(false);
      
    } catch (err) {
      console.error('Error submitting vault request:', err);
      showError('Failed to submit vault request. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCancel = () => {
    setShowSubmitForm(false);
    setFormData({
      nomineeName: '',
      relationToDeceased: '',
      phoneNumber: '',
      email: '',
    });
    setSelectedFile(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
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
          <h1 className="text-3xl font-bold text-gray-900">Nominee Dashboard</h1>
          <p className="text-gray-600">Access your vault and manage requests.</p>
        </div>
        <button
          onClick={() => setShowSubmitForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>Submit Request</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{vaultRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Lock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {vaultRequests.filter(r => r.status.toLowerCase() === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {vaultRequests.filter(r => r.status.toLowerCase() === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Form */}
      {showSubmitForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Submit Vault Request</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nominee Name *
                </label>
                <input
                  type="text"
                  name="nomineeName"
                  value={formData.nomineeName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter nominee name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relation to Deceased *
                </label>
                <select
                  name="relationToDeceased"
                  value={formData.relationToDeceased}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Relation</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="nominee@example.com"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Death Certificate
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop the death certificate here, or click to select
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Select File
                </button>
              </div>

              {/* Selected File */}
              {selectedFile && (
                <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingFile}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {uploadingFile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vault Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Vault Requests</h2>
        </div>
        
        {vaultRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vault requests found</h3>
            <p className="text-gray-600 mb-4">Submit your first vault request to get started.</p>
            <button
              onClick={() => setShowSubmitForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Request</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {vaultRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.nominee_name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">Relation: {request.relation_to_deceased}</p>
                    <p className="text-sm text-gray-500 mb-2">Phone: {request.phone_number}</p>
                    <p className="text-sm text-gray-500 mb-2">Email: {request.email}</p>
                    <p className="text-sm text-gray-500">Submitted: {formatDate(request.created_at)}</p>
                    {request.death_certificate_url && (
                      <div className="mt-3">
                        <a
                          href={request.death_certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">View Death Certificate</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NomineeDashboard;
