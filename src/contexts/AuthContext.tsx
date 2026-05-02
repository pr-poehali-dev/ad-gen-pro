import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

const AUTH_URL = "https://functions.poehali.dev/e6567563-2137-43b9-91a0-65fc53ed8612";
const DATA_URL = "https://functions.poehali.dev/0d4a0909-4bed-4bf0-b882-e156f1635c92";
const TOKEN_KEY = "matad_auth_token";

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  company?: string;
  role?: string;
  plan?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, company?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const DATA_API_URL = DATA_URL;
export const AUTH_API_URL = AUTH_URL;

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { "X-Auth-Token": token } : {}),
    ...extra,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  const persistToken = (t: string | null) => {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {/* noop */}
    setToken(t);
  };

  const fetchMe = useCallback(async (currentToken: string) => {
    try {
      const res = await fetch(`${AUTH_URL}?action=me`, {
        method: "GET",
        headers: { "X-Auth-Token": currentToken },
      });
      if (!res.ok) {
        persistToken(null);
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const t = getStoredToken();
    if (!t) {
      setLoading(false);
      return;
    }
    fetchMe(t).finally(() => setLoading(false));
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${AUTH_URL}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Не удалось войти");
    persistToken(data.token);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name?: string, company?: string) => {
    const res = await fetch(`${AUTH_URL}?action=register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, company }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Не удалось зарегистрироваться");
    persistToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    const t = getStoredToken();
    if (t) {
      try {
        await fetch(`${AUTH_URL}?action=logout`, {
          method: "POST",
          headers: { "X-Auth-Token": t },
        });
      } catch {/* noop */}
    }
    persistToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
