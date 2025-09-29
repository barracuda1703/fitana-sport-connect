import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/services/DataStore';
import { dataStore } from '@/services/DataStore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'client' | 'trainer') => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session or auto-login as client
    const savedUser = localStorage.getItem('fitana-current-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('fitana-current-user');
      }
    } else {
      // Auto-login as default client
      const defaultClient = {
        id: 'u-client1',
        role: 'client' as const,
        email: 'client@test.com',
        password: 'demo123',
        name: 'Kasia',
        city: 'Warszawa',
        language: 'pl'
      };
      setUser(defaultClient);
      localStorage.setItem('fitana-current-user', JSON.stringify(defaultClient));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const loggedUser = await dataStore.login(email, password);
      if (loggedUser) {
        setUser(loggedUser);
        localStorage.setItem('fitana-current-user', JSON.stringify(loggedUser));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    try {
      const newUser = await dataStore.register(userData);
      setUser(newUser);
      localStorage.setItem('fitana-current-user', JSON.stringify(newUser));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fitana-current-user');
  };

  const switchRole = (role: 'client' | 'trainer') => {
    if (user) {
      let updatedUser;
      if (role === 'trainer') {
        // Create or update trainer profile
        const trainerProfile = dataStore.createOrUpdateTrainerProfile(user.id, user);
        updatedUser = { 
          ...user, 
          role, 
          id: trainerProfile.userId // Use the original user ID
        };
      } else {
        // Switch back to client
        updatedUser = { 
          ...user, 
          role, 
          id: user.id.startsWith('u-') ? user.id : 'u-client1' // Keep original client ID or default
        };
      }
      setUser(updatedUser);
      localStorage.setItem('fitana-current-user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = () => {
    if (user) {
      // Reload user data from dataStore
      const updatedUser = dataStore.getUserById(user.id);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('fitana-current-user', JSON.stringify(updatedUser));
      }
    }
  };

  const value = React.useMemo(
    () => ({ user, isLoading, login, register, logout, switchRole, refreshUser }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};