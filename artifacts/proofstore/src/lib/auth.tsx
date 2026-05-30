import { createContext, useContext, useEffect, useState } from "react";
import { useGetMe } from "@workspace/api-client-react";

interface User {
  id: string;
  email: string;
  username: string;
  wallet_address?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("proofstore_token"));
  const [user, setUser] = useState<User | null>(null);

  const { data: meData, isLoading: meLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (meData) {
      setUser(meData);
    }
    if (error) {
      logout();
    }
  }, [meData, error]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("proofstore_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("proofstore_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading: meLoading && !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
