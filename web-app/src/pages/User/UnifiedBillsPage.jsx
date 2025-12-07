import React, { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Home,
  User,
  Zap,
  Droplet,
  Wifi,
  Car,
  Wrench,
  CreditCard,
} from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import { useNavigate } from "react-router-dom";

import {
  getMyLandlordBills,
  getMyTenantBills,
  getBillsByContract,
  createBill,
  updateBill,
  deleteBill,
  sendBill,
} from "../../services/billing.service";

import { getMyContracts } from "../../services/contract.service";
import { getPropertiesByOwner } from "../../services/property.service";
import { getUserProfile } from "../../services/user.service";

const UnifiedBillsPage = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Bills");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState("landlord"); // "landlord" or "tenant"

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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [billsData]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Load all bills (landlord + tenant)
      const landlordBillsRes = await getMyLandlordBills();
      const tenantBillsRes = await getMyTenantBills();
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

        // Load tenant info
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

  const currentBills =
    activeTab === "landlord" ? billsData.asLandlord : billsData.asTenant;

  const currentContracts =
    activeTab === "landlord" ? contracts.asLandlord : contracts.asTenant;

  const getPropertyForContract = (contractId) => {
    const contract = currentContracts.find((c) => c.id === contractId);
    if (!contract) return null;
    return properties.find((p) => p.propertyId === contract.propertyId);
  };

  const getTenantForContract = (contractId) => {
    const contract = contracts.asLandlord.find((c) => c.id === contractId);
    if (!contract) return null;
    return tenants[contract.tenantId];
  };

  const filteredBills = currentBills.filter((bill) => {
    const matchStatus = !filterStatus || bill.status === filterStatus;

    let matchProperty = true;
    if (filterProperty) {
      const contract = currentContracts.find((c) => c.id === bill.contractId);
      matchProperty = contract?.propertyId === filterProperty;
    }

    const matchSearch =
      !searchTerm ||
      bill.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.contractId?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchProperty && matchSearch;
  });

  const handleCreateBill = () => {
    setSelectedBill(null);
    setShowCreateModal(true);
  };

  const handleEditBill = (bill) => {
    setSelectedBill(bill);
    setShowCreateModal(true);
  };

  const handleViewBill = (bill) => {
    navigate(`/bill-detail/${bill.id}`);
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

  const handlePayBill = (bill) => {
    navigate(`/bill-detail/${bill.id}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: {
        label: "Nháp",
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: FileText,
      },
      PENDING: {
        label: "Chờ thanh toán",
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock,
      },
      PAID: {
        label: "Đã thanh toán",
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
      },
      OVERDUE: {
        label: "Quá hạn",
        bg: "bg-red-100",
        text: "text-red-800",
        icon: AlertCircle,
      },
    };
    return configs[status] || configs.DRAFT;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý hóa đơn
              </h1>
              {activeTab === "landlord" && (
                <button
                  onClick={handleCreateBill}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Tạo hóa đơn mới
                </button>
              )}
            </div>
            <p className="text-gray-600">
              Quản lý hóa đơn cho thuê và thanh toán hóa đơn thuê nhà
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("landlord")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
                  activeTab === "landlord"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Home className="w-5 h-5" />
                  <span>Vai trò Chủ nhà</span>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {stats.landlord.total}
                  </span>
                </div>
                {activeTab === "landlord" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("tenant")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
                  activeTab === "tenant"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  <span>Vai trò Người thuê</span>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {stats.tenant.total}
                  </span>
                </div>
                {activeTab === "tenant" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          {activeTab === "landlord" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <StatsCard
                  icon={FileText}
                  label="Tổng hóa đơn"
                  value={stats.landlord.total}
                  bgColor="bg-blue-100"
                  textColor="text-blue-600"
                />
                <StatsCard
                  icon={FileText}
                  label="Nháp"
                  value={stats.landlord.draft}
                  bgColor="bg-gray-100"
                  textColor="text-gray-600"
                />
                <StatsCard
                  icon={Clock}
                  label="Chờ thanh toán"
                  value={stats.landlord.pending}
                  bgColor="bg-yellow-100"
                  textColor="text-yellow-600"
                />
                <StatsCard
                  icon={CheckCircle}
                  label="Đã thanh toán"
                  value={stats.landlord.paid}
                  bgColor="bg-green-100"
                  textColor="text-green-600"
                />
                <StatsCard
                  icon={AlertCircle}
                  label="Quá hạn"
                  value={stats.landlord.overdue}
                  bgColor="bg-red-100"
                  textColor="text-red-600"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 mb-2">Tổng doanh thu</p>
                    <p className="text-4xl font-bold">
                      {formatCurrency(stats.landlord.totalAmount)}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatsCard
                  icon={FileText}
                  label="Tổng hóa đơn"
                  value={stats.tenant.total}
                  bgColor="bg-blue-100"
                  textColor="text-blue-600"
                />
                <StatsCard
                  icon={Clock}
                  label="Chờ thanh toán"
                  value={stats.tenant.pending}
                  bgColor="bg-yellow-100"
                  textColor="text-yellow-600"
                />
                <StatsCard
                  icon={CheckCircle}
                  label="Đã thanh toán"
                  value={stats.tenant.paid}
                  bgColor="bg-green-100"
                  textColor="text-green-600"
                />
                <StatsCard
                  icon={AlertCircle}
                  label="Quá hạn"
                  value={stats.tenant.overdue}
                  bgColor="bg-red-100"
                  textColor="text-red-600"
                />
              </div>

              {stats.tenant.totalPending > 0 && (
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 mb-2">
                        Tổng tiền cần thanh toán
                      </p>
                      <p className="text-4xl font-bold">
                        {formatCurrency(stats.tenant.totalPending)}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <DollarSign className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả</option>
                  {activeTab === "landlord" && (
                    <option value="DRAFT">Nháp</option>
                  )}
                  <option value="PENDING">Chờ thanh toán</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="OVERDUE">Quá hạn</option>
                </select>
              </div>

              {activeTab === "landlord" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bất động sản
                  </label>
                  <select
                    value={filterProperty}
                    onChange={(e) => setFilterProperty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả bất động sản</option>
                    {properties.map((property) => (
                      <option
                        key={property.propertyId}
                        value={property.propertyId}
                      >
                        {property.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã hóa đơn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bills List */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Danh sách hóa đơn ({filteredBills.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Đang tải...</p>
              </div>
            ) : filteredBills.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Chưa có hóa đơn nào</p>
              </div>
            ) : activeTab === "landlord" ? (
              // Landlord table view
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Bất động sản
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Người thuê
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tháng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Hạn thanh toán
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBills.map((bill) => {
                      const statusConfig = getStatusConfig(bill.status);
                      const StatusIcon = statusConfig.icon;
                      const property = getPropertyForContract(bill.contractId);
                      const tenant = getTenantForContract(bill.contractId);

                      return (
                        <tr
                          key={bill.id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {property?.title || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {property?.address?.district || ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-900">
                                  {tenant
                                    ? `${tenant.firstName} ${tenant.lastName}`
                                    : "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {tenant?.phoneNumber || ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(bill.billingMonth)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(bill.dueDate)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-blue-600">
                              {formatCurrency(bill.totalAmount)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewBill(bill)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {bill.status === "DRAFT" && (
                                <>
                                  <button
                                    onClick={() => handleEditBill(bill)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                    title="Sửa"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleSendBill(bill.id)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                    title="Gửi hóa đơn"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBill(bill.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              // Tenant card view
              <div className="divide-y">
                {filteredBills.map((bill) => {
                  const statusConfig = getStatusConfig(bill.status);
                  const StatusIcon = statusConfig.icon;
                  const isOverdue = bill.status === "OVERDUE";
                  const isPending = bill.status === "PENDING";
                  const canPay = isPending || isOverdue;
                  const property = getPropertyForContract(bill.contractId);

                  return (
                    <div
                      key={bill.id}
                      className="p-6 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => handleViewBill(bill)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>

                            {isOverdue && (
                              <span className="text-xs text-red-600 font-medium">
                                ⚠️ Vui lòng thanh toán ngay
                              </span>
                            )}
                          </div>

                          {property && (
                            <div className="flex items-center gap-2 mb-2">
                              <Home className="w-4 h-4 text-gray-400" />
                              <p className="font-semibold text-gray-900">
                                {property.title}
                              </p>
                            </div>
                          )}

                          <p className="font-mono text-sm text-gray-600 mb-2">
                            Mã HĐ: {bill.id?.substring(0, 16)}...
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Tháng: {formatDate(bill.billingMonth)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span
                                className={
                                  isOverdue ? "text-red-600 font-medium" : ""
                                }
                              >
                                Hạn: {formatDate(bill.dueDate)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Số tiền</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(bill.totalAmount)}
                          </p>

                          {canPay && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePayBill(bill);
                              }}
                              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                            >
                              <CreditCard className="w-4 h-4" />
                              Thanh toán
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Create/Edit Modal - Only for landlord */}
      {showCreateModal && activeTab === "landlord" && (
        <CreateBillModal
          bill={selectedBill}
          properties={properties}
          contracts={contracts.asLandlord}
          tenants={tenants}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedBill(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setSelectedBill(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

// ========== SUB COMPONENTS ==========

const StatsCard = ({ icon: Icon, label, value, bgColor, textColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const CreateBillModal = ({
  bill,
  properties,
  contracts,
  tenants,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(
    bill
      ? contracts.find((c) => c.id === bill.contractId)?.propertyId || ""
      : ""
  );
  const [selectedContract, setSelectedContract] = useState(
    bill?.contractId || ""
  );
  const [previousBill, setPreviousBill] = useState(null);

  const [formData, setFormData] = useState({
    billingMonth: bill?.billingMonth || "",
    rentPrice: bill?.rentPrice || "",
    electricityOld: bill?.electricityOld || "",
    electricityNew: bill?.electricityNew || "",
    electricityUnitPrice: bill?.electricityUnitPrice || "3500",
    waterOld: bill?.waterOld || "",
    waterNew: bill?.waterNew || "",
    waterUnitPrice: bill?.waterUnitPrice || "15000",
    internetPrice: bill?.internetPrice || "200000",
    parkingPrice: bill?.parkingPrice || "100000",
    cleaningPrice: bill?.cleaningPrice || "50000",
    maintenancePrice: bill?.maintenancePrice || "0",
    otherDescription: bill?.otherDescription || "",
    otherPrice: bill?.otherPrice || "0",
  });

  // ⬅️ LỌC PROPERTY CÓ CONTRACT ACTIVE
  const activeProperties = properties.filter((p) =>
    contracts.some(
      (c) =>
        c.propertyId === p.propertyId &&
        ["ACTIVE", "PENDING_PAYMENT"].includes(c.status)
    )
  );

  // Các hợp đồng ACTIVE của property đã chọn
  const availableContracts = contracts.filter(
    (c) =>
      c.propertyId === selectedProperty &&
      ["ACTIVE", "PENDING_PAYMENT"].includes(c.status)
  );

  // Get tenant for selected contract
  const selectedTenant = selectedContract
    ? tenants[contracts.find((c) => c.id === selectedContract)?.tenantId]
    : null;

  // Load previous bill when contract selected
  useEffect(() => {
    if (selectedContract && !bill) {
      loadPreviousBill();
    }
  }, [selectedContract]);

  const loadPreviousBill = async () => {
    try {
      const res = await getBillsByContract(selectedContract);
      if (res?.success && res?.result && res.result.length > 0) {
        const lastBill = res.result[0];
        setPreviousBill(lastBill);

        // Auto-fill old values from previous bill's new values
        setFormData((prev) => ({
          ...prev,
          electricityOld: lastBill.electricityNew || "",
          waterOld: lastBill.waterNew || "",
        }));
      }
    } catch (error) {
      console.error("Error loading previous bill:", error);
    }
  };

  const handlePropertyChange = (propertyId) => {
    setSelectedProperty(propertyId);
    setSelectedContract(""); // Reset contract when property changes
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    const electricityAmount =
      (parseFloat(formData.electricityNew) -
        parseFloat(formData.electricityOld || 0)) *
      parseFloat(formData.electricityUnitPrice || 0);

    const waterAmount =
      (parseFloat(formData.waterNew) - parseFloat(formData.waterOld || 0)) *
      parseFloat(formData.waterUnitPrice || 0);

    const total =
      parseFloat(formData.rentPrice || 0) +
      electricityAmount +
      waterAmount +
      parseFloat(formData.internetPrice || 0) +
      parseFloat(formData.parkingPrice || 0) +
      parseFloat(formData.cleaningPrice || 0) +
      parseFloat(formData.maintenancePrice || 0) +
      parseFloat(formData.otherPrice || 0);

    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProperty) {
      alert("Vui lòng chọn bất động sản!");
      return;
    }

    if (!selectedContract) {
      alert("Vui lòng chọn hợp đồng!");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        contractId: selectedContract,
        billingMonth: formData.billingMonth,
        rentPrice: parseFloat(formData.rentPrice),
        electricityOld: parseFloat(formData.electricityOld || 0),
        electricityNew: parseFloat(formData.electricityNew),
        electricityUnitPrice: parseFloat(formData.electricityUnitPrice),
        waterOld: parseFloat(formData.waterOld || 0),
        waterNew: parseFloat(formData.waterNew),
        waterUnitPrice: parseFloat(formData.waterUnitPrice),
        internetPrice: parseFloat(formData.internetPrice || 0),
        parkingPrice: parseFloat(formData.parkingPrice || 0),
        cleaningPrice: parseFloat(formData.cleaningPrice || 0),
        maintenancePrice: parseFloat(formData.maintenancePrice || 0),
        otherDescription: formData.otherDescription,
        otherPrice: parseFloat(formData.otherPrice || 0),
      };

      if (bill) {
        await updateBill(bill.id, payload);
        alert("✅ Cập nhật hóa đơn thành công!");
      } else {
        await createBill(payload);
        alert("✅ Tạo hóa đơn thành công!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("❌ " + (error?.response?.data?.message || "Có lỗi xảy ra!"));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount || 0);
  };

  const selectedPropertyData = properties.find(
    (p) => p.propertyId === selectedProperty
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {bill ? "Cập nhật hóa đơn" : "Tạo hóa đơn mới"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn bất động sản <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => handlePropertyChange(e.target.value)}
              disabled={!!bill}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">-- Chọn bất động sản --</option>

              {activeProperties.map((property) => (
                <option key={property.propertyId} value={property.propertyId}>
                  {property.title} - {property.address?.district}
                </option>
              ))}
            </select>

            {activeProperties.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Bạn không có bất kỳ hợp đồng ACTIVE nào để tạo hóa đơn!
              </p>
            )}
          </div>

          {/* Property Info */}
          {selectedPropertyData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">
                    {selectedPropertyData.title}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {selectedPropertyData.address?.fullAddress}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Giá thuê: {formatCurrency(selectedPropertyData.monthlyRent)}{" "}
                    đ/tháng
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contract Selection */}
          {selectedProperty && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn hợp đồng <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
                disabled={!!bill}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">-- Chọn hợp đồng --</option>
                {availableContracts.map((contract) => {
                  const tenant = tenants[contract.tenantId];
                  return (
                    <option key={contract.id} value={contract.id}>
                      Hợp đồng: {contract.id.substring(0, 8)}... - Người thuê:{" "}
                      {tenant
                        ? `${tenant.firstName} ${tenant.lastName}`
                        : "N/A"}
                    </option>
                  );
                })}
              </select>
              {availableContracts.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ Không có hợp đồng ACTIVE nào cho bất động sản này
                </p>
              )}
            </div>
          )}

          {/* Tenant Info */}
          {selectedTenant && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">
                    {selectedTenant.firstName} {selectedTenant.lastName}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    SĐT: {selectedTenant.phoneNumber}
                  </p>
                  <p className="text-sm text-green-700">
                    Email: {selectedTenant.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Billing Month & Rent */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tháng thanh toán (YYYY-MM){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="billingMonth"
                value={formData.billingMonth}
                onChange={handleChange}
                placeholder="2024-12"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiền thuê nhà <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="rentPrice"
                value={formData.rentPrice}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Electricity */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Điện</h3>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chỉ số cũ
                </label>
                <input
                  type="number"
                  name="electricityOld"
                  value={formData.electricityOld}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  readOnly={!!previousBill}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chỉ số mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="electricityNew"
                  value={formData.electricityNew}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn giá (đ/kWh)
                </label>
                <input
                  type="number"
                  name="electricityUnitPrice"
                  value={formData.electricityUnitPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thành tiền
                </label>
                <input
                  type="text"
                  value={formatCurrency(
                    (parseFloat(formData.electricityNew || 0) -
                      parseFloat(formData.electricityOld || 0)) *
                      parseFloat(formData.electricityUnitPrice || 0)
                  )}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Water */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Nước</h3>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chỉ số cũ
                </label>
                <input
                  type="number"
                  name="waterOld"
                  value={formData.waterOld}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  readOnly={!!previousBill}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chỉ số mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="waterNew"
                  value={formData.waterNew}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn giá (đ/m³)
                </label>
                <input
                  type="number"
                  name="waterUnitPrice"
                  value={formData.waterUnitPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thành tiền
                </label>
                <input
                  type="text"
                  value={formatCurrency(
                    (parseFloat(formData.waterNew || 0) -
                      parseFloat(formData.waterOld || 0)) *
                      parseFloat(formData.waterUnitPrice || 0)
                  )}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Other Services */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Internet
              </label>
              <input
                type="number"
                name="internetPrice"
                value={formData.internetPrice}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Gửi xe
              </label>
              <input
                type="number"
                name="parkingPrice"
                value={formData.parkingPrice}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vệ sinh chung
              </label>
              <input
                type="number"
                name="cleaningPrice"
                value={formData.cleaningPrice}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Bảo trì
              </label>
              <input
                type="number"
                name="maintenancePrice"
                value={formData.maintenancePrice}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Other Fees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phí khác (mô tả)
            </label>
            <input
              type="text"
              name="otherDescription"
              value={formData.otherDescription}
              onChange={handleChange}
              placeholder="VD: Sửa chữa, thay thế..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền phí khác
            </label>
            <input
              type="number"
              name="otherPrice"
              value={formData.otherPrice}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">TỔNG CỘNG</span>
              <span className="text-4xl font-bold">
                {formatCurrency(calculateTotal())} đ
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !selectedProperty || !selectedContract}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : bill ? "Cập nhật" : "Tạo hóa đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedBillsPage;
