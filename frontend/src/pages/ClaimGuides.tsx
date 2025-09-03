import React from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';

interface ClaimGuide {
  id: string;
  title: string;
  description: string;
  steps: string[];
  documents: string[];
  downloadUrl: string;
}

const ClaimGuides: React.FC = () => {
  const guides: ClaimGuide[] = [
    {
      id: 'lic',
      title: 'LIC Policy Claim',
      description: 'Step-by-step guide to claim LIC insurance policies',
      steps: [
        'Inform LIC office about the policyholder\'s death within 30 days',
        'Collect claim form from LIC office or download online',
        'Submit death certificate, policy document, and nominee\'s ID',
        'Get police report if death is unnatural or within 2 years of policy',
        'Submit completed form with required documents',
        'LIC will verify documents and process claim within 30 days',
        'Claim amount will be credited to nominee\'s bank account'
      ],
      documents: [
        'Original policy document',
        'Death certificate',
        'Nominee\'s ID proof',
        'Nominee\'s bank account details',
        'Medical certificate (if required)',
        'Police report (if applicable)'
      ],
      downloadUrl: '/guides/lic-claim-guide.pdf'
    },
    {
      id: 'pf',
      title: 'Provident Fund (PF) Withdrawal',
      description: 'Guide to withdraw EPF after employee\'s death',
      steps: [
        'Inform employer and EPFO about employee\'s death',
        'Obtain death certificate from municipal authorities',
        'Get Form 20 (Scheme certificate) from employer',
        'Fill Form 5 (Withdrawal form) for nominee claim',
        'Submit documents to EPFO regional office',
        'EPFO will verify nominee details and process claim',
        'Amount will be transferred to nominee\'s bank account'
      ],
      documents: [
        'Death certificate',
        'Form 20 (Scheme certificate)',
        'Form 5 (Withdrawal form)',
        'Nominee\'s bank account details',
        'Nominee\'s ID proof',
        'Cancelled cheque or bank statement'
      ],
      downloadUrl: '/guides/pf-withdrawal-guide.pdf'
    },
    {
      id: 'bank',
      title: 'Bank Account Nominee Claim',
      description: 'Process to claim bank deposits by nominees',
      steps: [
        'Visit the bank branch where account is maintained',
        'Submit death certificate and account details',
        'Fill claim form provided by bank',
        'Provide nominee\'s identity and address proof',
        'Submit cancelled cheque for fund transfer',
        'Bank will verify documents and nominee details',
        'Funds will be transferred after verification'
      ],
      documents: [
        'Death certificate',
        'Bank account passbook/statement',
        'Nominee\'s ID and address proof',
        'Cancelled cheque of nominee\'s account',
        'Bank\'s claim form',
        'Legal heir certificate (if required)'
      ],
      downloadUrl: '/guides/bank-claim-guide.pdf'
    },
    {
      id: 'property',
      title: 'Property Transfer Process',
      description: 'Legal process for property inheritance',
      steps: [
        'Obtain death certificate from municipal corporation',
        'Get legal heir certificate from tehsildar office',
        'Obtain succession certificate from district court',
        'Calculate stamp duty and registration fees',
        'Submit application for property transfer',
        'Pay applicable taxes and fees',
        'Complete registration process at sub-registrar office'
      ],
      documents: [
        'Death certificate',
        'Original property documents',
        'Legal heir certificate',
        'Succession certificate',
        'Property tax receipts',
        'Survey settlement records',
        'No objection from other legal heirs'
      ],
      downloadUrl: '/guides/property-transfer-guide.pdf'
    }
  ];

  const handleDownload = (guide: ClaimGuide) => {
    // Mock PDF download
    console.log(`Downloading ${guide.title} guide...`);
    alert(`${guide.title} guide downloaded successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Claim Guides</h1>
        <p className="text-gray-600 mt-2">
          Step-by-step instructions for claiming different types of assets
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <div key={guide.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{guide.title}</h2>
                <p className="text-gray-600 mt-1">{guide.description}</p>
              </div>
              <button
                onClick={() => handleDownload(guide)}
                className="btn-secondary flex items-center space-x-1 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>

            {/* Steps */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Process Steps
              </h3>
              <div className="space-y-2">
                {guide.steps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-medium text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 text-blue-500 mr-2" />
                Required Documents
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {guide.documents.map((doc, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Important Notes */}
      <div className="card bg-yellow-50 border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">Important Notes</h3>
        <div className="space-y-2 text-sm text-yellow-800">
          <p>• Always keep original documents safe and submit certified copies when possible</p>
          <p>• Time limits apply for certain claims - act promptly after death</p>
          <p>• Consider consulting a legal advisor for complex property transfers</p>
          <p>• Some claims may require additional documents based on specific circumstances</p>
          <p>• Keep multiple copies of death certificate as it's required for most claims</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Legal Assistance</h4>
            <p className="text-sm text-gray-600 mb-1">Free legal aid helpline</p>
            <p className="text-sm font-medium text-primary-600">1800-123-4567</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Support Email</h4>
            <p className="text-sm text-gray-600 mb-1">For technical support</p>
            <p className="text-sm font-medium text-primary-600">support@lifevault.in</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimGuides; 