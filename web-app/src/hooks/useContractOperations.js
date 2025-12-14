import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyContracts } from "../services/contract.service";
import { getPropertyById } from "../services/property.service";
import { getUserProfile } from "../services/user.service";

export const useContractOperations = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("landlord");
  const [contracts, setContracts] = useState({ asLandlord: [], asTenant: [] });
  const [propertyCache, setPropertyCache] = useState({});
  const [userCache, setUserCache] = useState({});
  const [loading, setLoading] = useState(true);

  const currentContracts =
    activeTab === "landlord" ? contracts.asLandlord : contracts.asTenant;

  // Fetch contracts and related data
  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);

      // Fetch all contracts
      const res = await getMyContracts();
      console.log("My Contracts Response:", res);

      if (res?.success && res?.result) {
        const allContracts = res.result;
        setContracts(allContracts);

        // Collect unique property and user IDs
        const propertyIds = new Set();
        const userIds = new Set();

        [...allContracts.asLandlord, ...allContracts.asTenant].forEach(
          (contract) => {
            if (contract.propertyId) propertyIds.add(contract.propertyId);
            if (contract.tenantId) userIds.add(contract.tenantId);
            if (contract.landlordId) userIds.add(contract.landlordId);
          }
        );

        // Fetch property data
        const propertyPromises = Array.from(propertyIds).map(async (id) => {
          try {
            const propRes = await getPropertyById(id);
            if (propRes?.success && propRes?.result) {
              return [id, propRes.result];
            }
          } catch (error) {
            console.error(`Error fetching property ${id}:`, error);
          }
          return [id, null];
        });

        const propertyResults = await Promise.all(propertyPromises);
        const propertyMap = Object.fromEntries(
          propertyResults.filter(([_, data]) => data)
        );
        setPropertyCache(propertyMap);

        // Fetch user profiles
        const userPromises = Array.from(userIds).map(async (id) => {
          try {
            const userRes = await getUserProfile(id);
            if (userRes?.success && userRes?.result) {
              return [id, userRes.result];
            }
          } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
          }
          return [id, null];
        });

        const userResults = await Promise.all(userPromises);
        const userMap = Object.fromEntries(
          userResults.filter(([_, data]) => data)
        );
        setUserCache(userMap);
      }
    } catch (err) {
      console.error("Failed to load contracts:", err);
      alert("Không thể tải danh sách hợp đồng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (contractList) => {
    return {
      total: contractList.length,
      active: contractList.filter((c) => c.status === "ACTIVE").length,
      pending: contractList.filter(
        (c) =>
          c.status === "PENDING_SIGNATURE" || c.status === "PENDING_PAYMENT"
      ).length,
      expired: contractList.filter((c) => c.status === "EXPIRED").length,
    };
  };

  const stats = calculateStats(currentContracts);

  const handleContractClick = (contract) => {
    navigate(`/contract-signing/${contract.id}`, { state: { contract } });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return {
    // State
    activeTab,
    contracts,
    currentContracts,
    propertyCache,
    userCache,
    loading,
    stats,

    // Handlers
    handleContractClick,
    handleTabChange,
    fetchContracts,
  };
};