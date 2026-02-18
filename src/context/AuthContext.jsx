import React, { createContext, useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  const [loading, setLoading] = useState(true);

  // Load token + user on startup (Hydration)
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          // Set axios header for all future requests
          axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          
          setAuthState({
            user: JSON.parse(user),
            token,
            isAuthenticated: true,
          });
        } catch (err) {
          console.error("Auth hydration failed:", err);
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Flexible setAuth
   * Handles setAuth({user, token}) OR setAuth(user, token)
   */
  const setAuth = useCallback((userData, userToken) => {
    // Determine if data was passed as an object or separate args
    const user = userToken ? userData : userData.user;
    const token = userToken ? userToken : userData.token;

    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setAuthState({
        user,
        token,
        isAuthenticated: true,
      });
    } else {
      console.error("setAuth called with missing data:", { user, token });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axiosClient.defaults.headers.common["Authorization"];

    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};