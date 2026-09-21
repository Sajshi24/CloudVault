import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '@/services/authService';
import type { AuthUser } from '@/services/types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (full_name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [loading, setLoading] = useState(true);

  // On mount (or explicit call), validate the stored token by hitting /auth/me
  const refreshUser = useCallback(async () => {
    const stored = authService.getToken();
    if (!stored) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authService.me();
      setUser(me);
      setToken(stored);
    } catch {
      // Token invalid/expired — clear everything
      authService.clearToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authService.login({ email, password });
      authService.saveToken(res.access_token);
      setToken(res.access_token);
      // Fetch user profile after token is saved
      const me = await authService.me();
      setUser(me);
    },
    []
  );

  // Backend register returns the new user object but NO token.
  // Callers should redirect to /login or call login() afterwards.
  const register = useCallback(
    async (full_name: string, email: string, password: string) => {
      // This just creates the account. Does not log the user in.
      await authService.register({ full_name, email, password });
    },
    []
  );

  const logout = useCallback(() => {
    authService.clearToken();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
