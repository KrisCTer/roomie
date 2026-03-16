// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getToken,
  getUserInfo,
  getUserProfile,
  getCompleteUserInfo,
  setToken as saveToken,
  setUserProfile as saveUserProfile,
  removeToken,
  removeUserProfile,
} from "../services/localStorageService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = getToken();
        const completeUser = getCompleteUserInfo();

        if (storedToken && completeUser) {
          setTokenState(storedToken);
          setUser({
            id: completeUser.userId,
            userId: completeUser.userId,
            username: completeUser.username,
            firstName: completeUser.firstName,
            lastName: completeUser.lastName,
            avatar: completeUser.avatar,
            email: completeUser.email,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login
   */
  const login = (authToken, userProfile) => {
    saveToken(authToken);
    saveUserProfile(userProfile);

    const completeUser = getCompleteUserInfo();

    setTokenState(authToken);
    setUser({
      id: completeUser.userId,
      userId: completeUser.userId,
      username: completeUser.username,
      firstName: completeUser.firstName,
      lastName: completeUser.lastName,
      avatar: completeUser.avatar,
      email: completeUser.email,
    });
  };

  /**
   * Logout
   */
  const logout = () => {
    removeToken();
    removeUserProfile();
    setTokenState(null);
    setUser(null);
  };

  /**
   * Update user profile
   */
  const updateUser = (updatedProfile) => {
    saveUserProfile(updatedProfile);
    const completeUser = getCompleteUserInfo();

    setUser({
      id: completeUser.userId,
      userId: completeUser.userId,
      username: completeUser.username,
      firstName: completeUser.firstName,
      lastName: completeUser.lastName,
      avatar: completeUser.avatar,
      email: completeUser.email,
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
