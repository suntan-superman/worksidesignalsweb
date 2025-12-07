import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthState, logoutUser } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userClaims, setUserClaims] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTenantId, setActiveTenantId] = useState(null); // For super-admin tenant switching

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setCurrentUser(user);
      
      // Fetch user custom claims
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          const claims = {
            role: idTokenResult.claims.role || 'tenant-user',
            tenantId: idTokenResult.claims.tenantId,
            tenantName: idTokenResult.claims.tenantName,
          };
          setUserClaims(claims);
          
          // Set initial active tenant
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

  const switchTenant = (tenantId) => {
    // Only allow super-admins to switch tenants
    if (userClaims?.role === 'super-admin') {
      setActiveTenantId(tenantId);
    }
  };

  // Get the effective tenant ID (active tenant for super-admin, or user's tenant)
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

