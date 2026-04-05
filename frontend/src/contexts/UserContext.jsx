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
        // Merge: keep role from cached (JWT) if profile doesn't have it
        const merged = { ...cached, ...profile };
        if (!merged.role && cached?.role) merged.role = cached.role;
        setUser(merged);
        return merged;
      }

      // Profile API returned no data, keep cached (JWT-derived) user
      return cached ?? null;
    } catch (e) {
      if (e?.response?.status === 401) {
        removeToken();
        removeUserProfile();
        setUser(null);
      }
      // For non-401 errors (404, 500), keep cached user
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
