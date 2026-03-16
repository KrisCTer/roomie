// web-app/src/hooks/useBillOperations.js
import { useState, useEffect, useCallback } from "react";
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

export const useBillOperations = (activeRole) => {
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

  //  Load data function (useCallback for stable reference)
  const loadData = useCallback(async () => {
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
          setStats({
            landlord: landlordStatsRes.result || stats.landlord,
            tenant: tenantStatsRes.result || stats.tenant,
          });
        }
      } catch (error) {
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - stable function

  //  Calculate stats function (useCallback)
  const calculateStats = useCallback(() => {
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
  }, [billsData]);

  //  Refetch function (public API)
  const refetch = useCallback(async () => {
    await loadData();
  }, [loadData]);

  //  Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  //  Recalculate stats when bills data changes or activeRole changes
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  //  Reset selections when activeRole changes
  useEffect(() => {
    setSelectedBills([]);
    setFilterStatus("");
    setFilterProperty("");
    setFilterContract("");
    setSearchTerm("");
  }, [activeRole]);

  const handleCreateBill = useCallback(() => {
    setSelectedBill(null);
    setShowCreateModal(true);
  }, []);

  const handleEditBill = useCallback((bill) => {
    setSelectedBill(bill);
    setShowCreateModal(true);
  }, []);

  const handleSendBill = useCallback(async (billId) => {
    if (!window.confirm("Gửi hóa đơn này cho người thuê?")) {
      return;
    }

    try {
      const res = await sendBill(billId);
      if (res?.success) {
        alert(" Đã gửi hóa đơn thành công!");
        await loadData();
      }
    } catch (error) {
      console.error("Error sending bill:", error);
      alert("❌ Không thể gửi hóa đơn! " + (error?.response?.data?.message || ""));
    }
  }, [loadData]);

  const handleDeleteBill = useCallback(async (billId) => {
    if (!window.confirm("Xóa hóa đơn này? Chỉ có thể xóa hóa đơn ở trạng thái DRAFT.")) {
      return;
    }

    try {
      await deleteBill(billId);
      alert(" Đã xóa hóa đơn!");
      await loadData();
    } catch (error) {
      console.error("Error deleting bill:", error);
      alert("❌ Không thể xóa hóa đơn! " + (error?.response?.data?.message || ""));
    }
  }, [loadData]);

  const handleDownloadBillPdf = useCallback(async (billId) => {
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
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("❌ Không thể tải xuống PDF!");
    }
  }, [billsData]);

  const handleBulkSend = useCallback(async () => {
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
        alert(` Đã gửi ${selectedBills.length} hóa đơn thành công!`);
        setSelectedBills([]);
        setShowBulkSendModal(false);
        await loadData();
      }
    } catch (error) {
      console.error("Error bulk sending bills:", error);
      alert("❌ Không thể gửi hóa đơn! " + (error?.response?.data?.message || ""));
    }
  }, [selectedBills, loadData]);

  const handleExportBills = useCallback(async (format = 'excel') => {
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
      
    } catch (error) {
      console.error("Error exporting bills:", error);
      alert("❌ Không thể xuất dữ liệu!");
    }
  }, [filterStatus, filterProperty, filterContract]);

  const handleToggleSelectBill = useCallback((billId) => {
    setSelectedBills(prev => {
      if (prev.includes(billId)) {
        return prev.filter(id => id !== billId);
      } else {
        return [...prev, billId];
      }
    });
  }, []);

  const handleSelectAllBills = useCallback((bills) => {
    const draftBills = bills.filter(b => b.status === "DRAFT");
    const draftIds = draftBills.map(b => b.id);
    
    if (selectedBills.length === draftIds.length) {
      // Deselect all
      setSelectedBills([]);
    } else {
      // Select all DRAFT bills
      setSelectedBills(draftIds);
    }
  }, [selectedBills]);

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setSelectedBill(null);
  }, []);

  const handleModalSuccess = useCallback(async () => {
    setShowCreateModal(false);
    setSelectedBill(null);
    await loadData();
  }, [loadData]);

  /**
   *  Get filtered bills based on activeRole and current filters
   */
  const getFilteredBills = useCallback(() => {
    const bills = activeRole === "landlord" 
      ? billsData.asLandlord 
      : billsData.asTenant;

    return bills.filter(bill => {
      // Status filter
      if (filterStatus && bill.status !== filterStatus) {
        return false;
      }

      // Property filter (landlord only)
      if (filterProperty && activeRole === "landlord") {
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
  }, [activeRole, billsData, filterStatus, filterProperty, filterContract, searchTerm, contracts]);

  const formatDateForFilename = (date) => {
    if (!date) return "unknown";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  return {
    // State (activeTab mapped from activeRole for backward compatibility)
    activeTab: activeRole,
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

    //  Refetch
    refetch,
  };
};