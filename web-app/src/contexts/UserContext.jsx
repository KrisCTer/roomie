// src/contexts/UserContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getCompleteUserInfo } from "../services/localStorageService";
import { getMyProfile } from "../services/user.service";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const cached = getCompleteUserInfo();
        if (cached) setUser(cached);

        const res = await getMyProfile();
        const profile = res?.result || res?.data?.result;
        if (profile) setUser(profile);
      } catch (e) {
        console.log("Using cached user");
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
