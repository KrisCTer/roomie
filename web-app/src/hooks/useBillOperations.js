import { useState, useEffect } from "react";
import {
  getMyLandlordBills,
  getMyTenantBills,
  deleteBill,
  sendBill,
} from "../services/billing.service";
import { getMyContracts } from "../services/contract.service";
import { getPropertiesByOwner } from "../services/property.service";
import { getUserProfile } from "../services/user.service";

export const useBillOperations = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("landlord");

  // Data states
  const [billsData, setBillsData] = useState({
    asLandlord: [],
    asTenant: [],
  });
  const [properties, setProperties] = useState([]);
  const [contracts, setContracts] = useState({
    asLandlord: [],
    asTenant: [],
  });
  const [tenants, setTenants] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProperty, setFilterProperty] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Stats
  const [stats, setStats] = useState({
    landlord: {
      total: 0,
      draft: 0,
      pending: 0,
      paid: 0,
      overdue: 0,
      totalAmount: 0,
    },
    tenant: {
      total: 0,
      pending: 0,
      paid: 0,
      overdue: 0,
      totalPending: 0,
    },
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Calculate stats when bills change
  useEffect(() => {
    calculateStats();
  }, [billsData]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Load all bills (landlord + tenant)
      const [landlordBillsRes, tenantBillsRes] = await Promise.all([
        getMyLandlordBills(),
        getMyTenantBills(),
      ]);

      if (landlordBillsRes?.success && tenantBillsRes?.success) {
        setBillsData({
          asLandlord: landlordBillsRes.result || [],
          asTenant: tenantBillsRes.result || [],
        });
      }

      // 2. Load properties (for landlord)
      const propertiesRes = await getPropertiesByOwner();
      if (propertiesRes?.success && propertiesRes?.result) {
        setProperties(propertiesRes.result);
      }

      // 3. Load contracts (both roles)
      const contractsRes = await getMyContracts();
      if (contractsRes?.success && contractsRes?.result) {
        setContracts({
          asLandlord: contractsRes.result.asLandlord || [],
          asTenant: contractsRes.result.asTenant || [],
        });

        // Load tenant info for landlord contracts
        const landlordContracts = contractsRes.result.asLandlord || [];
        const tenantIds = [
          ...new Set(landlordContracts.map((c) => c.tenantId)),
        ];

        const tenantPromises = tenantIds.map(async (id) => {
          try {
            const res = await getUserProfile(id);
            if (res?.success && res?.result) {
              return [id, res.result];
            }
          } catch (error) {
            console.error(`Error loading tenant ${id}:`, error);
          }
          return [id, null];
        });

        const tenantResults = await Promise.all(tenantPromises);
        const tenantMap = Object.fromEntries(
          tenantResults.filter(([_, data]) => data)
        );
        setTenants(tenantMap);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    // Landlord stats
    const landlordBills = billsData.asLandlord;
    const landlordStats = {
      total: landlordBills.length,
      draft: landlordBills.filter((b) => b.status === "DRAFT").length,
      pending: landlordBills.filter((b) => b.status === "PENDING").length,
      paid: landlordBills.filter((b) => b.status === "PAID").length,
      overdue: landlordBills.filter((b) => b.status === "OVERDUE").length,
      totalAmount: landlordBills.reduce(
        (sum, b) => sum + (b.totalAmount || 0),
        0
      ),
    };

    // Tenant stats
    const tenantBills = billsData.asTenant;
    const tenantStats = {
      total: tenantBills.length,
      pending: tenantBills.filter((b) => b.status === "PENDING").length,
      paid: tenantBills.filter((b) => b.status === "PAID").length,
      overdue: tenantBills.filter((b) => b.status === "OVERDUE").length,
      totalPending: tenantBills
        .filter((b) => b.status === "PENDING" || b.status === "OVERDUE")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    };

    setStats({
      landlord: landlordStats,
      tenant: tenantStats,
    });
  };

  const handleCreateBill = () => {
    setSelectedBill(null);
    setShowCreateModal(true);
  };

  const handleEditBill = (bill) => {
    setSelectedBill(bill);
    setShowCreateModal(true);
  };

  const handleSendBill = async (billId) => {
    if (window.confirm("Gửi hóa đơn này cho người thuê?")) {
      try {
        const res = await sendBill(billId);
        if (res?.success) {
          alert("✅ Đã gửi hóa đơn thành công!");
          loadData();
        }
      } catch (error) {
        console.error("Error sending bill:", error);
        alert("❌ Không thể gửi hóa đơn!");
      }
    }
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm("Xóa hóa đơn này?")) {
      try {
        await deleteBill(billId);
        alert("✅ Đã xóa hóa đơn!");
        loadData();
      } catch (error) {
        console.error("Error deleting bill:", error);
        alert("❌ Không thể xóa hóa đơn!");
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedBill(null);
  };

  const handleModalSuccess = () => {
    setShowCreateModal(false);
    setSelectedBill(null);
    loadData();
  };

  return {
    // State
    activeTab,
    billsData,
    properties,
    contracts,
    tenants,
    loading,
    showCreateModal,
    selectedBill,
    filterStatus,
    filterProperty,
    searchTerm,
    stats,

    // Setters
    setActiveTab,
    setFilterStatus,
    setFilterProperty,
    setSearchTerm,

    // Handlers
    handleCreateBill,
    handleEditBill,
    handleSendBill,
    handleDeleteBill,
    handleCloseModal,
    handleModalSuccess,
    loadData,
  };
};