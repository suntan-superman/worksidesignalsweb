import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api-client';
import toast from 'react-hot-toast';

export default function TenantSwitcher() {
  const { userClaims, activeTenantId, switchTenant } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Only show for super-admins
  if (userClaims?.role !== 'super-admin') {
    return null;
  }

  useEffect(() => {
    fetchTenants();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/tenants');
      // Handle response - could be array or object with data property
      const tenantsData = Array.isArray(response.data) ? response.data : (response.data.tenants || []);
      setTenants(tenantsData);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Failed to load tenants');
      setTenants([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (tenantId, tenantName) => {
    switchTenant(tenantId);
    setIsOpen(false);
    toast.success(`Switched to ${tenantName}`);
  };

  const activeTenant = Array.isArray(tenants) 
    ? tenants.find(t => t.id === activeTenantId) 
    : null;
  
  const displayName = activeTenant?.name || activeTenantId || 'Loading...';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Tenant Display / Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors"
        style={{ position: 'relative', zIndex: 10 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Tenant:</span>
          <span className="text-sm font-bold text-green-600">{displayName}</span>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Switch Tenant
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <p className="text-sm text-gray-500 mt-2">Loading tenants...</p>
              </div>
            ) : !Array.isArray(tenants) || tenants.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No tenants found
              </div>
            ) : (
              tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleSwitch(tenant.id, tenant.name)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-green-50 transition-colors
                    ${tenant.id === activeTenantId ? 'bg-green-50 border-l-4 border-green-500' : 'border-l-4 border-transparent'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{tenant.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{tenant.id}</p>
                    </div>
                    {tenant.id === activeTenantId && (
                      <span className="text-green-600 font-bold">✓</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="px-3 py-2 border-t border-gray-100 mt-1">
            <p className="text-xs text-gray-400 text-center">
              Super Admin Mode
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

