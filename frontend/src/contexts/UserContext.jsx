// src/contexts/UserContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getCompleteUserInfo,
  getToken,
  removeToken,
  removeUserProfile,
} from "../services/localStorageService";
import { getMyProfile } from "../services/userService";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);

    try {
      const cached = getCompleteUserInfo();
      if (cached) setUser(cached);

      const res = await getMyProfile();
      const profile = res?.result || res?.data?.result;
      if (profile) {
        setUser(profile);
      }

      return profile ?? null;
    } catch (e) {
      if (e?.response?.status === 401) {
        removeToken();
        removeUserProfile();
        setUser(null);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
