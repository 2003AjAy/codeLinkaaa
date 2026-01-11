import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  userId: string;
  email: string;
  name: string;
  role: 'teacher' | 'interviewer' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pendingRoomId: string | null;
  login: (role: 'teacher' | 'interviewer' | 'user', roomId?: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearPendingRoom: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/status`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for pending room ID in localStorage (set before OAuth redirect)
    const storedRoomId = localStorage.getItem('pendingRoomId');
    if (storedRoomId) {
      setPendingRoomId(storedRoomId);
    }
    checkAuth();
  }, [checkAuth]);

  const login = (role: 'teacher' | 'interviewer' | 'user', roomId?: string) => {
    // Store room ID in localStorage if joining as user
    if (roomId) {
      localStorage.setItem('pendingRoomId', roomId);
    } else {
      localStorage.removeItem('pendingRoomId');
    }
    // Redirect to backend OAuth endpoint with role
    window.location.href = `${API_URL}/api/auth/login?role=${role}`;
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      localStorage.removeItem('pendingRoomId');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const clearPendingRoom = () => {
    localStorage.removeItem('pendingRoomId');
    setPendingRoomId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        pendingRoomId,
        login,
        logout,
        checkAuth,
        clearPendingRoom,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
