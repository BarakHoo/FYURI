import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAdmin(data);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only check the admin session on admin routes — regular visitors
    // should never trigger admin auth requests (avoids 401 noise in console)
    if (window.location.pathname.startsWith('/fyuri-admin')) {
      checkSession();
    } else {
      setLoading(false);
    }
  }, [checkSession]);

  const login = async (email, password) => {
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data; // { setupRequired, pendingToken, qrCode?, secret? }
  };

  const enableTwoFactor = async (pendingToken, code) => {
    const response = await fetch('/api/admin/auth/enable-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ pendingToken, code }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to enable 2FA');
    }

    await checkSession();
    return data;
  };

  const verifyTwoFactor = async (pendingToken, code) => {
    const response = await fetch('/api/admin/auth/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ pendingToken, code }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Verification failed');
    }

    await checkSession();
    return data;
  };

  const logout = async () => {
    await fetch('/api/admin/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: !!admin,
        login,
        enableTwoFactor,
        verifyTwoFactor,
        logout,
        checkSession,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
