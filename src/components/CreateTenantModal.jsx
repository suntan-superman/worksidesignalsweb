import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api-client';
import toast from 'react-hot-toast';

const INDUSTRIES = [
  { value: 'oil-gas', label: 'Oil & Gas' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'water-treatment', label: 'Water Treatment' },
  { value: 'mining', label: 'Mining' },
  { value: 'chemicals', label: 'Chemicals' },
  { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'other', label: 'Other' },
];

const PLANS = [
  { 
    value: 'starter', 
    label: 'Starter', 
    price: '$1,999/mo',
    maxUsers: 10,
    maxSensors: 5000
  },
  { 
    value: 'professional', 
    label: 'Professional', 
    price: '$3,499/mo',
    maxUsers: 25,
    maxSensors: 20000
  },
  { 
    value: 'enterprise', 
    label: 'Enterprise', 
    price: '$5,999/mo',
    maxUsers: 100,
    maxSensors: 50000
  },
];

export default function CreateTenantModal({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEditingId, setIsEditingId] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    id: '',
    industry: 'oil-gas',
    description: '',
    plan: 'professional',
    status: 'active',
    
    // Administrator
    adminName: '',
    adminEmail: '',
    
    // Contacts
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    secondaryContactName: '',
    secondaryContactEmail: '',
    secondaryContactPhone: '',
    billingContactName: '',
    billingContactEmail: '',
    billingContactPhone: '',
  });

  const generateTenantId = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate tenant ID from name (only if not manually editing)
      if (field === 'name' && !isEditingId) {
        updated.id = generateTenantId(value);
      }
      
      return updated;
    });
  };

  const selectedPlan = PLANS.find(p => p.value === formData.plan);

  // Check if all mandatory fields are valid
  const isFormValid = () => {
    // Tab 1 validations
    if (!formData.name.trim()) return false;
    if (!formData.id.trim()) return false;
    if (!/^[a-z0-9-]+$/.test(formData.id)) return false;
    
    // Tab 2 validations
    if (!formData.adminName.trim()) return false;
    if (!formData.adminEmail.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) return false;
    
    // Tab 3 - no mandatory fields
    
    return true;
  };

  // Check if a specific tab is complete
  const isTabComplete = (tabIndex) => {
    switch (tabIndex) {
      case 0:
        return formData.name.trim() && formData.id.trim() && /^[a-z0-9-]+$/.test(formData.id);
      case 1:
        return formData.adminName.trim() && formData.adminEmail.trim() && 
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail);
      case 2:
        return true; // Optional tab
      default:
        return false;
    }
  };

  const validateTab = (tabIndex) => {
    switch (tabIndex) {
      case 0: // Basic Info
        if (!formData.name.trim()) {
          toast.error('Tenant name is required');
          return false;
        }
        if (!formData.id.trim()) {
          toast.error('Tenant ID is required');
          return false;
        }
        if (!/^[a-z0-9-]+$/.test(formData.id)) {
          toast.error('Tenant ID can only contain lowercase letters, numbers, and hyphens');
          return false;
        }
        return true;
      
      case 1: // Administrator
        if (!formData.adminName.trim()) {
          toast.error('Administrator name is required');
          return false;
        }
        if (!formData.adminEmail.trim()) {
          toast.error('Administrator email is required');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        return true;
      
      case 2: // Contacts (all optional)
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateTab(activeTab)) {
      setActiveTab(prev => Math.min(prev + 1, 2));
    }
  };

  const handlePrevious = () => {
    setActiveTab(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    // Validate all tabs
    for (let i = 0; i <= 2; i++) {
      if (!validateTab(i)) {
        setActiveTab(i);
        return;
      }
    }

    try {
      setLoading(true);
      toast.loading('Creating tenant...');
      
      const response = await apiClient.post('/tenants', {
        ...formData,
        maxUsers: selectedPlan.maxUsers,
        maxSensors: selectedPlan.maxSensors,
        createdBy: currentUser.email,
      });

      toast.dismiss();
      toast.success(`Tenant "${formData.name}" created successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        id: '',
        industry: 'oil-gas',
        description: '',
        plan: 'professional',
        status: 'active',
        adminName: '',
        adminEmail: '',
        primaryContactName: '',
        primaryContactEmail: '',
        primaryContactPhone: '',
        secondaryContactName: '',
        secondaryContactEmail: '',
        secondaryContactPhone: '',
        billingContactName: '',
        billingContactEmail: '',
        billingContactPhone: '',
      });
      setActiveTab(0);
      setIsEditingId(false);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      onClose();
    } catch (error) {
      toast.dismiss();
      console.error('Error creating tenant:', error);
      toast.error(error.response?.data?.message || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAttempt = () => {
    // Check if any data has been entered
    const hasData = formData.name || formData.adminName || formData.adminEmail || 
                    formData.primaryContactName || formData.description;
    
    if (hasData) {
      setShowCancelConfirm(true);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      id: '',
      industry: 'oil-gas',
      description: '',
      plan: 'professional',
      status: 'active',
      adminName: '',
      adminEmail: '',
      primaryContactName: '',
      primaryContactEmail: '',
      primaryContactPhone: '',
      secondaryContactName: '',
      secondaryContactEmail: '',
      secondaryContactPhone: '',
      billingContactName: '',
      billingContactEmail: '',
      billingContactPhone: '',
    });
    setActiveTab(0);
    setIsEditingId(false);
    setShowCancelConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 0, label: 'Basic Information', icon: '🏢' },
    { id: 1, label: 'Administrator', icon: '👤' },
    { id: 2, label: 'Contact Information', icon: '📞' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay - Non-dismissible */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Create New Tenant</h2>
            <button
              onClick={handleCloseAttempt}
              className="text-white hover:text-gray-200 text-2xl font-bold hover:rotate-90 transition-transform"
              disabled={loading}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 px-4 py-3 text-sm font-medium transition-all relative
                    ${activeTab === tab.id
                      ? 'bg-white text-green-600 border-b-2 border-green-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                  disabled={loading}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {isTabComplete(tab.id) && tab.id !== activeTab && (
                    <span className="ml-2 text-green-500 font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content - Fixed height to prevent resizing */}
          <div className="px-6 py-6 overflow-y-auto" style={{ height: '500px' }}>
            {/* Tab 1: Basic Information */}
            {activeTab === 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Tenant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Acme Oil & Gas Company"
                      disabled={loading}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Tenant ID <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.id}
                        onChange={(e) => handleChange('id', e.target.value)}
                        className={`
                          flex-1 px-4 py-2.5 border-2 rounded-lg font-mono text-sm
                          ${isEditingId 
                            ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent' 
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          }
                        `}
                        placeholder="acme-oil-gas-company"
                        disabled={loading || !isEditingId}
                        readOnly={!isEditingId}
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingId(!isEditingId)}
                        className={`
                          px-4 py-2.5 rounded-lg font-medium text-sm transition-colors
                          ${isEditingId
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }
                        `}
                        disabled={loading}
                      >
                        {isEditingId ? '🔒 Lock' : '✏️ Edit'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isEditingId 
                        ? 'Lowercase letters, numbers, and hyphens only. Must be unique.'
                        : 'Auto-generated from tenant name. Click Edit to customize.'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={loading}
                    >
                      {INDUSTRIES.map(industry => (
                        <option key={industry.value} value={industry.value}>
                          {industry.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="trial">Trial</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Description / Internal Notes
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows="3"
                      placeholder="Internal notes about this tenant..."
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Subscription Plan
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {PLANS.map(plan => (
                      <button
                        key={plan.value}
                        onClick={() => handleChange('plan', plan.value)}
                        className={`
                          p-4 border-2 rounded-lg transition-all text-left
                          ${formData.plan === plan.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                          }
                        `}
                        disabled={loading}
                      >
                        <div className="font-bold text-gray-900">{plan.label}</div>
                        <div className="text-sm text-green-600 font-semibold">{plan.price}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          • {plan.maxSensors.toLocaleString()} sensors<br/>
                          • {plan.maxUsers} users
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Administrator */}
            {activeTab === 1 && (
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 mb-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">ℹ️ Administrator Account:</span> This person will be the tenant administrator
                    and will receive an invitation email to set up their account.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Administrator Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => handleChange('adminName', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John Smith"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Administrator Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => handleChange('adminEmail', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="john.smith@company.com"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    An invitation email will be sent to this address.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Contact Information */}
            {activeTab === 2 && (
              <div className="space-y-6">
                {/* Primary Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.primaryContactName}
                        onChange={(e) => handleChange('primaryContactName', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="John Smith"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.primaryContactEmail}
                        onChange={(e) => handleChange('primaryContactEmail', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="john@company.com"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.primaryContactPhone}
                        onChange={(e) => handleChange('primaryContactPhone', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Contact */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Secondary Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryContactName}
                        onChange={(e) => handleChange('secondaryContactName', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Jane Doe"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.secondaryContactEmail}
                        onChange={(e) => handleChange('secondaryContactEmail', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="jane@company.com"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.secondaryContactPhone}
                        onChange={(e) => handleChange('secondaryContactPhone', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="(555) 987-6543"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Contact */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.billingContactName}
                        onChange={(e) => handleChange('billingContactName', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Accounts Payable"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.billingContactEmail}
                        onChange={(e) => handleChange('billingContactEmail', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="billing@company.com"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.billingContactPhone}
                        onChange={(e) => handleChange('billingContactPhone', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="(555) 456-7890"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Note */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">ℹ️ Note:</span> All contact fields are optional.
                    You can add or update this information later.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Step {activeTab + 1} of {tabs.length}
              </div>
              <button
                onClick={handleCloseAttempt}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
            <div className="flex gap-3">
              {activeTab > 0 && (
                <button
                  onClick={handlePrevious}
                  disabled={loading}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
                >
                  ← Previous
                </button>
              )}
              
              {activeTab < tabs.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium shadow-md"
                  title={!isTabComplete(activeTab) ? 'Please complete required fields' : ''}
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid()}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
                  title={!isFormValid() ? 'Please fill in all required fields' : ''}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    '✓ Create Tenant'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Discard Changes?
            </h3>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to close this dialog? All entered data will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Continue Editing
              </button>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
              >
                Discard & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

