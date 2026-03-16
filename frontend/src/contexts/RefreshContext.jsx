// web-app/src/contexts/RefreshContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [refreshCallbacks, setRefreshCallbacks] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Register refresh callback cho từng page
  const registerRefreshCallback = useCallback((pageKey, callback) => {
    setRefreshCallbacks((prev) => ({
      ...prev,
      [pageKey]: callback,
    }));
  }, []);

  // Unregister khi component unmount
  const unregisterRefreshCallback = useCallback((pageKey) => {
    setRefreshCallbacks((prev) => {
      const newCallbacks = { ...prev };
      delete newCallbacks[pageKey];
      return newCallbacks;
    });
  }, []);

  // Trigger refresh cho page hiện tại
  const triggerRefresh = useCallback(
    async (pageKey) => {
      if (refreshCallbacks[pageKey]) {
        setIsRefreshing(true);
        try {
          await refreshCallbacks[pageKey]();
        } catch (error) {
          console.error("Refresh error:", error);
        } finally {
          setIsRefreshing(false);
        }
      }
    },
    [refreshCallbacks]
  );

  return (
    <RefreshContext.Provider
      value={{
        registerRefreshCallback,
        unregisterRefreshCallback,
        triggerRefresh,
        isRefreshing,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error("useRefresh must be used within RefreshProvider");
  }
  return context;
};
