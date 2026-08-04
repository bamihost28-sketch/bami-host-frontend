import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import type { UserRole } from "@/types/auth";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  department?: string;
  hourlyRate?: number;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  agreementSignedAt?: string | null;
  // Role-specific fields
  assignedEstates?: string[];
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

// Token management utilities
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error accessing token:', error);
    return null;
  }
};

const setStoredToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as any;
        if (parsedUser.id && parsedUser.role) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          // Invalid user data, clear storage
          logout();
        }
      } catch (error) {
        // Invalid JSON, clear storage
        logout();
      }
    }

    setIsInitializing(false);
  }, []);

  const login = (token: string, user: User) => {
    setToken(token);
    setUser(user);
    setStoredToken(token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setStoredToken(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!user && !!token,
      isInitializing,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Add token getter to useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return {
    ...context,
    getToken: () => getStoredToken()
  };
};