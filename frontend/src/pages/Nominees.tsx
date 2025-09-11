import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useNominees } from '../hooks/queries/useNominees';
import { useNotification } from '../contexts/NotificationContext';

interface NomineeFormData {
  name: string;
  relation: string;
  phone: string;
  email: string;
  allocationPercentage: string;
  isExecutor: boolean;
  isBackup: boolean;
}

const Nominees: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError, showInfo } = useNotification();

  // Use React Query for nominees
  const { 
    nominees, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    createNominee, 
    updateNominee, 
    deleteNominee,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError
  } = useNominees();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNominee, setEditingNominee] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<NomineeFormData>({
    name: '',
    relation: '',
    phone: '',
    email: '',
    allocationPercentage: '',
    isExecutor: false,
    isBackup: false,
  });

  // Check if we should show the add form
  useEffect(() => {
    const shouldShowAdd = searchParams.get('add') === 'true';
    setShowAddForm(shouldShowAdd);
  }, [searchParams]);

  // Show error notifications for individual operations
  useEffect(() => {
    if (createError) {
      showError('Create Failed', createError.message);
    }
  }, [createError, showError]);

  useEffect(() => {
    if (updateError) {
      showError('Update Failed', updateError.message);
    }
  }, [updateError, showError]);

  useEffect(() => {
    if (deleteError) {
      showError('Delete Failed', deleteError.message);
    }
  }, [deleteError, showError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.relation.trim()) return 'Relation is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.email.trim()) return 'Email is required';
    
    const allocation = parseFloat(formData.allocationPercentage);
    if (isNaN(allocation) || allocation < 0 || allocation > 100) {
      return 'Allocation percentage must be between 0 and 100';
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      return 'Please enter a valid phone number';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      showError('Validation Error', validationError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const nomineeData = {
        name: formData.name.trim(),
        relation: formData.relation.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        allocation_percentage: parseFloat(formData.allocationPercentage),
        is_executor: formData.isExecutor,
        is_backup: formData.isBackup,
      };

      if (editingNominee) {
        // Update existing nominee
        await updateNominee.mutateAsync({ id: editingNominee.id, ...nomineeData });
        showSuccess('Success!', 'Nominee updated successfully!');
      } else {
        // Create new nominee
        await createNominee.mutateAsync(nomineeData);
        showSuccess('Success!', 'Nominee created successfully!');
      }

      // Reset form and refresh data
      resetForm();
      
    } catch (err) {
      console.error('Error saving nominee:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save nominee';
      showError('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relation: '',
      phone: '',
      email: '',
      allocationPercentage: '',
      isExecutor: false,
      isBackup: false,
    });
    setEditingNominee(null);
    setShowAddForm(false);
    setSearchParams({});
  };

  const handleEdit = (nominee: any) => {
    setEditingNominee(nominee);
    setFormData({
      name: nominee.name,
      relation: nominee.relation,
      phone: nominee.phone,
      email: nominee.email,
      allocationPercentage: nominee.allocation_percentage.toString(),
      isExecutor: nominee.is_executor,
      isBackup: nominee.is_backup,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteNominee.mutateAsync(id);
        showSuccess('Success!', 'Nominee deleted successfully!');
      } catch (err) {
        console.error('Error deleting nominee:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete nominee';
        showError('Error', errorMessage);
      }
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Nominees</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading nominees...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Nominees</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load nominees</h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nominees</h1>
          <p className="text-gray-600 mt-1">
            Manage your nominees and their allocation percentages
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={isCreating || isUpdating || isDeleting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Nominee
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {editingNominee ? 'Edit Nominee' : 'Add New Nominee'}
            </h2>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter nominee name"
                  required
                />
              </div>

              <div>
                <label htmlFor="relation" className="block text-sm font-medium text-gray-700">
                  Relation *
                </label>
                <select
                  id="relation"
                  name="relation"
                  value={formData.relation}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select relation</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="nominee@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="allocationPercentage" className="block text-sm font-medium text-gray-700">
                  Allocation Percentage *
                </label>
                <input
                  type="number"
                  id="allocationPercentage"
                  name="allocationPercentage"
                  value={formData.allocationPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  disabled={isSubmitting}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="50"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isExecutor"
                  name="isExecutor"
                  checked={formData.isExecutor}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="isExecutor" className="ml-2 block text-sm text-gray-900">
                  Is Executor
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBackup"
                  name="isBackup"
                  checked={formData.isBackup}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="isBackup" className="ml-2 block text-sm text-gray-900">
                  Is Backup
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingNominee ? 'Update Nominee' : 'Create Nominee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Nominees List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Nominees ({nominees.length})
          </h3>
        </div>

        {nominees.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No nominees found</h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first nominee.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              disabled={isCreating || isUpdating || isDeleting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Nominee
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {nominees.map((nominee) => (
              <div key={nominee.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {nominee.name}
                          </h4>
                          {nominee.is_executor && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Executor
                            </span>
                          )}
                          {nominee.is_backup && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Backup
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          <p>{nominee.relation} • {nominee.phone} • {nominee.email}</p>
                          <p className="mt-1">
                            <span className="font-medium text-gray-900">
                              {nominee.allocation_percentage}%
                            </span> allocation
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(nominee)}
                      disabled={isCreating || isUpdating || isDeleting}
                      className="text-blue-600 hover:text-blue-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit nominee"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(nominee.id, nominee.name)}
                      disabled={isCreating || isUpdating || isDeleting}
                      className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete nominee"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
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

export default Nominees;
