import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyContracts } from "../services/contract.service";
import { getPropertyById } from "../services/property.service";
import { getUserProfile } from "../services/user.service";
import { getCompleteUserInfo } from "../services/localStorageService";

export const useContractOperations = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("landlord");
  const [contracts, setContracts] = useState({ asLandlord: [], asTenant: [] });
  const [propertyCache, setPropertyCache] = useState({});
  const [userCache, setUserCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const currentContracts =
    activeTab === "landlord" ? contracts.asLandlord : contracts.asTenant;
  const currentUserId = getCompleteUserInfo()?.userId;

  // Fetch contracts and related data
  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);

      // Fetch all contracts
      const res = await getMyContracts();
      console.log("📋 My Contracts Response:", res);

      // if (res?.success && res?.result) {
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

        console.log("🏠 Property IDs to fetch:", Array.from(propertyIds));
        console.log("👥 User IDs to fetch:", Array.from(userIds));

        // Fetch property data in parallel
        const propertyPromises = Array.from(propertyIds).map(async (id) => {
          try {
            const propRes = await getPropertyById(id);
            if (propRes?.success && propRes?.result) {
              console.log(`✅ Property ${id} fetched:`, propRes.result);
              return [id, propRes.result];
            }
          } catch (error) {
            console.error(`❌ Error fetching property ${id}:`, error);
          }
          return [id, null];
        });

        const propertyResults = await Promise.all(propertyPromises);
        const propertyMap = Object.fromEntries(
          propertyResults.filter(([_, data]) => data)
        );
        
        console.log("🏠 Property Cache:", propertyMap);
        setPropertyCache(propertyMap);

        // Fetch user profiles in parallel
        const userPromises = Array.from(userIds).map(async (id) => {
          try {
            const userRes = await getUserProfile(id);
            // if (userRes?.success && userRes?.result) {
            if (userRes?.result) {
              console.log(`✅ User profile ${id} fetched:`, userRes.result);
              return [id, userRes.result];
            }
          } catch (error) {
            console.error(`❌ Error fetching user profile ${id}:`, error);
          }
          return [id, null];
        });

        const userResults = await Promise.all(userPromises);
        const userMap = Object.fromEntries(
          userResults.filter(([_, data]) => data)
        );
        
        console.log("👥 User Cache:", userMap);
        setUserCache(userMap);

        setToast({
          message: "✅ Đã tải danh sách hợp đồng thành công!",
          type: "success",
        });
      }
    } catch (err) {
      console.error("❌ Failed to load contracts:", err);
      setToast({
        message: "❌ Không thể tải danh sách hợp đồng. Vui lòng thử lại!",
        type: "error",
      });
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
      terminated: contractList.filter((c) => c.status === "TERMINATED").length,
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
    currentUserId,
    toast,

    // Handlers
    handleContractClick,
    handleTabChange,
    fetchContracts,
    setToast,
  };
};