import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2, CreditCard, User, FileText, ExternalLink, TrendingUp, Users, DollarSign, Eye } from 'lucide-react';
import { tradingAccountsAPI, nomineesAPI } from '../services/api';

interface TradingAccount {
  id: string;
  broker_name: string;
  client_id: string;
  demat_number: string;
  nominee_id?: string;
  current_value: number;
  status: 'Active' | 'Closed' | 'Suspended';
  created_at: string;
  updated_at: string;
}

interface Nominee {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
}

const TradingAccounts: React.FC = () => {
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);
  
  const [formData, setFormData] = useState({
    broker_name: '',
    client_id: '',
    demat_number: '',
    nominee_id: '',
    current_value: '',
    status: 'Active' as 'Active' | 'Closed' | 'Suspended'
  });

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = user?.role === 'owner' || !user?.role; // Default to owner if no role
  const isNominee = user?.role === 'nominee';

  const brokerOptions = [
    'Zerodha', 'Upstox', 'ICICI Direct', 'HDFC Securities', 'Kotak Securities',
    'Sharekhan', 'Angel Broking', 'Motilal Oswal', '5Paisa', 'Paytm Money',
    'Groww', 'IIFL Securities', 'Religare Broking', 'SBI Securities', 'Other'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching trading accounts data...');
        console.log('User:', user);
        console.log('Auth token:', localStorage.getItem('authToken'));
        
        const [accountsResponse, nomineesResponse] = await Promise.all([
          tradingAccountsAPI.getAll(),
          nomineesAPI.getAll()
        ]);
        
        console.log('Trading accounts response:', accountsResponse);
        console.log('Nominees response:', nomineesResponse);
        
        setTradingAccounts(accountsResponse || []);
        setNominees(nomineesResponse || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please check your connection and try again.');
        setTradingAccounts([]);
        setNominees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getNomineeName = (nomineeId?: string) => {
    if (!nomineeId) return 'Not assigned';
    const nominee = nominees.find((n: Nominee) => n.id === nomineeId);
    return nominee ? `${nominee.name} (${nominee.relation})` : 'Unknown';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const accountData = {
        ...formData,
        current_value: parseFloat(formData.current_value) || 0
      };

      if (editingAccount) {
        const response = await tradingAccountsAPI.update(editingAccount.id, accountData);
        setTradingAccounts((prev: TradingAccount[]) => 
          prev.map((account: TradingAccount) => 
            account.id === editingAccount.id ? response : account
          )
        );
      } else {
        const response = await tradingAccountsAPI.create(accountData);
        setTradingAccounts((prev: TradingAccount[]) => [...prev, response]);
      }

      setFormData({
        broker_name: '',
        client_id: '',
        demat_number: '',
        nominee_id: '',
        current_value: '',
        status: 'Active'
      });
      setShowAddForm(false);
      setEditingAccount(null);
      
      alert(`Trading account ${editingAccount ? 'updated' : 'created'} successfully!`);
      
    } catch (error) {
      console.error('Trading account operation error:', error);
      alert(`Failed to ${editingAccount ? 'update' : 'create'} trading account. Please try again.`);
    }
  };

  const handleEdit = (account: TradingAccount) => {
    setFormData({
      broker_name: account.broker_name,
      client_id: account.client_id,
      demat_number: account.demat_number,
      nominee_id: account.nominee_id || '',
      current_value: (account.current_value || 0).toString(),
      status: account.status
    });
    setEditingAccount(account);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trading account?')) {
      return;
    }

    try {
      await tradingAccountsAPI.delete(id);
      setTradingAccounts((prev: TradingAccount[]) => prev.filter((account: TradingAccount) => account.id !== id));
      alert('Trading account deleted successfully!');
    } catch (error) {
      console.error('Delete trading account error:', error);
      alert('Failed to delete trading account. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      case 'Suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClaimGuide = () => {
    window.open('/claim-guides', '_blank');
  };

  // Calculate summary statistics
  const totalAccounts = tradingAccounts.length;
  const totalValue = tradingAccounts.reduce((sum, account) => sum + (account?.current_value || 0), 0);
  const assignedNominees = new Set(tradingAccounts.filter(account => account.nominee_id).map(account => account.nominee_id)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trading accounts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building2 className="w-8 h-8 mr-3 text-blue-600" />
                Trading & Demat Accounts
              </h1>
              <p className="mt-2 text-gray-600">
                {isOwner 
                  ? 'Manage your trading and demat accounts with nominee assignments'
                  : 'View trading accounts assigned to you as nominee'
                }
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Trading Account
              </button>
            )}
            {isNominee && (
              <button
                onClick={handleClaimGuide}
                className="btn-primary flex items-center"
              >
                <FileText className="w-5 h-5 mr-2" />
                Claim Guide
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Trading Accounts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trading Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{totalAccounts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Assigned Nominees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Nominees</p>
                <p className="text-2xl font-bold text-gray-900">{assignedNominees}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Claim Instructions for Nominees */}
        {isNominee && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Claim Process for Trading Accounts
                </h3>
                <div className="text-blue-800 space-y-2">
                  <p><strong>Step 1:</strong> Submit death certificate to the broker</p>
                  <p><strong>Step 2:</strong> Fill and submit Transmission Request Form (TRF)</p>
                  <p><strong>Step 3:</strong> Provide nominee ID proof and address proof</p>
                  <p><strong>Step 4:</strong> Complete KYC verification with broker</p>
                  <p><strong>Step 5:</strong> Transfer securities to your demat account</p>
                </div>
                <button
                  onClick={handleClaimGuide}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  View Detailed Claim Guide
                  <ExternalLink className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trading Accounts Table */}
        {tradingAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isOwner ? 'No Trading Accounts' : 'No Trading Accounts Assigned'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isOwner 
                ? 'Get started by adding your first trading account.'
                : 'No trading accounts have been assigned to you as a nominee yet.'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Trading Accounts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Broker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demat Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nominee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {isOwner && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tradingAccounts.map((account: TradingAccount) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Building2 className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {account.broker_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {account.client_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {account.demat_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getNomineeName(account.nominee_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(account.current_value || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(account.status)}`}>
                          {account.status}
                        </span>
                      </td>
                      {isOwner && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(account)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(account.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Form Modal - Only for Owners */}
        {isOwner && showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingAccount ? 'Edit Trading Account' : 'Add New Trading Account'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Broker Name *
                    </label>
                    <select
                      value={formData.broker_name}
                      onChange={(e) => setFormData({ ...formData, broker_name: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select Broker</option>
                      {brokerOptions.map(broker => (
                        <option key={broker} value={broker}>{broker}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID *
                    </label>
                    <input
                      type="text"
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      className="input-field"
                      placeholder="Enter broker's client ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Demat Number *
                    </label>
                    <input
                      type="text"
                      value={formData.demat_number}
                      onChange={(e) => setFormData({ ...formData, demat_number: e.target.value })}
                      className="input-field"
                      placeholder="NSDL/CDSL demat account number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nominee
                    </label>
                    <select
                      value={formData.nominee_id}
                      onChange={(e) => setFormData({ ...formData, nominee_id: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Nominee (Optional)</option>
                      {nominees.map((nominee: Nominee) => (
                        <option key={nominee.id} value={nominee.id}>
                          {nominee.name} ({nominee.relation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Portfolio Value
                    </label>
                    <input
                      type="number"
                      value={formData.current_value}
                      onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                      className="input-field"
                      placeholder="Enter current portfolio value"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Closed' | 'Suspended' })}
                      className="input-field"
                    >
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button type="submit" className="flex-1 btn-primary">
                      {editingAccount ? 'Update Account' : 'Add Account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingAccount(null);
                        setFormData({
                          broker_name: '',
                          client_id: '',
                          demat_number: '',
                          nominee_id: '',
                          current_value: '',
                          status: 'Active'
                        });
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

        {/* Additional Information for Nominees */}
        {isNominee && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Important Information</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• You have read-only access to trading accounts assigned to you as a nominee</p>
              <p>• To claim these accounts, follow the claim process outlined above</p>
              <p>• Contact the respective brokers directly for account transfer procedures</p>
              <p>• Keep all required documents ready for the claim process</p>
              <p>• The claim process may take 15-30 days depending on the broker</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingAccounts;
