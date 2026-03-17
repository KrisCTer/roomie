// src/contexts/UserContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const cached = getCompleteUserInfo();
        if (cached) setUser(cached);

        const res = await getMyProfile();
        const profile = res?.result || res?.data?.result;
        if (profile) setUser(profile);
      } catch (e) {
        if (e?.response?.status === 401) {
          removeToken();
          removeUserProfile();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
