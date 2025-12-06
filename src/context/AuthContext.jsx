import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthState, logoutUser } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userClaims, setUserClaims] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setCurrentUser(user);
      
      // Fetch user custom claims
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setUserClaims({
            role: idTokenResult.claims.role || 'tenant-user',
            tenantId: idTokenResult.claims.tenantId,
            tenantName: idTokenResult.claims.tenantName,
          });
        } catch (err) {
          console.error('Error fetching user claims:', err);
          setUserClaims(null);
        }
      } else {
        setUserClaims(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      setError(null);
      await logoutUser();
      setUserClaims(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const value = {
    currentUser,
    userClaims,
    isLoading,
    error,
    logout,
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

