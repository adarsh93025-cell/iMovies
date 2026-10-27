import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await authService.getProfile();
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn("Session verification warning:", err.message);
          // If token expired, clear
          if (err.response && err.response.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, isAdminLogin = false) => {
    try {
      const res = isAdminLogin
        ? await authService.adminLogin({ email, password })
        : await authService.login({ email, password });

      const authToken = res.data.authtoken || res.data.token;
      const userData = res.data.user || res.data.admin;

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Please check your credentials.";
      return { success: false, error: msg };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await authService.register({ username, email, password });
      const authToken = res.data.authtoken || res.data.token;
      const userData = res.data.user;

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed.";
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
