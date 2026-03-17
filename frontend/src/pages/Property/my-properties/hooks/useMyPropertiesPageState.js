import { useEffect, useMemo, useState } from "react";
import { usePropertyOperations } from "../../../../hooks/usePropertyOperations";
import { useRefresh } from "../../../../contexts/RefreshContext";

const ITEMS_PER_PAGE = 10;

const useMyPropertiesPageState = () => {
  const [activeMenu, setActiveMenu] = useState("My Property");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { registerRefreshCallback, unregisterRefreshCallback } = useRefresh();

  const operations = usePropertyOperations();

  useEffect(() => {
    registerRefreshCallback("my-properties", operations.refetch);

    return () => {
      unregisterRefreshCallback("my-properties");
    };
  }, [registerRefreshCallback, unregisterRefreshCallback, operations.refetch]);

  const pagedProperties = useMemo(() => {
    const start = (operations.currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return operations.properties.slice(start, end);
  }, [operations.properties, operations.currentPage]);

  const quickStats = useMemo(() => {
    const all = operations.allProperties || [];

    return {
      totalOwned: all.length,
      available: all.filter((property) =>
        ["AVAILABLE", "APPROVED", "ACTIVE"].includes(
          (property.propertyStatus || property.status || "").toUpperCase(),
        ),
      ).length,
      rented: all.filter((property) =>
        ["RENTED", "SOLD"].includes(
          (property.propertyStatus || property.status || "").toUpperCase(),
        ),
      ).length,
      pending: all.filter((property) =>
        ["PENDING", "DRAFT"].includes(
          (property.status || "").toUpperCase(),
        ),
      ).length,
    };
  }, [operations.allProperties]);

  return {
    activeMenu,
    setActiveMenu,
    sidebarOpen,
    setSidebarOpen,
    pagedProperties,
    quickStats,
    ...operations,
  };
};

export default useMyPropertiesPageState;
