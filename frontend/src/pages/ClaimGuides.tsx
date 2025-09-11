import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, FileText, Phone, Mail } from 'lucide-react';

const ClaimGuides: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const guides = [
    {
      id: 'bank-accounts',
      title: 'Bank Accounts & Fixed Deposits',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Required Documents:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Death certificate (original + copies)</li>
              <li>Nominee's identity proof (Aadhaar, PAN, Voter ID)</li>
              <li>Nominee's address proof</li>
              <li>Bank account details of the deceased</li>
              <li>Nomination form (if available)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Process:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Visit the bank branch with all documents</li>
              <li>Submit the claim application form</li>
              <li>Bank will verify the documents (7-15 days)</li>
              <li>Funds will be transferred to nominee's account</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Timeline:</h4>
            <p className="text-sm text-gray-700">7-30 days depending on the bank</p>
          </div>
        </div>
      )
    },
    {
      id: 'mutual-funds',
      title: 'Mutual Funds & Investments',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Required Documents:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Death certificate (original + copies)</li>
              <li>Nominee's identity proof</li>
              <li>Nominee's address proof</li>
              <li>Folio number and scheme details</li>
              <li>Nomination form or will</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Process:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Contact the mutual fund company or AMC</li>
              <li>Submit claim application with documents</li>
              <li>AMC will process the claim (10-20 days)</li>
              <li>Units will be redeemed and proceeds transferred</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Timeline:</h4>
            <p className="text-sm text-gray-700">10-30 days depending on the AMC</p>
          </div>
        </div>
      )
    },
    {
      id: 'insurance',
      title: 'Life Insurance Claims',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Required Documents:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Death certificate (original + copies)</li>
              <li>Nominee's identity proof</li>
              <li>Original policy document</li>
              <li>Claim form (Form 3783 for LIC)</li>
              <li>Medical records (if required)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Process:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Intimate the insurance company immediately</li>
              <li>Submit claim form with all documents</li>
              <li>Company will investigate (30-90 days)</li>
              <li>Claim amount will be paid to nominee</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Timeline:</h4>
            <p className="text-sm text-gray-700">30-90 days depending on the case</p>
          </div>
        </div>
      )
    },
    {
      id: 'trading-accounts',
      title: 'Trading & Demat Accounts',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Required Documents:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Death certificate (original + copies)</li>
              <li>Nominee's identity proof</li>
              <li>Nominee's address proof</li>
              <li>Demat account details</li>
              <li>Nomination form or will</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Process:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Contact the broker or depository participant</li>
              <li>Submit transmission form with documents</li>
              <li>Broker will process the transmission (7-15 days)</li>
              <li>Securities will be transferred to nominee's account</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Timeline:</h4>
            <p className="text-sm text-gray-700">7-30 days depending on the broker</p>
          </div>
        </div>
      )
    },
    {
      id: 'property',
      title: 'Property & Real Estate',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Required Documents:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Death certificate (original + copies)</li>
              <li>Nominee's identity proof</li>
              <li>Property documents (sale deed, registration)</li>
              <li>Succession certificate or probate</li>
              <li>Mutation application</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Process:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Obtain succession certificate from court</li>
              <li>Apply for mutation in revenue records</li>
              <li>Update property records (30-60 days)</li>
              <li>Transfer ownership to legal heirs</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Timeline:</h4>
            <p className="text-sm text-gray-700">3-6 months depending on court process</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claim Guides</h1>
          <p className="text-gray-600">Step-by-step guides for claiming assets after a loved one's passing.</p>
        </div>
        <div className="flex items-center space-x-2 text-primary-600">
          <BookOpen className="w-6 h-6" />
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <BookOpen className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Our support team is here to assist you with the claim process.</p>
              <div className="mt-2 flex space-x-4">
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>+91 9876543210</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>support@lifevault.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Guides */}
      <div className="space-y-4">
        {guides.map((guide) => (
          <div key={guide.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection(guide.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
            >
              <div className="flex items-center space-x-3">
                <div className="text-primary-600">
                  {guide.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900">{guide.title}</h3>
              </div>
              <div className="text-gray-400">
                {expandedSections.has(guide.id) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </div>
            </button>
            
            {expandedSections.has(guide.id) && (
              <div className="px-6 pb-4 border-t border-gray-200">
                {guide.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Resources */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Legal Documents</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Succession Certificate</li>
              <li>• Probate of Will</li>
              <li>• Letter of Administration</li>
              <li>• No Objection Certificate (NOC)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Important Contacts</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• District Court for succession certificate</li>
              <li>• Revenue Department for property mutation</li>
              <li>• Insurance Ombudsman for disputes</li>
              <li>• Banking Ombudsman for bank issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimGuides;
