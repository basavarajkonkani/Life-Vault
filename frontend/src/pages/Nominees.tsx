import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Crown, User, Mail, Phone, FileText, Upload, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useSearchParams } from 'react-router-dom';
import { nomineesAPI } from '../services/api';

interface Nominee {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  allocation: number;
  isExecutor: boolean;
  isBackup: boolean;
  id_proof?: string;
  assigned_assets?: string[];
}

interface Asset {
  id: string;
  category: string;
  institution: string;
  account_number: string;
  current_value: number;
  status: string;
  nominee_id?: string;
}

interface AssetAllocation {
  name: string;
  value: number;
  amount: number;
  color: string;
}

const Nominees: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNominee, setEditingNominee] = useState<Nominee | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    phone: '',
    email: '',
    allocation: '',
    isExecutor: false,
    isBackup: false,
    assigned_assets: [] as string[]
  });

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = user?.role === 'owner' || !user?.role; // Default to owner if no role
  const isNominee = user?.role === 'nominee';

  const relationshipOptions = [
    'Spouse', 'Child', 'Parent', 'Sibling', 'Grandchild', 'Grandparent',
    'Uncle', 'Aunt', 'Cousin', 'Friend', 'Other'
  ];

  const assetCategories = ['Bank', 'LIC', 'PF', 'Property', 'Stocks', 'Crypto', 'Trading Accounts'];

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching nominees data...');
        console.log('User:', user);
        console.log('Auth token:', localStorage.getItem('authToken'));
        
        const nomineesResponse = await nomineesAPI.getAll();
        
        console.log('Nominees response:', nomineesResponse.data);
        
        setNominees(nomineesResponse.data || []);
        setAssets([]); // Set empty array since we're not fetching assets
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please check your connection and try again.');
        setNominees([]);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if we should auto-open the form (from dashboard navigation)
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddForm(true);
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

  const getAssignedAssetsCount = (nomineeId: string) => {
    return assets.filter(asset => asset.nominee_id === nomineeId).length;
  };

  const getAssignedAssetsValue = (nomineeId: string) => {
    return assets
      .filter(asset => asset.nominee_id === nomineeId)
      .reduce((sum, asset) => sum + asset.current_value, 0);
  };

  const getNomineeAssets = () => {
    if (!isNominee) return [];
    return assets.filter(asset => asset.nominee_id === user.id);
  };

  const getAssetAllocationData = (): AssetAllocation[] => {
    const nomineeAssets = getNomineeAssets();
    const categoryTotals: { [key: string]: { count: number; value: number } } = {};
    
    nomineeAssets.forEach(asset => {
      if (!categoryTotals[asset.category]) {
        categoryTotals[asset.category] = { count: 0, value: 0 };
      }
      categoryTotals[asset.category].count++;
      categoryTotals[asset.category].value += asset.current_value;
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
    
    return Object.entries(categoryTotals).map(([category, data], index) => ({
      name: category,
      value: data.value,
      amount: data.value,
      color: colors[index % colors.length]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const nomineeData = {
        ...formData,
        allocation: parseFloat(formData.allocation) || 0,
        assigned_assets: formData.assigned_assets
      };

      if (editingNominee) {
        const response = await nomineesAPI.update(editingNominee.id, nomineeData);
        setNominees((prev: Nominee[]) => 
          prev.map((nominee: Nominee) => 
            nominee.id === editingNominee.id ? response.data : nominee
          )
        );
      } else {
        const response = await nomineesAPI.create(nomineeData);
        setNominees((prev: Nominee[]) => [...prev, response.data]);
      }

      setFormData({
        name: '',
        relation: '',
        phone: '',
        email: '',
        allocation: '',
        isExecutor: false,
        isBackup: false,
        assigned_assets: []
      });
      setShowAddForm(false);
      setEditingNominee(null);
      
      alert(`Nominee ${editingNominee ? 'updated' : 'created'} successfully!`);
      
    } catch (error) {
      console.error('Nominee operation error:', error);
      alert(`Failed to ${editingNominee ? 'update' : 'create'} nominee. Please try again.`);
    }
  };

  const handleEdit = (nominee: Nominee) => {
    setFormData({
      name: nominee.name,
      relation: nominee.relation,
      phone: nominee.phone,
      email: nominee.email,
      allocation: nominee.allocation.toString(),
      isExecutor: nominee.isExecutor,
      isBackup: nominee.isBackup,
      assigned_assets: nominee.assigned_assets || []
    });
    setEditingNominee(nominee);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this nominee?')) {
      return;
    }

    try {
      await nomineesAPI.delete(id);
      setNominees((prev: Nominee[]) => prev.filter((nominee: Nominee) => nominee.id !== id));
      alert('Nominee deleted successfully!');
    } catch (error) {
      console.error('Delete nominee error:', error);
      alert('Failed to delete nominee. Please try again.');
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploadingFiles(true);
    try {
      // Simulate file upload - in real implementation, upload to server
      const uploadedFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...uploadedFiles]);
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploadingFiles(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading nominees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalNominees = nominees.length;
  const nomineeAssets = getNomineeAssets();
  const totalAssignedValue = nomineeAssets.reduce((sum, asset) => sum + asset.current_value, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                {isOwner ? 'Nominees' : 'My Profile'}
              </h1>
              <p className="mt-2 text-gray-600">
                {isOwner 
                  ? 'Manage your nominees and asset assignments'
                  : 'View your assigned assets and profile information'
                }
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Nominee
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isOwner ? (
            <>
              {/* Total Nominees */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Nominees</p>
                    <p className="text-2xl font-bold text-gray-900">{totalNominees}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Executors */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executors</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {nominees.filter(n => n.isExecutor).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Backup Nominees */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Backup Nominees</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {nominees.filter(n => n.isBackup).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Assets Assigned to Me */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assets Assigned to Me</p>
                    <p className="text-2xl font-bold text-gray-900">{nomineeAssets.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Total Value */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAssignedValue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Asset Categories */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Asset Categories</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(nomineeAssets.map(asset => asset.category)).size}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nominee View - Personal Profile Card */}
        {isNominee && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Full Name</p>
                  <p className="text-lg text-gray-900">{user.name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-lg text-gray-900">{user.email || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-lg text-gray-900">{user.phone || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Role</p>
                  <p className="text-lg text-gray-900">Nominee</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Asset Allocation Chart for Nominees */}
        {isNominee && nomineeAssets.length > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Assets Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getAssetAllocationData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getAssetAllocationData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Owner View - Nominees Table */}
        {isOwner && (
          <>
            {nominees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Nominees</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first nominee.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary"
                >
                  Add Nominee
                </button>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Nominees</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Full Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Relationship
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned Assets
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {nominees.map((nominee: Nominee) => (
                        <tr key={nominee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{nominee.name}</div>
                                <div className="text-sm text-gray-500">
                                  {nominee.isExecutor && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-1">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Executor
                                  </span>}
                                  {nominee.isBackup && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Backup
                                  </span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{nominee.relation}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{nominee.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{nominee.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getAssignedAssetsCount(nominee.id)} assets
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(getAssignedAssetsValue(nominee.id))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(nominee)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(nominee.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
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
            )}
          </>
        )}

        {/* Add/Edit Form Modal - Only for Owners */}
        {isOwner && showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingNominee ? 'Edit Nominee' : 'Add New Nominee'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field"
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship *
                      </label>
                      <select
                        value={formData.relation}
                        onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                        className="input-field"
                        required
                      >
                        <option value="">Select Relationship</option>
                        {relationshipOptions.map(relation => (
                          <option key={relation} value={relation}>{relation}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field"
                        placeholder="Enter email address"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-field"
                        placeholder="Enter mobile number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Proof Upload
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="btn-secondary cursor-pointer"
                      >
                        Choose Files
                      </label>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Selected files:</p>
                        {selectedFiles.map((file, index) => (
                          <p key={index} className="text-sm text-gray-500">{file.name}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Assets (Multi-select)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {assetCategories.map(category => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.assigned_assets.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  assigned_assets: [...formData.assigned_assets, category]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assigned_assets: formData.assigned_assets.filter(asset => asset !== category)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allocation Percentage
                      </label>
                      <input
                        type="number"
                        value={formData.allocation}
                        onChange={(e) => setFormData({ ...formData, allocation: e.target.value })}
                        className="input-field"
                        placeholder="Enter allocation percentage"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isExecutor}
                          onChange={(e) => setFormData({ ...formData, isExecutor: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Is Executor</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isBackup}
                          onChange={(e) => setFormData({ ...formData, isBackup: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Is Backup Nominee</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button type="submit" className="flex-1 btn-primary">
                      {editingNominee ? 'Update Nominee' : 'Add Nominee'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingNominee(null);
                        setFormData({
                          name: '',
                          relation: '',
                          phone: '',
                          email: '',
                          allocation: '',
                          isExecutor: false,
                          isBackup: false,
                          assigned_assets: []
                        });
                        setSelectedFiles([]);
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

export default Nominees;
