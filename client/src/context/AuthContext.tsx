import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types';
import { PatientRegistrationInput } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (registration: PatientRegistrationInput) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => '',
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('lab_auth_token');
    if (savedToken) {
      setToken(savedToken);
      api.get('/auth/profile').then((response) => {
        setUser(response.data.user);
        localStorage.setItem('lab_auth_user', JSON.stringify(response.data.user));
      }).catch(() => {
        localStorage.removeItem('lab_auth_token');
        localStorage.removeItem('lab_auth_user');
        setUser(null);
        setToken(null);
      }).finally(() => setIsLoading(false));
      return;
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const clearExpiredSession = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('lab_auth_token');
      localStorage.removeItem('lab_auth_user');
    };
    window.addEventListener('lab-auth-expired', clearExpiredSession);
    return () => window.removeEventListener('lab-auth-expired', clearExpiredSession);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: jwtToken, user: userData } = response.data;

    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('lab_auth_token', jwtToken);
    localStorage.setItem('lab_auth_user', JSON.stringify(userData));
  };

  const register = async (registration: PatientRegistrationInput) => {
    const response = await api.post('/auth/register', registration);
    const { token: jwtToken, user: userData } = response.data;

    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('lab_auth_token', jwtToken);
    localStorage.setItem('lab_auth_user', JSON.stringify(userData));
    return response.data.patientId as string;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lab_auth_token');
    localStorage.removeItem('lab_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
