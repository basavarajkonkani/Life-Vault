import { Controller, Get, Headers } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  @Get('stats')
  async getDashboardStats(@Headers('authorization') auth: string) {
    // Mock data that matches frontend structure
    return {
      totalAssets: 4,
      totalNominees: 2,
      netWorth: 2500000,
      assetAllocation: [
        { name: 'Bank', value: 35, amount: 875000, color: '#1E3A8A' },
        { name: 'LIC', value: 25, amount: 625000, color: '#3B82F6' },
        { name: 'Property', value: 20, amount: 500000, color: '#60A5FA' },
        { name: 'Stocks', value: 20, amount: 500000, color: '#93C5FD' },
      ],
      recentActivity: [
        {
          id: 1,
          type: 'asset_added',
          description: 'Added SBI Savings Account',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: 'success'
        },
        {
          id: 2,
          type: 'nominee_updated',
          description: 'Updated nominee allocation',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          status: 'info'
        },
        {
          id: 3,
          type: 'reminder',
          description: 'LIC policy renewal reminder',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          status: 'warning'
        }
      ]
    };
  }

  @Get('assets')
  async getAssets(@Headers('authorization') auth: string) {
    return [
      {
        id: '1',
        category: 'Bank',
        institution: 'State Bank of India',
        accountNumber: '****1234',
        currentValue: 500000,
        status: 'Active',
        documents: ['passbook.pdf'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        category: 'LIC',
        institution: 'LIC of India',
        accountNumber: '****5678',
        currentValue: 200000,
        status: 'Active',
        documents: ['policy.pdf'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        category: 'Property',
        institution: 'Self',
        accountNumber: 'Property Deed',
        currentValue: 1500000,
        status: 'Active',
        documents: ['deed.pdf'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        category: 'Stocks',
        institution: 'Zerodha',
        accountNumber: '****9012',
        currentValue: 300000,
        status: 'Active',
        documents: ['portfolio.pdf'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  @Get('nominees')
  async getNominees(@Headers('authorization') auth: string) {
    return [
      {
        id: '1',
        name: 'Jane Doe',
        relation: 'Spouse',
        phone: '+91 9876543210',
        email: 'jane@example.com',
        allocationPercentage: 60,
        isExecutor: true,
        isBackup: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'John Doe Jr.',
        relation: 'Child',
        phone: '+91 9876543211',
        email: 'john.jr@example.com',
        allocationPercentage: 40,
        isExecutor: false,
        isBackup: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
} 