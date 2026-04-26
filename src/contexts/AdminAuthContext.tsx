import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type AdminUser = {
  id: number;
  nome: string;
  email: string;
};

type AdminAuthContextType = {
  adminUser: AdminUser | null;
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (token: string, user: AdminUser) => void;
  logoutAdmin: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'admin_token';
const STORAGE_USER = 'admin_user';

const loadFromStorage = (): { token: string | null; user: AdminUser | null } => {
  try {
    const token = localStorage.getItem(STORAGE_KEY);
    const raw = localStorage.getItem(STORAGE_USER);
    const user = raw ? (JSON.parse(raw) as AdminUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const stored = loadFromStorage();
  const [adminToken, setAdminToken] = useState<string | null>(stored.token);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(stored.user);

  const loginAdmin = useCallback((token: string, user: AdminUser) => {
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    setAdminToken(token);
    setAdminUser(user);
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_USER);
    setAdminToken(null);
    setAdminUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isAdminAuthenticated: !!adminToken,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
