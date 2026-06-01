import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("aka_auth") === "true";
  });
  const [user, setUser] = useState<{ username: string } | null>(() => {
    if (typeof window === "undefined") return null;
    const u = localStorage.getItem("aka_user");
    return u ? { username: u } : null;
  });

  const login = useCallback((username: string, password: string) => {
    if (username === "aka" && password === "aka") {
      setIsAuthenticated(true);
      setUser({ username });
      localStorage.setItem("aka_auth", "true");
      localStorage.setItem("aka_user", username);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("aka_auth");
    localStorage.removeItem("aka_user");
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
