import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Crown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface Nominee {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  allocation: number;
  isExecutor: boolean;
  isBackup: boolean;
}

const Nominees: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [nominees, setNominees] = useState<Nominee[]>([
    {
      id: '1',
      name: 'Jane Doe',
      relation: 'Spouse',
      phone: '+91 9876543210',
      email: 'jane@example.com',
      allocation: 60,
      isExecutor: true,
      isBackup: false
    },
    {
      id: '2',
      name: 'John Doe Jr.',
      relation: 'Child',
      phone: '+91 9876543211',
      email: 'john.jr@example.com',
      allocation: 40,
      isExecutor: false,
      isBackup: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    phone: '',
    email: '',
    allocation: '',
    isExecutor: false,
    isBackup: false
  });

  const relations = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];

  // Check if we should auto-open the form (from dashboard navigation)
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddForm(true);
      // Remove the parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNominee: Nominee = {
      id: Date.now().toString(),
      name: formData.name,
      relation: formData.relation,
      phone: formData.phone,
      email: formData.email,
      allocation: parseFloat(formData.allocation),
      isExecutor: formData.isExecutor,
      isBackup: formData.isBackup
    };
    setNominees([...nominees, newNominee]);
    setFormData({
      name: '',
      relation: '',
      phone: '',
      email: '',
      allocation: '',
      isExecutor: false,
      isBackup: false
    });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this nominee?')) {
      setNominees(nominees.filter(nominee => nominee.id !== id));
    }
  };

  const totalAllocation = nominees.reduce((sum, nominee) => sum + nominee.allocation, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nominees</h1>
          <p className="text-gray-600">Manage your asset nominees and allocations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Nominee</span>
        </button>
      </div>

      {/* Allocation Summary */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Allocation Summary</h3>
            <p className="text-sm text-gray-600">Total allocation percentage</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${totalAllocation === 100 ? 'text-green-600' : 'text-red-600'}`}>
              {totalAllocation}%
            </p>
            <p className="text-sm text-gray-500">
              {totalAllocation === 100 ? 'Complete' : `${100 - totalAllocation}% remaining`}
            </p>
          </div>
        </div>
      </div>

      {/* Nominees Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nominees.map((nominee) => (
                <tr key={nominee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {nominee.name}
                        {nominee.isExecutor && (
                          <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{nominee.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {nominee.relation}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {nominee.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${nominee.allocation}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {nominee.allocation}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {nominee.isExecutor && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Executor
                        </span>
                      )}
                      {nominee.isBackup && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Backup
                        </span>
                      )}
                      {!nominee.isExecutor && !nominee.isBackup && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Primary
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(nominee.id)}
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

      {/* Add Nominee Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Nominee</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relation
                  </label>
                  <select
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Relation</option>
                    {relations.map(relation => (
                      <option key={relation} value={relation}>{relation}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allocation Percentage
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.allocation}
                  onChange={(e) => setFormData({ ...formData, allocation: e.target.value })}
                  className="input-field"
                  placeholder="25"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Currently allocated: {totalAllocation}% | Remaining: {100 - totalAllocation}%
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="executor"
                    checked={formData.isExecutor}
                    onChange={(e) => setFormData({ ...formData, isExecutor: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="executor" className="ml-2 block text-sm text-gray-900">
                    Designate as Executor
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="backup"
                    checked={formData.isBackup}
                    onChange={(e) => setFormData({ ...formData, isBackup: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="backup" className="ml-2 block text-sm text-gray-900">
                    Mark as Backup Nominee
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Add Nominee
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

export default Nominees; 