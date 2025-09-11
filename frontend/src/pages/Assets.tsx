import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Upload, X, FileText, Trash2, Edit2, Save, XCircle } from 'lucide-react';
import { useAssets } from '../hooks/queries/useAssets';
import { useNotification } from '../contexts/NotificationContext';
import AssetSkeleton from '../components/skeletons/AssetSkeleton';

interface AssetFormData {
  category: string;
  institution: string;
  accountNumber: string;
  currentValue: string;
  status: 'Active' | 'Inactive';
  notes: string;
  documents: string[];
}

const Assets: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();

  // Use React Query for assets
  const { 
    assets, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    createAsset, 
    updateAsset, 
    deleteAsset 
  } = useAssets();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState<AssetFormData>({
    category: '',
    institution: '',
    accountNumber: '',
    currentValue: '',
    status: 'Active',
    notes: '',
    documents: [],
  });

  // Check if we should show the add form
  useEffect(() => {
    const shouldShowAdd = searchParams.get('add') === 'true';
    setShowAddForm(shouldShowAdd);
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(prev => [...prev, ...fileArray]);
    }
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
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    // Simulate file upload - replace with actual upload logic
    return files.map(file => `https://example.com/uploads/${file.name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploadingFiles(true);
      
      // Upload files if any
      let documentUrls: string[] = [];
      if (selectedFiles.length > 0) {
        documentUrls = await uploadFiles(selectedFiles);
      }

      const assetData = {
        category: formData.category,
        institution: formData.institution,
        accountNumber: formData.accountNumber,
        currentValue: parseFloat(formData.currentValue),
        status: formData.status,
        notes: formData.notes,
        documents: documentUrls
      };

      if (editingAsset) {
        // Update existing asset
        await updateAsset.mutateAsync({ id: editingAsset.id, ...assetData });
        showSuccess('Asset updated successfully!');
      } else {
        // Create new asset
        await createAsset.mutateAsync(assetData);
        showSuccess('Asset created successfully!');
      }

      // Reset form and refresh data
      setFormData({
        category: '',
        institution: '',
        accountNumber: '',
        currentValue: '',
        status: 'Active',
        notes: '',
        documents: [],
      });
      setSelectedFiles([]);
      setShowAddForm(false);
      setEditingAsset(null);
      
    } catch (err) {
      console.error('Error saving asset:', err);
      showError('Failed to save asset. Please try again.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleEdit = (asset: any) => {
    setEditingAsset(asset);
    setFormData({
      category: asset.category || '',
      institution: asset.institution || '',
      accountNumber: asset.account_number || '',
      currentValue: asset.current_value?.toString() || '',
      status: asset.status || 'Active',
      notes: asset.notes || '',
      documents: asset.documents || [],
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAsset.mutateAsync(id);
        showSuccess('Asset deleted successfully!');
      } catch (err) {
        console.error('Error deleting asset:', err);
        showError('Failed to delete asset. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAsset(null);
    setFormData({
      category: '',
      institution: '',
      accountNumber: '',
      currentValue: '',
      status: 'Active',
      notes: '',
      documents: [],
    });
    setSelectedFiles([]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <AssetSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p>Error loading assets: {error?.message}</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600">Manage your financial assets and investments.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingAsset ? 'Edit Asset' : 'Add New Asset'}
            </h2>
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
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Category</option>
                  <option value="Bank">Bank Account</option>
                  <option value="Fixed Deposit">Fixed Deposit</option>
                  <option value="Mutual Fund">Mutual Fund</option>
                  <option value="Stocks">Stocks</option>
                  <option value="LIC">LIC Policy</option>
                  <option value="Property">Property</option>
                  <option value="Gold">Gold</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution *
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., State Bank of India"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Value *
                </label>
                <input
                  type="number"
                  name="currentValue"
                  value={formData.currentValue}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter current value"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Additional notes about this asset"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents
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
                  Drag and drop files here, or click to select
                </p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Select Files
                </label>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
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
                disabled={uploadingFiles}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {uploadingFiles ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : editingAsset ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Asset</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Asset</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assets List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Assets</h2>
        </div>
        
        {assets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first asset.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Asset</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {assets.map((asset) => (
              <div key={asset.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {asset.category}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        asset.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">{asset.institution}</p>
                    <p className="text-sm text-gray-500 mb-2">Account: {asset.account_number}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(asset.current_value)}
                    </p>
                    {asset.notes && (
                      <p className="text-sm text-gray-600 mt-2">{asset.notes}</p>
                    )}
                    {asset.documents && asset.documents.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Documents:</p>
                        <div className="flex flex-wrap gap-2">
                          {asset.documents.map((doc, index) => (
                            <a
                              key={index}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Document {index + 1}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(asset)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit asset"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

export default Assets;
