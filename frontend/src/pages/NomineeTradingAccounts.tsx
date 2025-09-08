import React, { useState, useEffect } from 'react';
import { Building2, CreditCard, User, ExternalLink, FileText } from 'lucide-react';
import { tradingAccountsAPI } from '../services/api';

interface TradingAccount {
  id: string;
  broker_name: string;
  client_id: string;
  demat_number: string;
  nominee_id?: string;
  current_value: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const NomineeTradingAccounts: React.FC = () => {
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch trading accounts assigned to the nominee
  useEffect(() => {
    const fetchTradingAccounts = async () => {
      try {
        const response = await tradingAccountsAPI.getAll();
        // Filter accounts assigned to this nominee (in real app, this would be done by backend)
        setTradingAccounts(response.data);
      } catch (error) {
        console.error('Error fetching trading accounts:', error);
        setTradingAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTradingAccounts();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
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
    // Open claim guide in new tab
    window.open('/claim-guides', '_blank');
  };

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
                View trading accounts assigned to you as nominee
              </p>
            </div>
            <button
              onClick={handleClaimGuide}
              className="btn-primary flex items-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              Claim Guide
            </button>
          </div>
        </div>

        {/* Claim Instructions */}
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

        {/* Trading Accounts Grid */}
        {tradingAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Trading Accounts Assigned</h3>
            <p className="text-gray-600">
              No trading accounts have been assigned to you as a nominee yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tradingAccounts.map((account) => (
              <div key={account.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{account.broker_name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span className="font-medium">Client ID:</span>
                    <span className="ml-2 font-mono">{account.client_id}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span className="font-medium">Demat:</span>
                    <span className="ml-2 font-mono">{account.demat_number}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Current Value</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(account.current_value)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Read-only indicator */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="w-3 h-3 mr-1" />
                    <span>Read-only access as nominee</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Information */}
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
      </div>
    </div>
  );
};

export default NomineeTradingAccounts;
