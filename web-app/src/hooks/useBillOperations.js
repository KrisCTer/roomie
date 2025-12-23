import { useState, useEffect } from "react";
import {
  getMyLandlordBills,
  getMyTenantBills,
  deleteBill,
  sendBill,
  downloadBillPdf,
  exportBills,
  bulkSendBills,
  getLandlordStats as fetchLandlordStats,
  getTenantStats as fetchTenantStats,
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
  const [showBulkSendModal, setShowBulkSendModal] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProperty, setFilterProperty] = useState("");
  const [filterContract, setFilterContract] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Selection state for bulk operations
  const [selectedBills, setSelectedBills] = useState([]);

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

  // Reset selections when tab changes
  useEffect(() => {
    setSelectedBills([]);
    setFilterStatus("");
    setFilterProperty("");
    setFilterContract("");
    setSearchTerm("");
  }, [activeTab]);

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

        const allContracts = [
          ...(contractsRes.result.asLandlord || []),
          ...(contractsRes.result.asTenant || []),
        ];

        // Map contractId -> tenantId
        const contractTenantMap = {};
        allContracts.forEach((c) => {
          if (c.id && c.tenantId) {
            contractTenantMap[c.id] = c.tenantId;
          }
        });

        // Unique tenantIds
        const tenantIds = [...new Set(Object.values(contractTenantMap))];

        const tenantPromises = tenantIds.map(async (id) => {
          try {
            const res = await getUserProfile(id);
            if (res?.result) {
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

      // 4. Load stats from backend (if available)
      try {
        const [landlordStatsRes, tenantStatsRes] = await Promise.all([
          fetchLandlordStats(),
          fetchTenantStats(),
        ]);

        if (landlordStatsRes?.success && tenantStatsRes?.success) {
          // Backend stats available - use them
          console.log("📊 Loaded stats from backend");
        }
      } catch (error) {
        console.log("ℹ️ Backend stats not available, using client-side calculation");
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
    if (!window.confirm("Gửi hóa đơn này cho người thuê?")) {
      return;
    }

    try {
      const res = await sendBill(billId);
      if (res?.success) {
        alert("✅ Đã gửi hóa đơn thành công!");
        loadData();
      }
    } catch (error) {
      console.error("Error sending bill:", error);
      alert("❌ Không thể gửi hóa đơn! " + (error?.response?.data?.message || ""));
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm("Xóa hóa đơn này? Chỉ có thể xóa hóa đơn ở trạng thái DRAFT.")) {
      return;
    }

    try {
      await deleteBill(billId);
      alert("✅ Đã xóa hóa đơn!");
      loadData();
    } catch (error) {
      console.error("Error deleting bill:", error);
      alert("❌ Không thể xóa hóa đơn! " + (error?.response?.data?.message || ""));
    }
  };

  const handleDownloadBillPdf = async (billId) => {
    try {
      const response = await downloadBillPdf(billId);
      
      // Create blob from response
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Find bill to get billing month for filename
      const bill = [...billsData.asLandlord, ...billsData.asTenant].find(b => b.id === billId);
      const monthStr = bill ? formatDateForFilename(bill.billingMonth) : 'unknown';
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${billId.substring(0, 12)}_${monthStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("✅ PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("❌ Không thể tải xuống PDF!");
    }
  };

  const handleBulkSend = async () => {
    if (selectedBills.length === 0) {
      alert("Vui lòng chọn ít nhất 1 hóa đơn!");
      return;
    }

    if (!window.confirm(`Gửi ${selectedBills.length} hóa đơn cho người thuê?`)) {
      return;
    }

    try {
      const res = await bulkSendBills(selectedBills);
      if (res?.success) {
        alert(`✅ Đã gửi ${selectedBills.length} hóa đơn thành công!`);
        setSelectedBills([]);
        setShowBulkSendModal(false);
        loadData();
      }
    } catch (error) {
      console.error("Error bulk sending bills:", error);
      alert("❌ Không thể gửi hóa đơn! " + (error?.response?.data?.message || ""));
    }
  };

  const handleExportBills = async (format = 'excel') => {
    try {
      const filters = {
        status: filterStatus || undefined,
        propertyId: filterProperty || undefined,
        contractId: filterContract || undefined,
      };

      const response = await exportBills(format, filters);
      
      // Create blob from response
      const blob = new Blob([response], { 
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `bills_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Bills exported to ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting bills:", error);
      alert("❌ Không thể xuất dữ liệu!");
    }
  };

  const handleToggleSelectBill = (billId) => {
    setSelectedBills(prev => {
      if (prev.includes(billId)) {
        return prev.filter(id => id !== billId);
      } else {
        return [...prev, billId];
      }
    });
  };

  const handleSelectAllBills = (bills) => {
    const draftBills = bills.filter(b => b.status === "DRAFT");
    const draftIds = draftBills.map(b => b.id);
    
    if (selectedBills.length === draftIds.length) {
      // Deselect all
      setSelectedBills([]);
    } else {
      // Select all DRAFT bills
      setSelectedBills(draftIds);
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

  /**
   * Get filtered bills based on current filters
   */
  const getFilteredBills = () => {
    const bills = activeTab === "landlord" 
      ? billsData.asLandlord 
      : billsData.asTenant;

    return bills.filter(bill => {
      // Status filter
      if (filterStatus && bill.status !== filterStatus) {
        return false;
      }

      // Property filter (landlord only)
      if (filterProperty && activeTab === "landlord") {
        const contract = contracts.asLandlord.find(c => c.id === bill.contractId);
        if (!contract || contract.propertyId !== filterProperty) {
          return false;
        }
      }

      // Contract filter
      if (filterContract && bill.contractId !== filterContract) {
        return false;
      }

      // Search term (search in notes, contract ID, etc.)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesNotes = bill.notes?.toLowerCase().includes(searchLower);
        const matchesContract = bill.contractId?.toLowerCase().includes(searchLower);
        const matchesId = bill.id?.toLowerCase().includes(searchLower);
        
        if (!matchesNotes && !matchesContract && !matchesId) {
          return false;
        }
      }

      return true;
    });
  };

  const formatDateForFilename = (date) => {
    if (!date) return "unknown";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
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
    showBulkSendModal,
    filterStatus,
    filterProperty,
    filterContract,
    searchTerm,
    stats,
    selectedBills,

    // Setters
    setActiveTab,
    setFilterStatus,
    setFilterProperty,
    setFilterContract,
    setSearchTerm,
    setShowBulkSendModal,

    // Handlers
    handleCreateBill,
    handleEditBill,
    handleSendBill,
    handleDeleteBill,
    handleDownloadBillPdf,
    handleBulkSend,
    handleExportBills,
    handleToggleSelectBill,
    handleSelectAllBills,
    handleCloseModal,
    handleModalSuccess,
    loadData,

    // Helper
    getFilteredBills,
  };
};