// web-app/src/contexts/RoleContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  // Load role từ localStorage hoặc default là 'landlord'
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem("activeRole") || "landlord";
  });

  // Lưu role vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("activeRole", activeRole);
  }, [activeRole]);

  const switchRole = (role) => {
    if (role === "landlord" || role === "tenant") {
      setActiveRole(role);
    }
  };

  return (
    <RoleContext.Provider value={{ activeRole, switchRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
};
