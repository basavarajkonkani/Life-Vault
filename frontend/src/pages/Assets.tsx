import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Eye, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { assetsAPI, uploadAPI } from '../services/api';

interface Asset {
  id: string;
  category: string;
  institution: string;
  accountNumber: string;
  value: number;
  status: 'Active' | 'Inactive';
  documents: string[];
}

const Assets: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    institution: '',
    accountNumber: '',
    notes: '',
    value: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const categories = ['Bank', 'LIC', 'PF', 'Property', 'Stocks', 'Crypto'];

  // Fetch assets on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await assetsAPI.getAll();
        const fetchedAssets = response.data.map((asset: any) => ({
          id: asset.id,
          category: asset.category,
          institution: asset.institution,
          accountNumber: asset.account_number || asset.accountNumber,
          value: asset.current_value || asset.currentValue,
          status: asset.status,
          documents: asset.documents || []
        }));
        setAssets(fetchedAssets);
      } catch (error) {
        console.error('Error fetching assets:', error);
        // Fallback to empty array on error
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Check if we should auto-open the form (from dashboard navigation)
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddForm(true);
      // Remove the parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingFiles(true);

    try {
      // Upload files first if any are selected
      const uploadedDocuments: string[] = [];
      
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            const response = await uploadAPI.uploadFile(file);
            if (response.data.success) {
              uploadedDocuments.push(response.data.fileName);
            }
          } catch (error) {
            console.error('File upload error:', error);
            alert(`Failed to upload ${file.name}`);
          }
        }
      }

      // Create asset with uploaded documents
      const assetData = {
        category: formData.category,
        institution: formData.institution,
        accountNumber: formData.accountNumber,
        currentValue: parseFloat(formData.value),
        notes: formData.notes,
        documents: uploadedDocuments,
        status: 'Active'
      };

      const response = await assetsAPI.create(assetData);
      
      // Update local state with new asset
      const newAsset: Asset = {
        id: response.data.id,
        category: response.data.category,
        institution: response.data.institution,
        accountNumber: response.data.account_number || response.data.accountNumber,
        value: response.data.current_value || response.data.currentValue,
        status: response.data.status,
        documents: response.data.documents || []
      };

      setAssets([...assets, newAsset]);
      
      // Reset form
      setFormData({ category: '', institution: '', accountNumber: '', notes: '', value: '' });
      setSelectedFiles([]);
      setShowAddForm(false);
      
      alert('Asset added successfully!');
      
    } catch (error) {
      console.error('Asset creation error:', error);
      alert('Failed to create asset. Please try again.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      setAssets(assets.filter(asset => asset.id !== id));
    }
  };

  // File upload handlers
  const handleFiles = (files: FileList) => {
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported format. Only PDF, JPG, and PNG are allowed.`);
        return;
      }
      
      validFiles.push(file);
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600">Manage your financial assets and documents</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Assets Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account/Policy No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.institution}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.accountNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(asset.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      asset.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-primary-600 hover:text-primary-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(asset.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Asset</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account/Policy No.
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="input-field"
                  placeholder="Account or Policy Number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Value (₹)
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="input-field"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Upload
                </label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    PDF, JPG, PNG up to 10MB
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-secondary cursor-pointer inline-block"
                  >
                    Choose Files
                  </label>
                </div>

                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="submit" 
                  disabled={uploadingFiles}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingFiles ? 'Uploading...' : 'Add Asset'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets; 