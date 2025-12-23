import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthState, logoutUser } from '../services/auth';

/**
 * AuthContext provides authentication state and utilities throughout the app.
 * 
 * Features:
 * - Firebase authentication state management
 * - User custom claims (role, tenantId, tenantName)
 * - Multi-tenant support with tenant switching for super-admins
 * 
 * @typedef {Object} UserClaims
 * @property {('super-admin'|'tenant-admin'|'tenant-user')} role - User's role
 * @property {string} tenantId - User's assigned tenant ID
 * @property {string} tenantName - User's tenant display name
 * 
 * @typedef {Object} AuthContextValue
 * @property {Object|null} currentUser - Firebase user object or null if not authenticated
 * @property {UserClaims|null} userClaims - User's custom claims from JWT token
 * @property {boolean} isLoading - True while auth state is being determined
 * @property {string|null} error - Error message if auth operation failed
 * @property {Function} logout - Signs out the current user
 * @property {string|null} activeTenantId - Currently active tenant (for super-admin switching)
 * @property {Function} switchTenant - Switches active tenant (super-admin only)
 * @property {Function} getEffectiveTenantId - Returns the tenant ID to use for API calls
 */
const AuthContext = createContext();

/**
 * AuthProvider component that wraps the app and provides auth context.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userClaims, setUserClaims] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTenantId, setActiveTenantId] = useState(null); // For super-admin tenant switching

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setCurrentUser(user);
      
      // Fetch user custom claims from Firebase ID token
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          const claims = {
            role: idTokenResult.claims.role || 'tenant-user',
            tenantId: idTokenResult.claims.tenantId,
            tenantName: idTokenResult.claims.tenantName,
          };
          setUserClaims(claims);
          
          // Set initial active tenant to user's assigned tenant
          if (!activeTenantId) {
            setActiveTenantId(claims.tenantId);
          }
        } catch (err) {
          console.error('Error fetching user claims:', err);
          setUserClaims(null);
        }
      } else {
        setUserClaims(null);
        setActiveTenantId(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeTenantId]);

  /**
   * Signs out the current user and clears all auth state.
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setError(null);
      await logoutUser();
      setUserClaims(null);
      setActiveTenantId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Switches the active tenant context for super-admin users.
   * This allows super-admins to view data from any tenant without logging in as them.
   * 
   * @param {string} tenantId - The tenant ID to switch to
   * @returns {void}
   */
  const switchTenant = (tenantId) => {
    // Only allow super-admins to switch tenants
    if (userClaims?.role === 'super-admin') {
      setActiveTenantId(tenantId);
    }
  };

  /**
   * Returns the effective tenant ID to use for API calls.
   * 
   * For super-admins: Returns the activeTenantId if they've switched to view another tenant,
   * otherwise returns their assigned tenantId.
   * 
   * For other users: Always returns their assigned tenantId from claims.
   * 
   * This ensures data isolation while allowing super-admins to administer any tenant.
   * 
   * @returns {string|undefined} The tenant ID to use for API requests
   */
  const getEffectiveTenantId = () => {
    if (userClaims?.role === 'super-admin' && activeTenantId) {
      return activeTenantId;
    }
    return userClaims?.tenantId;
  };

  const value = {
    currentUser,
    userClaims,
    isLoading,
    error,
    logout,
    activeTenantId,
    switchTenant,
    getEffectiveTenantId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to access auth context.
 * Must be used within an AuthProvider.
 * 
 * @returns {AuthContextValue} The auth context value
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * const { currentUser, userClaims, logout, getEffectiveTenantId } = useAuth();
 * 
 * // Check if user is authenticated
 * if (!currentUser) return <LoginPage />;
 * 
 * // Get tenant ID for API calls
 * const tenantId = getEffectiveTenantId();
 * 
 * // Check user role
 * if (userClaims?.role === 'super-admin') {
 *   // Show admin features
 * }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

