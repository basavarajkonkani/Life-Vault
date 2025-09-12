import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useTradingAccounts } from '../hooks/queries/useTradingAccounts';
import { useNominees } from '../hooks/queries/useNominees';
import { useNotification } from '../contexts/NotificationContext';
import TradingAccountSkeleton from '../components/skeletons/TradingAccountSkeleton';

interface TradingAccountFormData {
  brokerName: string;
  clientId: string;
  dematNumber: string;
  nomineeId: string;
  currentValue: string;
  status: 'Active' | 'Inactive';
  notes: string;
}

const TradingAccounts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();

  // Use React Query for trading accounts
  const { 
    tradingAccounts, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    createTradingAccount, 
    updateTradingAccount, 
    deleteTradingAccount 
  } = useTradingAccounts();

  // Use React Query for nominees
  const { nominees } = useNominees();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  const [formData, setFormData] = useState<TradingAccountFormData>({
    brokerName: '',
    clientId: '',
    dematNumber: '',
    nomineeId: '',
    currentValue: '',
    status: 'Active',
    notes: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const accountData = {
        platform: formData.brokerName, // Map brokerName to platform
        accountNumber: formData.clientId, // Map clientId to accountNumber
        dematNumber: formData.dematNumber,
        nomineeId: formData.nomineeId || null,
        currentValue: parseFloat(formData.currentValue),
        status: formData.status,
        notes: formData.notes,
      };

      if (editingAccount) {
        // Update existing account
        await updateTradingAccount.mutateAsync({ id: editingAccount.id, ...accountData });
        showSuccess('Trading account updated successfully!');
      } else {
        // Create new account
        await createTradingAccount.mutateAsync(accountData);
        showSuccess('Trading account created successfully!');
      }

      // Reset form and refresh data
      setFormData({
        brokerName: '',
        clientId: '',
        dematNumber: '',
        nomineeId: '',
        currentValue: '',
        status: 'Active',
        notes: '',
      });
      setShowAddForm(false);
      setEditingAccount(null);
      
    } catch (err) {
      console.error('Error saving trading account:', err);
      showError('Failed to save trading account. Please try again.');
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      brokerName: account.platform || '',
      clientId: account.account_number || '',
      dematNumber: account.account_number || '',
      nomineeId: account.nominee_id || '',
      currentValue: account.current_value?.toString() || '',
      status: account.status || 'Active',
      notes: account.notes || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trading account?')) {
      try {
        await deleteTradingAccount.mutateAsync(id);
        showSuccess('Trading account deleted successfully!');
      } catch (err) {
        console.error('Error deleting trading account:', err);
        showError('Failed to delete trading account. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAccount(null);
    setFormData({
      brokerName: '',
      clientId: '',
      dematNumber: '',
      nomineeId: '',
      currentValue: '',
      status: 'Active',
      notes: '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <TradingAccountSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p>Error loading trading accounts: {error?.message}</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Trading Accounts</h1>
          <p className="text-gray-600">Manage your trading and demat accounts.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trading Account</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingAccount ? 'Edit Trading Account' : 'Add New Trading Account'}
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
                  Broker Name *
                </label>
                <input
                  type="text"
                  name="brokerName"
                  value={formData.brokerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Zerodha, Angel One"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID *
                </label>
                <input
                  type="text"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter client ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demat Number *
                </label>
                <input
                  type="text"
                  name="dematNumber"
                  value={formData.dematNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter demat number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nominee
                </label>
                <select
                  name="nomineeId"
                  value={formData.nomineeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Nominee (Optional)</option>
                  {nominees.map((nominee) => (
                    <option key={nominee.id} value={nominee.id}>
                      {nominee.name} ({nominee.relation})
                    </option>
                  ))}
                </select>
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
                placeholder="Additional notes about this trading account"
              />
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
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                {editingAccount ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Account</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trading Accounts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Trading Accounts</h2>
        </div>
        
        {tradingAccounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trading accounts found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first trading account.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Trading Account</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tradingAccounts.map((account) => (
              <div key={account.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {account.platform}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        account.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {account.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">Client ID: {account.account_number}</p>
                    <p className="text-sm text-gray-500 mb-2">Demat: {account.account_number}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(account.current_value)}
                    </p>
                    {account.notes && (
                      <p className="text-sm text-gray-600 mt-2">{account.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit trading account"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete trading account"
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

export default TradingAccounts;
