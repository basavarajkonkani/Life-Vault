import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Eye, X, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { assetsAPI, uploadAPI } from '../services/api';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useNotification } from '../contexts/NotificationContext';

interface Asset {
  id: string;
  category: string;
  institution: string;
  accountNumber: string;
  currentValue: number;
  status: 'Active' | 'Inactive';
  notes?: string;
  documents: string[];
  createdAt?: string;
  updatedAt?: string;
}

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
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
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

  const categories = ['Bank', 'LIC', 'PF', 'Property', 'Stocks', 'Crypto', 'Mutual Funds', 'Bonds'];

  // Fetch assets using the custom hook
  const { data: assets, loading, error, refetch } = useApi(
    () => assetsAPI.getAll(),
    {
      onError: (error) => showError('Failed to load assets', error),
    }
  );

  // Create asset mutation
  const createAssetMutation = useApiMutation(
    (assetData: Omit<AssetFormData, 'documents'> & { documents: string[] }) => 
      assetsAPI.create({
        ...assetData,
        currentValue: parseFloat(assetData.currentValue)
      }),
    {
      onSuccess: () => {
        showSuccess('Asset created successfully');
        setShowAddForm(false);
        resetForm();
        refetch();
      },
      onError: (error) => showError('Failed to create asset', error),
    }
  );

  // Update asset mutation
  const updateAssetMutation = useApiMutation(
    ({ id, assetData }: { id: string; assetData: Omit<AssetFormData, 'documents'> & { documents: string[] } }) => 
      assetsAPI.update(id, {
        ...assetData,
        currentValue: parseFloat(assetData.currentValue)
      }),
    {
      onSuccess: () => {
        showSuccess('Asset updated successfully');
        setEditingAsset(null);
        resetForm();
        refetch();
      },
      onError: (error) => showError('Failed to update asset', error),
    }
  );

  // Delete asset mutation
  const deleteAssetMutation = useApiMutation(
    (id: string) => assetsAPI.delete(id),
    {
      onSuccess: () => {
        showSuccess('Asset deleted successfully');
        refetch();
      },
      onError: (error) => showError('Failed to delete asset', error),
    }
  );

  const resetForm = () => {
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

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      category: asset.category,
      institution: asset.institution,
      accountNumber: asset.accountNumber,
      currentValue: asset.currentValue.toString(),
      status: asset.status,
      notes: asset.notes || '',
      documents: asset.documents,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      await deleteAssetMutation.mutate(id);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setUploadingFiles(true);
    try {
      const uploadPromises = files.map(file => uploadAPI.uploadFile(file));
      const uploadResults = await Promise.all(uploadPromises);
      const fileUrls = uploadResults.map(result => result.url);
      
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...fileUrls]
      }));
      
      showSuccess('Files uploaded successfully');
    } catch (error) {
      showError('Failed to upload files', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    handleFileUpload(files);
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
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...files]);
      handleFileUpload(files);
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const assetData = {
      category: formData.category,
      institution: formData.institution,
      accountNumber: formData.accountNumber,
      currentValue: formData.currentValue,
      status: formData.status,
      notes: formData.notes,
      documents: formData.documents,
    };

    if (editingAsset) {
      await updateAssetMutation.mutate({ id: editingAsset.id, assetData });
    } else {
      await createAssetMutation.mutate(assetData);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Bank': 'bg-blue-100 text-blue-800',
      'LIC': 'bg-green-100 text-green-800',
      'PF': 'bg-purple-100 text-purple-800',
      'Property': 'bg-yellow-100 text-yellow-800',
      'Stocks': 'bg-indigo-100 text-indigo-800',
      'Crypto': 'bg-orange-100 text-orange-800',
      'Mutual Funds': 'bg-pink-100 text-pink-800',
      'Bonds': 'bg-teal-100 text-teal-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Assets</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => refetch()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
              <p className="mt-2 text-gray-600">
                Manage your financial assets and investments
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Asset
            </button>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets?.map((asset: Asset) => (
            <div key={asset.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(asset.category)}`}>
                    {asset.category}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(asset)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900">{asset.institution}</h3>
                  <p className="text-sm text-gray-600">{asset.accountNumber}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(asset.currentValue)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </div>

                {asset.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2">{asset.notes}</p>
                )}

                {asset.documents && asset.documents.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Upload className="w-4 h-4 mr-1" />
                    {asset.documents.length} document{asset.documents.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {assets?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first asset.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Add Asset
            </button>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution *
                    </label>
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="input-field"
                      placeholder="e.g., State Bank of India"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="input-field"
                      placeholder="Enter account number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Value *
                    </label>
                    <input
                      type="number"
                      value={formData.currentValue}
                      onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                      className="input-field"
                      placeholder="Enter current value"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                      className="input-field"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documents
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
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
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <label
                        htmlFor="file-upload"
                        className="btn-secondary cursor-pointer"
                      >
                        Choose Files
                      </label>
                    </div>

                    {uploadingFiles && (
                      <div className="flex items-center justify-center mt-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 mr-2" />
                        <span className="text-sm text-gray-600">Uploading files...</span>
                      </div>
                    )}

                    {formData.documents.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-600 truncate">{doc}</span>
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
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                      disabled={createAssetMutation.loading || updateAssetMutation.loading}
                    >
                      {(createAssetMutation.loading || updateAssetMutation.loading) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          {editingAsset ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingAsset ? 'Update Asset' : 'Add Asset'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingAsset(null);
                        resetForm();
                      }}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assets;
