// web-app/src/hooks/useContractOperations.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyContracts } from "../services/contractService";
import { getPropertyById } from "../services/propertyService";
import { getUserProfile } from "../services/userService";
import { getCompleteUserInfo } from "../services/localStorageService";

export const useContractOperations = (activeRole) => {
  const navigate = useNavigate();
  
  // State
  const [contracts, setContracts] = useState({ asLandlord: [], asTenant: [] });
  const [propertyCache, setPropertyCache] = useState({});
  const [userCache, setUserCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Current contracts based on role
  const currentContracts =
    activeRole === "landlord" ? contracts.asLandlord : contracts.asTenant;
  const currentUserId = getCompleteUserInfo()?.userId;

  //  Fetch contracts function (useCallback for stable reference)
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all contracts
      const res = await getMyContracts();

      if (res?.result) {
        const allContracts = res.result;
        setContracts(allContracts);

        // Collect unique property and user IDs
        const propertyIds = new Set();
        const userIds = new Set();

        [...allContracts.asLandlord, ...allContracts.asTenant].forEach(
          (contract) => {
            if (contract.propertyId) {
              propertyIds.add(contract.propertyId);
            }
            if (contract.tenantId) {
              userIds.add(contract.tenantId);
            }
            if (contract.landlordId) {
              userIds.add(contract.landlordId);
            }
          }
        );


        // Fetch property data in parallel
        const propertyPromises = Array.from(propertyIds).map(async (id) => {
          try {
            const propRes = await getPropertyById(id);
            if (propRes?.success && propRes?.result) {
              return [id, propRes.result];
            } else if (propRes?.result) {
              return [id, propRes.result];
            }
          } catch (error) {
            console.error(` Error fetching property ${id}:`, error);
          }
          return [id, null];
        });

        const propertyResults = await Promise.all(propertyPromises);
        const propertyMap = Object.fromEntries(
          propertyResults.filter(([_, data]) => data)
        );
        
        setPropertyCache(propertyMap);

        // Fetch user profiles in parallel
        const userPromises = Array.from(userIds).map(async (id) => {
          try {
            const userRes = await getUserProfile(id);
            if (userRes?.result) {
              return [id, userRes.result];
            }
          } catch (error) {
            console.error(` Error fetching user profile ${id}:`, error);
          }
          return [id, null];
        });

        const userResults = await Promise.all(userPromises);
        const userMap = Object.fromEntries(
          userResults.filter(([_, data]) => data)
        );
        
        setUserCache(userMap);

        setToast({
          message: "Contracts loaded successfully!",
          type: "success",
        });
      }
    } catch (err) {
      console.error(" Failed to load contracts:", err);
      setToast({
        message: "Failed to load contracts. Please try again!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - stable function

  //  Initial fetch on mount
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  //  Clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  //  Refetch function (public API)
  const refetch = useCallback(async () => {
    await fetchContracts();
  }, [fetchContracts]);

  //  Calculate statistics based on current contracts
  const calculateStats = useCallback((contractList) => {
    return {
      total: contractList.length,
      active: contractList.filter((c) => c.status === "ACTIVE").length,
      pending: contractList.filter(
        (c) =>
          c.status === "PENDING_SIGNATURE" || c.status === "PENDING_PAYMENT"
      ).length,
      expired: contractList.filter((c) => c.status === "EXPIRED").length,
      terminated: contractList.filter((c) => c.status === "TERMINATED").length,
    };
  }, []);

  const stats = calculateStats(currentContracts);

  const handleContractClick = useCallback((contract) => {
    navigate(`/contract-signing/${contract.id}`, { state: { contract } });
  }, [navigate]);

  const handleTabChange = useCallback((tab) => {
    // This is kept for compatibility but controlled by Context
  }, []);

  return {
    // Data
    activeTab: activeRole,
    contracts,
    currentContracts,
    propertyCache,
    userCache,
    loading,
    stats,
    currentUserId,
    toast,

    // Handlers
    handleContractClick,
    handleTabChange,
    setToast,

    // Refetch
    refetch,
    fetchContracts,
  };
};